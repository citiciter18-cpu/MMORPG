/* ==========================================================================
   BladeRealm — Character Palettes, Cosmetics Wardrobe & Battle Pets Data
   ========================================================================== */

window.CosmeticsData = (function () {
  const SKIN_COLORS = [
    { hex: '#f7d5b0', name: 'Светлая' },
    { hex: '#ffe4c8', name: 'Фарфор' },
    { hex: '#e0ac69', name: 'Загар' },
    { hex: '#c68642', name: 'Бронза' },
    { hex: '#8d5524', name: 'Смуглая' },
    { hex: '#5c3818', name: 'Тёмная' },
    { hex: '#cfe5f7', name: 'Ледяная' },
    { hex: '#b8a9c9', name: 'Тёмный эльф' }
  ];

  const HAIR_COLORS = [
    { hex: '#151829', name: 'Ворон' },
    { hex: '#f8fafc', name: 'Серебро' },
    { hex: '#b91c1c', name: 'Багрянец' },
    { hex: '#f59e0b', name: 'Золото' },
    { hex: '#38bdf8', name: 'Лазурь' },
    { hex: '#a855f7', name: 'Аметист' },
    { hex: '#22c55e', name: 'Изумруд' },
    { hex: '#ec4899', name: 'Сакура' },
    { hex: '#78350f', name: 'Каштан' },
    { hex: '#f97316', name: 'Огонь' }
  ];

  const CLOAK_COLORS = [
    { hex: '#c81d32', name: 'Алый' },
    { hex: '#1d4ed8', name: 'Сапфир' },
    { hex: '#15803d', name: 'Лесной' },
    { hex: '#7c3aed', name: 'Бездна' },
    { hex: '#ca8a04', name: 'Золотой' },
    { hex: '#0f172a', name: 'Ночной' },
    { hex: '#0891b2', name: 'Морской' },
    { hex: '#db2777', name: 'Рубин' },
    { hex: '#ea580c', name: 'Пламя' },
    { hex: '#e2e8f0', name: 'Белый' }
  ];

  const EYE_COLORS = [
    { hex: '#ef4444', name: 'Красные' },
    { hex: '#38bdf8', name: 'Голубые' },
    { hex: '#fbbf24', name: 'Янтарные' },
    { hex: '#4ade80', name: 'Зелёные' },
    { hex: '#a855f7', name: 'Фиолетовые' },
    { hex: '#f8fafc', name: 'Белые' }
  ];

  const HAIR_STYLES = [
    { id: 'spiky', name: 'Острые' },
    { id: 'long', name: 'Длинные' },
    { id: 'mohawk', name: 'Ирокез' },
    { id: 'bob', name: 'Каре' }
  ];

  const COSMETICS = [
    // HEADWEAR
    { id: 'head_ninja', slot: 'head', name: 'Повязка Тени', price: 0, rarity: 'common', color: '#dc2626', desc: 'Базовая боевая повязка с лентами.' },
    { id: 'head_cat_ears', slot: 'head', name: 'Ушки Небесного Кота', price: 1200, rarity: 'uncommon', color: '#f472b6', desc: 'Очаровательные кошачьи ушки с золотыми кольцами.' },
    { id: 'head_wolf_mask', slot: 'head', name: 'Маска Белого Волка', price: 2400, rarity: 'rare', color: '#e2e8f0', desc: 'Серебряная волчья полумаска северных охотников.' },
    { id: 'head_mage_hat', slot: 'head', name: 'Шляпа Архимага', price: 3200, rarity: 'rare', color: '#6d28d9', desc: 'Остроконечная шляпа со звёздной лентой.' },
    { id: 'head_demon_horns', slot: 'head', name: 'Рога Демона Бездны', price: 5800, rarity: 'epic', color: '#dc2626', desc: 'Изогнутые огненные рога владыки.' },
    { id: 'head_angel_halo', slot: 'head', name: 'Золотой Нимб', price: 7500, rarity: 'epic', color: '#fde047', desc: 'Сияющий парящий нимб над головой.' },
    { id: 'head_royal_crown', slot: 'head', name: 'Корона Императора', price: 14000, rarity: 'legendary', color: '#fbbf24', desc: 'Императорская корона с рубинами и сапфирами.' },

    // WINGS / BACK
    { id: 'back_scarf_gold', slot: 'back', name: 'Золотой Шарф Героя', price: 900, rarity: 'uncommon', color: '#fbbf24', desc: 'Развевающийся шарф со звёздной вышивкой.' },
    { id: 'back_shadow_wings', slot: 'back', name: 'Теневые Крылья', price: 4800, rarity: 'rare', color: '#7c3aed', desc: 'Дымчатые крылья из энергии Бездны.' },
    { id: 'back_angel_wings', slot: 'back', name: 'Крылья Ангела', price: 8500, rarity: 'epic', color: '#f8fafc', desc: 'Белоснежные пернатые крылья света.' },
    { id: 'back_dragon_wings', slot: 'back', name: 'Крылья Древнего Дракона', price: 11000, rarity: 'epic', color: '#dc2626', desc: 'Мощные чешуйчатые крылья с багровыми перепонками.' },
    { id: 'back_phoenix_wings', slot: 'back', name: 'Крылья Феникса', price: 16500, rarity: 'legendary', color: '#f97316', desc: 'Пылающие крылья из чистого солнечного огня.' },

    // AURAS
    { id: 'aura_arcane', slot: 'aura', name: 'Рунный Круг (Классика)', price: 0, rarity: 'common', color: '#a855f7', desc: 'Классическое фиолетовое рунное кольцо.' },
    { id: 'aura_frost', slot: 'aura', name: 'Ледяные Руны', price: 2200, rarity: 'rare', color: '#38bdf8', desc: 'Вращающиеся кристаллы инея вокруг ног.' },
    { id: 'aura_fire', slot: 'aura', name: 'Кольцо Пламени', price: 3600, rarity: 'rare', color: '#f97316', desc: 'Пылающее огненное кольцо под героем.' },
    { id: 'aura_void', slot: 'aura', name: 'Вихрь Бездны', price: 6200, rarity: 'epic', color: '#c084fc', desc: 'Тёмная вращающаяся сингулярность.' },
    { id: 'aura_golden', slot: 'aura', name: 'Золотое Сияние', price: 9500, rarity: 'legendary', color: '#fde047', desc: 'Священное сияние императоров Аэтельгарда.' },
    { id: 'aura_starlight', slot: 'aura', name: 'Звёздная Пыль', price: 7800, rarity: 'epic', color: '#67e8f9', desc: 'Искрящаяся галактическая аура.' },

    // TRAILS
    { id: 'trail_fire', slot: 'trail', name: 'Огненный След', price: 1800, rarity: 'uncommon', color: '#f97316', desc: 'Искры пламени при каждом шаге.' },
    { id: 'trail_ice', slot: 'trail', name: 'Ледяной След', price: 1800, rarity: 'uncommon', color: '#38bdf8', desc: 'Морозный шлейф снежинок.' },
    { id: 'trail_stars', slot: 'trail', name: 'Звёздный След', price: 3200, rarity: 'rare', color: '#fde047', desc: 'Золотые звёзды позади героя.' },
    { id: 'trail_void', slot: 'trail', name: 'След Тьмы', price: 4500, rarity: 'epic', color: '#a855f7', desc: 'Фиолетовый туман Бездны.' },
    { id: 'trail_lightning', slot: 'trail', name: 'След Молний', price: 5400, rarity: 'epic', color: '#facc15', desc: 'Электрические разряды при беге.' },

    // TITLES
    { id: 'title_novice', slot: 'title', name: 'Искатель Приключений', price: 0, rarity: 'common', color: '#cbd5e1', desc: 'Титул отважного героя.' },
    { id: 'title_collector', slot: 'title', name: 'Модник Аэтельгарда', price: 2500, rarity: 'rare', color: '#f472b6', desc: 'Знаток стиля и украшений.' },
    { id: 'title_raid', slot: 'title', name: 'Повелитель Рейдов', price: 0, unlockHint: 'Пройдите любой Данж', rarity: 'epic', color: '#c084fc', desc: 'Награда за зачистку подземелья.' },
    { id: 'title_arena', slot: 'title', name: 'Чемпион Арены', price: 0, unlockHint: 'Достигните лиги Золото (1500+)', rarity: 'epic', color: '#fbbf24', desc: 'Награда PvP-Арены.' },
    { id: 'title_bounty', slot: 'title', name: 'Охотник за Головами', price: 0, unlockHint: 'Устраните цель из Розыска', rarity: 'epic', color: '#ef4444', desc: 'Гроза преступников и PK.' },
    { id: 'title_warlord', slot: 'title', name: 'Завоеватель Фортов', price: 0, unlockHint: 'Захватите крепость клана', rarity: 'legendary', color: '#f97316', desc: 'Повелитель земель и налогов.' },
    { id: 'title_legend', slot: 'title', name: 'Легенда BladeRealm', price: 25000, rarity: 'legendary', color: '#fde047', desc: 'Высший легендарный титул мира.' }
  ];

  const COSMETIC_BY_ID = {};
  COSMETICS.forEach(c => { COSMETIC_BY_ID[c.id] = c; });

  const PETS = [
    {
      id: 'pet_wolf',
      name: 'Призрачный Волк',
      rarity: 'rare',
      price: 2200,
      color: '#38bdf8',
      accent: '#e0f2fe',
      skillName: 'Магнит лута и Крит',
      desc: 'Собирает лут в радиусе 240px, даёт +8% Крита и +8% Скорости, кусает врагов.',
      bonuses: { crit: 8, speedPct: 0.08, autoLootRange: 240 },
      atkMult: 0.55,
      cd: 3.0
    },
    {
      id: 'pet_cat',
      name: 'Небесный Кот',
      rarity: 'rare',
      price: 2800,
      color: '#f472b6',
      accent: '#fef08a',
      skillName: 'Удача и Мана',
      desc: 'Собирает лут в радиусе 240px, даёт +20% золота и восстанавливает MP каждые 4 сек.',
      bonuses: { goldBonusPct: 20, autoLootRange: 240 },
      mpHeal: 18,
      cd: 4.0
    },
    {
      id: 'pet_golem',
      name: 'Рунический Голем',
      rarity: 'epic',
      price: 4600,
      color: '#64748b',
      accent: '#a855f7',
      skillName: 'Каменный Щит',
      desc: '+18% Защиты и +12% HP, бьёт врагов ударной волной с оглушением.',
      bonuses: { defPct: 0.18, hpPct: 0.12 },
      atkMult: 0.72,
      cd: 4.5
    },
    {
      id: 'pet_dragon',
      name: 'Огненный Дракончик',
      rarity: 'epic',
      price: 6800,
      color: '#dc2626',
      accent: '#fde047',
      skillName: 'Огненный Шар',
      desc: '+14% АТК! Стреляет огненными шарами, поджигая ближайших монстров и боссов.',
      bonuses: { atkPct: 0.14 },
      atkMult: 0.95,
      ranged: true,
      cd: 2.8
    },
    {
      id: 'pet_phoenix',
      name: 'Феникс Рассвета',
      rarity: 'legendary',
      price: 11500,
      color: '#f97316',
      accent: '#fef08a',
      skillName: 'Пламя Возрождения',
      desc: '+10% АТК и +10% HP! Каждые 5 сек лечит героя на 9% HP и сжигает врагов.',
      bonuses: { atkPct: 0.10, hpPct: 0.10 },
      hpHealPct: 0.09,
      atkMult: 0.80,
      ranged: true,
      cd: 5.0
    }
  ];

  const PET_BY_ID = {};
  PETS.forEach(p => { PET_BY_ID[p.id] = p; });

  return {
    SKIN_COLORS,
    HAIR_COLORS,
    CLOAK_COLORS,
    EYE_COLORS,
    HAIR_STYLES,
    COSMETICS,
    COSMETIC_BY_ID,
    PETS,
    PET_BY_ID
  };
})();
