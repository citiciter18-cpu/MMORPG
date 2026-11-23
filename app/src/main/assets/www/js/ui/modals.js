/* ==========================================================================
   BladeRealm — Complete MMORPG Modals & Interactive UI Controller
   100% Custom Procedural Pixel-Art Icons (ZERO Emojis)
   ========================================================================== */

window.UI = (function () {
  let currentModal = null;
  let invFilter = 'all';
  let selectedMountId = 'wolf';
  let auctionTab = 'online';
  let auctionFilter = 'all';
  let auctionSearch = '';
  let leaderboardSort = 'power';
  let chatChannel = 'all';
  let econTab = 'exchange';
  let botRoleFilter = 'all';
  let craftCat = 'tools';
  let weaponTierFilter = 1;
  let showStarsDevHelp = false;
  let settingsTab = 'general';
  let adminTab = 'grant';

  const modalOverlay = () => document.getElementById('modalOverlay');
  const modalTitle = () => document.getElementById('modalTitle');
  const modalIcon = () => document.getElementById('modalIcon');
  const modalBody = () => document.getElementById('modalBody');
  const subOverlay = () => document.getElementById('subModalOverlay');
  const subTitle = () => document.getElementById('subModalTitle');
  const subIcon = () => document.getElementById('subModalIcon');
  const subBody = () => document.getElementById('subModalBody');

  function px(name, cls, size) {
    return window.PixelIcons ? window.PixelIcons.imgTag(name, cls || 'px-ico-xs', size || 20) : '';
  }

  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
  }

  function toast(msg) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast-item';
    el.textContent = msg;
    stack.appendChild(el);
    while (stack.children.length > 3) stack.removeChild(stack.firstChild);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 220); }, 2500);
  }

  function openModal(id) {
    currentModal = id;
    closeSubModal();
    modalOverlay().classList.remove('hidden');
    renderCurrentModal();
  }

  function closeModal() {
    currentModal = null;
    closeSubModal();
    modalOverlay().classList.add('hidden');
  }

  function openSubModal(iconKey, title, html, bindFn) {
    const ic = subIcon();
    if (ic && window.PixelIcons) ic.src = window.PixelIcons.get(iconKey || 'skills', 28);
    subTitle().textContent = title || 'Детали';
    subBody().innerHTML = html;
    subOverlay().classList.remove('hidden');
    if (bindFn) bindFn(subBody());
  }

  function closeSubModal() {
    subOverlay().classList.add('hidden');
    subBody().innerHTML = '';
  }

  function isAnyModalOpen() {
    return !subOverlay().classList.contains('hidden') || !modalOverlay().classList.contains('hidden');
  }

  function handleBack() {
    if (!subOverlay().classList.contains('hidden')) { closeSubModal(); return true; }
    if (!modalOverlay().classList.contains('hidden')) { closeModal(); return true; }
    return false;
  }

  function renderCurrentModal() {
    if (!currentModal) return;
    const map = {
      menu:         ['menu',         'Главное меню', renderMainMenu],
      character:    ['character',    'Персонаж и внешность', renderCharacterModal],
      inventory:    ['inventory',    'Инвентарь и экипировка', renderInventoryModal],
      weapons:      ['weapons',      'Арсенал — 23 вида оружия', renderWeaponsCatalog],
      mounts:       ['mounts',       'Маунты (12 видов)', renderMountsModal],
      skills:       ['skills',       'Дерево навыков', renderSkillsModal],
      map:          ['map',          'Карта мира (10 биомов) и Телепорт', renderMapModal],
      economy:      ['coin',         'Биржа, Контракты и Банк', renderEconomyModal],
      bank:         ['storage',      'Банк монет (Сейф — 0% потерь при смерти)', renderBankModal],
      auction:      ['auction',      'Аукцион реальных игроков', renderAuctionModal],
      tradeHub:     ['trade',        'Онлайн игроки, Обмен и Пати', renderTradeHubModal],
      trade:        ['trade',        'Окно обмена (Бот)', renderTradeModal],
      realTrade:    ['trade',        'Обмен с реальным игроком', renderRealTradeModal],
      clan:         ['clan',         'Клан и Гильдия', renderClanModal],
      shop:         ['shop',         'Магазин Аэтельгарда', renderShopModal],
      donate:       ['tg_star',      'Донат — Telegram Stars', renderDonateModal],
      adminPanel:   ['admin_bot',    'Админ-Панель (Полный контроль)', renderAdminPanelModal],
      craft:        ['craft',        'Профессии и Крафт', renderCraftModal],
      storage:      ['storage',      'Личное хранилище (Склад)', renderStorageModal],
      quests:       ['quests',       'Задания и Ежедневки', renderQuestsModal],
      achievements: ['achievements', 'Достижения', renderAchievementsModal],
      leaderboard:  ['leaderboard',  'Таблица рейтингов', renderLeaderboardModal],
      settings:     ['settings',     'Настройки, Масштаб и Кнопки', renderSettingsModal]
    };
    const cfg = map[currentModal];
    if (!cfg) return;
    const ic = modalIcon();
    if (ic && window.PixelIcons) ic.src = window.PixelIcons.get(cfg[0], 28);
    modalTitle().textContent = cfg[1];
    cfg[2](modalBody());
  }

  // =========================================================================
  // 1. MAIN MENU (Ornate Pixel-Art Grid matching Reference Image 2)
  // =========================================================================
  function renderMainMenu(root) {
    const items = [
      ['character',    'character',    'Персонаж'],
      ['inventory',    'inventory',    'Инвентарь'],
      ['skills',       'skills',       'Навыки'],
      ['map',          'map',          'Карта (10)'],
      ['economy',      'coin',         'Биржа'],
      ['bank',         'storage',      'Банк монет'],
      ['clan',         'clan',         'Клан'],
      ['achievements', 'achievements', 'Достижения'],
      ['weapons',      'weapons',      '23 Оружия'],
      ['mounts',       'mounts',       'Маунты (12)'],
      ['auction',      'auction',      'Аукцион'],
      ['tradeHub',     'trade',        'Онлайн / Пати'],
      ['shop',         'shop',         'Магазин'],
      ['donate',       'tg_star',      'Донат Stars'],
      ['craft',        'craft',        'Крафт'],
      ['storage',      'storage',      'Склад'],
      ['quests',       'quests',       'Задания'],
      ['leaderboard',  'leaderboard',  'Рейтинги'],
      ['settings',     'settings',     'Настройки'],
      ['__exit',       'exit',         'Выход в титул']
    ];
    if (window.GameState.adminBot && window.GameState.adminBot.owned) {
      items.unshift(['adminPanel', 'admin_bot', 'Админ-Панель']);
    }
    root.innerHTML = `<div class="main-menu-grid">${items.map(it =>
      `<button class="menu-card" ${it[0]==='adminPanel'?'style="border-color:#fbbf24;background:rgba(52,32,82,0.88);"':''} data-open="${it[0]}">${px(it[1], 'menu-card-px', 32)}<span>${it[2]}</span></button>`
    ).join('')}</div>`;
    root.querySelectorAll('[data-open]').forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.open === '__exit') {
          window.MMO.saveProgress();
          closeModal();
          document.getElementById('startScreen').classList.remove('hidden');
        } else {
          openModal(btn.dataset.open);
        }
      };
    });
  }

  // =========================================================================
  // 2. CHARACTER & APPEARANCE CUSTOMIZATION
  // =========================================================================
  function renderCharacterModal(root) {
    const p = window.GameState.player;
    const st = window.GameState.computedStats;
    const needXp = window.MMO.xpForLevel(p.level);
    const xpPct = Math.min(100, Math.round((p.xp / needXp) * 100));
    const attr = p.attributes || { str: 5, vit: 5, int: 5, agi: 5, lck: 5 };
    const hairs = ['#1a1b2e', '#cbd5e1', '#b91c1c', '#f59e0b', '#38bdf8', '#a855f7'];
    const cloaks = ['#b91c1c', '#1d4ed8', '#15803d', '#7c3aed', '#ca8a04', '#0f172a'];
    const armors = ['#24293d', '#3b1d2a', '#1e3a5f', '#1f3a2e', '#3b1f54', '#4a3728'];

    const attrDefs = [
      ['str', 'weapons',   'Сила (STR)',      '+3 АТК, +0.3% пробития'],
      ['vit', 'heart',     'Живучесть (VIT)', '+18 HP, +1.5 ЗАЩ'],
      ['int', 'mp_vial',   'Интеллект (INT)', '+10 MP, +1.2% урон чар'],
      ['agi', 'dash_boot', 'Ловкость (AGI)',  '+1.2% крит, +1.5 скор.'],
      ['lck', 'coin',      'Удача (LCK)',     '+1.5% золота, +1 удача']
    ];

    const mast = window.GameState.mastery || { weapons: {}, gather: {} };
    const topWeapons = Object.entries(mast.weapons || {})
      .sort((a, b) => (b[1].lv || 1) - (a[1].lv || 1))
      .slice(0, 4);
    const gMap = mast.gather || {};

    root.innerHTML = `
      <div class="inv-layout">
        <div class="paperdoll-box pixel-inset">
          <div class="paperdoll-center">
            <canvas id="charModalPreview" width="136" height="136"></canvas>
            <div style="font-weight:900;color:#ffe08a;margin-top:4px;">${esc(p.name)} • Ур. ${p.level}</div>
            <div style="width:100%;margin-top:4px;">
              <div class="bar-track" style="height:12px;">
                <div class="bar-fill" style="width:${xpPct}%;background:linear-gradient(90deg,#c98612,#fbbf24,#ffe08a);"></div>
                <span class="bar-text" style="font-size:9px;">XP: ${p.xp} / ${needXp} (${xpPct}%)</span>
              </div>
            </div>
            <div style="font-size:10px;color:#9fb2db;margin-top:4px;">${px('weapons')} БМ: ${st.power} • PvP: ${p.pvpRating || 1000}</div>
          </div>
          <div class="stats-mini-grid">
            <div>${px('heart')} HP: <b>${Math.round(p.hp)}/${p.maxHp}</b></div>
            <div>${px('mp_vial')} MP: <b>${Math.round(p.mp)}/${p.maxMp}</b></div>
            <div>${px('weapons')} Атака: <b>${st.atk}</b></div>
            <div>${px('clan')} Защита: <b>${st.def}</b></div>
            <div>${px('fire')} Крит: <b>${st.crit}%</b></div>
            <div>${px('dash_boot')} Скор.: <b>${st.speed}</b></div>
            <div>${px('sk_passive_pen')} Пробит.: <b>${Math.round((st.armorPen || 0) * 100)}%</b></div>
            <div>${px('sk_passive_vamp')} Вамп.: <b>${Math.round((st.lifestealPct || 0) * 100)}%</b></div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="pixel-inset" style="padding:8px;display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:900;color:#ffe08a;">${px('skills')} Характеристики героя</span>
              <span style="font-size:11px;font-weight:900;color:${(p.statPoints || 0) > 0 ? '#4ade80' : '#9fb2db'};">Очки: ${p.statPoints || 0}</span>
            </div>
            ${attrDefs.map(a => `
              <div class="attr-row">
                <div>
                  <span style="font-weight:800;color:#eef3ff;">${px(a[1])} ${a[2]}: <b style="color:#fbbf24;">${attr[a[0]] || 0}</b></span>
                  <div style="font-size:9px;color:#9fb2db;">${a[3]}</div>
                </div>
                <button class="pixel-btn btn-sm btn-green" data-up-attr="${a[0]}" ${(p.statPoints || 0) <= 0 ? 'disabled' : ''}>+1</button>
              </div>
            `).join('')}
          </div>

          <div class="pixel-inset" style="padding:8px;display:flex;flex-direction:column;gap:5px;">
            <div style="font-weight:900;color:#7cc0ff;">${px('axe_tool')} Мастерство оружия и сбора</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:10px;color:#dbe7ff;">
              <span>${px('axe_tool')} Лесорубка: <b>Ур.${gMap.axe?.lv || 1}</b></span>
              <span>${px('pickaxe')} Горное: <b>Ур.${gMap.pickaxe?.lv || 1}</b></span>
              <span>${px('sickle_tool')} Травы: <b>Ур.${gMap.sickle?.lv || 1}</b></span>
              <span>${px('fish')} Рыбалка: <b>Ур.${gMap.fish?.lv || 1}</b></span>
            </div>
            ${topWeapons.length > 0 ? `<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:10px;color:#ffe08a;">${topWeapons.map(([wk, mv]) => {
              const wn = window.GameData.WEAPON_BY_ID[wk]?.name || wk;
              return `<span>${px('weapons')} ${esc(wn)}: <b>Ур.${mv.lv}</b> (+${Math.round((mv.lv - 1) * 3.5)}% АТК)</span>`;
            }).join(' • ')}</div>` : ''}
          </div>

          <div class="pixel-inset" style="padding:8px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#ffe08a;">${px('character')} Внешний вид персонажа</div>
            <div style="display:flex;gap:6px;">
              <input id="charRenameInput" class="modal-input" style="flex:1;" maxlength="16" value="${esc(p.name)}" />
              <button class="pixel-btn btn-gold" id="btnApplyRename">Сменить имя</button>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <div><div style="font-size:10px;color:#9fb2db;margin-bottom:3px;">Волосы</div>
                <div class="swatch-row">${hairs.map(c => `<div class="swatch ${p.appearance.hair===c?'active':''}" data-hair="${c}" style="background:${c}"></div>`).join('')}</div>
              </div>
              <div><div style="font-size:10px;color:#9fb2db;margin-bottom:3px;">Плащ</div>
                <div class="swatch-row">${cloaks.map(c => `<div class="swatch ${p.appearance.cloak===c?'active':''}" data-cloak="${c}" style="background:${c}"></div>`).join('')}</div>
              </div>
              <div><div style="font-size:10px;color:#9fb2db;margin-bottom:3px;">Доспех</div>
                <div class="swatch-row">${armors.map(c => `<div class="swatch ${p.appearance.armor===c?'active':''}" data-armor="${c}" style="background:${c}"></div>`).join('')}</div>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-blue" id="btnCharToInv">${px('inventory')} Экипировка</button>
            <button class="pixel-btn btn-purple" id="btnCharToSkills">${px('skills')} Навыки</button>
            <button class="pixel-btn btn-gold" id="btnCharToWeapons">${px('weapons')} 23 Оружия</button>
          </div>
        </div>
      </div>`;

    drawCharacterPreviewCanvas(document.getElementById('charModalPreview'), p);
    root.querySelectorAll('[data-up-attr]').forEach(btn => {
      btn.onclick = () => {
        if (window.MMO.upgradeAttribute(btn.dataset.upAttr)) renderCurrentModal();
      };
    });
    root.querySelector('#btnApplyRename').onclick = () => {
      const nv = root.querySelector('#charRenameInput').value.trim();
      if (nv) { p.name = nv; toast('Имя изменено на ' + nv); renderCurrentModal(); }
    };
    root.querySelectorAll('[data-hair]').forEach(el => el.onclick = () => { p.appearance.hair = el.dataset.hair; renderCurrentModal(); });
    root.querySelectorAll('[data-cloak]').forEach(el => el.onclick = () => { p.appearance.cloak = el.dataset.cloak; renderCurrentModal(); });
    root.querySelectorAll('[data-armor]').forEach(el => el.onclick = () => { p.appearance.armor = el.dataset.armor; renderCurrentModal(); });
    root.querySelector('#btnCharToInv').onclick = () => openModal('inventory');
    root.querySelector('#btnCharToSkills').onclick = () => openModal('skills');
    root.querySelector('#btnCharToWeapons').onclick = () => openModal('weapons');
  }

  function drawCharacterPreviewCanvas(canvas, entity) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height * 0.72);
    ctx.scale(2.1, 2.1);
    const clone = Object.assign({}, entity, {
      x: 0, y: 0, facingX: 1, mountedId: null, state: 'idle',
      isPlayer: false, hideNameplate: true, showAura: true
    });
    window.Sprites.drawCharacter(ctx, clone, performance.now() * 0.001);
    ctx.restore();
  }

  // =========================================================================
  // 3. INVENTORY (Paper-Doll + Drag&Drop + Filter + Upgrade + Split + Storage)
  // =========================================================================
  function renderSlotHtml(item, extraAttrs, placeholderIconKey) {
    if (!item) {
      return `<div class="item-slot" ${extraAttrs}>${placeholderIconKey ? px(placeholderIconKey, 'slot-placeholder-img', 28) : ''}</div>`;
    }
    const ico = window.Sprites.getItemIcon(item);
    const tierCol = item.tier && window.GameData.TIERS[item.tier] ? window.GameData.TIERS[item.tier].color : null;
    const eLv = item.enchantLv || 0;
    const eCol = eLv > 0 && window.GameData.ENCHANT_LEVELS[eLv] ? window.GameData.ENCHANT_LEVELS[eLv].color : '#4ade80';
    const dotsHtml = eLv > 0
      ? `<span class="slot-ench-dots">${Array.from({ length: eLv }).map(() => `<span class="slot-ench-dot" style="background:${eCol};color:${eCol};"></span>`).join('')}</span>`
      : '';
    return `
      <div class="item-slot rarity-${item.rarity || 'common'}" ${extraAttrs} title="${esc(item.name)}">
        <img src="${ico}" alt="" />
        ${item.enhance > 0 ? `<span class="slot-enh">+${item.enhance}</span>` : ''}
        ${dotsHtml}
        ${tierCol ? `<span class="slot-tier" style="color:${tierCol};">T${item.tier}</span>` : ''}
        ${item.stackable && item.qty > 1 ? `<span class="slot-qty">${item.qty}</span>` : ''}
      </div>`;
  }

  function renderInventoryModal(root) {
    const p = window.GameState.player;
    const eq = p.equipment;
    const st = window.GameState.computedStats;
    const bag = window.GameState.inventory;

    const leftSlots = ['helmet', 'armor', 'weapon', 'offhand'];
    const rightSlots = ['amulet', 'ring', 'boots', 'artifact'];

    const filtered = bag.filter(it => {
      if (invFilter === 'all') return true;
      return it.category === invFilter;
    });

    root.innerHTML = `
      <div class="inv-layout">
        <div class="paperdoll-box pixel-inset">
          <div class="paperdoll-grid">
            <div class="equip-col">
              ${leftSlots.map(s => renderSlotHtml(eq[s], `data-equip-slot="${s}"`, 'slot_' + s)).join('')}
            </div>
            <div class="paperdoll-center">
              <canvas id="invHeroPreview" width="112" height="128"></canvas>
              <div style="font-size:10px;color:#ffe08a;font-weight:800;">БМ: ${st.power}</div>
            </div>
            <div class="equip-col">
              ${rightSlots.map(s => renderSlotHtml(eq[s], `data-equip-slot="${s}"`, 'slot_' + s)).join('')}
            </div>
          </div>
          <div class="equip-bottom-row">
            ${renderSlotHtml(eq.cloak, `data-equip-slot="cloak"`, 'slot_cloak')}
            <div class="item-slot" id="invTrashSlot" style="border-color:#ef4444;background:#261019;" title="Перетащите сюда чтобы продать">${px('trash', 'px-ico-md', 28)}</div>
          </div>
          <div class="stats-mini-grid">
            <div>${px('weapons')} АТК: <b>${st.atk}</b></div>
            <div>${px('clan')} ЗАЩ: <b>${st.def}</b></div>
            <div>${px('fire')} Крит: <b>${st.crit}%</b></div>
            <div>${px('dash_boot')} Скор: <b>${st.speed}</b></div>
          </div>
        </div>

        <div>
          <div class="tab-strip">
            ${[
              ['all', null, 'Всё'],
              ['weapon', 'weapons', 'Оружие'],
              ['armor', 'slot_armor', 'Броня'],
              ['tool', 'axe_tool', 'Инструм.'],
              ['potion', 'hp_vial', 'Зелья'],
              ['resource', 'loot_gem', 'Ресурсы']
            ].map(t =>
              `<button class="tab-btn ${invFilter===t[0]?'active':''}" data-inv-tab="${t[0]}">${t[1] ? px(t[1]) : ''} ${t[2]}</button>`
            ).join('')}
            <button class="pixel-btn btn-sm btn-blue" style="margin-left:auto;" id="btnOpenStorageFromInv">${px('storage')} Склад (${window.GameState.storage.length}/40)</button>
          </div>
          <div class="bag-grid pixel-inset" id="invBagGrid">
            ${filtered.map(it => renderSlotHtml(it, `data-bag-uid="${it.uid}"`)).join('')}
            ${Array.from({ length: Math.max(0, 24 - filtered.length) }).map(() => `<div class="item-slot"></div>`).join('')}
          </div>
          <div class="inv-footer-bar">
            <div style="font-weight:800;color:#ffe08a;">${px('coin')} ${p.gold.toLocaleString()} | Сумка: ${bag.length} / 60</div>
            <div style="display:flex;gap:5px;">
              <button class="pixel-btn btn-sm btn-dark" id="btnSortBag">${px('sort')} Сорт.</button>
              <button class="pixel-btn btn-sm btn-gold" id="btnSellJunk">${px('coin')} Продать обычные</button>
            </div>
          </div>
          <div style="font-size:10px;color:#8fa2cc;margin-top:4px;">Нажмите на предмет для действий (Надеть, Заточить, Зачаровать .1–.4, Наложить чары) или перетащите на слот экипировки.</div>
        </div>
      </div>`;

    drawCharacterPreviewCanvas(document.getElementById('invHeroPreview'), p);

    root.querySelectorAll('[data-inv-tab]').forEach(b => {
      b.onclick = () => { invFilter = b.dataset.invTab; renderCurrentModal(); };
    });
    root.querySelector('#btnOpenStorageFromInv').onclick = () => openModal('storage');
    root.querySelector('#btnSortBag').onclick = () => {
      const order = { weapon: 1, armor: 2, tool: 3, potion: 4, resource: 5 };
      bag.sort((a, b) => (order[a.category] || 9) - (order[b.category] || 9) || (b.tier || 0) - (a.tier || 0) || (b.price || 0) - (a.price || 0));
      renderCurrentModal();
    };
    root.querySelector('#btnSellJunk').onclick = () => {
      let earned = 0, sold = 0;
      for (let i = bag.length - 1; i >= 0; i--) {
        if (bag[i].rarity === 'common' && (bag[i].category === 'weapon' || bag[i].category === 'armor')) {
          earned += window.MMO.getSellPrice(bag[i]);
          bag.splice(i, 1);
          sold++;
        }
      }
      if (sold > 0) {
        p.gold += earned;
        toast('Продано ' + sold + ' обычных вещей за ' + earned + ' золота!');
        renderCurrentModal();
      } else {
        toast('Нет обычной экипировки для быстрой продажи.');
      }
    };

    root.querySelectorAll('[data-equip-slot]').forEach(el => {
      el.onclick = () => {
        const sId = el.dataset.equipSlot;
        const item = eq[sId];
        if (item) openItemInspector(item, { fromEquip: sId });
      };
    });

    root.querySelectorAll('[data-bag-uid]').forEach(el => {
      const uid = el.dataset.bagUid;
      el.onpointerdown = e => {
        const startX = e.clientX, startY = e.clientY;
        let dragging = false;
        const item = bag.find(x => x.uid === uid);
        if (!item) return;
        const ghost = document.getElementById('dragGhost');

        const onMove = mv => {
          if (!dragging && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 10) {
            dragging = true;
            ghost.innerHTML = `<img src="${window.Sprites.getItemIcon(item)}" />`;
            ghost.classList.remove('hidden');
          }
          if (dragging) {
            ghost.style.left = (mv.clientX - 24) + 'px';
            ghost.style.top = (mv.clientY - 24) + 'px';
          }
        };
        const onUp = up => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          ghost.classList.add('hidden');
          if (!dragging) {
            openItemInspector(item, { fromBag: true });
            return;
          }
          const target = document.elementFromPoint(up.clientX, up.clientY);
          const slotEl = target && target.closest('[data-equip-slot], [data-bag-uid], #invTrashSlot');
          if (!slotEl) return;
          if (slotEl.id === 'invTrashSlot') {
            const sellVal = window.MMO.getSellPrice(item);
            const idx = bag.findIndex(x => x.uid === uid);
            if (idx !== -1) {
              bag.splice(idx, 1);
              p.gold += sellVal;
              toast('Продано по рынку: ' + item.name + ' (+' + sellVal + ' золота)');
              renderCurrentModal();
            }
          } else if (slotEl.dataset.equipSlot) {
            if (item.slot === slotEl.dataset.equipSlot) {
              window.MMO.equipItem(uid);
              renderCurrentModal();
            } else {
              toast('Этот предмет не подходит для данного слота!');
            }
          } else if (slotEl.dataset.bagUid && slotEl.dataset.bagUid !== uid) {
            const i1 = bag.findIndex(x => x.uid === uid);
            const i2 = bag.findIndex(x => x.uid === slotEl.dataset.bagUid);
            if (i1 !== -1 && i2 !== -1) {
              const tmp = bag[i1]; bag[i1] = bag[i2]; bag[i2] = tmp;
              renderCurrentModal();
            }
          }
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      };
    });
  }

  function openItemInspector(item, ctx) {
    const rar = window.GameData.RARITIES[item.rarity] || window.GameData.RARITIES.common;
    const tInfo = item.tier ? window.GameData.TIERS[item.tier] : null;
    const eLv = item.enchantLv || 0;
    const eInfo = window.GameData.ENCHANT_LEVELS[eLv] || window.GameData.ENCHANT_LEVELS[0];
    const nextE = eLv < 4 ? window.GameData.ENCHANT_LEVELS[eLv + 1] : null;
    const nextEGold = nextE ? Math.round(nextE.goldBase * (1 + ((item.tier || 1) - 1) * 0.65)) : 0;
    const nextECatName = nextE ? (window.GameData.CONSUMABLES[nextE.catalyst]?.name || nextE.catalyst) : '';
    const affix = item.enchantAffix ? window.GameData.ENCHANT_AFFIXES[item.enchantAffix] : null;
    const affixGold = Math.round(250 * (item.tier || 1));

    const statsList = [];
    if (item.stats) {
      if (item.stats.atk) statsList.push(px('weapons') + ' Атака: +' + item.stats.atk);
      if (item.stats.def) statsList.push(px('clan') + ' Защита: +' + item.stats.def);
      if (item.stats.hp)  statsList.push(px('heart') + ' HP: +' + item.stats.hp);
      if (item.stats.mp)  statsList.push(px('mp_vial') + ' MP: +' + item.stats.mp);
      if (item.stats.crit)statsList.push(px('fire') + ' Крит: +' + item.stats.crit + '%');
      if (item.stats.spd) statsList.push(px('dash_boot') + ' Скорость: +' + item.stats.spd);
      if (item.stats.range) statsList.push(px('bolt') + ' Дальность: ' + item.stats.range);
    }
    const wSpells = (item.category === 'weapon' && item.weaponType && window.GameData.WEAPON_SPELLS[item.weaponType]) || [];
    const sellPrice = window.MMO.getSellPrice(item);
    const marketVal = window.MMO.getMarketPrice(item);
    const mGroup = window.MMO.getItemMarketGroup(item);
    const demand = window.MMO.getDemandLabel(mGroup);
    const regBonus = window.MMO.getCurrentBiomeBonus(mGroup);
    const nextEnh = (item.enhance || 0) + 1;
    const enhGold = 120 * nextEnh * (item.tier || 1);
    const enhStones = Math.max(1, Math.ceil(nextEnh / 2));
    const isGear = item.category === 'weapon' || item.category === 'armor';

    const html = `
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
        <div class="item-slot rarity-${item.rarity}" style="width:58px;height:58px;">
          <img src="${window.Sprites.getItemIcon(item)}" style="width:48px;height:48px;" />
          ${tInfo ? `<span class="slot-tier" style="color:${tInfo.color};">T${item.tier}</span>` : ''}
        </div>
        <div>
          <div class="text-${item.rarity}" style="font-size:14px;font-weight:900;">${esc(item.name)} ${item.enhance > 0 ? '+' + item.enhance : ''}</div>
          <div style="font-size:11px;color:#b7c7eb;">
            ${rar.name}
            ${tInfo ? `• <b style="color:${tInfo.color};">Тир T${item.tier} (${tInfo.name})</b>` : ''}
            ${eLv > 0 ? `• <b style="color:${eInfo.color};">Чары .${eLv} (${eInfo.name})</b>` : ''}
            ${item.stackable ? '• Кол-во: ' + item.qty : ''}
          </div>
          <div style="font-size:11px;color:#ffe08a;">Скупка: ${px('coin')} ${sellPrice} (рынок ~${marketVal}, <span style="color:${demand.color};">${demand.text}</span>)${regBonus.pct > 0 ? ` <span style="color:#4ade80;">+${Math.round(regBonus.pct * 100)}% биом!</span>` : ''}</div>
        </div>
      </div>
      <div class="pixel-inset" style="padding:8px;margin-bottom:8px;">
        <div style="color:#d6e2ff;margin-bottom:4px;">${esc(item.desc || '')}</div>
        ${statsList.map(s => `<div style="color:#6ee7a8;font-weight:700;">${s}</div>`).join('')}
        ${affix ? `<div style="margin-top:6px;padding:5px 7px;border-radius:4px;background:rgba(139,66,230,0.18);border:1px solid ${affix.color};">
          <div style="font-weight:900;color:${affix.color};">${px('scroll')} Магические чары: ${esc(affix.name)}</div>
          <div style="font-size:10px;color:#e2ebff;">${esc(affix.desc)}</div>
        </div>` : ''}
        ${wSpells.length > 0 ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.12);">
          <div style="font-weight:900;color:#fbbf24;font-size:11px;margin-bottom:4px;">Уникальные заклинания оружия (Слоты 1 и 2):</div>
          ${wSpells.map((sp, i) => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <img class="px-ico px-ico-md" style="border:1px solid #fbbf24;border-radius:3px;" src="${window.PixelIcons.skillIcon(sp.id, 28)}" alt="" />
              <div>
                <div style="font-weight:800;font-size:11px;color:#ffe08a;">[${i + 1}] ${esc(sp.name)} <span style="color:#7cc0ff;font-weight:600;">(${sp.mp} MP, ${sp.cd}с)</span></div>
                <div style="font-size:10px;color:#b7c7eb;">${esc(sp.desc)}</div>
              </div>
            </div>`).join('')}
        </div>` : ''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${ctx.fromEquip ? `<button class="pixel-btn btn-blue" id="actUnequip">Снять</button>` : ''}
        ${ctx.fromBag && item.slot ? `<button class="pixel-btn btn-green" id="actEquip">${px('weapons')} Надеть</button>` : ''}
        ${ctx.fromBag && item.category === 'potion' ? `<button class="pixel-btn btn-green" id="actUse">${px('hp_vial')} Использовать</button>` : ''}
        ${isGear ? `<button class="pixel-btn btn-gold" id="actEnhance">${px('skills')} Заточить +${nextEnh} (${enhGold} зол., ${enhStones} кам.)</button>` : ''}
        ${isGear && nextE ? `<button class="pixel-btn btn-purple" id="actEnchantLv">${px('enchant')} Зачаровать .${eLv + 1} (${nextEGold} зол., ${nextECatName} x${nextE.qty})</button>` : ''}
        ${isGear ? `<button class="pixel-btn btn-blue" id="actEnchantAffix">${px('scroll')} ${affix ? 'Перечаровать' : 'Наложить чары'} (${affixGold} зол., 1 Свиток)</button>` : ''}
        ${ctx.fromBag && item.stackable && item.qty > 1 ? `<button class="pixel-btn btn-blue" id="actSplit">${px('split')} Разделить</button>` : ''}
        ${ctx.fromBag ? `<button class="pixel-btn btn-purple" id="actToStorage">${px('storage')} На склад</button>` : ''}
        ${ctx.fromBag ? `<button class="pixel-btn btn-gold" id="actToAuction">${px('auction')} На аукцион</button>` : ''}
        ${ctx.fromBag ? `<button class="pixel-btn btn-dark" id="actSell">${px('coin')} Продать (+${sellPrice})</button>` : ''}
        ${ctx.fromBag ? `<button class="pixel-btn btn-crimson" id="actDrop">${px('trash')} Выбросить</button>` : ''}
      </div>`;

    openSubModal('scale', item.name, html, root => {
      const bind = (sel, fn) => { const el = root.querySelector(sel); if (el) el.onclick = fn; };
      bind('#actUnequip', () => { window.MMO.unequipSlot(ctx.fromEquip); closeSubModal(); renderCurrentModal(); });
      bind('#actEquip', () => { window.MMO.equipItem(item.uid); closeSubModal(); renderCurrentModal(); });
      bind('#actUse', () => { window.MMO.useConsumable(item.uid); closeSubModal(); renderCurrentModal(); });
      bind('#actEnhance', () => { window.MMO.enhanceItem(item); openItemInspector(item, ctx); renderCurrentModal(); });
      bind('#actEnchantLv', () => { if (window.MMO.enchantItemLevel(item)) { openItemInspector(item, ctx); renderCurrentModal(); } });
      bind('#actEnchantAffix', () => { if (window.MMO.applyEnchantAffix(item)) { openItemInspector(item, ctx); renderCurrentModal(); } });
      bind('#actSplit', () => {
        window.MMO.splitStack(item.uid, Math.floor(item.qty / 2));
        closeSubModal(); renderCurrentModal();
      });
      bind('#actToStorage', () => {
        const bag = window.GameState.inventory;
        const idx = bag.findIndex(x => x.uid === item.uid);
        if (idx !== -1 && window.MMO.addItemToBag(item, window.GameState.storage, 40)) {
          bag.splice(idx, 1);
          toast('Перемещено на Склад.');
          closeSubModal(); renderCurrentModal();
        } else toast('Склад переполнен!');
      });
      bind('#actToAuction', () => {
        const askPrice = Math.round(marketVal * 1.12);
        window.MMO.listPlayerItemOnAuction(item.uid, askPrice);
        closeSubModal(); renderCurrentModal();
      });
      bind('#actSell', () => {
        const bag = window.GameState.inventory;
        const idx = bag.findIndex(x => x.uid === item.uid);
        if (idx !== -1) {
          bag.splice(idx, 1);
          window.GameState.player.gold += sellPrice;
          toast('Продано за ' + sellPrice + ' золота!');
          closeSubModal(); renderCurrentModal();
        }
      });
      bind('#actDrop', () => {
        const bag = window.GameState.inventory;
        const idx = bag.findIndex(x => x.uid === item.uid);
        if (idx !== -1) {
          bag.splice(idx, 1);
          toast('Предмет выброшен.');
          closeSubModal(); renderCurrentModal();
        }
      });
    });
  }

  // =========================================================================
  // 4. ALL 23 WEAPONS ARSENAL (TIERS T1–T8, UNIQUE SPELLS & RESOURCE FORGING)
  // =========================================================================
  function renderWeaponsCatalog(root) {
    const p = window.GameState.player;
    const t = Math.max(1, Math.min(8, weaponTierFilter || 1));
    const tInfo = window.GameData.TIERS[t];
    const woodKey = 'wood_t' + t;
    const oreKey = 'ore_t' + t;
    const needWood = t >= 4 ? (t - 2) * 3 : 0;
    const needOre = t >= 4 ? (t - 2) * 3 : 0;
    const haveWood = needWood > 0 ? window.MMO.countTemplateInBag(woodKey) : 0;
    const haveOre = needOre > 0 ? window.MMO.countTemplateInBag(oreKey) : 0;
    const woodName = window.GameData.CONSUMABLES[woodKey]?.name || woodKey;
    const oreName = window.GameData.CONSUMABLES[oreKey]?.name || oreKey;

    root.innerHTML = `
      <div class="tab-strip" style="margin-bottom:6px;">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
          const ti = window.GameData.TIERS[n];
          return `<button class="tab-btn ${t === n ? 'active' : ''}" data-wtier="${n}" style="${t !== n ? 'color:' + ti.color : ''}">T${n}</button>`;
        }).join('')}
        <div style="margin-left:auto;font-weight:800;color:#ffe08a;">${px('coin')} ${p.gold.toLocaleString()}</div>
      </div>
      <div class="pixel-inset" style="padding:6px 9px;margin-bottom:8px;font-size:11px;color:#b7c7eb;">
        <b style="color:${tInfo.color};">Тир T${t} (${tInfo.name})</b> • Множитель характеристик: <b>x${tInfo.statMult.toFixed(2)}</b> •
        ${t >= 4
          ? `Ковка требует: <span style="color:${haveWood >= needWood ? '#6ee7a8' : '#ff8090'};">${woodName} ${haveWood}/${needWood}</span> и <span style="color:${haveOre >= needOre ? '#6ee7a8' : '#ff8090'};">${oreName} ${haveOre}/${needOre}</span> + золото!`
          : 'Доступно для прямой покупки за золото. У каждого из 23 видов оружия свои 2 уникальных заклинания!'}
      </div>
      <div class="list-stack" style="max-height:295px;">
        ${window.GameData.WEAPON_TYPES.map(w => {
          const rar = t >= 7 ? 'legendary' : (t >= 5 ? 'epic' : (t >= 3 ? 'rare' : (t === 2 ? 'uncommon' : 'common')));
          const sample = window.GameData.createWeaponItem(w.id, rar, Math.max(tInfo.minLv, p.level), 0, t, 0);
          const cost = Math.round(sample.price * 1.15);
          const sp = window.GameData.WEAPON_SPELLS[w.id] || [];
          const canMats = t < 4 || (haveWood >= needWood && haveOre >= needOre);
          return `
            <div class="list-row">
              <div class="list-row-left">
                <div class="item-slot rarity-${rar}">
                  <img src="${window.Sprites.getItemIcon(sample)}" />
                  <span class="slot-tier" style="color:${tInfo.color};">T${t}</span>
                </div>
                <div>
                  <div class="list-row-title text-${rar}">${w.num}. [T${t}] ${esc(w.name)}</div>
                  <div class="list-row-sub">АТК: <b>${sample.stats.atk}</b> • Крит: ${sample.stats.crit}% • Дальн: ${w.range}</div>
                  ${sp.length >= 2 ? `<div class="list-row-sub" style="color:#fde68a;">Заклинания: [1] ${esc(sp[0].name)} • [2] ${esc(sp[1].name)}</div>` : ''}
                </div>
              </div>
              <button class="pixel-btn ${canMats ? 'btn-gold' : 'btn-dark'} btn-sm" data-buy-w="${w.id}" data-w-rar="${rar}" data-w-cost="${cost}">${t >= 4 ? px('craft') : px('coin')} ${cost.toLocaleString()}</button>
            </div>`;
        }).join('')}
      </div>`;

    root.querySelectorAll('[data-wtier]').forEach(b => {
      b.onclick = () => { weaponTierFilter = Number(b.dataset.wtier); renderCurrentModal(); };
    });
    root.querySelectorAll('[data-buy-w]').forEach(btn => {
      btn.onclick = () => {
        const cost = Number(btn.dataset.wCost);
        if (p.gold < cost) { toast('Не хватает золота (' + cost.toLocaleString() + ')!'); return; }
        if (t >= 4) {
          if (window.MMO.countTemplateInBag(woodKey) < needWood) { toast('Не хватает: ' + woodName + ' x' + needWood + '!'); return; }
          if (window.MMO.countTemplateInBag(oreKey) < needOre) { toast('Не хватает: ' + oreName + ' x' + needOre + '!'); return; }
        }
        const item = window.GameData.createWeaponItem(btn.dataset.buyW, btn.dataset.wRar, Math.max(tInfo.minLv, p.level), 0, t, 0);
        if (!window.MMO.addItemToBag(item)) { toast('Инвентарь полон!'); return; }
        p.gold -= cost;
        if (t >= 4) {
          window.MMO.consumeTemplateFromBag(woodKey, needWood);
          window.MMO.consumeTemplateFromBag(oreKey, needOre);
        }
        window.MMO.equipItem(item.uid);
        toast('Выковано и экипировано: ' + item.name + '!');
        renderCurrentModal();
      };
    });
  }

  // =========================================================================
  // 5. MOUNTS (12 Types with Live Animated Preview Canvas)
  // =========================================================================
  function renderMountsModal(root) {
    const p = window.GameState.player;
    const unlocked = window.GameState.unlockedMounts;
    const m = window.GameData.MOUNT_BY_ID[selectedMountId] || window.GameData.MOUNTS[0];
    const isOwned = unlocked.includes(m.id);
    const isActive = p.mountedId === m.id;
    const rar = window.GameData.RARITIES[m.rarity];

    root.innerHTML = `
      <div class="mounts-layout">
        <div class="mount-preview-card pixel-inset">
          <canvas id="mountPreviewCanvas" width="180" height="128"></canvas>
          <div class="text-${m.rarity}" style="font-size:15px;font-weight:900;">${esc(m.name)}</div>
          <div style="font-size:11px;color:${rar.color};font-weight:700;">${rar.name}</div>
          <div style="font-size:11px;color:#b7c7eb;">${esc(m.desc)}</div>
          <div class="stats-mini-grid" style="width:100%;">
            <div>${px('dash_boot')} Скор: <b>+${m.speedBonus}</b></div>
            <div>${px('heart')} HP: <b>+${m.bonusHp}</b></div>
            <div>${px('weapons')} АТК: <b>+${m.bonusAtk}</b></div>
            <div>${px('coin')} Цена: <b>${m.price}</b></div>
          </div>
          ${isOwned
            ? `<button class="pixel-btn ${isActive ? 'btn-crimson' : 'btn-blue'}" style="width:100%;" id="btnMountAction">${px('mounts')} ${isActive ? 'Спешиться' : 'Использовать'}</button>`
            : `<button class="pixel-btn btn-green" style="width:100%;" id="btnBuyMount">${px('coin')} Приручить за ${m.price}</button>`}
        </div>
        <div class="mounts-grid">
          ${window.GameData.MOUNTS.map(mt => {
            const own = unlocked.includes(mt.id);
            return `
              <div class="mount-tile rarity-${mt.rarity} ${own ? '' : 'locked'} ${mt.id === m.id ? 'active-mount' : ''}" data-mount-id="${mt.id}">
                <canvas class="mount-mini-cvs" data-mid="${mt.id}" width="64" height="48"></canvas>
                <div class="text-${mt.rarity}">${esc(mt.name)}</div>
                <div style="font-size:9px;color:${own ? '#6ee7a8' : '#fbbf24'};">${own ? (p.mountedId === mt.id ? 'Активен' : 'Открыт') : mt.price + ' зол.'}</div>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    const prevCvs = document.getElementById('mountPreviewCanvas');
    if (prevCvs) {
      const ctx = prevCvs.getContext('2d');
      ctx.clearRect(0, 0, prevCvs.width, prevCvs.height);
      ctx.save();
      ctx.translate(90, 92);
      ctx.scale(2.0, 2.0);
      const clone = Object.assign({}, p, {
        x: 0, y: 0, facingX: 1, mountedId: m.id, state: 'walk',
        isPlayer: false, hideNameplate: true, showAura: true
      });
      window.Sprites.drawCharacter(ctx, clone, performance.now() * 0.001);
      ctx.restore();
    }

    root.querySelectorAll('.mount-mini-cvs').forEach(c => {
      const ctx = c.getContext('2d');
      ctx.save();
      ctx.translate(32, 30);
      ctx.scale(0.82, 0.82);
      window.Sprites.drawMount(ctx, c.dataset.mid, 1, 0.5, false);
      ctx.restore();
    });

    root.querySelectorAll('[data-mount-id]').forEach(tile => {
      tile.onclick = () => { selectedMountId = tile.dataset.mountId; renderCurrentModal(); };
    });

    const actBtn = root.querySelector('#btnMountAction');
    if (actBtn) {
      actBtn.onclick = () => {
        p.mountedId = isActive ? null : m.id;
        p.selectedMountId = m.id;
        window.GameState.recalcStats();
        toast(p.mountedId ? 'Призван: ' + m.name + '!' : 'Вы спешились.');
        renderCurrentModal();
      };
    }
    const buyBtn = root.querySelector('#btnBuyMount');
    if (buyBtn) {
      buyBtn.onclick = () => {
        if (p.gold < m.price) { toast('Не хватает золота (' + m.price + ')!'); return; }
        p.gold -= m.price;
        unlocked.push(m.id);
        p.mountedId = m.id;
        p.selectedMountId = m.id;
        window.GameState.recalcStats();
        toast('Маунт «' + m.name + '» получен и призван!');
        renderCurrentModal();
      };
    }
  }

  // =========================================================================
  // 6. SKILL TREE (3 Branches, Custom Pixel-Art Skill Icons)
  // =========================================================================
  function renderSkillsModal(root) {
    const p = window.GameState.player;
    const brIcons = { warrior: 'branch_warrior', mage: 'branch_mage', assassin: 'branch_assassin' };
    const eqW = p.equipment && p.equipment.weapon;
    const wType = (eqW && eqW.weaponType) || 'sword';
    const wInfo = window.GameData.WEAPON_BY_ID[wType];
    const wSpells = (window.GameData.WEAPON_SPELLS && window.GameData.WEAPON_SPELLS[wType]) || [];
    const wMast = (window.GameState.mastery && window.GameState.mastery.weapons[wType]?.lv) || 1;

    root.innerHTML = `
      <div class="weapon-spell-banner pixel-inset">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;flex-wrap:wrap;gap:6px;">
          <div style="font-weight:900;color:#fbbf24;font-size:12px;">${px('weapons')} Заклинания оружия «${esc(wInfo?.name || 'Меч')}» (Слоты 1 и 2 — меняются при смене оружия)</div>
          <div style="font-size:10px;color:#fde68a;">Мастерство: <b>Ур.${wMast}</b> (+${Math.round((wMast - 1) * 3.5)}% АТК)</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px;">
          ${wSpells.map((sp, idx) => `
            <div style="display:flex;align-items:center;gap:7px;background:rgba(10,15,30,0.65);padding:5px 7px;border-radius:4px;border:1px solid #d9a742;">
              <img class="px-ico px-ico-lg" style="border:1px solid #fbbf24;border-radius:4px;" src="${window.PixelIcons.skillIcon(sp.id, 36)}" alt="" />
              <div>
                <div style="font-weight:900;font-size:11px;color:#ffe08a;">Слот ${idx + 1}: ${esc(sp.name)}</div>
                <div style="font-size:9px;color:#7cc0ff;">${sp.mp} MP • Перезарядка ${sp.cd}с</div>
                <div style="font-size:10px;color:#d6e2ff;">${esc(sp.desc)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <div style="font-weight:800;color:#ffe08a;">Очки навыков: <span style="font-size:16px;color:#4ade80;">${p.skillPoints || 0}</span></div>
        <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:#9fb2db;">
          <span>Классовые слоты (3–5):</span>
          ${p.activeBar.slice(0, 3).map((sid, i) => `<img class="px-ico px-ico-sm" style="border:1px solid #6b83bd;border-radius:3px;" src="${window.PixelIcons.skillIcon(sid, 24)}" title="Слот ${i + 3}" alt="" />`).join('')}
        </div>
      </div>
      <div class="skill-branches">
        ${window.GameData.SKILL_BRANCHES.map(br => `
          <div class="branch-col pixel-inset">
            <div class="branch-title" style="color:${br.color};">${px(brIcons[br.id] || 'skills', 'px-ico-sm', 20)} ${esc(br.name)}</div>
            ${window.GameData.SKILLS.filter(s => s.branch === br.id).map(sk => {
              const lv = (p.skillRanks && p.skillRanks[sk.id]) || 0;
              const inBar = p.activeBar.slice(0, 3).indexOf(sk.id);
              return `
                <div class="skill-card">
                  <div class="skill-card-head">
                    <img class="px-ico px-ico-lg" style="border:1px solid #657db8;border-radius:4px;" src="${window.PixelIcons.skillIcon(sk.id, 36)}" alt="" />
                    <div style="flex:1;">
                      <div style="font-weight:800;font-size:11px;">${esc(sk.name)}</div>
                      <div style="font-size:9px;color:${sk.type==='active'?'#7cc0ff':'#6ee7a8'};">${sk.type==='active'?'Активный ('+sk.mp+' MP, '+sk.cd+'с)':'Пассивный'} • Ур.${lv}/${sk.maxLv}</div>
                    </div>
                  </div>
                  <div style="font-size:10px;color:#b7c7eb;">${esc(sk.desc)}</div>
                  <div style="display:flex;gap:4px;margin-top:3px;">
                    <button class="pixel-btn btn-sm btn-gold" style="flex:1;" data-up-skill="${sk.id}" ${(p.skillPoints <= 0 || lv >= sk.maxLv) ? 'disabled' : ''}>${lv===0?'Изучить':'Улучшить +1'}</button>
                    ${sk.type === 'active' && lv > 0 ? `<button class="pixel-btn btn-sm ${inBar>=0?'btn-green':'btn-blue'}" data-equip-skill="${sk.id}">${inBar>=0 ? 'Слот '+(inBar+3) : 'На панель'}</button>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        `).join('')}
      </div>`;

    root.querySelectorAll('[data-up-skill]').forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.upSkill;
        const sk = window.GameData.SKILL_BY_ID[sid];
        if (!sk || p.skillPoints <= 0) return;
        const cur = p.skillRanks[sid] || 0;
        if (cur >= sk.maxLv) return;
        p.skillPoints -= 1;
        p.skillRanks[sid] = cur + 1;
        if (sk.type === 'active' && !p.activeBar.includes(sid) && p.activeBar.length < 3) {
          p.activeBar.push(sid);
        }
        window.GameState.recalcStats();
        if (window.GameAPI && window.GameAPI.rebuildSkillBar) window.GameAPI.rebuildSkillBar();
        toast('Навык «' + sk.name + '» повышен до ур. ' + (cur + 1) + '!');
        renderCurrentModal();
      };
    });

    root.querySelectorAll('[data-equip-skill]').forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.equipSkill;
        const idx = p.activeBar.indexOf(sid);
        if (idx >= 0) {
          toast('Уже находится в слоте ' + (idx + 3));
        } else {
          if (p.activeBar.length >= 3) p.activeBar.shift();
          p.activeBar.push(sid);
          if (window.GameAPI && window.GameAPI.rebuildSkillBar) window.GameAPI.rebuildSkillBar();
          toast('Навык добавлен в классовый слот!');
          renderCurrentModal();
        }
      };
    });
  }

  // =========================================================================
  // 7. INTERACTIVE WORLD MAP (8000x6000, 10 Biomes + Caravan Trade Bonuses)
  // =========================================================================
  function renderMapModal(root) {
    const grpNames = { ore: 'Руда', herbs: 'Травы', gems: 'Кристаллы', exotic: 'Экзотика', boss: 'Трофеи', gear: 'Снаряж.' };
    root.innerHTML = `
      <div class="world-map-wrap">
        <canvas id="fullMapCanvas" width="480" height="360"></canvas>
        <div class="waypoint-list" style="max-height:330px;overflow-y:auto;">
          <div style="font-weight:800;color:#ffe08a;">${px('bolt')} Телепорт по 10 биомам (8000x6000)</div>
          ${window.World.BIOMES.map(b => {
            const bTag = b.bonusGroup && b.bonusPct ? `+${Math.round(b.bonusPct * 100)}% ${grpNames[b.bonusGroup] || ''}` : (b.safe ? 'Мирная' : 'Бой');
            return `
              <button class="pixel-btn ${b.safe ? 'btn-green' : 'btn-blue'} btn-sm" style="justify-content:space-between;" data-tp="${b.id}">
                <span>${esc(b.name)}</span>
                <span style="font-size:9px;color:#ffe08a;">${bTag}</span>
              </button>`;
          }).join('')}
          <div style="font-size:10px;color:#9fb2db;margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;">
            <span><b style="color:#fde047;">[■]</b> Вы</span>
            <span><b style="color:#22d3ee;">[■]</b> Онлайн</span>
            <span><b style="color:#38bdf8;">[■]</b> Боты (36)</span>
            <span><b style="color:#ef4444;">[■]</b> Боссы</span>
            <span><b style="color:#4ade80;">[■]</b> NPC</span>
          </div>
        </div>
      </div>`;

    const c = document.getElementById('fullMapCanvas');
    if (c) {
      const ctx = c.getContext('2d');
      const sx = c.width / window.World.WIDTH;
      const sy = c.height / window.World.HEIGHT;
      window.World.BIOMES.forEach(b => {
        ctx.fillStyle = b.mapCol;
        ctx.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(b.x * sx + 4, b.y * sy + 4, Math.min(b.w * sx - 8, b.name.length * 5.6 + 8), 14);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(b.name, b.x * sx + 7, b.y * sy + 14);
      });
      ctx.fillStyle = '#4ade80';
      window.World.NPCS.forEach(n => ctx.fillRect(n.x * sx - 3, n.y * sy - 3, 6, 6));
      window.Combat.monsters.forEach(m => {
        if (!m.dead && m.isBoss) {
          ctx.fillStyle = m.isWorldBoss ? '#ef4444' : '#c084fc';
          ctx.beginPath(); ctx.arc(m.x * sx, m.y * sy, 5, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = '#38bdf8';
      window.Bots.list.forEach(b => ctx.fillRect(b.x * sx - 1.5, b.y * sy - 1.5, 3, 3));
      if (window.Multiplayer) {
        ctx.fillStyle = '#22d3ee';
        window.Multiplayer.getRemotePlayers().forEach(rp => {
          ctx.beginPath(); ctx.arc(rp.x * sx, rp.y * sy, 4, 0, Math.PI * 2); ctx.fill();
        });
      }
      if (window.GameState.adminBot && window.GameState.adminBot.owned && window.GameState.adminBot.summoned && window.TelegramStars) {
        const ae = window.TelegramStars.adminEntity;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(ae.x * sx - 2.5, ae.y * sy - 2.5, 5, 5);
      }
      const p = window.GameState.player;
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(p.x * sx, p.y * sy, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    }

    root.querySelectorAll('[data-tp]').forEach(btn => {
      btn.onclick = () => {
        const b = window.World.BIOMES.find(x => x.id === btn.dataset.tp);
        if (!b) return;
        window.GameState.player.x = b.wp.x;
        window.GameState.player.y = b.wp.y;
        window.Combat.addParticles(b.wp.x, b.wp.y, '#38bdf8', 20, 120);
        toast('Телепортация: ' + b.name);
        closeModal();
      };
    });
  }

  // =========================================================================
  // 7B. LIVE ECONOMY MODAL (Resource Exchange, Trade Contracts & Guild Bank)
  // =========================================================================
  function renderEconomyModal(root) {
    const p = window.GameState.player;
    const ec = window.MMO.economy;
    const ev = ec.activeEvent;
    const curBiome = window.World.getBiomeAt(p.x, p.y);
    const bonusGrp = curBiome && curBiome.bonusGroup ? window.MMO.MARKET_GROUPS[curBiome.bonusGroup] : null;
    const bankBal = window.GameState.bankBalance || 0;

    root.innerHTML = `
      <div class="tab-strip">
        <button class="tab-btn ${econTab==='exchange'?'active':''}" data-etab="exchange">${px('coin')} Биржа ресурсов</button>
        <button class="tab-btn ${econTab==='contracts'?'active':''}" data-etab="contracts">${px('quests')} Контракты (${ec.contracts.length})</button>
        <button class="tab-btn ${econTab==='bank'?'active':''}" data-etab="bank">${px('storage')} Банк Гильдии</button>
        <div style="margin-left:auto;font-weight:800;color:#ffe08a;">${px('coin')} ${p.gold.toLocaleString()}</div>
      </div>

      <div class="econ-event-banner pixel-inset">
        <div>
          <div style="font-weight:900;color:#ffe08a;font-size:12px;">${px('bolt')} Событие рынка: ${esc(ev.name)}</div>
          <div style="font-size:10px;color:#dbe7ff;">${esc(ev.desc)}</div>
        </div>
        <div style="text-align:right;font-size:10px;color:#9fb2db;">
          <div>Комиссия аукц.: <b style="color:#4ade80;">${Math.round(ec.auctionFee * 100)}%</b></div>
          <div>Смена через: <b>${Math.ceil(ec.eventTimer)}с</b></div>
        </div>
      </div>

      ${econTab === 'exchange' ? `
        <div class="econ-biome-banner pixel-inset">
          <span>${px('map')} Текущий биом: <b>${esc(curBiome.name)}</b></span>
          <span>${bonusGrp ? `Караванный бонус продажи: <b style="color:#4ade80;">+${Math.round(curBiome.bonusPct * 100)}% на «${esc(bonusGrp.name)}»</b>` : 'Перемещайтесь по биомам для караванных бонусов продажи!'}</span>
        </div>
        <div class="list-stack" style="max-height:260px;">
          ${window.MMO.EXCHANGE_COMMODITIES.map(tid => {
            const q = window.MMO.getExchangeQuote(tid);
            if (!q) return '';
            const sample = window.GameData.createConsumableItem(tid, 1);
            const have = window.MMO.countTemplateInBag(tid);
            const dem = window.MMO.getDemandLabel(q.group.id);
            const trendCls = q.trendPct > 0 ? 'trend-up' : (q.trendPct < 0 ? 'trend-down' : 'trend-flat');
            const trendTxt = (q.trendPct > 0 ? '+' : '') + q.trendPct + '%';
            const bars = q.history.map(v => {
              const h = Math.max(3, Math.min(18, Math.round((v - 0.55) * 16)));
              const col = v >= 1.15 ? '#4ade80' : (v <= 0.88 ? '#f87171' : '#38bdf8');
              return `<span class="spark-bar" style="height:${h}px;background:${col};"></span>`;
            }).join('');
            return `
              <div class="list-row">
                <div class="list-row-left">
                  <div class="item-slot rarity-${q.tpl.rarity}"><img src="${window.Sprites.getItemIcon(sample)}" />${have > 0 ? `<span class="slot-qty">${have}</span>` : ''}</div>
                  <div>
                    <div class="list-row-title text-${q.tpl.rarity}">
                      ${esc(q.tpl.name)}
                      <span class="trend-pill ${trendCls}">${trendTxt}</span>
                      <span style="font-size:9px;color:${dem.color};margin-left:3px;">${dem.text}</span>
                      ${q.regionalBonusPct > 0 ? `<span class="trend-pill trend-up">+${q.regionalBonusPct}% биом</span>` : ''}
                    </div>
                    <div class="list-row-sub">
                      Покупка: <b style="color:#fbbf24;">${q.buyPrice}</b> • Скупка: <b style="color:#4ade80;">${q.sellPrice}</b> • В сумке: <b>${have}</b>
                    </div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
                  <div class="sparkline-bars" title="История курса">${bars}</div>
                  <button class="pixel-btn btn-sm btn-blue" data-ex-buy="${tid}" data-qty="1">+1</button>
                  <button class="pixel-btn btn-sm btn-blue" data-ex-buy="${tid}" data-qty="5">+5</button>
                  <button class="pixel-btn btn-sm btn-green" data-ex-sell="${tid}" data-qty="1" ${have<=0?'disabled':''}>-1</button>
                  <button class="pixel-btn btn-sm btn-gold" data-ex-sell="${tid}" data-qty="all" ${have<=0?'disabled':''}>Всё</button>
                </div>
              </div>`;
          }).join('')}
        </div>
      ` : econTab === 'contracts' ? `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <span style="font-size:11px;color:#b7c7eb;">Срочные торговые контракты гильдий платят <b>в 1.35x–1.55x выше рынка</b> + опыт и камень заточки!</span>
          <button class="pixel-btn btn-sm btn-blue" id="btnRefreshContracts">${px('sort')} Обновить (40 зол.)</button>
        </div>
        <div class="list-stack" style="max-height:260px;">
          ${ec.contracts.map(c => {
            const have = window.MMO.countTemplateInBag(c.templateId);
            const ok = have >= c.qty;
            const sample = window.GameData.createConsumableItem(c.templateId, 1);
            return `
              <div class="list-row" style="${ok ? 'border-color:#4ade80;' : ''}">
                <div class="list-row-left">
                  <div class="item-slot rarity-${sample.rarity}"><img src="${window.Sprites.getItemIcon(sample)}" /><span class="slot-qty">${c.qty}</span></div>
                  <div>
                    <div class="list-row-title">${esc(c.patron)}: поставить ${esc(c.itemName)} x${c.qty}</div>
                    <div class="list-row-sub">
                      В сумке: <b style="color:${ok?'#4ade80':'#f87171'};">${have} / ${c.qty}</b> •
                      Награда: <b style="color:#ffe08a;">${c.rewardGold} зол.</b> + <b style="color:#7cc0ff;">${c.rewardXp} XP</b> + бонус камень
                    </div>
                  </div>
                </div>
                <button class="pixel-btn btn-sm ${ok ? 'btn-green' : 'btn-dark'}" data-ctr-id="${c.id}" ${ok ? '' : 'disabled'}>${ok ? 'Сдать' : 'Мало'}</button>
              </div>`;
          }).join('')}
        </div>
      ` : `
        <div class="pixel-inset" style="padding:12px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-size:11px;color:#9fb2db;">Ваш вклад в Банке Гильдии</div>
              <div style="font-size:22px;font-weight:900;color:#ffe08a;">${px('coin', 'px-ico-md', 24)} ${bankBal.toLocaleString()} золота</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:#4ade80;font-weight:800;">Доходность: +2.0% каждые 120 сек (макс. 650 зол.)</div>
              <div style="font-size:11px;color:#b7c7eb;">Следующая выплата: <b>${bankBal > 0 ? Math.ceil(ec.bankTimer) + 'с (+' + Math.min(650, Math.max(4, Math.round(bankBal * 0.02))) + ' зол.)' : 'внесите вклад'}</b></div>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-green" data-bank-dep="100">Внести +100</button>
            <button class="pixel-btn btn-green" data-bank-dep="500">Внести +500</button>
            <button class="pixel-btn btn-gold" data-bank-dep="${Math.floor(p.gold / 2)}">Внести 50%</button>
            <button class="pixel-btn btn-blue" data-bank-wd="500" ${bankBal<=0?'disabled':''}>Снять 500</button>
            <button class="pixel-btn btn-crimson" data-bank-wd="all" ${bankBal<=0?'disabled':''}>Снять всё</button>
          </div>
          <div style="font-size:10px;color:#8fa2cc;">Золото в Банке надёжно хранится в сохранении и приносит пассивный доход пока вы исследуете мир и сражаетесь с боссами.</div>
        </div>
      `}`;

    root.querySelectorAll('[data-etab]').forEach(b => b.onclick = () => { econTab = b.dataset.etab; renderCurrentModal(); });
    root.querySelectorAll('[data-ex-buy]').forEach(b => b.onclick = () => {
      if (window.MMO.exchangeBuy(b.dataset.exBuy, Number(b.dataset.qty))) renderCurrentModal();
    });
    root.querySelectorAll('[data-ex-sell]').forEach(b => b.onclick = () => {
      const q = b.dataset.qty === 'all' ? 'all' : Number(b.dataset.qty);
      if (window.MMO.exchangeSell(b.dataset.exSell, q)) renderCurrentModal();
    });
    const refBtn = root.querySelector('#btnRefreshContracts');
    if (refBtn) refBtn.onclick = () => { if (window.MMO.refreshContracts()) renderCurrentModal(); };
    root.querySelectorAll('[data-ctr-id]').forEach(b => b.onclick = () => {
      if (window.MMO.completeContract(b.dataset.ctrId)) renderCurrentModal();
    });
    root.querySelectorAll('[data-bank-dep]').forEach(b => b.onclick = () => {
      if (window.MMO.bankDeposit(Number(b.dataset.bankDep))) renderCurrentModal();
    });
    root.querySelectorAll('[data-bank-wd]').forEach(b => b.onclick = () => {
      const v = b.dataset.bankWd === 'all' ? 'all' : Number(b.dataset.bankWd);
      if (window.MMO.bankWithdraw(v)) renderCurrentModal();
    });
  }

  // =========================================================================
  // 7B. DEDICATED COIN BANK VAULT (100% Protected from Death 20% Coin Loss!)
  // =========================================================================
  function renderBankModal(root) {
    const p = window.GameState.player;
    const ec = window.MMO.economy;
    const bankBal = Math.floor(window.GameState.bankBalance || 0);
    const handGold = Math.floor(p.gold || 0);
    const riskLoss = Math.floor(handGold * 0.20);
    const hist = window.MMO.bankHistory || [];

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;max-width:540px;margin:auto;">
        <div class="pixel-inset" style="padding:12px;border-color:#4ade80;background:rgba(16,42,36,0.75);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:11px;color:#86efac;font-weight:800;">${px('storage')} В БАНКЕ МОНЕТ (ЗАЩИЩЕНО 100%)</div>
              <div style="font-size:24px;font-weight:900;color:#ffe08a;">${px('coin', 'px-ico-md', 24)} ${bankBal.toLocaleString()}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:#9fb2db;">На руках: <b style="color:#ffe08a;">${handGold.toLocaleString()}</b></div>
              <div style="font-size:10px;color:#f87171;">Риск при смерти (-20% с рук): <b>-${riskLoss.toLocaleString()} монет</b></div>
              <div style="font-size:10px;color:#4ade80;">Процент: +2% каждые 120с (${bankBal > 0 ? Math.ceil(ec.bankTimer) + 'с' : 'внесите монеты'})</div>
            </div>
          </div>
          <div style="font-size:11px;color:#d1fae5;margin-top:8px;padding-top:6px;border-top:1px solid rgba(74,222,128,0.25);">
            При смерти в PvP или от монстров вы теряете все вещи и 20% монет с рук, но <b>монеты в Банке НЕ теряются никогда</b>.
          </div>
        </div>

        <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:8px;">
          <div style="font-weight:800;color:#6ee7a8;">Положить монеты в Банк:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-sm btn-green" data-cb-dep="100">+100</button>
            <button class="pixel-btn btn-sm btn-green" data-cb-dep="500">+500</button>
            <button class="pixel-btn btn-sm btn-blue" data-cb-dep="${Math.floor(handGold * 0.25)}">25%</button>
            <button class="pixel-btn btn-sm btn-blue" data-cb-dep="${Math.floor(handGold * 0.50)}">50%</button>
            <button class="pixel-btn btn-sm btn-gold" data-cb-dep="all">Положить ВСЁ</button>
          </div>
          <div style="display:flex;gap:6px;">
            <input type="number" id="cbDepInput" class="modal-input" style="flex:1;padding:6px;" min="1" max="${handGold}" placeholder="Своя сумма..." />
            <button class="pixel-btn btn-sm btn-green" id="btnCbDepCustom">Внести</button>
          </div>
        </div>

        <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:8px;">
          <div style="font-weight:800;color:#7cc0ff;">Снять монеты из Банка:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-sm btn-blue" data-cb-wd="100" ${bankBal<=0?'disabled':''}>-100</button>
            <button class="pixel-btn btn-sm btn-blue" data-cb-wd="500" ${bankBal<=0?'disabled':''}>-500</button>
            <button class="pixel-btn btn-sm btn-purple" data-cb-wd="${Math.floor(bankBal * 0.50)}" ${bankBal<=0?'disabled':''}>50%</button>
            <button class="pixel-btn btn-sm btn-crimson" data-cb-wd="all" ${bankBal<=0?'disabled':''}>Снять ВСЁ</button>
          </div>
          <div style="display:flex;gap:6px;">
            <input type="number" id="cbWdInput" class="modal-input" style="flex:1;padding:6px;" min="1" max="${bankBal}" placeholder="Сумма к снятию..." />
            <button class="pixel-btn btn-sm btn-blue" id="btnCbWdCustom" ${bankBal<=0?'disabled':''}>Снять</button>
          </div>
        </div>

        ${hist.length > 0 ? `
          <div class="pixel-inset" style="padding:8px;">
            <div style="font-size:11px;font-weight:800;color:#ffe08a;margin-bottom:4px;">Последние операции:</div>
            <div style="display:flex;flex-direction:column;gap:3px;font-size:10px;">
              ${hist.slice(0, 5).map(h => `
                <div style="display:flex;justify-content:space-between;color:${h.type==='deposit'?'#4ade80':'#7cc0ff'};">
                  <span>${h.type==='deposit' ? 'Вклад в Банк' : 'Снятие из Банка'} (${esc(h.at)})</span>
                  <b>${h.type==='deposit' ? '+' : '-'}${h.val.toLocaleString()} монет</b>
                </div>`).join('')}
            </div>
          </div>` : ''}
      </div>`;

    root.querySelectorAll('[data-cb-dep]').forEach(b => b.onclick = () => {
      const v = b.dataset.cbDep === 'all' ? 'all' : Number(b.dataset.cbDep);
      if (window.MMO.bankDeposit(v)) renderCurrentModal();
    });
    root.querySelectorAll('[data-cb-wd]').forEach(b => b.onclick = () => {
      const v = b.dataset.cbWd === 'all' ? 'all' : Number(b.dataset.cbWd);
      if (window.MMO.bankWithdraw(v)) renderCurrentModal();
    });
    const dc = root.querySelector('#btnCbDepCustom');
    if (dc) dc.onclick = () => {
      const inp = root.querySelector('#cbDepInput');
      if (window.MMO.bankDeposit(Number(inp ? inp.value : 0))) renderCurrentModal();
    };
    const wc = root.querySelector('#btnCbWdCustom');
    if (wc) wc.onclick = () => {
      const inp = root.querySelector('#cbWdInput');
      if (window.MMO.bankWithdraw(Number(inp ? inp.value : 0))) renderCurrentModal();
    };
  }

  // =========================================================================
  // 8. AUCTION HOUSE (Live Real-Player Online Auction + World Market Auction)
  // =========================================================================
  function renderAuctionModal(root) {
    const p = window.GameState.player;
    const ec = window.MMO.economy;
    const mp = window.Multiplayer ? window.Multiplayer.getStatus() : { status: 'offline', myNetId: '' };
    const onlineLots = (window.Multiplayer && window.Multiplayer.onlineAuctionLots ? window.Multiplayer.onlineAuctionLots : []).filter(l => {
      if (auctionFilter !== 'all' && l.item.category !== auctionFilter) return false;
      if (auctionSearch && !l.item.name.toLowerCase().includes(auctionSearch.toLowerCase())) return false;
      return true;
    });
    const lots = window.MMO.auctionListings.filter(l => {
      if (auctionFilter !== 'all' && l.item.category !== auctionFilter) return false;
      if (auctionSearch && !l.item.name.toLowerCase().includes(auctionSearch.toLowerCase())) return false;
      return true;
    });

    root.innerHTML = `
      <div class="tab-strip">
        <button class="tab-btn ${auctionTab==='online'?'active':''}" data-atab="online">${px('online')} Онлайн-лоты (${onlineLots.length})</button>
        <button class="tab-btn ${auctionTab==='browse'?'active':''}" data-atab="browse">${px('auction')} Рынок мира (${window.MMO.auctionListings.length})</button>
        <button class="tab-btn ${auctionTab==='sell'?'active':''}" data-atab="sell">${px('coin')} Выставить</button>
        <div style="margin-left:auto;font-weight:800;color:#ffe08a;">${px('coin')} ${p.gold.toLocaleString()}</div>
      </div>
      <div style="font-size:10px;color:#9fb2db;margin-bottom:6px;">
        Онлайн-аукцион: <b style="color:${mp.status==='connected'?'#4ade80':'#f87171'};">${mp.status==='connected'?'ПОДКЛЮЧЁН':'ОФЛАЙН'}</b> • Комиссия продаж: <b style="color:#4ade80;">${Math.round(ec.auctionFee * 100)}%</b>
      </div>
      ${auctionTab === 'online' ? `
        <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
          <input id="aucSearchInput" class="modal-input" style="flex:1;min-width:140px;" placeholder="Поиск по лотам игроков..." value="${esc(auctionSearch)}" />
          ${[['all','Все'],['weapon','Оружие'],['armor','Броня'],['resource','Ресурсы'],['potion','Зелья']].map(f =>
            `<button class="pixel-btn btn-sm ${auctionFilter===f[0]?'btn-gold':'btn-dark'}" data-afilt="${f[0]}">${f[1]}</button>`
          ).join('')}
        </div>
        <div class="list-stack">
          ${onlineLots.map(l => {
            const it = l.item;
            const isMine = l.sellerId === mp.myNetId;
            return `
              <div class="list-row" style="border-color:${isMine ? '#fbbf24' : '#22d3ee'};">
                <div class="list-row-left">
                  <div class="item-slot rarity-${it.rarity}"><img src="${window.Sprites.getItemIcon(it)}" />${it.enhance>0?`<span class="slot-enh">+${it.enhance}</span>`:''}${it.qty>1?`<span class="slot-qty">${it.qty}</span>`:''}</div>
                  <div>
                    <div class="list-row-title text-${it.rarity}">${esc(it.name)} ${it.enhance>0?'+'+it.enhance:''} <span class="trend-pill trend-up">${isMine ? 'ВАШ ЛОТ' : 'ИГРОК'}</span></div>
                    <div class="list-row-sub">Продавец: <b style="color:#22d3ee;">${esc(l.sellerName)}</b> • Цена: <b style="color:#ffe08a;">${l.buyout.toLocaleString()} монет</b></div>
                  </div>
                </div>
                <div style="display:flex;gap:5px;">
                  ${isMine
                    ? `<button class="pixel-btn btn-sm btn-crimson" data-ol-cancel="${l.id}">Снять</button>`
                    : `<button class="pixel-btn btn-sm btn-gold" data-ol-buy="${l.id}">Купить ${px('coin')} ${l.buyout}</button>`}
                </div>
              </div>`;
          }).join('') || '<div style="text-align:center;color:#9fb2db;padding:18px;">Пока нет активных онлайн-лотов от игроков. Выставьте первый предмет во вкладке «Выставить»!</div>'}
        </div>
      ` : auctionTab === 'browse' ? `
        <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
          <input id="aucSearchInput" class="modal-input" style="flex:1;min-width:140px;" placeholder="Поиск по названию..." value="${esc(auctionSearch)}" />
          ${[['all','Все'],['weapon','Оружие'],['armor','Броня'],['resource','Ресурсы'],['potion','Зелья']].map(f =>
            `<button class="pixel-btn btn-sm ${auctionFilter===f[0]?'btn-gold':'btn-dark'}" data-afilt="${f[0]}">${f[1]}</button>`
          ).join('')}
        </div>
        <div class="list-stack">
          ${lots.map(l => {
            const it = l.item;
            const fair = window.MMO.getMarketPrice(it);
            const deal = l.buyout <= fair * 0.92 ? ' <span class="trend-pill trend-up">ВЫГОДНО</span>' : '';
            return `
              <div class="list-row">
                <div class="list-row-left">
                  <div class="item-slot rarity-${it.rarity}"><img src="${window.Sprites.getItemIcon(it)}" />${it.enhance>0?`<span class="slot-enh">+${it.enhance}</span>`:''}${it.qty>1?`<span class="slot-qty">${it.qty}</span>`:''}</div>
                  <div>
                    <div class="list-row-title text-${it.rarity}">${esc(it.name)} ${it.enhance>0?'+'+it.enhance:''}${deal}</div>
                    <div class="list-row-sub">Продавец: ${esc(l.sellerName)} • Рынок: ~${fair} • Ставка: ${l.currentBid} ${l.highBidder?'('+esc(l.highBidder)+')':''} • ${Math.ceil(l.expiresIn)}с</div>
                  </div>
                </div>
                <div style="display:flex;gap:5px;">
                  ${l.isPlayerListing
                    ? `<button class="pixel-btn btn-sm btn-crimson" data-auc-buy="${l.id}">Снять</button>`
                    : `<button class="pixel-btn btn-sm btn-blue" data-auc-bid="${l.id}">Ставка</button>
                       <button class="pixel-btn btn-sm btn-gold" data-auc-buy="${l.id}">Выкуп ${px('coin')} ${l.buyout}</button>`}
                </div>
              </div>`;
          }).join('') || '<div style="text-align:center;color:#9fb2db;padding:18px;">Лоты не найдены</div>'}
        </div>
      ` : `
        <div style="font-size:11px;color:#b7c7eb;margin-bottom:8px;">Выставьте предмет на <b>Онлайн-Аукцион</b> (купят реальные игроки, монеты придут сразу) или на Рынок мира.</div>
        <div class="list-stack">
          ${window.GameState.inventory.map(it => {
            const mkt = window.MMO.getMarketPrice(it);
            const sug = Math.round(mkt * 1.12);
            const dem = window.MMO.getDemandLabel(window.MMO.getItemMarketGroup(it));
            return `
              <div class="list-row">
                <div class="list-row-left">
                  <div class="item-slot rarity-${it.rarity}"><img src="${window.Sprites.getItemIcon(it)}" /></div>
                  <div>
                    <div class="list-row-title text-${it.rarity}">${esc(it.name)} ${it.qty>1?'x'+it.qty:''}</div>
                    <div class="list-row-sub">Курс рынка: ~${mkt} монет (<span style="color:${dem.color};">${dem.text}</span>)</div>
                  </div>
                </div>
                <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">
                  <input type="number" class="modal-input" style="width:78px;padding:4px;" id="price_${it.uid}" value="${sug}" min="10" />
                  <button class="pixel-btn btn-sm btn-green" data-ol-list="${it.uid}">Игрокам</button>
                  <button class="pixel-btn btn-sm btn-blue" data-auc-list="${it.uid}">Мир</button>
                </div>
              </div>`;
          }).join('') || '<div style="text-align:center;color:#9fb2db;padding:18px;">В сумке нет предметов</div>'}
        </div>
      `}`;

    root.querySelectorAll('[data-atab]').forEach(b => b.onclick = () => { auctionTab = b.dataset.atab; renderCurrentModal(); });
    root.querySelectorAll('[data-afilt]').forEach(b => b.onclick = () => { auctionFilter = b.dataset.afilt; renderCurrentModal(); });
    const srch = root.querySelector('#aucSearchInput');
    if (srch) srch.oninput = e => { auctionSearch = e.target.value; renderCurrentModal(); };
    root.querySelectorAll('[data-ol-buy]').forEach(b => b.onclick = () => {
      if (window.Multiplayer && window.Multiplayer.buyOnlineAuctionLot(b.dataset.olBuy)) renderCurrentModal();
    });
    root.querySelectorAll('[data-ol-cancel]').forEach(b => b.onclick = () => {
      if (window.Multiplayer && window.Multiplayer.cancelOnlineAuctionLot(b.dataset.olCancel)) renderCurrentModal();
    });
    root.querySelectorAll('[data-ol-list]').forEach(b => b.onclick = () => {
      const inp = root.querySelector('#price_' + b.dataset.olList);
      if (window.Multiplayer && window.Multiplayer.listOnlineAuctionLot(b.dataset.olList, inp ? inp.value : 100)) {
        auctionTab = 'online';
        renderCurrentModal();
      }
    });
    root.querySelectorAll('[data-auc-buy]').forEach(b => b.onclick = () => { window.MMO.buyAuctionListing(b.dataset.aucBuy); renderCurrentModal(); });
    root.querySelectorAll('[data-auc-bid]').forEach(b => b.onclick = () => { window.MMO.placeBidAuction(b.dataset.aucBid); renderCurrentModal(); });
    root.querySelectorAll('[data-auc-list]').forEach(b => b.onclick = () => {
      const inp = root.querySelector('#price_' + b.dataset.aucList);
      window.MMO.listPlayerItemOnAuction(b.dataset.aucList, inp ? inp.value : 100);
      renderCurrentModal();
    });
  }

  // =========================================================================
  // 9. REAL ONLINE PLAYERS + PARTY + DIRECT TRADE HUB (+ SMART BOTS)
  // =========================================================================
  function renderTradeHubModal(root) {
    const p = window.GameState.player;
    const remotes = window.Multiplayer ? window.Multiplayer.getRemotePlayers() : [];
    const rParty = window.Multiplayer ? window.Multiplayer.realParty : { id: null, members: [] };
    const mpStatus = window.Multiplayer ? window.Multiplayer.getStatus() : { status: 'offline' };

    const filtered = window.Bots.list.filter(b => botRoleFilter === 'all' || b.role === botRoleFilter);
    const sorted = filtered.slice().sort((a, b) =>
      Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)
    );
    const roles = [
      ['all', 'Все боты (' + window.Bots.list.length + ')'],
      ['merchant', 'Торговцы'],
      ['gatherer', 'Собиратели'],
      ['healer', 'Целители'],
      ['tank', 'Танки'],
      ['raider', 'Рейдеры'],
      ['gladiator', 'Гладиаторы']
    ];

    root.innerHTML = `
      <div class="pixel-inset" style="padding:10px;margin-bottom:8px;border-color:#22d3ee;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
          <div style="font-weight:900;color:#22d3ee;">${px('online')} Реальные игроки онлайн (${remotes.length})</div>
          ${rParty.id ? `
            <div style="display:flex;gap:5px;">
              <button class="pixel-btn btn-sm btn-green" id="btnHubPartyTp">ТП к пати</button>
              <button class="pixel-btn btn-sm btn-crimson" id="btnHubPartyLeave">Выйти из пати (${rParty.members.length}/4)</button>
            </div>` : `<span style="font-size:10px;color:${mpStatus.status==='connected'?'#4ade80':'#f87171'};">${mpStatus.status==='connected'?'Онлайн активен':'Нет сети'}</span>`}
        </div>
        <div class="list-stack" style="max-height:145px;">
          ${remotes.map(rp => {
            const dist = Math.round(Math.hypot(rp.x - p.x, rp.y - p.y));
            const inParty = window.Multiplayer.isInMyParty(rp.id);
            return `
              <div class="list-row" style="border-color:${inParty ? '#4ade80' : '#22d3ee'};">
                <div class="list-row-left">
                  <div class="item-slot rarity-${rp.equipment?.weapon?.rarity || 'common'}">
                    <img src="${window.Sprites.getItemIcon(rp.equipment?.weapon)}" />
                  </div>
                  <div>
                    <div class="list-row-title" style="color:${inParty ? '#4ade80' : '#22d3ee'};">
                      [ИГРОК] ${esc(rp.name)} • Ур.${rp.level} ${inParty ? '• В ПАТИ' : ''}
                    </div>
                    <div class="list-row-sub">${esc(window.World.getBiomeAt(rp.x, rp.y).name)} • ${dist}м • HP ${Math.round(rp.hp)}/${rp.maxHp} ${rp.pvp ? '• PvP' : ''}</div>
                  </div>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  <button class="pixel-btn btn-sm btn-gold" data-rp-trade="${rp.id}">${px('trade')} Обмен</button>
                  ${inParty
                    ? `<button class="pixel-btn btn-sm btn-green" data-rp-tp="${rp.id}">ТП</button>`
                    : `<button class="pixel-btn btn-sm btn-blue" data-rp-party="${rp.id}">${px('party')} В пати</button>`}
                </div>
              </div>`;
          }).join('') || '<div style="font-size:11px;color:#9fb2db;padding:6px;">Рядом пока нет других реальных игроков. Отправьте друзьям ссылку на бота — они появятся прямо здесь!</div>'}
        </div>
      </div>

      <div class="tab-strip">
        ${roles.map(r => `<button class="tab-btn ${botRoleFilter===r[0]?'active':''}" data-brole="${r[0]}">${r[1]}</button>`).join('')}
      </div>
      <div class="list-stack" style="max-height:175px;">
        ${sorted.map(b => {
          const dist = Math.round(Math.hypot(b.x - p.x, b.y - p.y));
          return `
            <div class="list-row">
              <div class="list-row-left">
                <div class="item-slot rarity-${b.equipment.weapon?.rarity || 'common'}">
                  <img src="${window.Sprites.getItemIcon(b.equipment.weapon)}" />
                </div>
                <div>
                  <div class="list-row-title">
                    [${esc(b.clanTag)}] ${esc(b.name)} • Ур.${b.level}
                    <span class="role-badge" style="color:${b.roleColor || '#94a3b8'};">${esc(b.roleLabel || 'Игрок')}</span>
                  </div>
                  <div class="list-row-sub">БМ: ${b.power} • ${b.gold} зол. • ${dist}м • ${b.inParty ? 'В группе' : window.World.getBiomeAt(b.x, b.y).name}</div>
                </div>
              </div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                <button class="pixel-btn btn-sm btn-gold" data-bot-trade="${b.id}">${px('trade')} Трейд</button>
                <button class="pixel-btn btn-sm btn-blue" data-bot-party="${b.id}">${px('party')} Группа</button>
                <button class="pixel-btn btn-sm btn-crimson" data-bot-duel="${b.id}">${px('pvp')} Дуэль</button>
              </div>
            </div>`;
        }).join('')}
      </div>`;

    const tpBtn = root.querySelector('#btnHubPartyTp');
    if (tpBtn) tpBtn.onclick = () => { window.Multiplayer.teleportToPartyMate(); closeModal(); };
    const lvBtn = root.querySelector('#btnHubPartyLeave');
    if (lvBtn) lvBtn.onclick = () => { window.Multiplayer.leaveRealParty(false); renderCurrentModal(); };
    root.querySelectorAll('[data-rp-trade]').forEach(el => el.onclick = () => window.Multiplayer.requestTrade(el.dataset.rpTrade));
    root.querySelectorAll('[data-rp-party]').forEach(el => el.onclick = () => { window.Multiplayer.invitePlayerToParty(el.dataset.rpParty); renderCurrentModal(); });
    root.querySelectorAll('[data-rp-tp]').forEach(el => el.onclick = () => { window.Multiplayer.teleportToPartyMate(el.dataset.rpTp); closeModal(); });

    root.querySelectorAll('[data-brole]').forEach(el => el.onclick = () => { botRoleFilter = el.dataset.brole; renderCurrentModal(); });
    root.querySelectorAll('[data-bot-trade]').forEach(el => el.onclick = () => window.MMO.startTradeWithBot(el.dataset.botTrade));
    root.querySelectorAll('[data-bot-party]').forEach(el => el.onclick = () => { window.MMO.inviteBotToParty(el.dataset.botParty); renderCurrentModal(); });
    root.querySelectorAll('[data-bot-duel]').forEach(el => el.onclick = () => { window.MMO.startDuelWithBot(el.dataset.botDuel); closeModal(); });
  }

  // =========================================================================
  // 9B. LIVE 2-SIDED TRADE MODAL BETWEEN REAL ONLINE PLAYERS
  // =========================================================================
  function renderRealTradeModal(root) {
    const tr = window.Multiplayer && window.Multiplayer.realTrade;
    if (!tr || !tr.active) { closeModal(); return; }
    const pBag = window.GameState.inventory || [];
    const handGold = Math.floor(window.GameState.player.gold || 0);

    root.innerHTML = `
      <div class="pixel-inset" style="padding:7px 10px;margin-bottom:8px;color:#22d3ee;font-weight:800;display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;">
        <span>${px('trade')} Живой обмен с игроком ${esc(tr.partnerName)}</span>
        <span style="font-size:10px;color:#9fb2db;">При изменении предложения готовность сбрасывается</span>
      </div>
      <div class="trade-layout">
        <div class="trade-side pixel-inset" style="border-color:${tr.myReady ? '#4ade80' : '#334155'};">
          <div style="font-weight:800;color:#6ee7a8;display:flex;justify-content:space-between;">
            <span>Вы отдаёте (${esc(window.GameState.player.name)})</span>
            <span>${tr.myReady ? '[ГОТОВ]' : '[выбор...]'}</span>
          </div>
          <div style="display:flex;gap:5px;align-items:center;">
            <span>${px('coin')} Монеты:</span>
            <input type="number" id="rtMyGold" class="modal-input" style="width:105px;padding:4px;" min="0" max="${handGold}" value="${tr.myGold}" />
            <span style="font-size:10px;color:#9fb2db;">/ ${handGold}</span>
          </div>
          <div style="font-size:10px;color:#9fb2db;">Нажмите на вещи в сумке (выбрано ${tr.myItemUids.length}/8):</div>
          <div class="trade-slots-grid" style="max-height:140px;overflow-y:auto;">
            ${pBag.map(it => {
              const sel = tr.myItemUids.includes(it.uid);
              return `<div class="item-slot rarity-${it.rarity} ${sel ? 'selected' : ''}" data-rt-item="${it.uid}" title="${esc(it.name)}">
                <img src="${window.Sprites.getItemIcon(it)}" />${it.enhance>0?`<span class="slot-enh">+${it.enhance}</span>`:''}${it.qty>1?`<span class="slot-qty">${it.qty}</span>`:''}
              </div>`;
            }).join('') || '<div style="font-size:10px;color:#9fb2db;">Сумка пуста</div>'}
          </div>
        </div>

        <div class="trade-side pixel-inset" style="border-color:${tr.partnerReady ? '#4ade80' : '#334155'};">
          <div style="font-weight:800;color:#7cc0ff;display:flex;justify-content:space-between;">
            <span>${esc(tr.partnerName)} отдаёт</span>
            <span>${tr.partnerReady ? '[ГОТОВ]' : '[выбор...]'}</span>
          </div>
          <div style="font-weight:800;color:#ffe08a;">${px('coin')} Монеты: ${tr.partnerGold.toLocaleString()}</div>
          <div style="font-size:10px;color:#9fb2db;">Предложенные предметы (${tr.partnerItems.length}):</div>
          <div class="trade-slots-grid" style="max-height:140px;overflow-y:auto;">
            ${tr.partnerItems.map(it => `
              <div class="item-slot rarity-${it.rarity || 'common'}" title="${esc(it.name || 'Предмет')}">
                <img src="${window.Sprites.getItemIcon(it)}" />${it.enhance>0?`<span class="slot-enh">+${it.enhance}</span>`:''}${it.qty>1?`<span class="slot-qty">${it.qty}</span>`:''}
              </div>`).join('') || '<div style="font-size:10px;color:#9fb2db;">Пока ничего не добавлено</div>'}
          </div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <button class="pixel-btn btn-crimson" id="btnRtCancel">Отменить обмен</button>
        <button class="pixel-btn ${tr.myReady ? 'btn-green' : 'btn-gold'}" id="btnRtReady">
          ${tr.myReady ? px('check') + ' Ожидание ' + esc(tr.partnerName) + '...' : px('check') + ' ПОДТВЕРДИТЬ ОБМЕН'}
        </button>
      </div>`;

    root.querySelector('#rtMyGold').onchange = e => {
      window.Multiplayer.setRealTradeGold(e.target.value);
      renderCurrentModal();
    };
    root.querySelectorAll('[data-rt-item]').forEach(el => {
      el.onclick = () => {
        window.Multiplayer.toggleRealTradeItem(el.dataset.rtItem);
        renderCurrentModal();
      };
    });
    root.querySelector('#btnRtCancel').onclick = () => window.Multiplayer.cancelRealTrade('отменил обмен');
    root.querySelector('#btnRtReady').onclick = () => {
      window.Multiplayer.toggleRealTradeReady();
      renderCurrentModal();
    };
  }

  function renderTradeModal(root) {
    const tr = window.MMO.tradeSession;
    const bot = window.Bots.byId(tr.botId);
    if (!bot) { closeModal(); return; }
    window.MMO.evaluateBotTrade();

    const pBag = window.GameState.inventory;

    root.innerHTML = `
      <div class="pixel-inset" style="padding:7px 10px;margin-bottom:8px;color:#ffe08a;font-weight:700;">
        ${px('chat')} ${esc(bot.name)}: «${esc(tr.botMessage)}»
      </div>
      <div class="trade-layout">
        <div class="trade-side pixel-inset">
          <div style="font-weight:800;color:#6ee7a8;">Вы отдаёте (${esc(window.GameState.player.name)})</div>
          <div style="display:flex;gap:5px;align-items:center;">
            <span>${px('coin')} Золото:</span>
            <input type="number" id="trPlayerGold" class="modal-input" style="width:100px;padding:4px;" min="0" max="${window.GameState.player.gold}" value="${tr.playerGold}" />
          </div>
          <div style="font-size:10px;color:#9fb2db;">Нажмите на вещи ниже, чтобы добавить/убрать:</div>
          <div class="trade-slots-grid" style="max-height:140px;overflow-y:auto;">
            ${pBag.slice(0, 16).map(it => {
              const sel = tr.playerItems.includes(it.uid);
              return `<div class="item-slot rarity-${it.rarity} ${sel ? 'selected' : ''}" data-tr-pitem="${it.uid}" title="${esc(it.name)} (~${it.price} зол.)">
                <img src="${window.Sprites.getItemIcon(it)}" />${it.qty>1?`<span class="slot-qty">${it.qty}</span>`:''}
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="trade-side pixel-inset">
          <div style="font-weight:800;color:#7cc0ff;">${esc(bot.name)} отдаёт ${tr.botLocked ? px('check') : px('clock')}</div>
          <div style="display:flex;gap:5px;align-items:center;">
            <span>${px('coin')} Золото бота:</span>
            <input type="number" id="trBotGold" class="modal-input" style="width:100px;padding:4px;" min="0" max="${bot.gold}" value="${tr.botGold}" />
          </div>
          <div style="font-size:10px;color:#9fb2db;">Нажмите на предметы бота, которые хотите получить:</div>
          <div class="trade-slots-grid" style="max-height:140px;overflow-y:auto;">
            ${bot.inventory.map(it => {
              const sel = tr.botItems.some(x => x.uid === it.uid);
              return `<div class="item-slot rarity-${it.rarity} ${sel ? 'selected' : ''}" data-tr-bitem="${it.uid}" title="${esc(it.name)} (~${it.price} зол.)">
                <img src="${window.Sprites.getItemIcon(it)}" />${it.qty>1?`<span class="slot-qty">${it.qty}</span>`:''}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;">
        <button class="pixel-btn btn-dark" id="btnCancelTrade">Отмена</button>
        <button class="pixel-btn ${tr.botLocked ? 'btn-green' : 'btn-gold'}" id="btnConfirmTrade">${tr.botLocked ? px('check') + ' ПОДТВЕРДИТЬ ОБМЕН' : px('chat') + ' Оценить предложение'}</button>
      </div>`;

    root.querySelector('#trPlayerGold').onchange = e => {
      tr.playerGold = Math.max(0, Math.min(window.GameState.player.gold, Math.round(Number(e.target.value) || 0)));
      renderCurrentModal();
    };
    root.querySelector('#trBotGold').onchange = e => {
      tr.botGold = Math.max(0, Math.min(bot.gold, Math.round(Number(e.target.value) || 0)));
      renderCurrentModal();
    };
    root.querySelectorAll('[data-tr-pitem]').forEach(el => {
      el.onclick = () => {
        const uid = el.dataset.trPitem;
        const idx = tr.playerItems.indexOf(uid);
        if (idx >= 0) tr.playerItems.splice(idx, 1); else tr.playerItems.push(uid);
        renderCurrentModal();
      };
    });
    root.querySelectorAll('[data-tr-bitem]').forEach(el => {
      el.onclick = () => {
        const uid = el.dataset.trBitem;
        const idx = tr.botItems.findIndex(x => x.uid === uid);
        if (idx >= 0) tr.botItems.splice(idx, 1);
        else {
          const item = bot.inventory.find(x => x.uid === uid);
          if (item) tr.botItems.push(item);
        }
        renderCurrentModal();
      };
    });
    root.querySelector('#btnCancelTrade').onclick = () => { tr.active = false; closeModal(); };
    root.querySelector('#btnConfirmTrade').onclick = () => {
      if (tr.botLocked) window.MMO.executeTrade();
      else { window.MMO.evaluateBotTrade(); renderCurrentModal(); }
    };
  }

  // =========================================================================
  // 10. CLAN, SHOP, CRAFT, STORAGE, QUESTS, ACHIEVEMENTS, LEADERBOARD, SETTINGS
  // =========================================================================
  function renderClanModal(root) {
    const c = window.GameState.clan;
    if (!c) {
      root.innerHTML = `
        <div class="pixel-inset" style="padding:14px;display:flex;flex-direction:column;gap:9px;max-width:420px;margin:auto;">
          <div style="font-size:14px;font-weight:900;color:#ffe08a;">${px('clan')} Основать свой Клан (300 золота)</div>
          <div style="font-size:11px;color:#b7c7eb;">Клан даёт постоянные бонусы к Атаке, Опыту и Золоту, а также клановый чат и тег над головой.</div>
          <input id="clanNameInp" class="modal-input" maxlength="18" placeholder="Название клана (напр. Алые Клинки)" />
          <input id="clanTagInp" class="modal-input" maxlength="4" placeholder="Тег до 4 букв (напр. АЛЫЕ)" />
          <button class="pixel-btn btn-gold" id="btnCreateClan">${px('clan')} Создать клан за 300 золота</button>
        </div>`;
      root.querySelector('#btnCreateClan').onclick = () => {
        if (window.MMO.createClan(root.querySelector('#clanNameInp').value, root.querySelector('#clanTagInp').value)) renderCurrentModal();
      };
      return;
    }
    const nextNeed = c.level * 500;
    root.innerHTML = `
      <div class="pixel-inset" style="padding:10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-size:16px;font-weight:900;color:#ffe08a;">[${esc(c.tag)}] ${esc(c.name)} • Ур. ${c.level}</div>
          <div style="font-size:11px;color:#6ee7a8;">Баффы клана: +${c.level*4}% АТК • +${c.level*5}% XP • +${c.level*5}% Золота</div>
          <div style="font-size:11px;color:#9fb2db;">Казна до след. уровня: ${c.treasury} / ${nextNeed} золота</div>
        </div>
        <button class="pixel-btn btn-gold" id="btnDonateClan">${px('coin')} Пожертвовать 200</button>
      </div>
      <div class="list-stack">
        ${c.members.map(m => `
          <div class="list-row">
            <div class="list-row-title">${esc(m.name)} <span style="color:#ffe08a;">(${esc(m.role)})</span></div>
            <div class="list-row-sub">Ур. ${m.lv} • Онлайн</div>
          </div>`).join('')}
      </div>`;
    root.querySelector('#btnDonateClan').onclick = () => { if (window.MMO.donateClan(200)) renderCurrentModal(); };
  }

  function renderShopModal(root) {
    const p = window.GameState.player;
    const goods = [
      window.GameData.createConsumableItem('hp_potion', 3),
      window.GameData.createConsumableItem('hp_potion_lg', 2),
      window.GameData.createConsumableItem('mp_potion', 3),
      window.GameData.createConsumableItem('mp_potion_lg', 2),
      window.GameData.createConsumableItem('upgrade_stone', 1),
      window.GameData.createConsumableItem('rune_t1', 2),
      window.GameData.createConsumableItem('scroll_enchant', 1),
      window.GameData.createToolItem('axe', 1),
      window.GameData.createToolItem('pickaxe', 1),
      window.GameData.createToolItem('sickle', 1),
      window.GameData.createToolItem('axe', 2),
      window.GameData.createToolItem('pickaxe', 2),
      window.GameData.createToolItem('sickle', 2),
      window.GameData.createArmorItem('helm_iron', 'uncommon', 2, 0, 2, 0),
      window.GameData.createArmorItem('armor_knight', 'uncommon', 2, 0, 2, 0),
      window.GameData.createArmorItem('cloak_forest', 'uncommon', 2, 0, 2, 0),
      window.GameData.createArmorItem('boots_swift', 'rare', 4, 0, 3, 0),
      window.GameData.createArmorItem('ring_copper', 'uncommon', 2, 0, 2, 0),
      window.GameData.createArmorItem('amulet_wolf', 'rare', 4, 0, 3, 0),
      window.GameData.createArmorItem('shield_wood', 'uncommon', 2, 0, 2, 0),
      window.GameData.createArmorItem('relic_totem', 'rare', 4, 0, 3, 0)
    ];
    root.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <div style="font-weight:800;color:#ffe08a;">${px('coin')} Ваше золото: ${p.gold.toLocaleString()}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          <button class="pixel-btn btn-sm btn-purple" id="btnShopDonate">${px('tg_star')} Донат Stars</button>
          <button class="pixel-btn btn-sm btn-green" id="btnShopCraft">${px('craft')} Крафт T2–T8</button>
          <button class="pixel-btn btn-sm btn-gold" id="btnShopWeapons">${px('weapons')} Арсенал T1–T8</button>
        </div>
      </div>
      <div class="list-stack">
        ${goods.map((it, idx) => {
          const cost = Math.round(it.price * (it.qty || 1));
          const tCol = it.tier && window.GameData.TIERS[it.tier] ? window.GameData.TIERS[it.tier].color : null;
          return `
            <div class="list-row">
              <div class="list-row-left">
                <div class="item-slot rarity-${it.rarity}">
                  <img src="${window.Sprites.getItemIcon(it)}" />
                  ${tCol ? `<span class="slot-tier" style="color:${tCol};">T${it.tier}</span>` : ''}
                  ${it.qty > 1 ? `<span class="slot-qty">${it.qty}</span>` : ''}
                </div>
                <div>
                  <div class="list-row-title text-${it.rarity}">${esc(it.name)} ${it.qty > 1 ? 'x' + it.qty : ''}</div>
                  <div class="list-row-sub">${esc(it.desc)}</div>
                </div>
              </div>
              <button class="pixel-btn btn-sm btn-gold" data-shop-idx="${idx}">${px('coin')} ${cost.toLocaleString()}</button>
            </div>`;
        }).join('')}
      </div>`;
    root.querySelector('#btnShopDonate').onclick = () => openModal('donate');
    root.querySelector('#btnShopWeapons').onclick = () => openModal('weapons');
    root.querySelector('#btnShopCraft').onclick = () => openModal('craft');
    root.querySelectorAll('[data-shop-idx]').forEach(btn => {
      btn.onclick = () => {
        const it = goods[Number(btn.dataset.shopIdx)];
        const cost = Math.round(it.price * (it.qty || 1));
        if (p.gold < cost) { toast('Не хватает золота (' + cost.toLocaleString() + ')!'); return; }
        if (!window.MMO.addItemToBag(it)) { toast('Инвентарь полон!'); return; }
        p.gold -= cost;
        toast('Куплено: ' + it.name);
        renderCurrentModal();
      };
    });
  }

  function renderDonateModal(root) {
    const tgStars = window.TelegramStars;
    if (!tgStars) return;
    const env = tgStars.getEnvStatus();
    const history = window.GameState.donateHistory || [];
    const ab = window.GameState.adminBot || (window.GameState.adminBot = { owned: false, summoned: false, mode: 'combat', name: 'Админ-Страж' });
    const userLabel = env.user
      ? (env.user.username ? '@' + env.user.username : (env.user.first_name || 'ID ' + env.user.id))
      : '';

    root.innerHTML = `
      <div class="econ-event-banner pixel-inset" style="margin-bottom:8px;">
        <div>
          <div style="font-weight:900;color:#ffe08a;font-size:12px;">
            ${px('tg_star')} Донат Telegram Stars (XTR) — Эксклюзив
          </div>
          <div style="font-size:10px;color:#dbe7ff;">
            Telegram Mini App: <b style="color:${env.canOpenInvoice ? '#4ade80' : '#f87171'};">${env.canOpenInvoice ? 'Подключён (' + esc(userLabel) + ')' : 'Открыто вне Telegram'}</b>
            • Сервер бота: <b style="color:${env.apiUrl ? '#4ade80' : '#fbbf24'};">${env.apiUrl ? 'Настроен' : 'Не указан URL'}</b>
          </div>
        </div>
        <button class="pixel-btn btn-sm btn-dark" id="btnToggleStarsConfig">${px('settings')} ${showStarsDevHelp ? 'Скрыть настройки' : 'Настройка бота'}</button>
      </div>

      ${showStarsDevHelp ? `
        <div class="pixel-inset" style="padding:8px 10px;margin-bottom:8px;display:flex;flex-direction:column;gap:6px;border-color:#7cc0ff;">
          <div style="font-size:11px;font-weight:800;color:#7cc0ff;">URL бэкенда вашего Telegram-бота (POST /api/create-invoice):</div>
          <div style="display:flex;gap:6px;">
            <input id="tgApiUrlInput" class="modal-input" style="flex:1;font-size:11px;padding:5px 8px;" placeholder="https://your-bot-server.com" value="${esc(env.apiUrl)}" />
            <button class="pixel-btn btn-sm btn-green" id="btnSaveTgApi">Сохранить</button>
          </div>
          <div style="font-size:10px;color:#9fb2db;">
            Параметр в ссылке Mini App: <b style="color:#ffe08a;">https://ваш-сайт-игры/?api=https://ваш-сервер-бота&amp;ws=wss://ваш-сервер-бота</b>
          </div>
          <details style="font-size:10px;color:#cbd5e1;">
            <summary style="cursor:pointer;color:#ffe08a;font-weight:700;">Показать JSON каталога itemId и цен (Stars) для сервера</summary>
            <pre style="margin:5px 0 0;padding:6px;background:#070b18;border:1px solid #2e3d66;border-radius:4px;overflow-x:auto;font-size:9px;color:#86efac;user-select:text;-webkit-user-select:text;">${esc(tgStars.getBackendCatalogSnippet())}</pre>
          </details>
        </div>
      ` : ''}

      <div class="list-stack" style="max-height:220px;">
        ${tgStars.DONATE_PACKS.map(pk => `
          <div class="list-row" style="border-color:#d9a742;background:rgba(36,24,62,0.75);">
            <div class="list-row-left">
              <div class="item-slot rarity-${pk.rarity}">
                ${px(pk.iconKey, 'px-ico-lg', 32)}
              </div>
              <div>
                <div class="list-row-title text-${pk.rarity}">${esc(pk.title)} ${ab.owned ? '<span class="trend-pill trend-up">КУПЛЕН</span>' : ''}</div>
                <div class="list-row-sub" style="color:#fde68a;font-weight:700;">${esc(pk.contentsText)}</div>
                <div class="list-row-sub">${esc(pk.desc)}</div>
              </div>
            </div>
            ${ab.owned
              ? `<button class="pixel-btn btn-sm btn-green" disabled>${px('check')} Активен</button>`
              : `<button class="pixel-btn btn-sm btn-gold" data-buy-stars="${pk.id}" ${env.isBusy ? 'disabled' : ''}>${px('tg_star')} ${env.isBusy ? '...' : pk.stars}</button>`}
          </div>
        `).join('')}
      </div>

      ${ab.owned ? `
        <div class="pixel-inset" style="padding:10px;margin-top:8px;border-color:#fbbf24;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
            <div style="font-weight:900;color:#ffe08a;">${px('admin_bot')} Админ Бот активен!</div>
            <button class="pixel-btn btn-gold" id="btnOpenFullAdmin">${px('admin_bot')} Открыть полную Админ-Панель</button>
          </div>
          <div style="font-size:11px;color:#cbd5e1;">Выдавайте любое оружие/броню T1–T8, ресурсы, золото, уровни, маунтов, включайте Бессмертие/Ваншот/Супер-скорость и управляйте миром.</div>
        </div>
      ` : ''}

      ${history.length > 0 ? `
        <div class="pixel-inset" style="padding:6px 9px;margin-top:8px;">
          <div style="font-size:10px;font-weight:800;color:#6ee7a8;margin-bottom:3px;">История ваших покупок Stars (${history.length}):</div>
          <div style="max-height:54px;overflow-y:auto;font-size:10px;color:#cbd5e1;">
            ${history.slice(0, 6).map(h => `<div>• ${esc(h.title)} (${h.stars} Stars) — ${esc(h.at)}</div>`).join('')}
          </div>
        </div>
      ` : ''}`;

    root.querySelector('#btnToggleStarsConfig').onclick = () => {
      showStarsDevHelp = !showStarsDevHelp;
      renderCurrentModal();
    };
    const saveApiBtn = root.querySelector('#btnSaveTgApi');
    if (saveApiBtn) {
      saveApiBtn.onclick = () => {
        const inp = root.querySelector('#tgApiUrlInput');
        if (tgStars.setApiUrl(inp ? inp.value : '')) renderCurrentModal();
      };
    }
    root.querySelectorAll('[data-buy-stars]').forEach(btn => {
      btn.onclick = () => { tgStars.buyPack(btn.dataset.buyStars); };
    });
    const openAdm = root.querySelector('#btnOpenFullAdmin');
    if (openAdm) {
      openAdm.onclick = () => openModal('adminPanel');
    }
  }

  function renderAdminPanelModal(root) {
    const ab = window.GameState.adminBot;
    const tgStars = window.TelegramStars;
    const act = tgStars && tgStars.adminActions;
    if (!ab || !ab.owned || !act) {
      root.innerHTML = `
        <div class="pixel-inset" style="padding:14px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;">
          <div style="font-weight:900;color:#ffe08a;">${px('admin_bot', 'px-ico-lg', 32)} Доступ только с Админ-Ботом</div>
          <div style="font-size:11px;color:#cbd5e1;">Приобретите «Админ Бот» за Telegram Stars (или активируйте серверный админ-промокод), чтобы открыть выдачу любых предметов и управление миром.</div>
          <button class="pixel-btn btn-gold" id="btnGoDonateFromAdm">${px('tg_star')} Открыть Донат Stars</button>
        </div>`;
      root.querySelector('#btnGoDonateFromAdm').onclick = () => openModal('donate');
      return;
    }

    const p = window.GameState.player;
    const affixes = window.GameData.ENCHANT_AFFIXES || {};
    const consumables = Object.values(window.GameData.CONSUMABLES || {});

    root.innerHTML = `
      <div class="tab-strip">
        <button class="tab-btn ${adminTab === 'grant' ? 'active' : ''}" data-admtab="grant">${px('coin')} Выдача</button>
        <button class="tab-btn ${adminTab === 'items' ? 'active' : ''}" data-admtab="items">${px('weapons')} Предметы T1–T8</button>
        <button class="tab-btn ${adminTab === 'god' ? 'active' : ''}" data-admtab="god">${px('bolt')} Бог и Мир</button>
        <button class="tab-btn ${adminTab === 'bot' ? 'active' : ''}" data-admtab="bot">${px('admin_bot')} Спутник-Бот</button>
      </div>

      ${adminTab === 'grant' ? `
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#ffe08a;">${px('coin')} Выдать золото (сейчас: ${p.gold.toLocaleString()})</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
              <button class="pixel-btn btn-sm btn-gold" data-adm-gold="1000">+1 000</button>
              <button class="pixel-btn btn-sm btn-gold" data-adm-gold="10000">+10 000</button>
              <button class="pixel-btn btn-sm btn-gold" data-adm-gold="100000">+100 000</button>
              <input id="admCustomGold" type="number" class="modal-input" style="width:110px;padding:4px 6px;font-size:11px;" value="50000" min="1" />
              <button class="pixel-btn btn-sm btn-green" id="btnAdmCustomGold">Выдать</button>
            </div>
          </div>

          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#7cc0ff;">${px('skills')} Прокачка героя (Ур.${p.level} • Статы: ${p.statPoints || 0} • Навыки: ${p.skillPoints || 0})</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <button class="pixel-btn btn-sm btn-blue" data-adm-lv="1">+1 Уровень</button>
              <button class="pixel-btn btn-sm btn-blue" data-adm-lv="5">+5 Уровней</button>
              <button class="pixel-btn btn-sm btn-purple" data-adm-lv="10">+10 Уровней</button>
              <button class="pixel-btn btn-sm btn-green" id="btnAdmPts">+25 Стат и +10 Навыков</button>
              <button class="pixel-btn btn-sm btn-gold" id="btnAdmMastery">+10 Мастерства и Профессий</button>
            </div>
          </div>

          <div class="pixel-inset" style="padding:9px;display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-sm btn-green" id="btnAdmHeal">${px('heart')} Фулл HP/MP + Сброс КД</button>
            <button class="pixel-btn btn-sm btn-purple" id="btnAdmMounts">${px('mounts')} Открыть всех 12 маунтов</button>
            <button class="pixel-btn btn-sm btn-gold" id="btnAdmToolsT8">${px('axe_tool')} Выдать все инструменты T8</button>
          </div>
        </div>
      ` : adminTab === 'items' ? `
        <div style="display:flex;flex-direction:column;gap:8px;max-height:310px;overflow-y:auto;">
          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#ffe08a;">${px('weapons')} Спавнер Оружия (любое из 23)</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
              <select id="admWepId" class="modal-input" style="flex:1;min-width:140px;padding:4px;font-size:11px;">
                ${window.GameData.WEAPON_TYPES.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
              </select>
              <select id="admWepTier" class="modal-input" style="width:62px;padding:4px;font-size:11px;">
                ${[8,7,6,5,4,3,2,1].map(t => `<option value="${t}">T${t}</option>`).join('')}
              </select>
              <select id="admWepRar" class="modal-input" style="width:110px;padding:4px;font-size:11px;">
                <option value="legendary">Легендарный</option>
                <option value="epic">Эпический</option>
                <option value="rare">Редкий</option>
                <option value="uncommon">Необычный</option>
                <option value="common">Обычный</option>
              </select>
              <select id="admWepEnh" class="modal-input" style="width:64px;padding:4px;font-size:11px;">
                ${[10,15,5,3,0].map(e => `<option value="${e}">+${e}</option>`).join('')}
              </select>
              <select id="admWepEnch" class="modal-input" style="width:58px;padding:4px;font-size:11px;">
                ${[4,3,2,1,0].map(e => `<option value="${e}">.${e}</option>`).join('')}
              </select>
              <select id="admWepAffix" class="modal-input" style="width:125px;padding:4px;font-size:11px;">
                <option value="">Без аффикса</option>
                ${Object.entries(affixes).map(([k, a]) => `<option value="${k}">${esc(a.name)}</option>`).join('')}
              </select>
              <button class="pixel-btn btn-sm btn-gold" id="btnAdmSpawnWep">Выдать</button>
            </div>
          </div>

          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#c084fc;">${px('inventory')} Спавнер Брони и Аксессуаров</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
              <select id="admArmId" class="modal-input" style="flex:1;min-width:150px;padding:4px;font-size:11px;">
                ${window.GameData.ARMOR_TEMPLATES.map(a => `<option value="${a.id}">${esc(a.name)} (${a.slot})</option>`).join('')}
              </select>
              <select id="admArmTier" class="modal-input" style="width:62px;padding:4px;font-size:11px;">
                ${[8,7,6,5,4,3,2,1].map(t => `<option value="${t}">T${t}</option>`).join('')}
              </select>
              <select id="admArmRar" class="modal-input" style="width:110px;padding:4px;font-size:11px;">
                <option value="legendary">Легендарный</option>
                <option value="epic">Эпический</option>
                <option value="rare">Редкий</option>
              </select>
              <select id="admArmEnch" class="modal-input" style="width:58px;padding:4px;font-size:11px;">
                ${[4,3,2,1,0].map(e => `<option value="${e}">.${e}</option>`).join('')}
              </select>
              <button class="pixel-btn btn-sm btn-purple" id="btnAdmSpawnArm">Выдать</button>
            </div>
          </div>

          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#4ade80;">${px('loot_gem')} Спавнер Ресурсов, Рун, Зелий и Свитков</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
              <select id="admConsId" class="modal-input" style="flex:1;min-width:170px;padding:4px;font-size:11px;">
                ${consumables.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
              </select>
              <input id="admConsQty" type="number" class="modal-input" style="width:68px;padding:4px;font-size:11px;" value="10" min="1" max="999" />
              <button class="pixel-btn btn-sm btn-green" id="btnAdmSpawnCons">Выдать</button>
            </div>
          </div>
        </div>
      ` : adminTab === 'god' ? `
        <div style="display:flex;flex-direction:column;gap:8px;max-height:310px;overflow-y:auto;">
          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:7px;border-color:#fbbf24;">
            <div style="font-weight:900;color:#ffe08a;">${px('bolt')} Чит-режимы Администратора</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="pixel-btn btn-sm ${ab.godMode ? 'btn-green' : 'btn-dark'}" id="btnAdmGod">Бессмертие (God Mode): ${ab.godMode ? 'ВКЛ' : 'ВЫКЛ'}</button>
              <button class="pixel-btn btn-sm ${ab.oneHit ? 'btn-crimson' : 'btn-dark'}" id="btnAdmOneHit">Ваншот мобов/боссов: ${ab.oneHit ? 'ВКЛ' : 'ВЫКЛ'}</button>
              <button class="pixel-btn btn-sm ${ab.superSpeed ? 'btn-blue' : 'btn-dark'}" id="btnAdmSpeed">Супер-скорость x2.4: ${ab.superSpeed ? 'ВКЛ' : 'ВЫКЛ'}</button>
            </div>
          </div>

          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:7px;">
            <div style="font-weight:800;color:#7cc0ff;">${px('map')} Управление миром и телепорт</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="pixel-btn btn-sm btn-crimson" id="btnAdmKillNear">${px('skull')} Убить всех мобов рядом</button>
              <button class="pixel-btn btn-sm btn-purple" id="btnAdmRespBoss">${px('fire')} Воскресить всех боссов</button>
              <button class="pixel-btn btn-sm btn-gold" id="btnAdmTpBoss">${px('bolt')} Телепорт к боссу</button>
            </div>
            <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">
              <select id="admTpBiome" class="modal-input" style="flex:1;padding:4px;font-size:11px;">
                ${window.World.BIOMES.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('')}
              </select>
              <button class="pixel-btn btn-sm btn-blue" id="btnAdmDoTp">Телепорт в биом</button>
            </div>
          </div>

          <div class="pixel-inset" style="padding:9px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-weight:800;color:#fbbf24;">${px('chat')} Объявление в мировой чат от [АДМИН]</div>
            <div style="display:flex;gap:6px;">
              <input id="admBroadcastInp" class="modal-input" maxlength="100" style="flex:1;padding:5px 8px;font-size:11px;" placeholder="Текст объявления игрокам..." />
              <button class="pixel-btn btn-sm btn-gold" id="btnAdmBroadcast">Отправить</button>
            </div>
          </div>
        </div>
      ` : `
        <div class="pixel-inset" style="padding:10px;border-color:#fbbf24;display:flex;flex-direction:column;gap:9px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
            <div style="font-weight:900;color:#ffe08a;">${px('admin_bot')} Управление Спутником-Ботом</div>
            <div style="display:flex;gap:6px;">
              <button class="pixel-btn btn-sm ${ab.summoned ? 'btn-crimson' : 'btn-green'}" id="btnAdminToggleSummon">
                ${ab.summoned ? 'Отозвать' : 'Призвать'}
              </button>
              <button class="pixel-btn btn-sm btn-blue" id="btnAdminTeleport">${px('bolt')} Ко мне</button>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <span style="font-size:11px;color:#9fb2db;">Режим ИИ:</span>
            <button class="pixel-btn btn-sm ${ab.mode === 'combat' ? 'btn-gold' : 'btn-dark'}" data-ab-mode="combat">Бой + Лут</button>
            <button class="pixel-btn btn-sm ${ab.mode === 'support' ? 'btn-green' : 'btn-dark'}" data-ab-mode="support">Поддержка (Хил + Лут)</button>
            <button class="pixel-btn btn-sm ${ab.mode === 'passive' ? 'btn-blue' : 'btn-dark'}" data-ab-mode="passive">Пассивный</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <span style="font-size:11px;color:#9fb2db;">Множитель силы бота:</span>
            ${[1, 5, 25].map(m => `<button class="pixel-btn btn-sm ${(ab.powerMult || 1) === m ? 'btn-purple' : 'btn-dark'}" data-ab-pmult="${m}">x${m}</button>`).join('')}
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <input id="adminBotNameInp" class="modal-input" maxlength="16" style="flex:1;font-size:11px;padding:5px 8px;" value="${esc(ab.name || 'Админ-Страж')}" placeholder="Имя Админ-Бота" />
            <button class="pixel-btn btn-sm btn-gold" id="btnAdminRename">Переименовать</button>
          </div>
        </div>
      `}`;

    root.querySelectorAll('[data-admtab]').forEach(btn => {
      btn.onclick = () => { adminTab = btn.dataset.admtab; renderCurrentModal(); };
    });

    if (adminTab === 'grant') {
      root.querySelectorAll('[data-adm-gold]').forEach(b => b.onclick = () => { act.giveGold(Number(b.dataset.admGold)); renderCurrentModal(); });
      root.querySelector('#btnAdmCustomGold').onclick = () => { act.giveGold(Number(root.querySelector('#admCustomGold').value)); renderCurrentModal(); };
      root.querySelectorAll('[data-adm-lv]').forEach(b => b.onclick = () => { act.giveLevels(Number(b.dataset.admLv)); renderCurrentModal(); });
      root.querySelector('#btnAdmPts').onclick = () => { act.givePoints(25, 10); renderCurrentModal(); };
      root.querySelector('#btnAdmMastery').onclick = () => { act.boostAllMastery(10); renderCurrentModal(); };
      root.querySelector('#btnAdmHeal').onclick = () => act.fullHealAndResetCd();
      root.querySelector('#btnAdmMounts').onclick = () => act.unlockAllMounts();
      root.querySelector('#btnAdmToolsT8').onclick = () => act.spawnAllToolsT8();
    } else if (adminTab === 'items') {
      root.querySelector('#btnAdmSpawnWep').onclick = () => {
        act.spawnWeapon(
          root.querySelector('#admWepId').value,
          Number(root.querySelector('#admWepTier').value),
          root.querySelector('#admWepRar').value,
          Number(root.querySelector('#admWepEnh').value),
          Number(root.querySelector('#admWepEnch').value),
          root.querySelector('#admWepAffix').value || null
        );
      };
      root.querySelector('#btnAdmSpawnArm').onclick = () => {
        act.spawnArmor(
          root.querySelector('#admArmId').value,
          Number(root.querySelector('#admArmTier').value),
          root.querySelector('#admArmRar').value,
          10,
          Number(root.querySelector('#admArmEnch').value),
          null
        );
      };
      root.querySelector('#btnAdmSpawnCons').onclick = () => {
        act.spawnConsumable(root.querySelector('#admConsId').value, Number(root.querySelector('#admConsQty').value));
      };
    } else if (adminTab === 'god') {
      root.querySelector('#btnAdmGod').onclick = () => {
        ab.godMode = !ab.godMode;
        window.MMO.saveProgress();
        toast('Режим Бессмертия: ' + (ab.godMode ? 'ВКЛ' : 'ВЫКЛ'));
        renderCurrentModal();
      };
      root.querySelector('#btnAdmOneHit').onclick = () => {
        ab.oneHit = !ab.oneHit;
        window.MMO.saveProgress();
        toast('Ваншот мобов/боссов: ' + (ab.oneHit ? 'ВКЛ' : 'ВЫКЛ'));
        renderCurrentModal();
      };
      root.querySelector('#btnAdmSpeed').onclick = () => {
        ab.superSpeed = !ab.superSpeed;
        window.GameState.recalcStats();
        window.MMO.saveProgress();
        toast('Супер-скорость x2.4: ' + (ab.superSpeed ? 'ВКЛ' : 'ВЫКЛ'));
        renderCurrentModal();
      };
      root.querySelector('#btnAdmKillNear').onclick = () => act.killNearbyMonsters(480);
      root.querySelector('#btnAdmRespBoss').onclick = () => act.respawnAllBosses();
      root.querySelector('#btnAdmTpBoss').onclick = () => { if (act.teleportToNearestBoss()) closeModal(); };
      root.querySelector('#btnAdmDoTp').onclick = () => {
        const b = window.World.BIOMES.find(x => x.id === root.querySelector('#admTpBiome').value);
        if (!b) return;
        p.x = b.wp.x; p.y = b.wp.y;
        tgStars.syncAdminBotEntity(true);
        window.Combat.addParticles(b.wp.x, b.wp.y, '#38bdf8', 22, 130);
        toast('[АДМИН] Телепорт: ' + b.name);
        closeModal();
      };
      root.querySelector('#btnAdmBroadcast').onclick = () => {
        const inp = root.querySelector('#admBroadcastInp');
        if (act.broadcastAdmin(inp ? inp.value : '')) inp.value = '';
      };
    } else if (adminTab === 'bot') {
      root.querySelector('#btnAdminToggleSummon').onclick = () => {
        ab.summoned = !ab.summoned;
        if (ab.summoned) tgStars.syncAdminBotEntity(true);
        window.MMO.saveProgress();
        toast(ab.summoned ? 'Админ-Бот призван!' : 'Админ-Бот отозван.');
        renderCurrentModal();
      };
      root.querySelector('#btnAdminTeleport').onclick = () => {
        ab.summoned = true;
        tgStars.syncAdminBotEntity(true);
        toast('Админ-Бот телепортирован к вам!');
        renderCurrentModal();
      };
      root.querySelectorAll('[data-ab-mode]').forEach(btn => {
        btn.onclick = () => {
          ab.mode = btn.dataset.abMode;
          window.MMO.saveProgress();
          toast('Режим Админ-Бота: ' + btn.textContent);
          renderCurrentModal();
        };
      });
      root.querySelectorAll('[data-ab-pmult]').forEach(btn => {
        btn.onclick = () => {
          ab.powerMult = Number(btn.dataset.abPmult) || 1;
          window.MMO.saveProgress();
          toast('Сила Админ-Бота: x' + ab.powerMult);
          renderCurrentModal();
        };
      });
      root.querySelector('#btnAdminRename').onclick = () => {
        const inp = root.querySelector('#adminBotNameInp');
        const val = (inp && inp.value.trim()) || 'Админ-Страж';
        ab.name = val.slice(0, 16);
        tgStars.syncAdminBotEntity(false);
        window.MMO.saveProgress();
        toast('Новое имя Админ-Бота: ' + ab.name);
        renderCurrentModal();
      };
    }
  }

  function renderCraftModal(root) {
    const prof = window.GameState.professions;
    const axeT = window.MMO.getBestToolTier('axe');
    const pickT = window.MMO.getBestToolTier('pickaxe');
    const sickT = window.MMO.getBestToolTier('sickle');
    const filtered = window.MMO.CRAFT_RECIPES.filter(r => (r.cat || 'gear') === craftCat);

    root.innerHTML = `
      <div class="pixel-inset" style="padding:7px 9px;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:11px;">
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <span>${px('craft')} Кузнец: <b>Ур.${prof['Кузнечное дело'] || 1}</b></span>
          <span>${px('hp_vial')} Алхимия: <b>Ур.${prof['Алхимия'] || 1}</b></span>
          <span>${px('loot_gem')} Ювелир: <b>Ур.${prof['Ювелирка'] || 1}</b></span>
        </div>
        <div style="display:flex;gap:8px;color:#ffe08a;font-weight:800;">
          <span>${px('axe_tool')} Топор: T${axeT}</span>
          <span>${px('pickaxe')} Кирка: T${pickT}</span>
          <span>${px('sickle_tool')} Серп: T${sickT}</span>
        </div>
      </div>
      <div class="tab-strip">
        ${[
          ['tools',   'axe_tool', 'Инструменты T2–T8'],
          ['gear',    'weapons',  'Оружие и Броня T3–T8'],
          ['alchemy', 'enchant',  'Алхимия и Чары']
        ].map(t => `<button class="tab-btn ${craftCat === t[0] ? 'active' : ''}" data-ccat="${t[0]}">${px(t[1])} ${t[2]}</button>`).join('')}
        <div style="margin-left:auto;font-weight:800;color:#ffe08a;">${px('coin')} ${window.GameState.player.gold.toLocaleString()}</div>
      </div>
      <div class="list-stack" style="max-height:270px;">
        ${filtered.map(r => {
          const reqStr = Object.entries(r.req).map(([k, v]) => {
            const have = window.MMO.countTemplateInBag(k);
            const nm = window.GameData.CONSUMABLES[k]?.name || k;
            return `<span style="color:${have >= v ? '#6ee7a8' : '#ff8090'}">${nm}: ${have}/${v}</span>`;
          }).join(' • ');
          return `
            <div class="list-row">
              <div>
                <div class="list-row-title">${esc(r.name)} <span style="font-size:10px;color:#9fb2db;">(${r.prof})</span></div>
                <div class="list-row-sub">${reqStr} • ${px('coin')} ${r.gold.toLocaleString()}</div>
              </div>
              <button class="pixel-btn btn-sm btn-green" data-craft-id="${r.id}">${px('craft')} Создать</button>
            </div>`;
        }).join('')}
      </div>`;
    root.querySelectorAll('[data-ccat]').forEach(b => {
      b.onclick = () => { craftCat = b.dataset.ccat; renderCurrentModal(); };
    });
    root.querySelectorAll('[data-craft-id]').forEach(btn => {
      btn.onclick = () => { if (window.MMO.craftRecipe(btn.dataset.craftId)) renderCurrentModal(); };
    });
  }

  function renderStorageModal(root) {
    const bag = window.GameState.inventory;
    const bank = window.GameState.storage;
    root.innerHTML = `
      <div class="trade-layout">
        <div class="trade-side pixel-inset">
          <div style="font-weight:800;color:#ffe08a;">${px('inventory')} Сумка (${bag.length}/60) — нажми чтобы положить</div>
          <div class="bag-grid" style="max-height:230px;">
            ${bag.map(it => renderSlotHtml(it, `data-st-in="${it.uid}"`)).join('')}
          </div>
        </div>
        <div class="trade-side pixel-inset">
          <div style="font-weight:800;color:#7cc0ff;">${px('storage')} Склад (${bank.length}/40) — нажми чтобы забрать</div>
          <div class="bag-grid" style="max-height:230px;">
            ${bank.map(it => renderSlotHtml(it, `data-st-out="${it.uid}"`)).join('')}
          </div>
        </div>
      </div>`;
    root.querySelectorAll('[data-st-in]').forEach(el => el.onclick = () => {
      const idx = bag.findIndex(x => x.uid === el.dataset.stIn);
      if (idx !== -1 && window.MMO.addItemToBag(bag[idx], bank, 40)) { bag.splice(idx, 1); renderCurrentModal(); }
    });
    root.querySelectorAll('[data-st-out]').forEach(el => el.onclick = () => {
      const idx = bank.findIndex(x => x.uid === el.dataset.stOut);
      if (idx !== -1 && window.MMO.addItemToBag(bank[idx], bag, 60)) { bank.splice(idx, 1); renderCurrentModal(); }
    });
  }

  function renderQuestsModal(root) {
    root.innerHTML = `
      <div class="list-stack">
        ${window.MMO.QUEST_DEFS.map(q => {
          const st = window.GameState.quests[q.id] || { prog: 0, claimed: false };
          const ready = st.prog >= q.need && !st.claimed;
          return `
            <div class="list-row" style="${ready ? 'border-color:#34d399;' : ''}">
              <div>
                <div class="list-row-title">${px(q.daily ? 'clock' : 'diamond_quest')} ${esc(q.title)}</div>
                <div class="list-row-sub">${esc(q.goalText)} — Прогресс: <b>${st.prog} / ${q.need}</b></div>
                <div class="list-row-sub" style="color:#ffe08a;">Награда: ${px('coin')} ${q.rewardGold} • ${px('skills')} ${q.rewardXp} XP</div>
              </div>
              ${st.claimed
                ? `<span style="color:#6ee7a8;font-weight:800;">${px('check')} Выполнено</span>`
                : `<button class="pixel-btn btn-sm ${ready ? 'btn-green' : 'btn-dark'}" data-claim-q="${q.id}" ${ready ? '' : 'disabled'}>${ready ? 'Забрать' : 'В процессе'}</button>`}
            </div>`;
        }).join('')}
      </div>`;
    root.querySelectorAll('[data-claim-q]').forEach(btn => btn.onclick = () => { window.MMO.claimQuest(btn.dataset.claimQ); renderCurrentModal(); });
  }

  function renderAchievementsModal(root) {
    root.innerHTML = `
      <div class="list-stack">
        ${window.MMO.ACHIEVEMENTS.map(a => {
          const val = window.MMO.getAchievementVal(a.stat);
          const done = val >= a.need;
          const claimed = !!window.GameState.claimedAchievements[a.id];
          return `
            <div class="list-row">
              <div>
                <div class="list-row-title">${px('achievements')} ${esc(a.name)}</div>
                <div class="list-row-sub">${esc(a.desc)} (${Math.min(val, a.need)} / ${a.need}) • Награда: ${px('coin')} ${a.rewardGold}</div>
              </div>
              ${claimed
                ? `<span style="color:#6ee7a8;font-weight:800;">Получено</span>`
                : `<button class="pixel-btn btn-sm ${done ? 'btn-gold' : 'btn-dark'}" data-claim-ach="${a.id}" ${done ? '' : 'disabled'}>${done ? 'Забрать' : 'Закрыто'}</button>`}
            </div>`;
        }).join('')}
      </div>`;
    root.querySelectorAll('[data-claim-ach]').forEach(btn => btn.onclick = () => { window.MMO.claimAchievement(btn.dataset.claimAch); renderCurrentModal(); });
  }

  function renderLeaderboardModal(root) {
    const p = window.GameState.player;
    const rows = [
      { name: p.name, isMe: true, clan: p.clanTag || '-', level: p.level, power: window.GameState.computedStats.power, pvp: p.pvpRating || 1000, gold: p.gold }
    ].concat(window.Bots.list.map(b => ({
      name: b.name, isMe: false, clan: b.clanTag || '-', level: b.level, power: b.power, pvp: b.pvpRating, gold: b.gold
    })));

    rows.sort((a, b) => (b[leaderboardSort] || 0) - (a[leaderboardSort] || 0));

    root.innerHTML = `
      <div class="tab-strip">
        ${[
          ['power', 'weapons', 'Боевая мощь'],
          ['level', 'skills', 'Уровень'],
          ['pvp',   'pvp', 'PvP Рейтинг'],
          ['gold',  'coin', 'Богатство']
        ].map(t =>
          `<button class="tab-btn ${leaderboardSort===t[0]?'active':''}" data-lb-sort="${t[0]}">${px(t[1])} ${t[2]}</button>`
        ).join('')}
      </div>
      <div class="list-stack">
        ${rows.map((r, i) => `
          <div class="list-row" style="${r.isMe ? 'border-color:#fbbf24;background:#231f3a;' : ''}">
            <div class="list-row-left">
              <div style="width:26px;font-weight:900;color:${i<3?'#fbbf24':'#9fb2db'};">#${i+1}</div>
              <div>
                <div class="list-row-title">${r.isMe ? px('crown') + ' ' : ''}[${esc(r.clan)}] ${esc(r.name)}</div>
                <div class="list-row-sub">Ур. ${r.level} • PvP: ${r.pvp} • ${px('coin')} ${r.gold.toLocaleString()}</div>
              </div>
            </div>
            <div style="font-weight:900;color:#7cc0ff;">${px('weapons')} ${r.power}</div>
          </div>`).join('')}
      </div>`;
    root.querySelectorAll('[data-lb-sort]').forEach(b => b.onclick = () => { leaderboardSort = b.dataset.lbSort; renderCurrentModal(); });
  }

  function renderSettingsModal(root) {
    const set = window.GameState.settings;
    const mp = window.Multiplayer ? window.Multiplayer.getStatus() : { status: 'offline', wsUrl: '', onlineCount: 1, lastError: '' };
    const remoteList = window.Multiplayer ? window.Multiplayer.getRemotePlayers() : [];
    const redeemed = window.GameState.redeemedPromos || [];

    const mpColor = mp.status === 'connected' ? '#4ade80' : (mp.status === 'connecting' ? '#fbbf24' : '#f87171');
    const mpLabel = mp.status === 'connected' ? 'ПОДКЛЮЧЕНО (Онлайн: ' + mp.onlineCount + ')' : (mp.status === 'connecting' ? 'ПОДКЛЮЧЕНИЕ...' : 'ОФЛАЙН');

    root.innerHTML = `
      <div class="tab-strip">
        <button class="tab-btn ${settingsTab === 'general' ? 'active' : ''}" data-stab="general">${px('settings')} Основные</button>
        <button class="tab-btn ${settingsTab === 'multiplayer' ? 'active' : ''}" data-stab="multiplayer">${px('online')} Мультиплеер</button>
        <button class="tab-btn ${settingsTab === 'promo' ? 'active' : ''}" data-stab="promo">${px('promo')} Промокод</button>
      </div>

      ${settingsTab === 'general' ? `
        <div style="display:flex;flex-direction:column;gap:10px;max-width:520px;margin:auto;">
          <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:8px;border-color:#d9a742;">
            <div style="font-weight:900;color:#ffe08a;">${px('settings')} Расположение кнопок на экране (Редактор HUD)</div>
            <div style="font-size:11px;color:#b7c7eb;">Перетащите джойстик, кнопку атаки, навыки, карту, чат и любые панели в удобное место экрана.</div>
            <button class="pixel-btn btn-gold" id="btnOpenHudEditor">${px('scale')} Настроить расположение всех кнопок</button>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
              <span style="font-size:10px;color:#9fb2db;">Быстрые пресеты:</span>
              <button class="pixel-btn btn-sm btn-dark" data-set-preset="default">Стандарт</button>
              <button class="pixel-btn btn-sm btn-blue" data-set-preset="lefty">Левша</button>
              <button class="pixel-btn btn-sm btn-purple" data-set-preset="arcade">Аркада</button>
              <button class="pixel-btn btn-sm btn-crimson" id="btnSetResetHud">Сбросить позиции</button>
            </div>
          </div>
          <div class="pixel-inset" style="padding:10px;">
            <div style="font-weight:800;color:#ffe08a;margin-bottom:6px;">${px('scale')} Масштаб интерфейса (GUI Scale): <span id="setScaleVal">${Math.round(set.uiScale * 100)}%</span></div>
            <input id="setScaleSlider" type="range" min="65" max="130" step="5" value="${Math.round(set.uiScale * 100)}" style="width:100%;" />
            <div style="display:flex;justify-content:space-between;font-size:10px;color:#9fb2db;"><span>65% (Компакт)</span><span>100%</span><span>130% (Крупный)</span></div>
          </div>
          <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:8px;">
            <label style="display:flex;justify-content:space-between;align-items:center;"><span>${px('loot_gem')} Автоподбор добычи</span><input type="checkbox" id="chkAutoLoot" ${set.autoLoot?'checked':''} /></label>
            <label style="display:flex;justify-content:space-between;align-items:center;"><span>${px('bolt')} Оптимизация FPS (меньше частиц)</span><input type="checkbox" id="chkLowFx" ${set.lowFx?'checked':''} /></label>
            <label style="display:flex;justify-content:space-between;align-items:center;"><span>${px('fire')} Вибрация при критах</span><input type="checkbox" id="chkHaptics" ${set.haptics?'checked':''} /></label>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="pixel-btn btn-green" id="btnManualSave">${px('save')} Сохранить прогресс</button>
            <button class="pixel-btn btn-blue" id="btnBackTitle">${px('exit')} Главное меню</button>
            <button class="pixel-btn btn-crimson" id="btnResetProgress">${px('trash')} Сбросить сохранение</button>
          </div>
        </div>
      ` : settingsTab === 'multiplayer' ? `
        <div style="display:flex;flex-direction:column;gap:10px;max-width:540px;margin:auto;">
          <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:8px;border-color:#22d3ee;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
              <div style="font-weight:900;color:#22d3ee;">${px('online')} Онлайн Мультиплеер (Supabase Realtime)</div>
              <span style="font-size:11px;font-weight:800;color:${mpColor};">${mpLabel}</span>
            </div>
            <div style="font-size:11px;color:#b7c7eb;">Бесплатный онлайн без своего сервера (до 200 игроков). Вставьте Project URL и Publishable / Anon ключ из Supabase:</div>
            <input id="sbUrlInput" class="modal-input" style="width:100%;font-size:11px;padding:6px 8px;" placeholder="https://xxxxx.supabase.co" value="${esc(mp.sbUrl || '')}" />
            <input id="sbKeyInput" class="modal-input" style="width:100%;font-size:11px;padding:6px 8px;" placeholder="sb_publishable_... или eyJ..." value="${esc(mp.sbKey || '')}" />
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${mp.status === 'connected' || mp.status === 'connecting'
                ? `<button class="pixel-btn btn-sm btn-crimson" id="btnWsDisconnect">Отключить</button>`
                : `<button class="pixel-btn btn-sm btn-green" id="btnSbConnect">Подключить Supabase</button>`}
            </div>
            ${mp.lastError ? `<div style="font-size:10px;color:#f87171;">Статус: ${esc(mp.lastError)}</div>` : ''}
            <div style="font-size:10px;color:#9fb2db;">
              Авто-онлайн в Telegram Mini App: добавьте в ссылку <b style="color:#ffe08a;">&amp;sb=https://xxx.supabase.co&amp;sbkey=КЛЮЧ</b>
            </div>
            <details style="font-size:10px;color:#9fb2db;margin-top:2px;">
              <summary style="cursor:pointer;color:#b7c7eb;font-weight:700;">Или подключить свой WebSocket-сервер (wss://...)</summary>
              <div style="display:flex;gap:6px;margin-top:6px;">
                <input id="wsUrlInput" class="modal-input" style="flex:1;font-size:11px;padding:6px 8px;" placeholder="wss://your-server.com" value="${esc(mp.wsUrl || '')}" />
                <button class="pixel-btn btn-sm btn-blue" id="btnWsConnect">Подключить WS</button>
              </div>
            </details>
          </div>

          <div class="pixel-inset" style="padding:10px;">
            <div style="font-weight:800;color:#ffe08a;margin-bottom:6px;">Игроки онлайн (${remoteList.length + (mp.status === 'connected' ? 1 : 0)}):</div>
            <div class="list-stack" style="max-height:150px;">
              ${mp.status === 'connected' ? `
                <div class="list-row" style="border-color:#4ade80;">
                  <div class="list-row-title" style="color:#fde047;">${esc(window.GameState.player.name)} (Вы) • Ур.${window.GameState.player.level}</div>
                  <div class="list-row-sub">${esc(window.World.getBiomeAt(window.GameState.player.x, window.GameState.player.y).name)}</div>
                </div>
                ${remoteList.map(rp => `
                  <div class="list-row">
                    <div class="list-row-title" style="color:#22d3ee;">${rp.clanTag ? '[' + esc(rp.clanTag) + '] ' : ''}${esc(rp.name)} • Ур.${rp.level}</div>
                    <div class="list-row-sub">${esc(window.World.getBiomeAt(rp.x, rp.y).name)} ${rp.pvp ? '• PvP' : ''}</div>
                  </div>
                `).join('') || '<div style="font-size:11px;color:#9fb2db;padding:6px;">Вы пока один онлайн. Пригласите друзей в бота!</div>'}
              ` : '<div style="font-size:11px;color:#9fb2db;padding:6px;">Нет активного подключения. Введите URL и ключ Supabase выше и нажмите «Подключить Supabase».</div>'}
            </div>
          </div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px;max-width:520px;margin:auto;">
          <div class="pixel-inset" style="padding:12px;display:flex;flex-direction:column;gap:8px;border-color:#d9a742;">
            <div style="font-weight:900;color:#ffe08a;font-size:13px;">${px('promo')} Активация промокода</div>
            <div style="font-size:11px;color:#b7c7eb;">Введите подарочный промокод, чтобы получить золото, зелья, инструменты, руны чар или специальные бонусы.</div>
            <div style="display:flex;gap:6px;">
              <input id="promoCodeInput" class="modal-input" maxlength="28" style="flex:1;text-transform:uppercase;font-weight:800;letter-spacing:1px;" placeholder="ВВЕДИТЕ ПРОМОКОД..." />
              <button class="pixel-btn btn-gold" id="btnRedeemPromo">${px('check')} Активировать</button>
            </div>
            <div id="promoStatusMsg" style="font-size:11px;color:#9fb2db;min-height:14px;"></div>
            <div style="font-size:10px;color:#8fa2cc;">
              Поддерживаются встроенные промокоды и серверные коды вашего Telegram-бота (endpoint <b>POST /api/redeem-promo</b>).
            </div>
          </div>

          <div class="pixel-inset" style="padding:10px;">
            <div style="font-weight:800;color:#6ee7a8;margin-bottom:6px;">Активированные промокоды (${redeemed.length}):</div>
            ${redeemed.length > 0
              ? `<div style="display:flex;flex-wrap:wrap;gap:6px;">${redeemed.map(c => `<span class="trend-pill trend-up" style="padding:3px 7px;font-size:10px;">${esc(c)}</span>`).join('')}</div>`
              : '<div style="font-size:11px;color:#9fb2db;">Вы ещё не активировали ни одного промокода.</div>'}
          </div>
        </div>
      `}`;

    root.querySelectorAll('[data-stab]').forEach(btn => {
      btn.onclick = () => { settingsTab = btn.dataset.stab; renderCurrentModal(); };
    });

    if (settingsTab === 'general') {
      root.querySelector('#btnOpenHudEditor').onclick = () => {
        if (window.GameAPI && window.GameAPI.enterHudEditMode) window.GameAPI.enterHudEditMode();
      };
      root.querySelectorAll('[data-set-preset]').forEach(btn => {
        btn.onclick = () => { if (window.GameAPI) window.GameAPI.applyHudPreset(btn.dataset.setPreset); };
      });
      root.querySelector('#btnSetResetHud').onclick = () => {
        if (window.GameAPI) window.GameAPI.resetHudLayout();
      };
      root.querySelector('#setScaleSlider').oninput = e => {
        const pct = Number(e.target.value);
        root.querySelector('#setScaleVal').textContent = pct + '%';
        window.GameAPI.setUiScale(pct / 100);
      };
      root.querySelector('#chkAutoLoot').onchange = e => { set.autoLoot = e.target.checked; };
      root.querySelector('#chkLowFx').onchange = e => { set.lowFx = e.target.checked; };
      root.querySelector('#chkHaptics').onchange = e => { set.haptics = e.target.checked; };
      root.querySelector('#btnManualSave').onclick = () => { window.MMO.saveProgress(); toast('Прогресс сохранён!'); };
      root.querySelector('#btnBackTitle').onclick = () => { window.MMO.saveProgress(); closeModal(); document.getElementById('startScreen').classList.remove('hidden'); };
      root.querySelector('#btnResetProgress').onclick = () => {
        window.MMO.clearSavedProgress();
        toast('Сохранение удалено. Перезагрузка...');
        setTimeout(() => location.reload(), 600);
      };
    } else if (settingsTab === 'multiplayer') {
      const sbBtn = root.querySelector('#btnSbConnect');
      if (sbBtn && window.Multiplayer) {
        sbBtn.onclick = () => {
          const u = root.querySelector('#sbUrlInput');
          const k = root.querySelector('#sbKeyInput');
          window.Multiplayer.connectSupabase(u ? u.value : '', k ? k.value : '');
          renderCurrentModal();
        };
      }
      const connBtn = root.querySelector('#btnWsConnect');
      if (connBtn && window.Multiplayer) {
        connBtn.onclick = () => {
          const inp = root.querySelector('#wsUrlInput');
          window.Multiplayer.connect(inp ? inp.value : '');
          renderCurrentModal();
        };
      }
      const discBtn = root.querySelector('#btnWsDisconnect');
      if (discBtn && window.Multiplayer) {
        discBtn.onclick = () => { window.Multiplayer.disconnect(false); renderCurrentModal(); };
      }
    } else if (settingsTab === 'promo') {
      const inp = root.querySelector('#promoCodeInput');
      const btn = root.querySelector('#btnRedeemPromo');
      const statusEl = root.querySelector('#promoStatusMsg');
      const submitPromo = async () => {
        if (!inp || !btn) return;
        btn.disabled = true;
        const res = await window.MMO.redeemPromoCode(inp.value);
        btn.disabled = false;
        if (res && res.ok) {
          inp.value = '';
          renderCurrentModal();
        } else if (statusEl && res) {
          statusEl.style.color = '#f87171';
          statusEl.textContent = res.msg || 'Не удалось активировать код.';
        }
      };
      if (btn) btn.onclick = submitPromo;
      if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') submitPromo(); });
    }
  }

  function openBotActions(botId) {
    const b = window.Bots.byId(botId);
    if (!b) return;
    openSubModal('character', '[' + b.clanTag + '] ' + b.name + ' (Ур.' + b.level + ')', `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
        <div class="item-slot rarity-${b.equipment.weapon?.rarity || 'common'}"><img src="${window.Sprites.getItemIcon(b.equipment.weapon)}" /></div>
        <div>
          <div style="font-weight:800;color:#ffe08a;">Оружие: ${esc(b.equipment.weapon?.name || 'Меч')} <span class="role-badge" style="color:${b.roleColor || '#94a3b8'};">${esc(b.roleLabel || 'Игрок')}</span></div>
          <div style="font-size:11px;color:#b7c7eb;">${px('weapons')} Боевая мощь: ${b.power} • ${px('coin')} ${b.gold}</div>
          <div style="font-size:11px;color:#7cc0ff;">Маунт: ${esc(window.GameData.MOUNT_BY_ID[b.ownedMountId]?.name || '-')}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
        <button class="pixel-btn btn-gold" id="bActTrade">${px('trade')} Предложить трейд</button>
        <button class="pixel-btn btn-blue" id="bActParty">${px('party')} В группу</button>
        <button class="pixel-btn btn-crimson" id="bActDuel">${px('pvp')} Вызвать на дуэль</button>
        <button class="pixel-btn btn-dark" id="bActClose">Закрыть</button>
      </div>`, r => {
      r.querySelector('#bActTrade').onclick = () => { closeSubModal(); window.MMO.startTradeWithBot(botId); };
      r.querySelector('#bActParty').onclick = () => { window.MMO.inviteBotToParty(botId); closeSubModal(); };
      r.querySelector('#bActDuel').onclick = () => { window.MMO.startDuelWithBot(botId); closeSubModal(); };
      r.querySelector('#bActClose').onclick = closeSubModal;
    });
  }

  function openRemotePlayerActions(playerId) {
    const rp = window.Multiplayer && window.Multiplayer.getRemotePlayerById(playerId);
    if (!rp) return;
    const inParty = window.Multiplayer.isInMyParty(playerId);
    const biome = window.World.getBiomeAt(rp.x, rp.y);
    openSubModal('online', '[ИГРОК] ' + rp.name + ' (Ур.' + rp.level + ')', `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
        <div class="item-slot rarity-${rp.equipment?.weapon?.rarity || 'common'}"><img src="${window.Sprites.getItemIcon(rp.equipment?.weapon)}" /></div>
        <div>
          <div style="font-weight:800;color:#22d3ee;">${esc(rp.name)} • Ур.${rp.level} ${inParty ? '<span style="color:#4ade80;">[В ПАТИ]</span>' : ''}</div>
          <div style="font-size:11px;color:#b7c7eb;">HP: ${Math.round(rp.hp)} / ${rp.maxHp} • Зона: ${esc(biome.name)}</div>
          <div style="font-size:11px;color:${rp.pvp ? '#f87171' : '#9fb2db'};">Режим PvP: ${rp.pvp ? 'ВКЛЮЧЁН (можно атаковать вне города)' : 'выключен'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
        <button class="pixel-btn btn-gold" id="rpActTrade">${px('trade')} Предложить обмен</button>
        ${inParty
          ? `<button class="pixel-btn btn-green" id="rpActTp">${px('party')} Телепорт к союзнику</button>`
          : `<button class="pixel-btn btn-blue" id="rpActParty">${px('party')} Пригласить в пати</button>`}
        ${inParty ? `<button class="pixel-btn btn-crimson" id="rpActLeave">Выйти из пати</button>` : `<button class="pixel-btn btn-dark" id="rpActAuction">${px('auction')} Онлайн-Аукцион</button>`}
        <button class="pixel-btn btn-dark" id="rpActClose">Закрыть</button>
      </div>`, r => {
      r.querySelector('#rpActTrade').onclick = () => { closeSubModal(); window.Multiplayer.requestTrade(playerId); };
      const pb = r.querySelector('#rpActParty');
      if (pb) pb.onclick = () => { window.Multiplayer.invitePlayerToParty(playerId); closeSubModal(); };
      const tb = r.querySelector('#rpActTp');
      if (tb) tb.onclick = () => { window.Multiplayer.teleportToPartyMate(playerId); closeSubModal(); };
      const lb = r.querySelector('#rpActLeave');
      if (lb) lb.onclick = () => { window.Multiplayer.leaveRealParty(false); closeSubModal(); };
      const ab = r.querySelector('#rpActAuction');
      if (ab) ab.onclick = () => { closeSubModal(); auctionTab = 'online'; openModal('auction'); };
      r.querySelector('#rpActClose').onclick = closeSubModal;
    });
  }

  function renderChat() {
    const box = document.getElementById('chatMessages');
    if (!box) return;
    const items = window.MMO.chatLog.filter(m => chatChannel === 'all' || m.ch === chatChannel || m.ch === 'system');
    box.innerHTML = items.map(m =>
      `<div class="chat-msg chat-ch-${m.ch}"><span class="chat-sender" ${m.botId ? `data-chat-bot="${m.botId}"` : ''}>[${esc(m.sender)}]</span> ${esc(m.text)}</div>`
    ).join('');
    box.scrollTop = box.scrollHeight;
    box.querySelectorAll('[data-chat-bot]').forEach(el => {
      el.onclick = () => openBotActions(el.dataset.chatBot);
    });
  }

  function setChatChannel(ch) {
    chatChannel = ch;
    renderChat();
  }

  return {
    toast,
    openModal,
    closeModal,
    openSubModal,
    closeSubModal,
    isAnyModalOpen,
    handleBack,
    renderCurrentModal,
    openBotActions,
    openRemotePlayerActions,
    renderChat,
    setChatChannel
  };
})();
