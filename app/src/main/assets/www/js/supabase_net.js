// Real Supabase Realtime (Broadcast + Presence via Phoenix Channels WebSocket v2)
// + PostgREST Leaderboard sync client for Vortex Arena
window.SupabaseNet = (function () {
  function sanitizeRoom(room) {
    return (room || 'ARENA-01').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 18) || 'ARENA-01';
  }

  function createClient(config, callbacks) {
    const baseUrl = (config.supabaseUrl || '').trim().replace(/\/+$/, '');
    const anonKey = (config.supabaseAnonKey || '').trim();
    const room = sanitizeRoom(config.room);
    const topic = `realtime:vortex-arena-${room}`;

    let ws = null;
    let refCounter = 1;
    let joined = false;
    let closedByUser = false;
    let heartbeatTimer = null;
    let reconnectTimer = null;
    let lastHeartbeatSentAt = 0;
    let pingMs = 0;
    let localPresence = null;

    function nextRef() {
      refCounter += 1;
      return String(refCounter);
    }

    function sendPacket(packet) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(packet));
        return true;
      }
      return false;
    }

    function connect(initialPresence) {
      localPresence = initialPresence;
      if (!baseUrl || !anonKey || baseUrl.includes('PLACEHOLDER') || anonKey.includes('PLACEHOLDER')) {
        callbacks.onStatus && callbacks.onStatus('offline', 'Supabase не настроен');
        return false;
      }

      closedByUser = false;
      const wsBase = baseUrl.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
      const wsUrl = `${wsBase}/realtime/v1/websocket?apikey=${encodeURIComponent(anonKey)}&vsn=1.0.0`;

      callbacks.onStatus && callbacks.onStatus('connecting', 'Подключение к Supabase...');

      try {
        ws = new WebSocket(wsUrl);
      } catch (err) {
        callbacks.onStatus && callbacks.onStatus('offline', 'Ошибка WebSocket');
        return false;
      }

      ws.onopen = () => {
        // Join Realtime Broadcast + Presence channel
        sendPacket({
          topic,
          event: 'phx_join',
          payload: {
            config: {
              broadcast: { ack: false, self: false },
              presence: { key: initialPresence.id }
            },
            access_token: anonKey
          },
          ref: nextRef()
        });

        clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          lastHeartbeatSentAt = performance.now();
          sendPacket({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: nextRef()
          });
        }, 20000);
      };

      ws.onmessage = (evt) => {
        let msg;
        try {
          msg = JSON.parse(evt.data);
        } catch (_) {
          return;
        }

        if (msg.topic === 'phoenix' && msg.event === 'phx_reply') {
          if (lastHeartbeatSentAt > 0) {
            pingMs = Math.max(1, Math.round(performance.now() - lastHeartbeatSentAt));
            callbacks.onPing && callbacks.onPing(pingMs);
          }
          return;
        }

        if (msg.topic === topic && msg.event === 'phx_reply') {
          if (msg.payload && msg.payload.status === 'ok' && !joined) {
            joined = true;
            callbacks.onStatus && callbacks.onStatus('online', 'SUPABASE LIVE');
            trackPresence(localPresence);
            // Request ping immediately
            lastHeartbeatSentAt = performance.now();
            sendPacket({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: nextRef() });
          }
          return;
        }

        if (msg.event === 'presence_state') {
          callbacks.onPresenceState && callbacks.onPresenceState(msg.payload || {});
          return;
        }

        if (msg.event === 'presence_diff') {
          callbacks.onPresenceDiff && callbacks.onPresenceDiff(msg.payload || {});
          return;
        }

        if (msg.event === 'broadcast' && msg.payload) {
          callbacks.onBroadcast && callbacks.onBroadcast(msg.payload.event, msg.payload.payload);
        }
      };

      ws.onerror = () => {
        callbacks.onStatus && callbacks.onStatus('connecting', 'Переподключение...');
      };

      ws.onclose = () => {
        joined = false;
        clearInterval(heartbeatTimer);
        if (!closedByUser) {
          callbacks.onStatus && callbacks.onStatus('connecting', 'Переподключение...');
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            if (!closedByUser && localPresence) connect(localPresence);
          }, 2500);
        }
      };

      return true;
    }

    function trackPresence(payload) {
      localPresence = payload;
      if (!joined) return;
      sendPacket({
        topic,
        event: 'presence',
        payload: {
          type: 'presence',
          event: 'track',
          payload
        },
        ref: nextRef()
      });
    }

    function broadcast(eventName, payload) {
      if (!joined) return;
      sendPacket({
        topic,
        event: 'broadcast',
        payload: {
          type: 'broadcast',
          event: eventName,
          payload
        },
        ref: nextRef()
      });
    }

    // Optional Supabase PostgREST leaderboard persistence
    async function syncLeaderboardStats(playerName, kills, deaths) {
      if (!baseUrl || !anonKey || baseUrl.includes('PLACEHOLDER')) return;
      try {
        await fetch(`${baseUrl}/rest/v1/arena_leaderboard?on_conflict=player_name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            Prefer: 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify({
            player_name: playerName,
            kills,
            deaths,
            last_room: room,
            updated_at: new Date().toISOString()
          })
        });
      } catch (_) {
        // Silently ignore if optional arena_leaderboard table has not been created yet
      }
    }

    function disconnect() {
      closedByUser = true;
      joined = false;
      clearInterval(heartbeatTimer);
      clearTimeout(reconnectTimer);
      if (ws) {
        try { ws.close(); } catch (_) {}
        ws = null;
      }
    }

    return {
      connect,
      trackPresence,
      broadcast,
      syncLeaderboardStats,
      disconnect,
      isJoined: () => joined
    };
  }

  return { createClient };
})();
