/* ==========================================================================
   BladeRealm — Monsters, Dungeon Bosses, World Boss & Tiered Loot Tables (T1-T8)
   Balanced for deeper MMORPG grind & enchant catalyst drops
   ========================================================================== */

window.GameData = window.GameData || {};

(function (G) {
  G.MONSTER_TYPES = {
    wolf: {
      id: 'wolf', name: 'Лесной волк', level: 2, tier: 1, hp: 125, atk: 13, def: 3, speed: 92,
      xp: 34, gold: [6, 14], aggro: 190, range: 46, biome: 'forest',
      body: 'wolf', color: '#94a3b8', accent: '#cbd5e1', radius: 18,
      drops: ['hp_potion', 'herb_t1', 'wood_t1'], weaponDrops: ['sword', 'dagger', 'bow']
    },
    goblin: {
      id: 'goblin', name: 'Гоблин-налётчик', level: 4, tier: 2, hp: 185, atk: 19, def: 6, speed: 98,
      xp: 52, gold: [11, 22], aggro: 210, range: 48, biome: 'forest',
      body: 'goblin', color: '#4ade80', accent: '#854d0e', radius: 17,
      drops: ['hp_potion', 'mp_potion', 'ore_t2', 'rune_t1'], weaponDrops: ['dagger', 'axe', 'poison_dagger', 'dual_blades']
    },
    swamp_troll: {
      id: 'swamp_troll', name: 'Болотный тролль', level: 7, tier: 3, hp: 310, atk: 27, def: 10, speed: 78,
      xp: 84, gold: [16, 32], aggro: 210, range: 54, biome: 'swamp',
      body: 'troll', color: '#4d7c0f', accent: '#a855f7', radius: 22,
      drops: ['swamp_shroom', 'herb_t2', 'rune_t1', 'hp_potion'], weaponDrops: ['mace', 'poison_dagger', 'axe', 'staff']
    },
    corsair: {
      id: 'corsair', name: 'Береговой корсар', level: 10, tier: 4, hp: 460, atk: 38, def: 14, speed: 96,
      xp: 126, gold: [25, 50], aggro: 225, range: 52, biome: 'coast',
      body: 'pirate', color: '#1d4ed8', accent: '#fbbf24', radius: 19,
      drops: ['sea_pearl', 'ore_t3', 'rune_t1', 'upgrade_stone'], weaponDrops: ['sword', 'dual_blades', 'crossbow', 'spear']
    },
    orc: {
      id: 'orc', name: 'Орк-берсерк', level: 12, tier: 4, hp: 520, atk: 44, def: 16, speed: 84,
      xp: 148, gold: [30, 62], aggro: 220, range: 56, biome: 'desert',
      body: 'orc', color: '#65a30d', accent: '#dc2626', radius: 22,
      drops: ['desert_spice', 'ore_t4', 'soul_t2', 'upgrade_stone'], weaponDrops: ['greataxe', 'warhammer', 'mace', 'greatsword']
    },
    skeleton: {
      id: 'skeleton', name: 'Скелет-воин', level: 15, tier: 5, hp: 690, atk: 52, def: 20, speed: 88,
      xp: 190, gold: [38, 76], aggro: 230, range: 54, biome: 'snow',
      body: 'skeleton', color: '#e2e8f0', accent: '#38bdf8', radius: 19,
      drops: ['frost_shard', 'ore_t5', 'soul_t2', 'scroll_enchant'], weaponDrops: ['spear', 'halberd', 'frost_blade', 'crossbow', 'wand']
    },
    ice_wolf: {
      id: 'ice_wolf', name: 'Снежный хищник', level: 17, tier: 5, hp: 820, atk: 58, def: 22, speed: 105,
      xp: 225, gold: [44, 88], aggro: 235, range: 50, biome: 'snow',
      body: 'wolf', color: '#7dd3fc', accent: '#e0f2fe', radius: 20,
      drops: ['frost_shard', 'herb_t5', 'soul_t2', 'hp_potion_lg'], weaponDrops: ['frost_blade', 'crystal_staff', 'bow']
    },
    zombie: {
      id: 'zombie', name: 'Чумной зомби', level: 19, tier: 6, hp: 1050, atk: 68, def: 25, speed: 72,
      xp: 280, gold: [55, 108], aggro: 240, range: 52, biome: 'dungeon',
      body: 'zombie', color: '#6ee7b7', accent: '#4c1d95', radius: 20,
      drops: ['hp_potion_lg', 'relic_t3', 'upgrade_stone', 'scroll_enchant'], weaponDrops: ['scythe', 'poison_dagger', 'spellbook']
    },
    crystal_golem: {
      id: 'crystal_golem', name: 'Кристальный голем', level: 21, tier: 6, hp: 1320, atk: 78, def: 32, speed: 74,
      xp: 345, gold: [68, 134], aggro: 240, range: 60, biome: 'crystal',
      body: 'golem', color: '#7c3aed', accent: '#38bdf8', radius: 25,
      drops: ['star_crystal', 'ore_t6', 'relic_t3', 'scroll_enchant'], weaponDrops: ['crystal_staff', 'warhammer', 'lightning_blade', 'spellbook']
    },
    demon: {
      id: 'demon', name: 'Демон Пламени', level: 24, tier: 7, hp: 1680, atk: 92, def: 35, speed: 94,
      xp: 430, gold: [84, 165], aggro: 255, range: 170, ranged: true, projColor: '#f97316', biome: 'dungeon',
      body: 'demon', color: '#dc2626', accent: '#facc15', radius: 23,
      drops: ['relic_t3', 'star_crystal', 'magma_core', 'ore_t7'], weaponDrops: ['flame_blade', 'lightning_blade', 'staff', 'halberd']
    },
    magma_elem: {
      id: 'magma_elem', name: 'Лавовый элементаль', level: 26, tier: 7, hp: 2150, atk: 108, def: 40, speed: 84,
      xp: 540, gold: [105, 205], aggro: 265, range: 185, ranged: true, projColor: '#fb923c', biome: 'volcano',
      body: 'elemental', color: '#ea580c', accent: '#fde047', radius: 26,
      drops: ['magma_core', 'ore_t7', 'relic_t3', 'scroll_enchant'], weaponDrops: ['flame_blade', 'greataxe', 'ancient_artifact']
    },
    dragon: {
      id: 'dragon', name: 'Огненный Виверн', level: 28, tier: 8, hp: 2650, atk: 122, def: 44, speed: 96,
      xp: 660, gold: [130, 250], aggro: 270, range: 195, ranged: true, projColor: '#ef4444', biome: 'volcano',
      body: 'dragon', color: '#991b1b', accent: '#f97316', radius: 28,
      drops: ['dragon_scale', 'magma_core', 'ancient_essence', 'ore_t8'], weaponDrops: ['flame_blade', 'legendary_sword', 'crystal_staff']
    },
    // COASTAL BOSS (T4)
    boss_kraken: {
      id: 'boss_kraken', name: 'Левиафан Глубин', level: 15, tier: 4, hp: 3800, atk: 78, def: 28, speed: 76,
      xp: 1100, gold: [240, 420], aggro: 290, range: 180, ranged: true, projColor: '#38bdf8', biome: 'coast',
      isBoss: true, bossTier: 'БОСС T4 ПОБЕРЕЖЬЯ', body: 'kraken_boss', color: '#0369a1', accent: '#67e8f9', radius: 33,
      drops: ['sea_pearl', 'soul_t2', 'scroll_enchant', 'upgrade_stone'], weaponDrops: ['frost_blade', 'halberd', 'crystal_staff', 'spear']
    },
    // DUNGEON BOSS (T6)
    boss_lich: {
      id: 'boss_lich', name: 'Король Лич Склепа', level: 22, tier: 6, hp: 5800, atk: 112, def: 36, speed: 78,
      xp: 1750, gold: [420, 720], aggro: 320, range: 210, ranged: true, projColor: '#c084fc', biome: 'dungeon',
      isBoss: true, bossTier: 'БОСС T6 ПОДЗЕМЕЛЬЯ', body: 'lich_boss', color: '#581c87', accent: '#38bdf8', radius: 34,
      drops: ['relic_t3', 'star_crystal', 'scroll_enchant', 'dragon_scale'], weaponDrops: ['scythe', 'spellbook', 'crystal_staff', 'ancient_artifact']
    },
    // SECRET BOSS (T7)
    boss_ancient: {
      id: 'boss_ancient', name: 'Хранитель Древних', level: 28, tier: 7, hp: 8200, atk: 140, def: 44, speed: 86,
      xp: 2650, gold: [680, 1150], aggro: 310, range: 200, ranged: true, projColor: '#fbbf24', biome: 'secret',
      isBoss: true, bossTier: 'СЕКРЕТНЫЙ БОСС T7', body: 'ancient_boss', color: '#d97706', accent: '#c084fc', radius: 36,
      drops: ['relic_t3', 'ancient_essence', 'scroll_enchant', 'dragon_scale'], weaponDrops: ['legendary_sword', 'ancient_artifact', 'lightning_blade']
    },
    // VOLCANO BOSS (T8)
    boss_volcano: {
      id: 'boss_volcano', name: 'Титан Вулкана Игнис', level: 30, tier: 8, hp: 10800, atk: 158, def: 48, speed: 82,
      xp: 3600, gold: [920, 1550], aggro: 330, range: 220, ranged: true, projColor: '#f97316', biome: 'volcano',
      isBoss: true, bossTier: 'БОСС T8 ВУЛКАНА', body: 'elemental', color: '#b91c1c', accent: '#fde047', radius: 38,
      drops: ['ancient_essence', 'magma_core', 'dragon_scale', 'scroll_enchant'], weaponDrops: ['flame_blade', 'legendary_sword', 'warhammer', 'ancient_artifact']
    },
    // WORLD BOSS (T8)
    world_dragon: {
      id: 'world_dragon', name: 'Древний Дракон Бездны', level: 34, tier: 8, hp: 14500, atk: 175, def: 52, speed: 90,
      xp: 5200, gold: [1350, 2200], aggro: 360, range: 240, ranged: true, projColor: '#ef4444', biome: 'dungeon',
      isBoss: true, isWorldBoss: true, bossTier: 'МИРОВОЙ БОСС T8', body: 'world_dragon', color: '#111827', accent: '#ef4444', radius: 44,
      drops: ['ancient_essence', 'dragon_scale', 'scroll_enchant', 'magma_core'], weaponDrops: ['legendary_sword', 'ancient_artifact', 'flame_blade', 'scythe']
    }
  };
})(window.GameData);
