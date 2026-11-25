/* ==========================================================================
   BladeRealm — Real-Time Multiplayer Client (Supabase Realtime + Custom WS)
   Features:
   - Real-time player sync (60 FPS interpolation)
   - Real-player Party (invites, shared XP/gold, party chat, friendly-fire OFF)
   - Real-player 2-sided Trade (live offers, anti-scam confirm, atomic swap)
   - Real-player Live Auction House (list, buy, cancel, instant gold payout)
   - Real-player PvP + Hardcore Death Loot Transfer (20% gold + dropped gear)
   ========================================================================== */

window.Multiplayer = (function () {
  const LS_WS_KEY = 'bladerealm_ws_url';
  const LS_SB_URL_KEY = 'bladerealm_sb_url';
  const LS_SB_KEY_KEY = 'bladerealm_sb_key';
  const DEFAULT_ROOM = 'bladerealm-world';
  const DEFAULT_SB_URL = 'https://khhnjppmwrughklyqcym.supabase.co';
  const DEFAULT_SB_KEY = 'sb_publishable_m4fv3rOSTuUGtjj-l8J1tA_trjQdcyE';

  const remoteMap = new Map();
  let ws = null;
  let status = 'offline'; // 'offline' | 'connecting' | 'connected'
  let activeMode = 'none'; // 'none' | 'supabase' | 'ws'
  let queryWsUrl = '';
  let querySbUrl = '';
  let querySbKey = '';
  let manualDisconnect = false;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  let reconnectDelay = 2000;
  let syncAccum = 0;
  let idleSyncAccum = 0;
  let lastSentSig = '';
  let lastError = '';
  let myNetId = '';

  // Phoenix / Supabase channel state
  let phxRefCounter = 1;
  let phxJoinRef = '1';
  let phxTopic = 'realtime:' + DEFAULT_ROOM;
  let supabaseJoined = false;
  let sentWorldHello = false;

  // Real-Player Party State
  const realParty = {
    id: null,
    leaderId: null,
    members: [] // [{ id, name, level }]
  };
  let pendingPartyInvite = null; // { fromId, fromName, partyId, members }
  let partyTpCooldown = 0;

  // Real-Player Direct Trade State
  let pendingTradeInvite = null; // { fromId, fromName, tradeId }
  const realTrade = {
    active: false,
    tradeId: null,
    partnerId: null,
    partnerName: '',
    myGold: 0,
    myItemUids: [],
    myReady: false,
    partnerGold: 0,
    partnerItems: [],
    partnerReady: false,
    completedIds: new Set()
  };

  // Real-Player Live Auction Lots
  const onlineAuctionLots = []; // [{ id, sellerId, sellerName, item, buyout, createdAt, expiresAt }]
  const soldLotIds = new Set();

  function nextRef() {
    phxRefCounter += 1;
    return String(phxRefCounter);
  }

  function cleanUrl(raw) {
    return String(raw || '').trim().replace(/\/+$/, '');
  }

  function normalizeSupabaseUrl(raw) {
    let u = cleanUrl(raw);
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  function cloneItemSafe(it) {
    if (!it) return null;
    try { return JSON.parse(JSON.stringify(it)); } catch (_e) { return null; }
  }

  function freshUid() {
    return 'it_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function getSupabaseConfig() {
    let url = querySbUrl;
    let key = querySbKey;

    if (!url && typeof window.BLADEREALM_SUPABASE_URL === 'string' && window.BLADEREALM_SUPABASE_URL.trim()) {
      url = normalizeSupabaseUrl(window.BLADEREALM_SUPABASE_URL);
    }
    if (!key && typeof window.BLADEREALM_SUPABASE_KEY === 'string' && window.BLADEREALM_SUPABASE_KEY.trim()) {
      key = window.BLADEREALM_SUPABASE_KEY.trim();
    }

    const set = window.GameState && window.GameState.settings;
    if (!url && set && set.sbUrl && set.sbUrl.trim()) url = normalizeSupabaseUrl(set.sbUrl);
    if (!key && set && set.sbKey && set.sbKey.trim()) key = set.sbKey.trim();

    try {
      if (!url) {
        const sUrl = localStorage.getItem(LS_SB_URL_KEY);
        if (sUrl && sUrl.trim()) url = normalizeSupabaseUrl(sUrl);
      }
      if (!key) {
        const sKey = localStorage.getItem(LS_SB_KEY_KEY);
        if (sKey && sKey.trim()) key = sKey.trim();
      }
    } catch (_e) {}

    if (!url) url = DEFAULT_SB_URL;
    if (!key) key = DEFAULT_SB_KEY;

    return { url, key };
  }

  function setSupabaseConfig(rawUrl, rawKey) {
    const url = normalizeSupabaseUrl(rawUrl);
    const key = String(rawKey || '').trim();
    if (url && !/^https?:\/\/[a-z0-9.-]+/i.test(url)) {
      if (window.UI) window.UI.toast('Неверный Supabase Project URL (пример: https://xxx.supabase.co)');
      return false;
    }
    querySbUrl = '';
    querySbKey = '';
    if (window.GameState && window.GameState.settings) {
      window.GameState.settings.sbUrl = url;
      window.GameState.settings.sbKey = key;
    }
    try {
      if (url) localStorage.setItem(LS_SB_URL_KEY, url);
      else localStorage.removeItem(LS_SB_URL_KEY);
      if (key) localStorage.setItem(LS_SB_KEY_KEY, key);
      else localStorage.removeItem(LS_SB_KEY_KEY);
    } catch (_e) {}
    if (window.MMO && window.GameState && window.GameState.started) {
      window.MMO.saveProgress();
    }
    return true;
  }

  function getWsUrl() {
    if (queryWsUrl) return queryWsUrl;
    if (typeof window.BLADEREALM_WS_URL === 'string' && window.BLADEREALM_WS_URL.trim()) {
      return cleanUrl(window.BLADEREALM_WS_URL);
    }
    const setUrl = window.GameState && window.GameState.settings && window.GameState.settings.wsUrl;
    if (setUrl && setUrl.trim()) return cleanUrl(setUrl);
    try {
      const saved = localStorage.getItem(LS_WS_KEY);
      if (saved && saved.trim()) return cleanUrl(saved);
    } catch (_e) {}
    return '';
  }

  function setWsUrl(raw) {
    const cleaned = cleanUrl(raw);
    if (cleaned && !/^wss?:\/\//i.test(cleaned)) {
      if (window.UI) window.UI.toast('Адрес сервера должен начинаться с wss:// или ws://');
      return false;
    }
    queryWsUrl = '';
    if (window.GameState && window.GameState.settings) {
      window.GameState.settings.wsUrl = cleaned;
    }
    try {
      if (cleaned) localStorage.setItem(LS_WS_KEY, cleaned);
      else localStorage.removeItem(LS_WS_KEY);
    } catch (_e) {}
    if (window.MMO && window.GameState && window.GameState.started) {
      window.MMO.saveProgress();
    }
    return true;
  }

  function resolveMyNetId() {
    if (myNetId) return myNetId;
    const tgUser = window.TelegramStars && window.TelegramStars.getEnvStatus().user;
    if (tgUser && tgUser.id) {
      myNetId = 'tg_' + tgUser.id;
    } else {
      try {
        let cid = localStorage.getItem('bladerealm_client_id');
        if (!cid) {
          cid = 'p_' + Math.random().toString(36).slice(2, 10);
          localStorage.setItem('bladerealm_client_id', cid);
        }
        myNetId = cid;
      } catch (_e) {
        myNetId = 'p_' + Math.random().toString(36).slice(2, 10);
      }
    }
    return myNetId;
  }

  function serializeSelf() {
    const p = window.GameState && window.GameState.player;
    if (!p) return null;
    const w = p.equipment && p.equipment.weapon;
    const arm = p.equipment && p.equipment.armor;
    const cl = p.equipment && p.equipment.cloak;
    return {
      id: resolveMyNetId(),
      name: p.name,
      level: p.level,
      cls: p.cls,
      clanTag: p.clanTag || '',
      x: Math.round(p.x),
      y: Math.round(p.y),
      facingX: p.facingX || 1,
      state: p.state || 'idle',
      hp: Math.round(p.hp),
      maxHp: Math.round(p.maxHp),
      def: p.def || 10,
      pvp: Boolean(window.GameState.pvpEnabled),
      partyId: realParty.id || null,
      mountedId: p.mountedId || null,
      appearance: p.appearance || {},
      cosmetics: (window.GameState.cosmetics && window.GameState.cosmetics.equipped) || {},
      hideHelmet: Boolean(window.GameState.cosmetics && window.GameState.cosmetics.hideHelmet),
      karma: p.karma || 0,
      weaponType: w ? w.weaponType : 'sword',
      weaponName: w ? w.name : 'Без оружия',
      weaponColor: w ? w.color : '#e53935',
      weaponAccent: w ? w.accent : '#ff8a80',
      weaponRarity: w ? w.rarity : 'common',
      armorColor: arm ? arm.color : '#24293d',
      cloakColor: cl ? cl.color : (p.appearance && p.appearance.cloak) || '#b91c1c'
    };
  }

  function upsertRemotePlayer(data) {
    if (!data || !data.id || data.id === resolveMyNetId()) return;
    let rp = remoteMap.get(data.id);
    if (!rp) {
      rp = {
        id: data.id,
        isRemotePlayer: true,
        name: data.name || 'Игрок',
        level: data.level || 1,
        cls: data.cls || 'warrior',
        clanTag: data.clanTag || '',
        x: Number(data.x) || 3950,
        y: Number(data.y) || 3040,
        tx: Number(data.x) || 3950,
        ty: Number(data.y) || 3040,
        facingX: data.facingX || 1,
        state: data.state || 'idle',
        hp: data.hp || 300,
        maxHp: data.maxHp || 300,
        def: data.def || 12,
        pvp: Boolean(data.pvp),
        partyId: data.partyId || null,
        mountedId: data.mountedId || null,
        appearance: data.appearance || { hair: '#1a1b2e', cloak: '#1d4ed8', armor: '#24293d', skin: '#f5cfa0', eye: '#38bdf8' },
        equipment: {},
        hurtTimer: 0,
        attackTimer: 0,
        attackDuration: 0.3,
        skillTimer: 0,
        radius: 18,
        lastSeen: performance.now()
      };
      remoteMap.set(data.id, rp);
    }

    rp.name = data.name || rp.name;
    rp.level = data.level || rp.level;
    rp.clanTag = data.clanTag || '';
    rp.tx = Number(data.x) || rp.tx;
    rp.ty = Number(data.y) || rp.ty;
    rp.facingX = data.facingX || rp.facingX;
    rp.state = data.state || 'idle';
    if (typeof data.hp === 'number') rp.hp = data.hp;
    if (typeof data.maxHp === 'number') rp.maxHp = Math.max(1, data.maxHp);
    if (typeof data.def === 'number') rp.def = data.def;
    rp.pvp = Boolean(data.pvp);
    rp.partyId = data.partyId || null;
    rp.mountedId = data.mountedId || null;
    if (data.appearance) rp.appearance = data.appearance;
    if (data.cosmetics) rp.cosmetics = data.cosmetics;
    rp.hideHelmet = Boolean(data.hideHelmet);
    if (typeof data.karma === 'number') rp.karma = data.karma;
    rp.equipment.weapon = {
      category: 'weapon',
      name: data.weaponName || 'Оружие',
      weaponType: data.weaponType || 'sword',
      color: data.weaponColor || '#e53935',
      accent: data.weaponAccent || '#ff8a80',
      rarity: data.weaponRarity || 'common'
    };
    rp.equipment.armor = { color: data.armorColor || '#24293d' };
    rp.equipment.cloak = { color: data.cloakColor || '#1d4ed8' };
    rp.lastSeen = performance.now();

    // Sync member level/name if in party
    if (realParty.id) {
      const m = realParty.members.find(x => x.id === rp.id);
      if (m) { m.name = rp.name; m.level = rp.level; }
    }
  }

  function sendRaw(obj) {
    if (ws && ws.readyState === 1) {
      try { ws.send(JSON.stringify(obj)); return true; } catch (_e) {}
    }
    return false;
  }

  function sendNetEvent(eventName, payloadObj) {
    if (status !== 'connected') return false;
    if (activeMode === 'supabase') {
      if (!ws || ws.readyState !== 1 || !supabaseJoined) return false;
      return sendRaw({
        topic: phxTopic,
        event: 'broadcast',
        payload: {
          type: 'broadcast',
          event: eventName,
          payload: payloadObj
        },
        ref: nextRef()
      });
    }
    return sendRaw(Object.assign({ type: eventName }, payloadObj));
  }

  // =========================================================================
  // REAL-PLAYER PARTY LOGIC
  // =========================================================================
  function isInMyParty(playerId) {
    if (!realParty.id || !playerId) return false;
    return realParty.members.some(m => m.id === playerId);
  }

  function ensureLocalPartyExists() {
    const p = window.GameState && window.GameState.player;
    const myId = resolveMyNetId();
    if (!realParty.id) {
      realParty.id = 'pty_' + myId + '_' + Date.now();
      realParty.leaderId = myId;
      realParty.members = [{ id: myId, name: p ? p.name : 'Игрок', level: p ? p.level : 1 }];
    }
  }

  function invitePlayerToParty(targetId) {
    if (status !== 'connected') {
      if (window.UI) window.UI.toast('Сначала подключитесь к онлайну!');
      return false;
    }
    const rp = remoteMap.get(targetId);
    if (!rp) {
      if (window.UI) window.UI.toast('Игрок не в сети.');
      return false;
    }
    if (isInMyParty(targetId)) {
      if (window.UI) window.UI.toast(rp.name + ' уже в вашей пати!');
      return false;
    }
    ensureLocalPartyExists();
    if (realParty.members.length >= 4) {
      if (window.UI) window.UI.toast('В пати максимум 4 игрока!');
      return false;
    }
    const p = window.GameState.player;
    sendNetEvent('party_invite', {
      targetId,
      fromId: resolveMyNetId(),
      fromName: p.name,
      fromLevel: p.level,
      partyId: realParty.id,
      leaderId: realParty.leaderId,
      members: realParty.members
    });
    if (window.UI) window.UI.toast('Приглашение в пати отправлено: ' + rp.name);
    return true;
  }

  function acceptPartyInvite() {
    if (!pendingPartyInvite) return false;
    const inv = pendingPartyInvite;
    pendingPartyInvite = null;
    if (realParty.id && realParty.id !== inv.partyId) {
      leaveRealParty(true);
    }
    const p = window.GameState.player;
    const myId = resolveMyNetId();
    realParty.id = inv.partyId;
    realParty.leaderId = inv.leaderId || inv.fromId;
    const list = Array.isArray(inv.members) ? inv.members.slice() : [{ id: inv.fromId, name: inv.fromName, level: inv.fromLevel || 1 }];
    if (!list.some(m => m.id === myId)) {
      list.push({ id: myId, name: p.name, level: p.level });
    }
    realParty.members = list;

    sendNetEvent('party_sync', {
      partyId: realParty.id,
      leaderId: realParty.leaderId,
      members: realParty.members,
      joinedName: p.name
    });
    if (window.MMO) window.MMO.addChat('party', 'Пати', 'Вы вступили в пати игрока ' + inv.fromName + '!');
    if (window.UI) {
      window.UI.toast('Вы вступили в пати!');
      window.UI.renderCurrentModal();
    }
    return true;
  }

  function declinePartyInvite() {
    if (!pendingPartyInvite) return;
    const inv = pendingPartyInvite;
    pendingPartyInvite = null;
    sendNetEvent('party_decline', {
      targetId: inv.fromId,
      fromName: window.GameState.player ? window.GameState.player.name : 'Игрок'
    });
    if (window.UI) window.UI.toast('Приглашение в пати отклонено.');
  }

  function leaveRealParty(silent) {
    if (!realParty.id) return;
    const pid = realParty.id;
    const myId = resolveMyNetId();
    const myName = window.GameState.player ? window.GameState.player.name : 'Игрок';
    realParty.id = null;
    realParty.leaderId = null;
    realParty.members = [];
    sendNetEvent('party_leave', { partyId: pid, id: myId, name: myName });
    if (!silent) {
      if (window.MMO) window.MMO.addChat('party', 'Пати', 'Вы покинули онлайн-пати.');
      if (window.UI) {
        window.UI.toast('Вы вышли из онлайн-пати.');
        window.UI.renderCurrentModal();
      }
    }
  }

  function teleportToPartyMate(targetId) {
    if (partyTpCooldown > 0) {
      if (window.UI) window.UI.toast('Телепорт к союзнику будет готов через ' + Math.ceil(partyTpCooldown) + 'с');
      return false;
    }
    const id = targetId || (realParty.leaderId !== resolveMyNetId() ? realParty.leaderId : (realParty.members.find(m => m.id !== resolveMyNetId())?.id));
    const rp = id ? remoteMap.get(id) : null;
    if (!rp) {
      if (window.UI) window.UI.toast('Союзник не найден рядом на сервере.');
      return false;
    }
    const p = window.GameState.player;
    p.x = Math.max(80, Math.min(window.World.WIDTH - 80, rp.x + 36));
    p.y = Math.max(80, Math.min(window.World.HEIGHT - 80, rp.y + 18));
    partyTpCooldown = 15;
    if (window.Combat) window.Combat.addParticles(p.x, p.y, '#4ade80', 20, 120);
    if (window.UI) window.UI.toast('Телепорт к союзнику ' + rp.name + '!');
    return true;
  }

  function sharePartyKill(xpAmt, goldAmt, mobName, x, y) {
    if (!realParty.id || realParty.members.length < 2) return;
    const p = window.GameState.player;
    sendNetEvent('party_reward', {
      partyId: realParty.id,
      killerId: resolveMyNetId(),
      killerName: p ? p.name : 'Союзник',
      xp: Math.max(5, Math.round(xpAmt * 0.40)),
      gold: Math.max(2, Math.round(goldAmt * 0.30)),
      mobName: mobName || 'Монстр',
      x: Math.round(x || 0),
      y: Math.round(y || 0)
    });
  }

  // =========================================================================
  // REAL-PLAYER DIRECT 2-SIDED TRADE LOGIC
  // =========================================================================
  function resetRealTrade() {
    realTrade.active = false;
    realTrade.tradeId = null;
    realTrade.partnerId = null;
    realTrade.partnerName = '';
    realTrade.myGold = 0;
    realTrade.myItemUids = [];
    realTrade.myReady = false;
    realTrade.partnerGold = 0;
    realTrade.partnerItems = [];
    realTrade.partnerReady = false;
  }

  function requestTrade(targetId) {
    if (status !== 'connected') {
      if (window.UI) window.UI.toast('Подключитесь к онлайну для обмена!');
      return false;
    }
    if (realTrade.active) {
      if (window.UI) window.UI.openModal('realTrade');
      return true;
    }
    const rp = remoteMap.get(targetId);
    if (!rp) {
      if (window.UI) window.UI.toast('Игрок не в сети.');
      return false;
    }
    const p = window.GameState.player;
    const tid = 'tr_' + resolveMyNetId() + '_' + Date.now();
    sendNetEvent('trade_req', {
      tradeId: tid,
      targetId,
      fromId: resolveMyNetId(),
      fromName: p.name
    });
    if (window.UI) window.UI.toast('Запрос обмена отправлен игроку ' + rp.name + '!');
    return true;
  }

  function acceptTradeRequest() {
    if (!pendingTradeInvite) return false;
    const inv = pendingTradeInvite;
    pendingTradeInvite = null;
    resetRealTrade();
    realTrade.active = true;
    realTrade.tradeId = inv.tradeId;
    realTrade.partnerId = inv.fromId;
    realTrade.partnerName = inv.fromName;

    const p = window.GameState.player;
    sendNetEvent('trade_accept', {
      tradeId: inv.tradeId,
      targetId: inv.fromId,
      fromId: resolveMyNetId(),
      fromName: p.name
    });
    if (window.UI) window.UI.openModal('realTrade');
    return true;
  }

  function declineTradeRequest() {
    if (!pendingTradeInvite) return;
    const inv = pendingTradeInvite;
    pendingTradeInvite = null;
    sendNetEvent('trade_cancel', {
      tradeId: inv.tradeId,
      targetId: inv.fromId,
      fromName: window.GameState.player ? window.GameState.player.name : 'Игрок',
      reason: 'отклонил обмен'
    });
    if (window.UI) window.UI.toast('Обмен отклонён.');
  }

  function getMyTradeItemsCloned() {
    const bag = window.GameState.inventory || [];
    const items = [];
    realTrade.myItemUids.forEach(uid => {
      const found = bag.find(i => i.uid === uid);
      if (found) items.push(cloneItemSafe(found));
    });
    return items;
  }

  function broadcastMyTradeOffer() {
    if (!realTrade.active) return;
    sendNetEvent('trade_offer', {
      tradeId: realTrade.tradeId,
      targetId: realTrade.partnerId,
      fromId: resolveMyNetId(),
      gold: realTrade.myGold,
      items: getMyTradeItemsCloned()
    });
  }

  function setRealTradeGold(val) {
    if (!realTrade.active) return;
    const maxG = Math.max(0, Math.floor(window.GameState.player.gold || 0));
    realTrade.myGold = Math.max(0, Math.min(maxG, Math.floor(Number(val) || 0)));
    realTrade.myReady = false;
    realTrade.partnerReady = false;
    broadcastMyTradeOffer();
  }

  function toggleRealTradeItem(uid) {
    if (!realTrade.active) return;
    const idx = realTrade.myItemUids.indexOf(uid);
    if (idx >= 0) realTrade.myItemUids.splice(idx, 1);
    else {
      if (realTrade.myItemUids.length >= 8) {
        if (window.UI) window.UI.toast('Максимум 8 предметов за один обмен!');
        return;
      }
      realTrade.myItemUids.push(uid);
    }
    realTrade.myReady = false;
    realTrade.partnerReady = false;
    broadcastMyTradeOffer();
  }

  function toggleRealTradeReady() {
    if (!realTrade.active) return;
    if (realTrade.myGold > window.GameState.player.gold) {
      realTrade.myGold = window.GameState.player.gold;
    }
    realTrade.myReady = !realTrade.myReady;
    sendNetEvent('trade_ready', {
      tradeId: realTrade.tradeId,
      targetId: realTrade.partnerId,
      fromId: resolveMyNetId(),
      ready: realTrade.myReady
    });
    if (realTrade.myReady && realTrade.partnerReady) {
      finalizeRealTrade();
    }
  }

  function finalizeRealTrade() {
    if (!realTrade.active || realTrade.completedIds.has(realTrade.tradeId)) return;
    const tid = realTrade.tradeId;
    const bag = window.GameState.inventory;
    const p = window.GameState.player;

    // Validate bag capacity
    const netSlots = realTrade.partnerItems.length - realTrade.myItemUids.length;
    if (bag.length + netSlots > 32) {
      if (window.UI) window.UI.toast('Не хватает места в инвентаре! Отменено.');
      cancelRealTrade('не хватило места в инвентаре');
      return;
    }
    if (p.gold < realTrade.myGold) {
      if (window.UI) window.UI.toast('Недостаточно монет для обмена!');
      cancelRealTrade('недостаточно монет');
      return;
    }

    realTrade.completedIds.add(tid);
    const partnerName = realTrade.partnerName;
    const partnerId = realTrade.partnerId;

    // Notify partner to commit too
    sendNetEvent('trade_commit', {
      tradeId: tid,
      targetId: partnerId,
      fromId: resolveMyNetId()
    });

    // Remove own items & gold
    realTrade.myItemUids.forEach(uid => {
      const i = bag.findIndex(x => x.uid === uid);
      if (i >= 0) bag.splice(i, 1);
    });
    p.gold = Math.max(0, p.gold - realTrade.myGold + realTrade.partnerGold);

    // Add partner items with fresh UIDs
    realTrade.partnerItems.forEach(it => {
      const copy = cloneItemSafe(it);
      if (copy) {
        copy.uid = freshUid();
        window.MMO.addItemToBag(copy);
      }
    });

    window.GameState.stats.trades = (window.GameState.stats.trades || 0) + 1;
    window.MMO.onProgressEvent('trade', 1);
    window.MMO.addChat('trade', 'Обмен', 'Успешный обмен с игроком ' + partnerName + '!');
    window.MMO.saveProgress();
    resetRealTrade();

    if (window.UI) {
      window.UI.toast('Обмен с ' + partnerName + ' завершён!');
      window.UI.closeModal();
    }
  }

  function cancelRealTrade(reason) {
    if (!realTrade.active) return;
    const tid = realTrade.tradeId;
    const pid = realTrade.partnerId;
    resetRealTrade();
    sendNetEvent('trade_cancel', {
      tradeId: tid,
      targetId: pid,
      fromName: window.GameState.player ? window.GameState.player.name : 'Игрок',
      reason: reason || 'отменил обмен'
    });
    if (window.UI) {
      window.UI.toast('Обмен отменён.');
      window.UI.closeModal();
    }
  }

  // =========================================================================
  // REAL-PLAYER LIVE AUCTION HOUSE
  // =========================================================================
  function upsertOnlineAuctionLot(lot) {
    if (!lot || !lot.id || soldLotIds.has(lot.id)) return;
    if (lot.expiresAt && Date.now() > lot.expiresAt) return;
    const idx = onlineAuctionLots.findIndex(l => l.id === lot.id);
    if (idx === -1) onlineAuctionLots.unshift(lot);
    else onlineAuctionLots[idx] = lot;
  }

  function listOnlineAuctionLot(uid, price) {
    if (status !== 'connected') {
      if (window.UI) window.UI.toast('Для онлайн-аукциона нужно подключение к сети!');
      return false;
    }
    const bag = window.GameState.inventory;
    const idx = bag.findIndex(i => i.uid === uid);
    if (idx === -1) return false;
    const p = window.GameState.player;
    const buyout = Math.max(10, Math.round(Number(price) || 100));
    const item = bag.splice(idx, 1)[0];
    const lot = {
      id: 'ol_' + resolveMyNetId() + '_' + Date.now(),
      sellerId: resolveMyNetId(),
      sellerName: p.name,
      item: cloneItemSafe(item),
      buyout,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1800000 // 30 min
    };
    onlineAuctionLots.unshift(lot);
    sendNetEvent('auc_list', { lot });
    window.MMO.saveProgress();
    window.MMO.addChat('trade', p.name, 'Выставил «' + item.name + '» на Онлайн-Аукцион за ' + buyout + ' монет!');
    if (window.UI) window.UI.toast('Лот выставлен на Онлайн-Аукцион игроков!');
    return true;
  }

  function cancelOnlineAuctionLot(lotId) {
    const idx = onlineAuctionLots.findIndex(l => l.id === lotId);
    if (idx === -1) return false;
    const lot = onlineAuctionLots[idx];
    if (lot.sellerId !== resolveMyNetId()) return false;
    const copy = cloneItemSafe(lot.item);
    if (copy) copy.uid = freshUid();
    if (!window.MMO.addItemToBag(copy)) {
      if (window.UI) window.UI.toast('Освободите 1 слот в инвентаре!');
      return false;
    }
    onlineAuctionLots.splice(idx, 1);
    soldLotIds.add(lotId);
    sendNetEvent('auc_remove', { lotId });
    window.MMO.saveProgress();
    if (window.UI) window.UI.toast('Онлайн-лот снят и возвращён в сумку.');
    return true;
  }

  function buyOnlineAuctionLot(lotId) {
    const idx = onlineAuctionLots.findIndex(l => l.id === lotId);
    if (idx === -1) {
      if (window.UI) window.UI.toast('Этот лот уже выкуплен!');
      return false;
    }
    const lot = onlineAuctionLots[idx];
    if (lot.sellerId === resolveMyNetId()) return cancelOnlineAuctionLot(lotId);
    const p = window.GameState.player;
    if (p.gold < lot.buyout) {
      if (window.UI) window.UI.toast('Недостаточно монет для покупки!');
      return false;
    }
    const copy = cloneItemSafe(lot.item);
    if (copy) copy.uid = freshUid();
    if (!window.MMO.addItemToBag(copy)) {
      if (window.UI) window.UI.toast('Инвентарь переполнен!');
      return false;
    }
    p.gold -= lot.buyout;
    onlineAuctionLots.splice(idx, 1);
    soldLotIds.add(lotId);

    sendNetEvent('auc_sold', {
      lotId: lot.id,
      sellerId: lot.sellerId,
      sellerName: lot.sellerName,
      buyerId: resolveMyNetId(),
      buyerName: p.name,
      buyout: lot.buyout,
      itemName: lot.item.name
    });

    window.GameState.stats.auctions = (window.GameState.stats.auctions || 0) + 1;
    window.MMO.onProgressEvent('trade', 1);
    window.MMO.saveProgress();
    window.MMO.addChat('trade', 'Аукцион', 'Вы купили «' + lot.item.name + '» у игрока ' + lot.sellerName + ' за ' + lot.buyout + ' монет!');
    if (window.UI) window.UI.toast('Куплено у ' + lot.sellerName + ': ' + lot.item.name + '!');
    return true;
  }

  function broadcastMyAuctionLots() {
    const myId = resolveMyNetId();
    const myLots = onlineAuctionLots.filter(l => l.sellerId === myId && !soldLotIds.has(l.id));
    if (myLots.length > 0) {
      sendNetEvent('auc_sync', { lots: myLots });
    }
  }

  // =========================================================================
  // INCOMING EVENT ROUTER (Shared by Supabase Broadcast & Custom WS)
  // =========================================================================
  function handleIncomingChat(msg) {
    if (!msg || !msg.text || msg.senderId === resolveMyNetId()) return;
    if (msg.ch === 'party') {
      if (!realParty.id || msg.partyId !== realParty.id) return;
    }
    if (window.MMO) {
      window.MMO.addChat(msg.ch || 'world', msg.sender || 'Игрок', String(msg.text).slice(0, 120));
    }
  }

  function handleIncomingPvpHit(msg) {
    if (!msg || msg.targetId !== resolveMyNetId()) return;
    // Never take friendly fire from own party!
    if (msg.attackerId && isInMyParty(msg.attackerId)) return;
    const p = window.GameState && window.GameState.player;
    const ab = window.GameState && window.GameState.adminBot;
    if (ab && ab.owned && ab.godMode) {
      if (window.Combat) window.Combat.addText(p.x, p.y - 20, 'БОГ (0)', '#fbbf24', false);
      return;
    }
    if (p && p.state !== 'death' && window.GameState.pvpEnabled && !window.World.getBiomeAt(p.x, p.y).safe) {
      const cap = Math.max(8, Math.round(p.maxHp * 0.12));
      const dmg = Math.max(4, Math.min(cap, Math.round(Number(msg.dmg) || 10)));
      p.hp = Math.max(0, p.hp - dmg);
      p.hurtTimer = 0.16;
      if (window.Combat) {
        window.Combat.addText(p.x, p.y - 20, '-' + dmg + ' PvP', '#ff6b77', Boolean(msg.isCrit));
        window.Combat.addParticles(p.x, p.y - 6, '#ef4444', 6, 90);
      }
      if (p.hp <= 0 && window.Combat && window.Combat.applyDeathPenalty) {
        window.Combat.applyDeathPenalty(msg.attackerName || 'Соперник', msg.attackerId || null);
      }
    }
  }

  function handleIncomingPvpKillLoot(msg) {
    if (!msg || msg.killerId !== resolveMyNetId()) return;
    const p = window.GameState && window.GameState.player;
    if (!p) return;
    const goldGain = Math.max(0, Math.round(Number(msg.gold) || 0));
    if (goldGain > 0) {
      p.gold += goldGain;
      if (window.Combat) window.Combat.addText(p.x, p.y - 34, '+' + goldGain + ' монет (PvP)!', '#fbbf24', true);
    }
    if (Array.isArray(msg.items) && window.Combat) {
      msg.items.forEach((it, idx) => {
        const copy = cloneItemSafe(it);
        if (copy) {
          copy.uid = freshUid();
          const ang = (idx / Math.max(1, msg.items.length)) * Math.PI * 2;
          window.Combat.spawnGroundLoot(
            (msg.x || p.x) + Math.cos(ang) * 24,
            (msg.y || p.y) + Math.sin(ang) * 20,
            'item',
            copy,
            copy.qty || 1
          );
        }
      });
    }
    p.pvpRating = (p.pvpRating || 1000) + 30;
    window.GameState.stats.duelsWon = (window.GameState.stats.duelsWon || 0) + 1;
    if (window.Progression && window.Progression.onPlayerKilledTarget) {
      window.Progression.onPlayerKilledTarget(msg.victimId || null, msg.victimName || 'Соперник', msg.victimKarma || 0);
    }
    window.MMO.saveProgress();
    window.MMO.addChat('system', 'PvP', 'Вы победили игрока ' + (msg.victimName || 'Соперник') + '! Добыча: +' + goldGain + ' монет и трофеи на земле!');
    if (window.UI) window.UI.toast('Победа в PvP! +' + goldGain + ' монет + лут на земле!');
  }

  function handleNetEvent(evName, data) {
    const myId = resolveMyNetId();
    if (!evName || !data) return;

    if (evName === 'hello' && data.id && data.id !== myId) {
      upsertRemotePlayer(data);
      const self = serializeSelf();
      if (self) sendNetEvent('move', self);
      broadcastMyAuctionLots();
    } else if (evName === 'move') {
      upsertRemotePlayer(data);
    } else if (evName === 'leave' && data.id) {
      remoteMap.delete(data.id);
      if (realParty.id && realParty.members.some(m => m.id === data.id)) {
        realParty.members = realParty.members.filter(m => m.id !== data.id);
        if (realParty.members.length <= 1) leaveRealParty(true);
      }
      if (realTrade.active && realTrade.partnerId === data.id) {
        resetRealTrade();
        if (window.UI) { window.UI.toast('Собеседник вышел из сети — обмен отменён.'); window.UI.closeModal(); }
      }
    } else if (evName === 'chat') {
      handleIncomingChat(data);
    } else if (evName === 'pvp_hit') {
      handleIncomingPvpHit(data);
    } else if (evName === 'pvp_kill_loot') {
      handleIncomingPvpKillLoot(data);
    } else if (evName === 'party_invite' && data.targetId === myId) {
      pendingPartyInvite = data;
      if (window.UI) window.UI.toast(data.fromName + ' приглашает вас в Пати!');
    } else if (evName === 'party_sync' && realParty.id && data.partyId === realParty.id) {
      if (Array.isArray(data.members)) realParty.members = data.members;
      if (data.leaderId) realParty.leaderId = data.leaderId;
      if (data.joinedName && window.MMO) {
        window.MMO.addChat('party', 'Пати', data.joinedName + ' присоединился к группе!');
      }
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'party_decline' && data.targetId === myId) {
      if (window.UI) window.UI.toast((data.fromName || 'Игрок') + ' отклонил приглашение в пати.');
    } else if (evName === 'party_leave' && realParty.id && data.partyId === realParty.id && data.id !== myId) {
      realParty.members = realParty.members.filter(m => m.id !== data.id);
      if (realParty.leaderId === data.id && realParty.members.length > 0) {
        realParty.leaderId = realParty.members[0].id;
      }
      if (window.MMO) window.MMO.addChat('party', 'Пати', (data.name || 'Союзник') + ' покинул группу.');
      if (realParty.members.length <= 1) {
        realParty.id = null;
        realParty.leaderId = null;
        realParty.members = [];
      }
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'party_reward' && realParty.id && data.partyId === realParty.id && data.killerId !== myId) {
      const p = window.GameState && window.GameState.player;
      if (p && p.state !== 'death') {
        const dist = Math.hypot((data.x || p.x) - p.x, (data.y || p.y) - p.y);
        if (dist <= 1600) {
          const xp = Math.max(3, Math.round(data.xp || 10));
          const gd = Math.max(1, Math.round(data.gold || 5));
          window.MMO.grantXp(xp);
          p.gold += gd;
          if (window.Combat) {
            window.Combat.addText(p.x, p.y - 34, '+' + xp + ' XP / +' + gd + 'м (Пати)', '#4ade80', false);
          }
        }
      }
    } else if (evName === 'trade_req' && data.targetId === myId) {
      if (realTrade.active) {
        sendNetEvent('trade_cancel', { tradeId: data.tradeId, targetId: data.fromId, fromName: window.GameState.player.name, reason: 'уже занят обменом' });
        return;
      }
      pendingTradeInvite = data;
      if (window.UI) window.UI.toast(data.fromName + ' предлагает вам обмен!');
    } else if (evName === 'trade_accept' && data.targetId === myId) {
      resetRealTrade();
      realTrade.active = true;
      realTrade.tradeId = data.tradeId;
      realTrade.partnerId = data.fromId;
      realTrade.partnerName = data.fromName;
      if (window.UI) {
        window.UI.toast(data.fromName + ' принял обмен!');
        window.UI.openModal('realTrade');
      }
    } else if (evName === 'trade_offer' && data.targetId === myId && realTrade.active && data.tradeId === realTrade.tradeId) {
      realTrade.partnerGold = Math.max(0, Math.floor(Number(data.gold) || 0));
      realTrade.partnerItems = Array.isArray(data.items) ? data.items : [];
      realTrade.myReady = false;
      realTrade.partnerReady = false;
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'trade_ready' && data.targetId === myId && realTrade.active && data.tradeId === realTrade.tradeId) {
      realTrade.partnerReady = Boolean(data.ready);
      if (realTrade.myReady && realTrade.partnerReady) {
        finalizeRealTrade();
      } else if (window.UI) {
        window.UI.renderCurrentModal();
      }
    } else if (evName === 'trade_commit' && data.targetId === myId && realTrade.active && data.tradeId === realTrade.tradeId) {
      finalizeRealTrade();
    } else if (evName === 'trade_cancel' && data.targetId === myId) {
      if (pendingTradeInvite && pendingTradeInvite.tradeId === data.tradeId) pendingTradeInvite = null;
      if (realTrade.active && realTrade.tradeId === data.tradeId) {
        resetRealTrade();
        if (window.UI) window.UI.closeModal();
      }
      if (window.UI) window.UI.toast((data.fromName || 'Игрок') + ' ' + (data.reason || 'отменил обмен') + '.');
    } else if (evName === 'auc_list' && data.lot) {
      upsertOnlineAuctionLot(data.lot);
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'auc_sync' && Array.isArray(data.lots)) {
      data.lots.forEach(upsertOnlineAuctionLot);
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'auc_remove' && data.lotId) {
      soldLotIds.add(data.lotId);
      const idx = onlineAuctionLots.findIndex(l => l.id === data.lotId);
      if (idx >= 0) onlineAuctionLots.splice(idx, 1);
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'auc_sold' && data.lotId) {
      soldLotIds.add(data.lotId);
      const idx = onlineAuctionLots.findIndex(l => l.id === data.lotId);
      if (idx >= 0) onlineAuctionLots.splice(idx, 1);
      if (data.sellerId === myId) {
        const feeRate = (window.MMO && window.MMO.economy && window.MMO.economy.auctionFee) || 0.05;
        const net = Math.max(1, Math.round(data.buyout * (1 - feeRate)));
        window.GameState.player.gold += net;
        window.GameState.stats.auctions = (window.GameState.stats.auctions || 0) + 1;
        window.MMO.saveProgress();
        window.MMO.addChat('trade', 'Аукцион', (data.buyerName || 'Игрок') + ' купил ваш онлайн-лот «' + data.itemName + '» (+' + net + ' монет)!');
        if (window.UI) window.UI.toast('Онлайн-лот продан! +' + net + ' монет!');
      }
      if (window.UI) window.UI.renderCurrentModal();
    } else if (evName === 'fort_capture' && window.Activities && window.Activities.applyRemoteFortressSync) {
      window.Activities.applyRemoteFortressSync(data);
    } else if (evName === 'bounty_post' && window.Progression && window.Progression.onRemoteBountyPost) {
      window.Progression.onRemoteBountyPost(data);
    } else if (evName === 'dungeon_start' && realParty.id && data.partyId === realParty.id && data.fromId !== myId) {
      if (window.MMO) window.MMO.addChat('party', 'Рейд', (data.fromName || 'Лидер') + ' начал рейд «' + (data.dungeonName || 'Подземелье') + '»! Откройте Меню -> Рейд-Данжи.');
      if (window.UI) window.UI.toast((data.fromName || 'Лидер') + ' зовёт в рейд: ' + (data.dungeonName || 'Данж') + '!');
    }
  }

  function sendLeaveSignal() {
    if (status !== 'connected') return;
    sendNetEvent('leave', { id: resolveMyNetId() });
  }

  // =========================================================================
  // CONNECTION MANAGEMENT (Supabase Realtime & Custom WS)
  // =========================================================================
  function connectSupabase(customUrl, customKey) {
    if (typeof customUrl === 'string' || typeof customKey === 'string') {
      if (!setSupabaseConfig(customUrl, customKey)) return false;
    }
    const cfg = getSupabaseConfig();
    if (!cfg.url || !cfg.key) {
      if (window.UI) window.UI.toast('Укажите Supabase Project URL и ключ (Publishable / Anon Key)');
      return false;
    }

    disconnect(true);
    manualDisconnect = false;
    activeMode = 'supabase';
    status = 'connecting';
    supabaseJoined = false;
    sentWorldHello = false;
    lastError = '';
    lastSentSig = '';

    const host = cfg.url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    const wsEndpoint = 'wss://' + host + '/realtime/v1/websocket?apikey=' + encodeURIComponent(cfg.key) + '&vsn=1.0.0';

    try {
      ws = new WebSocket(wsEndpoint);
    } catch (err) {
      status = 'offline';
      activeMode = 'none';
      lastError = err && err.message ? err.message : 'Ошибка WebSocket';
      if (window.UI) window.UI.toast('Ошибка Supabase: ' + lastError);
      return false;
    }

    ws.onopen = () => {
      phxTopic = 'realtime:' + DEFAULT_ROOM;
      phxJoinRef = nextRef();
      sendRaw({
        topic: phxTopic,
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { ack: false, self: false },
            presence: { key: resolveMyNetId() },
            postgres_changes: []
          },
          access_token: cfg.key
        },
        ref: phxJoinRef,
        join_ref: phxJoinRef
      });

      clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (ws && ws.readyState === 1) {
          sendRaw({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: nextRef() });
        }
      }, 25000);
    };

    ws.onmessage = ev => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (_e) { return; }
      if (!msg || !msg.event) return;

      if (msg.event === 'phx_reply' && msg.ref === phxJoinRef) {
        if (msg.payload && msg.payload.status === 'ok') {
          supabaseJoined = true;
          status = 'connected';
          reconnectDelay = 2000;
          lastError = '';
          const self = serializeSelf();
          if (self && window.GameState && window.GameState.started) {
            sentWorldHello = true;
            sendNetEvent('hello', self);
          }
          broadcastMyAuctionLots();
          if (window.MMO) window.MMO.addChat('system', 'Онлайн', 'Подключено к Supabase Realtime!');
          if (window.UI) {
            window.UI.toast('Мультиплеер Supabase подключён!');
            window.UI.renderCurrentModal();
          }
        } else {
          const reason = (msg.payload && msg.payload.response && (msg.payload.response.reason || msg.payload.response.message)) || 'Отклонено сервером (проверьте ключ)';
          lastError = String(reason);
          if (window.UI) window.UI.toast('Supabase: ' + lastError);
          disconnect(true);
          if (window.UI) window.UI.renderCurrentModal();
        }
        return;
      }

      if (msg.event === 'broadcast' && msg.payload) {
        handleNetEvent(msg.payload.event, msg.payload.payload);
      }
    };

    ws.onerror = () => {
      lastError = 'Нет связи с Supabase (проверьте Project URL и ключ)';
    };

    ws.onclose = () => {
      clearInterval(heartbeatTimer);
      ws = null;
      supabaseJoined = false;
      status = 'offline';
      remoteMap.clear();
      if (!manualDisconnect && getSupabaseConfig().url && getSupabaseConfig().key) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(15000, Math.round(reconnectDelay * 1.6));
          connectSupabase();
        }, reconnectDelay);
      }
      if (window.UI) window.UI.renderCurrentModal();
    };

    return true;
  }

  function connect(customUrl) {
    if (typeof customUrl === 'string') {
      if (!setWsUrl(customUrl)) return false;
    }
    const url = getWsUrl();
    if (!url) {
      if (window.UI) window.UI.toast('Укажите адрес WebSocket-сервера (wss://...)');
      return false;
    }
    disconnect(true);
    manualDisconnect = false;
    activeMode = 'ws';
    status = 'connecting';
    lastError = '';
    lastSentSig = '';

    try {
      ws = new WebSocket(url);
    } catch (err) {
      status = 'offline';
      activeMode = 'none';
      lastError = err && err.message ? err.message : 'Ошибка WebSocket';
      if (window.UI) window.UI.toast('Ошибка подключения: ' + lastError);
      return false;
    }

    ws.onopen = () => {
      status = 'connected';
      reconnectDelay = 2000;
      lastError = '';
      const self = serializeSelf();
      const tg = window.Telegram && window.Telegram.WebApp;
      sendRaw({
        type: 'join',
        userId: resolveMyNetId(),
        initData: (tg && tg.initData) || '',
        player: self
      });
      if (window.MMO) window.MMO.addChat('system', 'Онлайн', 'Подключено к мультиплеер-серверу!');
      if (window.UI) {
        window.UI.toast('Мультиплеер подключён!');
        window.UI.renderCurrentModal();
      }
    };

    ws.onmessage = ev => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (_e) { return; }
      if (!msg || !msg.type) return;

      if (msg.type === 'snapshot' && Array.isArray(msg.players)) {
        const seen = new Set();
        msg.players.forEach(pd => {
          if (pd && pd.id && pd.id !== resolveMyNetId()) {
            seen.add(pd.id);
            upsertRemotePlayer(pd);
          }
        });
        for (const id of Array.from(remoteMap.keys())) {
          if (!seen.has(id)) remoteMap.delete(id);
        }
      } else if (msg.type === 'player_update' && msg.player) {
        upsertRemotePlayer(msg.player);
      } else {
        handleNetEvent(msg.type, msg);
      }
    };

    ws.onerror = () => {
      lastError = 'Нет связи с сервером';
    };

    ws.onclose = () => {
      ws = null;
      status = 'offline';
      remoteMap.clear();
      if (!manualDisconnect && getWsUrl()) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(15000, Math.round(reconnectDelay * 1.6));
          connect();
        }, reconnectDelay);
      }
      if (window.UI) window.UI.renderCurrentModal();
    };

    return true;
  }

  function disconnect(silent) {
    sendLeaveSignal();
    manualDisconnect = true;
    clearTimeout(reconnectTimer);
    clearInterval(heartbeatTimer);
    if (ws) {
      try { ws.close(); } catch (_e) {}
      ws = null;
    }
    supabaseJoined = false;
    status = 'offline';
    activeMode = 'none';
    remoteMap.clear();
    if (!silent && window.UI) {
      window.UI.toast('Мультиплеер отключён.');
      window.UI.renderCurrentModal();
    }
  }

  function sendChat(ch, text) {
    if (status !== 'connected') return false;
    const p = window.GameState && window.GameState.player;
    return sendNetEvent('chat', {
      ch: ch || 'world',
      partyId: ch === 'party' ? realParty.id : null,
      senderId: resolveMyNetId(),
      sender: p ? p.name : 'Игрок',
      text: String(text || '').slice(0, 120)
    });
  }

  function sendPvpHit(targetId, dmg, isCrit) {
    if (status !== 'connected' || !targetId) return false;
    if (isInMyParty(targetId)) return false;
    const p = window.GameState && window.GameState.player;
    return sendNetEvent('pvp_hit', {
      targetId,
      attackerId: resolveMyNetId(),
      attackerName: p ? p.name : 'Игрок',
      dmg: Math.round(dmg),
      isCrit: Boolean(isCrit)
    });
  }

  function sendPvpKillLoot(killerId, victimName, lostGold, droppedItems, x, y) {
    if (status !== 'connected' || !killerId) return false;
    sendNetEvent('pvp_kill_loot', {
      killerId,
      victimName: victimName || 'Игрок',
      gold: Math.max(0, Math.round(lostGold || 0)),
      items: (droppedItems || []).slice(0, 8).map(cloneItemSafe).filter(Boolean),
      x: Math.round(x || 0),
      y: Math.round(y || 0)
    });
    sendChat('world', 'Пал в PvP от клинка врага! Потеряно ' + lostGold + ' монет и всё снаряжение!');
    return true;
  }

  function init() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const qSb = normalizeSupabaseUrl(params.get('sb') || params.get('supabase') || params.get('supabase_url') || '');
      const qKey = String(params.get('sbkey') || params.get('supabase_key') || params.get('anon') || '').trim();
      if (qSb && qKey) {
        querySbUrl = qSb;
        querySbKey = qKey;
      }
      const qWs = cleanUrl(params.get('ws') || params.get('server') || '');
      if (qWs && /^wss?:\/\//i.test(qWs)) {
        queryWsUrl = qWs;
      }
    } catch (_e) {}

    window.addEventListener('beforeunload', sendLeaveSignal);
    window.addEventListener('pagehide', sendLeaveSignal);

    const sb = getSupabaseConfig();
    if (sb.url && sb.key) {
      connectSupabase();
      return;
    }
    const wsUrl = getWsUrl();
    if (wsUrl) connect();
  }

  function update(dt) {
    const now = performance.now();
    if (partyTpCooldown > 0) partyTpCooldown = Math.max(0, partyTpCooldown - dt);

    // Smooth 60 FPS interpolation of remote players
    for (const [id, rp] of remoteMap.entries()) {
      const dx = rp.tx - rp.x;
      const dy = rp.ty - rp.y;
      if (Math.hypot(dx, dy) > 280) {
        rp.x = rp.tx;
        rp.y = rp.ty;
      } else {
        const t = Math.min(1, dt * 12);
        rp.x += dx * t;
        rp.y += dy * t;
      }
      if (rp.hurtTimer > 0) rp.hurtTimer -= dt;
      if (now - rp.lastSeen > 12000) remoteMap.delete(id);
    }

    // Stream own state (~10 Hz when moving/acting, 2.5s keep-alive when idle)
    if (status === 'connected' && window.GameState && window.GameState.started && window.GameState.player) {
      if (activeMode === 'supabase' && !sentWorldHello) {
        sentWorldHello = true;
        const helloSelf = serializeSelf();
        if (helloSelf) sendNetEvent('hello', helloSelf);
        broadcastMyAuctionLots();
      }
      syncAccum += dt;
      idleSyncAccum += dt;
      const minInterval = activeMode === 'supabase' ? 0.10 : 0.066;
      if (syncAccum >= minInterval) {
        syncAccum = 0;
        const self = serializeSelf();
        if (self) {
          const sig = self.x + ',' + self.y + ',' + self.state + ',' + self.hp + ',' + self.pvp + ',' + (self.mountedId || '') + ',' + self.weaponType + ',' + (self.partyId || '');
          const changed = sig !== lastSentSig;
          if (changed || idleSyncAccum >= 2.5) {
            lastSentSig = sig;
            idleSyncAccum = 0;
            if (activeMode === 'supabase') {
              sendNetEvent('move', self);
            } else {
              sendRaw({ type: 'move', data: self });
            }
          }
        }
      }
    }
  }

  function drawAll(ctx, camLeft, camTop, vw, vh, animTime) {
    if (remoteMap.size === 0) return;
    for (const rp of remoteMap.values()) {
      if (rp.x < camLeft - 80 || rp.x > camLeft + vw + 80 || rp.y < camTop - 80 || rp.y > camTop + vh + 80) continue;
      const ally = isInMyParty(rp.id);
      ctx.save();
      ctx.strokeStyle = ally ? 'rgba(74,222,128,0.9)' : (rp.pvp ? 'rgba(248,113,113,0.85)' : 'rgba(34,211,238,0.8)');
      ctx.lineWidth = ally ? 2.5 : 2;
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y + 12, 16, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      window.Sprites.drawCharacter(ctx, rp, animTime);
    }
  }

  function getRemotePlayers() {
    return Array.from(remoteMap.values());
  }

  function getRemotePlayerById(id) {
    return remoteMap.get(id) || null;
  }

  function getStatus() {
    const sb = getSupabaseConfig();
    return {
      status,
      mode: activeMode,
      sbUrl: sb.url,
      sbKey: sb.key,
      wsUrl: getWsUrl(),
      onlineCount: status === 'connected' ? (remoteMap.size + 1) : 1,
      remoteCount: remoteMap.size,
      lastError,
      myNetId: resolveMyNetId()
    };
  }

  return {
    init,
    connect,
    connectSupabase,
    disconnect,
    getSupabaseConfig,
    setSupabaseConfig,
    getWsUrl,
    setWsUrl,
    sendChat,
    sendPvpHit,
    sendPvpKillLoot,
    sendCustomEvent: sendNetEvent,
    update,
    drawAll,
    getRemotePlayers,
    getRemotePlayerById,
    getStatus,
    // Real-Player Party
    realParty,
    getPendingPartyInvite: () => pendingPartyInvite,
    isInMyParty,
    invitePlayerToParty,
    acceptPartyInvite,
    declinePartyInvite,
    leaveRealParty,
    teleportToPartyMate,
    sharePartyKill,
    // Real-Player Direct Trade
    realTrade,
    getPendingTradeInvite: () => pendingTradeInvite,
    requestTrade,
    acceptTradeRequest,
    declineTradeRequest,
    setRealTradeGold,
    toggleRealTradeItem,
    toggleRealTradeReady,
    cancelRealTrade,
    // Real-Player Live Auction
    onlineAuctionLots,
    listOnlineAuctionLot,
    cancelOnlineAuctionLot,
    buyOnlineAuctionLot
  };
})();
