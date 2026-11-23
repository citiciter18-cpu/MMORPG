/* ==========================================================================
   BladeRealm — 23 Weapon Types, T1–T8 Tiers, Enchantments (.0–.4 + Affixes),
   T1–T8 Gathering Tools, T1–T8 Resources, 28 Armors & Item Factory
   ========================================================================== */

window.GameData = window.GameData || {};

(function (G) {
  G.RARITIES = {
    common:    { id: 'common',    name: 'Обычный',     color: '#94a3b8', mult: 1.0,  priceMult: 1.0 },
    uncommon:  { id: 'uncommon',  name: 'Необычный',   color: '#34d399', mult: 1.24, priceMult: 1.85 },
    rare:      { id: 'rare',      name: 'Редкий',      color: '#38bdf8', mult: 1.54, priceMult: 3.4 },
    epic:      { id: 'epic',      name: 'Эпический',   color: '#c084fc', mult: 1.94, priceMult: 6.8 },
    legendary: { id: 'legendary', name: 'Легендарный', color: '#fbbf24', mult: 2.52, priceMult: 14.0 }
  };

  G.RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  // Equipment, Tool & Resource Tiers T1–T8 (Albion-style steep progression)
  G.TIERS = {
    1: { tier: 1, tag: 'T1', name: 'Новичка',    color: '#cbd5e1', statMult: 1.00, priceMult: 1.0,   minLv: 1 },
    2: { tier: 2, tag: 'T2', name: 'Странника',  color: '#86efac', statMult: 1.42, priceMult: 2.8,   minLv: 3 },
    3: { tier: 3, tag: 'T3', name: 'Адепта',     color: '#38bdf8', statMult: 2.02, priceMult: 7.2,   minLv: 6 },
    4: { tier: 4, tag: 'T4', name: 'Знатока',    color: '#a78bfa', statMult: 2.84, priceMult: 18.0,  minLv: 10 },
    5: { tier: 5, tag: 'T5', name: 'Эксперта',   color: '#f472b6', statMult: 3.92, priceMult: 44.0,  minLv: 14 },
    6: { tier: 6, tag: 'T6', name: 'Мастера',    color: '#fb923c', statMult: 5.30, priceMult: 105.0, minLv: 18 },
    7: { tier: 7, tag: 'T7', name: 'Грандмастера',color:'#facc15', statMult: 7.15, priceMult: 240.0, minLv: 23 },
    8: { tier: 8, tag: 'T8', name: 'Старейшины', color: '#ef4444', statMult: 9.60, priceMult: 540.0, minLv: 28 }
  };

  G.tierFromLevel = function (lv) {
    const n = Number(lv) || 1;
    if (n >= 28) return 8;
    if (n >= 23) return 7;
    if (n >= 18) return 6;
    if (n >= 14) return 5;
    if (n >= 10) return 4;
    if (n >= 6)  return 3;
    if (n >= 3)  return 2;
    return 1;
  };

  // Enchantment Tiers .0 .. .4 (Руны -> Души -> Реликвии -> Древняя эссенция)
  G.ENCHANT_LEVELS = {
    0: { lv: 0, tag: '',   name: 'Без чар',     color: '#94a3b8', mult: 1.00, catalyst: null,              qty: 0, goldBase: 0 },
    1: { lv: 1, tag: '.1', name: 'Рунический',  color: '#4ade80', mult: 1.18, catalyst: 'rune_t1',         qty: 3, goldBase: 180 },
    2: { lv: 2, tag: '.2', name: 'Одушевлённый',color: '#38bdf8', mult: 1.38, catalyst: 'soul_t2',         qty: 4, goldBase: 480 },
    3: { lv: 3, tag: '.3', name: 'Реликтовый',  color: '#c084fc', mult: 1.62, catalyst: 'relic_t3',        qty: 5, goldBase: 1250 },
    4: { lv: 4, tag: '.4', name: 'Мифический',  color: '#fbbf24', mult: 1.94, catalyst: 'ancient_essence', qty: 6, goldBase: 3200 }
  };

  // Magic Enchantment Affixes (applied with Свиток чар)
  G.ENCHANT_AFFIXES = {
    vampiric:    { id: 'vampiric',    name: 'Вампиризм',          color: '#f43f5e', desc: 'Исцеляет 7% от нанесённого урона.' },
    inferno:     { id: 'inferno',     name: 'Испепеление',        color: '#f97316', desc: 'Поджигает цель и добавляет +12% урона.' },
    frostbind:   { id: 'frostbind',   name: 'Морозная скованность',color:'#38bdf8', desc: 'Замораживает врага при ударе.' },
    stormchain:  { id: 'stormchain',  name: 'Цепная молния',      color: '#facc15', desc: '28% шанс ударить молнией соседнего врага.' },
    berserk:     { id: 'berserk',     name: 'Ярость берсерка',    color: '#ef4444', desc: '+14% Атаки и +6% Крита.' },
    executioner: { id: 'executioner', name: 'Казнь',              color: '#c084fc', desc: '+28% урона по врагам ниже 35% HP.' },
    greed:       { id: 'greed',       name: 'Охотник за золотом', color: '#fbbf24', desc: '+18% золота с побеждённых монстров.' },
    titan:       { id: 'titan',       name: 'Эгида титана',       color: '#34d399', desc: '+16% макс. HP и +14% Защиты.' }
  };
  G.ENCHANT_AFFIX_KEYS = Object.keys(G.ENCHANT_AFFIXES);

  // Gathering Tools T1–T8 (Strict tier gating: Tree T3 needs Axe T3+)
  G.TOOL_TYPES = {
    axe:     { id: 'axe',     name: 'Топор лесоруба',  resourceLabel: 'Дерево',         color: '#b45309', iconKey: 'axe_tool',    desc: 'Рубка деревьев соответствующего тира и ниже.' },
    pickaxe: { id: 'pickaxe', name: 'Кирка рудокопа',  resourceLabel: 'Руда и кристаллы',color: '#64748b', iconKey: 'pickaxe',     desc: 'Добыча руды и жил соответствующего тира и ниже.' },
    sickle:  { id: 'sickle',  name: 'Серп травника',   resourceLabel: 'Травы и эссенции',color: '#16a34a', iconKey: 'sickle_tool', desc: 'Сбор трав, грибов и эссенций своего тира и ниже.' }
  };

  // All 23 Weapon Types
  G.WEAPON_TYPES = [
    { id: 'sword',           num: 1,  name: 'Меч',                  atk: 16, crit: 8,  speed: 1.05, range: 64,  dmgType: 'physical',  style: 'slash',        color: '#e53935', accent: '#ff8a80', effect: 'bleed',     desc: 'Сбалансированный клинок рыцаря.' },
    { id: 'greatsword',      num: 2,  name: 'Двуручный меч',        atk: 26, crit: 10, speed: 0.72, range: 82,  dmgType: 'physical',  style: 'heavy_cleave', color: '#cfd8dc', accent: '#ffffff', effect: 'knockback', desc: 'Тяжёлый широкий клинок с размашистым ударом.' },
    { id: 'dagger',          num: 3,  name: 'Кинжал',               atk: 13, crit: 20, speed: 1.55, range: 48,  dmgType: 'physical',  style: 'stab',         color: '#a855f7', accent: '#e9d5ff', effect: 'crit_up',   desc: 'Молниеносные выпады и высокий шанс крита.' },
    { id: 'dual_blades',     num: 4,  name: 'Парные клинки',        atk: 18, crit: 18, speed: 1.48, range: 58,  dmgType: 'dark',      style: 'dual_slash',   color: '#ef4444', accent: '#fca5a5', effect: 'double_hit',desc: 'Перекрёстные двойные рассечения.' },
    { id: 'axe',             num: 5,  name: 'Топор',                atk: 21, crit: 11, speed: 0.92, range: 62,  dmgType: 'physical',  style: 'slash',        color: '#90a4ae', accent: '#78909c', effect: 'armor_brk', desc: 'Пробивает броню врага.' },
    { id: 'greataxe',        num: 6,  name: 'Двуручный топор',      atk: 30, crit: 13, speed: 0.68, range: 78,  dmgType: 'physical',  style: 'heavy_cleave', color: '#dc2626', accent: '#ff7b7b', effect: 'cleave',    desc: 'Сокрушительный круговой удар.' },
    { id: 'warhammer',       num: 7,  name: 'Боевой молот',         atk: 28, crit: 9,  speed: 0.70, range: 72,  dmgType: 'physical',  style: 'smash',        color: '#60a5fa', accent: '#bfdbfe', effect: 'stun',      desc: 'Оглушает врагов ударной волной.' },
    { id: 'mace',            num: 8,  name: 'Булава',               atk: 22, crit: 10, speed: 0.90, range: 62,  dmgType: 'physical',  style: 'smash',        color: '#c084fc', accent: '#f3e8ff', effect: 'armor_brk', desc: 'Шипастое дробящее оружие.' },
    { id: 'bow',             num: 9,  name: 'Лук',                  atk: 18, crit: 16, speed: 1.18, range: 270, dmgType: 'physical',  style: 'arrow',        color: '#d97706', accent: '#fde68a', effect: 'pierce',    desc: 'Дальнобойные стрелы высокой точности.' },
    { id: 'crossbow',        num: 10, name: 'Арбалет',              atk: 25, crit: 19, speed: 0.85, range: 295, dmgType: 'physical',  style: 'bolt',         color: '#b45309', accent: '#fbbf24', effect: 'heavy_bolt',desc: 'Мощные бронебойные болты.' },
    { id: 'staff',           num: 11, name: 'Посох',                atk: 22, crit: 12, speed: 0.95, range: 260, dmgType: 'arcane',    style: 'orb',          color: '#9333ea', accent: '#e9d5ff', effect: 'mana_leech',desc: 'Выпускает сгустки чистой арканы.' },
    { id: 'wand',            num: 12, name: 'Магический жезл',      atk: 17, crit: 15, speed: 1.32, range: 245, dmgType: 'ice',       style: 'bolt',         color: '#38bdf8', accent: '#bae6fd', effect: 'slow',      desc: 'Быстрые магические искры.' },
    { id: 'flame_blade',     num: 13, name: 'Огненный клинок',      atk: 24, crit: 13, speed: 1.08, range: 70,  dmgType: 'fire',      style: 'slash',        color: '#f97316', accent: '#fef08a', effect: 'burn',      desc: 'Поджигает врагов обжигающим пламенем.' },
    { id: 'frost_blade',     num: 14, name: 'Ледяной клинок',       atk: 23, crit: 12, speed: 1.08, range: 70,  dmgType: 'ice',       style: 'slash',        color: '#0ea5e9', accent: '#e0f2fe', effect: 'freeze',    desc: 'Замораживает и замедляет цели.' },
    { id: 'lightning_blade', num: 15, name: 'Молниевый клинок',     atk: 25, crit: 17, speed: 1.18, range: 72,  dmgType: 'lightning', style: 'slash',        color: '#facc15', accent: '#fef9c3', effect: 'chain',     desc: 'Поражает соседних врагов цепной молнией.' },
    { id: 'poison_dagger',   num: 16, name: 'Ядовитый кинжал',      atk: 19, crit: 22, speed: 1.52, range: 52,  dmgType: 'poison',    style: 'stab',         color: '#22c55e', accent: '#bbf7d0', effect: 'poison',    desc: 'Отравляет жертву смертельным ядом.' },
    { id: 'spear',           num: 17, name: 'Копьё',                atk: 23, crit: 14, speed: 1.02, range: 96,  dmgType: 'physical',  style: 'thrust',       color: '#cbd5e1', accent: '#fb923c', effect: 'pierce',    desc: 'Длинный пронзающий выпад.' },
    { id: 'halberd',         num: 18, name: 'Алебарда',             atk: 29, crit: 13, speed: 0.80, range: 100, dmgType: 'dark',      style: 'heavy_cleave', color: '#e11d48', accent: '#fda4af', effect: 'cleave',    desc: 'Огромный радиус и мощный рубящий удар.' },
    { id: 'scythe',          num: 19, name: 'Боевая коса',          atk: 31, crit: 18, speed: 0.88, range: 94,  dmgType: 'dark',      style: 'scythe_arc',   color: '#9333ea', accent: '#f0abfc', effect: 'lifesteal', desc: 'Похищает здоровье при каждом рассечении.' },
    { id: 'spellbook',       num: 20, name: 'Магическая книга',     atk: 26, crit: 16, speed: 1.05, range: 275, dmgType: 'arcane',    style: 'arcane_wave',  color: '#7c3aed', accent: '#ddd6fe', effect: 'aoe_burst', desc: 'Призывает взрывные рунические волны.' },
    { id: 'crystal_staff',   num: 21, name: 'Кристаллический посох',atk: 32, crit: 17, speed: 1.00, range: 290, dmgType: 'ice',       style: 'beam',         color: '#06b6d4', accent: '#cffafe', effect: 'freeze',    desc: 'Пронзающий кристальный луч энергии.' },
    { id: 'legendary_sword', num: 22, name: 'Легендарный меч',      atk: 38, crit: 22, speed: 1.15, range: 86,  dmgType: 'light',     style: 'heavy_cleave', color: '#f59e0b', accent: '#fef3c7', effect: 'holy_wave', desc: 'Клинок света, испускающий золотую волну.' },
    { id: 'ancient_artifact',num: 23, name: 'Древний артефакт',     atk: 42, crit: 25, speed: 1.22, range: 295, dmgType: 'arcane',    style: 'arcane_wave',  color: '#c026d3', accent: '#f5d0fe', effect: 'chaos',     desc: 'Реликвия древних богов с хаотической мощью.' }
  ];

  G.WEAPON_BY_ID = {};
  G.WEAPON_TYPES.forEach(w => { G.WEAPON_BY_ID[w.id] = w; });

  G.EQUIP_SLOTS = [
    { id: 'helmet',   name: 'Шлем',     iconKey: 'slot_helmet' },
    { id: 'armor',    name: 'Броня',    iconKey: 'slot_armor' },
    { id: 'weapon',   name: 'Оружие',   iconKey: 'slot_weapon' },
    { id: 'offhand',  name: 'Щит',      iconKey: 'slot_offhand' },
    { id: 'cloak',    name: 'Плащ',     iconKey: 'slot_cloak' },
    { id: 'amulet',   name: 'Амулет',   iconKey: 'slot_amulet' },
    { id: 'ring',     name: 'Кольцо',   iconKey: 'slot_ring' },
    { id: 'boots',    name: 'Ботинки',  iconKey: 'slot_boots' },
    { id: 'artifact', name: 'Реликвия', iconKey: 'slot_artifact' }
  ];

  // Expanded 28 Armor & Accessory Templates across all 9 slots
  G.ARMOR_TEMPLATES = [
    // Helmets (4)
    { slot: 'helmet',   id: 'helm_leather',  name: 'Капюшон Следопыта', def: 5,  hp: 24,  spd: 5,  color: '#78350f', accent: '#d97706' },
    { slot: 'helmet',   id: 'helm_iron',     name: 'Шлем Стража',       def: 9,  hp: 40,  color: '#7c8ba1', accent: '#cbd5e1' },
    { slot: 'helmet',   id: 'helm_crimson',  name: 'Шлем Тени',         def: 14, hp: 72,  crit: 3, color: '#3b1d2a', accent: '#ef4444' },
    { slot: 'helmet',   id: 'helm_dragon',   name: 'Корона Дракона',    def: 22, hp: 130, atk: 6,  color: '#854d0e', accent: '#fbbf24' },
    // Body Armor (5)
    { slot: 'armor',    id: 'armor_tunic',   name: 'Кожаная кираса',    def: 9,  hp: 45,  spd: 6,  color: '#5c3a21', accent: '#ca8a04' },
    { slot: 'armor',    id: 'armor_mage',    name: 'Мантия Арканы',     def: 11, hp: 55,  mp: 45, atk: 5, color: '#1e3a8a', accent: '#38bdf8' },
    { slot: 'armor',    id: 'armor_knight',  name: 'Латы Рыцаря',       def: 16, hp: 85,  color: '#475569', accent: '#e2e8f0' },
    { slot: 'armor',    id: 'armor_crimson', name: 'Броня Алой Тени',   def: 24, hp: 150, crit: 4, color: '#271724', accent: '#dc2626' },
    { slot: 'armor',    id: 'armor_abyss',   name: 'Доспех Бездны',     def: 35, hp: 250, atk: 8,  color: '#2e1065', accent: '#c084fc' },
    // Offhand / Shields (4)
    { slot: 'offhand',  id: 'shield_wood',   name: 'Дубовый щит',       def: 7,  hp: 30,  color: '#78350f', accent: '#b45309' },
    { slot: 'offhand',  id: 'shield_steel',  name: 'Стальной щит',      def: 13, hp: 55,  color: '#64748b', accent: '#e2e8f0' },
    { slot: 'offhand',  id: 'offhand_tome',  name: 'Гримуар Маны',      def: 8,  mp: 65,  atk: 9,  color: '#581c87', accent: '#e879f9' },
    { slot: 'offhand',  id: 'shield_aegis',  name: 'Эгида Дракона',     def: 24, hp: 125, color: '#991b1b', accent: '#fbbf24' },
    // Cloaks (3)
    { slot: 'cloak',    id: 'cloak_forest',  name: 'Плащ Охотника',     def: 4,  spd: 10, crit: 2, color: '#166534', accent: '#4ade80' },
    { slot: 'cloak',    id: 'cloak_red',     name: 'Алый плащ',         def: 7,  spd: 14, color: '#b91c1c', accent: '#fca5a5' },
    { slot: 'cloak',    id: 'cloak_wings',   name: 'Крылья Бездны',     def: 14, spd: 26, crit: 6, color: '#4c1d95', accent: '#d8b4fe' },
    // Amulets (3)
    { slot: 'amulet',   id: 'amulet_wolf',   name: 'Клык Волка',        atk: 5,  crit: 3, hp: 25,  color: '#475569', accent: '#e2e8f0' },
    { slot: 'amulet',   id: 'amulet_mana',   name: 'Амулет Арканы',     mp: 48,  atk: 7,  color: '#7c3aed', accent: '#f5d0fe' },
    { slot: 'amulet',   id: 'amulet_sun',    name: 'Медальон Солнца',   mp: 85,  atk: 15, crit: 5, color: '#d97706', accent: '#fef08a' },
    // Rings (3)
    { slot: 'ring',     id: 'ring_copper',   name: 'Кольцо Стойкости',  hp: 40,  def: 5,  color: '#b45309', accent: '#fde68a' },
    { slot: 'ring',     id: 'ring_power',    name: 'Кольцо Силы',       atk: 9,  crit: 5, color: '#ca8a04', accent: '#fef08a' },
    { slot: 'ring',     id: 'ring_blood',    name: 'Перстень Крови',    atk: 16, hp: 80,  crit: 8, color: '#be123c', accent: '#fda4af' },
    // Boots (3)
    { slot: 'boots',    id: 'boots_leather', name: 'Сапоги Путника',    def: 4,  spd: 12, color: '#713f12', accent: '#d97706' },
    { slot: 'boots',    id: 'boots_swift',   name: 'Сапоги Ветра',      def: 8,  spd: 18, color: '#475569', accent: '#93c5fd' },
    { slot: 'boots',    id: 'boots_dragon',  name: 'Ботфорты Дракона',  def: 15, spd: 32, hp: 65,  color: '#7f1d1d', accent: '#fbbf24' },
    // Artifacts (3)
    { slot: 'artifact', id: 'relic_totem',   name: 'Тотем Леса',        hp: 55,  mp: 35,  def: 6,  color: '#15803d', accent: '#86efac' },
    { slot: 'artifact', id: 'relic_orb',     name: 'Сфера Древних',     atk: 14, mp: 60,  crit: 7, color: '#9333ea', accent: '#38bdf8' },
    { slot: 'artifact', id: 'relic_heart',   name: 'Сердце Феникса',    atk: 18, hp: 140, crit: 8, color: '#dc2626', accent: '#fde047' }
  ];

  // Potions, T1–T8 Raw Woods / Ores / Herbs, Enchant Catalysts & Legacy Resources
  G.CONSUMABLES = {
    // Potions
    hp_potion:       { id: 'hp_potion',       name: 'Зелье здоровья',        category: 'potion',   rarity: 'common',    tier: 1, stackable: true, price: 48,   healHp: 135, color: '#ef4444', marketGroup: 'herbs',  desc: 'Восстанавливает 135 HP.' },
    hp_potion_lg:    { id: 'hp_potion_lg',    name: 'Эликсир жизни',         category: 'potion',   rarity: 'rare',      tier: 4, stackable: true, price: 185,  healHp: 460, color: '#f43f5e', marketGroup: 'herbs',  desc: 'Восстанавливает 460 HP.' },
    mp_potion:       { id: 'mp_potion',       name: 'Зелье маны',            category: 'potion',   rarity: 'common',    tier: 1, stackable: true, price: 48,   healMp: 90,  color: '#3b82f6', marketGroup: 'herbs',  desc: 'Восстанавливает 90 MP.' },
    mp_potion_lg:    { id: 'mp_potion_lg',    name: 'Эликсир маны',          category: 'potion',   rarity: 'rare',      tier: 4, stackable: true, price: 175,  healMp: 280, color: '#6366f1', marketGroup: 'herbs',  desc: 'Восстанавливает 280 MP.' },
    fish_common:     { id: 'fish_common',     name: 'Речной карп',           category: 'potion',   rarity: 'common',    tier: 1, stackable: true, price: 32,   healHp: 85,  color: '#60a5fa', marketGroup: 'exotic', desc: 'Свежая рыба. Восстанавливает 85 HP.' },
    fish_golden:     { id: 'fish_golden',     name: 'Золотой лосось',        category: 'potion',   rarity: 'epic',      tier: 5, stackable: true, price: 320,  healHp: 380, healMp: 180, color: '#fbbf24', marketGroup: 'exotic', desc: 'Редкий улов! Восстанавливает 380 HP и 180 MP.' },

    // Enhancement & Enchantment Catalysts
    upgrade_stone:   { id: 'upgrade_stone',   name: 'Камень заточки',        category: 'resource', rarity: 'uncommon',  tier: 2, stackable: true, price: 165,  color: '#f59e0b', marketGroup: 'gems',   desc: 'Улучшает оружие и броню (+1..+15).' },
    rune_t1:         { id: 'rune_t1',         name: 'Руна чар (.1)',         category: 'resource', rarity: 'uncommon',  tier: 2, stackable: true, price: 145,  color: '#4ade80', marketGroup: 'gems',   desc: 'Зачарование экипировки до .1 (+18% статов).' },
    soul_t2:         { id: 'soul_t2',         name: 'Душа чар (.2)',         category: 'resource', rarity: 'rare',      tier: 4, stackable: true, price: 360,  color: '#38bdf8', marketGroup: 'gems',   desc: 'Зачарование экипировки до .2 (+38% статов).' },
    relic_t3:        { id: 'relic_t3',        name: 'Реликвия чар (.3)',     category: 'resource', rarity: 'epic',      tier: 6, stackable: true, price: 920,  color: '#c084fc', marketGroup: 'gems',   desc: 'Зачарование экипировки до .3 (+62% статов).' },
    ancient_essence: { id: 'ancient_essence', name: 'Древняя эссенция (.4)', category: 'resource', rarity: 'legendary', tier: 8, stackable: true, price: 2400, color: '#fbbf24', marketGroup: 'boss',   desc: 'Высшее зачарование .4 (+94% статов).' },
    scroll_enchant:  { id: 'scroll_enchant',  name: 'Свиток магических чар', category: 'resource', rarity: 'rare',      tier: 3, stackable: true, price: 420,  color: '#e879f9', marketGroup: 'gems',   desc: 'Накладывает уникальный магический аффикс на оружие/броню.' },

    // T1–T8 Wood (Chopped with Топор T1..T8)
    wood_t1: { id: 'wood_t1', name: 'Сосна [T1]',            category: 'resource', rarity: 'common',    tier: 1, resKind: 'wood', stackable: true, price: 14,   color: '#b45309', marketGroup: 'wood', desc: 'Древесина T1. Нужен Топор T1+.' },
    wood_t2: { id: 'wood_t2', name: 'Берёза [T2]',           category: 'resource', rarity: 'common',    tier: 2, resKind: 'wood', stackable: true, price: 30,   color: '#d6d3d1', marketGroup: 'wood', desc: 'Древесина T2. Нужен Топор T2+.' },
    wood_t3: { id: 'wood_t3', name: 'Дуб [T3]',              category: 'resource', rarity: 'uncommon',  tier: 3, resKind: 'wood', stackable: true, price: 65,   color: '#92400e', marketGroup: 'wood', desc: 'Крепкий дуб T3. Нужен Топор T3+.' },
    wood_t4: { id: 'wood_t4', name: 'Кипарис [T4]',          category: 'resource', rarity: 'uncommon',  tier: 4, resKind: 'wood', stackable: true, price: 140,  color: '#15803d', marketGroup: 'wood', desc: 'Смолистый кипарис T4. Нужен Топор T4+.' },
    wood_t5: { id: 'wood_t5', name: 'Железная пальма [T5]',  category: 'resource', rarity: 'rare',      tier: 5, resKind: 'wood', stackable: true, price: 290,  color: '#ca8a04', marketGroup: 'wood', desc: 'Твёрдая древесина T5. Нужен Топор T5+.' },
    wood_t6: { id: 'wood_t6', name: 'Ледяной кедр [T6]',     category: 'resource', rarity: 'rare',      tier: 6, resKind: 'wood', stackable: true, price: 590,  color: '#38bdf8', marketGroup: 'wood', desc: 'Морозный кедр T6. Нужен Топор T6+.' },
    wood_t7: { id: 'wood_t7', name: 'Кристальный ясень [T7]',category: 'resource', rarity: 'epic',      tier: 7, resKind: 'wood', stackable: true, price: 1180, color: '#a855f7', marketGroup: 'wood', desc: 'Энергетический ясень T7. Нужен Топор T7+.' },
    wood_t8: { id: 'wood_t8', name: 'Мировое древо [T8]',    category: 'resource', rarity: 'legendary', tier: 8, resKind: 'wood', stackable: true, price: 2450, color: '#fbbf24', marketGroup: 'wood', desc: 'Легендарная древесина T8. Нужен Топор T8!' },

    // T1–T8 Ores (Mined with Кирка T1..T8)
    ore_t1:  { id: 'ore_t1',  name: 'Медная руда [T1]',      category: 'resource', rarity: 'common',    tier: 1, resKind: 'ore',  stackable: true, price: 16,   color: '#d97706', marketGroup: 'ore',  desc: 'Руда T1. Нужна Кирка T1+.' },
    ore_t2:  { id: 'ore_t2',  name: 'Железная руда [T2]',    category: 'resource', rarity: 'common',    tier: 2, resKind: 'ore',  stackable: true, price: 34,   color: '#94a3b8', marketGroup: 'ore',  desc: 'Руда T2. Нужна Кирка T2+.' },
    ore_t3:  { id: 'ore_t3',  name: 'Стальная жила [T3]',    category: 'resource', rarity: 'uncommon',  tier: 3, resKind: 'ore',  stackable: true, price: 74,   color: '#64748b', marketGroup: 'ore',  desc: 'Руда T3. Нужна Кирка T3+.' },
    ore_t4:  { id: 'ore_t4',  name: 'Титановая руда [T4]',   category: 'resource', rarity: 'uncommon',  tier: 4, resKind: 'ore',  stackable: true, price: 160,  color: '#818cf8', marketGroup: 'ore',  desc: 'Руда T4. Нужна Кирка T4+.' },
    ore_t5:  { id: 'ore_t5',  name: 'Мифриловая руда [T5]',  category: 'resource', rarity: 'rare',      tier: 5, resKind: 'ore',  stackable: true, price: 330,  color: '#38bdf8', marketGroup: 'ore',  desc: 'Руда T5. Нужна Кирка T5+.' },
    ore_t6:  { id: 'ore_t6',  name: 'Адамантит [T6]',        category: 'resource', rarity: 'rare',      tier: 6, resKind: 'ore',  stackable: true, price: 660,  color: '#f43f5e', marketGroup: 'ore',  desc: 'Руда T6. Нужна Кирка T6+.' },
    ore_t7:  { id: 'ore_t7',  name: 'Обсидиан [T7]',         category: 'resource', rarity: 'epic',      tier: 7, resKind: 'ore',  stackable: true, price: 1320, color: '#9333ea', marketGroup: 'ore',  desc: 'Руда T7. Нужна Кирка T7+.' },
    ore_t8:  { id: 'ore_t8',  name: 'Этерий [T8]',           category: 'resource', rarity: 'legendary', tier: 8, resKind: 'ore',  stackable: true, price: 2700, color: '#fbbf24', marketGroup: 'ore',  desc: 'Божественный металл T8. Нужна Кирка T8!' },

    // T1–T8 Herbs & Essences (Harvested with Серп T1..T8)
    herb_t1: { id: 'herb_t1', name: 'Луговая трава [T1]',    category: 'resource', rarity: 'common',    tier: 1, resKind: 'herb', stackable: true, price: 15,   color: '#22c55e', marketGroup: 'herbs',desc: 'Трава T1. Нужен Серп T1+.' },
    herb_t2: { id: 'herb_t2', name: 'Болотный лист [T2]',    category: 'resource', rarity: 'common',    tier: 2, resKind: 'herb', stackable: true, price: 32,   color: '#a855f7', marketGroup: 'herbs',desc: 'Трава T2. Нужен Серп T2+.' },
    herb_t3: { id: 'herb_t3', name: 'Морской лотос [T3]',    category: 'resource', rarity: 'uncommon',  tier: 3, resKind: 'herb', stackable: true, price: 70,   color: '#38bdf8', marketGroup: 'herbs',desc: 'Трава T3. Нужен Серп T3+.' },
    herb_t4: { id: 'herb_t4', name: 'Золотой шафран [T4]',   category: 'resource', rarity: 'uncommon',  tier: 4, resKind: 'herb', stackable: true, price: 150,  color: '#f59e0b', marketGroup: 'herbs',desc: 'Трава T4. Нужен Серп T4+.' },
    herb_t5: { id: 'herb_t5', name: 'Ледяной цветок [T5]',   category: 'resource', rarity: 'rare',      tier: 5, resKind: 'herb', stackable: true, price: 310,  color: '#7dd3fc', marketGroup: 'herbs',desc: 'Трава T5. Нужен Серп T5+.' },
    herb_t6: { id: 'herb_t6', name: 'Кристальный мох [T6]',  category: 'resource', rarity: 'rare',      tier: 6, resKind: 'herb', stackable: true, price: 620,  color: '#c084fc', marketGroup: 'herbs',desc: 'Трава T6. Нужен Серп T6+.' },
    herb_t7: { id: 'herb_t7', name: 'Пепельный корень [T7]', category: 'resource', rarity: 'epic',      tier: 7, resKind: 'herb', stackable: true, price: 1240, color: '#f97316', marketGroup: 'herbs',desc: 'Трава T7. Нужен Серп T7+.' },
    herb_t8: { id: 'herb_t8', name: 'Эссенция Бездны [T8]',  category: 'resource', rarity: 'legendary', tier: 8, resKind: 'herb', stackable: true, price: 2600, color: '#f43f5e', marketGroup: 'herbs',desc: 'Редчайшая эссенция T8. Нужен Серп T8!' },

    // Legacy & Boss Regional Trophy Resources (preserved for compatibility & trading)
    herb_leaf:    { id: 'herb_leaf',    name: 'Целебная трава',     category: 'resource', rarity: 'common',    tier: 1, stackable: true, price: 18,   color: '#22c55e', marketGroup: 'herbs', desc: 'Алхимическая трава для зелий.' },
    iron_ore:     { id: 'iron_ore',     name: 'Железный самородок', category: 'resource', rarity: 'common',    tier: 2, stackable: true, price: 30,   color: '#94a3b8', marketGroup: 'ore',   desc: 'Самородок для кузнечного дела.' },
    swamp_shroom: { id: 'swamp_shroom', name: 'Багровый гриб',      category: 'resource', rarity: 'uncommon',  tier: 2, stackable: true, price: 52,   color: '#a855f7', marketGroup: 'herbs', desc: 'Алхимический гриб Багровых болот.' },
    desert_spice: { id: 'desert_spice', name: 'Специи Соляриса',    category: 'resource', rarity: 'uncommon',  tier: 4, stackable: true, price: 96,   color: '#f59e0b', marketGroup: 'exotic',desc: 'Пряности Оазиса. Дорого ценятся на Севере.' },
    sea_pearl:    { id: 'sea_pearl',    name: 'Морская жемчужина',  category: 'resource', rarity: 'rare',      tier: 3, stackable: true, price: 145,  color: '#67e8f9', marketGroup: 'exotic',desc: 'Жемчужина Порта Штормхейвен.' },
    mithril_ore:  { id: 'mithril_ore',  name: 'Слиток мифрила',     category: 'resource', rarity: 'rare',      tier: 5, stackable: true, price: 260,  color: '#38bdf8', marketGroup: 'ore',   desc: 'Редкий металл Ледяных пиков.' },
    frost_shard:  { id: 'frost_shard',  name: 'Осколок льда',       category: 'resource', rarity: 'rare',      tier: 5, stackable: true, price: 210,  color: '#7dd3fc', marketGroup: 'gems',  desc: 'Кристалл Ледяных пиков.' },
    star_crystal: { id: 'star_crystal', name: 'Звёздный кристалл',  category: 'resource', rarity: 'epic',      tier: 6, stackable: true, price: 580,  color: '#c084fc', marketGroup: 'gems',  desc: 'Редкий кристалл для крафта и биржи.' },
    magma_core:   { id: 'magma_core',   name: 'Ядро магмы',         category: 'resource', rarity: 'epic',      tier: 7, stackable: true, price: 880,  color: '#f97316', marketGroup: 'boss',  desc: 'Пылающее сердце вулканических монстров.' },
    dragon_scale: { id: 'dragon_scale', name: 'Чешуя дракона',      category: 'resource', rarity: 'legendary', tier: 8, stackable: true, price: 1650, color: '#ef4444', marketGroup: 'boss',  desc: 'Трофей с драконов и мировых боссов.' }
  };

  let uidCounter = 1000;
  G.nextUid = function () {
    uidCounter += 1;
    return 'it_' + Date.now().toString(36) + '_' + uidCounter;
  };

  function formatGearName(baseName, tier, enchantLv) {
    const t = Math.max(1, Math.min(8, tier || 1));
    const e = Math.max(0, Math.min(4, enchantLv || 0));
    const tag = 'T' + t + (e > 0 ? '.' + e : '');
    return '[' + tag + '] ' + baseName;
  }

  G.createWeaponItem = function (weaponTypeId, rarityId, level, enhance, tier, enchantLv, enchantAffix) {
    const wt = G.WEAPON_BY_ID[weaponTypeId] || G.WEAPON_TYPES[0];
    const rar = G.RARITIES[rarityId] || G.RARITIES.common;
    const lv = Math.max(1, level || 1);
    const t = Math.max(1, Math.min(8, tier || G.tierFromLevel(lv)));
    const tInfo = G.TIERS[t] || G.TIERS[1];
    const enh = Math.max(0, enhance || 0);
    const eLv = Math.max(0, Math.min(4, enchantLv || 0));
    const eInfo = G.ENCHANT_LEVELS[eLv] || G.ENCHANT_LEVELS[0];

    const lvScale = 1 + (lv - 1) * 0.045;
    const enhScale = 1 + enh * 0.11;
    const atk = Math.round(wt.atk * tInfo.statMult * rar.mult * eInfo.mult * lvScale * enhScale);
    const crit = Math.min(72, Math.round(wt.crit + (G.RARITY_ORDER.indexOf(rar.id) * 2) + (t - 1) * 1.4 + eLv * 2.5 + enh * 0.5));
    const value = Math.round((85 + wt.atk * 6) * tInfo.priceMult * rar.priceMult * (1 + eLv * 0.55) * (1 + enh * 0.22));

    return {
      uid: G.nextUid(),
      templateId: wt.id,
      weaponType: wt.id,
      baseName: wt.name,
      name: formatGearName(wt.name, t, eLv),
      category: 'weapon',
      slot: 'weapon',
      tier: t,
      enchantLv: eLv,
      enchantAffix: enchantAffix || null,
      rarity: rar.id,
      level: lv,
      enhance: enh,
      qty: 1,
      stackable: false,
      stats: { atk, crit, speed: wt.speed, range: wt.range },
      dmgType: wt.dmgType,
      style: wt.style,
      effect: wt.effect,
      color: wt.color,
      accent: wt.accent,
      price: value,
      desc: wt.desc
    };
  };

  G.createArmorItem = function (templateId, rarityId, level, enhance, tier, enchantLv, enchantAffix) {
    const tpl = G.ARMOR_TEMPLATES.find(a => a.id === templateId) || G.ARMOR_TEMPLATES[0];
    const rar = G.RARITIES[rarityId] || G.RARITIES.common;
    const lv = Math.max(1, level || 1);
    const t = Math.max(1, Math.min(8, tier || G.tierFromLevel(lv)));
    const tInfo = G.TIERS[t] || G.TIERS[1];
    const enh = Math.max(0, enhance || 0);
    const eLv = Math.max(0, Math.min(4, enchantLv || 0));
    const eInfo = G.ENCHANT_LEVELS[eLv] || G.ENCHANT_LEVELS[0];

    const scale = tInfo.statMult * rar.mult * eInfo.mult * (1 + (lv - 1) * 0.04) * (1 + enh * 0.11);
    const stats = {};
    if (tpl.def) stats.def = Math.round(tpl.def * scale);
    if (tpl.hp)  stats.hp  = Math.round(tpl.hp * scale);
    if (tpl.mp)  stats.mp  = Math.round(tpl.mp * scale);
    if (tpl.atk) stats.atk = Math.round(tpl.atk * scale);
    if (tpl.spd) stats.spd = Math.round(tpl.spd * (1 + (t - 1) * 0.08 + enh * 0.03));
    if (tpl.crit)stats.crit= Math.round(tpl.crit + (t - 1) * 0.8 + eLv * 1.5 + enh * 0.4);
    const value = Math.round((75 + (tpl.def || 10) * 5) * tInfo.priceMult * rar.priceMult * (1 + eLv * 0.55) * (1 + enh * 0.22));

    return {
      uid: G.nextUid(),
      templateId: tpl.id,
      baseName: tpl.name,
      name: formatGearName(tpl.name, t, eLv),
      category: 'armor',
      slot: tpl.slot,
      tier: t,
      enchantLv: eLv,
      enchantAffix: enchantAffix || null,
      rarity: rar.id,
      level: lv,
      enhance: enh,
      qty: 1,
      stackable: false,
      stats,
      color: tpl.color,
      accent: tpl.accent,
      price: value,
      desc: 'Экипировка T' + t + ' (' + (G.EQUIP_SLOTS.find(s => s.id === tpl.slot)?.name || tpl.slot) + ').'
    };
  };

  G.createToolItem = function (toolKind, tier, rarityId) {
    const tt = G.TOOL_TYPES[toolKind] || G.TOOL_TYPES.axe;
    const t = Math.max(1, Math.min(8, tier || 1));
    const tInfo = G.TIERS[t] || G.TIERS[1];
    const rarId = rarityId || (t >= 7 ? 'legendary' : (t >= 5 ? 'epic' : (t >= 3 ? 'rare' : (t >= 2 ? 'uncommon' : 'common'))));
    const value = Math.round(90 * tInfo.priceMult);
    return {
      uid: G.nextUid(),
      templateId: tt.id + '_t' + t,
      toolKind: tt.id,
      tier: t,
      baseName: tt.name,
      name: '[T' + t + '] ' + tt.name,
      category: 'tool',
      rarity: rarId,
      qty: 1,
      stackable: false,
      color: tInfo.color,
      accent: tt.color,
      price: value,
      desc: tt.desc + ' Работает прямо из сумки (добыча сырья до T' + t + ').'
    };
  };

  G.createConsumableItem = function (id, qty) {
    const tpl = G.CONSUMABLES[id] || G.CONSUMABLES.hp_potion;
    return {
      uid: G.nextUid(),
      templateId: tpl.id,
      name: tpl.name,
      category: tpl.category,
      rarity: tpl.rarity,
      tier: tpl.tier || 0,
      resKind: tpl.resKind || null,
      qty: Math.max(1, qty || 1),
      stackable: true,
      price: tpl.price,
      healHp: tpl.healHp || 0,
      healMp: tpl.healMp || 0,
      color: tpl.color,
      desc: tpl.desc
    };
  };

  G.recalcItemStats = function (item) {
    if (!item) return item;
    if (item.category === 'weapon') {
      const fresh = G.createWeaponItem(item.weaponType, item.rarity, item.level, item.enhance, item.tier, item.enchantLv, item.enchantAffix);
      item.tier = fresh.tier;
      item.enchantLv = fresh.enchantLv;
      item.name = fresh.name;
      item.stats = fresh.stats;
      item.price = fresh.price;
    } else if (item.category === 'armor') {
      const fresh = G.createArmorItem(item.templateId, item.rarity, item.level, item.enhance, item.tier, item.enchantLv, item.enchantAffix);
      item.tier = fresh.tier;
      item.enchantLv = fresh.enchantLv;
      item.name = fresh.name;
      item.stats = fresh.stats;
      item.price = fresh.price;
    }
    return item;
  };

  G.rollRarity = function (bonusLuck) {
    const r = Math.random() * 100 + (bonusLuck || 0);
    if (r > 98.5) return 'legendary';
    if (r > 93.0) return 'epic';
    if (r > 80.0) return 'rare';
    if (r > 54.0) return 'uncommon';
    return 'common';
  };
})(window.GameData);
