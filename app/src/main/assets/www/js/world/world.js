/* ==========================================================================
   BladeRealm — Expanded Open World Map (8000 x 6000), 10 Biomes, Regional
   Towns, Caravan Merchants, Fishing Spots, Props & Resource Nodes
   ========================================================================== */

window.World = (function () {
  const WIDTH = 8000;
  const HEIGHT = 6000;

  // Clean 3x3 Mega-World Grid + Safe Capital + Secret Sanctuary (10 Biomes)
  const BIOMES = [
    { id: 'town',    name: 'Столица Аэтельгард',        x: 3250, y: 2450, w: 1400, h: 1100, safe: true,  ground: '#4c8c3a', accent: '#62a84b', mapCol: '#4f9c42', wp: { x: 3950, y: 3000 }, bonusGroup: 'gear',   bonusPct: 12 },
    { id: 'forest',  name: 'Изумрудный Лес и Дубрава',  x: 0,    y: 0,    w: 2800, h: 2200, safe: false, ground: '#3e7f34', accent: '#519a42', mapCol: '#2e6f2a', wp: { x: 1850, y: 1550 }, bonusGroup: 'herbs',  bonusPct: 15 },
    { id: 'swamp',   name: 'Багровые Болота',           x: 0,    y: 2200, w: 2600, h: 1900, safe: false, ground: '#2f4538', accent: '#3d5849', mapCol: '#365445', wp: { x: 1300, y: 3100 }, bonusGroup: 'ore',    bonusPct: 30 },
    { id: 'coast',   name: 'Порт Штормхейвен',          x: 0,    y: 4100, w: 2600, h: 1900, safe: false, ground: '#d6be8a', accent: '#e4cf9f', mapCol: '#2b7bb9', wp: { x: 1250, y: 4950 }, bonusGroup: 'boss',   bonusPct: 35 },
    { id: 'desert',  name: 'Пески Соляриса и Оазис',    x: 2800, y: 0,    w: 2800, h: 2200, safe: false, ground: '#d4a652', accent: '#e3bb6f', mapCol: '#c79740', wp: { x: 4200, y: 1200 }, bonusGroup: 'gems',   bonusPct: 38 },
    { id: 'volcano', name: 'Пепельные Вулканы',         x: 5600, y: 0,    w: 2400, h: 2200, safe: false, ground: '#38221e', accent: '#4d2c26', mapCol: '#992b1b', wp: { x: 6750, y: 1150 }, bonusGroup: 'herbs',  bonusPct: 40 },
    { id: 'crystal', name: 'Кристальное Ущелье',        x: 5200, y: 2200, w: 2800, h: 1900, safe: false, ground: '#2a224d', accent: '#3a2f6b', mapCol: '#6d35b8', wp: { x: 6550, y: 3100 }, bonusGroup: 'exotic', bonusPct: 35 },
    { id: 'snow',    name: 'Ледяные Пики и Застава',    x: 2600, y: 3900, w: 2600, h: 2100, safe: false, ground: '#cbd5e1', accent: '#e2e8f0', mapCol: '#9fb8d1', wp: { x: 3900, y: 4900 }, bonusGroup: 'exotic', bonusPct: 38 },
    { id: 'dungeon', name: 'Склеп и Врата Бездны',      x: 5200, y: 4100, w: 2800, h: 1900, safe: false, ground: '#251d33', accent: '#36294c', mapCol: '#412659', wp: { x: 6400, y: 4950 }, bonusGroup: 'herbs',  bonusPct: 30 },
    { id: 'secret',  name: 'Секретное Святилище',       x: 160,  y: 160,  w: 760,  h: 600,  safe: false, ground: '#1f3b4d', accent: '#2e5870', mapCol: '#0ea5e9', wp: { x: 540,  y: 460 },  bonusGroup: 'boss',   bonusPct: 42 }
  ];

  // Central Plains Buffer surrounding Capital
  const PLAINS_FALLBACK = { id: 'forest', name: 'Центральные Равнины', safe: false, ground: '#458736', accent: '#569d44', mapCol: '#387b2f', bonusGroup: 'gear', bonusPct: 10 };

  const NPCS = [
    // Capital Aethelgard
    { id: 'npc_merchant',   name: 'Торговец Маркус',     role: 'Магазин',          action: 'shop',    x: 3770, y: 2870, color: '#f59e0b', iconKey: 'shop' },
    { id: 'npc_blacksmith', name: 'Кузнец Торин',        role: 'Крафт и Заточка',  action: 'craft',   x: 4130, y: 2870, color: '#ef4444', iconKey: 'craft' },
    { id: 'npc_auction',    name: 'Аукционист Валерия',  role: 'Аукцион',          action: 'auction', x: 3950, y: 2770, color: '#a855f7', iconKey: 'auction' },
    { id: 'npc_broker',     name: 'Маклер Эдгар',        role: 'Биржа и Экономика',action: 'economy', x: 3950, y: 3170, color: '#fbbf24', iconKey: 'coin' },
    { id: 'npc_quest',      name: 'Старейшина Элдрин',   role: 'Задания',          action: 'quests',  x: 3720, y: 3080, color: '#38bdf8', iconKey: 'quests' },
    { id: 'npc_storage',    name: 'Хранитель Банка',     role: 'Склад',            action: 'storage', x: 3690, y: 2980, color: '#22c55e', iconKey: 'storage' },
    { id: 'npc_guild',      name: 'Магистр Кланов',      role: 'Гильдии',          action: 'clan',    x: 4210, y: 3050, color: '#fbbf24', iconKey: 'clan' },
    // Regional Settlements & Caravan Merchants
    { id: 'npc_village',    name: 'Фермер Бран',         role: 'Деревня Дубрава',  action: 'quests',  x: 1850, y: 1470, color: '#4ade80', iconKey: 'quests' },
    { id: 'npc_oasis',      name: 'Купец Хасан (Оазис)', role: 'Биржа +38% Кристаллы', action: 'economy', x: 4200, y: 1120, color: '#f59e0b', iconKey: 'coin' },
    { id: 'npc_port',       name: 'Капитан Морган',      role: 'Порт +35% Трофеи', action: 'economy', x: 1250, y: 4860, color: '#38bdf8', iconKey: 'shop' },
    { id: 'npc_snow_tr',    name: 'Северный Скупщик',    role: 'Застава +38% Экзотика', action: 'economy', x: 3900, y: 4820, color: '#7dd3fc', iconKey: 'coin' },
    { id: 'npc_witch',      name: 'Ведьма Моргана',      role: 'Алхимия Болот',    action: 'craft',   x: 1300, y: 3020, color: '#c084fc', iconKey: 'craft' }
  ];

  const FISHING_SPOTS = [
    { id: 'fish_town',    x: 3440, y: 3180, r: 95,  name: 'Пруд Аэтельгарда',     biome: 'town' },
    { id: 'fish_forest',  x: 1520, y: 1850, r: 110, name: 'Лесное озеро Дубравы', biome: 'forest' },
    { id: 'fish_swamp',   x: 920,  y: 3380, r: 100, name: 'Тёмная заводь Болот',  biome: 'swamp' },
    { id: 'fish_port',    x: 780,  y: 5250, r: 135, name: 'Бухта Штормхейвен',    biome: 'coast' },
    { id: 'fish_oasis',   x: 4460, y: 1350, r: 95,  name: 'Солнечный Оазис',      biome: 'desert' },
    { id: 'fish_ice',     x: 4260, y: 5180, r: 105, name: 'Ледяная прорубь',      biome: 'snow' },
    { id: 'fish_crystal', x: 6950, y: 3320, r: 95,  name: 'Хрустальный источник', biome: 'crystal' }
  ];

  const props = [];
  const resourceNodes = [];

  const spawnZones = [
    // Emerald Forest & Central Plains
    { type: 'wolf',          x: 2550, y: 2150, r: 380, count: 9 },
    { type: 'wolf',          x: 1450, y: 1200, r: 420, count: 9 },
    { type: 'goblin',        x: 2100, y: 900,  r: 420, count: 9 },
    { type: 'goblin',        x: 1180, y: 1920, r: 360, count: 8 },
    // Crimson Swamp
    { type: 'swamp_troll',   x: 820,  y: 2650, r: 420, count: 9 },
    { type: 'swamp_troll',   x: 1850, y: 3420, r: 400, count: 8 },
    { type: 'goblin',        x: 1900, y: 2620, r: 360, count: 7 },
    // Desert Solaris
    { type: 'orc',           x: 3450, y: 780,  r: 460, count: 10 },
    { type: 'orc',           x: 4950, y: 1420, r: 460, count: 10 },
    { type: 'orc',           x: 3420, y: 1750, r: 380, count: 7 },
    // Port Stormhaven Coast
    { type: 'corsair',       x: 1850, y: 4720, r: 420, count: 9 },
    { type: 'corsair',       x: 1050, y: 5520, r: 400, count: 8 },
    { type: 'boss_kraken',   x: 680,  y: 4550, r: 95,  count: 1 },
    // Snow Peaks
    { type: 'skeleton',      x: 3150, y: 4550, r: 440, count: 9 },
    { type: 'skeleton',      x: 4620, y: 5380, r: 420, count: 8 },
    { type: 'ice_wolf',      x: 3350, y: 5480, r: 440, count: 9 },
    // Crystal Gorge
    { type: 'crystal_golem', x: 6100, y: 2780, r: 440, count: 9 },
    { type: 'crystal_golem', x: 7280, y: 3520, r: 440, count: 9 },
    // Ash Volcanoes
    { type: 'magma_elem',    x: 6200, y: 820,  r: 440, count: 9 },
    { type: 'dragon',        x: 7250, y: 1480, r: 420, count: 7 },
    { type: 'boss_volcano',  x: 7180, y: 620,  r: 90,  count: 1 },
    // Abyss Dungeon
    { type: 'zombie',        x: 5850, y: 4650, r: 420, count: 9 },
    { type: 'demon',         x: 6850, y: 4650, r: 440, count: 9 },
    { type: 'dragon',        x: 6950, y: 5520, r: 380, count: 6 },
    { type: 'boss_lich',     x: 5980, y: 5480, r: 95,  count: 1 },
    { type: 'world_dragon',  x: 7380, y: 5250, r: 85,  count: 1 },
    // Secret Sanctuary
    { type: 'boss_ancient',  x: 540,  y: 410,  r: 75,  count: 1 }
  ];

  function mulberry32(a) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getBiomeAt(x, y) {
    // 1. Secret Sanctuary (NW)
    const sec = BIOMES[9];
    if (x >= sec.x && x <= sec.x + sec.w && y >= sec.y && y <= sec.y + sec.h) return sec;
    // 2. Central Safe Capital
    const town = BIOMES[0];
    if (x >= town.x && x <= town.x + town.w && y >= town.y && y <= town.y + town.h) return town;
    // 3. Clean 3x3 Regional Grid
    if (y < 2200) {
      if (x < 2800) return BIOMES[1]; // Forest
      if (x < 5600) return BIOMES[4]; // Desert
      return BIOMES[5]; // Volcano
    }
    if (y < 4100) {
      if (x < 2600) return BIOMES[2]; // Swamp
      if (x >= 5200) return BIOMES[6]; // Crystal Gorge
      if (y >= 3900) return BIOMES[7]; // Snow border
      return PLAINS_FALLBACK; // Central Plains around Capital
    }
    if (x < 2600) return BIOMES[3]; // Stormhaven Coast
    if (x < 5200) return BIOMES[7]; // Snow Peaks
    return BIOMES[8]; // Dungeon
  }

  function init() {
    props.length = 0;
    resourceNodes.length = 0;
    const rand = mulberry32(99042);

    // Settlements: Capital, Emerald Village, Oasis Trading Post, Port Stormhaven, Snow Outpost, Swamp Hut
    const buildings = [
      // Capital Aethelgard
      { type: 'house', x: 3650, y: 2740 },
      { type: 'house', x: 4250, y: 2740 },
      { type: 'house', x: 3560, y: 2960 },
      { type: 'house', x: 4340, y: 2960 },
      { type: 'house', x: 3680, y: 3210 },
      { type: 'house', x: 4220, y: 3210 },
      { type: 'fountain', x: 3950, y: 2980 },
      // Emerald Village
      { type: 'house', x: 1740, y: 1400 },
      { type: 'house', x: 1960, y: 1400 },
      // Desert Oasis Post
      { type: 'tent', x: 4080, y: 1080 },
      { type: 'tent', x: 4320, y: 1080 },
      // Stormhaven Port
      { type: 'house', x: 1120, y: 4780 },
      { type: 'house', x: 1380, y: 4780 },
      { type: 'pier',  x: 1020, y: 5060 },
      // Snow Outpost
      { type: 'house', x: 3780, y: 4740 },
      { type: 'house', x: 4030, y: 4740 },
      // Swamp Witch Hut
      { type: 'house', x: 1300, y: 2930 },
      // Secret Sanctuary Portal Arch
      { type: 'rune_arch', x: 540, y: 560 }
    ];
    buildings.forEach(b => props.push(b));

    // Scenic Props across the huge 8000 x 6000 world
    for (let i = 0; i < 640; i++) {
      const x = 90 + rand() * (WIDTH - 180);
      const y = 90 + rand() * (HEIGHT - 180);
      // Keep town plazas & main cross-roads clear
      if (Math.hypot(x - 3950, y - 2980) < 420) continue;
      if (Math.hypot(x - 1850, y - 1470) < 190) continue;
      if (Math.hypot(x - 4200, y - 1150) < 190) continue;
      if (Math.hypot(x - 1250, y - 4880) < 220) continue;
      if (Math.hypot(x - 3900, y - 4850) < 190) continue;
      if (Math.abs(y - 2980) < 75 && x > 1250 && x < 6700) continue;
      if (Math.abs(x - 3950) < 75 && y > 1100 && y < 4950) continue;

      const b = getBiomeAt(x, y);
      if (b.id === 'forest' || b.id === 'town') {
        props.push({ type: rand() < 0.74 ? 'tree' : 'rock', x, y, s: 0.85 + rand() * 0.45 });
      } else if (b.id === 'swamp') {
        props.push({ type: rand() < 0.58 ? 'swamp_tree' : 'giant_shroom', x, y, s: 0.85 + rand() * 0.4 });
      } else if (b.id === 'coast') {
        props.push({ type: rand() < 0.65 ? 'palm' : 'rock', x, y, s: 0.9 + rand() * 0.35 });
      } else if (b.id === 'desert') {
        props.push({ type: rand() < 0.55 ? 'cactus' : (rand() < 0.5 ? 'obelisk' : 'palm'), x, y, s: 0.9 + rand() * 0.35 });
      } else if (b.id === 'volcano') {
        props.push({ type: rand() < 0.52 ? 'lava_pool' : 'obsidian', x, y, s: 0.9 + rand() * 0.45 });
      } else if (b.id === 'crystal') {
        props.push({ type: rand() < 0.68 ? 'amethyst_pillar' : 'obsidian', x, y, s: 0.9 + rand() * 0.4 });
      } else if (b.id === 'snow') {
        props.push({ type: rand() < 0.72 ? 'snow_tree' : 'ice_rock', x, y, s: 0.85 + rand() * 0.4 });
      } else if (b.id === 'dungeon') {
        props.push({ type: rand() < 0.52 ? 'torch' : 'obsidian', x, y, s: 0.9 + rand() * 0.35 });
      } else if (b.id === 'secret') {
        props.push({ type: 'crystal_pillar', x, y, s: 1.0 });
      }
    }

    // Gatherable T1–T8 Resource Nodes (Trees -> Axe, Ores -> Pickaxe, Herbs -> Sickle)
    const nodeSpecs = [
      // Forest: T1 & T2
      { kind: 'wood',    toolType: 'axe',     tier: 1, itemId: 'wood_t1',      name: 'Сосна',             biome: 'forest',  count: 14, color: '#854d0e', crown: '#22c55e' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 1, itemId: 'ore_t1',       name: 'Медная жила',       biome: 'forest',  count: 10, color: '#d97706' },
      { kind: 'herb',    toolType: 'sickle',  tier: 1, itemId: 'herb_t1',      name: 'Луговая трава',     biome: 'forest',  count: 12, color: '#22c55e' },
      { kind: 'wood',    toolType: 'axe',     tier: 2, itemId: 'wood_t2',      name: 'Берёза',            biome: 'forest',  count: 10, color: '#e7e5e4', crown: '#4ade80' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 2, itemId: 'ore_t2',       name: 'Железная руда',     biome: 'forest',  count: 9,  color: '#94a3b8' },
      // Swamp: T2 & T3
      { kind: 'herb',    toolType: 'sickle',  tier: 2, itemId: 'herb_t2',      name: 'Болотный лист',     biome: 'swamp',   count: 11, color: '#a855f7' },
      { kind: 'shroom',  toolType: 'sickle',  tier: 2, itemId: 'swamp_shroom', name: 'Багровый гриб',     biome: 'swamp',   count: 9,  color: '#c084fc' },
      { kind: 'wood',    toolType: 'axe',     tier: 3, itemId: 'wood_t3',      name: 'Дуб',               biome: 'swamp',   count: 12, color: '#78350f', crown: '#15803d' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 3, itemId: 'ore_t3',       name: 'Стальная жила',     biome: 'swamp',   count: 10, color: '#64748b' },
      // Coast: T3 & T4
      { kind: 'herb',    toolType: 'sickle',  tier: 3, itemId: 'herb_t3',      name: 'Морской лотос',     biome: 'coast',   count: 10, color: '#38bdf8' },
      { kind: 'pearl',   toolType: 'sickle',  tier: 3, itemId: 'sea_pearl',    name: 'Жемчуг бухты',      biome: 'coast',   count: 8,  color: '#67e8f9' },
      { kind: 'wood',    toolType: 'axe',     tier: 4, itemId: 'wood_t4',      name: 'Кипарис',           biome: 'coast',   count: 10, color: '#713f12', crown: '#059669' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 4, itemId: 'ore_t4',       name: 'Титановая жила',    biome: 'coast',   count: 9,  color: '#818cf8' },
      // Desert: T4 & T5
      { kind: 'herb',    toolType: 'sickle',  tier: 4, itemId: 'herb_t4',      name: 'Золотой шафран',    biome: 'desert',  count: 10, color: '#f59e0b' },
      { kind: 'spice',   toolType: 'sickle',  tier: 4, itemId: 'desert_spice', name: 'Специи Соляриса',   biome: 'desert',  count: 8,  color: '#fbbf24' },
      { kind: 'wood',    toolType: 'axe',     tier: 5, itemId: 'wood_t5',      name: 'Железная пальма',   biome: 'desert',  count: 10, color: '#a16207', crown: '#ca8a04' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 5, itemId: 'ore_t5',       name: 'Мифриловая руда',   biome: 'desert',  count: 10, color: '#38bdf8' },
      // Snow: T5 & T6
      { kind: 'herb',    toolType: 'sickle',  tier: 5, itemId: 'herb_t5',      name: 'Ледяной цветок',    biome: 'snow',    count: 10, color: '#7dd3fc' },
      { kind: 'crystal', toolType: 'pickaxe', tier: 5, itemId: 'frost_shard',  name: 'Ледяной кристалл',  biome: 'snow',    count: 8,  color: '#38bdf8' },
      { kind: 'wood',    toolType: 'axe',     tier: 6, itemId: 'wood_t6',      name: 'Ледяной кедр',      biome: 'snow',    count: 10, color: '#475569', crown: '#7dd3fc' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 6, itemId: 'ore_t6',       name: 'Адамантит',         biome: 'snow',    count: 9,  color: '#f43f5e' },
      // Crystal Gorge: T6 & T7
      { kind: 'herb',    toolType: 'sickle',  tier: 6, itemId: 'herb_t6',      name: 'Кристальный мох',   biome: 'crystal', count: 10, color: '#c084fc' },
      { kind: 'crystal', toolType: 'pickaxe', tier: 6, itemId: 'star_crystal', name: 'Звёздный кристалл', biome: 'crystal', count: 8,  color: '#a855f7' },
      { kind: 'wood',    toolType: 'axe',     tier: 7, itemId: 'wood_t7',      name: 'Кристальный ясень', biome: 'crystal', count: 10, color: '#581c87', crown: '#c084fc' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 7, itemId: 'ore_t7',       name: 'Обсидиановая жила', biome: 'crystal', count: 9,  color: '#9333ea' },
      // Volcano & Dungeon: T7 & T8
      { kind: 'herb',    toolType: 'sickle',  tier: 7, itemId: 'herb_t7',      name: 'Пепельный корень',  biome: 'volcano', count: 10, color: '#f97316' },
      { kind: 'magma',   toolType: 'pickaxe', tier: 7, itemId: 'magma_core',   name: 'Жила магмы',        biome: 'volcano', count: 8,  color: '#ea580c' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 8, itemId: 'ore_t8',       name: 'Этериевая жила',    biome: 'volcano', count: 7,  color: '#fbbf24' },
      { kind: 'herb',    toolType: 'sickle',  tier: 8, itemId: 'herb_t8',      name: 'Эссенция Бездны',   biome: 'dungeon', count: 8,  color: '#f43f5e' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 7, itemId: 'ore_t7',       name: 'Обсидиан Склепа',   biome: 'dungeon', count: 7,  color: '#7c3aed' },
      // Secret Sanctuary: T8
      { kind: 'wood',    toolType: 'axe',     tier: 8, itemId: 'wood_t8',      name: 'Мировое древо',     biome: 'secret',  count: 7,  color: '#b45309', crown: '#fbbf24' },
      { kind: 'ore',     toolType: 'pickaxe', tier: 8, itemId: 'ore_t8',       name: 'Древний Этерий',    biome: 'secret',  count: 6,  color: '#fde047' },
      { kind: 'herb',    toolType: 'sickle',  tier: 8, itemId: 'herb_t8',      name: 'Эссенция Древних',  biome: 'secret',  count: 6,  color: '#e879f9' }
    ];
    let nid = 1;
    nodeSpecs.forEach(sp => {
      const b = BIOMES.find(bm => bm.id === sp.biome);
      if (!b) return;
      for (let i = 0; i < sp.count; i++) {
        const x = b.x + 140 + rand() * (b.w - 280);
        const y = b.y + 140 + rand() * (b.h - 280);
        if (Math.hypot(x - 3950, y - 2980) < 420) continue;
        resourceNodes.push({
          id: 'res_' + (nid++),
          kind: sp.kind,
          toolType: sp.toolType,
          tier: sp.tier,
          itemId: sp.itemId,
          name: sp.name,
          color: sp.color,
          crown: sp.crown || sp.color,
          x, y,
          respawn: 0
        });
      }
    });
  }

  function update(dt) {
    for (let i = 0; i < resourceNodes.length; i++) {
      if (resourceNodes[i].respawn > 0) {
        resourceNodes[i].respawn = Math.max(0, resourceNodes[i].respawn - dt);
      }
    }
  }

  function drawBackground(ctx, camX, camY, viewW, viewH, time) {
    const tileSize = 96;
    const startCol = Math.max(0, Math.floor(camX / tileSize));
    const endCol = Math.min(Math.ceil(WIDTH / tileSize), Math.ceil((camX + viewW) / tileSize));
    const startRow = Math.max(0, Math.floor(camY / tileSize));
    const endRow = Math.min(Math.ceil(HEIGHT / tileSize), Math.ceil((camY + viewH) / tileSize));

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const wx = c * tileSize;
        const wy = r * tileSize;
        const b = getBiomeAt(wx + 48, wy + 48);
        const checker = ((r * 7 + c * 13) & 3) === 0;
        ctx.fillStyle = checker ? b.accent : b.ground;
        ctx.fillRect(wx, wy, tileSize + 1, tileSize + 1);

        const hash = ((r * 73856093) ^ (c * 19349663)) & 255;
        if (hash < 90) {
          if (b.id === 'volcano') ctx.fillStyle = 'rgba(249,115,22,0.22)';
          else if (b.id === 'crystal') ctx.fillStyle = 'rgba(168,85,247,0.18)';
          else if (b.id === 'swamp') ctx.fillStyle = 'rgba(74,222,128,0.14)';
          else if (b.id === 'dungeon') ctx.fillStyle = 'rgba(239,68,68,0.16)';
          else ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.fillRect(wx + (hash % 64) + 8, wy + ((hash * 3) % 64) + 8, 10, 6);
        } else if (hash > 210 && (b.id === 'forest' || b.id === 'town')) {
          ctx.fillStyle = hash > 235 ? '#fde047' : '#ffffff';
          ctx.fillRect(wx + (hash % 70) + 10, wy + ((hash * 5) % 70) + 10, 4, 4);
        }
      }
    }

    // Coastal Ocean Strip along SW edge of Port Stormhaven
    if (camX < 850 && camY + viewH > 4100) {
      ctx.fillStyle = '#0e4c85';
      ctx.fillRect(0, 4100, 520, 1900);
      ctx.fillStyle = '#1b6fb8';
      ctx.fillRect(460, 4100, 90, 1900);
      const wave = Math.sin(time * 3) * 8;
      ctx.fillStyle = 'rgba(224,242,254,0.45)';
      for (let wy = 4180; wy < 5960; wy += 120) {
        ctx.fillRect(525 + wave, wy, 10, 44);
      }
    }

    // Grand Trade Highways connecting Capital to all regions!
    ctx.fillStyle = '#9c8663';
    ctx.fillRect(1220, 2950, 5400, 66); // West-East Highway (Swamp <-> Capital <-> Crystal)
    ctx.fillRect(3918, 1080, 66, 3860); // North-South Highway (Oasis <-> Capital <-> Snow Outpost)
    ctx.fillRect(1820, 1460, 54, 1520); // Forest Village Spur
    ctx.fillRect(1220, 2980, 54, 1950); // Swamp -> Port Stormhaven Trade Road
    ctx.fillStyle = '#7c6848';
    ctx.fillRect(1220, 2946, 5400, 5);
    ctx.fillRect(1220, 3015, 5400, 5);

    // Capital Aethelgard Grand Stone Plaza
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3600, 2700, 700, 560);
    ctx.fillStyle = '#7888a0';
    ctx.fillRect(3618, 2718, 664, 524);
    ctx.strokeStyle = '#d9a742';
    ctx.lineWidth = 5;
    ctx.strokeRect(3610, 2710, 680, 540);

    // Fishing Spots
    FISHING_SPOTS.forEach(f => {
      if (f.x + f.r < camX - 40 || f.x - f.r > camX + viewW + 40 || f.y + f.r < camY - 40 || f.y - f.r > camY + viewH + 40) return;
      ctx.save();
      ctx.fillStyle = f.biome === 'snow' ? '#38bdf8' : (f.biome === 'swamp' ? '#1e4d45' : (f.biome === 'crystal' ? '#6d28d9' : '#1d74b8'));
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.r, f.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = f.biome === 'crystal' ? '#e9d5ff' : (f.biome === 'swamp' ? '#4ade80' : '#7dd3fc');
      ctx.lineWidth = 4;
      ctx.stroke();
      const rip = Math.sin(time * 3 + f.x) * 8;
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(f.x - 24 + rip, f.y - 10, 22, 3);
      ctx.fillRect(f.x + 8 - rip, f.y + 12, 18, 3);
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e0f2fe';
      ctx.fillText(f.name + ' [Рыбалка]', f.x, f.y - f.r * 0.78);
      ctx.restore();
    });

    // Gatherable Tiered Resource Nodes (T1-T8 Trees, Ore Veins, Herbs/Crystals)
    for (let i = 0; i < resourceNodes.length; i++) {
      const n = resourceNodes[i];
      if (n.respawn > 0) continue;
      if (n.x < camX - 55 || n.x > camX + viewW + 55 || n.y < camY - 65 || n.y > camY + viewH + 55) continue;
      ctx.save();
      ctx.translate(n.x, n.y);
      const pulse = Math.sin(time * 4 + i) * 2;
      const tierCol = (window.GameData && window.GameData.TIERS[n.tier]?.color) || '#fef08a';
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 9, n.kind === 'wood' ? 18 : 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      if (n.kind === 'wood') {
        // Harvestable Tiered Tree with glowing outline
        ctx.fillStyle = '#090b14'; ctx.fillRect(-6, -10, 12, 20);
        ctx.fillStyle = n.color; ctx.fillRect(-4, -8, 8, 17);
        ctx.fillStyle = '#090b14'; ctx.fillRect(-19, -32, 38, 24);
        ctx.fillStyle = n.crown || '#22c55e'; ctx.fillRect(-17, -30, 34, 20);
        ctx.fillStyle = tierCol; ctx.fillRect(-12, -38, 24, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-9, -35, 7, 4);
      } else if (n.kind === 'herb') {
        ctx.fillStyle = '#090b14'; ctx.fillRect(-10, -6, 20, 13);
        ctx.fillStyle = '#15803d'; ctx.fillRect(-8, -4, 16, 10);
        ctx.fillStyle = n.color; ctx.fillRect(-6, -11 - pulse * 0.4, 12, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-2, -8 - pulse * 0.4, 4, 4);
      } else if (n.kind === 'shroom') {
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-3, -4, 6, 10);
        ctx.fillStyle = '#9333ea'; ctx.fillRect(-10, -12, 20, 9);
        ctx.fillStyle = '#f0abfc'; ctx.fillRect(-6, -10, 4, 3); ctx.fillRect(3, -9, 3, 3);
      } else if (n.kind === 'spice') {
        ctx.fillStyle = '#92400e'; ctx.fillRect(-9, -5, 18, 11);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(-7, -11, 14, 8);
        ctx.fillStyle = '#fde047'; ctx.fillRect(-3, -10, 6, 4);
      } else if (n.kind === 'pearl') {
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-10, -5, 20, 11);
        ctx.fillStyle = '#67e8f9'; ctx.fillRect(-5, -9 - pulse * 0.3, 10, 9);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-2, -7, 3, 3);
      } else if (n.kind === 'crystal' || n.kind === 'magma') {
        ctx.fillStyle = '#090b14'; ctx.fillRect(-8, -18 - pulse * 0.5, 16, 25);
        ctx.fillStyle = n.color; ctx.fillRect(-6, -16 - pulse * 0.5, 12, 21);
        ctx.fillStyle = '#fff'; ctx.fillRect(-2, -12, 4, 8);
      } else {
        ctx.fillStyle = '#090b14'; ctx.fillRect(-14, -10, 28, 18);
        ctx.fillStyle = '#334155'; ctx.fillRect(-12, -8, 24, 14);
        ctx.fillStyle = n.color; ctx.fillRect(-8, -6, 7, 6); ctx.fillRect(2, -4, 7, 6);
        ctx.fillStyle = '#fff'; ctx.fillRect(-6, -5, 2, 2); ctx.fillRect(4, -3, 2, 2);
      }
      const lbl = '[T' + (n.tier || 1) + '] ' + n.name;
      const ly = n.kind === 'wood' ? -44 : -21;
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#070a14';
      ctx.fillText(lbl, 1, ly + 1);
      ctx.fillStyle = tierCol;
      ctx.fillText(lbl, 0, ly);
      ctx.restore();
    }
  }

  function drawPropsAndNpcs(ctx, camX, camY, viewW, viewH, time) {
    for (let i = 0; i < props.length; i++) {
      const p = props[i];
      if (p.x < camX - 120 || p.x > camX + viewW + 120 || p.y < camY - 120 || p.y > camY + viewH + 120) continue;
      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y));
      const s = p.s || 1;
      if (p.type === 'tree' || p.type === 'snow_tree' || p.type === 'swamp_tree') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(0, 12, 22 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.type === 'swamp_tree' ? '#3f2e21' : '#5c3a21';
        ctx.fillRect(-6 * s, -8 * s, 12 * s, 22 * s);
        ctx.fillStyle = p.type === 'snow_tree' ? '#0f766e' : (p.type === 'swamp_tree' ? '#1e3a2f' : '#1b5e20');
        ctx.fillRect(-22 * s, -36 * s, 44 * s, 30 * s);
        ctx.fillStyle = p.type === 'snow_tree' ? '#e2e8f0' : (p.type === 'swamp_tree' ? '#365314' : '#2e7d32');
        ctx.fillRect(-18 * s, -48 * s, 36 * s, 22 * s);
        ctx.fillStyle = p.type === 'snow_tree' ? '#f8fafc' : (p.type === 'swamp_tree' ? '#65a30d' : '#43a047');
        ctx.fillRect(-10 * s, -54 * s, 20 * s, 12 * s);
      } else if (p.type === 'giant_shroom') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(0, 10, 16 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-5 * s, -12 * s, 10 * s, 22 * s);
        ctx.fillStyle = '#7e22ce'; ctx.fillRect(-18 * s, -28 * s, 36 * s, 18 * s);
        ctx.fillStyle = '#e879f9'; ctx.fillRect(-11 * s, -24 * s, 6 * s, 5 * s); ctx.fillRect(5 * s, -22 * s, 6 * s, 5 * s);
      } else if (p.type === 'palm') {
        ctx.fillStyle = '#92400e'; ctx.fillRect(-4 * s, -36 * s, 8 * s, 44 * s);
        ctx.fillStyle = '#15803d'; ctx.fillRect(-24 * s, -42 * s, 48 * s, 10 * s);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(-18 * s, -48 * s, 36 * s, 9 * s);
      } else if (p.type === 'lava_pool') {
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath(); ctx.ellipse(0, 0, 32 * s, 20 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.ellipse(0, 0, 24 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(-8 + Math.sin(time * 5 + i) * 5, -3, 14, 5);
      } else if (p.type === 'amethyst_pillar') {
        ctx.fillStyle = '#581c87'; ctx.fillRect(-10 * s, -38 * s, 20 * s, 42 * s);
        ctx.fillStyle = '#a855f7'; ctx.fillRect(-6 * s, -44 * s, 12 * s, 38 * s);
        ctx.fillStyle = '#f5d0fe'; ctx.fillRect(-2 * s, -38 * s, 4 * s, 20 * s);
      } else if (p.type === 'rock' || p.type === 'ice_rock' || p.type === 'obsidian') {
        ctx.fillStyle = p.type === 'ice_rock' ? '#7dd3fc' : (p.type === 'obsidian' ? '#3b0764' : '#64748b');
        ctx.fillRect(-14 * s, -8 * s, 28 * s, 16 * s);
        ctx.fillStyle = p.type === 'ice_rock' ? '#e0f2fe' : '#94a3b8';
        ctx.fillRect(-10 * s, -12 * s, 16 * s, 8 * s);
      } else if (p.type === 'cactus') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-5, -26, 10, 32);
        ctx.fillRect(-14, -18, 9, 5); ctx.fillRect(-14, -24, 5, 10);
        ctx.fillRect(5, -14, 9, 5); ctx.fillRect(9, -22, 5, 11);
      } else if (p.type === 'obelisk') {
        ctx.fillStyle = '#b45309'; ctx.fillRect(-10, -44, 20, 48);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-4, -36, 8, 24);
      } else if (p.type === 'torch') {
        ctx.fillStyle = '#475569'; ctx.fillRect(-4, -26, 8, 30);
        const f = Math.sin(time * 14 + i) * 3;
        ctx.fillStyle = '#f97316'; ctx.fillRect(-7, -36 + f * 0.4, 14, 12);
        ctx.fillStyle = '#fef08a'; ctx.fillRect(-4, -34 + f * 0.4, 8, 7);
      } else if (p.type === 'crystal_pillar') {
        ctx.fillStyle = '#0ea5e9'; ctx.fillRect(-8, -36, 16, 40);
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(-4, -32, 8, 24);
      } else if (p.type === 'tent') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-42, 16, 84, 12);
        ctx.fillStyle = '#b45309'; ctx.fillRect(-38, -28, 76, 46);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(-32, -38, 64, 16);
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-12, -8, 24, 26);
      } else if (p.type === 'pier') {
        ctx.fillStyle = '#78350f'; ctx.fillRect(-120, -14, 180, 28);
        ctx.fillStyle = '#92400e';
        for (let px = -114; px < 52; px += 18) ctx.fillRect(px, -12, 14, 24);
      } else if (p.type === 'house') {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(-48, 20, 96, 14);
        ctx.fillStyle = '#475569'; ctx.fillRect(-44, -22, 88, 46);
        ctx.fillStyle = '#64748b'; ctx.fillRect(-40, -18, 80, 38);
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(-52, -46, 104, 28);
        ctx.fillStyle = '#9a3412'; ctx.fillRect(-44, -56, 88, 16);
        ctx.fillStyle = '#451a03'; ctx.fillRect(-10, -2, 20, 26);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-32, -8, 14, 14); ctx.fillRect(18, -8, 14, 14);
        ctx.fillStyle = '#fef08a'; ctx.fillRect(-29, -5, 8, 8); ctx.fillRect(21, -5, 8, 8);
      } else if (p.type === 'fountain') {
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.ellipse(0, 0, 46, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.ellipse(0, -2, 36, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-8, -28, 16, 28);
        ctx.fillStyle = '#e0f2fe'; ctx.fillRect(-12, -32 + Math.sin(time * 8) * 2, 24, 6);
      } else if (p.type === 'rune_arch') {
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(0, -10, 36, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = 'rgba(168,85,247,0.3)';
        ctx.beginPath(); ctx.arc(0, -10, 30, Math.PI, 0); ctx.fill();
      }
      ctx.restore();
    }

    // NPCs
    NPCS.forEach(npc => {
      if (npc.x < camX - 60 || npc.x > camX + viewW + 60 || npc.y < camY - 60 || npc.y > camY + viewH + 60) return;
      ctx.save();
      ctx.translate(npc.x, npc.y);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.ellipse(0, 14, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = npc.color; ctx.fillRect(-8, -10, 16, 22);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(-8, 0, 16, 3);
      ctx.fillStyle = '#f5cfa0'; ctx.fillRect(-6, -22, 12, 12);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(-7, -26, 14, 6);

      const bob = Math.sin(time * 4 + npc.x) * 3;
      const by = -46 + bob;
      ctx.fillStyle = '#090c17';
      ctx.fillRect(-7, by - 7, 14, 14);
      ctx.fillStyle = '#1b2647';
      ctx.fillRect(-6, by - 6, 12, 12);
      if (npc.iconKey === 'quests') {
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-1, by - 5, 3, 6); ctx.fillRect(-1, by + 2, 3, 3);
      } else if (npc.iconKey === 'shop') {
        ctx.fillStyle = '#dc2626'; ctx.fillRect(-5, by - 4, 10, 8);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-5, by - 1, 10, 2);
      } else if (npc.iconKey === 'coin') {
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-4, by - 4, 8, 8);
        ctx.fillStyle = '#fef08a'; ctx.fillRect(-2, by - 2, 3, 4);
      } else if (npc.iconKey === 'craft') {
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-5, by - 3, 10, 3);
        ctx.fillStyle = '#64748b'; ctx.fillRect(-2, by, 4, 4);
      } else if (npc.iconKey === 'auction') {
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-5, by - 3, 10, 2); ctx.fillRect(-1, by - 4, 2, 8);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-5, by + 1, 3, 2); ctx.fillRect(2, by + 1, 3, 2);
      } else if (npc.iconKey === 'storage') {
        ctx.fillStyle = '#4ade80'; ctx.fillRect(-4, by - 4, 8, 8);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-1, by - 1, 2, 2);
      } else {
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-4, by - 4, 8, 7);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(-3, by - 3, 6, 5);
      }
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#090c17';
      ctx.fillText(npc.name, 1, -27);
      ctx.fillStyle = '#ffe08a';
      ctx.fillText(npc.name, 0, -28);
      ctx.restore();
    });
  }

  return {
    WIDTH,
    HEIGHT,
    BIOMES,
    NPCS,
    FISHING_SPOTS,
    spawnZones,
    resourceNodes,
    init,
    update,
    getBiomeAt,
    drawBackground,
    drawPropsAndNpcs
  };
})();
