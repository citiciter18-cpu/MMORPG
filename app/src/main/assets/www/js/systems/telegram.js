/* ==========================================================================
   BladeRealm — Telegram Stars (XTR) Donate Shop (Exclusive: Admin Bot)
   Includes real Telegram.WebApp.openInvoice() + Admin Bot Companion AI
   ========================================================================== */

window.TelegramStars = (function () {
  const LS_API_KEY = 'bladerealm_tg_api_url';
  let purchaseInFlight = false;
  let queryApiUrl = '';

  // Exclusive Telegram Stars product: Admin Bot Companion
  const DONATE_PACKS = [
    {
      id: 'admin_bot',
      title: 'Админ Бот (Полные права + Спутник)',
      stars: 250,
      rarity: 'legendary',
      iconKey: 'admin_bot',
      desc: 'Полная Админ-Панель + элитный Спутник T8.4! Выдавайте себе любое оружие, броню и инструменты T1–T8 с любыми чарами, золото, уровни, маунтов; включайте Бессмертие, Ваншот и Супер-скорость, телепортируйтесь к боссам, очищайте мобов и пишите в чат от [АДМИН].',
      contentsText: 'Админ-Панель (выдача всего) • Бессмертие / Ваншот / Скорость x2.5 • Спутник-Страж T8.4 • Авто-лут и Хил',
      grant() {
        const prev = window.GameState.adminBot || {};
        window.GameState.adminBot = Object.assign({
          owned: true,
          summoned: true,
          mode: 'combat',
          name: 'Админ-Страж',
          godMode: false,
          oneHit: false,
          superSpeed: false,
          powerMult: 1
        }, prev, { owned: true, summoned: true });
        syncAdminBotEntity(true);
      }
    }
  ];

  const PACK_BY_ID = {};
  DONATE_PACKS.forEach(pk => { PACK_BY_ID[pk.id] = pk; });

  // Live Runtime Entity for the Admin Bot Companion
  const adminEntity = {
    id: 'admin_bot_companion',
    isBot: false,
    isPlayer: false,
    inParty: true,
    isAdminBot: true,
    name: 'Админ-Страж',
    clanTag: 'АДМИН',
    level: 99,
    x: 3920,
    y: 3040,
    facingX: 1,
    state: 'idle',
    hp: 99999,
    maxHp: 99999,
    mp: 9999,
    maxMp: 9999,
    def: 200,
    attackTimer: 0,
    attackDuration: 0.25,
    attackCooldown: 0,
    skillTimer: 0,
    hurtTimer: 0,
    healTimer: 0,
    aoeTimer: 0,
    lootTimer: 0,
    showAura: true,
    mountedId: null,
    appearance: { hair: '#fef08a', cloak: '#7c3aed', armor: '#1e1b4b', skin: '#f5cfa0', eye: '#38bdf8' },
    equipment: {}
  };

  function syncAdminBotEntity(teleportToPlayer) {
    const ab = window.GameState && window.GameState.adminBot;
    const p = window.GameState && window.GameState.player;
    if (!ab || !p) return;
    adminEntity.name = ab.name || 'Админ-Страж';
    adminEntity.level = Math.max(10, p.level + 8);
    if (!adminEntity.equipment.weapon && window.GameData) {
      adminEntity.equipment.weapon = window.GameData.createWeaponItem('legendary_sword', 'legendary', 30, 5, 8, 4);
      adminEntity.equipment.armor = window.GameData.createArmorItem('armor_abyss', 'legendary', 30, 3, 8, 3);
      adminEntity.equipment.cloak = window.GameData.createArmorItem('cloak_wings', 'legendary', 30, 2, 8, 2);
      adminEntity.equipment.helmet = window.GameData.createArmorItem('helm_dragon', 'legendary', 30, 2, 8, 2);
    }
    if (teleportToPlayer) {
      adminEntity.x = p.x - 42;
      adminEntity.y = p.y + 18;
    }
  }

  function updateAdminBot(dt) {
    const ab = window.GameState && window.GameState.adminBot;
    const p = window.GameState && window.GameState.player;
    if (!ab || !ab.owned || !ab.summoned || !p || p.state === 'death') return;
    if (!adminEntity.equipment.weapon) syncAdminBotEntity(true);

    adminEntity.name = ab.name || 'Админ-Страж';
    adminEntity.level = Math.max(10, p.level + 8);
    if (adminEntity.attackTimer > 0) adminEntity.attackTimer -= dt;
    if (adminEntity.attackCooldown > 0) adminEntity.attackCooldown -= dt;
    if (adminEntity.skillTimer > 0) adminEntity.skillTimer -= dt;
    if (adminEntity.healTimer > 0) adminEntity.healTimer -= dt;
    if (adminEntity.aoeTimer > 0) adminEntity.aoeTimer -= dt;
    if (adminEntity.lootTimer > 0) adminEntity.lootTimer -= dt;

    const distP = Math.hypot(p.x - adminEntity.x, p.y - adminEntity.y);
    if (distP > 440) {
      adminEntity.x = p.x - 40;
      adminEntity.y = p.y + 18;
      if (window.Combat) window.Combat.addParticles(adminEntity.x, adminEntity.y, '#fbbf24', 12, 95);
    }

    const inFairPvp = Boolean(window.GameState.activeDuelBotId) ||
      (window.GameState.pvpEnabled && !window.World.getBiomeAt(p.x, p.y).safe);

    // 1) Auto-Loot nearby drops in combat & support modes
    if (ab.mode !== 'passive' && adminEntity.lootTimer <= 0 && window.Combat) {
      adminEntity.lootTimer = 1.4;
      window.Combat.lootNearby(260);
    }

    // 2) Aura Heal HP & MP (disabled during fair PvP duels)
    if (ab.mode !== 'passive' && !inFairPvp && adminEntity.healTimer <= 0) {
      if (p.hp < p.maxHp * 0.88 || p.mp < p.maxMp * 0.78) {
        adminEntity.healTimer = ab.mode === 'support' ? 4.2 : 6.5;
        const hpHeal = Math.round(p.maxHp * (ab.mode === 'support' ? 0.24 : 0.16));
        const mpHeal = Math.round(p.maxMp * (ab.mode === 'support' ? 0.28 : 0.18));
        p.hp = Math.min(p.maxHp, p.hp + hpHeal);
        p.mp = Math.min(p.maxMp, p.mp + mpHeal);
        adminEntity.state = 'skill';
        adminEntity.skillTimer = 0.35;
        adminEntity.skillColor = '#fbbf24';
        if (window.Combat) {
          window.Combat.addParticles(p.x, p.y - 8, '#fde047', 10, 90);
          window.Combat.addText(p.x, p.y - 26, '+' + hpHeal + ' HP (Админ-Бот)', '#fde047', false);
        }
      }
    }

    // 3) Combat Assist against Monsters & Bosses (only in 'combat' mode, never interferes in PvP)
    let targetMob = null;
    if (ab.mode === 'combat' && !inFairPvp && window.Combat) {
      let bestD = 320;
      for (let i = 0; i < window.Combat.monsters.length; i++) {
        const m = window.Combat.monsters[i];
        if (m.dead) continue;
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d < bestD) { bestD = d; targetMob = m; }
      }
    }

    const spd = Math.max(190, (window.GameState.computedStats.speed || 150) + 45);
    if (targetMob) {
      const dx = targetMob.x - adminEntity.x;
      const dy = targetMob.y - adminEntity.y;
      const d = Math.hypot(dx, dy);
      adminEntity.facingX = dx >= 0 ? 1 : -1;
      if (d > 68) {
        adminEntity.x += (dx / d) * spd * dt;
        adminEntity.y += (dy / d) * spd * dt;
        adminEntity.state = 'run';
      } else {
        adminEntity.state = 'idle';
        const pAtk = (window.GameState.computedStats && window.GameState.computedStats.atk) || 35;
        const pMult = Math.max(1, Number(ab.powerMult) || 1);
        const botStats = { atk: Math.round((pAtk * 1.15 + 28) * pMult), crit: 45, armorPen: 0.35, skillDmgPct: 0.25 };
        if (adminEntity.aoeTimer <= 0) {
          adminEntity.aoeTimer = 5.0;
          adminEntity.skillTimer = 0.35;
          adminEntity.skillColor = '#a855f7';
          adminEntity.state = 'skill';
          window.Combat.castSkill(adminEntity, 'chain_lightning', targetMob, botStats);
        } else if (adminEntity.attackCooldown <= 0) {
          window.Combat.performBasicAttack(adminEntity, targetMob, botStats);
          adminEntity.attackCooldown = 0.55;
        }
      }
    } else {
      // Smoothly orbit behind player
      const goalX = p.x - (p.facingX || 1) * 44;
      const goalY = p.y + 14;
      const dx = goalX - adminEntity.x;
      const dy = goalY - adminEntity.y;
      const d = Math.hypot(dx, dy);
      if (d > 14) {
        adminEntity.x += (dx / d) * Math.min(spd * dt, d);
        adminEntity.y += (dy / d) * Math.min(spd * dt, d);
        adminEntity.facingX = dx >= 0 ? 1 : -1;
        adminEntity.state = d > 75 ? 'run' : 'walk';
      } else if (adminEntity.skillTimer <= 0) {
        adminEntity.state = 'idle';
        adminEntity.facingX = p.facingX || 1;
      }
    }
  }

  function drawAdminBot(ctx, camLeft, camTop, vw, vh, animTime) {
    const ab = window.GameState && window.GameState.adminBot;
    if (!ab || !ab.owned || !ab.summoned) return;
    if (adminEntity.x < camLeft - 80 || adminEntity.x > camLeft + vw + 80 || adminEntity.y < camTop - 80 || adminEntity.y > camTop + vh + 80) return;

    // Royal golden-violet pulsing halo under Admin Bot
    ctx.save();
    const pulse = 1 + Math.sin(animTime * 4) * 0.1;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(adminEntity.x, adminEntity.y + 12, 18 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    window.Sprites.drawCharacter(ctx, adminEntity, animTime);
  }

  function cleanUrl(raw) {
    return String(raw || '').trim().replace(/\/+$/, '');
  }

  function getTgWebApp() {
    return (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
  }

  function getApiUrl() {
    if (queryApiUrl) return queryApiUrl;
    if (typeof window.TG_STARS_API_URL === 'string' && window.TG_STARS_API_URL.trim()) {
      return cleanUrl(window.TG_STARS_API_URL);
    }
    const setUrl = window.GameState && window.GameState.settings && window.GameState.settings.tgApiUrl;
    if (setUrl && setUrl.trim()) return cleanUrl(setUrl);
    try {
      const saved = localStorage.getItem(LS_API_KEY);
      if (saved && saved.trim()) return cleanUrl(saved);
    } catch (_e) {}
    return 'https://bladerealm-api.citiciter18.workers.dev';
  }

  function setApiUrl(raw) {
    const cleaned = cleanUrl(raw);
    if (cleaned && !/^https?:\/\//i.test(cleaned)) {
      if (window.UI) window.UI.toast('URL сервера должен начинаться с https:// или http://');
      return false;
    }
    queryApiUrl = '';
    if (window.GameState && window.GameState.settings) {
      window.GameState.settings.tgApiUrl = cleaned;
    }
    try {
      if (cleaned) localStorage.setItem(LS_API_KEY, cleaned);
      else localStorage.removeItem(LS_API_KEY);
    } catch (_e) {}
    if (window.MMO && window.GameState && window.GameState.started) {
      window.MMO.saveProgress();
    }
    if (window.UI) {
      window.UI.toast(cleaned ? 'Сервер оплаты Stars сохранён!' : 'URL сервера оплаты очищен.');
    }
    return true;
  }

  function getEnvStatus() {
    const tg = getTgWebApp();
    const user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user : null;
    const inTelegram = Boolean(tg && (tg.initData || user));
    const canOpenInvoice = Boolean(tg && typeof tg.openInvoice === 'function' && inTelegram);
    const apiUrl = getApiUrl();
    return {
      inTelegram,
      canOpenInvoice,
      user,
      apiUrl,
      isBusy: purchaseInFlight,
      ready: canOpenInvoice && Boolean(apiUrl)
    };
  }

  function init() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const qApi = cleanUrl(params.get('api') || params.get('stars_api') || '');
      if (qApi && /^https?:\/\//i.test(qApi)) {
        queryApiUrl = qApi;
      }
    } catch (_e) {}

    const tg = getTgWebApp();
    if (!tg) return;
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
      if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#0b0f1d');
      if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#0b0f1d');

      const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (user && user.first_name) {
        const inp = document.getElementById('heroNameInput');
        if (inp && (!inp.value || inp.value === 'Аэтель')) {
          inp.value = String(user.first_name).slice(0, 16);
        }
      }
    } catch (_e) {}
  }

  function deliverPaidPack(pack, invoiceMeta) {
    if (!pack || !window.GameState || !window.GameState.player) return;
    pack.grant();
    window.GameState.recalcStats();

    if (!Array.isArray(window.GameState.donateHistory)) {
      window.GameState.donateHistory = [];
    }
    window.GameState.donateHistory.unshift({
      id: pack.id,
      title: pack.title,
      stars: pack.stars,
      at: new Date().toLocaleString('ru-RU'),
      ref: (invoiceMeta && invoiceMeta.orderId) || ''
    });

    const p = window.GameState.player;
    if (window.Combat) {
      window.Combat.addParticles(p.x, p.y, '#fbbf24', 28, 150);
      window.Combat.addText(p.x, p.y - 36, 'АДМИН-БОТ ПРИЗВАН!', '#fbbf24', true);
    }
    if (window.MMO) {
      window.MMO.addChat('system', 'Stars', 'Приобретён «' + pack.title + '» (' + pack.stars + ' Stars)! Он уже рядом с вами.');
      window.MMO.saveProgress();
    }
    if (window.GameAPI) window.GameAPI.vibrate(35);
    if (window.UI) {
      window.UI.toast('Админ Бот активирован и призван!');
      window.UI.renderCurrentModal();
    }
  }

  async function buyPack(packId) {
    const pack = PACK_BY_ID[packId];
    if (!pack) return false;
    if (pack.id === 'admin_bot' && window.GameState.adminBot && window.GameState.adminBot.owned) {
      window.UI.toast('Админ Бот уже разблокирован на вашем аккаунте!');
      return false;
    }
    if (purchaseInFlight) {
      window.UI.toast('Оплата уже обрабатывается...');
      return false;
    }

    const status = getEnvStatus();
    if (!status.canOpenInvoice) {
      window.UI.toast('Откройте игру через вашего Telegram-бота, чтобы купить Админ Бота за Stars.');
      return false;
    }
    if (!status.apiUrl) {
      window.UI.toast('Укажите URL сервера вашего бота (endpoint /api/create-invoice).');
      return false;
    }

    const tg = getTgWebApp();
    purchaseInFlight = true;
    if (window.UI) window.UI.renderCurrentModal();

    try {
      const endpoint = status.apiUrl + '/api/create-invoice';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: pack.id,
          userId: status.user ? status.user.id : 0,
          username: status.user ? (status.user.username || '') : '',
          initData: tg.initData || ''
        })
      });

      let data = null;
      try { data = await resp.json(); } catch (_e) {}
      if (!resp.ok || !data || !data.invoiceLink) {
        const errMsg = (data && data.error) ? data.error : ('HTTP ' + resp.status);
        throw new Error(errMsg);
      }

      return await new Promise(resolve => {
        tg.openInvoice(data.invoiceLink, invStatus => {
          purchaseInFlight = false;
          if (invStatus === 'paid') {
            deliverPaidPack(pack, data);
            resolve(true);
          } else if (invStatus === 'cancelled') {
            window.UI.toast('Оплата Telegram Stars отменена.');
            window.UI.renderCurrentModal();
            resolve(false);
          } else if (invStatus === 'pending') {
            window.UI.toast('Платёж обрабатывается Telegram...');
            window.UI.renderCurrentModal();
            resolve(false);
          } else {
            window.UI.toast('Не удалось завершить оплату Stars (' + invStatus + ').');
            window.UI.renderCurrentModal();
            resolve(false);
          }
        });
      });
    } catch (err) {
      purchaseInFlight = false;
      window.UI.toast('Ошибка создания счёта Stars: ' + (err && err.message ? err.message : 'нет ответа сервера'));
      if (window.UI) window.UI.renderCurrentModal();
      return false;
    }
  }

  function getBackendCatalogSnippet() {
    const out = {};
    DONATE_PACKS.forEach(pk => {
      out[pk.id] = { title: pk.title, desc: pk.contentsText, stars: pk.stars };
    });
    return JSON.stringify(out, null, 2);
  }

  // =========================================================================
  // ADMIN BOT FULL CONTROL ACTIONS (Unlocked only when adminBot.owned === true)
  // =========================================================================
  function requireAdmin() {
    if (!window.GameState || !window.GameState.adminBot || !window.GameState.adminBot.owned) {
      if (window.UI) window.UI.toast('Требуется Админ Бот (Магазин Telegram Stars).');
      return false;
    }
    return true;
  }

  const adminActions = {
    giveGold(amount) {
      if (!requireAdmin()) return false;
      const val = Math.max(1, Math.min(100000000, Math.round(Number(amount) || 0)));
      window.GameState.player.gold += val;
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выдано золото: +' + val.toLocaleString());
      return true;
    },
    giveLevels(count) {
      if (!requireAdmin()) return false;
      const n = Math.max(1, Math.min(50, Math.round(Number(count) || 1)));
      const p = window.GameState.player;
      for (let i = 0; i < n; i++) {
        p.level += 1;
        p.skillPoints = (p.skillPoints || 0) + 1;
        p.statPoints = (p.statPoints || 0) + 3;
      }
      window.GameState.recalcStats();
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      if (window.Combat) {
        window.Combat.addParticles(p.x, p.y, '#fbbf24', 24, 140);
        window.Combat.addText(p.x, p.y - 30, 'УРОВЕНЬ ' + p.level + '!', '#fbbf24', true);
      }
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Уровень повышен до ' + p.level + ' (+' + (n * 3) + ' стат, +' + n + ' навыков)');
      return true;
    },
    givePoints(statPts, skillPts) {
      if (!requireAdmin()) return false;
      const p = window.GameState.player;
      p.statPoints = (p.statPoints || 0) + Math.max(0, Math.round(statPts || 0));
      p.skillPoints = (p.skillPoints || 0) + Math.max(0, Math.round(skillPts || 0));
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выданы очки характеристик и навыков!');
      return true;
    },
    fullHealAndResetCd() {
      if (!requireAdmin()) return false;
      const p = window.GameState.player;
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      p.dashCooldown = 0;
      p.skillCooldowns = {};
      if (p.state === 'death') {
        p.state = 'idle';
        const ov = document.getElementById('deathOverlay');
        if (ov) ov.classList.add('hidden');
      }
      if (window.Combat) window.Combat.addParticles(p.x, p.y - 6, '#4ade80', 18, 110);
      window.UI.toast('[АДМИН] Полное восстановление HP/MP и сброс всех КД!');
      return true;
    },
    unlockAllMounts() {
      if (!requireAdmin()) return false;
      window.GameData.MOUNTS.forEach(m => {
        if (!window.GameState.unlockedMounts.includes(m.id)) {
          window.GameState.unlockedMounts.push(m.id);
        }
      });
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Разблокированы все ' + window.GameData.MOUNTS.length + ' маунтов!');
      return true;
    },
    boostAllMastery(delta) {
      if (!requireAdmin()) return false;
      const d = Math.max(1, Math.round(delta || 5));
      Object.keys(window.GameState.professions).forEach(k => {
        window.GameState.professions[k] = (window.GameState.professions[k] || 1) + d;
      });
      const gm = window.GameState.mastery.gather;
      Object.keys(gm).forEach(k => { gm[k].lv = (gm[k].lv || 1) + d; });
      const wType = window.GameState.player.equipment.weapon?.weaponType;
      if (wType) {
        if (!window.GameState.mastery.weapons[wType]) window.GameState.mastery.weapons[wType] = { lv: 1, xp: 0 };
        window.GameState.mastery.weapons[wType].lv += d;
      }
      window.GameState.recalcStats();
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Все профессии и мастерство повышены на +' + d + ' ур.!');
      return true;
    },
    spawnWeapon(weaponId, tier, rarity, enhance, enchantLv, affixId) {
      if (!requireAdmin()) return false;
      const lv = Math.max(1, window.GameState.player.level);
      const it = window.GameData.createWeaponItem(
        weaponId, rarity || 'legendary', lv,
        Math.max(0, Math.min(15, Number(enhance) || 0)),
        Math.max(1, Math.min(8, Number(tier) || 8)),
        Math.max(0, Math.min(4, Number(enchantLv) || 0)),
        affixId || null
      );
      if (!window.MMO.addItemToBag(it)) {
        window.UI.toast('Инвентарь переполнен! Освободите 1 слот.');
        return false;
      }
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выдано: ' + it.name + (it.enhance ? ' +' + it.enhance : ''));
      return true;
    },
    spawnArmor(armorId, tier, rarity, enhance, enchantLv, affixId) {
      if (!requireAdmin()) return false;
      const lv = Math.max(1, window.GameState.player.level);
      const it = window.GameData.createArmorItem(
        armorId, rarity || 'legendary', lv,
        Math.max(0, Math.min(15, Number(enhance) || 0)),
        Math.max(1, Math.min(8, Number(tier) || 8)),
        Math.max(0, Math.min(4, Number(enchantLv) || 0)),
        affixId || null
      );
      if (!window.MMO.addItemToBag(it)) {
        window.UI.toast('Инвентарь переполнен! Освободите 1 слот.');
        return false;
      }
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выдано: ' + it.name + (it.enhance ? ' +' + it.enhance : ''));
      return true;
    },
    spawnTool(kind, tier) {
      if (!requireAdmin()) return false;
      const it = window.GameData.createToolItem(kind, Math.max(1, Math.min(8, Number(tier) || 8)));
      if (!window.MMO.addItemToBag(it)) {
        window.UI.toast('Инвентарь переполнен!');
        return false;
      }
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выдан инструмент: ' + it.name);
      return true;
    },
    spawnAllToolsT8() {
      if (!requireAdmin()) return false;
      let added = 0;
      ['axe', 'pickaxe', 'sickle'].forEach(k => {
        if (window.MMO.addItemToBag(window.GameData.createToolItem(k, 8))) added++;
      });
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выданы инструменты T8 (' + added + '/3)');
      return true;
    },
    spawnConsumable(id, qty) {
      if (!requireAdmin()) return false;
      const n = Math.max(1, Math.min(999, Math.round(Number(qty) || 1)));
      const it = window.GameData.createConsumableItem(id, n);
      if (!window.MMO.addItemToBag(it)) {
        window.UI.toast('Инвентарь переполнен!');
        return false;
      }
      window.MMO.saveProgress();
      window.UI.toast('[АДМИН] Выдано: ' + it.name + ' x' + n);
      return true;
    },
    killNearbyMonsters(radius) {
      if (!requireAdmin()) return false;
      const p = window.GameState.player;
      const rad = radius || 480;
      let count = 0;
      window.Combat.monsters.forEach(m => {
        if (!m.dead && Math.hypot(m.x - p.x, m.y - p.y) <= rad) {
          window.Combat.applyHit(p, m, { atk: 999999, crit: 100, armorPen: 0.65 }, 10, null, '#fbbf24', true);
          count++;
        }
      });
      window.Combat.addParticles(p.x, p.y, '#fbbf24', 28, 170);
      window.UI.toast('[АДМИН] Уничтожено монстров рядом: ' + count);
      return true;
    },
    respawnAllBosses() {
      if (!requireAdmin()) return false;
      let count = 0;
      window.Combat.monsters.forEach(m => {
        if (m.isBoss && m.dead) {
          m.dead = false;
          m.respawnTimer = 0;
          m.hp = m.maxHp;
          m.x = m.homeX;
          m.y = m.homeY;
          count++;
        }
      });
      window.MMO.addChat('system', 'АДМИН', 'Все мировые и локальные боссы возрождены (' + count + ')!');
      window.UI.toast('[АДМИН] Возрождено боссов: ' + count);
      return true;
    },
    teleportToNearestBoss() {
      if (!requireAdmin()) return false;
      const p = window.GameState.player;
      const alive = window.Combat.monsters.filter(m => !m.dead && m.isBoss);
      if (!alive.length) {
        window.UI.toast('Нет живых боссов — нажмите «Воскресить боссов»!');
        return false;
      }
      alive.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
      const boss = alive[0];
      p.x = Math.max(80, Math.min(window.World.WIDTH - 80, boss.x - 110));
      p.y = Math.max(80, Math.min(window.World.HEIGHT - 80, boss.y + 30));
      syncAdminBotEntity(true);
      window.Combat.addParticles(p.x, p.y, '#c084fc', 22, 130);
      window.UI.toast('[АДМИН] Телепорт к боссу: ' + boss.name);
      return true;
    },
    broadcastAdmin(text) {
      if (!requireAdmin()) return false;
      const msg = String(text || '').trim().slice(0, 110);
      if (!msg) return false;
      window.MMO.addChat('system', '[АДМИН] ' + window.GameState.player.name, msg);
      if (window.Multiplayer) window.Multiplayer.sendChat('world', '[АДМИН] ' + msg);
      window.UI.toast('Объявление отправлено в мировой чат!');
      return true;
    }
  };

  return {
    DONATE_PACKS,
    PACK_BY_ID,
    adminEntity,
    adminActions,
    init,
    getApiUrl,
    setApiUrl,
    getEnvStatus,
    buyPack,
    getBackendCatalogSnippet,
    syncAdminBotEntity,
    updateAdminBot,
    drawAdminBot
  };
})();
