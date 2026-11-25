/* ==========================================================================
   BladeRealm — Main Engine Loop, GameState, Input, HUD, Minimap & Controls
   ========================================================================== */

(function () {
  const HUD_LAYOUT_KEY = 'bladerealm_hud_layout_v1';

  const STARTER_CLASSES = {
    warrior: {
      name: 'Рыцарь Клинка',
      desc: 'Сбалансированный боец с мечом и крепкой бронёй.',
      weapon: 'sword',
      armor: null,
      helmet: null,
      appearance: { hair: '#151829', cloak: '#c81d32', armor: '#1f2438', skin: '#f7d5b0', eye: '#ef4444' },
      attributes: { str: 8, vit: 8, int: 4, agi: 5, lck: 5 },
      skillBar: ['crimson_slash', 'whirlwind', 'aegis_shield', 'wsp_1', 'wsp_2']
    },
    mage: {
      name: 'Архимаг Бездны',
      desc: 'Повелитель стихий с дальнобойным посохом и мощной магией.',
      weapon: 'staff',
      armor: 'armor_mage',
      helmet: null,
      appearance: { hair: '#38bdf8', cloak: '#7c3aed', armor: '#3b1f54', skin: '#f7d5b0', eye: '#38bdf8' },
      attributes: { str: 4, vit: 5, int: 10, agi: 5, lck: 6 },
      skillBar: ['fire_meteor', 'frost_nova', 'chain_lightning', 'wsp_1', 'wsp_2']
    },
    assassin: {
      name: 'Тень Кинжала',
      desc: 'Молниеносные удары, высокий шанс крита и яды.',
      weapon: 'dagger',
      armor: null,
      helmet: null,
      appearance: { hair: '#151829', cloak: '#b91c1c', armor: '#271724', skin: '#f7d5b0', eye: '#ef4444' },
      attributes: { str: 6, vit: 5, int: 4, agi: 10, lck: 5 },
      skillBar: ['shadow_blink', 'poison_fan', 'shadow_dance', 'wsp_1', 'wsp_2']
    }
  };

  function createDefaultState() {
    return {
      started: false,
      player: {
        isPlayer: true,
        name: 'Герой',
        classId: 'warrior',
        level: 1,
        xp: 0,
        gold: 350,
        x: 3950,
        y: 3000,
        facingX: 1,
        state: 'idle',
        hp: 180,
        maxHp: 180,
        mp: 90,
        maxMp: 90,
        shield: 0,
        statPoints: 2,
        skillPoints: 2,
        pvpRating: 1000,
        karma: 0,
        attributes: { str: 8, vit: 8, int: 4, agi: 5, lck: 5 },
        appearance: { hair: '#151829', hairStyle: 'spiky', cloak: '#c81d32', armor: '#1f2438', skin: '#f7d5b0', eye: '#ef4444' },
        equipment: {
          helmet: null, armor: null, weapon: null, offhand: null,
          cloak: null, amulet: null, ring: null, boots: null, artifact: null
        },
        mountedId: null,
        selectedMountId: 'wolf',
        learnedSkills: {
          crimson_slash: 1, whirlwind: 1, aegis_shield: 1,
          fire_meteor: 1, frost_nova: 1, chain_lightning: 1,
          shadow_blink: 1, poison_fan: 1, shadow_dance: 1
        },
        skillBar: ['crimson_slash', 'whirlwind', 'aegis_shield', 'wsp_1', 'wsp_2'],
        skillCooldowns: {},
        attackCooldown: 0,
        attackTimer: 0,
        dashCooldown: 0,
        dashTimer: 0,
        dashVx: 0,
        dashVy: 0,
        buffSpeed: 0,
        buffPower: 0,
        buffShield: 0,
        duelBaseMaxHp: 0
      },
      inventory: [],
      storage: [],
      unlockedMounts: ['wolf'],
      quests: {},
      claimedAchievements: {},
      stats: {
        kills: 0, bosses: 0, gathered: 0, fishCaught: 0,
        crafts: 0, trades: 0, auctions: 0, duelsWon: 0, goldEarned: 0
      },
      professions: { mining: 1, herbalism: 1, woodcutting: 1, blacksmith: 1, alchemy: 1, fishing: 1 },
      mastery: {
        weapons: {},
        gather: {
          axe: { lv: 1, xp: 0 },
          pickaxe: { lv: 1, xp: 0 },
          sickle: { lv: 1, xp: 0 },
          fish: { lv: 1, xp: 0 }
        }
      },
      clan: null,
      bankBalance: 0,
      donateHistory: [],
      adminBot: {
        owned: false,
        summoned: false,
        mode: 'combat',
        name: 'Админ-Страж',
        powerMult: 4,
        godMode: false,
        oneHit: false,
        superSpeed: false
      },
      redeemedPromos: [],
      cosmetics: {
        owned: ['head_ninja', 'aura_arcane', 'title_novice'],
        equipped: { head: null, back: null, aura: 'aura_arcane', trail: null, title: 'title_novice' },
        hideHelmet: false
      },
      pets: { owned: {}, activeId: null },
      daily: { streak: 0, lastDate: '' },
      battlePass: { xp: 0, premium: false, claimedFree: {}, claimedPrem: {}, quests: {} },
      arenaTokens: 0,
      pvpEnabled: false,
      activeDuelBotId: null,
      duelStartTime: 0,
      autoCombat: false,
      settings: {
        uiScale: 1,
        autoLoot: true,
        lowFx: false,
        haptics: true,
        audioMuted: false,
        musicVol: 0.32,
        sfxVol: 0.55
      },
      computedStats: {
        atk: 24, def: 10, crit: 12, speed: 155,
        maxHp: 180, maxMp: 90, armorPen: 0, lifestealPct: 0,
        goldBonusPct: 0, magicMult: 1, power: 120
      },
      recalcStats: recalcStats
    };
  }

  window.GameState = createDefaultState();

  function recalcStats() {
    const gs = window.GameState;
    const p = gs.player;
    const attr = p.attributes || { str: 5, vit: 5, int: 5, agi: 5, lck: 5 };
    const lv = p.level || 1;
    const eq = p.equipment || {};
    const learned = p.learnedSkills || {};
    const clanBonus = window.MMO && window.MMO.getClanBonus ? window.MMO.getClanBonus() : { atk: 0, def: 0, goldPct: 0 };

    let atk = 12 + lv * 3.5 + (attr.str || 0) * 3;
    let def = 5 + lv * 1.4 + (attr.vit || 0) * 1.5;
    let maxHp = 120 + lv * 26 + (attr.vit || 0) * 18;
    let maxMp = 60 + lv * 10 + (attr.int || 0) * 10;
    let crit = 6 + (attr.agi || 0) * 1.2;
    let speed = 148 + (attr.agi || 0) * 1.5;
    let armorPen = (attr.str || 0) * 0.003;
    let lifestealPct = 0;
    let goldBonusPct = (attr.lck || 0) * 1.5 + (clanBonus.goldPct || 0);
    let magicMult = 1 + (attr.int || 0) * 0.012;

    let hpPctBonus = 0;
    let defPctBonus = 0;
    let atkPctBonus = 0;

    Object.values(eq).forEach(it => {
      if (!it) return;
      if (it.atk) atk += it.atk;
      if (it.def) def += it.def;
      if (it.hp) maxHp += it.hp;
      if (it.mp) maxMp += it.mp;
      if (it.crit) crit += it.crit;
      if (it.spd) speed += it.spd;
      const aff = it.enchantAffix || it.affix;
      if (aff === 'vampiric') lifestealPct += 0.07;
      if (aff === 'inferno') atkPctBonus += 0.12;
      if (aff === 'berserk') { atkPctBonus += 0.14; crit += 6; }
      if (aff === 'greed') goldBonusPct += 18;
      if (aff === 'titan') { hpPctBonus += 0.16; defPctBonus += 0.14; }
    });

    // Weapon Mastery bonus
    const wTypeKey = eq.weapon && (eq.weapon.weaponType || eq.weapon.weaponId);
    if (wTypeKey && gs.mastery && gs.mastery.weapons) {
      const mInfo = gs.mastery.weapons[wTypeKey];
      if (mInfo && mInfo.lv > 1) {
        atkPctBonus += (mInfo.lv - 1) * 0.035;
      }
    }

    // Passive skills
    atkPctBonus += (learned.p_blade_mastery || 0) * 0.08;
    defPctBonus += (learned.p_iron_skin || 0) * 0.09;
    armorPen += (learned.p_armor_pen || 0) * 0.06;
    maxMp += (learned.p_arcane_flow || 0) * 28;
    magicMult += (learned.p_elemental_wrath || 0) * 0.09;
    lifestealPct += (learned.p_spell_vamp || 0) * 0.04;
    crit += (learned.p_deadly_crit || 0) * 4;
    speed += (learned.p_wind_step || 0) * 10;
    goldBonusPct += (learned.p_treasure_hunter || 0) * 8;

    // Battle Pet passive bonuses
    if (window.Activities && window.Activities.getPetStatBonuses) {
      const pb = window.Activities.getPetStatBonuses();
      if (pb.atkPct) atkPctBonus += pb.atkPct;
      if (pb.defPct) defPctBonus += pb.defPct;
      if (pb.hpPct) hpPctBonus += pb.hpPct;
      if (pb.crit) crit += pb.crit;
      if (pb.speedPct) speed = Math.round(speed * (1 + pb.speedPct));
      if (pb.goldBonusPct) goldBonusPct += pb.goldBonusPct;
    }

    // Clan Fortress territory buffs
    if (window.Activities && window.Activities.getTerritoryBuffs) {
      const tb = window.Activities.getTerritoryBuffs();
      if (tb.atkPct) atkPctBonus += tb.atkPct;
      if (tb.defPct) defPctBonus += tb.defPct;
      if (tb.goldBonusPct) goldBonusPct += tb.goldBonusPct;
    }

    atk = Math.round((atk + (clanBonus.atk || 0)) * (1 + atkPctBonus));
    def = Math.round((def + (clanBonus.def || 0)) * (1 + defPctBonus));
    maxHp = Math.round(maxHp * (1 + hpPctBonus));
    if (p.buffPower > 0) atk = Math.round(atk * 1.25);

    // Duel HP scaling preservation
    if (gs.activeDuelBotId && p.duelBaseMaxHp) {
      maxHp = Math.max(maxHp, Math.round(p.duelBaseMaxHp * 2.4));
    }

    // Mount & speed buffs
    if (p.mountedId && window.GameData.MOUNT_BY_ID && window.GameData.MOUNT_BY_ID[p.mountedId]) {
      speed = Math.round(speed * (window.GameData.MOUNT_BY_ID[p.mountedId].speedMult || 1.45));
    }
    if (p.buffSpeed > 0) speed = Math.round(speed * 1.28);
    if (gs.adminBot && gs.adminBot.owned && gs.adminBot.superSpeed) {
      speed = Math.round(speed * 2.15);
    }

    crit = Math.min(80, Math.round(crit));
    const power = Math.round(atk * 4.5 + def * 3.2 + maxHp * 0.35 + crit * 5 + lv * 18);

    p.maxHp = Math.max(80, maxHp);
    p.maxMp = Math.max(40, Math.round(maxMp));
    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.mp > p.maxMp) p.mp = p.maxMp;

    gs.computedStats = {
      atk, def, crit, speed, maxHp: p.maxHp, maxMp: p.maxMp,
      armorPen, lifestealPct, goldBonusPct, magicMult, power
    };
  }

  // =========================================================================
  // GAME API (Called by modals.js, combat.js, telegram.js)
  // =========================================================================
  let hudEditMode = false;

  function vibrate(ms) {
    if (!window.GameState.settings || !window.GameState.settings.haptics) return;
    try {
      if (window.AndroidBridge && window.AndroidBridge.vibrate) {
        window.AndroidBridge.vibrate(ms || 15);
      } else if (navigator.vibrate) {
        navigator.vibrate(ms || 15);
      }
    } catch (_e) {}
  }

  function setUiScale(scale) {
    const s = Math.max(0.65, Math.min(1.30, Number(scale) || 0.9));
    window.GameState.settings.uiScale = s;
    document.documentElement.style.setProperty('--ui-scale', String(s));
    const label = document.getElementById('btnQuickScaleText');
    if (label) label.textContent = Math.round(s * 100) + '%';
  }

  function getWeaponSpellForSlot(slotKey) {
    const w = window.GameState.player.equipment.weapon;
    const wt = w && (w.weaponType || w.weaponId);
    if (!wt || !window.GameData.WEAPON_SPELLS) return null;
    const pair = window.GameData.WEAPON_SPELLS[wt];
    if (!pair) return null;
    return slotKey === 'wsp_1' ? pair[0] : (slotKey === 'wsp_2' ? pair[1] : null);
  }

  function rebuildSkillBar() {
    const box = document.getElementById('hudSkillSlots');
    if (!box) return;
    const bar = window.GameState.player.skillBar || ['crimson_slash', 'whirlwind', 'aegis_shield', 'wsp_1', 'wsp_2'];
    box.innerHTML = bar.map((sid, idx) => {
      let sk = null;
      let isWsp = false;
      if (sid === 'wsp_1' || sid === 'wsp_2') {
        sk = getWeaponSpellForSlot(sid);
        isWsp = true;
      } else if (sid) {
        sk = window.GameData.SKILL_BY_ID[sid];
      }
      const iconUrl = sk ? window.PixelIcons.skillIcon(sk.id, 32) : window.PixelIcons.get('skills', 32);
      const mp = sk ? sk.mp : '';
      const title = sk ? sk.name : 'Пустой слот';
      return `
        <button class="skill-slot-btn ${isWsp ? 'weapon-slot' : ''}" data-skill-idx="${idx}" title="${title}">
          <img class="px-ico" style="width:30px;height:30px;" src="${iconUrl}" alt="" />
          ${mp ? `<span class="skill-slot-mp">${mp}</span>` : ''}
          <span class="skill-slot-key">${idx + 1}</span>
          <div class="cd-overlay hidden" id="skillCd_${idx}"></div>
        </button>`;
    }).join('');

    box.querySelectorAll('[data-skill-idx]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.skillIdx);
        triggerSkillSlot(idx);
      };
    });
  }

  function triggerSkillSlot(idx) {
    const bar = window.GameState.player.skillBar || [];
    const sid = bar[idx];
    if (!sid) return;
    let resolvedId = sid;
    if (sid === 'wsp_1' || sid === 'wsp_2') {
      const wsp = getWeaponSpellForSlot(sid);
      if (!wsp) {
        window.UI.toast('Экипируйте оружие для его умений!');
        return;
      }
      resolvedId = wsp.id;
    }
    const target = findPreferredTarget();
    window.Combat.castSkill(window.GameState.player, resolvedId, target, window.GameState.computedStats);
  }

  function applyHudPreset(preset) {
    resetHudLayout();
    const hud = document.getElementById('hudLayer');
    if (hud) hud.classList.toggle('hud-lefty', preset === 'lefty');
    if (preset === 'arcade') {
      setUiScale(1.05);
      window.UI.toast('Применён пресет HUD: Аркада');
    } else if (preset === 'lefty') {
      setUiScale(0.9);
      window.UI.toast('Применён пресет HUD: Левша');
    } else {
      setUiScale(window.innerWidth < 860 ? 0.85 : 0.95);
      window.UI.toast('Применён пресет HUD: Стандарт');
    }
  }

  function resetHudLayout() {
    localStorage.removeItem(HUD_LAYOUT_KEY);
    const hud = document.getElementById('hudLayer');
    if (hud) hud.classList.remove('hud-lefty');
    document.querySelectorAll('[data-hud-drag]').forEach(el => {
      el.style.left = '';
      el.style.top = '';
      el.style.right = '';
      el.style.bottom = '';
    });
  }

  function loadHudLayout() {
    try {
      const raw = localStorage.getItem(HUD_LAYOUT_KEY);
      if (!raw) return;
      const pos = JSON.parse(raw);
      document.querySelectorAll('[data-hud-drag]').forEach(el => {
        const k = el.dataset.hudDrag;
        if (pos[k]) {
          el.style.left = pos[k].left + 'px';
          el.style.top = pos[k].top + 'px';
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        }
      });
    } catch (_e) {}
  }

  function saveHudLayout() {
    const pos = {};
    document.querySelectorAll('[data-hud-drag]').forEach(el => {
      if (el.style.left && el.style.top) {
        pos[el.dataset.hudDrag] = {
          left: parseFloat(el.style.left),
          top: parseFloat(el.style.top)
        };
      }
    });
    try { localStorage.setItem(HUD_LAYOUT_KEY, JSON.stringify(pos)); } catch (_e) {}
  }

  function enterHudEditMode() {
    if (window.UI) window.UI.closeModal();
    hudEditMode = true;
    document.getElementById('hudLayer').classList.add('hud-edit-active');
    document.getElementById('hudEditOverlay').classList.remove('hidden');
  }

  function exitHudEditMode() {
    hudEditMode = false;
    document.getElementById('hudLayer').classList.remove('hud-edit-active');
    document.getElementById('hudEditOverlay').classList.add('hidden');
    saveHudLayout();
    window.UI.toast('Расположение HUD сохранено!');
  }

  function applyCloudSave(saveData) {
    if (!saveData || !saveData.player) return false;
    restoreFromSave(saveData);
    window.GameState.started = true;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('hudLayer').classList.remove('hidden');
    rebuildSkillBar();
    window.MMO.saveProgress();
    if (window.UI) window.UI.renderCurrentModal();
    return true;
  }

  window.GameAPI = {
    vibrate,
    rebuildSkillBar,
    setUiScale,
    enterHudEditMode,
    applyHudPreset,
    resetHudLayout,
    applyCloudSave
  };

  // =========================================================================
  // NEW HERO / LOAD SAVE INITIALIZATION
  // =========================================================================
  let selectedClass = 'warrior';
  let selectedAppearance = {
    skin: '#f7d5b0',
    hair: '#151829',
    hairStyle: 'spiky',
    cloak: '#c81d32',
    armor: '#1f2438',
    eye: '#ef4444'
  };

  function buildNewHero(name, classId) {
    const cls = STARTER_CLASSES[classId] || STARTER_CLASSES.warrior;
    window.GameState = createDefaultState();
    const gs = window.GameState;
    const p = gs.player;
    p.name = (String(name || '').trim() || 'Герой').slice(0, 16);
    p.classId = classId;
    p.attributes = Object.assign({}, cls.attributes);
    p.appearance = Object.assign({}, cls.appearance, selectedAppearance);
    p.skillBar = cls.skillBar.slice();

    // Equip starter gear (keep classic hero hair & dark-crimson look visible)
    p.isPlayer = true;
    p.equipment.weapon = window.GameData.createWeaponItem(cls.weapon, 'common', 1, 0, 1);
    if (cls.armor) p.equipment.armor = window.GameData.createArmorItem(cls.armor, 'common', 1, 0, 1);
    if (cls.helmet) p.equipment.helmet = window.GameData.createArmorItem(cls.helmet, 'common', 1, 0, 1);

    // Starter bag: gathering tools T1 + potions
    window.MMO.addItemToBag(window.GameData.createToolItem('axe', 1, 'common'));
    window.MMO.addItemToBag(window.GameData.createToolItem('pickaxe', 1, 'common'));
    window.MMO.addItemToBag(window.GameData.createToolItem('sickle', 1, 'common'));
    window.MMO.addItemToBag(window.GameData.createConsumableItem('hp_potion', 5));
    window.MMO.addItemToBag(window.GameData.createConsumableItem('mp_potion', 4));

    // Init quests
    window.MMO.QUEST_DEFS.forEach(q => {
      gs.quests[q.id] = { prog: 0, claimed: false };
    });

    gs.recalcStats();
    p.hp = p.maxHp;
    p.mp = p.maxMp;
  }

  function restoreFromSave(data) {
    window.GameState = createDefaultState();
    const gs = window.GameState;
    if (data.player) Object.assign(gs.player, data.player);
    gs.player.isPlayer = true;
    if (!gs.player.attributes) gs.player.attributes = { str: 6, vit: 6, int: 5, agi: 5, lck: 5 };
    if (!gs.player.appearance) gs.player.appearance = { hair: '#151829', hairStyle: 'spiky', cloak: '#c81d32', armor: '#24293d', skin: '#f7d5b0', eye: '#ef4444' };
    if (!gs.player.appearance.skin) gs.player.appearance.skin = '#f7d5b0';
    if (!gs.player.appearance.hairStyle) gs.player.appearance.hairStyle = 'spiky';
    if (typeof gs.player.karma !== 'number') gs.player.karma = 0;
    if (!gs.player.equipment) gs.player.equipment = {};
    if (!gs.player.skillCooldowns) gs.player.skillCooldowns = {};
    if (!Array.isArray(gs.player.skillBar) || gs.player.skillBar.length < 5) {
      gs.player.skillBar = ['crimson_slash', 'whirlwind', 'aegis_shield', 'wsp_1', 'wsp_2'];
    }
    if (Array.isArray(data.inventory)) gs.inventory = data.inventory;
    if (Array.isArray(data.storage)) gs.storage = data.storage;
    if (Array.isArray(data.unlockedMounts) && data.unlockedMounts.length) gs.unlockedMounts = data.unlockedMounts;
    if (data.quests) gs.quests = data.quests;
    window.MMO.QUEST_DEFS.forEach(q => {
      if (!gs.quests[q.id]) gs.quests[q.id] = { prog: 0, claimed: false };
      else if (typeof gs.quests[q.id].prog !== 'number') gs.quests[q.id].prog = gs.quests[q.id].progress || 0;
    });
    if (data.claimedAchievements) gs.claimedAchievements = data.claimedAchievements;
    if (data.stats) Object.assign(gs.stats, data.stats);
    if (data.professions) Object.assign(gs.professions, data.professions);
    if (data.mastery) gs.mastery = data.mastery;
    if (data.clan) gs.clan = data.clan;
    gs.bankBalance = Number(data.bankBalance) || 0;
    gs.donateHistory = Array.isArray(data.donateHistory) ? data.donateHistory : [];
    if (data.adminBot) Object.assign(gs.adminBot, data.adminBot);
    gs.redeemedPromos = Array.isArray(data.redeemedPromos) ? data.redeemedPromos : [];
    if (data.cosmetics) gs.cosmetics = data.cosmetics;
    if (data.pets) gs.pets = data.pets;
    if (data.daily) gs.daily = data.daily;
    if (data.battlePass) gs.battlePass = data.battlePass;
    gs.arenaTokens = Number(data.arenaTokens) || 0;
    if (data.settings) Object.assign(gs.settings, data.settings);

    gs.player.state = 'idle';
    gs.recalcStats();
    if (gs.player.hp <= 0) gs.player.hp = gs.player.maxHp;
    setUiScale(gs.settings.uiScale || 1);
    if (window.GameAudio) {
      if (typeof gs.settings.audioMuted === 'boolean') window.GameAudio.setMuted(gs.settings.audioMuted);
      if (typeof gs.settings.musicVol === 'number') window.GameAudio.setMusicVol(gs.settings.musicVol);
      if (typeof gs.settings.sfxVol === 'number') window.GameAudio.setSfxVol(gs.settings.sfxVol);
    }
  }

  function enterWorld() {
    window.GameState.started = true;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('hudLayer').classList.remove('hidden');
    rebuildSkillBar();
    const defScale = window.innerWidth < 860 ? 0.82 : 0.95;
    setUiScale(window.GameState.settings.uiScale || defScale);
    loadHudLayout();
    if (window.GameAudio) window.GameAudio.unlock();
    if (window.TelegramStars) window.TelegramStars.syncAdminBotEntity(true);
    window.MMO.addChat('system', 'Мир', 'Добро пожаловать в BladeRealm! Косметика, Питомцы, Рейды, Арена и 7-Дней Награды доступны в Меню.');
    window.MMO.saveProgress();
  }

  // =========================================================================
  // TARGETING, GATHERING & FISHING
  // =========================================================================
  let currentTarget = null;
  let fishingState = null;

  function findPreferredTarget() {
    const p = window.GameState.player;
    // Active Ranked Arena enemies priority
    if (window.Activities && window.Activities.isInArena && window.Activities.isInArena()) {
      const aHost = window.Activities.getInstanceHostiles();
      if (aHost.length > 0) {
        aHost.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
        return aHost[0];
      }
    }
    // Active duel bot priority
    if (window.GameState.activeDuelBotId) {
      const db = window.Bots.byId(window.GameState.activeDuelBotId);
      if (db && db.hp > 0) return db;
    }
    if (currentTarget && !currentTarget.dead && currentTarget.hp > 0) {
      if (Math.hypot(currentTarget.x - p.x, currentTarget.y - p.y) < 420) return currentTarget;
    }
    // Nearby Bounty Outlaw
    if (window.Progression && window.Progression.OUTLAWS) {
      for (const o of window.Progression.OUTLAWS) {
        if (!o.dead && o.hp > 0 && Math.hypot(o.x - p.x, o.y - p.y) < 320) return o;
      }
    }
    // Check hostile PvP remote players if PvP enabled & outside safe zone
    if (window.GameState.pvpEnabled && !window.World.getBiomeAt(p.x, p.y).safe && window.Multiplayer) {
      const rps = window.Multiplayer.getRemotePlayers();
      let bestRp = null, bestD = 320;
      for (const rp of rps) {
        if ((!rp.pvp && !rp.pvpEnabled) || rp.hp <= 0 || window.Multiplayer.isInMyParty(rp.id)) continue;
        if (window.World.getBiomeAt(rp.x, rp.y).safe) continue;
        const d = Math.hypot(rp.x - p.x, rp.y - p.y);
        if (d < bestD) { bestD = d; bestRp = rp; }
      }
      if (bestRp) return bestRp;
    }
    // Nearest monster
    let best = null, bestDist = 340;
    for (const m of window.Combat.monsters) {
      if (m.dead) continue;
      const d = Math.hypot(m.x - p.x, m.y - p.y);
      if (d < bestDist) { bestDist = d; best = m; }
    }
    currentTarget = best;
    return best;
  }

  function interactNearby() {
    const p = window.GameState.player;
    // 1. Check nearby NPC
    for (const npc of window.World.NPCS) {
      if (Math.hypot(npc.x - p.x, npc.y - p.y) < 92) {
        window.UI.openModal(npc.action || npc.modal || 'shop');
        return true;
      }
    }
    // 2. Check nearby Fishing Spot
    for (const fs of window.World.FISHING_SPOTS) {
      if (Math.hypot(fs.x - p.x, fs.y - p.y) < (fs.r || 95) + 25) {
        startFishing(fs);
        return true;
      }
    }
    // 3. Check nearby Resource Node
    for (const node of window.World.resourceNodes) {
      if (node.respawn > 0) continue;
      if (Math.hypot(node.x - p.x, node.y - p.y) < 88) {
        gatherNode(node);
        return true;
      }
    }
    // 4. Loot nearby
    if (window.Combat.lootNearby(125) > 0) return true;
    window.UI.toast('Рядом нет NPC, ресурсов или лута.');
    return false;
  }

  function gatherNode(node) {
    const reqTool = node.toolType || 'pickaxe';
    const reqTier = node.tier || 1;
    const myTier = window.MMO.getBestToolTier(reqTool);
    if (myTier < reqTier) {
      const tName = (window.GameData.TOOL_TYPES[reqTool] && window.GameData.TOOL_TYPES[reqTool].name) || reqTool;
      window.UI.toast('Нужен инструмент: ' + tName + ' T' + reqTier + '+ (у вас T' + myTier + ')!');
      return;
    }
    node.respawn = 18 + reqTier * 4;
    const qty = 1 + (Math.random() < 0.35 ? 1 : 0);
    window.MMO.addItemToBag(window.GameData.createConsumableItem(node.itemId, qty));
    window.MMO.grantGatherMastery(reqTool, 14 + reqTier * 6);
    window.GameState.stats.gathered = (window.GameState.stats.gathered || 0) + 1;
    window.MMO.onProgressEvent('gather', 1);
    window.MMO.grantXp(10 + reqTier * 8);
    window.Combat.addParticles(node.x, node.y, node.color || '#fbbf24', 12, 95);
    const label = (window.GameData.CONSUMABLES[node.itemId] && window.GameData.CONSUMABLES[node.itemId].name) || node.name;
    window.Combat.addText(node.x, node.y - 16, '+' + qty + ' ' + label, '#4ade80', false);
    vibrate(18);
  }

  function startFishing(spot) {
    const zoneStart = 28 + Math.random() * 44;
    fishingState = {
      spot,
      cursor: 0,
      dir: 1,
      speed: 96,
      zoneStart,
      zoneWidth: 22
    };
    const zEl = document.getElementById('fishingZone');
    zEl.style.left = zoneStart + '%';
    zEl.style.width = fishingState.zoneWidth + '%';
    document.getElementById('fishingOverlay').classList.remove('hidden');
  }

  function catchFish() {
    if (!fishingState) return;
    const ok = fishingState.cursor >= fishingState.zoneStart &&
      fishingState.cursor <= (fishingState.zoneStart + fishingState.zoneWidth);
    const spot = fishingState.spot;
    fishingState = null;
    document.getElementById('fishingOverlay').classList.add('hidden');
    if (ok) {
      const fishId = Math.random() < 0.28 ? 'fish_golden' : 'fish_common';
      window.MMO.addItemToBag(window.GameData.createConsumableItem(fishId, 1));
      window.MMO.grantGatherMastery('fish', 22);
      window.GameState.stats.fishCaught = (window.GameState.stats.fishCaught || 0) + 1;
      window.MMO.onProgressEvent('fish', 1);
      window.MMO.grantXp(25 + (spot.tier || 1) * 10);
      window.UI.toast('Улов! Поймана рыба: ' + (window.GameData.CONSUMABLES[fishId]?.name || fishId));
      vibrate(25);
    } else {
      window.UI.toast('Рыба сорвалась! Попробуйте ещё раз.');
    }
  }

  // =========================================================================
  // INPUT: VIRTUAL JOYSTICK, KEYBOARD & CANVAS TAP
  // =========================================================================
  const keys = {};
  const joy = { active: false, id: null, dx: 0, dy: 0 };
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const cam = { x: 0, y: 0, w: 800, h: 480 };

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(320, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(200, Math.floor(window.innerHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    cam.w = window.innerWidth;
    cam.h = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener('keydown', e => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    keys[e.code] = true;
    if (!window.GameState.started) return;
    if (e.code === 'Space') { e.preventDefault(); doPrimaryAttack(); }
    if (e.code === 'Digit1') triggerSkillSlot(0);
    if (e.code === 'Digit2') triggerSkillSlot(1);
    if (e.code === 'Digit3') triggerSkillSlot(2);
    if (e.code === 'Digit4') triggerSkillSlot(3);
    if (e.code === 'Digit5') triggerSkillSlot(4);
    if (e.code === 'KeyE') interactNearby();
    if (e.code === 'KeyF') window.Combat.lootNearby(140);
    if (e.code === 'KeyM') toggleMount();
    if (e.code === 'ShiftLeft') doDash();
    if (e.code === 'Escape' && window.UI) window.UI.handleBack();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  function initJoystick() {
    const zone = document.getElementById('joystickZone');
    const knob = document.getElementById('joystickKnob');
    const maxR = 34;

    function updateFromClient(cx, cy) {
      const r = zone.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;
      let dx = cx - ox;
      let dy = cy - oy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      joy.dx = dx / maxR;
      joy.dy = dy / maxR;
    }

    function reset() {
      joy.active = false;
      joy.id = null;
      joy.dx = 0;
      joy.dy = 0;
      knob.style.transform = 'translate(0px, 0px)';
    }

    zone.addEventListener('pointerdown', e => {
      if (hudEditMode) return;
      e.preventDefault();
      zone.setPointerCapture(e.pointerId);
      joy.active = true;
      joy.id = e.pointerId;
      updateFromClient(e.clientX, e.clientY);
    });
    zone.addEventListener('pointermove', e => {
      if (!joy.active || e.pointerId !== joy.id) return;
      updateFromClient(e.clientX, e.clientY);
    });
    zone.addEventListener('pointerup', e => { if (e.pointerId === joy.id) reset(); });
    zone.addEventListener('pointercancel', reset);
  }

  function initHudDragEditor() {
    let dragging = null;
    let offX = 0, offY = 0;

    document.querySelectorAll('[data-hud-drag]').forEach(el => {
      el.addEventListener('pointerdown', e => {
        if (!hudEditMode) return;
        e.preventDefault();
        e.stopPropagation();
        dragging = el;
        const r = el.getBoundingClientRect();
        offX = e.clientX - r.left;
        offY = e.clientY - r.top;
      });
    });

    window.addEventListener('pointermove', e => {
      if (!dragging || !hudEditMode) return;
      dragging.style.left = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offX)) + 'px';
      dragging.style.top = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - offY)) + 'px';
      dragging.style.right = 'auto';
      dragging.style.bottom = 'auto';
    });

    window.addEventListener('pointerup', () => { dragging = null; });
  }

  function onCanvasTap(clientX, clientY) {
    if (!window.GameState.started || hudEditMode) return;
    if (window.UI && window.UI.isAnyModalOpen()) return;
    const wx = clientX + cam.x;
    const wy = clientY + cam.y;

    // 0. Instance mode (Dungeon / Arena) -> tap enemies directly
    if (window.Activities && window.Activities.isInInstance()) {
      const hostiles = window.Activities.getInstanceHostiles();
      for (const h of hostiles) {
        if (h.dead || h.hp <= 0) continue;
        if (Math.hypot(h.x - wx, h.y - wy) < 46) {
          currentTarget = h;
          doPrimaryAttack();
          return;
        }
      }
      return;
    }

    // 1. Admin Bot tap
    const ab = window.GameState.adminBot;
    if (ab && ab.owned && ab.summoned && window.TelegramStars && window.TelegramStars.adminEntity) {
      const ae = window.TelegramStars.adminEntity;
      if (Math.hypot(ae.x - wx, ae.y - wy) < 38) {
        window.UI.openModal('adminPanel');
        return;
      }
    }

    // 2. Real Online Player tap -> Trade / Party / TP / PvP actions
    if (window.Multiplayer) {
      const rps = window.Multiplayer.getRemotePlayers();
      for (const rp of rps) {
        if (Math.hypot(rp.x - wx, rp.y - wy) < 38) {
          window.UI.openRemotePlayerActions(rp.id);
          return;
        }
      }
    }

    // 3. Smart Bot tap -> Trade / Party / Duel
    for (const b of window.Bots.list) {
      if (Math.hypot(b.x - wx, b.y - wy) < 34) {
        window.UI.openBotActions(b.id);
        return;
      }
    }

    // 4. NPC tap
    for (const npc of window.World.NPCS) {
      if (Math.hypot(npc.x - wx, npc.y - wy) < 42) {
        window.UI.openModal(npc.action || npc.modal || 'shop');
        return;
      }
    }

    // 4.5 PK Outlaw tap -> set target and attack
    if (window.Progression && window.Progression.OUTLAWS) {
      for (const o of window.Progression.OUTLAWS) {
        if (o.dead) continue;
        if (Math.hypot(o.x - wx, o.y - wy) < 42) {
          currentTarget = o;
          doPrimaryAttack();
          return;
        }
      }
    }

    // 5. Monster tap -> set target and attack
    for (const m of window.Combat.monsters) {
      if (m.dead) continue;
      if (Math.hypot(m.x - wx, m.y - wy) < 42) {
        currentTarget = m;
        doPrimaryAttack();
        return;
      }
    }

    // 6. Resource node or fishing spot tap
    for (const node of window.World.resourceNodes) {
      if (node.respawn > 0) continue;
      if (Math.hypot(node.x - wx, node.y - wy) < 40) {
        if (Math.hypot(node.x - window.GameState.player.x, node.y - window.GameState.player.y) < 110) {
          gatherNode(node);
        } else {
          window.UI.toast('Подойдите ближе к ресурсу: ' + node.name);
        }
        return;
      }
    }
    for (const fs of window.World.FISHING_SPOTS) {
      if (Math.hypot(fs.x - wx, fs.y - wy) < (fs.r || 80)) {
        if (Math.hypot(fs.x - window.GameState.player.x, fs.y - window.GameState.player.y) < (fs.r || 95) + 35) {
          startFishing(fs);
        } else {
          window.UI.toast('Подойдите ближе к воде для рыбалки.');
        }
        return;
      }
    }
  }

  canvas.addEventListener('pointerdown', e => {
    onCanvasTap(e.clientX, e.clientY);
  });

  // =========================================================================
  // COMBAT ACTIONS
  // =========================================================================
  function doPrimaryAttack() {
    const p = window.GameState.player;
    if (p.state === 'death' || p.attackCooldown > 0) return;
    p.mountedId = null;
    const t = findPreferredTarget();
    if (t) {
      window.Combat.performBasicAttack(p, t, window.GameState.computedStats);
    } else {
      // Swing in facing direction
      p.attackTimer = 0.22;
      p.attackCooldown = 0.45;
      p.state = 'attack';
    }
  }

  function doDash() {
    const p = window.GameState.player;
    if (p.state === 'death' || p.dashCooldown > 0) return;
    let dx = joy.dx, dy = joy.dy;
    if (Math.hypot(dx, dy) < 0.1) { dx = p.facingX || 1; dy = 0; }
    const len = Math.hypot(dx, dy) || 1;
    p.dashVx = (dx / len) * 520;
    p.dashVy = (dy / len) * 520;
    p.dashTimer = 0.18;
    p.dashCooldown = 3.2;
    window.Combat.addParticles(p.x, p.y, '#38bdf8', 10, 100);
    vibrate(14);
  }

  function toggleMount() {
    const p = window.GameState.player;
    if (p.state === 'death') return;
    if (p.mountedId) {
      p.mountedId = null;
    } else {
      const mId = p.selectedMountId || (window.GameState.unlockedMounts && window.GameState.unlockedMounts[0]) || 'wolf';
      p.mountedId = mId;
      window.Combat.addParticles(p.x, p.y, '#fbbf24', 10, 80);
    }
    window.GameState.recalcStats();
  }

  function quickDrink(tplId) {
    const found = window.GameState.inventory.find(it => it && it.templateId === tplId);
    if (!found) {
      window.UI.toast('Нет зелий! Купите в Магазине или скрафтите.');
      return;
    }
    window.MMO.useConsumable(found.uid);
  }

  // =========================================================================
  // BIND STATIC DOM CONTROLS
  // =========================================================================
  function renderStartAppearancePickers() {
    const CD = window.CosmeticsData;
    if (!CD) return;
    const fillSwatches = (elId, list, key) => {
      const box = document.getElementById(elId);
      if (!box) return;
      box.innerHTML = list.map(c =>
        `<div class="start-swatch ${selectedAppearance[key] === c.hex ? 'active' : ''}" data-sw-val="${c.hex}" title="${c.name}" style="background:${c.hex};"></div>`
      ).join('');
      box.querySelectorAll('.start-swatch').forEach(sw => {
        sw.onclick = () => {
          selectedAppearance[key] = sw.dataset.swVal;
          renderStartAppearancePickers();
        };
      });
    };
    fillSwatches('startSkinSwatches', CD.SKIN_COLORS, 'skin');
    fillSwatches('startHairSwatches', CD.HAIR_COLORS, 'hair');
    fillSwatches('startCloakSwatches', CD.CLOAK_COLORS, 'cloak');

    const stBox = document.getElementById('startHairStyleRow');
    if (stBox) {
      stBox.innerHTML = CD.HAIR_STYLES.map(s =>
        `<button class="start-style-btn ${selectedAppearance.hairStyle === s.id ? 'active' : ''}" data-hs="${s.id}">${s.name}</button>`
      ).join('');
      stBox.querySelectorAll('.start-style-btn').forEach(b => {
        b.onclick = () => {
          selectedAppearance.hairStyle = b.dataset.hs;
          renderStartAppearancePickers();
        };
      });
    }
  }

  function bindStaticDom() {
    // Class picker & appearance customizer on start screen
    renderStartAppearancePickers();
    document.querySelectorAll('#classPicker .class-opt').forEach(btn => {
      btn.onclick = () => {
        selectedClass = btn.dataset.cls;
        document.querySelectorAll('#classPicker .class-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const info = STARTER_CLASSES[selectedClass];
        document.getElementById('startClassTitle').textContent = info.name;
        document.getElementById('startClassDesc').textContent = info.desc;
        selectedAppearance.armor = info.appearance.armor;
        selectedAppearance.eye = info.appearance.eye;
      };
    });

    const saved = window.MMO.loadRawSave();
    const btnCont = document.getElementById('btnContinueSave');
    if (saved && saved.player && saved.player.name) {
      btnCont.classList.remove('hidden');
      btnCont.textContent = 'Продолжить: ' + saved.player.name + ' (Ур.' + (saved.player.level || 1) + ')';
      btnCont.onclick = () => {
        restoreFromSave(saved);
        enterWorld();
      };
    }

    document.getElementById('btnEnterWorld').onclick = () => {
      const nameVal = document.getElementById('heroNameInput').value;
      buildNewHero(nameVal, selectedClass);
      enterWorld();
    };

    // Top Nav buttons
    document.querySelectorAll('.top-nav-bar [data-modal]').forEach(btn => {
      btn.onclick = () => window.UI.openModal(btn.dataset.modal);
    });
    document.getElementById('hudPlayerCard').onclick = e => {
      if (hudEditMode) return;
      if (e.target.id === 'hudShopPlus') return;
      window.UI.openModal('character');
    };
    document.getElementById('hudShopPlus').onclick = e => {
      e.stopPropagation();
      window.UI.openModal('donate');
    };
    document.getElementById('minimapCanvas').onclick = () => {
      if (!hudEditMode) window.UI.openModal('map');
    };

    // Quick toggles
    document.getElementById('btnAdminPanel').onclick = () => window.UI.openModal('adminPanel');
    document.getElementById('btnTogglePvp').onclick = () => {
      window.GameState.pvpEnabled = !window.GameState.pvpEnabled;
      window.UI.toast(window.GameState.pvpEnabled ? 'Режим PvP ВКЛЮЧЁН! Вне города вас могут атаковать.' : 'Режим PvP ВЫКЛЮЧЕН (Мирный).');
    };
    const scaleSteps = [0.75, 0.85, 1.0, 1.15];
    document.getElementById('btnQuickScale').onclick = () => {
      const cur = window.GameState.settings.uiScale || 1;
      const next = scaleSteps.find(s => s > cur + 0.02) || scaleSteps[0];
      setUiScale(next);
    };
    const audioBtn = document.getElementById('btnToggleAudio');
    if (audioBtn) {
      audioBtn.onclick = () => {
        if (window.GameAudio) window.GameAudio.toggleMute();
      };
    }
    const instExitBtn = document.getElementById('btnInstanceExit');
    if (instExitBtn) {
      instExitBtn.onclick = () => {
        const b = window.Activities && window.Activities.getActiveInstanceBanner();
        if (b && b.onExit) b.onExit();
      };
    }

    // Quest tracker collapse
    document.getElementById('toggleQuestTracker').onclick = () => {
      const body = document.getElementById('questTrackerBody');
      const chev = document.getElementById('questChevron');
      body.classList.toggle('hidden');
      chev.textContent = body.classList.contains('hidden') ? '>' : 'v';
    };

    // Party leave
    document.getElementById('btnLeaveParty').onclick = () => {
      if (window.Multiplayer && window.Multiplayer.realParty.members.length > 0) {
        window.Multiplayer.leaveRealParty();
      }
      if (window.MMO.party.length > 0) {
        window.MMO.leaveParty();
      }
    };

    // Network Invite Accept / Decline
    document.getElementById('btnNetInviteAccept').onclick = () => {
      if (!window.Multiplayer) return;
      if (window.Multiplayer.getPendingTradeInvite && window.Multiplayer.getPendingTradeInvite()) {
        window.Multiplayer.acceptTradeRequest();
      } else if (window.Multiplayer.getPendingPartyInvite && window.Multiplayer.getPendingPartyInvite()) {
        window.Multiplayer.acceptPartyInvite();
      }
    };
    document.getElementById('btnNetInviteDecline').onclick = () => {
      if (!window.Multiplayer) return;
      if (window.Multiplayer.getPendingTradeInvite && window.Multiplayer.getPendingTradeInvite()) {
        window.Multiplayer.declineTradeRequest();
      } else if (window.Multiplayer.getPendingPartyInvite && window.Multiplayer.getPendingPartyInvite()) {
        window.Multiplayer.declinePartyInvite();
      }
    };

    // Chat controls
    document.querySelectorAll('.chat-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (window.UI && window.UI.setChatChannel) window.UI.setChatChannel(tab.dataset.ch);
      };
    });
    document.getElementById('btnToggleChat').onclick = () => {
      const box = document.getElementById('chatBox');
      box.classList.toggle('collapsed');
      document.getElementById('btnToggleChat').textContent = box.classList.contains('collapsed') ? '+' : '_';
    };
    const sendChat = () => {
      const inp = document.getElementById('chatInput');
      const txt = inp.value.trim();
      if (!txt) return;
      inp.value = '';
      const activeTab = document.querySelector('.chat-tab.active');
      const ch = (activeTab && activeTab.dataset.ch && activeTab.dataset.ch !== 'all') ? activeTab.dataset.ch : 'world';
      window.MMO.addChat(ch, window.GameState.player.name, txt);
      if (window.Multiplayer) window.Multiplayer.sendChat(ch, txt);
      if (window.Bots && window.Bots.respondToPlayerChat) window.Bots.respondToPlayerChat(txt, ch);
    };
    document.getElementById('btnSendChat').onclick = sendChat;
    document.getElementById('chatInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') sendChat();
    });

    // Action buttons & unified hotbar utility buttons
    document.getElementById('btnAttack').onclick = doPrimaryAttack;
    document.getElementById('btnAutoCombat').onclick = () => {
      window.GameState.autoCombat = !window.GameState.autoCombat;
      document.getElementById('btnAutoCombat').classList.toggle('active', window.GameState.autoCombat);
      window.UI.toast(window.GameState.autoCombat ? 'Автобой ВКЛЮЧЁН' : 'Автобой ВЫКЛЮЧЕН');
    };
    document.getElementById('btnToggleMount').onclick = () => {
      toggleMount();
      document.getElementById('btnToggleMount').classList.toggle('active', !!window.GameState.player.mountedId);
    };
    const bagBtn = document.getElementById('btnHotbarBag');
    if (bagBtn) bagBtn.onclick = () => window.UI.openModal('inventory');
    const socBtn = document.getElementById('btnHotbarSocial');
    if (socBtn) socBtn.onclick = () => window.UI.openModal('tradeHub');
    document.getElementById('btnDash').onclick = doDash;
    document.getElementById('btnLootAll').onclick = () => {
      const c = window.Combat.lootNearby(150);
      if (!c) window.UI.toast('Рядом нет лута.');
    };
    document.getElementById('btnInteract').onclick = interactNearby;
    document.getElementById('btnQuickHpPot').onclick = () => quickDrink('hp_potion');
    document.getElementById('btnQuickMpPot').onclick = () => quickDrink('mp_potion');

    // Modals close
    document.getElementById('btnCloseModal').onclick = () => window.UI.closeModal();
    document.getElementById('btnCloseSubModal').onclick = () => window.UI.closeSubModal();
    document.getElementById('modalOverlay').onclick = e => {
      if (e.target.id === 'modalOverlay') window.UI.closeModal();
    };
    document.getElementById('subModalOverlay').onclick = e => {
      if (e.target.id === 'subModalOverlay') window.UI.closeSubModal();
    };

    // Respawn after Hardcore Death
    document.getElementById('btnRespawn').onclick = () => {
      const p = window.GameState.player;
      p.state = 'idle';
      p.x = 3950;
      p.y = 3000;
      if (!p.equipment.weapon) {
        p.equipment.weapon = window.GameData.createWeaponItem('sword', 'common', 1, 0, 1);
      }
      window.GameState.recalcStats();
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      document.getElementById('deathOverlay').classList.add('hidden');
      window.MMO.saveProgress();
      rebuildSkillBar();
      window.UI.toast('Вы возродились в Аэтельгарде. Получен базовый меч T1.');
    };

    // Fishing overlay
    document.getElementById('btnFishCatch').onclick = catchFish;
    document.getElementById('btnFishCancel').onclick = () => {
      fishingState = null;
      document.getElementById('fishingOverlay').classList.add('hidden');
    };

    // HUD editor overlay
    document.getElementById('btnSaveHudEdit').onclick = exitHudEditMode;
    document.getElementById('btnResetHudEdit').onclick = () => {
      resetHudLayout();
      window.UI.toast('HUD сброшен по умолчанию.');
    };
  }

  // =========================================================================
  // HUD, MINIMAP & START PREVIEW RENDERING
  // =========================================================================
  let hudAccum = 0;
  let saveAccum = 0;
  let fpsCount = 0;
  let fpsTimer = 0;
  let lastFps = 60;

  function renderPortrait() {
    const c = document.getElementById('hudPortraitCanvas');
    if (!c) return;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    g.save();
    g.translate(26, 36);
    const p = window.GameState.player;
    window.Sprites.drawCharacter(g, {
      x: 0, y: 0, facingX: 1, state: 'idle', hideNameplate: true,
      appearance: p.appearance, equipment: p.equipment, mountedId: null, name: ''
    }, 0);
    g.restore();
  }

  function renderStartPreview(animTime) {
    const screen = document.getElementById('startScreen');
    if (screen.classList.contains('hidden')) return;
    const c = document.getElementById('startHeroPreview');
    if (!c) return;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    const cls = STARTER_CLASSES[selectedClass] || STARTER_CLASSES.warrior;
    g.save();
    g.translate(72, 92);
    g.scale(2.1, 2.1);
    window.Sprites.drawCharacter(g, {
      x: 0, y: 0, facingX: 1, state: 'idle', isPlayer: false, hideNameplate: true, showAura: true,
      appearance: Object.assign({}, cls.appearance, selectedAppearance),
      equipment: {
        weapon: window.GameData.createWeaponItem(cls.weapon, 'rare', 1, 0, 1),
        armor: cls.armor ? window.GameData.createArmorItem(cls.armor, 'rare', 1, 0, 1) : null,
        helmet: cls.helmet ? window.GameData.createArmorItem(cls.helmet, 'rare', 1, 0, 1) : null
      },
      mountedId: null, name: ''
    }, animTime);
    g.restore();
  }

  function renderMinimap() {
    const mc = document.getElementById('minimapCanvas');
    if (!mc) return;
    const g = mc.getContext('2d');
    const W = mc.width, H = mc.height;
    const sx = W / window.World.WIDTH;
    const sy = H / window.World.HEIGHT;
    g.fillStyle = '#090e1c';
    g.fillRect(0, 0, W, H);

    // Biomes
    window.World.BIOMES.forEach(b => {
      g.fillStyle = b.mapCol || b.ground || '#1e293b';
      g.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
    });

    // NPCs (gold)
    g.fillStyle = '#fbbf24';
    window.World.NPCS.forEach(n => {
      g.fillRect(Math.round(n.x * sx) - 1, Math.round(n.y * sy) - 1, 2, 2);
    });

    // Bosses (red)
    g.fillStyle = '#f43f5e';
    window.Combat.monsters.forEach(m => {
      if (!m.dead && m.isBoss) g.fillRect(Math.round(m.x * sx) - 2, Math.round(m.y * sy) - 2, 4, 4);
    });

    // Clan Fortresses (gold squares)
    if (window.Activities && window.Activities.FORTRESSES) {
      window.Activities.FORTRESSES.forEach(f => {
        g.fillStyle = f.ownerColor || '#fbbf24';
        g.fillRect(Math.round(f.x * sx) - 2, Math.round(f.y * sy) - 2, 5, 5);
      });
    }

    // Tracked Bounty Target (bright red pulse)
    if (window.Progression && window.Progression.getTrackedTarget) {
      const tr = window.Progression.getTrackedTarget();
      if (tr) {
        g.fillStyle = '#ef4444';
        g.fillRect(Math.round(tr.x * sx) - 3, Math.round(tr.y * sy) - 3, 6, 6);
      }
    }

    // Remote Online Players (cyan / green if in party)
    if (window.Multiplayer) {
      window.Multiplayer.getRemotePlayers().forEach(rp => {
        g.fillStyle = window.Multiplayer.isInMyParty(rp.id) ? '#4ade80' : '#38bdf8';
        g.fillRect(Math.round(rp.x * sx) - 1, Math.round(rp.y * sy) - 1, 3, 3);
      });
    }

    // Local Player (white/gold)
    const p = window.GameState.player;
    g.fillStyle = '#ffffff';
    g.fillRect(Math.round(p.x * sx) - 2, Math.round(p.y * sy) - 2, 4, 4);
  }

  function updateHudDom() {
    const gs = window.GameState;
    const p = gs.player;
    const st = gs.computedStats;

    document.getElementById('hudLevelNum').textContent = p.level;
    document.getElementById('hudName').textContent = p.name;
    const clanEl = document.getElementById('hudClanTag');
    if (gs.clan && gs.clan.tag) {
      clanEl.textContent = '[' + gs.clan.tag + ']';
      clanEl.classList.remove('hidden');
    } else {
      clanEl.classList.add('hidden');
    }

    const pkEl = document.getElementById('hudPkBadge');
    if (pkEl) pkEl.classList.toggle('hidden', (p.karma || 0) > -50);

    const pvpBadge = document.getElementById('hudPvpBadge');
    pvpBadge.textContent = gs.pvpEnabled ? 'PvP' : 'МИР';
    pvpBadge.className = 'hud-pvp-badge ' + (gs.pvpEnabled ? 'on' : 'off');

    const pvpBtn = document.getElementById('btnTogglePvp');
    pvpBtn.classList.toggle('pvp-on', gs.pvpEnabled);
    document.getElementById('btnTogglePvpText').textContent = gs.pvpEnabled ? 'PvP: ВКЛ' : 'PvP: ВЫКЛ';

    const onlineEl = document.getElementById('hudOnlineBadge');
    if (window.Multiplayer) {
      const ms = window.Multiplayer.getStatus();
      const isConn = ms.status === 'connected';
      const cnt = ms.onlineCount || ((ms.remoteCount || 0) + 1);
      onlineEl.textContent = isConn ? ('Онлайн: ' + cnt) : (ms.status === 'connecting' ? 'Подкл...' : 'Офлайн');
    }
    document.getElementById('hudFps').textContent = lastFps + ' FPS';

    const hpPct = Math.max(0, Math.min(100, (p.hp / Math.max(1, p.maxHp)) * 100));
    const mpPct = Math.max(0, Math.min(100, (p.mp / Math.max(1, p.maxMp)) * 100));
    document.getElementById('hudHpBar').style.width = hpPct + '%';
    document.getElementById('hudHpText').textContent = 'HP: ' + Math.round(p.hp) + ' / ' + Math.round(p.maxHp);
    document.getElementById('hudMpBar').style.width = mpPct + '%';
    document.getElementById('hudMpText').textContent = 'MP: ' + Math.round(p.mp) + ' / ' + Math.round(p.maxMp);
    document.getElementById('hudGold').textContent = Math.floor(p.gold).toLocaleString('ru-RU');
    document.getElementById('hudPower').textContent = st.power;

    // Admin Panel quick button
    const admBtn = document.getElementById('btnAdminPanel');
    if (gs.adminBot && gs.adminBot.owned) admBtn.classList.remove('hidden');
    else admBtn.classList.add('hidden');

    // Zone & coords + Instance Banner
    const instBanner = window.Activities && window.Activities.getActiveInstanceBanner();
    const ibEl = document.getElementById('instanceBanner');
    if (instBanner && ibEl) {
      ibEl.classList.remove('hidden');
      document.getElementById('instanceBannerTitle').textContent = instBanner.title;
      document.getElementById('instanceBannerSub').textContent = instBanner.sub;
      document.getElementById('hudZoneName').textContent = instBanner.title;
    } else {
      if (ibEl) ibEl.classList.add('hidden');
      const biome = window.World.getBiomeAt(p.x, p.y);
      document.getElementById('hudZoneName').textContent = biome.name;
    }
    document.getElementById('hudCoords').textContent = Math.round(p.x) + ', ' + Math.round(p.y);

    // Quick potion counts
    document.getElementById('hpPotQty').textContent = window.MMO.countTemplateInBag('hp_potion');
    document.getElementById('mpPotQty').textContent = window.MMO.countTemplateInBag('mp_potion');

    // Dash CD overlay
    const dOv = document.getElementById('dashCdOverlay');
    if (p.dashCooldown > 0.05) {
      dOv.textContent = p.dashCooldown.toFixed(1);
      dOv.classList.remove('hidden');
    } else {
      dOv.classList.add('hidden');
    }

    // Skill CD overlays
    (p.skillBar || []).forEach((sid, idx) => {
      const ov = document.getElementById('skillCd_' + idx);
      if (!ov) return;
      let rid = sid;
      if (sid === 'wsp_1' || sid === 'wsp_2') {
        const wsp = getWeaponSpellForSlot(sid);
        rid = wsp ? wsp.id : '';
      }
      const cd = rid ? (p.skillCooldowns[rid] || 0) : 0;
      if (cd > 0.05) {
        ov.textContent = cd.toFixed(1);
        ov.classList.remove('hidden');
      } else {
        ov.classList.add('hidden');
      }
    });

    // Quest tracker
    const qtBody = document.getElementById('questTrackerBody');
    let readyQuests = 0;
    const activeQs = window.MMO.QUEST_DEFS.filter(q => {
      const stQ = gs.quests[q.id] || { prog: 0, claimed: false };
      const curP = typeof stQ.prog === 'number' ? stQ.prog : (stQ.progress || 0);
      if (!stQ.claimed && curP >= q.need) readyQuests++;
      return !stQ.claimed;
    }).slice(0, 3);
    qtBody.innerHTML = activeQs.length ? activeQs.map(q => {
      const stQ = gs.quests[q.id] || { prog: 0 };
      const curP = typeof stQ.prog === 'number' ? stQ.prog : (stQ.progress || 0);
      const done = curP >= q.need;
      return `<div class="qt-item ${done ? 'done' : ''}"><b>${q.title}</b> (${Math.min(curP, q.need)}/${q.need})</div>`;
    }).join('') : '<div class="qt-item done">Все задания выполнены!</div>';

    const bq = document.getElementById('badgeQuests');
    if (readyQuests > 0) { bq.textContent = readyQuests; bq.classList.remove('hidden'); }
    else bq.classList.add('hidden');

    const bm = document.getElementById('badgeMenu');
    if (bm && window.Progression && window.Progression.hasPendingRewards) {
      bm.classList.toggle('hidden', !window.Progression.hasPendingRewards());
    }

    // Party Widget (Real Online Party + Bot Party)
    const realMembers = (window.Multiplayer && window.Multiplayer.realParty && window.Multiplayer.realParty.members) || [];
    const botMembers = window.MMO.party || [];
    const pw = document.getElementById('partyWidget');
    if (realMembers.length > 0 || botMembers.length > 0) {
      pw.classList.remove('hidden');
      const pb = document.getElementById('partyListBody');
      const rows = [];
      realMembers.forEach(m => {
        const rp = window.Multiplayer.getRemotePlayerById(m.id);
        const hpStr = rp ? (Math.round(rp.hp) + '/' + Math.round(rp.maxHp)) : 'В сети';
        rows.push(`<div class="party-member-row">
          <span style="color:#86efac;font-weight:800;">[Игрок] ${m.name} (${hpStr})</span>
          <button class="pixel-btn btn-sm btn-blue" data-tp-mate="${m.id}">ТП</button>
        </div>`);
      });
      botMembers.forEach(bid => {
        const b = window.Bots.byId(bid);
        if (!b) return;
        rows.push(`<div class="party-member-row">
          <span style="color:#dbe7ff;">[Бот] ${b.name} (${Math.round(b.hp)}/${Math.round(b.maxHp)})</span>
        </div>`);
      });
      pb.innerHTML = rows.join('');
      pb.querySelectorAll('[data-tp-mate]').forEach(btn => {
        btn.onclick = () => window.Multiplayer.teleportToPartyMate(btn.dataset.tpMate);
      });
    } else {
      pw.classList.add('hidden');
    }

    // Net Invite Banner (Trade or Party invite)
    const invBanner = document.getElementById('netInviteBanner');
    const pTrade = window.Multiplayer && window.Multiplayer.getPendingTradeInvite && window.Multiplayer.getPendingTradeInvite();
    const pParty = window.Multiplayer && window.Multiplayer.getPendingPartyInvite && window.Multiplayer.getPendingPartyInvite();
    if (pTrade) {
      document.getElementById('netInviteText').textContent = pTrade.fromName + ' предлагает вам Обмен!';
      invBanner.classList.remove('hidden');
    } else if (pParty) {
      document.getElementById('netInviteText').textContent = pParty.fromName + ' приглашает вас в Пати!';
      invBanner.classList.remove('hidden');
    } else {
      invBanner.classList.add('hidden');
    }

    // Nearby Boss Banner
    const bossBanner = document.getElementById('bossBanner');
    const nearBoss = window.Combat.monsters.find(m => !m.dead && m.isBoss && Math.hypot(m.x - p.x, m.y - p.y) < 420);
    if (nearBoss) {
      bossBanner.classList.remove('hidden');
      document.getElementById('bossBannerName').textContent = nearBoss.name + ' (Ур.' + nearBoss.level + ')';
      document.getElementById('bossBannerSub').textContent = 'Мировой Босс';
      document.getElementById('bossBannerFill').style.width = Math.max(0, (nearBoss.hp / Math.max(1, nearBoss.maxHp)) * 100) + '%';
      document.getElementById('bossBannerText').textContent = Math.round(nearBoss.hp) + ' / ' + Math.round(nearBoss.maxHp);
    } else {
      bossBanner.classList.add('hidden');
    }

    renderPortrait();
    renderMinimap();
  }

  // =========================================================================
  // MAIN GAME LOOP
  // =========================================================================
  let lastTs = performance.now();
  let animTime = 0;

  function stepPlayer(dt) {
    const gs = window.GameState;
    const p = gs.player;
    if (p.state === 'death') return;

    // Cooldowns & regeneration
    if (p.attackCooldown > 0) p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    if (p.attackTimer > 0) p.attackTimer = Math.max(0, p.attackTimer - dt);
    if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    if (p.buffSpeed > 0) p.buffSpeed = Math.max(0, p.buffSpeed - dt);
    if (p.buffPower > 0) p.buffPower = Math.max(0, p.buffPower - dt);
    if (p.buffShield > 0) {
      p.buffShield = Math.max(0, p.buffShield - dt);
      if (p.buffShield <= 0) p.shield = 0;
    }
    Object.keys(p.skillCooldowns).forEach(k => {
      if (p.skillCooldowns[k] > 0) p.skillCooldowns[k] = Math.max(0, p.skillCooldowns[k] - dt);
    });

    const inSafe = window.World.getBiomeAt(p.x, p.y).safe;
    p.hp = Math.min(p.maxHp, p.hp + (inSafe ? p.maxHp * 0.08 : p.maxHp * 0.012) * dt);
    p.mp = Math.min(p.maxMp, p.mp + (inSafe ? p.maxMp * 0.12 : p.maxMp * 0.035) * dt);

    // Movement vector
    let mx = joy.dx;
    let my = joy.dy;
    if (keys.KeyW || keys.ArrowUp) my -= 1;
    if (keys.KeyS || keys.ArrowDown) my += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1;
    if (keys.KeyD || keys.ArrowRight) mx += 1;
    const mLen = Math.hypot(mx, my);

    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      p.x += p.dashVx * dt;
      p.y += p.dashVy * dt;
      p.state = 'run';
    } else if (mLen > 0.08) {
      const spd = gs.computedStats.speed || 155;
      p.x += (mx / Math.max(1, mLen)) * spd * dt;
      p.y += (my / Math.max(1, mLen)) * spd * dt;
      if (Math.abs(mx) > 0.08) p.facingX = mx > 0 ? 1 : -1;
      if (p.attackTimer <= 0) p.state = p.mountedId ? 'run' : 'walk';
    } else if (gs.autoCombat) {
      const t = findPreferredTarget();
      if (t) {
        p.mountedId = null;
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        const d = Math.hypot(dx, dy);
        const w = p.equipment.weapon;
        const wtKey = w && (w.weaponType || w.weaponId);
        const wRange = (wtKey && window.GameData.WEAPON_BY_ID[wtKey]) ? window.GameData.WEAPON_BY_ID[wtKey].range : 64;
        p.facingX = dx >= 0 ? 1 : -1;
        if (d > wRange * 0.92) {
          const spd = gs.computedStats.speed || 155;
          p.x += (dx / d) * spd * dt;
          p.y += (dy / d) * spd * dt;
          p.state = 'run';
        } else {
          p.state = p.attackTimer > 0 ? 'attack' : 'idle';
          if (p.attackCooldown <= 0) {
            window.Combat.performBasicAttack(p, t, gs.computedStats);
          }
        }
      } else {
        if (p.attackTimer <= 0) p.state = 'idle';
      }
    } else {
      if (p.attackTimer <= 0) p.state = 'idle';
    }

    // Clamp to world bounds (skip clamp when inside Dungeon/Arena instance coordinates)
    const inInstance = window.Activities && (window.Activities.isInDungeon() || window.Activities.isInArena());
    if (!inInstance) {
      p.x = Math.max(36, Math.min(window.World.WIDTH - 36, p.x));
      p.y = Math.max(36, Math.min(window.World.HEIGHT - 36, p.y));
    }

    // Cosmetic Footstep Trail particles while moving
    if ((p.state === 'walk' || p.state === 'run') && gs.cosmetics && gs.cosmetics.equipped && gs.cosmetics.equipped.trail) {
      if (Math.random() < dt * 16) {
        const tDef = window.CosmeticsData && window.CosmeticsData.COSMETIC_BY_ID[gs.cosmetics.equipped.trail];
        if (tDef) window.Combat.addParticles(p.x, p.y + 10, tDef.color, 2, 26);
      }
    }

    if (gs.settings.autoLoot) {
      window.Combat.lootNearby(96);
    }
  }

  function frame(ts) {
    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;
    animTime += dt;

    fpsCount++;
    fpsTimer += dt;
    if (fpsTimer >= 0.5) {
      lastFps = Math.round(fpsCount / fpsTimer);
      fpsCount = 0;
      fpsTimer = 0;
    }

    if (!window.GameState.started) {
      renderStartPreview(animTime);
      requestAnimationFrame(frame);
      return;
    }

    // Fishing minigame step
    if (fishingState) {
      fishingState.cursor += fishingState.dir * fishingState.speed * dt;
      if (fishingState.cursor >= 98) { fishingState.cursor = 98; fishingState.dir = -1; }
      if (fishingState.cursor <= 0) { fishingState.cursor = 0; fishingState.dir = 1; }
      const cEl = document.getElementById('fishingCursor');
      if (cEl) cEl.style.left = fishingState.cursor + '%';
    }

    // Update world & systems
    stepPlayer(dt);
    window.World.update(dt);
    window.Combat.update(dt);
    window.Bots.update(dt);
    window.MMO.updateEconomy(dt);
    window.MMO.updateAuction(dt);
    if (window.Activities) window.Activities.update(dt);
    if (window.Progression) window.Progression.updateOutlaws(dt);
    if (window.TelegramStars) window.TelegramStars.updateAdminBot(dt);
    if (window.Multiplayer) window.Multiplayer.update(dt);

    // Camera tracking + shake
    const p = window.GameState.player;
    const shake = window.Combat.shake || 0;
    const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const inInstance = window.Activities && (window.Activities.isInDungeon() || window.Activities.isInArena());
    if (inInstance) {
      cam.x = (p.x - cam.w / 2) + sx;
      cam.y = (p.y - cam.h / 2) + sy;
    } else {
      cam.x = Math.max(0, Math.min(window.World.WIDTH - cam.w, p.x - cam.w / 2)) + sx;
      cam.y = Math.max(0, Math.min(window.World.HEIGHT - cam.h, p.y - cam.h / 2)) + sy;
    }

    // Render World (crisp pixel art + instance floor support)
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cam.w, cam.h);
    ctx.save();
    ctx.translate(-Math.round(cam.x), -Math.round(cam.y));

    const drewInstance = window.Activities && window.Activities.drawInstanceFloor(ctx, animTime);
    if (!drewInstance) {
      window.World.drawBackground(ctx, cam.x, cam.y, cam.w, cam.h, animTime);
      window.World.drawPropsAndNpcs(ctx, cam.x, cam.y, cam.w, cam.h, animTime);
      window.Bots.drawAll(ctx, cam.x, cam.y, cam.w, cam.h, animTime);
      if (window.Multiplayer) {
        window.Multiplayer.drawAll(ctx, cam.x, cam.y, cam.w, cam.h, animTime);
      }
      if (window.Progression) {
        window.Progression.drawOutlawsAndCompass(ctx, cam.x, cam.y, cam.w, cam.h, animTime);
      }
    }

    // Clan Fortresses, Arena Fighters & Active Battle Pet
    if (window.Activities) {
      window.Activities.drawWorldOverlay(ctx, cam.x, cam.y, cam.w, cam.h, animTime);
    }

    // Local Player
    window.Sprites.drawCharacter(ctx, p, animTime);

    // Admin Guardian Bot
    if (window.TelegramStars) {
      window.TelegramStars.drawAdminBot(ctx, animTime);
    }

    // Telegraphs, Ground Loot, Monsters, Projectiles, VFX & Floating Damage Numbers
    window.Combat.drawWorldCombat(ctx, cam.x, cam.y, cam.w, cam.h, animTime);

    ctx.restore();

    // Periodic HUD & Save updates
    hudAccum += dt;
    if (hudAccum >= 0.14) {
      hudAccum = 0;
      updateHudDom();
    }
    saveAccum += dt;
    if (saveAccum >= 20) {
      saveAccum = 0;
      window.MMO.saveProgress();
    }

    requestAnimationFrame(frame);
  }

  // =========================================================================
  // BOOTSTRAP
  // =========================================================================
  function boot() {
    if (window.PixelIcons) window.PixelIcons.hydrateDom();
    if (window.GameAudio) window.GameAudio.init();
    window.World.init();
    window.Combat.spawnInitialMonsters();
    window.Bots.init();
    window.MMO.initAuctionHouse();
    if (window.TelegramStars) window.TelegramStars.init();
    if (window.Multiplayer) window.Multiplayer.init();
    bindStaticDom();
    initJoystick();
    initHudDragEditor();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
