/* ==========================================================================
   BladeRealm — MMORPG Systems: Trade, Auction, Clan, Quests, Achievements,
   Professions, Crafting, Shop, Storage, Leaderboards, Chat, Save/Load, NetStub
   ========================================================================== */

window.MMO = (function () {
  // Multiplayer-ready Network Adapter abstraction
  const NetworkAdapter = {
    mode: 'local_smart_bots',
    connected: false,
    sendPacket(type, payload) {
      // Ready to plug into WebSocket server in future multiplayer update
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type, payload }));
      }
    }
  };

  const chatLog = [];
  const auctionListings = [];
  const party = []; // bot IDs
  let auctionTimer = 0;
  let listingIdCounter = 100;

  // Story + Repeatable Daily Quests
  const QUEST_DEFS = [
    { id: 'q_wolves',   daily: false, title: 'Охота на волков',        goalText: 'Убить 6 Лесных волков',        type: 'kill', target: 'wolf',         need: 6,  rewardGold: 260,  rewardXp: 240,  rewardItem: 'upgrade_stone' },
    { id: 'q_goblins',  daily: false, title: 'Зачистка леса',          goalText: 'Убить 6 Гоблинов',             type: 'kill', target: 'goblin',       need: 6,  rewardGold: 420,  rewardXp: 380,  rewardItem: 'hp_potion_lg' },
    { id: 'q_orcs',     daily: false, title: 'Песчаная угроза',        goalText: 'Убить 6 Орков в пустыне',      type: 'kill', target: 'orc',          need: 6,  rewardGold: 780,  rewardXp: 650,  rewardItem: 'upgrade_stone' },
    { id: 'q_lich',     daily: false, title: 'Повелитель Склепа',      goalText: 'Победить Короля Лича',         type: 'kill', target: 'boss_lich',    need: 1,  rewardGold: 2200, rewardXp: 1600, rewardItem: 'star_crystal' },
    { id: 'q_kraken',   daily: false, title: 'Ужас Берега Бурь',       goalText: 'Победить Кракена Глубин',      type: 'kill', target: 'boss_kraken',  need: 1,  rewardGold: 3100, rewardXp: 2200, rewardItem: 'sea_pearl' },
    { id: 'q_volcano',  daily: false, title: 'Сердце Вулкана',         goalText: 'Победить Титана Магмы',        type: 'kill', target: 'boss_volcano', need: 1,  rewardGold: 3800, rewardXp: 2800, rewardItem: 'magma_core' },
    { id: 'q_dragon',   daily: false, title: 'Убийца Мирового Босса',  goalText: 'Победить Древнего Дракона',    type: 'kill', target: 'world_dragon', need: 1,  rewardGold: 5200, rewardXp: 3600, rewardItem: 'dragon_scale' },
    { id: 'd_gather',   daily: true,  title: 'Ежедневный: Собиратель', goalText: 'Собрать 4 ресурса в мире',     type: 'gather',   target: 'any',      need: 4,  rewardGold: 380,  rewardXp: 260,  rewardItem: 'upgrade_stone' },
    { id: 'd_fish',     daily: true,  title: 'Ежедневный: Рыбак',      goalText: 'Поймать 3 рыбы',               type: 'fish',     target: 'any',      need: 3,  rewardGold: 360,  rewardXp: 220,  rewardItem: 'mp_potion_lg' },
    { id: 'd_trade',    daily: true,  title: 'Ежедневный: Торговец',   goalText: 'Совершить 1 сделку на бирже/аукционе/трейде', type: 'trade', target: 'any', need: 1, rewardGold: 480, rewardXp: 320, rewardItem: 'star_crystal' },
    { id: 'd_duel',     daily: true,  title: 'Ежедневный: Гладиатор',  goalText: 'Победить в 1 дуэли с ботом',   type: 'duel_win', target: 'any',      need: 1,  rewardGold: 600,  rewardXp: 380,  rewardItem: 'upgrade_stone' }
  ];

  // Achievements
  const ACHIEVEMENTS = [
    { id: 'ach_kills_10',   name: 'Первая кровь',       desc: 'Побеждено 10 монстров',     stat: 'kills',     need: 10,   rewardGold: 300 },
    { id: 'ach_kills_50',   name: 'Охотник на чудовищ', desc: 'Побеждено 50 монстров',     stat: 'kills',     need: 50,   rewardGold: 1200 },
    { id: 'ach_lv_10',      name: 'Ветеран Аэтельгарда',desc: 'Достигнут 10 уровень',      stat: 'level',     need: 10,   rewardGold: 900 },
    { id: 'ach_boss_1',     name: 'Покоритель боссов',  desc: 'Побеждён любой босс',       stat: 'bossKills', need: 1,    rewardGold: 1500 },
    { id: 'ach_mounts_3',   name: 'Всадник легенд',     desc: 'Открыто 3 маунта',          stat: 'mounts',    need: 3,    rewardGold: 1100 },
    { id: 'ach_trade_1',    name: 'Хитрый купец',       desc: 'Совершён обмен с игроком',  stat: 'trades',    need: 1,    rewardGold: 500 },
    { id: 'ach_auction_1',  name: 'Аукционный магнат',  desc: 'Сделка на Аукционе',        stat: 'auctions',  need: 1,    rewardGold: 550 },
    { id: 'ach_contracts',  name: 'Караванный барон',   desc: 'Выполнено 3 торговых контракта', stat: 'contracts', need: 3, rewardGold: 1400 },
    { id: 'ach_craft_1',    name: 'Мастер кузницы',     desc: 'Создан предмет в крафте',   stat: 'crafts',    need: 1,    rewardGold: 600 },
    { id: 'ach_enh_5',      name: 'Искусство заточки',  desc: 'Улучшен предмет до +5',     stat: 'maxEnhance',need: 5,    rewardGold: 1400 },
    { id: 'ach_duel_1',     name: 'Дуэлянт арены',      desc: 'Победа в дуэли PvP',        stat: 'duelsWon',  need: 1,    rewardGold: 700 },
    { id: 'ach_fish_5',     name: 'Король рыбалки',     desc: 'Поймано 5 рыб',             stat: 'fishCaught',need: 5,    rewardGold: 650 }
  ];

  // Crafting Recipes (Tools T2-T8, Tiered T2-T8 Gear, Alchemy & Enchant Catalysts)
  const CRAFT_RECIPES = [
    // Alchemy & Enchanting
    { id: 'cr_hp_lg',      cat: 'alchemy', prof: 'Алхимия',        name: 'Эликсир жизни (x2)',          req: { herb_t1: 3, herb_t2: 2 },                     gold: 85,    make: () => window.GameData.createConsumableItem('hp_potion_lg', 2) },
    { id: 'cr_mp_lg',      cat: 'alchemy', prof: 'Алхимия',        name: 'Эликсир маны (x2)',           req: { herb_t1: 2, herb_t2: 2 },                     gold: 85,    make: () => window.GameData.createConsumableItem('mp_potion_lg', 2) },
    { id: 'cr_stone',      cat: 'alchemy', prof: 'Ювелирка',       name: 'Камень заточки (x2)',         req: { ore_t2: 4, wood_t2: 2 },                      gold: 130,   make: () => window.GameData.createConsumableItem('upgrade_stone', 2) },
    { id: 'cr_rune_t1',    cat: 'alchemy', prof: 'Ювелирка',       name: 'Руна чар .1 (x2)',            req: { ore_t2: 3, herb_t2: 3 },                      gold: 180,   make: () => window.GameData.createConsumableItem('rune_t1', 2) },
    { id: 'cr_soul_t2',    cat: 'alchemy', prof: 'Ювелирка',       name: 'Душа чар .2 (x2)',            req: { ore_t4: 3, herb_t4: 3, rune_t1: 2 },          gold: 520,   make: () => window.GameData.createConsumableItem('soul_t2', 2) },
    { id: 'cr_relic_t3',   cat: 'alchemy', prof: 'Ювелирка',       name: 'Реликвия чар .3 (x2)',        req: { ore_t6: 3, herb_t6: 3, soul_t2: 2 },          gold: 1450,  make: () => window.GameData.createConsumableItem('relic_t3', 2) },
    { id: 'cr_anc_ess',    cat: 'alchemy', prof: 'Ювелирка',       name: 'Древняя эссенция .4',         req: { ore_t8: 3, herb_t8: 3, relic_t3: 2 },         gold: 3800,  make: () => window.GameData.createConsumableItem('ancient_essence', 1) },
    { id: 'cr_scroll',     cat: 'alchemy', prof: 'Алхимия',        name: 'Свиток магических чар',       req: { wood_t3: 3, herb_t3: 3, rune_t1: 1 },         gold: 360,   make: () => window.GameData.createConsumableItem('scroll_enchant', 1) },
    { id: 'cr_star_cr',    cat: 'alchemy', prof: 'Ювелирка',       name: 'Звёздный кристалл (x2)',      req: { frost_shard: 2, sea_pearl: 2 },               gold: 260,   make: () => window.GameData.createConsumableItem('star_crystal', 2) },

    // Tiered Gear Crafting (T3..T8)
    { id: 'cr_sword_t3',   cat: 'gear', prof: 'Кузнечное дело', name: '[T3] Стальной Двуручный меч',     req: { ore_t3: 6, wood_t3: 4, upgrade_stone: 1 },    gold: 620,   make: () => window.GameData.createWeaponItem('greatsword', 'uncommon', 6, 0, 3, 0) },
    { id: 'cr_bow_t4',     cat: 'gear', prof: 'Кузнечное дело', name: '[T4] Кипарисовый Лук [Редк]',     req: { wood_t4: 7, ore_t4: 4, rune_t1: 2 },          gold: 1450,  make: () => window.GameData.createWeaponItem('bow', 'rare', 10, 0, 4, 1) },
    { id: 'cr_flame_t5',   cat: 'gear', prof: 'Кузнечное дело', name: '[T5] Огненный клинок [Эпик]',     req: { ore_t5: 8, wood_t5: 5, soul_t2: 2 },          gold: 3600,  make: () => window.GameData.createWeaponItem('flame_blade', 'epic', 14, 1, 5, 1) },
    { id: 'cr_frost_t5',   cat: 'gear', prof: 'Кузнечное дело', name: '[T5] Ледяной клинок [Эпик]',      req: { ore_t5: 8, frost_shard: 4, soul_t2: 2 },      gold: 3600,  make: () => window.GameData.createWeaponItem('frost_blade', 'epic', 14, 1, 5, 1) },
    { id: 'cr_poison_t6',  cat: 'gear', prof: 'Алхимия',        name: '[T6] Ядовитый кинжал [Эпик]',     req: { ore_t6: 7, herb_t6: 6, relic_t3: 2 },         gold: 7400,  make: () => window.GameData.createWeaponItem('poison_dagger', 'epic', 18, 1, 6, 1) },
    { id: 'cr_scythe_t6',  cat: 'gear', prof: 'Кузнечное дело', name: '[T6] Боевая коса [Эпик]',         req: { ore_t6: 9, wood_t6: 6, star_crystal: 3 },     gold: 8200,  make: () => window.GameData.createWeaponItem('scythe', 'epic', 18, 2, 6, 1) },
    { id: 'cr_armor_t6',   cat: 'gear', prof: 'Кузнечное дело', name: '[T6] Доспех Бездны [Эпик]',       req: { ore_t6: 10, herb_t6: 5, relic_t3: 2 },        gold: 7900,  make: () => window.GameData.createArmorItem('armor_abyss', 'epic', 18, 1, 6, 1) },
    { id: 'cr_wings_t7',   cat: 'gear', prof: 'Кузнечное дело', name: '[T7] Крылья Бездны [Эпик]',       req: { wood_t7: 7, herb_t7: 6, relic_t3: 3 },        gold: 16500, make: () => window.GameData.createArmorItem('cloak_wings', 'epic', 23, 2, 7, 2) },
    { id: 'cr_legend_t8',  cat: 'gear', prof: 'Кузнечное дело', name: '[T8] Легендарный меч [Лег]',      req: { ore_t8: 10, wood_t8: 8, dragon_scale: 4, ancient_essence: 2 }, gold: 42000, make: () => window.GameData.createWeaponItem('legendary_sword', 'legendary', 28, 3, 8, 2) },
    { id: 'cr_artifact_t8',cat: 'gear', prof: 'Ювелирка',       name: '[T8] Древний артефакт [Лег]',     req: { herb_t8: 10, ore_t8: 8, dragon_scale: 4, ancient_essence: 2 }, gold: 45000, make: () => window.GameData.createWeaponItem('ancient_artifact', 'legendary', 28, 3, 8, 2) }
  ];

  // Auto-generate Crafting Recipes for ALL Gathering Tools T2–T8 (Топор, Кирка, Серп)
  // Crafting a T_N tool uses resources from T_(N-1) so players progress step-by-step T1 -> T2 -> ... -> T8!
  for (let t = 2; t <= 8; t++) {
    const prev = t - 1;
    const baseGold = Math.round(90 * Math.pow(2.25, t - 2));
    const matQty = 3 + t;
    CRAFT_RECIPES.push(
      {
        id: 'cr_tool_axe_t' + t, cat: 'tools', tier: t, prof: 'Кузнечное дело',
        name: '[T' + t + '] Топор лесоруба (рубка до T' + t + ')',
        req: { ['wood_t' + prev]: matQty, ['ore_t' + prev]: Math.max(2, matQty - 1) },
        gold: baseGold,
        make: () => window.GameData.createToolItem('axe', t)
      },
      {
        id: 'cr_tool_pickaxe_t' + t, cat: 'tools', tier: t, prof: 'Кузнечное дело',
        name: '[T' + t + '] Кирка рудокопа (руда до T' + t + ')',
        req: { ['ore_t' + prev]: matQty, ['wood_t' + prev]: Math.max(2, matQty - 1) },
        gold: baseGold,
        make: () => window.GameData.createToolItem('pickaxe', t)
      },
      {
        id: 'cr_tool_sickle_t' + t, cat: 'tools', tier: t, prof: 'Кузнечное дело',
        name: '[T' + t + '] Серп травника (травы до T' + t + ')',
        req: { ['ore_t' + prev]: Math.max(2, matQty - 1), ['herb_t' + prev]: matQty },
        gold: baseGold,
        make: () => window.GameData.createToolItem('sickle', t)
      }
    );
  }

  // Active Trade Session State
  const tradeSession = {
    active: false,
    botId: null,
    playerItems: [], // bag item uids
    playerGold: 0,
    botItems: [],    // item objects from bot.inventory
    botGold: 0,
    playerLocked: false,
    botLocked: false,
    botMessage: ''
  };

  function addChat(channel, sender, text, botId) {
    chatLog.push({
      ch: channel || 'world',
      sender,
      text,
      botId: botId || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (chatLog.length > 70) chatLog.shift();
    if (window.UI && window.UI.renderChat) window.UI.renderChat();
  }

  // Inventory & Storage Helpers
  function addItemToBag(item, targetArr, maxSlots) {
    const bag = targetArr || window.GameState.inventory;
    const cap = maxSlots || 60;
    if (item.stackable) {
      const existing = bag.find(i => i.templateId === item.templateId);
      if (existing) {
        existing.qty += (item.qty || 1);
        return true;
      }
    }
    if (bag.length >= cap) return false;
    bag.push(item);
    return true;
  }

  function countTemplateInBag(templateId) {
    return window.GameState.inventory
      .filter(i => i.templateId === templateId)
      .reduce((acc, i) => acc + (i.qty || 1), 0);
  }

  function consumeTemplateFromBag(templateId, qty) {
    let rem = qty;
    const bag = window.GameState.inventory;
    for (let i = bag.length - 1; i >= 0 && rem > 0; i--) {
      if (bag[i].templateId === templateId) {
        if (bag[i].qty > rem) {
          bag[i].qty -= rem;
          rem = 0;
        } else {
          rem -= bag[i].qty;
          bag.splice(i, 1);
        }
      }
    }
    return rem === 0;
  }

  function equipItem(uid) {
    const bag = window.GameState.inventory;
    const idx = bag.findIndex(i => i.uid === uid);
    if (idx === -1) return false;
    const item = bag[idx];
    if (!item.slot) return false;
    const eq = window.GameState.player.equipment;
    const prev = eq[item.slot];
    bag.splice(idx, 1);
    eq[item.slot] = item;
    if (prev) bag.push(prev);
    window.GameState.recalcStats();
    if (window.GameAPI && window.GameAPI.rebuildSkillBar) window.GameAPI.rebuildSkillBar();
    window.UI.toast('Экипировано: ' + item.name);
    return true;
  }

  function unequipSlot(slotId) {
    const eq = window.GameState.player.equipment;
    const item = eq[slotId];
    if (!item) return false;
    if (window.GameState.inventory.length >= 60) {
      window.UI.toast('Инвентарь полон!');
      return false;
    }
    eq[slotId] = null;
    window.GameState.inventory.push(item);
    window.GameState.recalcStats();
    if (window.GameAPI && window.GameAPI.rebuildSkillBar) window.GameAPI.rebuildSkillBar();
    return true;
  }

  // Highest owned Tool Tier (T1..T8) for 'axe', 'pickaxe', 'sickle'
  function getBestToolTier(toolKind) {
    let best = 0;
    const bag = window.GameState ? window.GameState.inventory : [];
    for (let i = 0; i < bag.length; i++) {
      const it = bag[i];
      if (it && it.category === 'tool' && it.toolKind === toolKind) {
        if ((it.tier || 1) > best) best = it.tier || 1;
      }
    }
    return best;
  }

  // Enchantment Level Upgrade (.0 -> .1 -> .2 -> .3 -> .4)
  function enchantItemLevel(item) {
    if (!item || (item.category !== 'weapon' && item.category !== 'armor')) return false;
    const cur = item.enchantLv || 0;
    if (cur >= 4) {
      window.UI.toast('Максимальный уровень зачарования .4 уже достигнут!');
      return false;
    }
    const nextCfg = window.GameData.ENCHANT_LEVELS[cur + 1];
    const tMult = 1 + ((item.tier || 1) - 1) * 0.65;
    const goldCost = Math.round(nextCfg.goldBase * tMult);
    const catName = window.GameData.CONSUMABLES[nextCfg.catalyst]?.name || nextCfg.catalyst;
    if (window.GameState.player.gold < goldCost) {
      window.UI.toast('Не хватает золота (' + goldCost.toLocaleString() + ')!');
      return false;
    }
    if (countTemplateInBag(nextCfg.catalyst) < nextCfg.qty) {
      window.UI.toast('Нужно: ' + catName + ' x' + nextCfg.qty + '!');
      return false;
    }
    window.GameState.player.gold -= goldCost;
    consumeTemplateFromBag(nextCfg.catalyst, nextCfg.qty);
    item.enchantLv = cur + 1;
    window.GameData.recalcItemStats(item);
    window.GameState.recalcStats();
    window.UI.toast('Зачаровано! ' + item.name + ' (' + nextCfg.name + ')');
    if (window.GameAPI) window.GameAPI.vibrate(25);
    return true;
  }

  // Apply / Reroll Magic Affix via Свиток магических чар
  function applyEnchantAffix(item) {
    if (!item || (item.category !== 'weapon' && item.category !== 'armor')) return false;
    const goldCost = Math.round(250 * (item.tier || 1));
    if (window.GameState.player.gold < goldCost) {
      window.UI.toast('Не хватает золота (' + goldCost + ')!');
      return false;
    }
    if (countTemplateInBag('scroll_enchant') < 1) {
      window.UI.toast('Нужен Свиток магических чар (1 шт.)!');
      return false;
    }
    window.GameState.player.gold -= goldCost;
    consumeTemplateFromBag('scroll_enchant', 1);
    const keys = window.GameData.ENCHANT_AFFIX_KEYS.filter(k => k !== item.enchantAffix);
    const picked = keys[Math.floor(Math.random() * keys.length)];
    item.enchantAffix = picked;
    const aff = window.GameData.ENCHANT_AFFIXES[picked];
    window.GameState.recalcStats();
    window.UI.toast('Наложены чары «' + aff.name + '» на ' + item.name + '!');
    if (window.GameAPI) window.GameAPI.vibrate(22);
    return true;
  }

  // Hero Attribute Points Upgrade (STR / VIT / INT / AGI / LCK)
  function upgradeAttribute(attrKey) {
    const p = window.GameState.player;
    if (!p || !p.attributes || (p.statPoints || 0) <= 0) return false;
    if (typeof p.attributes[attrKey] !== 'number') return false;
    p.statPoints -= 1;
    p.attributes[attrKey] += 1;
    window.GameState.recalcStats();
    return true;
  }

  function grantWeaponMastery(weaponType, xpGain) {
    if (!weaponType || !window.GameState.mastery) return;
    const map = window.GameState.mastery.weapons;
    if (!map[weaponType]) map[weaponType] = { lv: 1, xp: 0 };
    const m = map[weaponType];
    m.xp += xpGain || 8;
    const need = Math.round(80 * Math.pow(m.lv, 1.45));
    if (m.xp >= need && m.lv < 50) {
      m.xp -= need;
      m.lv += 1;
      window.GameState.recalcStats();
      const wName = window.GameData.WEAPON_BY_ID[weaponType]?.name || weaponType;
      window.UI.toast('Мастерство «' + wName + '» повышено до ур. ' + m.lv + '!');
    }
  }

  function grantGatherMastery(toolKind, xpGain) {
    if (!toolKind || !window.GameState.mastery) return;
    const g = window.GameState.mastery.gather;
    if (!g[toolKind]) g[toolKind] = { lv: 1, xp: 0 };
    const m = g[toolKind];
    m.xp += xpGain || 12;
    const need = Math.round(65 * Math.pow(m.lv, 1.4));
    if (m.xp >= need && m.lv < 50) {
      m.xp -= need;
      m.lv += 1;
      const labels = { axe: 'Лесорубка', pickaxe: 'Горное дело', sickle: 'Травничество', fish: 'Рыбалка' };
      window.UI.toast('Мастерство «' + (labels[toolKind] || toolKind) + '» повышено до ур. ' + m.lv + '!');
    }
  }

  function useConsumable(uid) {
    const bag = window.GameState.inventory;
    const idx = bag.findIndex(i => i.uid === uid);
    if (idx === -1) return false;
    const item = bag[idx];
    const p = window.GameState.player;
    if (item.category !== 'potion') return false;
    if (item.healHp) {
      p.hp = Math.min(p.maxHp, p.hp + item.healHp);
      window.Combat.addText(p.x, p.y - 22, '+' + item.healHp + ' HP', '#4ade80', false);
    }
    if (item.healMp) {
      p.mp = Math.min(p.maxMp, p.mp + item.healMp);
      window.Combat.addText(p.x, p.y - 12, '+' + item.healMp + ' MP', '#38bdf8', false);
    }
    item.qty -= 1;
    if (item.qty <= 0) bag.splice(idx, 1);
    return true;
  }

  function enhanceItem(item) {
    if (!item || (item.category !== 'weapon' && item.category !== 'armor')) return;
    if ((item.enhance || 0) >= 15) {
      window.UI.toast('Достигнут максимальный уровень заточки +15!');
      return;
    }
    const nextLv = (item.enhance || 0) + 1;
    const stoneCost = Math.max(1, Math.ceil(nextLv / 3));
    const goldCost = 80 * nextLv;
    if (window.GameState.player.gold < goldCost) {
      window.UI.toast('Не хватает золота (' + goldCost + ')!');
      return;
    }
    if (countTemplateInBag('upgrade_stone') < stoneCost) {
      window.UI.toast('Нужно Камней заточки: ' + stoneCost + '!');
      return;
    }
    window.GameState.player.gold -= goldCost;
    consumeTemplateFromBag('upgrade_stone', stoneCost);

    const chance = Math.max(30, 100 - (nextLv - 1) * 5.5);
    if (Math.random() * 100 <= chance) {
      item.enhance = nextLv;
      window.GameData.recalcItemStats(item);
      window.GameState.stats.maxEnhance = Math.max(window.GameState.stats.maxEnhance || 0, nextLv);
      window.GameState.recalcStats();
      window.UI.toast('Успех! ' + item.name + ' улучшен до +' + nextLv + '!');
      if (window.GameAPI) window.GameAPI.vibrate(25);
    } else {
      window.UI.toast('Заточка не удалась (предмет сохранён). Попробуйте снова!');
    }
  }

  function splitStack(uid, splitQty) {
    const bag = window.GameState.inventory;
    const item = bag.find(i => i.uid === uid);
    if (!item || !item.stackable || item.qty <= 1) return false;
    const q = Math.max(1, Math.min(item.qty - 1, Math.floor(splitQty)));
    if (bag.length >= 60) { window.UI.toast('Нет свободного слота!'); return false; }
    item.qty -= q;
    const copy = Object.assign({}, item, { uid: window.GameData.nextUid(), qty: q });
    bag.push(copy);
    return true;
  }

  // XP & Level Up (Steeper MMORPG Grind Curve + Stat Points + Skill Points)
  function xpForLevel(lv) {
    return Math.round(160 * Math.pow(lv, 1.72));
  }

  function grantXp(amount) {
    const p = window.GameState.player;
    p.xp += amount;
    while (p.xp >= xpForLevel(p.level)) {
      p.xp -= xpForLevel(p.level);
      p.level += 1;
      p.skillPoints = (p.skillPoints || 0) + 2;
      p.statPoints = (p.statPoints || 0) + 3;
      window.GameState.recalcStats();
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      window.Combat.addText(p.x, p.y - 40, 'УРОВЕНЬ ' + p.level + '!', '#fde047', true);
      window.Combat.addParticles(p.x, p.y, '#fde047', 26, 160);
      window.UI.toast('Уровень ' + p.level + '! +3 очка характеристик и +2 очка навыков!');
      addChat('system', 'Система', p.name + ' достиг ' + p.level + ' уровня!');
      if (window.GameAPI) window.GameAPI.vibrate(35);
    }
  }

  // Quest & Achievement Progress
  function onMonsterKilled(m) {
    window.GameState.stats.kills = (window.GameState.stats.kills || 0) + 1;
    if (m.isBoss) window.GameState.stats.bossKills = (window.GameState.stats.bossKills || 0) + 1;
    QUEST_DEFS.forEach(q => {
      if (q.type === 'kill' && (q.target === m.typeId || q.target === 'any')) {
        const st = window.GameState.quests[q.id];
        if (st && !st.claimed && st.prog < q.need) {
          st.prog = Math.min(q.need, st.prog + 1);
          if (st.prog === q.need) window.UI.toast('Задание выполнено: ' + q.title + '!');
        }
      }
    });
  }

  function onProgressEvent(type, amount) {
    QUEST_DEFS.forEach(q => {
      if (q.type === type) {
        const st = window.GameState.quests[q.id];
        if (st && !st.claimed && st.prog < q.need) {
          st.prog = Math.min(q.need, st.prog + (amount || 1));
          if (st.prog === q.need) window.UI.toast('Задание выполнено: ' + q.title + '!');
        }
      }
    });
  }

  function claimQuest(qid) {
    const q = QUEST_DEFS.find(x => x.id === qid);
    const st = window.GameState.quests[qid];
    if (!q || !st || st.prog < q.need || st.claimed) return false;
    window.GameState.player.gold += q.rewardGold;
    grantXp(q.rewardXp);
    if (q.rewardItem) {
      addItemToBag(window.GameData.createConsumableItem(q.rewardItem, 2));
    }
    if (q.daily) {
      st.prog = 0;
      st.claimed = false;
      window.UI.toast('Награда получена! Ежедневное задание обновлено.');
    } else {
      st.claimed = true;
      window.UI.toast('Задание «' + q.title + '» завершено! +' + q.rewardGold + ' золота.');
    }
    return true;
  }

  function getAchievementVal(stat) {
    const p = window.GameState.player;
    const s = window.GameState.stats;
    if (stat === 'level') return p.level;
    if (stat === 'mounts') return window.GameState.unlockedMounts.length;
    return s[stat] || 0;
  }

  function claimAchievement(achId) {
    const a = ACHIEVEMENTS.find(x => x.id === achId);
    if (!a || window.GameState.claimedAchievements[achId]) return false;
    if (getAchievementVal(a.stat) < a.need) return false;
    window.GameState.claimedAchievements[achId] = true;
    window.GameState.player.gold += a.rewardGold;
    window.UI.toast('Достижение «' + a.name + '»: +' + a.rewardGold + ' золота!');
    return true;
  }

  // =========================================================================
  // LIVE MMORPG ECONOMY (Dynamic Market Indices, Events, Exchange, Caravan,
  // Trade Contracts & Guild Bank with Passive Interest)
  // =========================================================================
  const MARKET_GROUPS = {
    wood:   { id: 'wood',   name: 'Древесина (T1-T8)',    color: '#d97706', mult: 1.00, prevMult: 1.00, history: [0.98, 1.02, 0.97, 1.01, 1.03, 0.99, 1.00, 1.00] },
    ore:    { id: 'ore',    name: 'Руда и металлы',       color: '#94a3b8', mult: 1.00, prevMult: 1.00, history: [0.96, 1.01, 0.99, 1.04, 1.02, 0.98, 1.01, 1.00] },
    herbs:  { id: 'herbs',  name: 'Травы и алхимия',      color: '#4ade80', mult: 1.04, prevMult: 1.00, history: [0.98, 0.97, 1.02, 1.05, 1.01, 1.03, 1.00, 1.04] },
    gems:   { id: 'gems',   name: 'Самоцветы и чары',     color: '#38bdf8', mult: 1.06, prevMult: 1.02, history: [1.00, 1.04, 1.02, 1.06, 1.05, 1.03, 1.02, 1.06] },
    exotic: { id: 'exotic', name: 'Караванная экзотика',  color: '#fbbf24', mult: 1.02, prevMult: 1.00, history: [0.95, 0.99, 1.03, 1.01, 0.98, 1.04, 1.00, 1.02] },
    boss:   { id: 'boss',   name: 'Трофеи боссов',        color: '#f43f5e', mult: 1.08, prevMult: 1.04, history: [1.02, 1.05, 1.08, 1.04, 1.07, 1.09, 1.05, 1.08] },
    gear:   { id: 'gear',   name: 'Оружие и броня',       color: '#c084fc', mult: 1.00, prevMult: 1.00, history: [1.00, 0.98, 1.02, 1.01, 0.99, 1.03, 1.00, 1.00] }
  };

  const MARKET_EVENTS = [
    { id: 'guild_war',    name: 'Война гильдий',         desc: 'Кузницы скупают металл и лес: Руда +28%, Древесина +22%',          bias: { ore: 0.28, wood: 0.22, gear: 0.18 },  auctionFee: 0.05 },
    { id: 'alch_boom',    name: 'Алхимический бум',      desc: 'Высокий спрос на травы и чары: Травы +30%, Самоцветы +16%',        bias: { herbs: 0.30, gems: 0.16 },            auctionFee: 0.05 },
    { id: 'caravan_fest', name: 'Караванная ярмарка',    desc: 'Торговцы в восторге: Экзотика +32%, комиссия аукциона 3%!',        bias: { exotic: 0.32, wood: 0.14 },           auctionFee: 0.03 },
    { id: 'crystal_rush', name: 'Лихорадка чар',         desc: 'Маги скупают руны и кристаллы: Чары +32%, Трофеи боссов +18%',     bias: { gems: 0.32, boss: 0.18 },             auctionFee: 0.05 },
    { id: 'boss_bounty',  name: 'Сезон охоты на боссов', desc: 'Гильдия платит за редкие трофеи: Боссы +35%, Травы +16%',          bias: { boss: 0.35, herbs: 0.16 },            auctionFee: 0.05 },
    { id: 'tax_holiday',  name: 'Беспошлинный день',     desc: 'Король снизил налоги: комиссия аукциона 2%, Снаряжение +15%',      bias: { gear: 0.15, ore: 0.10 },              auctionFee: 0.02 },
    { id: 'mine_surplus', name: 'Избыток руды',          desc: 'Шахты переполнены: Руда -18% (выгодно купить!), Чары +22%',        bias: { ore: -0.18, gems: 0.22 },             auctionFee: 0.05 },
    { id: 'royal_order',  name: 'Королевский заказ',     desc: 'Двор строит флот: Древесина +32%, Руда +18%, Снаряжение +20%',     bias: { wood: 0.32, ore: 0.18, gear: 0.20 },  auctionFee: 0.04 }
  ];

  const EXCHANGE_COMMODITIES = [
    'wood_t1', 'ore_t1', 'herb_t1',
    'wood_t2', 'ore_t2', 'herb_t2',
    'wood_t3', 'ore_t3', 'herb_t3',
    'wood_t4', 'ore_t4', 'herb_t4',
    'wood_t5', 'ore_t5', 'herb_t5',
    'wood_t6', 'ore_t6', 'herb_t6',
    'wood_t7', 'ore_t7', 'herb_t7',
    'wood_t8', 'ore_t8', 'herb_t8',
    'rune_t1', 'soul_t2', 'relic_t3', 'scroll_enchant', 'upgrade_stone',
    'sea_pearl', 'desert_spice', 'frost_shard', 'star_crystal', 'magma_core', 'dragon_scale'
  ];

  const economy = {
    groups: MARKET_GROUPS,
    activeEvent: MARKET_EVENTS[0],
    eventTimer: 90,
    tickTimer: 0,
    bankTimer: 120,
    auctionFee: 0.05,
    contracts: [],
    contractIdSeq: 1
  };

  function getItemMarketGroup(item) {
    if (!item) return 'gear';
    if (item.marketGroup && MARKET_GROUPS[item.marketGroup]) return item.marketGroup;
    const tpl = item.templateId && window.GameData.CONSUMABLES[item.templateId];
    if (tpl && tpl.marketGroup && MARKET_GROUPS[tpl.marketGroup]) return tpl.marketGroup;
    if (item.category === 'weapon' || item.category === 'armor' || item.category === 'tool') return 'gear';
    if (item.category === 'potion') return 'herbs';
    return 'ore';
  }

  function getCurrentBiomeBonus(groupId) {
    const p = window.GameState && window.GameState.player;
    if (!p || !window.World || !window.World.getBiomeAt) return { pct: 0, biomeName: '' };
    const b = window.World.getBiomeAt(p.x, p.y);
    if (b && b.bonusGroup === groupId && b.bonusPct > 0) {
      return { pct: b.bonusPct * 0.65, biomeName: b.name };
    }
    return { pct: 0, biomeName: b ? b.name : '' };
  }

  function getMarketPrice(item) {
    if (!item) return 20;
    const gid = getItemMarketGroup(item);
    const grp = MARKET_GROUPS[gid] || MARKET_GROUPS.gear;
    const base = (item.price || 30) * (item.qty || 1);
    return Math.max(5, Math.round(base * grp.mult));
  }

  function getSellPrice(item) {
    if (!item) return 8;
    const gid = getItemMarketGroup(item);
    const mkt = getMarketPrice(item);
    const reg = getCurrentBiomeBonus(gid);
    return Math.max(4, Math.round(mkt * 0.50 * (1 + reg.pct)));
  }

  function getDemandLabel(groupId) {
    const grp = MARKET_GROUPS[groupId] || MARKET_GROUPS.gear;
    if (grp.mult >= 1.25) return { text: 'АЖИОТАЖ', color: '#4ade80' };
    if (grp.mult >= 1.08) return { text: 'РОСТ', color: '#86efac' };
    if (grp.mult <= 0.82) return { text: 'ИЗБЫТОК', color: '#f87171' };
    if (grp.mult <= 0.94) return { text: 'СПАД', color: '#fca5a5' };
    return { text: 'СТАБИЛЬНО', color: '#cbd5e1' };
  }

  function getExchangeQuote(templateId) {
    const tpl = window.GameData.CONSUMABLES[templateId];
    if (!tpl) return null;
    const gid = tpl.marketGroup || 'ore';
    const grp = MARKET_GROUPS[gid] || MARKET_GROUPS.ore;
    const reg = getCurrentBiomeBonus(gid);
    const fair = Math.max(8, Math.round(tpl.price * grp.mult));
    const buyPrice = Math.max(10, Math.round(fair * 1.08));
    const sellPrice = Math.max(6, Math.round(fair * 0.94 * (1 + reg.pct)));
    const trendPct = Math.round(((grp.mult - grp.prevMult) / Math.max(0.1, grp.prevMult)) * 100);
    return {
      templateId,
      tpl,
      group: grp,
      fair,
      buyPrice,
      sellPrice,
      trendPct,
      regionalBonusPct: Math.round(reg.pct * 100),
      biomeName: reg.biomeName,
      history: grp.history
    };
  }

  function exchangeBuy(templateId, qty) {
    const q = getExchangeQuote(templateId);
    const count = Math.max(1, Math.round(qty || 1));
    if (!q) return false;
    const total = q.buyPrice * count;
    if (window.GameState.player.gold < total) {
      window.UI.toast('Не хватает золота (' + total + ')!');
      return false;
    }
    const item = window.GameData.createConsumableItem(templateId, count);
    if (!addItemToBag(item)) {
      window.UI.toast('Инвентарь переполнен!');
      return false;
    }
    window.GameState.player.gold -= total;
    // Buying pushes demand up slightly
    q.group.mult = Math.min(1.75, +(q.group.mult + 0.008 * count).toFixed(3));
    onProgressEvent('trade', 1);
    window.UI.toast('Биржа: куплено ' + q.tpl.name + ' x' + count + ' за ' + total + ' зол.');
    return true;
  }

  function exchangeSell(templateId, qty) {
    const q = getExchangeQuote(templateId);
    if (!q) return false;
    const have = countTemplateInBag(templateId);
    if (have <= 0) {
      window.UI.toast('У вас нет «' + q.tpl.name + '» в сумке!');
      return false;
    }
    const count = qty === 'all' ? have : Math.min(have, Math.max(1, Math.round(qty || 1)));
    const earned = q.sellPrice * count;
    consumeTemplateFromBag(templateId, count);
    window.GameState.player.gold += earned;
    // Selling supplies market, lowers price slightly
    q.group.mult = Math.max(0.62, +(q.group.mult - 0.006 * count).toFixed(3));
    onProgressEvent('trade', 1);
    const bonusTxt = q.regionalBonusPct > 0 ? ' (бонус биома +' + q.regionalBonusPct + '%!)' : '';
    window.UI.toast('Биржа: продано ' + q.tpl.name + ' x' + count + ' за +' + earned + ' зол.' + bonusTxt);
    return true;
  }

  function generateTradeContract() {
    const pool = ['wood_t1', 'ore_t1', 'herb_t1', 'wood_t2', 'ore_t2', 'herb_t2', 'wood_t3', 'ore_t3', 'herb_t3', 'wood_t4', 'ore_t4', 'desert_spice', 'sea_pearl', 'frost_shard', 'fish_common'];
    const tid = pool[Math.floor(Math.random() * pool.length)];
    const tpl = window.GameData.CONSUMABLES[tid];
    const rare = tpl.price >= 110;
    const qty = rare ? (2 + Math.floor(Math.random() * 4)) : (5 + Math.floor(Math.random() * 6));
    const q = getExchangeQuote(tid);
    const mult = 1.35 + Math.random() * 0.20;
    const rewardGold = Math.round((q ? q.fair : tpl.price) * qty * mult);
    const rewardXp = Math.round(80 + rewardGold * 0.34);
    const patrons = ['Гильдия Купцов', 'Караван Оазиса', 'Порт Бурь', 'Королевский Двор', 'Орден Алхимиков', 'Северная Фактория'];
    return {
      id: 'ctr_' + (economy.contractIdSeq++),
      patron: patrons[Math.floor(Math.random() * patrons.length)],
      templateId: tid,
      itemName: tpl.name,
      qty,
      rewardGold,
      rewardXp,
      bonusItem: rare ? 'rune_t1' : 'upgrade_stone'
    };
  }

  function initEconomy() {
    economy.contracts.length = 0;
    for (let i = 0; i < 4; i++) economy.contracts.push(generateTradeContract());
  }

  function refreshContracts() {
    if (window.GameState.player.gold < 40) {
      window.UI.toast('Обновление контрактов стоит 40 золота.');
      return false;
    }
    window.GameState.player.gold -= 40;
    initEconomy();
    window.UI.toast('Список торговых контрактов обновлён!');
    return true;
  }

  function completeContract(contractId) {
    const idx = economy.contracts.findIndex(c => c.id === contractId);
    if (idx === -1) return false;
    const ctr = economy.contracts[idx];
    if (countTemplateInBag(ctr.templateId) < ctr.qty) {
      window.UI.toast('Не хватает: ' + ctr.itemName + ' (нужно ' + ctr.qty + ')');
      return false;
    }
    consumeTemplateFromBag(ctr.templateId, ctr.qty);
    window.GameState.player.gold += ctr.rewardGold;
    grantXp(ctr.rewardXp);
    if (ctr.bonusItem) addItemToBag(window.GameData.createConsumableItem(ctr.bonusItem, 1));
    window.GameState.stats.contracts = (window.GameState.stats.contracts || 0) + 1;
    onProgressEvent('trade', 1);
    window.UI.toast('Контракт выполнен! +' + ctr.rewardGold + ' зол., +' + ctr.rewardXp + ' XP!');
    addChat('trade', ctr.patron, 'Благодарим ' + window.GameState.player.name + ' за поставку «' + ctr.itemName + '» x' + ctr.qty + '!');
    economy.contracts.splice(idx, 1, generateTradeContract());
    return true;
  }

  const bankHistory = [];

  function pushBankLog(type, val) {
    bankHistory.unshift({
      type,
      val,
      at: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
    if (bankHistory.length > 10) bankHistory.pop();
  }

  function bankDeposit(amount) {
    const p = window.GameState.player;
    const raw = amount === 'all' ? p.gold : amount;
    const val = Math.min(p.gold, Math.max(0, Math.floor(Number(raw) || 0)));
    if (val <= 0) { window.UI.toast('Недостаточно монет для вклада!'); return false; }
    p.gold -= val;
    window.GameState.bankBalance = (window.GameState.bankBalance || 0) + val;
    pushBankLog('deposit', val);
    saveProgress();
    window.UI.toast('Положено в Банк монет: ' + val.toLocaleString() + ' монет (защищены при смерти!)');
    return true;
  }

  function bankWithdraw(amount) {
    const bal = window.GameState.bankBalance || 0;
    const val = amount === 'all' ? bal : Math.min(bal, Math.max(0, Math.floor(Number(amount) || 0)));
    if (val <= 0) { window.UI.toast('В Банке монет пусто!'); return false; }
    window.GameState.bankBalance -= val;
    window.GameState.player.gold += val;
    pushBankLog('withdraw', val);
    saveProgress();
    window.UI.toast('Снято из Банка монет: ' + val.toLocaleString() + ' монет.');
    return true;
  }

  function updateEconomy(dt) {
    // 1. Dynamic Market Price Ticks every 12s
    economy.tickTimer += dt;
    if (economy.tickTimer >= 12) {
      economy.tickTimer = 0;
      const evBias = (economy.activeEvent && economy.activeEvent.bias) || {};
      Object.values(MARKET_GROUPS).forEach(grp => {
        grp.prevMult = grp.mult;
        const target = 1.0 + (evBias[grp.id] || 0);
        const pull = (target - grp.mult) * 0.32;
        const wave = (Math.random() - 0.5) * 0.14;
        grp.mult = Math.max(0.65, Math.min(1.68, +(grp.mult + pull + wave).toFixed(3)));
        grp.history.push(grp.mult);
        if (grp.history.length > 8) grp.history.shift();
      });
    }

    // 2. Rotating World Market Event every 75s
    economy.eventTimer -= dt;
    if (economy.eventTimer <= 0) {
      economy.eventTimer = 75;
      const nextEv = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
      economy.activeEvent = nextEv;
      economy.auctionFee = nextEv.auctionFee || 0.05;
      addChat('trade', 'Биржа', 'Событие рынка: «' + nextEv.name + '» — ' + nextEv.desc);
    }

    // 3. Guild Bank Passive Interest (+2.0% every 120s, max 650g — smooth grind!)
    if ((window.GameState.bankBalance || 0) > 0) {
      economy.bankTimer -= dt;
      if (economy.bankTimer <= 0) {
        economy.bankTimer = 120;
        const interest = Math.min(650, Math.max(4, Math.round(window.GameState.bankBalance * 0.02)));
        window.GameState.bankBalance += interest;
        addChat('trade', 'Банк Гильдии', 'Начислены проценты по вкладу: +' + interest.toLocaleString() + ' золота.');
      }
    } else {
      economy.bankTimer = 120;
    }
  }

  // =========================================================================
  // AUCTION HOUSE (Market-Aware Bot Listings + Player Selling + Smart Buyers)
  // =========================================================================
  function initAuctionHouse() {
    initEconomy();
    auctionListings.length = 0;
    for (let i = 0; i < 22; i++) {
      generateBotAuctionListing();
    }
  }

  function generateBotAuctionListing() {
    const bots = window.Bots.list;
    const merchants = bots.filter(b => b.role === 'merchant' || b.role === 'gatherer');
    const pool = merchants.length && Math.random() < 0.55 ? merchants : bots;
    const seller = pool.length ? pool[Math.floor(Math.random() * pool.length)] : { name: 'Торговец' };
    const lv = Math.max(1, (seller.level || 5) + Math.floor(Math.random() * 5) - 2);
    const rar = window.GameData.rollRarity(26);
    let item;
    const r = Math.random();
    if (r < 0.48) {
      const wt = window.GameData.WEAPON_TYPES[Math.floor(Math.random() * window.GameData.WEAPON_TYPES.length)];
      item = window.GameData.createWeaponItem(wt.id, rar, lv, Math.random() < 0.34 ? Math.floor(Math.random() * 4) + 1 : 0);
    } else if (r < 0.74) {
      const at = window.GameData.ARMOR_TEMPLATES[Math.floor(Math.random() * window.GameData.ARMOR_TEMPLATES.length)];
      item = window.GameData.createArmorItem(at.id, rar, lv, Math.random() < 0.28 ? 2 : 0);
    } else {
      const resKeys = ['upgrade_stone', 'star_crystal', 'mithril_ore', 'dragon_scale', 'hp_potion_lg', 'fish_golden', 'swamp_shroom', 'desert_spice', 'sea_pearl', 'frost_shard', 'magma_core'];
      const rk = resKeys[Math.floor(Math.random() * resKeys.length)];
      item = window.GameData.createConsumableItem(rk, 1 + Math.floor(Math.random() * 4));
    }
    const baseVal = getMarketPrice(item);
    const buyout = Math.max(15, Math.round(baseVal * (0.82 + Math.random() * 0.44)));
    const bid = Math.max(10, Math.round(buyout * 0.72));
    auctionListings.push({
      id: 'auc_' + (listingIdCounter++),
      sellerName: seller.name,
      isPlayerListing: false,
      item,
      buyout,
      currentBid: bid,
      highBidder: null,
      expiresIn: 180 + Math.floor(Math.random() * 240)
    });
  }

  function buyAuctionListing(id) {
    const idx = auctionListings.findIndex(l => l.id === id);
    if (idx === -1) return false;
    const lot = auctionListings[idx];
    if (lot.isPlayerListing) {
      // Cancel own listing
      if (addItemToBag(lot.item)) {
        auctionListings.splice(idx, 1);
        window.UI.toast('Лот снят с аукциона и возвращён в инвентарь.');
        return true;
      }
      return false;
    }
    if (window.GameState.player.gold < lot.buyout) {
      window.UI.toast('Недостаточно золота для выкупа!');
      return false;
    }
    if (!addItemToBag(lot.item)) {
      window.UI.toast('Инвентарь полон!');
      return false;
    }
    window.GameState.player.gold -= lot.buyout;
    auctionListings.splice(idx, 1);
    window.GameState.stats.auctions = (window.GameState.stats.auctions || 0) + 1;
    onProgressEvent('trade', 1);
    addChat('trade', lot.sellerName, 'Спасибо за покупку «' + lot.item.name + '» на Аукционе!');
    window.UI.toast('Куплено: ' + lot.item.name + ' за ' + lot.buyout + ' золота!');
    generateBotAuctionListing();
    return true;
  }

  function placeBidAuction(id) {
    const lot = auctionListings.find(l => l.id === id);
    if (!lot || lot.isPlayerListing) return false;
    const nextBid = Math.round(lot.currentBid * 1.12) + 10;
    if (nextBid >= lot.buyout) return buyAuctionListing(id);
    if (window.GameState.player.gold < nextBid) {
      window.UI.toast('Недостаточно золота для ставки!');
      return false;
    }
    lot.currentBid = nextBid;
    lot.highBidder = window.GameState.player.name;
    lot.expiresIn = Math.min(lot.expiresIn, 12);
    window.UI.toast('Ставка ' + nextBid + ' принята! Торги завершатся через ' + Math.ceil(lot.expiresIn) + 'с.');
    return true;
  }

  function listPlayerItemOnAuction(uid, price) {
    const bag = window.GameState.inventory;
    const idx = bag.findIndex(i => i.uid === uid);
    if (idx === -1) return false;
    const p = Math.max(10, Math.round(Number(price) || 100));
    const item = bag.splice(idx, 1)[0];
    auctionListings.unshift({
      id: 'auc_' + (listingIdCounter++),
      sellerName: window.GameState.player.name,
      isPlayerListing: true,
      item,
      buyout: p,
      currentBid: Math.round(p * 0.8),
      highBidder: null,
      expiresIn: 90
    });
    window.UI.toast('Лот «' + item.name + '» выставлен за ' + p + ' золота!');
    addChat('trade', window.GameState.player.name, 'Выставил «' + item.name + '» на Аукцион за ' + p + ' золота!');
    return true;
  }

  function updateAuction(dt) {
    auctionTimer += dt;
    if (auctionTimer < 1) return;
    auctionTimer = 0;
    for (let i = auctionListings.length - 1; i >= 0; i--) {
      const lot = auctionListings[i];
      lot.expiresIn -= 1;

      // Smart merchant & player bots inspect player's auction listings using live market prices!
      if (lot.isPlayerListing && Math.random() < 0.16) {
        const fairVal = getMarketPrice(lot.item);
        if (lot.buyout <= fairVal * 1.65) {
          const merchants = window.Bots.list.filter(b => b.role === 'merchant');
          const bPool = merchants.length && Math.random() < 0.65 ? merchants : window.Bots.list;
          const buyer = bPool[Math.floor(Math.random() * bPool.length)];
          const feeRate = economy.auctionFee || 0.05;
          const fee = Math.round(lot.buyout * feeRate);
          const net = lot.buyout - fee;
          window.GameState.player.gold += net;
          window.GameState.stats.auctions = (window.GameState.stats.auctions || 0) + 1;
          onProgressEvent('trade', 1);
          addChat('trade', 'Аукцион', (buyer ? buyer.name : 'Игрок') + ' выкупил ваш лот «' + lot.item.name + '» (+' + net + ' зол., комиссия ' + Math.round(feeRate * 100) + '%)!');
          window.UI.toast('Ваш лот куплен за ' + net + ' золота!');
          auctionListings.splice(i, 1);
          continue;
        }
      }

      if (lot.expiresIn <= 0) {
        if (lot.highBidder === window.GameState.player.name) {
          if (window.GameState.player.gold >= lot.currentBid && addItemToBag(lot.item)) {
            window.GameState.player.gold -= lot.currentBid;
            window.GameState.stats.auctions = (window.GameState.stats.auctions || 0) + 1;
            onProgressEvent('trade', 1);
            window.UI.toast('Вы выиграли торги за «' + lot.item.name + '»!');
          }
        } else if (lot.isPlayerListing) {
          addItemToBag(lot.item);
          window.UI.toast('Срок лота «' + lot.item.name + '» истёк — возвращён в сумку.');
        }
        auctionListings.splice(i, 1);
        if (auctionListings.length < 20) generateBotAuctionListing();
      }
    }
  }

  // =========================================================================
  // DIRECT SMART BOT TRADE SYSTEM (Обмены / Трейды)
  // =========================================================================
  function startTradeWithBot(botId) {
    const bot = window.Bots.byId(botId);
    if (!bot) return;
    tradeSession.active = true;
    tradeSession.botId = botId;
    tradeSession.playerItems = [];
    tradeSession.playerGold = 0;
    tradeSession.botItems = [];
    tradeSession.botGold = 0;
    tradeSession.playerLocked = false;
    tradeSession.botLocked = false;
    tradeSession.botMessage = 'Привет! Выбери предметы или золото для обмена.';
    window.UI.openModal('trade');
  }

  function evaluateBotTrade() {
    const bot = window.Bots.byId(tradeSession.botId);
    if (!bot) return;
    let playerVal = tradeSession.playerGold;
    tradeSession.playerItems.forEach(uid => {
      const it = window.GameState.inventory.find(x => x.uid === uid);
      if (it) playerVal += getMarketPrice(it);
    });
    let botVal = tradeSession.botGold;
    tradeSession.botItems.forEach(it => {
      botVal += getMarketPrice(it);
    });

    const isMerchant = bot.role === 'merchant';
    // If player offers items and hasn't requested bot items, bot smartly offers gold!
    if (playerVal > 0 && botVal === 0) {
      tradeSession.botGold = Math.min(bot.gold, Math.round(playerVal * (isMerchant ? 0.96 : 0.88)));
      botVal = tradeSession.botGold;
    }

    if (playerVal === 0 && botVal === 0) {
      tradeSession.botLocked = false;
      tradeSession.botMessage = isMerchant
        ? 'Я купец — оцениваю всё по живому курсу Биржи! Выкладывай товар.'
        : 'Добавь предметы в обмен или выбери мои вещи справа.';
    } else if (playerVal >= botVal * (isMerchant ? 0.90 : 0.85)) {
      tradeSession.botLocked = true;
      tradeSession.botMessage = 'Отличная сделка по рынку! Я подтвердил обмен.';
    } else {
      tradeSession.botLocked = false;
      const diff = Math.round(botVal * (isMerchant ? 0.92 : 0.88) - playerVal);
      tradeSession.botMessage = 'Маловато по курсу! Докинь ещё примерно ' + diff + ' золота или предмет.';
    }
  }

  function executeTrade() {
    const bot = window.Bots.byId(tradeSession.botId);
    if (!bot) return false;
    evaluateBotTrade();
    if (!tradeSession.botLocked) {
      window.UI.toast(bot.name + ' ещё не согласен на эти условия!');
      return false;
    }
    if (window.GameState.player.gold < tradeSession.playerGold) {
      window.UI.toast('Не хватает золота!');
      return false;
    }

    // Transfer player -> bot
    window.GameState.player.gold -= tradeSession.playerGold;
    bot.gold += tradeSession.playerGold;
    tradeSession.playerItems.forEach(uid => {
      const idx = window.GameState.inventory.findIndex(x => x.uid === uid);
      if (idx !== -1) {
        const it = window.GameState.inventory.splice(idx, 1)[0];
        bot.inventory.push(it);
      }
    });

    // Transfer bot -> player
    window.GameState.player.gold += tradeSession.botGold;
    bot.gold = Math.max(0, bot.gold - tradeSession.botGold);
    tradeSession.botItems.forEach(bit => {
      const idx = bot.inventory.findIndex(x => x.uid === bit.uid);
      if (idx !== -1) {
        const it = bot.inventory.splice(idx, 1)[0];
        addItemToBag(it);
      }
    });

    window.GameState.stats.trades = (window.GameState.stats.trades || 0) + 1;
    onProgressEvent('trade', 1);
    addChat('trade', bot.name, 'Отличный обмен, ' + window.GameState.player.name + '! Обращайся ещё.');
    window.UI.toast('Обмен с ' + bot.name + ' успешно завершён!');
    tradeSession.active = false;
    window.UI.closeModal();
    return true;
  }

  // =========================================================================
  // CLANS / GUILDS, PARTY & DUELS
  // =========================================================================
  function getClanBonus(type) {
    const c = window.GameState.clan;
    if (!c) return 0;
    const lv = c.level || 1;
    if (type === 'atk') return lv * 0.04;
    if (type === 'xp') return lv * 0.05;
    if (type === 'gold') return lv * 0.05;
    return 0;
  }

  function createClan(name, tag) {
    const cleanName = (name || '').trim().slice(0, 18);
    const cleanTag = (tag || '').trim().toUpperCase().slice(0, 4);
    if (!cleanName || !cleanTag) { window.UI.toast('Введите название и тег клана!'); return false; }
    if (window.GameState.player.gold < 300) { window.UI.toast('Создание клана стоит 300 золота.'); return false; }
    window.GameState.player.gold -= 300;
    window.GameState.clan = {
      name: cleanName,
      tag: cleanTag,
      level: 1,
      treasury: 0,
      members: [
        { name: window.GameState.player.name, role: 'Лидер', lv: window.GameState.player.level },
        { name: 'Артур_Pro', role: 'Офицер', lv: 5 },
        { name: 'Лиса_Хил', role: 'Участник', lv: 7 }
      ]
    };
    window.GameState.player.clanTag = cleanTag;
    window.GameState.recalcStats();
    addChat('clan', 'Клан', 'Клан «' + cleanName + '» [' + cleanTag + '] основан!');
    window.UI.toast('Клан «' + cleanName + '» создан!');
    return true;
  }

  function donateClan(amount) {
    const c = window.GameState.clan;
    if (!c || window.GameState.player.gold < amount) { window.UI.toast('Не хватает золота!'); return false; }
    window.GameState.player.gold -= amount;
    c.treasury += amount;
    const nextNeed = c.level * 500;
    if (c.treasury >= nextNeed && c.level < 10) {
      c.treasury -= nextNeed;
      c.level += 1;
      window.GameState.recalcStats();
      addChat('clan', 'Клан', 'Клан повышен до ' + c.level + ' уровня! Баффы усилены!');
    }
    return true;
  }

  function inviteBotToParty(botId) {
    const bot = window.Bots.byId(botId);
    if (!bot) return;
    if (party.includes(botId)) { window.UI.toast(bot.name + ' уже в вашей группе.'); return; }
    if (party.length >= 3) { window.UI.toast('Максимум 3 союзника в группе!'); return; }
    bot.inParty = true;
    party.push(botId);
    addChat('party', bot.name, 'Я с тобой! Вперёд за добычей!');
    window.UI.toast(bot.name + ' присоединился к группе!');
  }

  function leaveParty() {
    party.forEach(id => {
      const b = window.Bots.byId(id);
      if (b) b.inParty = false;
    });
    party.length = 0;
    window.UI.toast('Вы покинули группу.');
  }

  function startDuelWithBot(botId) {
    const bot = window.Bots.byId(botId);
    if (!bot) return;
    if (window.GameState.activeDuelBotId) {
      window.UI.toast('Вы уже участвуете в дуэли!');
      return;
    }
    bot.inParty = false;
    const pIdx = party.indexOf(botId);
    if (pIdx !== -1) party.splice(pIdx, 1);

    // Bring bot close if far
    const p = window.GameState.player;
    if (Math.hypot(bot.x - p.x, bot.y - p.y) > 220) {
      bot.x = p.x + 120;
      bot.y = p.y;
    }

    // Long Tactical Duel: 2.4x HP boost for both fighters + full HP/MP + 2 bot duel potions
    p.duelBaseMaxHp = p.duelBaseMaxHp || p.maxHp;
    p.maxHp = Math.round(p.duelBaseMaxHp * 2.4);
    p.hp = p.maxHp;
    p.mp = p.maxMp;

    bot.duelBaseMaxHp = bot.duelBaseMaxHp || bot.maxHp;
    bot.maxHp = Math.round(bot.duelBaseMaxHp * 2.4);
    bot.hp = bot.maxHp;
    bot.mp = bot.maxMp;
    bot.duelPots = 2;
    bot.duelHealCd = 4.0;
    bot.inDuel = true;

    window.GameState.activeDuelBotId = botId;
    window.GameState.duelStartTime = performance.now();
    addChat('world', bot.name, 'Тактическая дуэль началась! У обоих x2.4 HP и стойкость PvP — покажи мастерство, ' + p.name + '!');
    window.UI.toast('ДУЭЛЬ ПРОТИВ ' + bot.name + ' НАЧАЛАСЬ (x2.4 HP)!');
  }

  // =========================================================================
  // PROMO CODES (Built-in One-Time Codes + Optional Telegram Bot Server Check)
  // =========================================================================
  const PROMO_CODES = {
    BLADEREALM: {
      desc: '450 золота + 4 Зелья HP + 2 Камня заточки',
      grant() {
        window.GameState.player.gold += 450;
        addItemToBag(window.GameData.createConsumableItem('hp_potion', 4));
        addItemToBag(window.GameData.createConsumableItem('upgrade_stone', 2));
      }
    },
    START2026: {
      desc: '350 золота + 3 Зелья HP + 3 Зелья MP + 250 XP',
      grant() {
        window.GameState.player.gold += 350;
        addItemToBag(window.GameData.createConsumableItem('hp_potion', 3));
        addItemToBag(window.GameData.createConsumableItem('mp_potion', 3));
        grantXp(250);
      }
    },
    GATHERER: {
      desc: 'Топор T2 + Кирка T2 + Серп T2 + 200 золота',
      grant() {
        window.GameState.player.gold += 200;
        addItemToBag(window.GameData.createToolItem('axe', 2));
        addItemToBag(window.GameData.createToolItem('pickaxe', 2));
        addItemToBag(window.GameData.createToolItem('sickle', 2));
      }
    },
    ENCHANT: {
      desc: '4 Руны чар T1 + 2 Свитка чар + 250 золота',
      grant() {
        window.GameState.player.gold += 250;
        addItemToBag(window.GameData.createConsumableItem('rune_t1', 4));
        addItemToBag(window.GameData.createConsumableItem('scroll_enchant', 2));
      }
    },
    PVPHERO: {
      desc: '5 Эликсиров жизни + 3 Эликсира маны + 300 золота',
      grant() {
        window.GameState.player.gold += 300;
        addItemToBag(window.GameData.createConsumableItem('hp_potion_lg', 5));
        addItemToBag(window.GameData.createConsumableItem('mp_potion_lg', 3));
      }
    },
    TELEGRAM: {
      desc: '500 золота + 2 Души реликвии T2 + 3 Зелья HP',
      grant() {
        window.GameState.player.gold += 500;
        addItemToBag(window.GameData.createConsumableItem('soul_t2', 2));
        addItemToBag(window.GameData.createConsumableItem('hp_potion', 3));
      }
    },
    REWORKEDADM: {
      desc: 'Админ Бот + Полная Админ-Панель + 10 000 монет!',
      grant() {
        window.GameState.player.gold += 10000;
        if (window.TelegramStars && window.TelegramStars.PACK_BY_ID && window.TelegramStars.PACK_BY_ID.admin_bot) {
          window.TelegramStars.PACK_BY_ID.admin_bot.grant();
        }
        window.GameState.recalcStats();
      }
    }
  };

  async function redeemPromoCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) {
      window.UI.toast('Введите промокод!');
      return { ok: false, msg: 'Введите промокод.' };
    }
    if (!Array.isArray(window.GameState.redeemedPromos)) {
      window.GameState.redeemedPromos = [];
    }
    if (window.GameState.redeemedPromos.includes(code)) {
      window.UI.toast('Промокод «' + code + '» уже активирован!');
      return { ok: false, msg: 'Этот промокод уже был использован.' };
    }

    const builtIn = PROMO_CODES[code];
    if (builtIn) {
      builtIn.grant();
      window.GameState.redeemedPromos.unshift(code);
      saveProgress();
      const p = window.GameState.player;
      if (window.Combat) {
        window.Combat.addParticles(p.x, p.y - 8, '#fbbf24', 18, 120);
        window.Combat.addText(p.x, p.y - 30, 'ПРОМОКОД АКТИВИРОВАН!', '#fbbf24', true);
      }
      addChat('system', 'Промокод', 'Код «' + code + '» активирован: ' + builtIn.desc);
      window.UI.toast('Промокод «' + code + '» активирован! ' + builtIn.desc);
      return { ok: true, msg: builtIn.desc };
    }

    // Optional server-side promo validation via your Telegram Bot backend
    const apiUrl = window.TelegramStars && window.TelegramStars.getApiUrl();
    if (apiUrl) {
      try {
        const tg = window.Telegram && window.Telegram.WebApp;
        const user = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
        const resp = await fetch(apiUrl + '/api/redeem-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            userId: user ? user.id : 0,
            initData: (tg && tg.initData) || ''
          })
        });
        const data = await resp.json().catch(() => null);
        if (resp.ok && data && data.ok) {
          if (data.gold) window.GameState.player.gold += Math.max(0, Math.round(Number(data.gold)));
          if (data.xp) grantXp(Math.max(0, Math.round(Number(data.xp))));
          if (Array.isArray(data.items)) {
            data.items.forEach(it => {
              if (it && it.id && window.GameData.CONSUMABLES[it.id]) {
                addItemToBag(window.GameData.createConsumableItem(it.id, it.qty || 1));
              }
            });
          }
          if (data.adminBot && window.TelegramStars && window.TelegramStars.PACK_BY_ID.admin_bot) {
            window.TelegramStars.PACK_BY_ID.admin_bot.grant();
          }
          window.GameState.redeemedPromos.unshift(code);
          saveProgress();
          const desc = data.desc || 'Награда сервера получена!';
          addChat('system', 'Промокод', 'Серверный код «' + code + '» активирован: ' + desc);
          window.UI.toast('Промокод активирован! ' + desc);
          return { ok: true, msg: desc };
        }
        const errText = (data && data.error) ? data.error : 'Промокод не найден или истёк.';
        window.UI.toast(errText);
        return { ok: false, msg: errText };
      } catch (_e) {
        window.UI.toast('Неверный промокод (или сервер бота не отвечает).');
        return { ok: false, msg: 'Неверный промокод.' };
      }
    }

    window.UI.toast('Неверный промокод «' + code + '».');
    return { ok: false, msg: 'Неверный промокод.' };
  }

  // Crafting
  function craftRecipe(recipeId) {
    const rec = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!rec) return false;
    if (window.GameState.player.gold < rec.gold) { window.UI.toast('Не хватает золота (' + rec.gold + ')!'); return false; }
    for (const [tid, need] of Object.entries(rec.req)) {
      if (countTemplateInBag(tid) < need) {
        window.UI.toast('Не хватает ресурсов: ' + (window.GameData.CONSUMABLES[tid]?.name || tid));
        return false;
      }
    }
    window.GameState.player.gold -= rec.gold;
    for (const [tid, need] of Object.entries(rec.req)) {
      consumeTemplateFromBag(tid, need);
    }
    const crafted = rec.make();
    addItemToBag(crafted);
    const prof = window.GameState.professions;
    prof[rec.prof] = (prof[rec.prof] || 1) + 1;
    window.GameState.stats.crafts = (window.GameState.stats.crafts || 0) + 1;
    window.UI.toast('Создано: ' + crafted.name + '!');
    return true;
  }

  // =========================================================================
  // SAVE / LOAD PROGRESS (Android SharedPreferences Bridge + localStorage)
  // =========================================================================
  const SAVE_KEY = 'bladerealm_mmorpg_save_v1';

  function saveProgress() {
    if (!window.GameState || !window.GameState.started) return;
    try {
      const payload = JSON.stringify({
        v: 1,
        player: window.GameState.player,
        inventory: window.GameState.inventory,
        storage: window.GameState.storage,
        unlockedMounts: window.GameState.unlockedMounts,
        quests: window.GameState.quests,
        claimedAchievements: window.GameState.claimedAchievements,
        stats: window.GameState.stats,
        professions: window.GameState.professions,
        mastery: window.GameState.mastery,
        clan: window.GameState.clan,
        bankBalance: window.GameState.bankBalance || 0,
        donateHistory: window.GameState.donateHistory || [],
        adminBot: window.GameState.adminBot || { owned: false, summoned: false, mode: 'combat', name: 'Админ-Страж' },
        redeemedPromos: window.GameState.redeemedPromos || [],
        settings: window.GameState.settings
      });
      if (window.AndroidBridge && window.AndroidBridge.saveGame) {
        window.AndroidBridge.saveGame(payload);
      }
      localStorage.setItem(SAVE_KEY, payload);
    } catch (_e) {
      // Ignore storage quota errors
    }
  }

  function loadRawSave() {
    try {
      let raw = '';
      if (window.AndroidBridge && window.AndroidBridge.loadGame) {
        raw = window.AndroidBridge.loadGame() || '';
      }
      if (!raw) raw = localStorage.getItem(SAVE_KEY) || '';
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function clearSavedProgress() {
    try {
      if (window.AndroidBridge && window.AndroidBridge.clearSave) window.AndroidBridge.clearSave();
      localStorage.removeItem(SAVE_KEY);
    } catch (_e) {}
  }

  return {
    NetworkAdapter,
    chatLog,
    auctionListings,
    party,
    economy,
    MARKET_GROUPS,
    EXCHANGE_COMMODITIES,
    QUEST_DEFS,
    ACHIEVEMENTS,
    CRAFT_RECIPES,
    tradeSession,
    addChat,
    addItemToBag,
    countTemplateInBag,
    consumeTemplateFromBag,
    equipItem,
    unequipSlot,
    getBestToolTier,
    enchantItemLevel,
    applyEnchantAffix,
    upgradeAttribute,
    grantWeaponMastery,
    grantGatherMastery,
    useConsumable,
    enhanceItem,
    splitStack,
    xpForLevel,
    grantXp,
    onMonsterKilled,
    onProgressEvent,
    claimQuest,
    getAchievementVal,
    claimAchievement,
    getItemMarketGroup,
    getCurrentBiomeBonus,
    getMarketPrice,
    getSellPrice,
    getDemandLabel,
    getExchangeQuote,
    exchangeBuy,
    exchangeSell,
    refreshContracts,
    completeContract,
    bankDeposit,
    bankWithdraw,
    bankHistory,
    updateEconomy,
    initAuctionHouse,
    buyAuctionListing,
    placeBidAuction,
    listPlayerItemOnAuction,
    updateAuction,
    startTradeWithBot,
    evaluateBotTrade,
    executeTrade,
    getClanBonus,
    createClan,
    donateClan,
    inviteBotToParty,
    leaveParty,
    startDuelWithBot,
    PROMO_CODES,
    redeemPromoCode,
    craftRecipe,
    saveProgress,
    loadRawSave,
    clearSavedProgress
  };
})();
