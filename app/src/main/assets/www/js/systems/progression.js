/* ==========================================================================
   BladeRealm — Cosmetics Wardrobe, 7-Day Daily Rewards, Season 1 Battle Pass,
   and PK / Karma & Bounty Hunter Board
   ========================================================================== */

window.Progression = (function () {
  // =========================================================================
  // 1. COSMETICS WARDROBE API
  // =========================================================================
  function ensureCosmeticsState() {
    const gs = window.GameState;
    if (!gs.cosmetics) {
      gs.cosmetics = {
        owned: ['head_ninja', 'aura_arcane', 'title_novice'],
        equipped: { head: null, back: null, aura: 'aura_arcane', trail: null, title: null },
        hideHelmet: false
      };
    }
    return gs.cosmetics;
  }

  function unlockCosmetic(id, silent) {
    const c = window.CosmeticsData && window.CosmeticsData.COSMETIC_BY_ID[id];
    if (!c) return false;
    const cs = ensureCosmeticsState();
    if (!cs.owned.includes(id)) {
      cs.owned.push(id);
      if (!silent && window.UI) window.UI.toast('Открыта косметика: ' + c.name + '!');
      if (window.GameAudio) window.GameAudio.playSfx('loot');
      return true;
    }
    return false;
  }

  function buyOrEquipCosmetic(id) {
    const c = window.CosmeticsData && window.CosmeticsData.COSMETIC_BY_ID[id];
    if (!c) return false;
    const cs = ensureCosmeticsState();
    if (cs.owned.includes(id)) {
      cs.equipped[c.slot] = cs.equipped[c.slot] === id ? null : id;
      window.MMO.saveProgress();
      if (window.GameAudio) window.GameAudio.playSfx('click');
      if (window.UI) window.UI.toast(cs.equipped[c.slot] ? ('Надето: ' + c.name) : ('Снято: ' + c.name));
      return true;
    }
    if (c.price <= 0 && c.unlockHint) {
      if (window.UI) window.UI.toast('Условие открытия: ' + c.unlockHint);
      return false;
    }
    if (window.GameState.player.gold < c.price) {
      if (window.UI) window.UI.toast('Не хватает золота (' + c.price.toLocaleString() + ')!');
      return false;
    }
    window.GameState.player.gold -= c.price;
    cs.owned.push(id);
    cs.equipped[c.slot] = id;
    window.MMO.saveProgress();
    if (window.GameAudio) window.GameAudio.playSfx('enhance_ok');
    if (window.UI) window.UI.toast('Куплено и надето: ' + c.name + '!');
    return true;
  }

  // =========================================================================
  // 2. 7-DAY DAILY REWARDS CALENDAR
  // =========================================================================
  const DAILY_REWARDS = [
    { day: 1, title: '500 Золота + 5 Зелий HP', icon: 'coin', grant: () => { window.GameState.player.gold += 500; window.MMO.addItemToBag(window.GameData.createConsumableItem('hp_potion', 5)); } },
    { day: 2, title: 'Камень заточки x3 + 800 Золота', icon: 'upgrade_stone', grant: () => { window.GameState.player.gold += 800; window.MMO.addItemToBag(window.GameData.createConsumableItem('upgrade_stone', 3)); } },
    { day: 3, title: 'Свиток Чар x2 + 1200 Золота', icon: 'scroll', grant: () => { window.GameState.player.gold += 1200; window.MMO.addItemToBag(window.GameData.createConsumableItem('scroll_enchant', 2)); } },
    { day: 4, title: 'Аура «Ледяные Руны» + 1500 Золота', icon: 'cosmetics', grant: () => { window.GameState.player.gold += 1500; unlockCosmetic('aura_frost', true); } },
    { day: 5, title: 'Редкое оружие T4 + 2200 Золота', icon: 'weapons', grant: () => { window.GameState.player.gold += 2200; window.MMO.addItemToBag(window.GameData.createWeaponItem('flame_blade', 'rare', Math.max(8, window.GameState.player.level), 2, 4, 1)); } },
    { day: 6, title: 'Питомец «Призрачный Волк» + 3000 Золота', icon: 'pet', grant: () => { window.GameState.player.gold += 3000; if (!window.GameState.pets) window.GameState.pets = { owned: {}, activeId: null }; if (!window.GameState.pets.owned.pet_wolf) window.GameState.pets.owned.pet_wolf = { lv: 1, xp: 0 }; } },
    { day: 7, title: 'Косметика «Корона Императора» + 6000 Золота!', icon: 'crown', grant: () => { window.GameState.player.gold += 6000; unlockCosmetic('head_royal_crown', true); } }
  ];

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function ensureDailyState() {
    const gs = window.GameState;
    if (!gs.daily) gs.daily = { streak: 0, lastClaimDate: '' };
    return gs.daily;
  }

  function canClaimDaily() {
    const ds = ensureDailyState();
    return ds.lastClaimDate !== todayStr();
  }

  function claimDailyReward() {
    const ds = ensureDailyState();
    const t = todayStr();
    if (ds.lastClaimDate === t) {
      if (window.UI) window.UI.toast('Сегодняшняя награда уже получена! Возвращайтесь завтра.');
      return false;
    }
    const dayIdx = ds.streak % DAILY_REWARDS.length;
    const rew = DAILY_REWARDS[dayIdx];
    rew.grant();
    ds.streak += 1;
    ds.lastClaimDate = t;
    onBpEvent('login', 1);
    window.MMO.saveProgress();
    if (window.GameAudio) window.GameAudio.playSfx('victory');
    if (window.UI) window.UI.toast('День ' + rew.day + ': получено «' + rew.title + '»!');
    return true;
  }

  // =========================================================================
  // 3. SEASON 1 BATTLE PASS («КЛИНОК ВЕЧНОСТИ» — 20 LEVELS)
  // =========================================================================
  const BP_QUESTS = [
    { id: 'bp_kills',   title: 'Истребитель монстров',  type: 'kill',    goal: 15, xp: 140 },
    { id: 'bp_gather',  title: 'Труженик биомов',       type: 'gather',  goal: 8,  xp: 120 },
    { id: 'bp_dungeon', title: 'Покоритель Данжей',     type: 'dungeon', goal: 1,  xp: 220 },
    { id: 'bp_arena',   title: 'Победа на PvP-Арене',   type: 'arena',   goal: 1,  xp: 200 },
    { id: 'bp_fort',    title: 'Захват крепости клана', type: 'fort',    goal: 1,  xp: 240 },
    { id: 'bp_bounty',  title: 'Контракт на преступника', type: 'bounty', goal: 1, xp: 200 }
  ];

  const BP_TIERS = [];
  for (let lv = 1; lv <= 20; lv++) {
    const freeRew =
      lv === 5  ? { label: 'След «Огонь»', grant: () => unlockCosmetic('trail_fire', true) } :
      lv === 10 ? { label: 'Шляпа Архимага', grant: () => unlockCosmetic('head_mage_hat', true) } :
      lv === 15 ? { label: 'Теневые Крылья', grant: () => unlockCosmetic('back_shadow_wings', true) } :
      lv === 20 ? { label: 'Аура «Золотое Сияние»', grant: () => unlockCosmetic('aura_golden', true) } :
      { label: (lv * 250) + ' Золота + Камень заточки', grant: () => { window.GameState.player.gold += lv * 250; window.MMO.addItemToBag(window.GameData.createConsumableItem('upgrade_stone', 1)); } };

    const premRew =
      lv === 1  ? { label: 'Золотой Шарф + 1500 зол.', grant: () => { window.GameState.player.gold += 1500; unlockCosmetic('back_scarf_gold', true); } } :
      lv === 5  ? { label: 'Рога Демона + 2500 зол.', grant: () => { window.GameState.player.gold += 2500; unlockCosmetic('head_demon_horns', true); } } :
      lv === 10 ? { label: 'Крылья Ангела + Свиток x3', grant: () => { unlockCosmetic('back_angel_wings', true); window.MMO.addItemToBag(window.GameData.createConsumableItem('scroll_enchant', 3)); } } :
      lv === 15 ? { label: 'Питомец «Огненный Дракончик»', grant: () => { if (!window.GameState.pets) window.GameState.pets = { owned: {}, activeId: null }; if (!window.GameState.pets.owned.pet_dragon) window.GameState.pets.owned.pet_dragon = { lv: 1, xp: 0 }; } } :
      lv === 20 ? { label: 'Крылья Феникса + Титул «Легенда»!', grant: () => { unlockCosmetic('back_phoenix_wings', true); unlockCosmetic('title_legend', true); } } :
      { label: (lv * 500) + ' Золота + Свиток Чар', grant: () => { window.GameState.player.gold += lv * 500; window.MMO.addItemToBag(window.GameData.createConsumableItem('scroll_enchant', 1)); } };

    BP_TIERS.push({ lv, free: freeRew, prem: premRew });
  }

  function ensureBpState() {
    const gs = window.GameState;
    if (!gs.battlePass) {
      gs.battlePass = {
        xp: 0,
        premium: false,
        claimedFree: {},
        claimedPrem: {},
        quests: {}
      };
    }
    return gs.battlePass;
  }

  function getBpLevel() {
    const bp = ensureBpState();
    return Math.min(20, Math.floor((bp.xp || 0) / 200) + 1);
  }

  function addBpXp(amt) {
    const bp = ensureBpState();
    bp.xp = (bp.xp || 0) + (amt || 0);
  }

  function onBpEvent(type, amt) {
    const bp = ensureBpState();
    BP_QUESTS.forEach(q => {
      if (q.type !== type) return;
      if (!bp.quests[q.id]) bp.quests[q.id] = { prog: 0, claimed: false };
      const st = bp.quests[q.id];
      if (!st.claimed && st.prog < q.goal) {
        st.prog = Math.min(q.goal, st.prog + (amt || 1));
      }
    });
  }

  function claimBpQuest(qid) {
    const bp = ensureBpState();
    const q = BP_QUESTS.find(x => x.id === qid);
    const st = bp.quests[qid];
    if (!q || !st || st.prog < q.goal || st.claimed) return false;
    st.prog = 0; // Repeatable BP quest!
    addBpXp(q.xp);
    window.MMO.saveProgress();
    if (window.GameAudio) window.GameAudio.playSfx('coin');
    if (window.UI) window.UI.toast('Задание Пропуска выполнено! +' + q.xp + ' BP XP');
    return true;
  }

  function claimBpReward(lv, isPrem) {
    const bp = ensureBpState();
    if (getBpLevel() < lv) {
      if (window.UI) window.UI.toast('Достигните ' + lv + ' уровня Боевого Пропуска!');
      return false;
    }
    if (isPrem && !bp.premium) {
      if (window.UI) window.UI.toast('Активируйте Премиум Пропуск!');
      return false;
    }
    const map = isPrem ? bp.claimedPrem : bp.claimedFree;
    if (map[lv]) return false;
    const tier = BP_TIERS.find(t => t.lv === lv);
    if (!tier) return false;
    (isPrem ? tier.prem : tier.free).grant();
    map[lv] = true;
    window.MMO.saveProgress();
    if (window.GameAudio) window.GameAudio.playSfx('loot');
    if (window.UI) window.UI.toast('Награда Пропуска Ур.' + lv + ' получена!');
    return true;
  }

  function unlockPremiumBp() {
    const bp = ensureBpState();
    if (bp.premium) return true;
    const cost = 15000;
    const isAdmin = window.GameState.adminBot && window.GameState.adminBot.owned;
    if (!isAdmin && window.GameState.player.gold < cost) {
      if (window.UI) window.UI.toast('Нужно 15 000 золота (или откройте в Донате Telegram Stars)!');
      return false;
    }
    if (!isAdmin) window.GameState.player.gold -= cost;
    bp.premium = true;
    window.MMO.saveProgress();
    if (window.GameAudio) window.GameAudio.playSfx('victory');
    if (window.UI) window.UI.toast('Премиум Боевой Пропуск активирован!');
    return true;
  }

  function hasPendingRewards() {
    if (canClaimDaily()) return true;
    const bp = ensureBpState();
    const curLv = getBpLevel();
    for (let i = 1; i <= curLv; i++) {
      if (!bp.claimedFree[i]) return true;
      if (bp.premium && !bp.claimedPrem[i]) return true;
    }
    return false;
  }

  // =========================================================================
  // 4. PK / KARMA & BOUNTY HUNTER BOARD
  // =========================================================================
  const OUTLAWS = [
    { id: 'outlaw_1', isOutlaw: true, radius: 18, name: 'Кровавый Рик', level: 8,  bounty: 950,  karma: -120, x: 2550, y: 2450, hp: 620,  maxHp: 620,  atk: 34, def: 12, dead: false, respawn: 0 },
    { id: 'outlaw_2', isOutlaw: true, radius: 18, name: 'Шрам Бездны',  level: 15, bounty: 1850, karma: -210, x: 5600, y: 2650, hp: 1350, maxHp: 1350, atk: 58, def: 22, dead: false, respawn: 0 },
    { id: 'outlaw_3', isOutlaw: true, radius: 18, name: 'Палач Ветров', level: 22, bounty: 3200, karma: -340, x: 2150, y: 4550, hp: 2400, maxHp: 2400, atk: 88, def: 32, dead: false, respawn: 0 },
    { id: 'outlaw_4', isOutlaw: true, radius: 18, name: 'Чёрный Лорд',  level: 30, bounty: 5400, karma: -500, x: 6350, y: 4900, hp: 4200, maxHp: 4200, atk: 125, def: 46, dead: false, respawn: 0 }
  ];

  const customBounties = {}; // playerId -> gold
  let trackedTargetId = null;

  function placeBounty(targetId, targetName, amount) {
    const amt = Math.max(200, Math.floor(Number(amount) || 0));
    if (window.GameState.player.gold < amt) {
      if (window.UI) window.UI.toast('Не хватает золота (' + amt + ')!');
      return false;
    }
    window.GameState.player.gold -= amt;
    customBounties[targetId] = (customBounties[targetId] || 0) + amt;
    if (window.Multiplayer && window.Multiplayer.sendCustomEvent) {
      window.Multiplayer.sendCustomEvent('bounty_post', { targetId, targetName, amount: amt, byName: window.GameState.player.name });
    }
    window.MMO.addChat('world', 'Доска Наград', window.GameState.player.name + ' назначил награду ' + amt + ' зол. за голову ' + targetName + '!');
    if (window.GameAudio) window.GameAudio.playSfx('bounty');
    if (window.UI) window.UI.toast('Награда назначена за ' + targetName + '!');
    return true;
  }

  function onRemoteBountyPost(data) {
    if (!data || !data.targetId) return;
    customBounties[data.targetId] = (customBounties[data.targetId] || 0) + (Number(data.amount) || 0);
    window.MMO.addChat('world', 'Розыск', 'Объявлена награда ' + data.amount + ' зол. за голову ' + (data.targetName || 'игрока') + '!');
  }

  function getWantedList() {
    const list = [];
    // Real online PK / Bountied players
    if (window.Multiplayer) {
      window.Multiplayer.getRemotePlayers().forEach(rp => {
        const b = (customBounties[rp.id] || 0) + ((rp.karma || 0) <= -50 ? Math.abs(rp.karma) * 10 : 0);
        if (b > 0 || (rp.karma || 0) <= -50) {
          list.push({ id: rp.id, name: rp.name, level: rp.level, bounty: Math.max(500, b), x: rp.x, y: rp.y, isOnlinePlayer: true, alive: rp.hp > 0 });
        }
      });
    }
    // Roaming PK Outlaws
    OUTLAWS.forEach(o => {
      list.push({
        id: o.id,
        name: o.name,
        level: o.level,
        bounty: o.bounty + (customBounties[o.id] || 0),
        x: o.x,
        y: o.y,
        isOutlaw: true,
        alive: !o.dead
      });
    });
    return list;
  }

  function trackTarget(id) {
    trackedTargetId = trackedTargetId === id ? null : id;
    if (window.UI) window.UI.toast(trackedTargetId ? 'Цель отмечена на радаре и компасе!' : 'Отслеживание снято.');
  }

  function getTrackedTarget() {
    if (!trackedTargetId) return null;
    return getWantedList().find(w => w.id === trackedTargetId && w.alive) || null;
  }

  function onPlayerKilledTarget(victimId, victimName, victimKarma) {
    const p = window.GameState.player;
    const isWanted = (customBounties[victimId] || 0) > 0 || (victimKarma || 0) <= -50;
    if (isWanted) {
      const reward = (customBounties[victimId] || 0) + Math.max(400, Math.abs(victimKarma || 50) * 10);
      delete customBounties[victimId];
      p.gold += reward;
      p.karma = Math.min(200, (p.karma || 0) + 35);
      unlockCosmetic('title_bounty', true);
      onBpEvent('bounty', 1);
      if (window.GameAudio) window.GameAudio.playSfx('victory');
      window.MMO.addChat('system', 'Охотник', 'Преступник ' + victimName + ' устранён! Получена награда: +' + reward + ' зол.');
      if (window.UI) window.UI.toast('Награда за голову получена: +' + reward + ' монет!');
    } else {
      // Unprovoked PK kill reduces karma -> Red Nickname!
      p.karma = Math.max(-500, (p.karma || 0) - 55);
      if (p.karma <= -50) {
        if (window.UI) window.UI.toast('Вы получили статус PK (Красный ник)! За вашу голову назначена награда!');
      }
    }
  }

  function updateOutlaws(dt) {
    const p = window.GameState && window.GameState.player;
    if (!p || (window.Activities && (window.Activities.isInDungeon() || window.Activities.isInArena()))) return;
    OUTLAWS.forEach(o => {
      if (o.dead) {
        o.respawn -= dt;
        if (o.respawn <= 0) { o.dead = false; o.hp = o.maxHp; }
        return;
      }
      if (o.hurtTimer > 0) o.hurtTimer -= dt;
      if (o.attackTimer > 0) o.attackTimer -= dt;
      o.atkCd = (o.atkCd || 1) - dt;
      const d = Math.hypot(p.x - o.x, p.y - o.y);
      if (d < 260 && p.hp > 0 && p.state !== 'death' && !window.World.getBiomeAt(p.x, p.y).safe) {
        o.facingX = p.x >= o.x ? 1 : -1;
        if (d > 54) {
          o.x += ((p.x - o.x) / d) * 118 * dt;
          o.y += ((p.y - o.y) / d) * 118 * dt;
          o.state = 'run';
        } else {
          o.state = o.attackTimer > 0 ? 'attack' : 'idle';
          if (o.atkCd <= 0) {
            o.atkCd = 1.25;
            o.attackTimer = 0.25;
            window.Combat.applyHit(o, p, { atk: o.atk, crit: 12 }, 1.0, null, '#ef4444');
          }
        }
      } else {
        o.state = 'idle';
      }
    });
  }

  function handleOutlawDefeated(o) {
    o.dead = true;
    o.respawn = 45;
    const reward = o.bounty + (customBounties[o.id] || 0);
    delete customBounties[o.id];
    const p = window.GameState.player;
    p.gold += reward;
    p.karma = Math.min(200, (p.karma || 0) + 40);
    window.MMO.grantXp(o.level * 65);
    unlockCosmetic('title_bounty', true);
    onBpEvent('bounty', 1);
    if (window.GameAudio) window.GameAudio.playSfx('victory');
    window.MMO.addChat('system', 'Розыск', 'Вы устранили разбойника «' + o.name + '»! Награда: +' + reward + ' монет!');
    if (window.UI) window.UI.toast('Разыскиваемый устранён! +' + reward + ' монет!');
    window.MMO.saveProgress();
  }

  function drawOutlawsAndCompass(ctx, camX, camY, vw, vh, animTime) {
    if (window.Activities && (window.Activities.isInDungeon() || window.Activities.isInArena())) return;
    // Draw roaming PK Outlaws
    OUTLAWS.forEach(o => {
      if (o.dead) return;
      if (o.x < camX - 80 || o.x > camX + vw + 80 || o.y < camY - 80 || o.y > camY + vh + 80) return;
      window.Sprites.drawCharacter(ctx, {
        x: o.x, y: o.y, facingX: o.facingX || 1, state: o.state || 'idle',
        name: o.name, level: o.level, hp: o.hp, maxHp: o.maxHp,
        karma: o.karma, isPk: true, bountyGold: o.bounty,
        hurtTimer: o.hurtTimer || 0, attackTimer: o.attackTimer || 0,
        appearance: { hair: '#151829', cloak: '#7f1d1d', armor: '#1f1624', skin: '#e0ac69', eye: '#ef4444' },
        equipment: { weapon: window.GameData.WEAPON_TYPES[0] }
      }, animTime);
    });

    // Draw red Bounty Compass Arrow around player if tracking a target
    const tg = getTrackedTarget();
    const p = window.GameState && window.GameState.player;
    if (tg && p) {
      const ang = Math.atan2(tg.y - p.y, tg.x - p.x);
      const dist = Math.round(Math.hypot(tg.x - p.x, tg.y - p.y));
      ctx.save();
      ctx.translate(p.x + Math.cos(ang) * 44, p.y + Math.sin(ang) * 44);
      ctx.rotate(ang);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-3, 0); ctx.lineTo(-6, 6);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(tg.name + ' (' + dist + 'м)', p.x, p.y + 34);
      ctx.restore();
    }
  }

  return {
    ensureCosmeticsState,
    unlockCosmetic,
    buyOrEquipCosmetic,
    DAILY_REWARDS,
    canClaimDaily,
    claimDailyReward,
    BP_QUESTS,
    BP_TIERS,
    ensureBpState,
    getBpLevel,
    addBpXp,
    onBpEvent,
    claimBpQuest,
    claimBpReward,
    unlockPremiumBp,
    hasPendingRewards,
    OUTLAWS,
    placeBounty,
    onRemoteBountyPost,
    getWantedList,
    trackTarget,
    getTrackedTarget,
    onPlayerKilledTarget,
    updateOutlaws,
    handleOutlawDefeated,
    drawOutlawsAndCompass
  };
})();
