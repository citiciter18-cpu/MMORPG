/* ==========================================================================
   BladeRealm — 34 Diverse Smart AI Bots across 8 Roles & All 10 Biomes
   Roles: Охотник, Торговец, Собиратель, Целитель, Танк, Гладиатор, Рейдер, Новичок
   ========================================================================== */

window.Bots = (function () {
  const list = [];

  const ROLE_META = {
    hunter:    { label: 'Охотник',    color: '#e2e8f0' },
    merchant:  { label: 'Торговец',   color: '#fbbf24' },
    gatherer:  { label: 'Собиратель', color: '#4ade80' },
    healer:    { label: 'Целитель',   color: '#38bdf8' },
    tank:      { label: 'Танк',       color: '#f97316' },
    gladiator: { label: 'Гладиатор',  color: '#f43f5e' },
    raider:    { label: 'Рейдер',     color: '#c084fc' },
    newbie:    { label: 'Новичок',    color: '#a3e635' }
  };

  const BOT_PROFILES = [
    // Capital & Starting Forest (Newbies, Merchants, Healers, Hunters)
    { name: 'Артур_Pro',      cls: 'warrior',  role: 'hunter',    lv: 5,  clan: 'АЛЫЕ', weapon: 'sword',           mount: 'wolf',           hair: '#1e1b2e', cloak: '#dc2626', homeBiome: 'forest' },
    { name: 'ЭльзаМаг',       cls: 'mage',     role: 'healer',    lv: 8,  clan: 'ЛУНА', weapon: 'crystal_staff',   mount: 'unicorn',        hair: '#e2e8f0', cloak: '#2563eb', homeBiome: 'forest' },
    { name: 'Лиса_Хил',       cls: 'mage',     role: 'healer',    lv: 7,  clan: 'ЛУНА', weapon: 'staff',           mount: 'horse',          hair: '#f97316', cloak: '#16a34a', homeBiome: 'town' },
    { name: 'БаронЗолота',    cls: 'mage',     role: 'merchant',  lv: 14, clan: 'ТОРГ', weapon: 'spellbook',       mount: 'mammoth',        hair: '#854d0e', cloak: '#ca8a04', homeBiome: 'town' },
    { name: 'Купец_Влад',     cls: 'warrior',  role: 'merchant',  lv: 12, clan: 'ТОРГ', weapon: 'mace',            mount: 'horse',          hair: '#451a03', cloak: '#eab308', homeBiome: 'town' },
    { name: 'Макс_Новичок',   cls: 'warrior',  role: 'newbie',    lv: 2,  clan: 'МИР',  weapon: 'sword',           mount: 'wolf',           hair: '#78350f', cloak: '#15803d', homeBiome: 'forest' },
    { name: 'Алиса_Травник',  cls: 'mage',     role: 'gatherer',  lv: 4,  clan: 'ЛЕС',  weapon: 'wand',            mount: 'horse',          hair: '#16a34a', cloak: '#22c55e', homeBiome: 'forest' },
    { name: 'Кирилл_Лук',     cls: 'assassin', role: 'newbie',    lv: 3,  clan: 'МИР',  weapon: 'bow',             mount: 'wolf',           hair: '#1f2937', cloak: '#0d9488', homeBiome: 'forest' },
    // Crimson Swamp
    { name: 'Знахарь_Зел',    cls: 'mage',     role: 'gatherer',  lv: 8,  clan: 'АЛХ',  weapon: 'staff',           mount: 'bear',           hair: '#4c1d95', cloak: '#7c3aed', homeBiome: 'swamp' },
    { name: 'ТопкийКлык',     cls: 'assassin', role: 'hunter',    lv: 9,  clan: 'ТЕНЬ', weapon: 'poison_dagger',   mount: 'spider',         hair: '#064e3b', cloak: '#15803d', homeBiome: 'swamp' },
    { name: 'ЖелезныйЩит',    cls: 'warrior',  role: 'tank',      lv: 10, clan: 'ЩИТ',  weapon: 'warhammer',       mount: 'bear',           hair: '#334155', cloak: '#475569', homeBiome: 'swamp' },
    // Desert Solaris & Oasis
    { name: 'ТеньНочи',       cls: 'assassin', role: 'gladiator', lv: 12, clan: 'ТЕНЬ', weapon: 'dual_blades',     mount: 'tiger',          hair: '#111827', cloak: '#7c3aed', homeBiome: 'desert' },
    { name: 'Сокол_Лук',      cls: 'assassin', role: 'hunter',    lv: 10, clan: 'ВОЛК', weapon: 'bow',             mount: 'wolf',           hair: '#78350f', cloak: '#0d9488', homeBiome: 'desert' },
    { name: 'МолотТора',      cls: 'warrior',  role: 'tank',      lv: 15, clan: 'ГРОМ', weapon: 'warhammer',       mount: 'bear',           hair: '#b45309', cloak: '#2563eb', homeBiome: 'desert' },
    { name: 'ОгненныйКлык',   cls: 'warrior',  role: 'gladiator', lv: 14, clan: 'АЛЫЕ', weapon: 'flame_blade',     mount: 'tiger',          hair: '#dc2626', cloak: '#ea580c', homeBiome: 'desert' },
    { name: 'Шейх_Караван',   cls: 'mage',     role: 'merchant',  lv: 16, clan: 'ТОРГ', weapon: 'wand',            mount: 'mammoth',        hair: '#1c1917', cloak: '#f59e0b', homeBiome: 'desert' },
    { name: 'Рудокоп_Илья',   cls: 'warrior',  role: 'gatherer',  lv: 11, clan: 'КУЗН', weapon: 'axe',             mount: 'bear',           hair: '#57534e', cloak: '#92400e', homeBiome: 'desert' },
    // Port Stormhaven Coast
    { name: 'Капитан_Рэй',    cls: 'assassin', role: 'hunter',    lv: 12, clan: 'МОРЕ', weapon: 'dual_blades',     mount: 'horse',          hair: '#0f172a', cloak: '#0284c7', homeBiome: 'coast' },
    { name: 'Жемчужница',     cls: 'mage',     role: 'gatherer',  lv: 11, clan: 'МОРЕ', weapon: 'wand',            mount: 'unicorn',        hair: '#38bdf8', cloak: '#0ea5e9', homeBiome: 'coast' },
    { name: 'Контрабандист',  cls: 'assassin', role: 'merchant',  lv: 15, clan: 'ТОРГ', weapon: 'dagger',          mount: 'tiger',          hair: '#1e293b', cloak: '#b91c1c', homeBiome: 'coast' },
    { name: 'Буревестник',    cls: 'warrior',  role: 'gladiator', lv: 16, clan: 'ГРОМ', weapon: 'halberd',         mount: 'ice_wolf',       hair: '#cbd5e1', cloak: '#1d4ed8', homeBiome: 'coast' },
    // Snow Peaks & Outpost
    { name: 'Гром777',        cls: 'warrior',  role: 'hunter',    lv: 14, clan: 'ГРОМ', weapon: 'lightning_blade', mount: 'ice_wolf',       hair: '#334155', cloak: '#eab308', homeBiome: 'snow' },
    { name: 'Ведьмак_RU',     cls: 'warrior',  role: 'raider',    lv: 19, clan: 'ВОЛК', weapon: 'greatsword',      mount: 'skeleton_horse', hair: '#f1f5f9', cloak: '#475569', homeBiome: 'snow' },
    { name: 'СнежныйБарс',    cls: 'assassin', role: 'hunter',    lv: 13, clan: 'ВОЛК', weapon: 'crossbow',        mount: 'ice_wolf',       hair: '#cbd5e1', cloak: '#0284c7', homeBiome: 'snow' },
    { name: 'Ледяной_Купец',  cls: 'mage',     role: 'merchant',  lv: 17, clan: 'ТОРГ', weapon: 'frost_blade',     mount: 'mammoth',        hair: '#e0f2fe', cloak: '#0369a1', homeBiome: 'snow' },
    { name: 'Северный_Танк',  cls: 'warrior',  role: 'tank',      lv: 18, clan: 'ЩИТ',  weapon: 'greataxe',        mount: 'bear',           hair: '#94a3b8', cloak: '#1e40af', homeBiome: 'snow' },
    // Crystal Gorge
    { name: 'Архимаг_Орион',  cls: 'mage',     role: 'raider',    lv: 20, clan: 'ЛУНА', weapon: 'crystal_staff',   mount: 'phantom_horse',  hair: '#c084fc', cloak: '#6d28d9', homeBiome: 'crystal' },
    { name: 'Ювелир_Сэм',     cls: 'mage',     role: 'gatherer',  lv: 18, clan: 'КУЗН', weapon: 'spellbook',       mount: 'unicorn',        hair: '#fbbf24', cloak: '#9333ea', homeBiome: 'crystal' },
    { name: 'Клинок_Арены',   cls: 'assassin', role: 'gladiator', lv: 21, clan: 'ТЕНЬ', weapon: 'lightning_blade', mount: 'phantom_horse',  hair: '#1e1b4b', cloak: '#be123c', homeBiome: 'crystal' },
    // Ash Volcanoes & Abyss Dungeon & Secret Sanctuary
    { name: 'Драконоборец',   cls: 'warrior',  role: 'raider',    lv: 26, clan: 'ДРАК', weapon: 'legendary_sword', mount: 'dragon',         hair: '#450a0a', cloak: '#f59e0b', homeBiome: 'dungeon' },
    { name: 'АссасинX',       cls: 'assassin', role: 'gladiator', lv: 20, clan: 'ТЕНЬ', weapon: 'poison_dagger',   mount: 'spider',         hair: '#0f172a', cloak: '#15803d', homeBiome: 'dungeon' },
    { name: 'Валькирия',      cls: 'warrior',  role: 'tank',      lv: 24, clan: 'АЛЫЕ', weapon: 'halberd',         mount: 'phantom_horse',  hair: '#fde047', cloak: '#e11d48', homeBiome: 'volcano' },
    { name: 'Инферно_Маг',    cls: 'mage',     role: 'raider',    lv: 27, clan: 'ДРАК', weapon: 'flame_blade',     mount: 'fire_dragon',    hair: '#ef4444', cloak: '#991b1b', homeBiome: 'volcano' },
    { name: 'Кристалл',       cls: 'mage',     role: 'raider',    lv: 28, clan: 'ДРАК', weapon: 'ancient_artifact',mount: 'fire_dragon',    hair: '#38bdf8', cloak: '#9333ea', homeBiome: 'secret' },
    { name: 'Жнец_Смерти',    cls: 'assassin', role: 'raider',    lv: 24, clan: 'ТЕНЬ', weapon: 'scythe',          mount: 'skeleton_horse', hair: '#1e1b4b', cloak: '#9333ea', homeBiome: 'dungeon' },
    { name: 'Святой_Лекарь',  cls: 'mage',     role: 'healer',    lv: 23, clan: 'ЛУНА', weapon: 'staff',           mount: 'unicorn',        hair: '#fef08a', cloak: '#f8fafc', homeBiome: 'volcano' }
  ];

  const ROLE_CHAT = {
    merchant: [
      'Скупаю руду, жемчуг и кристаллы! Смотрите курсы на Бирже!',
      'Выставил редкое оружие на Аукцион, успейте забрать!',
      'В Солнечном Оазисе сейчас +38% за кристаллы и осколки льда!',
      'Кто продаёт Камни заточки? Плачу золотом в трейде!'
    ],
    raider: [
      'Собираю рейд на Титана Вулкана Игниса! Нужны танк и хил!',
      'Король Лич в Склепе скоро возродится, заходим с севера!',
      'Древний Дракон Бездны даёт кучу чешуи — кто в пати?'
    ],
    gatherer: [
      'В Кристальном Ущелье полно Звёздных кристаллов и Мифрила!',
      'Поймал Золотого лосося в бухте Штормхейвен!',
      'Насобирал Багровых грибов в болотах, отдам алхимикам!'
    ],
    gladiator: [
      'Кто на дуэль? Ставка — золото и PvP рейтинг!',
      'В Песках Соляриса горячее PvP, приходите проверить билд!'
    ],
    healer: [
      'Свободный хилер ищет пати на фарм боссов — хилю на фулл!',
      'Не забывайте брать эликсиры перед походом в Вулканы!'
    ],
    tank: [
      'Танк готов держать босса в Подземелье или на Побережье!',
      'Заточил броню до +5, теперь держу удары Дракона!'
    ],
    hunter: [
      'Выбил эпический клинок с орков в пустыне!',
      'Корсары у порта отлично сыплют жемчуг и монеты!'
    ],
    newbie: [
      'Народ, подскажите, где лучше всего заработать первое золото?',
      'Куплю недорогое оружие на старт, я в Изумрудном лесу!'
    ]
  };

  let chatTimer = 5;

  function init() {
    list.length = 0;
    BOT_PROFILES.forEach((bp, idx) => {
      const biome = window.World.BIOMES.find(b => b.id === bp.homeBiome) || window.World.BIOMES[0];
      const spawnX = biome.wp.x + (Math.random() - 0.5) * 650;
      const spawnY = biome.wp.y + (Math.random() - 0.5) * 520;
      const rar = bp.lv >= 22 ? 'legendary' : (bp.lv >= 15 ? 'epic' : (bp.lv >= 9 ? 'rare' : 'uncommon'));
      const weapon = window.GameData.createWeaponItem(bp.weapon, rar, bp.lv, Math.floor(bp.lv / 4));
      const armor = window.GameData.createArmorItem(bp.lv > 16 ? 'armor_abyss' : 'armor_crimson', rar, bp.lv, 1);

      // Role-specialized tradeable inventory!
      const inv = [];
      const gearCount = bp.role === 'merchant' ? 5 : 3;
      for (let k = 0; k < gearCount; k++) {
        const rw = window.GameData.WEAPON_TYPES[Math.floor(Math.random() * window.GameData.WEAPON_TYPES.length)];
        inv.push(window.GameData.createWeaponItem(rw.id, window.GameData.rollRarity(bp.lv + (bp.role === 'merchant' ? 8 : 0)), Math.max(1, bp.lv - 2 + k), bp.role === 'raider' ? 2 : 0));
      }
      if (bp.role === 'gatherer' || bp.role === 'merchant') {
        const resPool = ['iron_ore', 'mithril_ore', 'herb_leaf', 'swamp_shroom', 'desert_spice', 'sea_pearl', 'frost_shard', 'star_crystal', 'upgrade_stone'];
        for (let r = 0; r < 3; r++) {
          const rid = resPool[Math.floor(Math.random() * resPool.length)];
          inv.push(window.GameData.createConsumableItem(rid, 2 + Math.floor(Math.random() * 5)));
        }
      } else {
        inv.push(window.GameData.createConsumableItem('upgrade_stone', 2 + Math.floor(Math.random() * 4)));
        inv.push(window.GameData.createConsumableItem('hp_potion_lg', 3 + Math.floor(Math.random() * 4)));
        if (bp.lv >= 16) inv.push(window.GameData.createConsumableItem(Math.random() < 0.5 ? 'star_crystal' : 'magma_core', 1 + Math.floor(Math.random() * 2)));
      }

      const hpMult = bp.role === 'tank' ? 1.45 : (bp.role === 'raider' ? 1.2 : 1.0);
      const maxHp = Math.round((220 + bp.lv * 50) * hpMult);
      const baseGold = bp.role === 'merchant' ? (3500 + bp.lv * 480) : (900 + bp.lv * 320);

      list.push({
        id: 'bot_' + (idx + 1),
        isBot: true,
        name: bp.name,
        cls: bp.cls,
        role: bp.role,
        roleLabel: ROLE_META[bp.role]?.label || 'Игрок',
        roleColor: ROLE_META[bp.role]?.color || '#e2e8f0',
        level: bp.lv,
        clanTag: bp.clan,
        x: Math.max(140, Math.min(window.World.WIDTH - 140, spawnX)),
        y: Math.max(140, Math.min(window.World.HEIGHT - 140, spawnY)),
        homeBiome: bp.homeBiome,
        facingX: 1,
        hp: maxHp,
        maxHp,
        mp: 160 + bp.lv * 16,
        maxMp: 160 + bp.lv * 16,
        def: Math.round((12 + bp.lv * 2.3) * (bp.role === 'tank' ? 1.35 : 1.0)),
        speed: 112 + Math.min(44, bp.lv),
        gold: baseGold + Math.floor(Math.random() * 1400),
        pvpRating: 980 + bp.lv * 24 + (bp.role === 'gladiator' ? 220 : 0) + Math.floor(Math.random() * 140),
        power: Math.round(weapon.stats.atk * 3.2 + maxHp * 0.25 + bp.lv * 15),
        equipment: { weapon, armor },
        mountedId: Math.random() < 0.65 ? bp.mount : null,
        ownedMountId: bp.mount,
        appearance: { hair: bp.hair, cloak: bp.cloak, armor: bp.role === 'tank' ? '#334155' : '#20263b', skin: '#f5cfa0', eye: bp.role === 'gladiator' ? '#ef4444' : '#38bdf8' },
        inventory: inv,
        state: 'idle',
        aiMode: bp.role,
        target: null,
        gatherNode: null,
        moveGoal: null,
        inParty: false,
        inDuel: false,
        attackTimer: 0,
        attackDuration: 0.3,
        attackCooldown: 0,
        skillTimer: 0,
        skillCooldowns: {},
        hurtTimer: 0,
        buffShield: 0,
        buffHaste: 0,
        thinkTimer: Math.random() * 1.5
      });
    });
  }

  function byId(id) {
    return list.find(b => b.id === id) || null;
  }

  function getStats(bot) {
    const w = bot.equipment.weapon;
    return {
      atk: Math.round(((w && w.stats ? w.stats.atk : 18) + bot.level * 4) * (bot.role === 'gladiator' || bot.role === 'raider' ? 1.12 : 1.0)),
      crit: (w && w.stats ? w.stats.crit : 10) + (bot.buffHaste > 0 ? 25 : 0) + (bot.role === 'gladiator' ? 8 : 0),
      def: bot.def
    };
  }

  function respondToPlayerChat(msg) {
    const lower = msg.toLowerCase();
    let bot = list[Math.floor(Math.random() * list.length)];
    let reply = null;
    if (lower.includes('привет') || lower.includes('ку') || lower.includes('hi') || lower.includes('здрав')) {
      reply = 'Привет, ' + window.GameState.player.name + '! Удачного фарма и выгодных сделок!';
    } else if (lower.includes('трейд') || lower.includes('обмен') || lower.includes('куплю') || lower.includes('продам') || lower.includes('бирж')) {
      bot = list.find(b => b.role === 'merchant') || bot;
      reply = 'Я торговец — загляни на Биржу или кидай мне трейд, дам отличную цену!';
    } else if (lower.includes('групп') || lower.includes('пати') || lower.includes('босс') || lower.includes('рейд')) {
      bot = list.find(b => b.role === 'tank' || b.role === 'healer' || b.role === 'raider') || bot;
      reply = 'Я готов в рейд! Приглашай меня в группу, разнесём босса вместе!';
    } else if (lower.includes('дуэль') || lower.includes('пвп') || lower.includes('pvp')) {
      bot = list.find(b => b.role === 'gladiator') || bot;
      reply = 'Принимаю вызов! Нажми на меня и жми «Дуэль» — проверим кто сильнее!';
    } else if (Math.random() < 0.7) {
      const pool = ROLE_CHAT[bot.role] || ROLE_CHAT.hunter;
      reply = pool[Math.floor(Math.random() * pool.length)];
    }
    if (reply && bot) {
      setTimeout(() => {
        window.MMO.addChat(bot.role === 'merchant' ? 'trade' : 'world', bot.name, reply, bot.id);
      }, 850 + Math.random() * 1400);
    }
  }

  function update(dt) {
    const player = window.GameState.player;

    // Periodic ambient live MMORPG chatter tailored by bot archetype
    chatTimer -= dt;
    if (chatTimer <= 0) {
      chatTimer = 14 + Math.random() * 16;
      const bot = list[Math.floor(Math.random() * list.length)];
      if (bot) {
        const pool = ROLE_CHAT[bot.role] || ROLE_CHAT.hunter;
        const text = pool[Math.floor(Math.random() * pool.length)];
        const ch = bot.role === 'merchant' ? 'trade' : 'world';
        window.MMO.addChat(ch, bot.name, text, bot.id);
      }
    }

    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (b.attackTimer > 0) b.attackTimer -= dt;
      if (b.attackCooldown > 0) b.attackCooldown -= dt;
      if (b.hurtTimer > 0) b.hurtTimer -= dt;
      if (b.skillTimer > 0) { b.skillTimer -= dt; if (b.skillTimer <= 0) b.state = 'idle'; }
      if (b.buffShield > 0) b.buffShield -= dt;
      if (b.buffHaste > 0) b.buffHaste -= dt;
      Object.keys(b.skillCooldowns).forEach(k => {
        if (b.skillCooldowns[k] > 0) b.skillCooldowns[k] = Math.max(0, b.skillCooldowns[k] - dt);
      });

      b.mp = Math.min(b.maxMp, b.mp + 7 * dt);
      if (b.hp < b.maxHp * 0.35 && !b.inDuel) {
        b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.45);
        window.Combat.addParticles(b.x, b.y, '#ef4444', 6, 60);
      } else if (!b.inDuel) {
        b.hp = Math.min(b.maxHp, b.hp + 5 * dt);
      }

      const w = b.equipment.weapon;
      const wRange = (w && w.stats ? w.stats.range : 68);
      const mountObj = b.mountedId ? window.GameData.MOUNT_BY_ID[b.mountedId] : null;
      const moveSpd = b.speed + (mountObj ? mountObj.speedBonus * 0.72 : 0);

      // 1) DUEL MODE against Player (Long Tactical PvP AI: shields, potions, strafing & skills)
      if (b.inDuel) {
        b.mountedId = null;
        if (b.duelHealCd > 0) b.duelHealCd -= dt;

        // Tactical defensive shield below 65% HP
        if (b.hp < b.maxHp * 0.65 && b.buffShield <= 0 && !b.skillCooldowns.aegis_shield) {
          window.Combat.castSkill(b, 'aegis_shield', player, getStats(b));
        }

        // Tactical duel healing potion (up to 2 per duel) below 42% HP
        if ((b.duelPots || 0) > 0 && b.hp < b.maxHp * 0.42 && (!b.duelHealCd || b.duelHealCd <= 0)) {
          b.duelPots--;
          b.duelHealCd = 9.0;
          const heal = Math.round(b.maxHp * 0.28);
          b.hp = Math.min(b.maxHp, b.hp + heal);
          window.Combat.addParticles(b.x, b.y - 6, '#4ade80', 10, 85);
          window.Combat.addText(b.x, b.y - 24, '+' + heal + ' HP (Зелье)', '#4ade80', false);
        }

        const dx = player.x - b.x;
        const dy = player.y - b.y;
        const dist = Math.hypot(dx, dy);
        b.facingX = dx >= 0 ? 1 : -1;
        if (dist > wRange * 0.92) {
          b.x += (dx / dist) * moveSpd * dt;
          b.y += (dy / dist) * moveSpd * dt;
          b.state = 'run';
        } else {
          const strafe = Math.sin(performance.now() * 0.0028 + i) * 66;
          b.x += (-dy / Math.max(1, dist)) * strafe * dt;
          b.y += (dx / Math.max(1, dist)) * strafe * dt;
          b.state = 'idle';
          if (b.attackCooldown <= 0) {
            const duelSkill = b.cls === 'mage' ? 'fire_meteor' : (b.cls === 'assassin' ? 'shadow_blink' : 'crimson_slash');
            if (!b.skillCooldowns[duelSkill] && Math.random() < (b.role === 'gladiator' ? 0.48 : 0.34)) {
              window.Combat.castSkill(b, duelSkill, player, getStats(b));
            } else {
              window.Combat.performBasicAttack(b, player, getStats(b));
            }
            b.attackCooldown = Math.max(b.attackCooldown, 0.82);
          }
        }
        continue;
      }

      // 2) PARTY FOLLOW & ROLE-AWARE ASSIST MODE (Healers heal HP/MP, Tanks shield, DPS casts skills!)
      if (b.inParty) {
        const distP = Math.hypot(player.x - b.x, player.y - b.y);
        if (distP > 480) {
          b.x = player.x - 45 + (Math.random() - 0.5) * 40;
          b.y = player.y + 35 + (Math.random() - 0.5) * 40;
        }
        if ((b.role === 'healer' || b.cls === 'mage') && player.hp > 0 && player.hp < player.maxHp * 0.72 && (!b.healCd || b.healCd <= 0)) {
          b.healCd = b.role === 'healer' ? 6 : 9;
          const heal = Math.round(player.maxHp * (b.role === 'healer' ? 0.30 : 0.20));
          player.hp = Math.min(player.maxHp, player.hp + heal);
          if (b.role === 'healer') player.mp = Math.min(player.maxMp, player.mp + 30);
          window.Combat.addText(player.x, player.y - 24, '+' + heal + ' HP (' + b.name + ')', '#4ade80', false);
        }
        if (b.healCd > 0) b.healCd -= dt;

        let nearMob = null, bestD = 290;
        window.Combat.monsters.forEach(m => {
          if (m.dead) return;
          const d = Math.hypot(m.x - player.x, m.y - player.y);
          if (d < bestD) { bestD = d; nearMob = m; }
        });

        if (nearMob && distP < 370) {
          b.mountedId = null;
          const dx = nearMob.x - b.x;
          const dy = nearMob.y - b.y;
          const d = Math.hypot(dx, dy);
          b.facingX = dx >= 0 ? 1 : -1;
          if (b.role === 'tank' && b.buffShield <= 0 && !b.skillCooldowns.aegis_shield) {
            window.Combat.castSkill(b, 'aegis_shield', nearMob, getStats(b));
          }
          if (d > wRange) {
            b.x += (dx / d) * moveSpd * dt;
            b.y += (dy / d) * moveSpd * dt;
            b.state = 'run';
          } else {
            b.state = 'idle';
            if (b.attackCooldown <= 0) {
              if (b.role === 'raider' && !b.skillCooldowns.whirlwind && Math.random() < 0.3) {
                window.Combat.castSkill(b, 'whirlwind', nearMob, getStats(b));
              } else {
                window.Combat.performBasicAttack(b, nearMob, getStats(b));
              }
            }
          }
        } else if (distP > 85) {
          b.mountedId = distP > 170 ? b.ownedMountId : null;
          b.x += ((player.x - b.x) / distP) * moveSpd * dt;
          b.y += ((player.y - b.y) / distP) * moveSpd * dt;
          b.facingX = player.x >= b.x ? 1 : -1;
          b.state = distP > 140 ? 'run' : 'walk';
        } else {
          b.state = 'idle';
        }
        continue;
      }

      // 3) AUTONOMOUS ROLE-BASED OPEN WORLD AI
      b.thinkTimer -= dt;
      if (b.thinkTimer <= 0) {
        b.thinkTimer = 1.6 + Math.random() * 2.2;

        if (b.role === 'gatherer') {
          // Gatherer bots seek out nearby active resource nodes!
          let bestNode = null, bestD = 540;
          const nodes = window.World.resourceNodes;
          for (let k = 0; k < nodes.length; k++) {
            const rn = nodes[k];
            if (rn.respawn > 0) continue;
            const d = Math.hypot(rn.x - b.x, rn.y - b.y);
            if (d < bestD) { bestD = d; bestNode = rn; }
          }
          b.gatherNode = bestNode;
          b.target = null;
        } else if (b.role === 'merchant') {
          // Merchants patrol near their settlement trade hub
          const bm = window.World.BIOMES.find(x => x.id === b.homeBiome) || window.World.BIOMES[0];
          b.target = null;
          b.moveGoal = {
            x: bm.wp.x + (Math.random() - 0.5) * 360,
            y: bm.wp.y + (Math.random() - 0.5) * 280
          };
          b.mountedId = Math.random() < 0.5 ? b.ownedMountId : null;
        } else if (b.homeBiome !== 'town') {
          let chosen = null, best = b.role === 'raider' ? 540 : 400;
          for (let k = 0; k < window.Combat.monsters.length; k++) {
            const m = window.Combat.monsters[k];
            if (m.dead) continue;
            const d = Math.hypot(m.x - b.x, m.y - b.y);
            const lvCap = b.role === 'raider' ? b.level + 10 : b.level + 6;
            if (d < best && m.level <= lvCap) {
              best = d; chosen = m;
            }
          }
          b.target = chosen;
        }

        if (!b.target && !b.gatherNode && !b.moveGoal) {
          const bm = window.World.BIOMES.find(x => x.id === b.homeBiome) || window.World.BIOMES[0];
          b.moveGoal = {
            x: bm.x + 160 + Math.random() * Math.max(160, bm.w - 320),
            y: bm.y + 160 + Math.random() * Math.max(160, bm.h - 320)
          };
          b.mountedId = Math.random() < 0.72 ? b.ownedMountId : null;
        }
      }

      if (b.gatherNode && b.gatherNode.respawn <= 0) {
        const dx = b.gatherNode.x - b.x;
        const dy = b.gatherNode.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 38) {
          b.x += (dx / d) * moveSpd * 0.78 * dt;
          b.y += (dy / d) * moveSpd * 0.78 * dt;
          b.facingX = dx >= 0 ? 1 : -1;
          b.state = b.mountedId ? 'run' : 'walk';
        } else {
          b.mountedId = null;
          b.state = 'idle';
          // Gatherer visually mines the node & stocks trade bag
          b.gatherNode.respawn = 16;
          if (Math.hypot(b.x - player.x, b.y - player.y) < 420) {
            window.Combat.addParticles(b.gatherNode.x, b.gatherNode.y, b.gatherNode.color, 8, 70);
          }
          if (b.inventory.length < 14) {
            b.inventory.push(window.GameData.createConsumableItem(b.gatherNode.itemId, 1));
          }
          b.gatherNode = null;
        }
      } else if (b.target && !b.target.dead) {
        b.mountedId = null;
        const dx = b.target.x - b.x;
        const dy = b.target.y - b.y;
        const d = Math.hypot(dx, dy);
        b.facingX = dx >= 0 ? 1 : -1;
        if (d > wRange) {
          b.x += (dx / d) * moveSpd * dt;
          b.y += (dy / d) * moveSpd * dt;
          b.state = 'run';
        } else {
          b.state = 'idle';
          if (b.attackCooldown <= 0) {
            window.Combat.performBasicAttack(b, b.target, getStats(b));
          }
        }
      } else if (b.moveGoal) {
        const dx = b.moveGoal.x - b.x;
        const dy = b.moveGoal.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 26) {
          b.x += (dx / d) * moveSpd * 0.74 * dt;
          b.y += (dy / d) * moveSpd * 0.74 * dt;
          b.facingX = dx >= 0 ? 1 : -1;
          b.state = b.mountedId ? 'run' : 'walk';
        } else {
          b.moveGoal = null;
          b.state = 'idle';
        }
      }
    }
  }

  function drawAll(ctx, camX, camY, viewW, viewH, animTime) {
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (b.x < camX - 70 || b.x > camX + viewW + 70 || b.y < camY - 70 || b.y > camY + viewH + 70) continue;
      window.Sprites.drawCharacter(ctx, b, animTime);
    }
  }

  return {
    list,
    ROLE_META,
    init,
    byId,
    getStats,
    respondToPlayerChat,
    update,
    drawAll
  };
})();
