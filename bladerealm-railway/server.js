/* ==========================================================================
   BladeRealm — Unified Railway Server
   1) Serves BladeRealm HTML5 Game (HTTPS for Telegram Mini App)
   2) Telegram Stars (XTR) Payment API (POST /api/create-invoice) & Webhook
   3) Server Promo Code API (POST /api/redeem-promo)
   4) Real-Time WebSocket Multiplayer (wss://)
   ========================================================================== */

const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const { WebSocketServer } = require('ws');

const BOT_TOKEN = String(process.env.BOT_TOKEN || '').trim();
const ADMIN_PROMO = String(process.env.ADMIN_PROMO || 'OWNER2026').trim().toUpperCase();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DOMAIN = String(process.env.RAILWAY_PUBLIC_DOMAIN || process.env.PUBLIC_DOMAIN || '').trim();

const app = express();
app.use(express.json());

// CORS headers (allows calling this API even if frontend is hosted separately)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Locate game static files: prefer ./public, fallback to ../app/src/main/assets/www
const localPublicDir = path.join(__dirname, 'public');
const androidWwwDir = path.join(__dirname, '..', 'app', 'src', 'main', 'assets', 'www');
const staticDir = fs.existsSync(path.join(localPublicDir, 'index.html'))
  ? localPublicDir
  : androidWwwDir;

if (fs.existsSync(path.join(staticDir, 'index.html'))) {
  console.log('[BladeRealm] Serving game files from:', staticDir);
  app.use(express.static(staticDir));
} else {
  console.warn('[BladeRealm] index.html not found in ./public or ../app/src/main/assets/www');
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    onlinePlayers: players.size,
    hasBotToken: Boolean(BOT_TOKEN),
    staticDirFound: fs.existsSync(path.join(staticDir, 'index.html'))
  });
});

// 1) Telegram Stars Invoice Creation (Exclusive: Admin Bot = 250 XTR)
const STARS_CATALOG = {
  admin_bot: {
    title: 'Админ Бот (BladeRealm)',
    description: 'Полная Админ-Панель + элитный Спутник T8.4',
    stars: 250
  }
};

app.post('/api/create-invoice', async (req, res) => {
  try {
    const { itemId, userId } = req.body || {};
    const item = STARS_CATALOG[itemId];
    if (!item) {
      return res.status(400).json({ error: 'Товар не найден в каталоге' });
    }
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'Добавьте BOT_TOKEN в Variables на Railway' });
    }

    const orderId = `${itemId}_${userId || 0}_${Date.now()}`;
    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title,
        description: item.description,
        payload: orderId,
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: item.title, amount: item.stars }]
      })
    });
    const data = await tgResp.json();
    if (!data || !data.ok) {
      return res.status(400).json({ error: (data && data.description) || 'Ошибка Telegram API' });
    }
    res.json({ invoiceLink: data.result, orderId });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : 'Ошибка сервера' });
  }
});

// 2) Telegram Webhook (auto-confirms pre_checkout_query for Stars payments)
app.post('/tg-webhook', async (req, res) => {
  try {
    const upd = req.body;
    if (upd && upd.pre_checkout_query && BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: upd.pre_checkout_query.id,
          ok: true
        })
      });
    }
  } catch (err) {
    console.error('[Webhook error]', err.message);
  }
  res.sendStatus(200);
});

// 3) Server Promo Code Endpoint (includes owner secret code for Admin Bot)
app.post('/api/redeem-promo', (req, res) => {
  const code = String((req.body && req.body.code) || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ ok: false, error: 'Введите промокод' });

  if (ADMIN_PROMO && code === ADMIN_PROMO) {
    return res.json({
      ok: true,
      adminBot: true,
      gold: 10000,
      desc: 'Админ Бот + 10 000 золота разблокированы!'
    });
  }

  // Optional custom promo codes via EXTRA_PROMOS env var JSON
  // Example: {"BONUS500":{"gold":500,"xp":300,"desc":"500 золота и 300 XP"}}
  if (process.env.EXTRA_PROMOS) {
    try {
      const extra = JSON.parse(process.env.EXTRA_PROMOS);
      if (extra && extra[code]) {
        return res.json(Object.assign({ ok: true }, extra[code]));
      }
    } catch (_e) {}
  }

  return res.status(404).json({ ok: false, error: 'Промокод не найден' });
});

// 4) Real-Time WebSocket Multiplayer Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const players = new Map();

function broadcast(obj, skipWs) {
  const raw = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === 1 && client !== skipWs) {
      client.send(raw);
    }
  });
}

wss.on('connection', ws => {
  let myId = null;

  ws.on('message', buf => {
    let msg;
    try { msg = JSON.parse(buf.toString()); } catch (_e) { return; }
    if (!msg || !msg.type) return;

    if (msg.type === 'join') {
      myId = msg.userId || (msg.player && msg.player.id) || ('p_' + Date.now());
      if (msg.player) players.set(myId, msg.player);
      ws.send(JSON.stringify({ type: 'snapshot', players: Array.from(players.values()) }));
      if (msg.player) broadcast({ type: 'player_update', player: msg.player }, ws);
    } else if (msg.type === 'move' && msg.data) {
      myId = msg.data.id || myId;
      players.set(myId, msg.data);
      broadcast({ type: 'player_update', player: msg.data }, ws);
    } else if (msg.type === 'chat' || msg.type === 'pvp_hit') {
      broadcast(msg, ws);
    }
  });

  ws.on('close', () => {
    if (myId) {
      players.delete(myId);
      broadcast({ type: 'leave', id: myId });
    }
  });
});

server.listen(PORT, async () => {
  console.log(`[BladeRealm] Server listening on port ${PORT}`);
  // Auto-configure Telegram webhook on Railway when BOT_TOKEN and domain are available
  if (BOT_TOKEN && PUBLIC_DOMAIN) {
    const cleanDomain = PUBLIC_DOMAIN.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    const webhookUrl = `https://${cleanDomain}/tg-webhook`;
    try {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const d = await r.json();
      console.log('[BladeRealm] Telegram setWebhook:', d && d.ok ? webhookUrl : d);
    } catch (err) {
      console.error('[BladeRealm] Failed to setWebhook:', err.message);
    }
  }
});
