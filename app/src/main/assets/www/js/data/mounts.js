/* ==========================================================================
   BladeRealm — 12 Mounts System (Speed, Bonuses, Rarity, Visual Metadata)
   ========================================================================== */

window.GameData = window.GameData || {};

(function (G) {
  G.MOUNTS = [
    {
      id: 'wolf', name: 'Волк', rarity: 'common', speedBonus: 62, bonusHp: 40, bonusAtk: 4,
      price: 350, unlockedDefault: true, bodyType: 'quadruped_wolf',
      primary: '#cbd5e1', secondary: '#64748b', glow: '#38bdf8',
      desc: 'Верный лесной волк. Быстрый и манёвренный скакун.'
    },
    {
      id: 'horse', name: 'Лошадь', rarity: 'common', speedBonus: 72, bonusHp: 60, bonusAtk: 5,
      price: 600, unlockedDefault: false, bodyType: 'horse',
      primary: '#854d0e', secondary: '#b91c1c', glow: '#fbbf24',
      desc: 'Боевой скакун в рыцарской попоне.'
    },
    {
      id: 'bear', name: 'Медведь', rarity: 'uncommon', speedBonus: 66, bonusHp: 160, bonusAtk: 10,
      price: 1100, unlockedDefault: false, bodyType: 'bear',
      primary: '#713f12', secondary: '#334155', glow: '#f59e0b',
      desc: 'Могучий бронированный медведь. Даёт огромный запас HP.'
    },
    {
      id: 'tiger', name: 'Тигр', rarity: 'rare', speedBonus: 92, bonusHp: 110, bonusAtk: 16,
      price: 2200, unlockedDefault: false, bodyType: 'tiger',
      primary: '#f97316', secondary: '#1e1b18', glow: '#fde047',
      desc: 'Стремительный боевой тигр джунглей.'
    },
    {
      id: 'mammoth', name: 'Мамонт', rarity: 'rare', speedBonus: 74, bonusHp: 280, bonusAtk: 18,
      price: 2900, unlockedDefault: false, bodyType: 'mammoth',
      primary: '#78350f', secondary: '#b91c1c', glow: '#fde68a',
      desc: 'Древний гигант с королевским седлом и бивнями.'
    },
    {
      id: 'unicorn', name: 'Единорог', rarity: 'epic', speedBonus: 106, bonusHp: 180, bonusAtk: 20,
      price: 4500, unlockedDefault: false, bodyType: 'unicorn',
      primary: '#f8fafc', secondary: '#c084fc', glow: '#a855f7',
      desc: 'Мистический белый единорог, сияющий чистой магией.'
    },
    {
      id: 'skeleton_horse', name: 'Скелетный конь', rarity: 'epic', speedBonus: 110, bonusHp: 190, bonusAtk: 25,
      price: 5200, unlockedDefault: false, bodyType: 'skeleton_horse',
      primary: '#e2e8f0', secondary: '#1e293b', glow: '#38bdf8',
      desc: 'Призванный конь некромантов в синем призрачном пламени.'
    },
    {
      id: 'ice_wolf', name: 'Ледяной волк', rarity: 'epic', speedBonus: 115, bonusHp: 210, bonusAtk: 28,
      price: 5800, unlockedDefault: false, bodyType: 'ice_wolf',
      primary: '#bae6fd', secondary: '#0284c7', glow: '#7dd3fc',
      desc: 'Кристальный волк Ледяных пиков, оставляющий иней.'
    },
    {
      id: 'spider', name: 'Теневой паук', rarity: 'epic', speedBonus: 112, bonusHp: 220, bonusAtk: 30,
      price: 6400, unlockedDefault: false, bodyType: 'spider',
      primary: '#1e1b4b', secondary: '#9333ea', glow: '#d946ef',
      desc: 'Фантастический паук Бездны с ядовитым фиолетовым свечением.'
    },
    {
      id: 'phantom_horse', name: 'Призрачный конь', rarity: 'legendary', speedBonus: 128, bonusHp: 260, bonusAtk: 34,
      price: 8800, unlockedDefault: false, bodyType: 'phantom_horse',
      primary: '#1e1b4b', secondary: '#7c3aed', glow: '#c084fc',
      desc: 'Сотканный из эфирной энергии скакун вечности.'
    },
    {
      id: 'dragon', name: 'Дракон Тьмы', rarity: 'legendary', speedBonus: 138, bonusHp: 340, bonusAtk: 42,
      price: 12000, unlockedDefault: false, bodyType: 'dragon',
      primary: '#1f2937', secondary: '#dc2626', glow: '#ef4444',
      desc: 'Крылатый дракон Бездны с алыми крыльями и огненным взором.'
    },
    {
      id: 'fire_dragon', name: 'Огненный дракон', rarity: 'legendary', speedBonus: 150, bonusHp: 420, bonusAtk: 55,
      price: 18500, unlockedDefault: false, bodyType: 'fire_dragon',
      primary: '#292524', secondary: '#f97316', glow: '#facc15',
      desc: 'Верховный пылающий дракон. Максимальная скорость и мощь.'
    }
  ];

  G.MOUNT_BY_ID = {};
  G.MOUNTS.forEach(m => { G.MOUNT_BY_ID[m.id] = m; });
})(window.GameData);
