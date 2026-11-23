/* ==========================================================================
   BladeRealm — Unified Cloudflare Worker
   - Serves static game files via env.ASSETS
   - Telegram Stars (XTR) Donate API: POST /api/create-invoice & POST /tg-webhook
   - Server Promo Code API: POST /api/redeem-promo
   - Real-Time WebSocket Multiplayer via Durable Object: wss://<host>/ws
   ========================================================================== */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

// Durable Object holding all live WebSocket players in one world room
export class WorldRoom {
  constructor(state) {
    this.state = state;
    this.sessions = new Map(); // ws -> { id, player }
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    const session = { id: null, player: null };
    this.sessions.set(server, session);

    server.addEventListener('message', event => {
      let msg;
      try { msg = JSON.parse(typeof event.data === 'string' ? event.data : ''); } catch { return; }
      if (!msg || !msg.type) return;

      if (msg.type === 'join') {
        session.id = msg.userId || (msg.player && msg.player.id) || ('p_' + Date.now());
        if (msg.player) session.player = msg.player;
        const allPlayers = [];
        for (const s of this.sessions.values()) {
          if (s.player) allPlayers.push(s.player);
        }
        try { server.send(JSON.stringify({ type: 'snapshot', players: allPlayers })); } catch {}
        if (session.player) this.broadcast({ type: 'player_update', player: session.player }, server);
      } else if (msg.type === 'move' && msg.data) {
        session.id = msg.data.id || session.id;
        session.player = msg.data;
        this.broadcast({ type: 'player_update', player: msg.data }, server);
      } else if (msg.type === 'chat' || msg.type === 'pvp_hit') {
        this.broadcast(msg, server);
      }
    });

    const cleanup = () => {
      this.sessions.delete(server);
      if (session.id) {
        this.broadcast({ type: 'leave', id: session.id }, server);
      }
    };
    server.addEventListener('close', cleanup);
    server.addEventListener('error', cleanup);

    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(obj, skipWs) {
    const raw = JSON.stringify(obj);
    for (const ws of this.sessions.keys()) {
      if (ws === skipWs) continue;
      try { ws.send(raw); } catch { this.sessions.delete(ws); }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 1) WebSocket Multiplayer endpoint (/ws or root Upgrade)
    if (url.pathname === '/ws' || request.headers.get('Upgrade') === 'websocket') {
      if (!env.WORLD_ROOM) {
        return jsonResponse({ error: 'WORLD_ROOM Durable Object not bound' }, 500);
      }
      const roomId = env.WORLD_ROOM.idFromName('global-world');
      const room = env.WORLD_ROOM.get(roomId);
      return room.fetch(request);
    }

    // 2) Telegram Stars Invoice Creation (Exclusive: Admin Bot = 250 XTR)
    if (url.pathname === '/api/create-invoice' && request.method === 'POST') {
      try {
        const body = await request.json();
        const itemId = body && body.itemId;
        const userId = (body && body.userId) || 0;
        if (itemId !== 'admin_bot') {
          return jsonResponse({ error: 'Товар недоступен' }, 400);
        }
        const botToken = String(env.BOT_TOKEN || '').trim();
        if (!botToken) {
          return jsonResponse({ error: 'Не задан секрет BOT_TOKEN в Cloudflare Worker' }, 500);
        }
        const orderId = `admin_bot_${userId}_${Date.now()}`;
        const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Админ Бот (BladeRealm)',
            description: 'Полная Админ-Панель + элитный Спутник T8.4',
            payload: orderId,
            provider_token: '',
            currency: 'XTR',
            prices: [{ label: 'Админ Бот', amount: 250 }]
          })
        });
        const data = await tgResp.json();
        if (!data || !data.ok) {
          return jsonResponse({ error: (data && data.description) || 'Ошибка Telegram API' }, 400);
        }
        return jsonResponse({ invoiceLink: data.result, orderId });
      } catch (err) {
        return jsonResponse({ error: err && err.message ? err.message : 'Ошибка сервера' }, 500);
      }
    }

    // 3) Telegram Webhook (auto-confirms pre_checkout_query for Stars)
    if (url.pathname === '/tg-webhook' && request.method === 'POST') {
      try {
        const upd = await request.json();
        const botToken = String(env.BOT_TOKEN || '').trim();
        if (upd && upd.pre_checkout_query && botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pre_checkout_query_id: upd.pre_checkout_query.id,
              ok: true
            })
          });
        }
      } catch {}
      return new Response('OK', { status: 200 });
    }

    // 4) Server Promo Code Endpoint (includes owner secret code for Admin Bot)
    if (url.pathname === '/api/redeem-promo' && request.method === 'POST') {
      try {
        const body = await request.json();
        const code = String((body && body.code) || '').trim().toUpperCase();
        const adminPromo = String(env.ADMIN_PROMO || 'OWNER2026').trim().toUpperCase();
        if (code && code === adminPromo) {
          return jsonResponse({
            ok: true,
            adminBot: true,
            gold: 10000,
            desc: 'Админ Бот + 10 000 золота разблокированы!'
          });
        }
        return jsonResponse({ ok: false, error: 'Промокод не найден' }, 404);
      } catch {
        return jsonResponse({ ok: false, error: 'Неверный запрос' }, 400);
      }
    }

    // 5) Serve Static Game Files
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('BladeRealm Worker Online', { status: 200 });
  }
};
