// Main 60 FPS gameplay loop, FPS controller, touch + pointer input, HUD & Supabase sync
(function () {
  const glCanvas = document.getElementById('gl-canvas');
  const overlayCanvas = document.getElementById('overlay-canvas');
  const octx = overlayCanvas.getContext('2d');
  const miniCanvas = document.getElementById('minimap-canvas');
  const mctx = miniCanvas.getContext('2d');

  // HUD DOM elements
  const dom = {
    netDot: document.getElementById('net-dot'),
    modeLabel: document.getElementById('hud-mode-label'),
    roomCode: document.getElementById('hud-room-code'),
    playersCount: document.getElementById('hud-players-count'),
    ping: document.getElementById('hud-ping'),
    kills: document.getElementById('hud-kills'),
    deaths: document.getElementById('hud-deaths'),
    streak: document.getElementById('hud-streak-badge'),
    hpNum: document.getElementById('hud-hp-num'),
    hpBar: document.getElementById('hud-hp-bar'),
    shieldBar: document.getElementById('hud-shield-bar'),
    weaponName: document.getElementById('hud-weapon-name'),
    ammoMag: document.getElementById('hud-ammo-mag'),
    ammoRes: document.getElementById('hud-ammo-res'),
    reloadTrack: document.getElementById('reload-progress-track'),
    reloadBar: document.getElementById('reload-progress-bar'),
    crosshair: document.getElementById('crosshair'),
    hitmarker: document.getElementById('hitmarker'),
    scopeOverlay: document.getElementById('scope-overlay'),
    damageVig: document.getElementById('damage-vignette'),
    hitDirRing: document.getElementById('hit-direction-ring'),
    killFeed: document.getElementById('kill-feed'),
    centerBanner: document.getElementById('center-banner'),
    sbModal: document.getElementById('scoreboard-modal'),
    sbSub: document.getElementById('sb-subtitle'),
    sbRows: document.getElementById('sb-rows'),
    respawnModal: document.getElementById('respawn-modal'),
    respawnKiller: document.getElementById('respawn-killer'),
    respawnCd: document.getElementById('respawn-countdown'),
    moveZone: document.getElementById('move-zone'),
    lookZone: document.getElementById('look-zone'),
    joyBase: document.getElementById('joy-base'),
    joyKnob: document.getElementById('joy-knob'),
    moveHint: document.getElementById('move-hint'),
    lookHint: document.getElementById('look-hint'),
    btnFire: document.getElementById('btn-fire'),
    btnJump: document.getElementById('btn-jump'),
    btnAds: document.getElementById('btn-ads'),
    btnReload: document.getElementById('btn-reload'),
    btnScoreboard: document.getElementById('btn-scoreboard'),
    btnCloseSb: document.getElementById('btn-close-sb'),
    btnLobby: document.getElementById('btn-lobby')
  };

  function hexToRgb01(hex) {
    const clean = (hex || '#00E5FF').replace('#', '');
    if (clean.length !== 6) return [0.0, 0.9, 1.0];
    return [
      parseInt(clean.slice(0, 2), 16) / 255,
      parseInt(clean.slice(2, 4), 16) / 255,
      parseInt(clean.slice(4, 6), 16) / 255
    ];
  }

  function loadConfig() {
    let raw = null;
    if (window.AndroidBridge && window.AndroidBridge.getMatchConfig) {
      try {
        raw = JSON.parse(window.AndroidBridge.getMatchConfig());
      } catch (_) {}
    }
    const params = new URLSearchParams(window.location.search);
    return Object.assign({
      mode: params.get('mode') || 'training',
      playerName: params.get('name') || 'STRIKER',
      room: params.get('room') || 'ARENA-01',
      mapId: params.get('map') || 'foundry',
      weaponId: params.get('weapon') || 'rifle',
      accentHex: '#00E5FF',
      sensitivity: 1.0,
      invertY: false,
      soundEnabled: true,
      hapticsEnabled: true,
      supabaseUrl: '',
      supabaseAnonKey: ''
    }, raw || {});
  }

  const config = loadConfig();
  window.SoundFX.setEnabled(config.soundEnabled);

  function haptic(ms) {
    if (!config.hapticsEnabled) return;
    if (window.AndroidBridge && window.AndroidBridge.vibrate) {
      window.AndroidBridge.vibrate(ms);
    }
  }

  const engine = window.Engine3D.create(glCanvas);
  const map = window.ArenaMaps.create(config.mapId);

  const playerId = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const playerRgb = hexToRgb01(config.accentHex);

  // Player state
  const state = {
    id: playerId,
    name: (config.playerName || 'STRIKER').trim().slice(0, 16) || 'STRIKER',
    colorHex: config.accentHex || '#00E5FF',
    pos: { x: 0, y: 0.1, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: 0,
    pitch: 0,
    grounded: false,
    hp: 100,
    shield: 50,
    alive: true,
    respawnTimer: 0,
    kills: 0,
    deaths: 0,
    streak: 0,
    weaponId: window.WEAPONS[config.weaponId] ? config.weaponId : 'rifle',
    ammo: {
      rifle: { mag: 30, res: 120 },
      shotgun: { mag: 8, res: 40 },
      railgun: { mag: 6, res: 24 }
    },
    reloading: false,
    reloadElapsed: 0,
    fireCooldown: 0,
    recoil: 0,
    muzzleTimer: 0,
    ads: false,
    adsBlend: 0,
    fov: 76,
    bobPhase: 0,
    stepTimer: 0,
    hitmarkerTimer: 0,
    damageFlash: 0,
    bannerTimer: 0,
    lastSyncAt: 0,
    scoreboardOpen: false
  };

  // Remote multiplayer peers keyed by id
  const remotes = new Map();
  // Visual tracers & sparks
  const beams = [];
  const particles = [];
  // Training drones
  const drones = [];

  function spawnPlayer() {
    const sp = map.spawns[Math.floor(Math.random() * map.spawns.length)];
    state.pos.x = sp.x;
    state.pos.y = sp.y;
    state.pos.z = sp.z;
    state.vel.x = 0;
    state.vel.y = 0;
    state.vel.z = 0;
    state.yaw = sp.yaw;
    state.pitch = 0;
    state.hp = 100;
    state.shield = 50;
    state.alive = true;
    state.reloading = false;
    state.ads = false;
    state.ammo.rifle = { mag: 30, res: 120 };
    state.ammo.shotgun = { mag: 8, res: 40 };
    state.ammo.railgun = { mag: 6, res: 24 };
    dom.respawnModal.classList.add('hidden');
    updateHudVitals();
    updateHudAmmo();
  }

  function initDrones() {
    drones.length = 0;
    if (config.mode !== 'training') return;
    map.dronePaths.forEach((dp, idx) => {
      drones.push({
        id: 'drone_' + idx,
        name: 'ДРОН-' + (idx + 1),
        ax: dp.ax, az: dp.az,
        bx: dp.bx, bz: dp.bz,
        x: dp.ax, y: dp.y, z: dp.az,
        speed: dp.speed,
        phase: idx * 1.35,
        t: idx * 0.2,
        hp: 80,
        maxHp: 80,
        alive: true,
        respawnAt: 0,
        hitFlash: 0
      });
    });
  }

  function showBanner(text, duration = 1.6) {
    dom.centerBanner.textContent = text;
    dom.centerBanner.classList.remove('hidden');
    state.bannerTimer = duration;
  }

  function addKillFeed(killer, victim, weaponShort, headshot) {
    const el = document.createElement('div');
    el.className = 'kill-item' + (headshot ? ' hs' : '');
    el.innerHTML =
      `<span class="kill-killer">${escapeHtml(killer)}</span>` +
      `<span>[${escapeHtml(weaponShort)}]</span>` +
      `<span class="kill-victim">${escapeHtml(victim)}</span>` +
      (headshot ? `<span class="kill-tag">HEADSHOT</span>` : '');
    dom.killFeed.prepend(el);
    while (dom.killFeed.children.length > 4) {
      dom.killFeed.lastChild.remove();
    }
    setTimeout(() => el.remove(), 4500);
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }

  function spawnSparks(x, y, z, color, count = 8) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * 6 + 1.5,
        vz: (Math.random() - 0.5) * 9,
        size: 0.08 + Math.random() * 0.09,
        color,
        life: 0.26 + Math.random() * 0.24,
        maxLife: 0.5
      });
    }
  }

  function spawnBeam(ax, ay, az, bx, by, bz, color, width, life = 0.14) {
    beams.push({ ax, ay, az, bx, by, bz, color, width, life, maxLife: life });
  }

  function updateHudVitals() {
    const hp = Math.max(0, Math.round(state.hp));
    dom.hpNum.textContent = hp;
    dom.hpBar.style.width = hp + '%';
    dom.hpBar.classList.toggle('low', hp <= 30);
    dom.shieldBar.style.width = Math.max(0, Math.min(100, (state.shield / 50) * 100)) + '%';
    dom.kills.textContent = state.kills;
    dom.deaths.textContent = state.deaths;
    if (state.streak >= 2) {
      dom.streak.textContent = 'x' + state.streak;
      dom.streak.classList.remove('hidden');
    } else {
      dom.streak.classList.add('hidden');
    }
  }

  function updateHudAmmo() {
    const w = window.WEAPONS[state.weaponId];
    const a = state.ammo[state.weaponId];
    dom.weaponName.textContent = w.name;
    dom.ammoMag.textContent = a.mag;
    dom.ammoRes.textContent = a.res;
    document.querySelectorAll('.weapon-slot').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.weapon === state.weaponId);
    });
  }

  function updatePlayersCount() {
    const total = 1 + remotes.size;
    if (config.mode === 'training') {
      dom.playersCount.textContent = 'ПОЛИГОН · 5 ДРОНОВ';
    } else {
      const label = total === 1 ? '1 ИГРОК' : (total < 5 ? `${total} ИГРОКА` : `${total} ИГРОКОВ`);
      dom.playersCount.textContent = label;
    }
  }

  function renderScoreboard() {
    const rows = [{
      name: state.name + ' (ВЫ)',
      weapon: window.WEAPONS[state.weaponId].short,
      kills: state.kills,
      deaths: state.deaths,
      me: true
    }];
    remotes.forEach((p) => {
      rows.push({
        name: p.name,
        weapon: (window.WEAPONS[p.weapon] || window.WEAPONS.rifle).short,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        me: false
      });
    });
    rows.sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    dom.sbSub.textContent = config.mode === 'multiplayer'
      ? `Комната ${config.room} · ${map.name} · Supabase Realtime`
      : `Полигон · ${map.name}`;
    dom.sbRows.innerHTML = rows.map((r) => {
      const kd = r.deaths === 0 ? r.kills.toFixed(1) : (r.kills / r.deaths).toFixed(2);
      return `<div class="sb-row${r.me ? ' me' : ''}">` +
        `<span>${escapeHtml(r.name)}</span>` +
        `<span>${escapeHtml(r.weapon)}</span>` +
        `<span>${r.kills}</span>` +
        `<span>${r.deaths}</span>` +
        `<span>${kd}</span></div>`;
    }).join('');
  }

  function switchWeapon(id) {
    if (!window.WEAPONS[id] || state.weaponId === id) return;
    state.weaponId = id;
    state.reloading = false;
    state.reloadElapsed = 0;
    state.ads = false;
    dom.reloadTrack.classList.add('hidden');
    dom.btnAds.classList.remove('active');
    updateHudAmmo();
    haptic(14);
  }

  function startReload() {
    if (state.reloading || !state.alive) return;
    const w = window.WEAPONS[state.weaponId];
    const a = state.ammo[state.weaponId];
    if (a.mag >= w.magSize || a.res <= 0) return;
    state.reloading = true;
    state.reloadElapsed = 0;
    state.ads = false;
    dom.btnAds.classList.remove('active');
    dom.reloadTrack.classList.remove('hidden');
    window.SoundFX.reload();
    showBanner('ПЕРЕЗАРЯДКА...', w.reloadTime);
  }

  function triggerHitmarker(headshot) {
    dom.hitmarker.classList.remove('hidden');
    dom.hitmarker.classList.toggle('headshot', !!headshot);
    state.hitmarkerTimer = 0.16;
    window.SoundFX.hit(headshot);
  }

  // Supabase Realtime Multiplayer Client
  let net = null;
  function buildPresence() {
    return {
      id: state.id,
      name: state.name,
      color: state.colorHex,
      weapon: state.weaponId,
      kills: state.kills,
      deaths: state.deaths
    };
  }

  function upsertRemote(id, data) {
    if (!id || id === state.id) return;
    let p = remotes.get(id);
    if (!p) {
      p = {
        id,
        name: data.name || 'PLAYER',
        color: data.color || '#FF3B5C',
        rgb: hexToRgb01(data.color || '#FF3B5C'),
        x: data.x || 0, y: data.y || 0, z: data.z || 0,
        tx: data.x || 0, ty: data.y || 0, tz: data.z || 0,
        yaw: data.yaw || 0, tyaw: data.yaw || 0,
        pitch: data.pitch || 0,
        weapon: data.weapon || 'rifle',
        hp: data.hp !== undefined ? data.hp : 100,
        alive: data.alive !== undefined ? data.alive : true,
        moving: false,
        kills: data.kills || 0,
        deaths: data.deaths || 0,
        animSeed: Math.random() * 6.28,
        lastSeen: performance.now()
      };
      remotes.set(id, p);
      updatePlayersCount();
    } else {
      if (data.name) p.name = data.name;
      if (data.color) { p.color = data.color; p.rgb = hexToRgb01(data.color); }
      if (data.x !== undefined) { p.tx = data.x; p.ty = data.y; p.tz = data.z; }
      if (data.yaw !== undefined) p.tyaw = data.yaw;
      if (data.pitch !== undefined) p.pitch = data.pitch;
      if (data.weapon) p.weapon = data.weapon;
      if (data.hp !== undefined) p.hp = data.hp;
      if (data.alive !== undefined) p.alive = data.alive;
      if (data.moving !== undefined) p.moving = data.moving;
      if (data.kills !== undefined) p.kills = data.kills;
      if (data.deaths !== undefined) p.deaths = data.deaths;
      p.lastSeen = performance.now();
    }
  }

  function initNetworking() {
    dom.roomCode.textContent = config.room;
    if (config.mode !== 'multiplayer') {
      dom.modeLabel.textContent = 'ПОЛИГОН · 3D';
      dom.netDot.className = 'status-dot offline';
      updatePlayersCount();
      return;
    }

    dom.modeLabel.textContent = 'SUPABASE LIVE';
    net = window.SupabaseNet.createClient(config, {
      onStatus(status, text) {
        dom.netDot.className = 'status-dot ' + status;
        dom.modeLabel.textContent = text;
      },
      onPing(ms) {
        dom.ping.textContent = `· ${ms}ms`;
      },
      onPresenceState(payload) {
        Object.keys(payload).forEach((key) => {
          const metas = payload[key] && payload[key].metas;
          if (metas && metas[0]) upsertRemote(key, metas[0]);
        });
        updatePlayersCount();
      },
      onPresenceDiff(diff) {
        if (diff.joins) {
          Object.keys(diff.joins).forEach((key) => {
            const metas = diff.joins[key] && diff.joins[key].metas;
            if (metas && metas[0]) {
              upsertRemote(key, metas[0]);
              if (key !== state.id) showBanner(`${metas[0].name || 'Игрок'} вошёл в бой`, 2.0);
            }
          });
        }
        if (diff.leaves) {
          Object.keys(diff.leaves).forEach((key) => {
            if (remotes.has(key)) {
              remotes.delete(key);
              updatePlayersCount();
            }
          });
        }
      },
      onBroadcast(eventName, payload) {
        if (!payload || payload.id === state.id) return;
        if (eventName === 'state') {
          upsertRemote(payload.id, payload);
        } else if (eventName === 'shoot') {
          const w = window.WEAPONS[payload.weapon] || window.WEAPONS.rifle;
          spawnBeam(payload.ox, payload.oy, payload.oz, payload.hx, payload.hy, payload.hz, w.color, w.beamWidth, 0.14);
          spawnSparks(payload.hx, payload.hy, payload.hz, w.color, 5);
        } else if (eventName === 'hit' && payload.target === state.id && state.alive) {
          applyIncomingDamage(payload.dmg, payload.from, payload.fromName, payload.weapon, payload.headshot, payload.ox, payload.oz);
        } else if (eventName === 'kill') {
          const w = window.WEAPONS[payload.weapon] || window.WEAPONS.rifle;
          addKillFeed(payload.killerName, payload.victimName, w.short, payload.headshot);
          if (payload.killer === state.id) {
            state.kills += 1;
            state.streak += 1;
            window.SoundFX.kill();
            haptic(45);
            showBanner(payload.headshot ? 'ХЕДШОТ · +1 ФРАГ' : 'ФРАГ +1', 1.4);
            updateHudVitals();
            if (net) {
              net.trackPresence(buildPresence());
              net.syncLeaderboardStats(state.name, state.kills, state.deaths);
            }
          }
        }
      }
    });
    net.connect(buildPresence());
  }

  function applyIncomingDamage(dmg, fromId, fromName, weaponId, headshot, ox, oz) {
    let rem = dmg;
    if (state.shield > 0) {
      const absorbed = Math.min(state.shield, rem);
      state.shield -= absorbed;
      rem -= absorbed;
    }
    state.hp = Math.max(0, state.hp - rem);
    state.damageFlash = 0.75;
    window.SoundFX.hurt();
    haptic(35);

    // Directional hit indicator angle
    if (ox !== undefined && oz !== undefined) {
      const angToAttacker = Math.atan2(ox - state.pos.x, oz - state.pos.z);
      const rel = angToAttacker + state.yaw;
      dom.hitDirRing.style.borderTopColor = '#ff3b5c';
      dom.hitDirRing.style.transform = `rotate(${rel}rad)`;
      dom.hitDirRing.style.opacity = '0.95';
      setTimeout(() => { dom.hitDirRing.style.opacity = '0'; }, 320);
    }

    if (state.hp <= 0) {
      state.alive = false;
      state.deaths += 1;
      state.streak = 0;
      state.respawnTimer = 3.0;
      state.ads = false;
      dom.respawnKiller.textContent = fromName || 'Противник';
      dom.respawnCd.textContent = '3';
      dom.respawnModal.classList.remove('hidden');
      if (net) {
        net.broadcast('kill', {
          killer: fromId,
          killerName: fromName || 'Игрок',
          victim: state.id,
          victimName: state.name,
          weapon: weaponId,
          headshot
        });
        net.trackPresence(buildPresence());
        net.syncLeaderboardStats(state.name, state.kills, state.deaths);
      }
    }
    updateHudVitals();
  }

  // Firing logic (instant hitscan with spread, headshot detection, tracers & Supabase broadcast)
  function fireWeapon() {
    if (!state.alive || state.reloading || state.fireCooldown > 0) return;
    const w = window.WEAPONS[state.weaponId];
    const a = state.ammo[state.weaponId];
    if (a.mag <= 0) {
      startReload();
      return;
    }

    a.mag -= 1;
    state.fireCooldown = 60 / w.rpm;
    state.recoil = Math.min(0.24, state.recoil + w.recoil);
    state.muzzleTimer = 0.055;
    state.pitch = Math.min(1.36, state.pitch + w.recoil * 0.42);

    window.SoundFX.shoot(w.id);
    haptic(w.id === 'rifle' ? 14 : 32);
    updateHudAmmo();

    const eyeX = state.pos.x;
    const eyeY = state.pos.y + 1.56;
    const eyeZ = state.pos.z;

    const cp = Math.cos(state.pitch);
    const baseFx = -Math.sin(state.yaw) * cp;
    const baseFy = Math.sin(state.pitch);
    const baseFz = -Math.cos(state.yaw) * cp;
    const rightX = Math.cos(state.yaw);
    const rightZ = -Math.sin(state.yaw);

    // Muzzle start slightly offset right/down for 3D beam readability
    const muzX = eyeX + rightX * 0.22 + baseFx * 0.55;
    const muzY = eyeY - 0.14 + baseFy * 0.55;
    const muzZ = eyeZ + rightZ * 0.22 + baseFz * 0.55;

    const spreadVal = state.ads ? w.adsSpread : w.spread;
    let anyHit = false;
    let anyHead = false;

    for (let p = 0; p < w.pellets; p++) {
      let dx = baseFx + (Math.random() - 0.5) * spreadVal * 2;
      let dy = baseFy + (Math.random() - 0.5) * spreadVal * 2;
      let dz = baseFz + (Math.random() - 0.5) * spreadVal * 2;
      const dLen = Math.hypot(dx, dy, dz) || 1;
      dx /= dLen; dy /= dLen; dz /= dLen;

      let bestDist = window.ArenaMaps.raycastWorld(map, eyeX, eyeY, eyeZ, dx, dy, dz, w.range);
      let hitTarget = null;
      let hitHead = false;
      let hitDrone = null;

      // Test remote players
      remotes.forEach((rp) => {
        if (!rp.alive) return;
        const headT = window.ArenaMaps.raySphereHit(eyeX, eyeY, eyeZ, dx, dy, dz, rp.x, rp.y + 1.66, rp.z, 0.34, bestDist);
        if (headT > 0 && headT < bestDist) {
          bestDist = headT;
          hitTarget = rp;
          hitHead = true;
        } else {
          const bodyBox = {
            minX: rp.x - 0.42, maxX: rp.x + 0.42,
            minY: rp.y, maxY: rp.y + 1.48,
            minZ: rp.z - 0.42, maxZ: rp.z + 0.42
          };
          const bodyT = window.ArenaMaps.rayBoxHit(eyeX, eyeY, eyeZ, dx, dy, dz, bodyBox, bestDist);
          if (bodyT > 0 && bodyT < bestDist) {
            bestDist = bodyT;
            hitTarget = rp;
            hitHead = false;
          }
        }
      });

      // Test training drones
      for (let i = 0; i < drones.length; i++) {
        const dr = drones[i];
        if (!dr.alive) continue;
        const t = window.ArenaMaps.raySphereHit(eyeX, eyeY, eyeZ, dx, dy, dz, dr.x, dr.y, dr.z, 0.68, bestDist);
        if (t > 0 && t < bestDist) {
          bestDist = t;
          hitDrone = dr;
          hitTarget = null;
          hitHead = (Math.abs((eyeY + dy * t) - dr.y) < 0.26);
        }
      }

      const hx = eyeX + dx * bestDist;
      const hy = eyeY + dy * bestDist;
      const hz = eyeZ + dz * bestDist;

      spawnBeam(muzX, muzY, muzZ, hx, hy, hz, w.color, w.beamWidth, w.id === 'railgun' ? 0.24 : 0.11);
      spawnSparks(hx, hy, hz, hitTarget || hitDrone ? [1.0, 0.3, 0.4] : w.color, hitTarget || hitDrone ? 10 : 5);

      if (p === 0 && net && net.isJoined()) {
        net.broadcast('shoot', {
          id: state.id, weapon: w.id,
          ox: muzX, oy: muzY, oz: muzZ,
          hx, hy, hz
        });
      }

      if (hitTarget) {
        anyHit = true;
        if (hitHead) anyHead = true;
        const dmg = Math.round(w.damage * (hitHead ? w.headMult : 1));
        if (net && net.isJoined()) {
          net.broadcast('hit', {
            id: state.id,
            from: state.id,
            fromName: state.name,
            target: hitTarget.id,
            dmg,
            headshot: hitHead,
            weapon: w.id,
            ox: state.pos.x,
            oz: state.pos.z
          });
        }
      } else if (hitDrone) {
        anyHit = true;
        if (hitHead) anyHead = true;
        const dmg = Math.round(w.damage * (hitHead ? w.headMult : 1));
        hitDrone.hp -= dmg;
        hitDrone.hitFlash = 0.12;
        if (hitDrone.hp <= 0) {
          hitDrone.alive = false;
          hitDrone.respawnAt = performance.now() + 2800;
          spawnSparks(hitDrone.x, hitDrone.y, hitDrone.z, [0.0, 0.95, 1.0], 18);
          state.kills += 1;
          state.streak += 1;
          window.SoundFX.kill();
          haptic(40);
          addKillFeed(state.name, hitDrone.name, w.short, hitHead);
          showBanner(hitHead ? 'КРИТ · ДРОН УНИЧТОЖЕН' : 'ДРОН УНИЧТОЖЕН', 1.1);
          updateHudVitals();
        }
      }
    }

    if (anyHit) triggerHitmarker(anyHead);
    if (a.mag === 0 && a.res > 0) startReload();
  }

  // Input state (Multi-touch Pointer Events + Keyboard/Mouse)
  const input = {
    moveX: 0,
    moveZ: 0,
    firing: false,
    jumpQueued: false,
    keys: new Set(),
    joyPtrId: null,
    joyOriginX: 0,
    joyOriginY: 0,
    lookPtrId: null,
    lookLastX: 0,
    lookLastY: 0,
    firePtrId: null,
    fireLastX: 0,
    fireLastY: 0
  };

  function applyLookDelta(dx, dy) {
    const sens = 0.0044 * (config.sensitivity || 1.0) * (state.ads ? 0.52 : 1.0);
    state.yaw -= dx * sens;
    const inv = config.invertY ? 1 : -1;
    state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch + dy * sens * inv));
  }

  // Left Virtual Joystick
  dom.moveZone.addEventListener('pointerdown', (e) => {
    if (input.joyPtrId !== null) return;
    input.joyPtrId = e.pointerId;
    dom.moveZone.setPointerCapture(e.pointerId);
    input.joyOriginX = e.clientX;
    input.joyOriginY = e.clientY;
    dom.joyBase.style.left = e.clientX + 'px';
    dom.joyBase.style.top = e.clientY + 'px';
    dom.joyBase.classList.remove('hidden');
    dom.moveHint.classList.add('hidden');
    dom.joyKnob.style.transform = 'translate(0px, 0px)';
  });

  dom.moveZone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== input.joyPtrId) return;
    const maxR = 46;
    let dx = e.clientX - input.joyOriginX;
    let dy = e.clientY - input.joyOriginY;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    dom.joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    input.moveX = dx / maxR;
    input.moveZ = -dy / maxR; // up on screen = forward (+1)
  });

  function endJoy(e) {
    if (e.pointerId !== input.joyPtrId) return;
    input.joyPtrId = null;
    input.moveX = 0;
    input.moveZ = 0;
    dom.joyBase.classList.add('hidden');
  }
  dom.moveZone.addEventListener('pointerup', endJoy);
  dom.moveZone.addEventListener('pointercancel', endJoy);

  // Right Look Zone
  dom.lookZone.addEventListener('pointerdown', (e) => {
    if (input.lookPtrId !== null) return;
    input.lookPtrId = e.pointerId;
    dom.lookZone.setPointerCapture(e.pointerId);
    input.lookLastX = e.clientX;
    input.lookLastY = e.clientY;
    dom.lookHint.classList.add('hidden');
  });

  dom.lookZone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== input.lookPtrId) return;
    applyLookDelta(e.clientX - input.lookLastX, e.clientY - input.lookLastY);
    input.lookLastX = e.clientX;
    input.lookLastY = e.clientY;
  });

  function endLook(e) {
    if (e.pointerId !== input.lookPtrId) return;
    input.lookPtrId = null;
  }
  dom.lookZone.addEventListener('pointerup', endLook);
  dom.lookZone.addEventListener('pointercancel', endLook);

  // Fire button (supports drag-to-aim while firing!)
  dom.btnFire.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    input.firePtrId = e.pointerId;
    dom.btnFire.setPointerCapture(e.pointerId);
    input.fireLastX = e.clientX;
    input.fireLastY = e.clientY;
    input.firing = true;
    dom.btnFire.classList.add('active');
    fireWeapon();
  });

  dom.btnFire.addEventListener('pointermove', (e) => {
    if (e.pointerId !== input.firePtrId) return;
    applyLookDelta(e.clientX - input.fireLastX, e.clientY - input.fireLastY);
    input.fireLastX = e.clientX;
    input.fireLastY = e.clientY;
  });

  function endFire(e) {
    if (e.pointerId !== input.firePtrId) return;
    input.firePtrId = null;
    input.firing = false;
    dom.btnFire.classList.remove('active');
  }
  dom.btnFire.addEventListener('pointerup', endFire);
  dom.btnFire.addEventListener('pointercancel', endFire);

  dom.btnJump.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    input.jumpQueued = true;
    haptic(12);
  });

  dom.btnAds.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    state.ads = !state.ads;
    dom.btnAds.classList.toggle('active', state.ads);
    haptic(10);
  });

  dom.btnReload.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    startReload();
  });

  document.querySelectorAll('.weapon-slot').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      switchWeapon(btn.dataset.weapon);
    });
  });

  dom.btnScoreboard.addEventListener('click', () => {
    state.scoreboardOpen = !state.scoreboardOpen;
    dom.sbModal.classList.toggle('hidden', !state.scoreboardOpen);
    if (state.scoreboardOpen) renderScoreboard();
  });

  dom.btnCloseSb.addEventListener('click', () => {
    state.scoreboardOpen = false;
    dom.sbModal.classList.add('hidden');
  });

  dom.btnLobby.addEventListener('click', () => {
    if (net) net.disconnect();
    if (window.AndroidBridge && window.AndroidBridge.exitToLobby) {
      window.AndroidBridge.exitToLobby();
    }
  });

  // Keyboard support (for desktop / ChromeOS / emulator keyboards)
  window.addEventListener('keydown', (e) => {
    input.keys.add(e.code);
    if (e.code === 'Space') input.jumpQueued = true;
    if (e.code === 'KeyR') startReload();
    if (e.code === 'Digit1') switchWeapon('rifle');
    if (e.code === 'Digit2') switchWeapon('shotgun');
    if (e.code === 'Digit3') switchWeapon('railgun');
    if (e.code === 'Tab') {
      e.preventDefault();
      state.scoreboardOpen = true;
      dom.sbModal.classList.remove('hidden');
      renderScoreboard();
    }
  });

  window.addEventListener('keyup', (e) => {
    input.keys.delete(e.code);
    if (e.code === 'Tab') {
      state.scoreboardOpen = false;
      dom.sbModal.classList.add('hidden');
    }
  });

  // Draw floating player nameplates & HP bars on 2D overlay canvas
  function renderOverlay(vp) {
    const w = overlayCanvas.clientWidth;
    const h = overlayCanvas.clientHeight;
    if (overlayCanvas.width !== w || overlayCanvas.height !== h) {
      overlayCanvas.width = w;
      overlayCanvas.height = h;
    }
    octx.clearRect(0, 0, w, h);

    remotes.forEach((p) => {
      if (!p.alive) return;
      const pt = engine.projectPoint(vp, p.x, p.y + 2.15, p.z, w, h);
      if (!pt || pt.dist > 48) return;
      octx.font = '700 11px ui-monospace, monospace';
      octx.textAlign = 'center';
      octx.fillStyle = 'rgba(8, 12, 22, 0.72)';
      octx.fillRect(pt.x - 38, pt.y - 18, 76, 22);
      octx.fillStyle = '#eef6ff';
      octx.fillText(p.name.slice(0, 12), pt.x, pt.y - 5);
      octx.fillStyle = 'rgba(255,255,255,0.18)';
      octx.fillRect(pt.x - 28, pt.y - 1, 56, 3);
      octx.fillStyle = '#ff3b5c';
      octx.fillRect(pt.x - 28, pt.y - 1, 56 * Math.max(0, Math.min(1, p.hp / 100)), 3);
    });

    drones.forEach((d) => {
      if (!d.alive) return;
      const pt = engine.projectPoint(vp, d.x, d.y + 0.95, d.z, w, h);
      if (!pt || pt.dist > 44) return;
      octx.fillStyle = 'rgba(8,12,22,0.7)';
      octx.fillRect(pt.x - 24, pt.y - 6, 48, 5);
      octx.fillStyle = '#00e5ff';
      octx.fillRect(pt.x - 24, pt.y - 6, 48 * Math.max(0, d.hp / d.maxHp), 5);
    });
  }

  // Draw tactical radar minimap
  function renderMinimap() {
    const size = miniCanvas.width;
    const half = size * 0.5;
    const scale = (size * 0.44) / map.halfSize;

    mctx.clearRect(0, 0, size, size);
    mctx.fillStyle = 'rgba(8, 13, 24, 0.9)';
    mctx.fillRect(0, 0, size, size);

    // Subtle radar rings
    mctx.strokeStyle = 'rgba(0, 229, 255, 0.14)';
    mctx.lineWidth = 1;
    mctx.beginPath();
    mctx.arc(half, half, half * 0.45, 0, Math.PI * 2);
    mctx.arc(half, half, half * 0.85, 0, Math.PI * 2);
    mctx.stroke();

    function worldToMini(wx, wz) {
      const rx = wx - state.pos.x;
      const rz = wz - state.pos.z;
      const c = Math.cos(state.yaw);
      const s = Math.sin(state.yaw);
      // Forward (-Z in local yaw=0) maps to UP (-Y on canvas)
      const mx = rx * c - rz * s;
      const mz = rx * s + rz * c;
      return [half + mx * scale, half + mz * scale];
    }

    // Draw major walls/obstacles
    mctx.fillStyle = 'rgba(130, 165, 210, 0.28)';
    for (let i = 5; i < map.boxes.length; i++) {
      const b = map.boxes[i];
      if (!b.solid || b.sy < 0.8) continue;
      const [px, py] = worldToMini(b.cx, b.cz);
      const rw = Math.max(3, b.sx * scale);
      const rh = Math.max(3, b.sz * scale);
      mctx.fillRect(px - rw * 0.5, py - rh * 0.5, rw, rh);
    }

    // Jump pads
    mctx.fillStyle = '#00e5ff';
    map.jumpPads.forEach((pad) => {
      const [px, py] = worldToMini(pad.x, pad.z);
      mctx.beginPath();
      mctx.arc(px, py, 2.5, 0, Math.PI * 2);
      mctx.fill();
    });

    // Remote players or drones
    mctx.fillStyle = '#ff3b5c';
    remotes.forEach((p) => {
      if (!p.alive) return;
      const [px, py] = worldToMini(p.x, p.z);
      mctx.beginPath();
      mctx.arc(px, py, 3.6, 0, Math.PI * 2);
      mctx.fill();
    });
    drones.forEach((d) => {
      if (!d.alive) return;
      const [px, py] = worldToMini(d.x, d.z);
      mctx.beginPath();
      mctx.arc(px, py, 3.2, 0, Math.PI * 2);
      mctx.fill();
    });

    // Self arrow at center
    mctx.fillStyle = '#00e676';
    mctx.beginPath();
    mctx.moveTo(half, half - 6);
    mctx.lineTo(half - 4.5, half + 4.5);
    mctx.lineTo(half + 4.5, half + 4.5);
    mctx.closePath();
    mctx.fill();
  }

  // Expose Android lifecycle & BackHandler bridge
  window.GameAPI = {
    handleBack() {
      if (state.scoreboardOpen) {
        state.scoreboardOpen = false;
        dom.sbModal.classList.add('hidden');
        return true;
      }
      if (net) net.disconnect();
      return false;
    },
    shutdown() {
      if (net) net.disconnect();
    }
  };

  spawnPlayer();
  initDrones();
  initNetworking();

  let lastTs = performance.now();
  let totalTime = 0;

  function tick(now) {
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    totalTime += dt;

    // 1. Movement & Physics
    let moveFwd = input.moveZ;
    let moveRight = input.moveX;
    if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) moveFwd += 1;
    if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) moveFwd -= 1;
    if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) moveRight += 1;
    if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) moveRight -= 1;

    const mag = Math.hypot(moveFwd, moveRight);
    if (mag > 1) { moveFwd /= mag; moveRight /= mag; }

    const isMoving = mag > 0.08 && state.alive;
    if (state.alive) {
      const speed = state.ads ? 5.6 : 9.4;
      const fx = -Math.sin(state.yaw);
      const fz = -Math.cos(state.yaw);
      const rx = Math.cos(state.yaw);
      const rz = -Math.sin(state.yaw);

      const targetVx = (fx * moveFwd + rx * moveRight) * speed;
      const targetVz = (fz * moveFwd + rz * moveRight) * speed;
      const accel = state.grounded ? 14 : 4.5;
      state.vel.x += (targetVx - state.vel.x) * Math.min(1, accel * dt);
      state.vel.z += (targetVz - state.vel.z) * Math.min(1, accel * dt);

      if (input.jumpQueued && state.grounded) {
        state.vel.y = 8.9;
        state.grounded = false;
      }
      input.jumpQueued = false;

      state.vel.y -= 23.0 * dt;
      const moveRes = window.ArenaMaps.movePlayer(map, state.pos, state.vel, dt);
      state.grounded = moveRes.grounded;
      if (moveRes.boosted) {
        window.SoundFX.jumpPad();
        haptic(28);
        showBanner('БАТУТ · ПОЛЁТ', 0.9);
      }

      if (isMoving && state.grounded) {
        state.bobPhase += dt * 10.5;
        state.stepTimer -= dt;
        if (state.stepTimer <= 0) {
          window.SoundFX.step();
          state.stepTimer = 0.36;
        }
      }

      // Pickups
      for (let i = 0; i < map.pickups.length; i++) {
        const pk = map.pickups[i];
        if (!pk.active) {
          if (now >= pk.respawnAt) pk.active = true;
          continue;
        }
        const dx = state.pos.x - pk.x;
        const dy = (state.pos.y + 0.9) - pk.y;
        const dz = state.pos.z - pk.z;
        if (dx * dx + dy * dy + dz * dz < 2.2) {
          if (pk.type === 'health' && (state.hp < 100 || state.shield < 50)) {
            state.hp = Math.min(100, state.hp + 40);
            state.shield = Math.min(50, state.shield + 25);
            pk.active = false;
            pk.respawnAt = now + 12000;
            window.SoundFX.pickup();
            haptic(20);
            showBanner('+40 HP · +25 ЩИТ', 1.2);
            updateHudVitals();
          } else if (pk.type === 'ammo') {
            const w = window.WEAPONS[state.weaponId];
            state.ammo[state.weaponId].res = Math.min(w.reserveMax, state.ammo[state.weaponId].res + w.magSize * 2);
            pk.active = false;
            pk.respawnAt = now + 10000;
            window.SoundFX.pickup();
            haptic(18);
            showBanner('+БОЕПРИПАСЫ', 1.2);
            updateHudAmmo();
          }
        }
      }

      // Auto-fire
      if (state.fireCooldown > 0) state.fireCooldown -= dt;
      if (input.firing && window.WEAPONS[state.weaponId].auto) {
        fireWeapon();
      }

      // Reload progress
      if (state.reloading) {
        const w = window.WEAPONS[state.weaponId];
        state.reloadElapsed += dt;
        const pct = Math.min(1, state.reloadElapsed / w.reloadTime);
        dom.reloadBar.style.width = (pct * 100) + '%';
        if (pct >= 1) {
          const a = state.ammo[state.weaponId];
          const need = w.magSize - a.mag;
          const take = Math.min(need, a.res);
          a.mag += take;
          a.res -= take;
          state.reloading = false;
          dom.reloadTrack.classList.add('hidden');
          updateHudAmmo();
        }
      }
    } else {
      // Respawn countdown
      state.respawnTimer -= dt;
      dom.respawnCd.textContent = String(Math.max(1, Math.ceil(state.respawnTimer)));
      if (state.respawnTimer <= 0) spawnPlayer();
    }

    // 2. Smooth weapon recoil, ADS FOV & Crosshair spread
    state.recoil = Math.max(0, state.recoil - dt * 0.9);
    state.muzzleTimer = Math.max(0, state.muzzleTimer - dt);
    const targetAds = state.ads ? 1 : 0;
    state.adsBlend += (targetAds - state.adsBlend) * Math.min(1, dt * 12);
    const wDef = window.WEAPONS[state.weaponId];
    const targetFov = 76 + (wDef.adsFov - 76) * state.adsBlend;
    state.fov += (targetFov - state.fov) * Math.min(1, dt * 14);

    const showScope = wDef.scope && state.adsBlend > 0.72;
    dom.scopeOverlay.classList.toggle('hidden', !showScope);
    dom.crosshair.classList.toggle('hidden', showScope);
    const chGap = 6 + state.recoil * 95 + (isMoving ? 4 : 0) - state.adsBlend * 3;
    dom.crosshair.style.setProperty('--gap', Math.max(3, chGap) + 'px');

    if (state.hitmarkerTimer > 0) {
      state.hitmarkerTimer -= dt;
      if (state.hitmarkerTimer <= 0) dom.hitmarker.classList.add('hidden');
    }
    if (state.damageFlash > 0) {
      state.damageFlash = Math.max(0, state.damageFlash - dt * 2.2);
      dom.damageVig.style.opacity = String(state.damageFlash);
    }
    if (state.bannerTimer > 0) {
      state.bannerTimer -= dt;
      if (state.bannerTimer <= 0) dom.centerBanner.classList.add('hidden');
    }

    // 3. Interpolate remote players
    const remoteList = [];
    remotes.forEach((p, id) => {
      if (now - p.lastSeen > 15000) {
        remotes.delete(id);
        updatePlayersCount();
        return;
      }
      const lerp = Math.min(1, dt * 14);
      p.x += (p.tx - p.x) * lerp;
      p.y += (p.ty - p.y) * lerp;
      p.z += (p.tz - p.z) * lerp;
      let diffYaw = p.tyaw - p.yaw;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
      p.yaw += diffYaw * lerp;
      remoteList.push(p);
    });

    // 4. Update training drones
    for (let i = 0; i < drones.length; i++) {
      const d = drones[i];
      if (d.hitFlash > 0) d.hitFlash = Math.max(0, d.hitFlash - dt);
      if (!d.alive) {
        if (now >= d.respawnAt) {
          d.alive = true;
          d.hp = d.maxHp;
        }
        continue;
      }
      d.t += dt * d.speed;
      const u = 0.5 + 0.5 * Math.sin(d.t * Math.PI);
      d.x = d.ax + (d.bx - d.ax) * u;
      d.z = d.az + (d.bz - d.az) * u;
    }

    // 5. Update tracers & sparks
    for (let i = beams.length - 1; i >= 0; i--) {
      beams[i].life -= dt;
      if (beams[i].life <= 0) beams.splice(i, 1);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
      pt.vy -= 18 * dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    // 6. Broadcast multiplayer state at 20Hz
    if (net && net.isJoined() && now - state.lastSyncAt >= 50) {
      state.lastSyncAt = now;
      net.broadcast('state', {
        id: state.id,
        name: state.name,
        color: state.colorHex,
        x: Math.round(state.pos.x * 100) / 100,
        y: Math.round(state.pos.y * 100) / 100,
        z: Math.round(state.pos.z * 100) / 100,
        yaw: Math.round(state.yaw * 1000) / 1000,
        pitch: Math.round(state.pitch * 1000) / 1000,
        weapon: state.weaponId,
        hp: Math.round(state.hp),
        alive: state.alive,
        moving: isMoving,
        kills: state.kills,
        deaths: state.deaths
      });
    }

    // 7. Render 3D WebGL scene + 2D overlay + Minimap
    const cp = Math.cos(state.pitch);
    const cam = {
      x: state.pos.x,
      y: state.pos.y + 1.56 + (isMoving && state.grounded ? Math.sin(state.bobPhase) * 0.045 : 0),
      z: state.pos.z,
      fx: -Math.sin(state.yaw) * cp,
      fy: Math.sin(state.pitch),
      fz: -Math.cos(state.yaw) * cp
    };

    const vp = engine.render({
      map,
      cam,
      fov: state.fov,
      time: totalTime,
      remotes: remoteList,
      drones,
      beams,
      particles,
      alive: state.alive,
      weaponId: state.weaponId,
      recoil: state.recoil,
      bobX: isMoving ? Math.cos(state.bobPhase * 0.5) * 0.014 : 0,
      bobY: isMoving ? Math.abs(Math.sin(state.bobPhase)) * -0.016 : 0,
      adsBlend: state.adsBlend,
      reloadProgress: state.reloading ? Math.sin(Math.min(1, state.reloadElapsed / wDef.reloadTime) * Math.PI) : 0,
      muzzleTimer: state.muzzleTimer
    });

    renderOverlay(vp);
    renderMinimap();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
