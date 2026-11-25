/* ==========================================================================
   BladeRealm — Endgame Activities Engine:
   1) Party Raid Dungeons (3 tiers, waves, telegraphs, raid boss, T5-T8 chest)
   2) Clan Wars & Territory Control (3 Fortresses, live capture, trade tax)
   3) Ranked PvP Arena 1v1 / 2v2 (Safe ELO leagues, seasons, no loot loss)
   4) Battle Pets Companion Runtime (AI combat, heal/MP, 240px auto-loot)
   ========================================================================== */

window.Activities = (function () {
  // =========================================================================
  // 1. PARTY RAID DUNGEONS
  // =========================================================================
  const DUNGEONS = [
    {
      id: 'crypt',
      name: 'Склеп Нежити',
      recLevel: 5,
      tierRange: 'T2–T4',
      minTier: 2, maxTier: 4,
      goldReward: 1400,
      xpReward: 900,
      floorCol: '#171c2e',
      wallCol: '#334155',
      accentCol: '#a855f7',
      waves: [
        [{ type: 'skeleton', count: 4 }, { type: 'zombie', count: 2 }],
        [{ type: 'skeleton', count: 5 }, { type: 'goblin', count: 3 }],
        [{ type: 'boss_lich', count: 1, bossName: 'Архилич Склепа' }]
      ]
    },
    {
      id: 'citadel',
      name: 'Огненная Цитадель',
      recLevel: 14,
      tierRange: 'T4–T6',
      minTier: 4, maxTier: 6,
      goldReward: 3800,
      xpReward: 2400,
      floorCol: '#241417',
      wallCol: '#7f1d1d',
      accentCol: '#f97316',
      waves: [
        [{ type: 'orc', count: 4 }, { type: 'demon', count: 3 }],
        [{ type: 'demon', count: 5 }, { type: 'golem', count: 2 }],
        [{ type: 'boss_volcano', count: 1, bossName: 'Повелитель Пламени' }]
      ]
    },
    {
      id: 'abyss_throne',
      name: 'Трон Бездны',
      recLevel: 24,
      tierRange: 'T6–T8',
      minTier: 6, maxTier: 8,
      goldReward: 9200,
      xpReward: 5800,
      floorCol: '#130c24',
      wallCol: '#4c1d95',
      accentCol: '#e879f9',
      waves: [
        [{ type: 'demon', count: 5 }, { type: 'golem', count: 3 }],
        [{ type: 'demon', count: 4 }, { type: 'dragon', count: 2 }],
        [{ type: 'world_dragon', count: 1, bossName: 'Владыка Бездны' }]
      ]
    }
  ];

  const dungeonState = {
    active: false,
    def: null,
    wave: 0,
    timer: 0,
    savedPos: null,
    mobs: [],
    centerX: 4000,
    centerY: 3000,
    radius: 330
  };

  function startDungeon(dungeonId) {
    if (dungeonState.active || arenaState.active) {
      if (window.UI) window.UI.toast('Вы уже в инстансе! Сначала выйдите.');
      return false;
    }
    const def = DUNGEONS.find(d => d.id === dungeonId) || DUNGEONS[0];
    const p = window.GameState.player;
    dungeonState.active = true;
    dungeonState.def = def;
    dungeonState.wave = 1;
    dungeonState.timer = 180;
    dungeonState.savedPos = { x: p.x, y: p.y };
    dungeonState.mobs = [];
    p.x = dungeonState.centerX;
    p.y = dungeonState.centerY + 120;
    p.mountedId = null;
    p.hp = p.maxHp;
    p.mp = p.maxMp;

    // Notify online party mates
    if (window.Multiplayer && window.Multiplayer.realParty && window.Multiplayer.realParty.id && window.Multiplayer.sendCustomEvent) {
      window.Multiplayer.sendCustomEvent('dungeon_start', {
        partyId: window.Multiplayer.realParty.id,
        dungeonId: def.id,
        dungeonName: def.name,
        fromName: p.name
      });
    }

    spawnDungeonWave();
    if (window.UI) {
      window.UI.closeModal();
      window.UI.toast('Рейд начат: ' + def.name + ' (Волна 1/' + def.waves.length + ')!');
    }
    if (window.GameAudio) window.GameAudio.playSfx('skill');
    return true;
  }

  function spawnDungeonWave() {
    const def = dungeonState.def;
    if (!def) return;
    const waveDef = def.waves[dungeonState.wave - 1];
    if (!waveDef) return;
    const partyMult = 1 + (window.MMO.party.length * 0.2);
    dungeonState.mobs = [];
    waveDef.forEach(group => {
      const tpl = window.GameData.MONSTER_TYPES[group.type] || window.GameData.MONSTER_TYPES.skeleton;
      for (let i = 0; i < group.count; i++) {
        const ang = (i / Math.max(1, group.count)) * Math.PI * 2 + Math.random() * 0.5;
        const dist = group.count === 1 ? 0 : (110 + Math.random() * 90);
        const isBoss = !!group.bossName || !!tpl.isBoss;
        const hp = Math.round(tpl.hp * (isBoss ? 1.25 : 1.15) * partyMult);
        const mob = {
          id: 'dmob_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          typeId: tpl.id,
          isDungeonMob: true,
          zone: { x: dungeonState.centerX, y: dungeonState.centerY, r: 280 },
          homeX: dungeonState.centerX,
          homeY: dungeonState.centerY - 40,
          x: dungeonState.centerX + Math.cos(ang) * dist,
          y: dungeonState.centerY - 60 + Math.sin(ang) * dist * 0.7,
          facingX: 1,
          name: group.bossName || ('Элит. ' + tpl.name),
          level: Math.max(tpl.level, def.recLevel),
          tier: Math.min(8, Math.max(def.minTier, tpl.tier || def.minTier)),
          hp, maxHp: hp,
          atk: Math.round(tpl.atk * 1.1),
          def: tpl.def,
          speed: tpl.speed * 1.05,
          xp: Math.round(tpl.xp * 1.4),
          gold: tpl.gold,
          aggro: 520,
          range: tpl.range,
          ranged: !!tpl.ranged,
          projColor: def.accentCol,
          isBoss,
          isWorldBoss: false,
          body: tpl.body,
          color: tpl.color,
          accent: def.accentCol,
          radius: isBoss ? 28 : (tpl.radius || 20),
          drops: tpl.drops || [],
          weaponDrops: tpl.weaponDrops || [],
          atkCd: 0.9,
          bossSkillCd: 3.5,
          hurtTimer: 0, burnTimer: 0, poisonTimer: 0, freezeTimer: 0, stunTimer: 0, dotTick: 0,
          moving: false, targetEntity: window.GameState.player,
          wanderTimer: 2, wanderAngle: 0, dead: false, respawnTimer: 9999
        };
        dungeonState.mobs.push(mob);
        window.Combat.monsters.push(mob);
      }
    });
  }

  function cleanupDungeonMobs() {
    for (let i = window.Combat.monsters.length - 1; i >= 0; i--) {
      if (window.Combat.monsters[i].isDungeonMob) window.Combat.monsters.splice(i, 1);
    }
    dungeonState.mobs = [];
  }

  function exitDungeon(victory) {
    if (!dungeonState.active) return;
    const def = dungeonState.def;
    const p = window.GameState.player;
    cleanupDungeonMobs();
    dungeonState.active = false;
    dungeonState.def = null;
    if (dungeonState.savedPos) {
      p.x = dungeonState.savedPos.x;
      p.y = dungeonState.savedPos.y;
    } else {
      p.x = 3950; p.y = 3000;
    }
    if (p.hp <= 0) p.hp = Math.round(p.maxHp * 0.55);
    p.state = 'idle';

    if (victory && def) {
      p.gold += def.goldReward;
      window.MMO.grantXp(def.xpReward);
      // Guaranteed Raid Chest Gear (Tier minTier..maxTier, Rare/Epic/Legendary)
      const dropTier = Math.min(8, Math.max(def.minTier, def.maxTier - (Math.random() < 0.45 ? 1 : 0)));
      const rar = Math.random() < 0.25 ? 'legendary' : (Math.random() < 0.65 ? 'epic' : 'rare');
      const wList = window.GameData.WEAPON_TYPES;
      const wPick = wList[Math.floor(Math.random() * wList.length)];
      const rewardItem = window.GameData.createWeaponItem(wPick.id, rar, Math.max(p.level, def.recLevel), 2, dropTier, Math.random() < 0.4 ? 2 : 1);
      window.MMO.addItemToBag(rewardItem);
      window.MMO.addItemToBag(window.GameData.createConsumableItem('scroll_enchant', 1));
      window.GameState.stats.dungeonsCleared = (window.GameState.stats.dungeonsCleared || 0) + 1;
      if (window.Progression) {
        window.Progression.unlockCosmetic('title_raid', true);
        window.Progression.onBpEvent('dungeon', 1);
      }
      if (window.GameAudio) window.GameAudio.playSfx('victory');
      window.MMO.addChat('system', 'Данж', 'Рейд «' + def.name + '» пройден! Получено: ' + rewardItem.name + ' и ' + def.goldReward + ' зол.');
      if (window.UI) window.UI.toast('Сундук Данжа: ' + rewardItem.name + ' + ' + def.goldReward + ' зол.!');
      window.MMO.saveProgress();
    } else {
      if (window.UI) window.UI.toast('Вы покинули подземелье (вещи сохранены).');
    }
  }

  // =========================================================================
  // 2. CLAN WARS & TERRITORY CONTROL (3 FORTRESSES ON WORLD MAP)
  // =========================================================================
  const FORTRESSES = [
    {
      id: 'fort_dawn',
      name: 'Форт Рассвета',
      biomeName: 'Изумрудный Лес',
      x: 2150, y: 1850, r: 120,
      ownerClan: 'Стражи Рассвета',
      ownerTag: 'DAWN',
      ownerColor: '#fbbf24',
      taxPerMin: 220,
      buffText: '+12% XP в мире',
      captureProg: 0,
      capturingTag: '',
      treasury: 450
    },
    {
      id: 'fort_ash',
      name: 'Бастион Пепла',
      biomeName: 'Пустыня и Вулкан',
      x: 6100, y: 2050, r: 120,
      ownerClan: 'Орден Пепла',
      ownerTag: 'ASH',
      ownerColor: '#f97316',
      taxPerMin: 360,
      buffText: '+12% АТК в мире',
      captureProg: 0,
      capturingTag: '',
      treasury: 720
    },
    {
      id: 'fort_abyss',
      name: 'Цитадель Тьмы',
      biomeName: 'Предел Бездны',
      x: 5900, y: 4650, r: 120,
      ownerClan: 'Тени Бездны',
      ownerTag: 'VOID',
      ownerColor: '#a855f7',
      taxPerMin: 540,
      buffText: '+18% Золота в мире',
      captureProg: 0,
      capturingTag: '',
      treasury: 1100
    }
  ];

  let taxAccum = 0;

  function applyRemoteFortressSync(data) {
    if (!data || !data.fortId) return;
    const f = FORTRESSES.find(x => x.id === data.fortId);
    if (!f) return;
    f.ownerClan = data.ownerClan || f.ownerClan;
    f.ownerTag = data.ownerTag || f.ownerTag;
    f.ownerColor = data.ownerColor || '#fbbf24';
    f.captureProg = 0;
  }

  function getTerritoryBuffs() {
    const myTag = window.GameState && window.GameState.clan ? window.GameState.clan.tag : '';
    const res = { xpPct: 0, atkPct: 0, goldPct: 0, ownedCount: 0 };
    if (!myTag) return res;
    FORTRESSES.forEach(f => {
      if (f.ownerTag === myTag) {
        res.ownedCount++;
        if (f.id === 'fort_dawn') res.xpPct += 0.12;
        if (f.id === 'fort_ash') res.atkPct += 0.12;
        if (f.id === 'fort_abyss') res.goldPct += 0.18;
      }
    });
    return res;
  }

  function collectFortressTax(fortId) {
    const f = FORTRESSES.find(x => x.id === fortId);
    const myTag = window.GameState && window.GameState.clan ? window.GameState.clan.tag : '';
    if (!f || !myTag || f.ownerTag !== myTag) {
      if (window.UI) window.UI.toast('Ваш клан не контролирует эту крепость!');
      return false;
    }
    const amt = Math.floor(f.treasury || 0);
    if (amt < 10) {
      if (window.UI) window.UI.toast('В казне крепости пока мало налогов.');
      return false;
    }
    f.treasury = 0;
    window.GameState.player.gold += amt;
    if (window.GameAudio) window.GameAudio.playSfx('coin');
    if (window.UI) window.UI.toast('Собрана дань с «' + f.name + '»: +' + amt.toLocaleString() + ' монет!');
    return true;
  }

  // =========================================================================
  // 3. RANKED PvP ARENA 1v1 / 2v2 (SAFE — NO LOOT LOSS!)
  // =========================================================================
  const LEAGUES = [
    { id: 'bronze',   name: 'Бронза',   min: 0,    color: '#cd7f32' },
    { id: 'silver',   name: 'Серебро',  min: 1200, color: '#cbd5e1' },
    { id: 'gold',     name: 'Золото',   min: 1500, color: '#fbbf24' },
    { id: 'platinum', name: 'Платина',  min: 1800, color: '#38bdf8' },
    { id: 'diamond',  name: 'Алмаз',    min: 2100, color: '#a855f7' },
    { id: 'legend',   name: 'Легенда',  min: 2500, color: '#f43f5e' }
  ];

  function getLeague(elo) {
    let cur = LEAGUES[0];
    LEAGUES.forEach(l => { if ((elo || 1000) >= l.min) cur = l; });
    return cur;
  }

  const arenaState = {
    active: false,
    mode: '1v1',
    timer: 90,
    savedPos: null,
    enemies: [],
    allies: [],
    centerX: 4000,
    centerY: 3000,
    radius: 310
  };

  function makeArenaFighter(name, lv, rating, side, x, y) {
    const pSt = window.GameState.computedStats;
    const scale = 0.85 + Math.random() * 0.25;
    const maxHp = Math.max(420, Math.round(pSt.maxHp * 2.1 * scale));
    const wTypes = ['sword', 'greatsword', 'dagger', 'staff', 'bow', 'flame_blade', 'scythe'];
    const wt = wTypes[Math.floor(Math.random() * wTypes.length)];
    const wItem = window.GameData.createWeaponItem(wt, rating >= 1500 ? 'epic' : 'rare', lv, 2, Math.min(8, Math.max(2, Math.ceil(lv / 4))));
    return {
      id: 'af_' + side + '_' + Math.random().toString(36).slice(2, 7),
      isArenaFighter: true,
      side, // 'enemy' | 'ally'
      name,
      level: lv,
      x, y,
      facingX: side === 'enemy' ? -1 : 1,
      state: 'idle',
      hp: maxHp,
      maxHp,
      atk: Math.max(22, Math.round(pSt.atk * 0.92 * scale)),
      def: Math.max(8, Math.round(pSt.def * 0.9 * scale)),
      speed: 148,
      radius: 20,
      atkCd: 0.7,
      skillCd: 3.5,
      attackTimer: 0,
      hurtTimer: 0,
      buffShield: 0,
      appearance: {
        hair: side === 'enemy' ? '#dc2626' : '#38bdf8',
        cloak: side === 'enemy' ? '#991b1b' : '#1d4ed8',
        armor: '#1e293b',
        skin: '#f7d5b0',
        eye: side === 'enemy' ? '#ef4444' : '#38bdf8'
      },
      equipment: { weapon: wItem },
      inDuel: side === 'enemy'
    };
  }

  function startArenaMatch(mode) {
    if (dungeonState.active || arenaState.active) {
      if (window.UI) window.UI.toast('Сначала завершите текущий бой!');
      return false;
    }
    const p = window.GameState.player;
    const m = mode === '2v2' ? '2v2' : '1v1';
    arenaState.active = true;
    arenaState.mode = m;
    arenaState.timer = 90;
    arenaState.savedPos = { x: p.x, y: p.y };
    arenaState.enemies = [];
    arenaState.allies = [];

    p.duelBaseMaxHp = p.maxHp;
    p.maxHp = Math.round(p.maxHp * 2.2);
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    p.mountedId = null;
    p.x = arenaState.centerX - 160;
    p.y = arenaState.centerY;

    const r = p.pvpRating || 1000;
    const names = ['Валькирия', 'Кайден', 'ТеньСевера', 'Архонт', 'Громобой', 'Сильвана', 'Драконид'];
    const pickName = () => names[Math.floor(Math.random() * names.length)];
    arenaState.enemies.push(makeArenaFighter(pickName(), p.level, r, 'enemy', arenaState.centerX + 160, arenaState.centerY - (m === '2v2' ? 45 : 0)));
    if (m === '2v2') {
      arenaState.enemies.push(makeArenaFighter(pickName(), p.level, r, 'enemy', arenaState.centerX + 160, arenaState.centerY + 45));
      arenaState.allies.push(makeArenaFighter('Союзник ' + pickName(), p.level, r, 'ally', arenaState.centerX - 160, arenaState.centerY + 55));
    }

    if (window.UI) {
      window.UI.closeModal();
      window.UI.toast('PvP-Арена ' + m + ' началась! (Безопасно: вещи не выпадают)');
    }
    if (window.GameAudio) window.GameAudio.playSfx('bounty');
    return true;
  }

  function finishArenaMatch(victory) {
    if (!arenaState.active) return;
    const p = window.GameState.player;
    const mode = arenaState.mode;
    arenaState.active = false;
    arenaState.enemies = [];
    arenaState.allies = [];
    if (arenaState.savedPos) {
      p.x = arenaState.savedPos.x;
      p.y = arenaState.savedPos.y;
    }
    p.duelBaseMaxHp = 0;
    window.GameState.recalcStats();
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    p.state = 'idle';

    if (victory) {
      const eloGain = mode === '2v2' ? 38 : 30;
      const goldGain = mode === '2v2' ? 520 : 380;
      p.pvpRating = (p.pvpRating || 1000) + eloGain;
      p.gold += goldGain;
      window.GameState.stats.arenaWins = (window.GameState.stats.arenaWins || 0) + 1;
      window.GameState.stats.duelsWon = (window.GameState.stats.duelsWon || 0) + 1;
      window.GameState.arenaTokens = (window.GameState.arenaTokens || 0) + (mode === '2v2' ? 15 : 10);
      if (p.pvpRating >= 1500 && window.Progression) {
        window.Progression.unlockCosmetic('title_arena', true);
      }
      if (window.Progression) window.Progression.onBpEvent('arena', 1);
      if (window.GameAudio) window.GameAudio.playSfx('victory');
      const lg = getLeague(p.pvpRating);
      window.MMO.addChat('system', 'Арена', 'Победа на Арене ' + mode + '! +' + eloGain + ' рейтинга (' + lg.name + '), +' + goldGain + ' зол.');
      if (window.UI) window.UI.toast('Победа на Арене! +' + eloGain + ' ELO • +' + goldGain + ' зол.');
    } else {
      const eloLoss = Math.min(18, Math.max(0, (p.pvpRating || 1000) - 800));
      p.pvpRating = Math.max(800, (p.pvpRating || 1000) - eloLoss);
      if (window.UI) window.UI.toast('Поражение на Арене (-' + eloLoss + ' ELO). Все вещи сохранены!');
    }
    window.MMO.saveProgress();
  }

  // =========================================================================
  // 4. BATTLE PETS COMPANION RUNTIME
  // =========================================================================
  const petEntity = {
    x: 3920,
    y: 3000,
    facingX: 1,
    skillTimer: 2.0,
    bobPhase: 0
  };

  function getActivePetDef() {
    const gs = window.GameState;
    if (!gs || !gs.pets || !gs.pets.activeId || !window.CosmeticsData) return null;
    return window.CosmeticsData.PET_BY_ID[gs.pets.activeId] || null;
  }

  function getActivePetLevel() {
    const gs = window.GameState;
    if (!gs || !gs.pets || !gs.pets.activeId) return 1;
    const st = gs.pets.owned && gs.pets.owned[gs.pets.activeId];
    return (st && st.lv) || 1;
  }

  function getPetStatBonuses() {
    const def = getActivePetDef();
    if (!def) return {};
    const lv = getActivePetLevel();
    const lvMult = 1 + (lv - 1) * 0.04;
    const b = def.bonuses || {};
    return {
      atkPct: (b.atkPct || 0) * lvMult,
      defPct: (b.defPct || 0) * lvMult,
      hpPct: (b.hpPct || 0) * lvMult,
      crit: Math.round((b.crit || 0) * lvMult),
      speedPct: (b.speedPct || 0) * lvMult,
      goldBonusPct: Math.round((b.goldBonusPct || 0) * lvMult),
      autoLootRange: b.autoLootRange || 0
    };
  }

  function grantPetXp(amt) {
    const gs = window.GameState;
    if (!gs || !gs.pets || !gs.pets.activeId) return;
    const st = gs.pets.owned && gs.pets.owned[gs.pets.activeId];
    if (!st) return;
    st.xp = (st.xp || 0) + (amt || 10);
    const need = Math.round(70 * Math.pow(st.lv || 1, 1.35));
    if (st.xp >= need && (st.lv || 1) < 30) {
      st.xp -= need;
      st.lv = (st.lv || 1) + 1;
      gs.recalcStats();
      const def = getActivePetDef();
      if (window.GameAudio) window.GameAudio.playSfx('pet');
      if (window.UI) window.UI.toast('Питомец «' + (def ? def.name : 'Пет') + '» вырос до ур. ' + st.lv + '!');
    }
  }

  function buyOrEquipPet(petId) {
    const def = window.CosmeticsData && window.CosmeticsData.PET_BY_ID[petId];
    if (!def) return false;
    const gs = window.GameState;
    if (!gs.pets) gs.pets = { owned: {}, activeId: null };
    if (gs.pets.owned[petId]) {
      gs.pets.activeId = gs.pets.activeId === petId ? null : petId;
      gs.recalcStats();
      window.MMO.saveProgress();
      if (window.UI) window.UI.toast(gs.pets.activeId ? ('Призван питомец: ' + def.name) : 'Питомец отозван.');
      return true;
    }
    if (gs.player.gold < def.price) {
      if (window.UI) window.UI.toast('Не хватает золота (' + def.price.toLocaleString() + ')!');
      return false;
    }
    gs.player.gold -= def.price;
    gs.pets.owned[petId] = { lv: 1, xp: 0 };
    gs.pets.activeId = petId;
    petEntity.x = gs.player.x - 32;
    petEntity.y = gs.player.y + 8;
    gs.recalcStats();
    window.MMO.saveProgress();
    if (window.GameAudio) window.GameAudio.playSfx('pet');
    if (window.UI) window.UI.toast('Вы получили боевого питомца: ' + def.name + '!');
    return true;
  }

  function feedActivePet() {
    const gs = window.GameState;
    if (!gs.pets || !gs.pets.activeId) {
      if (window.UI) window.UI.toast('Сначала призовите питомца!');
      return false;
    }
    const foodIds = ['fish_golden', 'fish_common', 'hp_potion'];
    const foundId = foodIds.find(id => window.MMO.countTemplateInBag(id) > 0);
    if (!foundId) {
      if (window.UI) window.UI.toast('Нужна рыба или зелье HP в сумке, чтобы покормить питомца!');
      return false;
    }
    window.MMO.consumeTemplateFromBag(foundId, 1);
    const gain = foundId === 'fish_golden' ? 120 : (foundId === 'fish_common' ? 55 : 30);
    grantPetXp(gain);
    window.Combat.addParticles(petEntity.x, petEntity.y, '#4ade80', 10, 80);
    if (window.GameAudio) window.GameAudio.playSfx('pet');
    if (window.UI) window.UI.toast('Питомец покормлен! +' + gain + ' XP');
    return true;
  }

  // =========================================================================
  // MAIN FRAME UPDATE & WORLD RENDERING
  // =========================================================================
  function update(dt) {
    const gs = window.GameState;
    const p = gs.player;
    if (!p) return;

    // 1. Update Active Dungeon
    if (dungeonState.active) {
      dungeonState.timer -= dt;
      // Clamp player inside dungeon arena circle
      const dx = p.x - dungeonState.centerX;
      const dy = p.y - dungeonState.centerY;
      const dist = Math.hypot(dx, dy);
      if (dist > dungeonState.radius - 20) {
        p.x = dungeonState.centerX + (dx / dist) * (dungeonState.radius - 20);
        p.y = dungeonState.centerY + (dy / dist) * (dungeonState.radius - 20);
      }
      if (dungeonState.timer <= 0) {
        if (window.UI) window.UI.toast('Время рейда истекло!');
        exitDungeon(false);
      } else {
        const alive = dungeonState.mobs.filter(m => !m.dead && m.hp > 0);
        if (alive.length === 0) {
          if (dungeonState.wave < dungeonState.def.waves.length) {
            dungeonState.wave += 1;
            spawnDungeonWave();
            if (window.UI) window.UI.toast('Волна ' + dungeonState.wave + '/' + dungeonState.def.waves.length + '!');
            if (window.GameAudio) window.GameAudio.playSfx('bounty');
          } else {
            exitDungeon(true);
          }
        }
      }
    }

    // 2. Update Active PvP Arena
    if (arenaState.active) {
      arenaState.timer -= dt;
      const dx = p.x - arenaState.centerX;
      const dy = p.y - arenaState.centerY;
      const dist = Math.hypot(dx, dy);
      if (dist > arenaState.radius - 20) {
        p.x = arenaState.centerX + (dx / dist) * (arenaState.radius - 20);
        p.y = arenaState.centerY + (dy / dist) * (arenaState.radius - 20);
      }
      const stepFighter = (f, targets) => {
        if (f.hp <= 0) return;
        if (f.hurtTimer > 0) f.hurtTimer -= dt;
        if (f.attackTimer > 0) f.attackTimer -= dt;
        if (f.atkCd > 0) f.atkCd -= dt;
        const aliveTargets = targets.filter(t => t && t.hp > 0);
        if (aliveTargets.length === 0) { f.state = 'idle'; return; }
        let tg = aliveTargets[0];
        let bestD = Math.hypot(tg.x - f.x, tg.y - f.y);
        aliveTargets.forEach(cand => {
          const d = Math.hypot(cand.x - f.x, cand.y - f.y);
          if (d < bestD) { bestD = d; tg = cand; }
        });
        const adx = tg.x - f.x, ady = tg.y - f.y;
        f.facingX = adx >= 0 ? 1 : -1;
        if (bestD > 58) {
          f.x += (adx / bestD) * f.speed * dt;
          f.y += (ady / bestD) * f.speed * dt;
          f.state = 'run';
        } else {
          f.state = f.attackTimer > 0 ? 'attack' : 'idle';
          if (f.atkCd <= 0) {
            f.atkCd = 1.05;
            f.attackTimer = 0.28;
            window.Combat.applyHit(f, tg, { atk: f.atk, crit: 14 }, 1.0, null, f.side === 'enemy' ? '#ef4444' : '#38bdf8');
          }
        }
      };
      const playerTeam = [p].concat(arenaState.allies);
      arenaState.enemies.forEach(e => stepFighter(e, playerTeam));
      arenaState.allies.forEach(a => stepFighter(a, arenaState.enemies));

      const enemiesAlive = arenaState.enemies.some(e => e.hp > 0);
      if (!enemiesAlive) {
        finishArenaMatch(true);
      } else if (arenaState.timer <= 0) {
        finishArenaMatch(false);
      }
    }

    // 3. Update Clan Fortresses (only in open world)
    taxAccum += dt;
    if (taxAccum >= 10) {
      taxAccum = 0;
      FORTRESSES.forEach(f => {
        f.treasury = Math.min(25000, (f.treasury || 0) + Math.round(f.taxPerMin / 6));
      });
    }
    if (!dungeonState.active && !arenaState.active && gs.clan && gs.clan.tag) {
      const myTag = gs.clan.tag;
      FORTRESSES.forEach(f => {
        const d = Math.hypot(p.x - f.x, p.y - f.y);
        if (d <= f.r && f.ownerTag !== myTag) {
          f.capturingTag = myTag;
          f.captureProg = Math.min(100, f.captureProg + dt * 11.5);
          if (f.captureProg >= 100) {
            f.ownerClan = gs.clan.name;
            f.ownerTag = myTag;
            f.ownerColor = '#4ade80';
            f.captureProg = 0;
            f.capturingTag = '';
            gs.recalcStats();
            if (window.Multiplayer && window.Multiplayer.sendCustomEvent) {
              window.Multiplayer.sendCustomEvent('fort_capture', {
                fortId: f.id,
                ownerClan: f.ownerClan,
                ownerTag: f.ownerTag,
                ownerColor: '#fbbf24'
              });
            }
            if (window.Progression) {
              window.Progression.unlockCosmetic('title_warlord', true);
              window.Progression.onBpEvent('fort', 1);
            }
            if (window.GameAudio) window.GameAudio.playSfx('victory');
            window.MMO.addChat('system', 'Война Кланов', 'Клан [' + myTag + '] захватил крепость «' + f.name + '»!');
            if (window.UI) window.UI.toast('Крепость «' + f.name + '» захвачена вашим кланом!');
          }
        } else if (f.capturingTag === myTag && f.captureProg > 0) {
          f.captureProg = Math.max(0, f.captureProg - dt * 6);
        }
      });
    }

    // 4. Update Active Battle Pet
    const petDef = getActivePetDef();
    if (petDef && p.state !== 'death') {
      const targetX = p.x - (p.facingX || 1) * 34;
      const targetY = p.y - 10;
      petEntity.x += (targetX - petEntity.x) * Math.min(1, dt * 6.5);
      petEntity.y += (targetY - petEntity.y) * Math.min(1, dt * 6.5);
      petEntity.facingX = p.facingX || 1;
      petEntity.bobPhase += dt;

      // Auto-loot magnet for Wolf & Cat pets
      if (petDef.bonuses && petDef.bonuses.autoLootRange) {
        window.Combat.lootNearby(petDef.bonuses.autoLootRange);
      }

      petEntity.skillTimer -= dt;
      if (petEntity.skillTimer <= 0) {
        petEntity.skillTimer = petDef.cd || 3.5;
        const petLv = getActivePetLevel();
        if (petDef.hpHealPct && p.hp < p.maxHp) {
          const heal = Math.round(p.maxHp * petDef.hpHealPct);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          window.Combat.addText(p.x, p.y - 26, '+' + heal + ' HP (Пет)', '#fde047', false);
          window.Combat.addParticles(p.x, p.y, '#fde047', 8, 70);
        }
        if (petDef.mpHeal && p.mp < p.maxMp) {
          p.mp = Math.min(p.maxMp, p.mp + petDef.mpHeal);
          window.Combat.addText(p.x, p.y - 20, '+' + petDef.mpHeal + ' MP (Пет)', '#38bdf8', false);
        }
        if (petDef.atkMult) {
          const hostiles = getInstanceHostiles().concat(window.Combat.monsters.filter(m => !m.dead));
          let near = null, bestD = 240;
          hostiles.forEach(h => {
            if (!h || h.dead || h.hp <= 0) return;
            const d = Math.hypot(h.x - p.x, h.y - p.y);
            if (d < bestD) { bestD = d; near = h; }
          });
          if (near) {
            const petAtk = Math.round((gs.computedStats.atk || 20) * petDef.atkMult * (1 + (petLv - 1) * 0.05));
            window.Combat.applyHit(p, near, { atk: petAtk, crit: 12 }, 1.0, petDef.id === 'pet_dragon' ? 'burn' : null, petDef.color);
            window.Combat.addParticles(near.x, near.y, petDef.color, 8, 90);
          }
        }
      }
    }
  }

  function getInstanceHostiles() {
    if (arenaState.active) return arenaState.enemies.filter(e => e.hp > 0);
    return [];
  }

  function drawInstanceFloor(ctx, animTime) {
    if (dungeonState.active && dungeonState.def) {
      const d = dungeonState.def;
      const cx = dungeonState.centerX, cy = dungeonState.centerY, r = dungeonState.radius;
      ctx.save();
      ctx.fillStyle = '#070913';
      ctx.fillRect(cx - r - 600, cy - r - 600, (r + 600) * 2, (r + 600) * 2);
      ctx.fillStyle = d.floorCol;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = d.accentCol;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      // Torches around dungeon perimeter
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const tx = cx + Math.cos(a) * (r - 18);
        const ty = cy + Math.sin(a) * (r - 18);
        ctx.fillStyle = '#475569';
        ctx.fillRect(tx - 5, ty - 5, 10, 10);
        ctx.fillStyle = Math.sin(animTime * 12 + i) > 0 ? '#f97316' : '#fde047';
        ctx.fillRect(tx - 3, ty - 9, 6, 6);
      }
      ctx.restore();
      return true;
    }

    if (arenaState.active) {
      const cx = arenaState.centerX, cy = arenaState.centerY, r = arenaState.radius;
      ctx.save();
      ctx.fillStyle = '#0c1020';
      ctx.fillRect(cx - r - 600, cy - r - 600, (r + 600) * 2, (r + 600) * 2);
      ctx.fillStyle = '#2d261d';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(251,191,36,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      return true;
    }
    return false;
  }

  function drawWorldOverlay(ctx, camX, camY, vw, vh, animTime) {
    // Draw Arena Fighters
    if (arenaState.active) {
      arenaState.allies.forEach(a => { if (a.hp > 0) window.Sprites.drawCharacter(ctx, a, animTime); });
      arenaState.enemies.forEach(e => { if (e.hp > 0) window.Sprites.drawCharacter(ctx, e, animTime); });
    }

    // Draw 3 Clan Fortresses in open world
    if (!dungeonState.active && !arenaState.active) {
      FORTRESSES.forEach(f => {
        if (f.x < camX - 200 || f.x > camX + vw + 200 || f.y < camY - 200 || f.y > camY + vh + 200) return;
        ctx.save();
        ctx.translate(Math.round(f.x), Math.round(f.y));
        // Capture ring
        ctx.fillStyle = 'rgba(251,191,36,0.09)';
        ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = f.ownerColor || '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        // Pixel Fortress Keep & Banner
        ctx.fillStyle = '#090b14'; ctx.fillRect(-30, -34, 60, 44);
        ctx.fillStyle = '#475569'; ctx.fillRect(-28, -32, 56, 40);
        ctx.fillStyle = '#64748b'; ctx.fillRect(-28, -38, 14, 10); ctx.fillRect(-7, -40, 14, 12); ctx.fillRect(14, -38, 14, 10);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(-9, -12, 18, 20);
        // Fluttering Clan Banner
        const wave = Math.sin(animTime * 6) * 2;
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-2, -62, 4, 24);
        ctx.fillStyle = f.ownerColor || '#ef4444'; ctx.fillRect(2, -60 + wave * 0.4, 22, 12);

        // Label
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(8,12,24,0.85)';
        ctx.fillRect(-72, -80, 144, 16);
        ctx.fillStyle = '#ffe08a';
        ctx.fillText(f.name + ' [' + f.ownerTag + ']', 0, -68);

        if (f.captureProg > 0) {
          ctx.fillStyle = '#090d1a'; ctx.fillRect(-46, 18, 92, 10);
          ctx.fillStyle = '#4ade80'; ctx.fillRect(-44, 20, 88 * (f.captureProg / 100), 6);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif';
          ctx.fillText('Захват: ' + Math.round(f.captureProg) + '%', 0, 40);
        }
        ctx.restore();
      });
    }

    // Draw Active Battle Pet next to hero
    const petDef = getActivePetDef();
    if (petDef && window.Sprites && window.Sprites.drawPet) {
      window.Sprites.drawPet(ctx, petDef, petEntity, getActivePetLevel(), animTime);
    }
  }

  function getActiveInstanceBanner() {
    if (dungeonState.active && dungeonState.def) {
      return {
        title: dungeonState.def.name + ' — Волна ' + dungeonState.wave + '/' + dungeonState.def.waves.length,
        sub: 'Таймер: ' + Math.ceil(dungeonState.timer) + 'с • Врагов: ' + dungeonState.mobs.filter(m => !m.dead && m.hp > 0).length,
        onExit: () => exitDungeon(false)
      };
    }
    if (arenaState.active) {
      return {
        title: 'PvP-Арена ' + arenaState.mode + ' (Рейтинговый бой)',
        sub: 'Таймер: ' + Math.ceil(arenaState.timer) + 'с • Безопасно (0% потерь)',
        onExit: () => finishArenaMatch(false)
      };
    }
    return null;
  }

  return {
    DUNGEONS,
    FORTRESSES,
    LEAGUES,
    getLeague,
    startDungeon,
    exitDungeon,
    isInDungeon: () => dungeonState.active,
    startArenaMatch,
    finishArenaMatch,
    isInArena: () => arenaState.active,
    getInstanceHostiles,
    applyRemoteFortressSync,
    getTerritoryBuffs,
    collectFortressTax,
    getActivePetDef,
    getActivePetLevel,
    getPetStatBonuses,
    grantPetXp,
    buyOrEquipPet,
    feedActivePet,
    getActiveInstanceBanner,
    update,
    drawInstanceFloor,
    drawWorldOverlay
  };
})();
