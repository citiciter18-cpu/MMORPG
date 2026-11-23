/* ==========================================================================
   BladeRealm — Expanded Skill Tree (Max Lv 8-10) + 46 Unique Weapon Spells
   (2 bespoke spells for EVERY ONE of the 23 weapon types!)
   ========================================================================== */

window.GameData = window.GameData || {};

(function (G) {
  G.SKILL_BRANCHES = [
    { id: 'warrior',  name: 'Воин',  color: '#ef4444' },
    { id: 'mage',     name: 'Маг',   color: '#38bdf8' },
    { id: 'assassin', name: 'Тень',  color: '#c084fc' }
  ];

  G.SKILLS = [
    // WARRIOR ACTIVE
    {
      id: 'crimson_slash', branch: 'warrior', type: 'active',
      name: 'Алый Разрез', maxLv: 8, mp: 16, cd: 3.5, range: 175, color: '#ef4444',
      vfx: 'slash_wave', mult: 1.75, multPerLv: 0.24,
      desc: 'Выпускает алую ударную волну, пронзающую врагов впереди.'
    },
    {
      id: 'whirlwind', branch: 'warrior', type: 'active',
      name: 'Вихрь Клинков', maxLv: 8, mp: 24, cd: 5.5, range: 120, color: '#f97316',
      vfx: 'whirlwind', mult: 2.0, multPerLv: 0.28,
      desc: 'Мощное вращение, наносящее круговой урон всем врагам вокруг.'
    },
    {
      id: 'aegis_shield', branch: 'warrior', type: 'active',
      name: 'Щит Титана', maxLv: 8, mp: 22, cd: 12.0, range: 0, color: '#fbbf24',
      vfx: 'shield_buff', duration: 7,
      desc: 'Золотой щит (+45% защиты и регенерация HP на 7 сек).'
    },
    // WARRIOR PASSIVES
    {
      id: 'p_blade_master', branch: 'warrior', type: 'passive',
      name: 'Мастер Оружия', maxLv: 10,
      bonus: { atkPct: 0.06 },
      desc: '+6% к атаке за уровень.'
    },
    {
      id: 'p_iron_skin', branch: 'warrior', type: 'passive',
      name: 'Стальная Кожа', maxLv: 10,
      bonus: { hpFlat: 50, defFlat: 5 },
      desc: '+50 HP и +5 Защиты за уровень.'
    },
    {
      id: 'p_armor_pen', branch: 'warrior', type: 'passive',
      name: 'Пролом Брони', maxLv: 10,
      bonus: { armorPen: 0.04, atkFlat: 6 },
      desc: '+6 АТК и игнорирование 4% брони врага за уровень.'
    },

    // MAGE ACTIVE
    {
      id: 'fire_meteor', branch: 'mage', type: 'active',
      name: 'Огненный Метеор', maxLv: 8, mp: 28, cd: 6.0, range: 265, aoe: 115, color: '#fb923c',
      vfx: 'meteor', mult: 2.35, multPerLv: 0.34,
      desc: 'Призывает метеорит, взрывающийся в области цели и поджигающий врагов.'
    },
    {
      id: 'frost_nova', branch: 'mage', type: 'active',
      name: 'Ледяные Шипы', maxLv: 8, mp: 24, cd: 7.0, range: 155, aoe: 150, color: '#38bdf8',
      vfx: 'frost_nova', mult: 1.8, multPerLv: 0.28,
      desc: 'Взрыв льда вокруг героя, замораживающий врагов на 2.6 сек.'
    },
    {
      id: 'chain_lightning', branch: 'mage', type: 'active',
      name: 'Цепная Молния', maxLv: 8, mp: 20, cd: 4.5, range: 275, color: '#facc15',
      vfx: 'lightning', mult: 1.95, multPerLv: 0.30,
      desc: 'Бьёт молнией до 4 ближайших целей подряд.'
    },
    // MAGE PASSIVES
    {
      id: 'p_arcane_flow', branch: 'mage', type: 'passive',
      name: 'Поток Маны', maxLv: 10,
      bonus: { mpFlat: 32, mpRegen: 2.0 },
      desc: '+32 MP и ускоренное восстановление маны за уровень.'
    },
    {
      id: 'p_elemental_wrath', branch: 'mage', type: 'passive',
      name: 'Гнев Стихий', maxLv: 10,
      bonus: { skillDmgPct: 0.08 },
      desc: '+8% к урону всех навыков и заклинаний оружия за уровень.'
    },
    {
      id: 'p_spell_vamp', branch: 'mage', type: 'passive',
      name: 'Жатва Эфира', maxLv: 10,
      bonus: { lifestealPct: 0.015, mpFlat: 16 },
      desc: '+1.5% вампиризма и +16 MP за уровень.'
    },

    // ASSASSIN / SHADOW ACTIVE
    {
      id: 'shadow_blink', branch: 'assassin', type: 'active',
      name: 'Теневой Рывок', maxLv: 8, mp: 18, cd: 4.5, range: 225, color: '#a855f7',
      vfx: 'shadow_blink', mult: 2.1, multPerLv: 0.30,
      desc: 'Мгновенно переносит за спину врага и наносит критический удар.'
    },
    {
      id: 'poison_fan', branch: 'assassin', type: 'active',
      name: 'Ядовитый Залп', maxLv: 8, mp: 20, cd: 5.0, range: 235, color: '#22c55e',
      vfx: 'poison_fan', mult: 1.55, multPerLv: 0.22,
      desc: 'Веер из 5 отравленных клинков, накладывающих сильный яд.'
    },
    {
      id: 'shadow_dance', branch: 'assassin', type: 'active',
      name: 'Танец Теней', maxLv: 8, mp: 26, cd: 13.0, range: 0, color: '#d946ef',
      vfx: 'haste_buff', duration: 8,
      desc: '+35% крита, +35% скорости атаки и бега на 8 сек.'
    },
    // ASSASSIN PASSIVES
    {
      id: 'p_deadly_crit', branch: 'assassin', type: 'passive',
      name: 'Смертельный Крит', maxLv: 10,
      bonus: { critFlat: 3 },
      desc: '+3% шанса критического удара за уровень.'
    },
    {
      id: 'p_wind_step', branch: 'assassin', type: 'passive',
      name: 'Ловкость Ветра', maxLv: 10,
      bonus: { spdFlat: 8, goldPct: 0.05 },
      desc: '+8 скорости и +5% золота с добычи за уровень.'
    },
    {
      id: 'p_treasure_hunter', branch: 'assassin', type: 'passive',
      name: 'Кладоискатель', maxLv: 10,
      bonus: { goldPct: 0.06, luckFlat: 2 },
      desc: '+6% золота и +2 Удачи (лучше редкость дропа) за уровень.'
    }
  ];

  // =========================================================================
  // 46 UNIQUE WEAPON SPELLS (2 bespoke active spells per EVERY weapon type!)
  // Automatically bound to HUD Skill Slots 1 & 2 when weapon is equipped.
  // =========================================================================
  function ws(weaponId, idx, name, mp, cd, range, aoe, color, vfx, mult, effect, desc) {
    return {
      id: 'ws_' + weaponId + '_' + idx,
      weaponId,
      slotOrder: idx,
      type: 'active',
      isWeaponSpell: true,
      maxLv: 1,
      name,
      mp,
      cd,
      range,
      aoe: aoe || 0,
      color,
      vfx,
      mult,
      multPerLv: 0.12,
      effect,
      desc
    };
  }

  G.WEAPON_SPELLS = {
    sword: [
      ws('sword', 1, 'Выпад Рыцаря', 12, 3.0, 175, 0, '#ef4444', 'slash_wave', 1.65, 'bleed', 'Быстрый рубящий импульс меча, вызывающий кровотечение.'),
      ws('sword', 2, 'Стойка Героя', 20, 10.5, 0, 0, '#fbbf24', 'shield_buff', 1.0, 'shield', 'Усиливает броню и мгновенно восстанавливает здоровье.')
    ],
    greatsword: [
      ws('greatsword', 1, 'Раскол Земли', 18, 4.2, 165, 95, '#e2e8f0', 'shockwave_slam', 2.25, 'knockback', 'Сокрушительный удар двуручником, отбрасывающий врагов.'),
      ws('greatsword', 2, 'Клинок Гиганта', 24, 6.2, 220, 0, '#f87171', 'slash_wave', 2.55, 'armor_brk', 'Гигантская волна стали, разрубающая строй врагов.')
    ],
    dagger: [
      ws('dagger', 1, 'Теневой Укол', 12, 3.2, 210, 0, '#a855f7', 'shadow_blink', 1.95, 'crit_up', 'Молниеносный рывок за спину с гарантированным критом.'),
      ws('dagger', 2, 'Казнь из Тени', 20, 5.5, 115, 0, '#ec4899', 'execute_strike', 2.60, 'crit_up', 'Смертельный добивающий удар (+45% урона по раненым).')
    ],
    dual_blades: [
      ws('dual_blades', 1, 'Перекрёстный Вихрь', 16, 4.0, 115, 115, '#ef4444', 'whirlwind', 1.90, 'bleed', 'Серия парных вращений, разрезающих всех вокруг.'),
      ws('dual_blades', 2, 'Кровавый Танец', 22, 10.0, 0, 0, '#f43f5e', 'haste_buff', 1.0, 'haste', 'Ускоряет парные клинки и повышает крит на 8 сек.')
    ],
    axe: [
      ws('axe', 1, 'Рубка Брони', 14, 3.5, 140, 85, '#94a3b8', 'shockwave_slam', 1.95, 'armor_brk', 'Тяжёлый удар топором, раскалывающий защиту цели.'),
      ws('axe', 2, 'Бросок Топоров', 18, 4.8, 220, 0, '#fb923c', 'cone_barrage', 1.55, 'bleed', 'Метает веер боевых топоров впереди себя.')
    ],
    greataxe: [
      ws('greataxe', 1, 'Смерч Берсерка', 20, 5.0, 130, 130, '#dc2626', 'whirlwind', 2.35, 'knockback', 'Яростный круговой вихрь двуручного топора.'),
      ws('greataxe', 2, 'Гильотина', 26, 6.5, 125, 0, '#b91c1c', 'execute_strike', 2.95, 'bleed', 'Сокрушительная казнь сверху вниз по ослабленной цели.')
    ],
    warhammer: [
      ws('warhammer', 1, 'Сотрясение', 18, 4.8, 150, 135, '#60a5fa', 'shockwave_slam', 2.15, 'stun', 'Удар молотом о землю, оглушающий всех врагов в радиусе.'),
      ws('warhammer', 2, 'Молот Небес', 26, 6.8, 250, 115, '#38bdf8', 'meteor', 2.50, 'stun', 'Обрушивает громовую ударную волну на точку цели.')
    ],
    mace: [
      ws('mace', 1, 'Дробящий Натиск', 15, 3.8, 135, 95, '#c084fc', 'shockwave_slam', 1.95, 'stun', 'Шипастый удар булавой, оглушающий и сбивающий врагов.'),
      ws('mace', 2, 'Оплот Паладина', 22, 10.0, 140, 140, '#fde047', 'holy_nova', 1.75, 'shield', 'Святой импульс: наносит урон вокруг и исцеляет героя.')
    ],
    bow: [
      ws('bow', 1, 'Залп Стрел', 14, 3.5, 290, 0, '#f59e0b', 'cone_barrage', 1.55, 'pierce', 'Выпускает веер из 5 пробивающих стрел.'),
      ws('bow', 2, 'Дождь Стрел', 24, 6.0, 290, 130, '#fde047', 'arrow_rain', 2.30, 'slow', 'Обрушивает ливень стрел по выбранной области.')
    ],
    crossbow: [
      ws('crossbow', 1, 'Снайперский Болт', 16, 3.8, 320, 0, '#fbbf24', 'beam_blast', 2.40, 'pierce', 'Сверхскоростной бронебойный болт насквозь по линии.'),
      ws('crossbow', 2, 'Взрывная Ловушка', 22, 5.8, 280, 110, '#f97316', 'meteor', 2.35, 'burn', 'Разрывной болт, поджигающий группу врагов.')
    ],
    staff: [
      ws('staff', 1, 'Сфера Арканы', 16, 3.6, 280, 105, '#a855f7', 'meteor', 2.05, 'mana_leech', 'Детонирует сгусток арканы и возвращает ману.'),
      ws('staff', 2, 'Эфирный Луч', 24, 5.5, 310, 0, '#c084fc', 'beam_blast', 2.45, 'arcane', 'Пронзает всех врагов на линии лучом магии.')
    ],
    wand: [
      ws('wand', 1, 'Искры Мороза', 12, 2.8, 260, 0, '#38bdf8', 'cone_barrage', 1.45, 'slow', 'Быстрый залп из 5 ледяных искр с замедлением.'),
      ws('wand', 2, 'Зеркальный Всплеск', 20, 5.5, 150, 145, '#7dd3fc', 'frost_nova', 1.90, 'freeze', 'Мгновенная морозная вспышка, сковывающая врагов.')
    ],
    flame_blade: [
      ws('flame_blade', 1, 'Огненный Веер', 16, 3.6, 210, 0, '#f97316', 'slash_wave', 2.05, 'burn', 'Волна раскалённого пламени, поджигающая всех на пути.'),
      ws('flame_blade', 2, 'Метеоритный Разлом', 26, 6.2, 240, 120, '#ef4444', 'meteor', 2.60, 'burn', 'Вызывает огненный взрыв на позиции цели.')
    ],
    frost_blade: [
      ws('frost_blade', 1, 'Клинок Стужи', 15, 3.5, 200, 0, '#0ea5e9', 'slash_wave', 1.95, 'freeze', 'Ледяная дуга, замораживающая врагов на линии.'),
      ws('frost_blade', 2, 'Буря Зимы', 24, 6.0, 160, 155, '#bae6fd', 'frost_nova', 2.25, 'freeze', 'Мощная ледяная нова, сковывающая всех вокруг.')
    ],
    lightning_blade: [
      ws('lightning_blade', 1, 'Грозовой Выпад', 16, 3.6, 240, 0, '#facc15', 'shadow_blink', 2.10, 'chain', 'Рывок молнией сквозь врага с электрошоком.'),
      ws('lightning_blade', 2, 'Цепь Грома', 22, 4.8, 285, 0, '#fde047', 'lightning', 2.30, 'chain', 'Разряд перескакивает сразу по 5 врагам подряд.')
    ],
    poison_dagger: [
      ws('poison_dagger', 1, 'Веер Яда', 14, 3.4, 240, 0, '#22c55e', 'poison_fan', 1.65, 'poison', 'Бросает 5 ядовитых кинжалов веером.'),
      ws('poison_dagger', 2, 'Токсичный Удар', 20, 5.2, 130, 0, '#4ade80', 'execute_strike', 2.55, 'poison', 'Взрывает яд на цели, нанося огромный урон раненым.')
    ],
    spear: [
      ws('spear', 1, 'Сквозное Копьё', 14, 3.2, 240, 0, '#fb923c', 'beam_blast', 2.05, 'pierce', 'Дальний пронзающий прокол насквозь по прямой.'),
      ws('spear', 2, 'Натиск Копейщика', 20, 5.0, 225, 0, '#cbd5e1', 'shadow_blink', 2.20, 'knockback', 'Стремительный рывок к врагу с отбрасывающим ударом.')
    ],
    halberd: [
      ws('halberd', 1, 'Сметающая Дуга', 18, 4.0, 145, 145, '#e11d48', 'whirlwind', 2.20, 'bleed', 'Широчайший круговой взмах алебардой.'),
      ws('halberd', 2, 'Карающий Раскол', 24, 5.8, 175, 100, '#fb7185', 'shockwave_slam', 2.50, 'armor_brk', 'Мощный удар древком и лезвием, ломающий броню.')
    ],
    scythe: [
      ws('scythe', 1, 'Жатва Душ', 18, 4.2, 145, 145, '#9333ea', 'vamp_reap', 2.15, 'lifesteal', 'Кровавое рассечение косой: похищает 22% урона в HP!'),
      ws('scythe', 2, 'Приговор Смерти', 25, 6.0, 140, 0, '#e879f9', 'execute_strike', 2.85, 'lifesteal', 'Казнит ослабленных врагов и восстанавливает здоровье.')
    ],
    spellbook: [
      ws('spellbook', 1, 'Рунический Взрыв', 18, 4.0, 280, 125, '#7c3aed', 'meteor', 2.20, 'burn', 'Активирует древние руны, взрывая область цели.'),
      ws('spellbook', 2, 'Шторм Гримуара', 24, 5.2, 290, 0, '#c084fc', 'lightning', 2.35, 'chain', 'Выпускает серию цепных арканных разрядов.')
    ],
    crystal_staff: [
      ws('crystal_staff', 1, 'Призматический Луч', 20, 4.2, 330, 0, '#06b6d4', 'beam_blast', 2.55, 'freeze', 'Мощнейший ледяной луч кристаллов, пробивающий всех.'),
      ws('crystal_staff', 2, 'Кристальная Нова', 26, 6.2, 175, 170, '#22d3ee', 'frost_nova', 2.40, 'freeze', 'Огромная взрывная волна кристаллов с заморозкой.')
    ],
    legendary_sword: [
      ws('legendary_sword', 1, 'Волна Рассвета', 20, 3.8, 250, 0, '#f59e0b', 'slash_wave', 2.55, 'burn', 'Золотой разрез света, сметающий всех врагов впереди.'),
      ws('legendary_sword', 2, 'Сияние Королей', 28, 8.0, 165, 165, '#fde047', 'holy_nova', 2.65, 'shield', 'Взрыв святого света: огромный урон вокруг + лечение и щит!')
    ],
    ancient_artifact: [
      ws('ancient_artifact', 1, 'Коллапс Бездны', 22, 4.5, 310, 140, '#c026d3', 'meteor', 2.75, 'lifesteal', 'Стягивает энергию древних богов в разрушительный взрыв.'),
      ws('ancient_artifact', 2, 'Гнев Древних', 28, 5.5, 320, 0, '#e879f9', 'lightning', 2.65, 'chaos', 'Хаотические разряды Бездны поражают до 5 целей и лечат.')
    ]
  };

  G.SKILL_BY_ID = {};
  G.SKILLS.forEach(s => { G.SKILL_BY_ID[s.id] = s; });
  Object.values(G.WEAPON_SPELLS).forEach(pair => {
    pair.forEach(sp => { G.SKILL_BY_ID[sp.id] = sp; });
  });
})(window.GameData);
