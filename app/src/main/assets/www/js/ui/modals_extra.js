/* ==========================================================================
   BladeRealm — Extended Modals UI:
   Cosmetics Wardrobe, Party Raid Dungeons, Clan Wars Fortresses,
   Ranked PvP Arena, Battle Pets, 7-Day Daily & Battle Pass,
   PK / Bounty Hunter Board, and Cloud Save Settings Tab
   100% Custom Procedural Pixel-Art Icons (ZERO Emojis)
   ========================================================================== */

window.ExtraModals = (function () {
  let cosTab = 'head';
  let bpTab = 'daily';
  let selectedPetId = 'pet_wolf';

  function px(name, cls, size) {
    return window.PixelIcons ? window.PixelIcons.imgTag(name, cls || 'px-ico-xs', size || 18) : '';
  }

  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
  }

  function refresh() {
    if (window.UI && window.UI.renderCurrentModal) window.UI.renderCurrentModal();
  }

  // =========================================================================
  // 1. COSMETICS WARDROBE (Headwear, Wings, Auras, Trails, Titles, Appearance)
  // =========================================================================
  function renderCosmeticsModal(root) {
    const p = window.GameState.player;
    const cos = window.Progression.ensureCosmeticsState();
    const CD = window.CosmeticsData;
    const tabs = [
      ['head', 'crown', 'Голова'],
      ['back', 'cosmetics', 'Крылья'],
      ['aura', 'bolt', 'Ауры'],
      ['trail', 'dash_boot', 'Следы'],
      ['title', 'achievements', 'Титулы'],
      ['appearance', 'character', 'Цвета тела']
    ];
    const filtered = cosTab === 'appearance' ? [] : CD.COSMETICS.filter(c => c.slot === cosTab);

    root.innerHTML = `
      <div class="inv-layout">
        <div class="paperdoll-box pixel-inset">
          <div class="paperdoll-center">
            <canvas id="cosPreviewCanvas" width="144" height="148"></canvas>
            <div style="font-weight:900;color:#ffe08a;margin-top:4px;">${esc(p.name)}</div>
            <div style="font-size:10px;color:#7cc0ff;margin-top:2px;">
              ${cos.equipped.title && CD.COSMETIC_BY_ID[cos.equipped.title]
                ? '&lt;' + esc(CD.COSMETIC_BY_ID[cos.equipped.title].name) + '&gt;'
                : 'Без титула'}
            </div>
            <div style="font-size:11px;color:#fbbf24;margin-top:4px;">${px('coin')} ${Math.floor(p.gold).toLocaleString('ru-RU')} зол.</div>
          </div>
          <label style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#dbe7ff;padding:6px;background:rgba(16,24,48,0.8);border-radius:6px;">
            <span>Скрыть боевой шлем</span>
            <input type="checkbox" id="chkCosHideHelm" ${cos.hideHelmet ? 'checked' : ''} />
          </label>
          <div style="font-size:10px;color:#9fb2db;line-height:1.35;text-align:center;">
            Вся косметика и цвета видны другим игрокам в реальном времени!
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="tab-strip" style="margin-bottom:2px;">
            ${tabs.map(t => `<button class="tab-btn ${cosTab === t[0] ? 'active' : ''}" data-ctab="${t[0]}">${px(t[1])} ${t[2]}</button>`).join('')}
          </div>

          ${cosTab === 'appearance' ? `
            <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:8px;">
              <div>
                <div style="font-size:11px;font-weight:800;color:#ffe08a;margin-bottom:4px;">Цвет кожи</div>
                <div class="swatch-row" style="flex-wrap:wrap;">
                  ${CD.SKIN_COLORS.map(c => `<div class="swatch ${p.appearance.skin === c.hex ? 'active' : ''}" data-app-key="skin" data-app-val="${c.hex}" title="${c.name}" style="background:${c.hex}"></div>`).join('')}
                </div>
              </div>
              <div>
                <div style="font-size:11px;font-weight:800;color:#ffe08a;margin-bottom:4px;">Цвет волос / головы</div>
                <div class="swatch-row" style="flex-wrap:wrap;">
                  ${CD.HAIR_COLORS.map(c => `<div class="swatch ${p.appearance.hair === c.hex ? 'active' : ''}" data-app-key="hair" data-app-val="${c.hex}" title="${c.name}" style="background:${c.hex}"></div>`).join('')}
                </div>
              </div>
              <div>
                <div style="font-size:11px;font-weight:800;color:#ffe08a;margin-bottom:4px;">Причёска</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${CD.HAIR_STYLES.map(st => `<button class="pixel-btn btn-sm ${(p.appearance.hairStyle || 'spiky') === st.id ? 'btn-gold' : 'btn-dark'}" data-app-key="hairStyle" data-app-val="${st.id}">${st.name}</button>`).join('')}
                </div>
              </div>
              <div>
                <div style="font-size:11px;font-weight:800;color:#ffe08a;margin-bottom:4px;">Цвет плаща</div>
                <div class="swatch-row" style="flex-wrap:wrap;">
                  ${CD.CLOAK_COLORS.map(c => `<div class="swatch ${p.appearance.cloak === c.hex ? 'active' : ''}" data-app-key="cloak" data-app-val="${c.hex}" title="${c.name}" style="background:${c.hex}"></div>`).join('')}
                </div>
              </div>
              <div>
                <div style="font-size:11px;font-weight:800;color:#ffe08a;margin-bottom:4px;">Цвет глаз</div>
                <div class="swatch-row" style="flex-wrap:wrap;">
                  ${CD.EYE_COLORS.map(c => `<div class="swatch ${(p.appearance.eye || '#ef4444') === c.hex ? 'active' : ''}" data-app-key="eye" data-app-val="${c.hex}" title="${c.name}" style="background:${c.hex}"></div>`).join('')}
                </div>
              </div>
            </div>
          ` : `
            <div class="list-stack" style="max-height:330px;overflow-y:auto;">
              ${filtered.map(item => {
                const owned = cos.owned.includes(item.id);
                const equipped = cos.equipped[item.slot] === item.id;
                const lockedSpecial = !owned && item.price === 0 && item.unlockHint;
                return `
                  <div class="list-row rarity-${item.rarity}">
                    <div class="list-row-left">
                      <div class="cos-color-dot" style="background:${item.color};"></div>
                      <div>
                        <div class="list-row-title text-${item.rarity}">${esc(item.name)} ${equipped ? '<span style="color:#4ade80;">[НАДЕТО]</span>' : ''}</div>
                        <div class="list-row-sub">${esc(item.desc)}${lockedSpecial ? ' • <b style="color:#fbbf24;">' + esc(item.unlockHint) + '</b>' : ''}</div>
                      </div>
                    </div>
                    ${owned
                      ? `<button class="pixel-btn btn-sm ${equipped ? 'btn-crimson' : 'btn-green'}" data-cos-act="${item.id}">${equipped ? 'Снять' : 'Надеть'}</button>`
                      : lockedSpecial
                        ? `<button class="pixel-btn btn-sm btn-dark" disabled>Закрыто</button>`
                        : `<button class="pixel-btn btn-sm btn-gold" data-cos-act="${item.id}">${px('coin')} ${item.price.toLocaleString('ru-RU')}</button>`}
                  </div>`;
              }).join('')}
            </div>
          `}
        </div>
      </div>`;

    // Draw live hero preview with equipped cosmetics
    const cv = root.querySelector('#cosPreviewCanvas');
    if (cv) {
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.translate(cv.width / 2, cv.height * 0.72);
      ctx.scale(2.15, 2.15);
      const clone = Object.assign({}, p, {
        x: 0, y: 0, facingX: 1, mountedId: null, state: 'idle',
        isPlayer: true, hideNameplate: true, showAura: true
      });
      window.Sprites.drawCharacter(ctx, clone, performance.now() * 0.001);
      ctx.restore();
    }

    root.querySelectorAll('[data-ctab]').forEach(b => {
      b.onclick = () => { cosTab = b.dataset.ctab; refresh(); };
    });
    const chk = root.querySelector('#chkCosHideHelm');
    if (chk) {
      chk.onchange = e => {
        cos.hideHelmet = e.target.checked;
        window.MMO.saveProgress();
        refresh();
      };
    }
    root.querySelectorAll('[data-app-key]').forEach(el => {
      el.onclick = () => {
        p.appearance[el.dataset.appKey] = el.dataset.appVal;
        window.MMO.saveProgress();
        if (window.GameAudio) window.GameAudio.playSfx('coin');
        refresh();
      };
    });
    root.querySelectorAll('[data-cos-act]').forEach(btn => {
      btn.onclick = () => {
        window.Progression.buyOrEquipCosmetic(btn.dataset.cosAct);
        refresh();
      };
    });
  }

  // =========================================================================
  // 2. PARTY RAID DUNGEONS
  // =========================================================================
  function renderDungeonsModal(root) {
    const p = window.GameState.player;
    const inDung = window.Activities.isInDungeon();
    const partyCnt = (window.Multiplayer && window.Multiplayer.realParty.members.length) || 1;

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="pixel-inset" style="padding:10px;border-color:#c084fc;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-weight:900;color:#e9d5ff;font-size:13px;">${px('dungeon')} Инстанс-Рейды и Подземелья</div>
            <div style="font-size:11px;color:#b7c7eb;">3 волны элитных монстров + Рейд-Босс! Смерть в данже безопасна (0% потерь вещей).</div>
          </div>
          <div style="font-size:11px;font-weight:800;color:#4ade80;">Отряд: ${partyCnt} игрок(ов)</div>
        </div>

        ${inDung ? `
          <div class="pixel-inset" style="padding:12px;border-color:#f97316;text-align:center;">
            <div style="font-weight:900;color:#fde047;margin-bottom:8px;">Вы сейчас находитесь в Рейдовом Подземелье!</div>
            <button class="pixel-btn btn-crimson" id="btnLeaveDungModal">Покинуть подземелье</button>
          </div>
        ` : `
          <div class="list-stack">
            ${window.Activities.DUNGEONS.map(d => {
              const okLv = p.level >= d.recLv;
              return `
                <div class="list-row" style="border-color:${d.accentCol};">
                  <div class="list-row-left">
                    ${px('dungeon', 'px-ico-md', 28)}
                    <div>
                      <div class="list-row-title" style="color:#ffe08a;">${esc(d.name)} <span style="color:${okLv ? '#4ade80' : '#fca5a5'};font-size:10px;">(Рек. Ур.${d.recLv}+)</span></div>
                      <div class="list-row-sub">${esc(d.desc)}</div>
                      <div class="list-row-sub" style="color:#fde047;">Награда: +${d.rewardGold.toLocaleString('ru-RU')} зол. • +${d.rewardXp} XP • Сундук T${d.rewardTier} + Свиток чар</div>
                    </div>
                  </div>
                  <button class="pixel-btn btn-gold" data-start-dung="${d.id}">${px('weapons')} Войти</button>
                </div>`;
            }).join('')}
          </div>
        `}
      </div>`;

    const lvBtn = root.querySelector('#btnLeaveDungModal');
    if (lvBtn) {
      lvBtn.onclick = () => {
        window.Activities.exitDungeon(false);
        window.UI.closeModal();
      };
    }
    root.querySelectorAll('[data-start-dung]').forEach(btn => {
      btn.onclick = () => {
        if (window.Activities.startDungeon(btn.dataset.startDung)) {
          window.UI.closeModal();
        }
      };
    });
  }

  // =========================================================================
  // 3. CLAN WARS & TERRITORY CONTROL
  // =========================================================================
  function renderClanWarsModal(root) {
    const gs = window.GameState;
    const myTag = gs.clan && gs.clan.tag ? gs.clan.tag : '';
    const buffs = window.Activities.getTerritoryBuffs();

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="pixel-inset" style="padding:10px;border-color:#f59e0b;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-weight:900;color:#ffe08a;font-size:13px;">${px('fortress')} Войны Кланов и Захват Крепостей</div>
            <div style="font-size:11px;color:#b7c7eb;">
              ${myTag
                ? 'Ваш клан: <b style="color:#4ade80;">[' + esc(myTag) + '] ' + esc(gs.clan.name) + '</b>. Встаньте в круг крепости, чтобы захватить её!'
                : 'Создайте или вступите в Клан, чтобы захватывать крепости и собирать налоги!'}
            </div>
            ${buffs.ownedCount > 0 ? `<div style="font-size:11px;color:#4ade80;margin-top:3px;">Активные баффы земель: +${Math.round(buffs.atkPct * 100)}% АТК, +${Math.round(buffs.defPct * 100)}% ЗАЩ, +${buffs.goldBonusPct}% Золота</div>` : ''}
          </div>
          ${!myTag ? `<button class="pixel-btn btn-gold" id="btnFortOpenClan">${px('clan')} Открыть Клан</button>` : ''}
        </div>

        <div class="list-stack">
          ${window.Activities.FORTRESSES.map(f => {
            const isMine = myTag && f.ownerTag === myTag;
            return `
              <div class="list-row" style="border-color:${isMine ? '#4ade80' : '#f59e0b'};">
                <div class="list-row-left">
                  ${px('fortress', 'px-ico-md', 28)}
                  <div>
                    <div class="list-row-title" style="color:#ffe08a;">${esc(f.name)} <span style="color:${f.ownerColor || '#fbbf24'};">[${esc(f.ownerTag)}]</span></div>
                    <div class="list-row-sub">Владелец: <b>${esc(f.ownerClan)}</b> • Бафф: <span style="color:#7cc0ff;">${esc(f.buffDesc)}</span></div>
                    <div class="list-row-sub" style="color:#fde047;">Казна налогов: <b>${Math.floor(f.treasury || 0).toLocaleString('ru-RU')}</b> зол. (+${f.taxPerMin}/мин)</div>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:5px;">
                  <button class="pixel-btn btn-sm btn-blue" data-tp-fort="${f.id}">Телепорт</button>
                  ${isMine ? `<button class="pixel-btn btn-sm btn-green" data-tax-fort="${f.id}">${px('coin')} Налог</button>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    const oc = root.querySelector('#btnFortOpenClan');
    if (oc) oc.onclick = () => window.UI.openModal('clan');

    root.querySelectorAll('[data-tp-fort]').forEach(btn => {
      btn.onclick = () => {
        const f = window.Activities.FORTRESSES.find(x => x.id === btn.dataset.tpFort);
        if (!f) return;
        window.GameState.player.x = f.x;
        window.GameState.player.y = f.y + 42;
        window.Combat.addParticles(f.x, f.y + 42, '#fbbf24', 18, 120);
        window.UI.closeModal();
        window.UI.toast('Телепорт к крепости «' + f.name + '»!');
      };
    });
    root.querySelectorAll('[data-tax-fort]').forEach(btn => {
      btn.onclick = () => {
        window.Activities.collectFortressTax(btn.dataset.taxFort);
        refresh();
      };
    });
  }

  // =========================================================================
  // 4. RANKED PVP ARENA 1x1 & 2x2
  // =========================================================================
  function renderArenaModal(root) {
    const p = window.GameState.player;
    const elo = p.pvpRating || 1000;
    const league = window.Activities.getLeague(elo);
    const tokens = window.GameState.arenaTokens || 0;
    const inArena = window.Activities.isInArena();

    // Build Season ELO Leaderboard combining Player + Bots + Remote Players
    const board = [{ name: p.name + ' (Вы)', elo, cls: p.classId || 'warrior', isMe: true }];
    if (window.Bots && window.Bots.list) {
      window.Bots.list.slice(0, 8).forEach((b, i) => {
        board.push({ name: b.name, elo: 960 + ((b.level || 5) * 42) + (i * 25), cls: b.cls || 'warrior', isMe: false });
      });
    }
    board.sort((a, b) => b.elo - a.elo);

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="pixel-inset" style="padding:12px;border-color:${league.color};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-weight:900;font-size:15px;color:${league.color};">${px('arena', 'px-ico-sm', 22)} Лига: ${league.name} (${elo} ELO)</div>
            <div style="font-size:11px;color:#b7c7eb;margin-top:3px;">Безопасный Колизей (0% потерь вещей). За 1500+ ELO открывается титул «Чемпион Арены»!</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:900;color:#fde047;">${px('coin')} Жетоны Арены: ${tokens}</div>
            <button class="pixel-btn btn-sm btn-purple" id="btnBuyArenaBox" style="margin-top:4px;">Обмен: 60 жетонов -> Сундук T5</button>
          </div>
        </div>

        ${inArena ? `
          <div class="pixel-inset" style="padding:12px;text-align:center;border-color:#ef4444;">
            <div style="font-weight:900;color:#fca5a5;margin-bottom:8px;">Бой на Арене идёт прямо сейчас!</div>
            <button class="pixel-btn btn-crimson" id="btnLeaveArenaModal">Сдаться и выйти</button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="pixel-inset" style="padding:10px;text-align:center;border-color:#38bdf8;">
              <div style="font-weight:900;color:#7cc0ff;font-size:14px;">Дуэль 1 x 1</div>
              <div style="font-size:10.5px;color:#b7c7eb;margin:4px 0 8px;">Честный рейтинговый поединок один на один. Награда: +35 ELO, +35 жетонов.</div>
              <button class="pixel-btn btn-gold" id="btnArena1v1" style="width:100%;">${px('arena')} В бой 1x1</button>
            </div>
            <div class="pixel-inset" style="padding:10px;text-align:center;border-color:#f97316;">
              <div style="font-weight:900;color:#fdba74;font-size:14px;">Командный бой 2 x 2</div>
              <div style="font-size:10.5px;color:#b7c7eb;margin:4px 0 8px;">Бой с союзником-гладиатором против пары врагов. Награда: +45 ELO, +50 жетонов.</div>
              <button class="pixel-btn btn-crimson" id="btnArena2v2" style="width:100%;">${px('pvp')} В бой 2x2</button>
            </div>
          </div>
        `}

        <div class="pixel-inset" style="padding:10px;">
          <div style="font-weight:900;color:#ffe08a;margin-bottom:6px;">${px('leaderboard')} Топ Гладиаторов Сезона</div>
          <div class="list-stack" style="max-height:175px;overflow-y:auto;">
            ${board.slice(0, 8).map((row, idx) => {
              const lg = window.Activities.getLeague(row.elo);
              return `<div class="list-row" ${row.isMe ? 'style="border-color:#fde047;"' : ''}>
                <div class="list-row-title">#${idx + 1} ${esc(row.name)}</div>
                <div style="font-weight:900;color:${lg.color};">${lg.name} • ${row.elo} ELO</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    const b1 = root.querySelector('#btnArena1v1');
    if (b1) b1.onclick = () => { if (window.Activities.startArenaMatch('1v1')) window.UI.closeModal(); };
    const b2 = root.querySelector('#btnArena2v2');
    if (b2) b2.onclick = () => { if (window.Activities.startArenaMatch('2v2')) window.UI.closeModal(); };
    const lv = root.querySelector('#btnLeaveArenaModal');
    if (lv) lv.onclick = () => { window.Activities.finishArenaMatch(false); window.UI.closeModal(); };
    const ex = root.querySelector('#btnBuyArenaBox');
    if (ex) {
      ex.onclick = () => {
        if ((window.GameState.arenaTokens || 0) < 60) {
          window.UI.toast('Нужно 60 жетонов Арены!');
          return;
        }
        window.GameState.arenaTokens -= 60;
        const wt = window.GameData.WEAPON_TYPES[Math.floor(Math.random() * window.GameData.WEAPON_TYPES.length)];
        const item = window.GameData.createWeaponItem(wt.id, 'epic', Math.max(12, p.level), 2, 5, 1);
        window.MMO.addItemToBag(item);
        window.MMO.saveProgress();
        if (window.GameAudio) window.GameAudio.playSfx('victory');
        window.UI.toast('Получено с Арены: ' + item.name + '!');
        refresh();
      };
    }
  }

  // =========================================================================
  // 5. BATTLE PETS
  // =========================================================================
  function renderPetsModal(root) {
    const gs = window.GameState;
    if (!gs.pets) gs.pets = { owned: {}, activeId: null };
    const pets = window.CosmeticsData.PETS;
    const sel = window.CosmeticsData.PET_BY_ID[selectedPetId] || pets[0];
    const ownedInfo = gs.pets.owned[sel.id];
    const isActive = gs.pets.activeId === sel.id;

    root.innerHTML = `
      <div class="mounts-layout">
        <div class="mount-preview-card pixel-inset">
          <canvas id="petPreviewCanvas" width="128" height="112"></canvas>
          <div class="text-${sel.rarity}" style="font-weight:900;font-size:14px;">${esc(sel.name)}</div>
          <div style="font-size:10.5px;color:#fde047;font-weight:800;">Навык: ${esc(sel.skillName)}</div>
          <div style="font-size:10.5px;color:#b7c7eb;line-height:1.35;">${esc(sel.desc)}</div>
          ${ownedInfo ? `<div style="font-size:11px;color:#4ade80;font-weight:800;">Уровень питомца: ${ownedInfo.lv} (XP: ${ownedInfo.xp})</div>` : ''}
          <button class="pixel-btn ${ownedInfo ? (isActive ? 'btn-crimson' : 'btn-green') : 'btn-gold'}" id="btnPetPrimary" style="width:100%;">
            ${ownedInfo ? (isActive ? 'Отозвать' : 'Призвать') : (px('coin') + ' Купить за ' + sel.price.toLocaleString('ru-RU'))}
          </button>
          ${isActive ? `<button class="pixel-btn btn-blue btn-sm" id="btnFeedPet" style="width:100%;">${px('fish')} Покормить (+XP)</button>` : ''}
        </div>

        <div class="list-stack">
          ${pets.map(pt => {
            const ow = gs.pets.owned[pt.id];
            const act = gs.pets.activeId === pt.id;
            return `
              <div class="list-row rarity-${pt.rarity}" style="cursor:pointer;${selectedPetId === pt.id ? 'background:rgba(230,178,68,0.18);' : ''}" data-sel-pet="${pt.id}">
                <div class="list-row-left">
                  <div class="cos-color-dot" style="background:${pt.color};border-color:${pt.accent};"></div>
                  <div>
                    <div class="list-row-title text-${pt.rarity}">${esc(pt.name)} ${act ? '<span style="color:#4ade80;">[АКТИВЕН]</span>' : ''}</div>
                    <div class="list-row-sub">${esc(pt.skillName)} • ${ow ? ('Ур.' + ow.lv) : (pt.price.toLocaleString('ru-RU') + ' зол.')}</div>
                  </div>
                </div>
                <span style="font-size:10px;font-weight:800;color:${ow ? '#4ade80' : '#fbbf24'};">${ow ? 'Открыт' : 'Купить'}</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    const cv = root.querySelector('#petPreviewCanvas');
    if (cv && window.Sprites && window.Sprites.drawPet) {
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.translate(cv.width / 2, cv.height * 0.62);
      ctx.scale(2.1, 2.1);
      window.Sprites.drawPet(ctx, sel, { x: 0, y: 0, facingX: 1 }, ownedInfo ? ownedInfo.lv : 1, performance.now() * 0.001);
      ctx.restore();
    }

    root.querySelectorAll('[data-sel-pet]').forEach(el => {
      el.onclick = () => { selectedPetId = el.dataset.selPet; refresh(); };
    });
    root.querySelector('#btnPetPrimary').onclick = () => {
      window.Activities.buyOrEquipPet(sel.id);
      refresh();
    };
    const fb = root.querySelector('#btnFeedPet');
    if (fb) fb.onclick = () => { window.Activities.feedActivePet(); refresh(); };
  }

  // =========================================================================
  // 6. 7-DAY DAILY REWARDS & SEASON 1 BATTLE PASS
  // =========================================================================
  function renderBattlePassModal(root) {
    const gs = window.GameState;
    const bp = window.Progression.ensureBpState();
    const bpLv = window.Progression.getBpLevel();
    const bpInLv = bp.xp % 200;
    const bpPct = Math.min(100, Math.round((bpInLv / 200) * 100));
    const daily = gs.daily || { streak: 0, lastDate: '' };
    const canDaily = window.Progression.canClaimDaily();
    const curStreak = daily.streak || 0;

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="tab-strip" style="margin-bottom:0;">
          <button class="tab-btn ${bpTab === 'daily' ? 'active' : ''}" data-bptab="daily">${px('battlepass')} 7-Дней Награды ${canDaily ? '(!)' : ''}</button>
          <button class="tab-btn ${bpTab === 'pass' ? 'active' : ''}" data-bptab="pass">${px('crown')} Сезон 1 (Ур.${bpLv}/20)</button>
          <button class="tab-btn ${bpTab === 'quests' ? 'active' : ''}" data-bptab="quests">${px('quests')} Задания Пропуска</button>
        </div>

        ${bpTab === 'daily' ? `
          <div class="pixel-inset" style="padding:10px;border-color:#fbbf24;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
              <div>
                <div style="font-weight:900;color:#ffe08a;">Ежедневный календарь входа (День ${Math.min(7, curStreak + (canDaily ? 1 : 0))}/7)</div>
                <div style="font-size:11px;color:#b7c7eb;">Заходите каждый день, чтобы забрать редкие камни заточки, золото и золотые крылья!</div>
              </div>
              <button class="pixel-btn ${canDaily ? 'btn-green' : 'btn-dark'}" id="btnClaimDaily" ${canDaily ? '' : 'disabled'}>
                ${canDaily ? 'Забрать награду дня!' : 'Уже получено сегодня'}
              </button>
            </div>
            <div class="daily-grid">
              ${window.Progression.DAILY_REWARDS.map(r => {
                const claimed = curStreak >= r.day;
                const isNext = canDaily && (curStreak % 7) + 1 === r.day;
                return `
                  <div class="daily-card ${claimed ? 'claimed' : ''} ${isNext ? 'next-day' : ''}">
                    <div style="font-size:10px;font-weight:900;color:#ffe08a;">ДЕНЬ ${r.day}</div>
                    ${px(r.day === 7 ? 'cosmetics' : (r.day % 2 === 0 ? 'upgrade' : 'coin'), 'px-ico-sm', 22)}
                    <div style="font-size:10px;color:#eef3ff;font-weight:800;">${esc(r.label)}</div>
                    <div style="font-size:9px;color:${claimed ? '#4ade80' : '#9fb2db'};">${claimed ? 'Получено' : (isNext ? 'Доступно!' : 'Ожидает')}</div>
                  </div>`;
              }).join('')}
            </div>
          </div>
        ` : bpTab === 'pass' ? `
          <div class="pixel-inset" style="padding:10px;border-color:#c084fc;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div style="flex:1;min-width:180px;">
              <div style="font-weight:900;color:#ffe08a;">Сезон 1: Клинок Рассвета — Уровень ${bpLv} / 20</div>
              <div class="bar-track" style="height:12px;margin-top:4px;">
                <div class="bar-fill" style="width:${bpPct}%;background:linear-gradient(90deg,#9333ea,#c084fc);"></div>
                <span class="bar-text" style="font-size:9px;">BP XP: ${bpInLv} / 200</span>
              </div>
            </div>
            ${bp.premium
              ? `<span class="trend-pill trend-up" style="padding:5px 10px;">ПРЕМИУМ АКТИВЕН</span>`
              : `<button class="pixel-btn btn-gold btn-sm" id="btnUnlockPremBp">${px('crown')} Премиум (15 000 зол.)</button>`}
          </div>
          <div class="list-stack" style="max-height:280px;overflow-y:auto;">
            ${window.Progression.BP_TIERS.map(t => {
              const unlocked = bpLv >= t.lv;
              const cf = !!bp.claimedFree[t.lv];
              const cp = !!bp.claimedPrem[t.lv];
              return `
                <div class="bp-tier-row ${unlocked ? 'unlocked' : ''}">
                  <div class="bp-lv-badge">Ур.${t.lv}</div>
                  <div class="bp-track-cell">
                    <div style="font-size:9.5px;color:#9fb2db;">Бесплатно</div>
                    <div style="font-weight:800;color:#eef3ff;font-size:11px;">${esc(t.free.label)}</div>
                    <button class="pixel-btn btn-sm ${cf ? 'btn-dark' : (unlocked ? 'btn-green' : 'btn-dark')}" data-bp-claim="${t.lv}:0" ${(!unlocked || cf) ? 'disabled' : ''}>
                      ${cf ? 'Получено' : 'Забрать'}
                    </button>
                  </div>
                  <div class="bp-track-cell prem">
                    <div style="font-size:9.5px;color:#fde047;">Премиум</div>
                    <div style="font-weight:800;color:#ffe08a;font-size:11px;">${esc(t.prem.label)}</div>
                    <button class="pixel-btn btn-sm ${cp ? 'btn-dark' : (unlocked && bp.premium ? 'btn-gold' : 'btn-dark')}" data-bp-claim="${t.lv}:1" ${(!unlocked || !bp.premium || cp) ? 'disabled' : ''}>
                      ${cp ? 'Получено' : (bp.premium ? 'Забрать' : 'Премиум')}
                    </button>
                  </div>
                </div>`;
            }).join('')}
          </div>
        ` : `
          <div class="list-stack">
            ${window.Progression.BP_QUESTS.map(q => {
              const st = (bp.quests && bp.quests[q.id]) || { prog: 0, claimed: false };
              const done = st.prog >= q.goal;
              return `
                <div class="list-row" style="border-color:${done ? '#4ade80' : '#2d3e6d'};">
                  <div>
                    <div class="list-row-title">${esc(q.title)}</div>
                    <div class="list-row-sub">Прогресс: <b>${Math.min(st.prog, q.goal)} / ${q.goal}</b> • Награда: <b style="color:#c084fc;">+${q.xp} BP XP</b></div>
                  </div>
                  <button class="pixel-btn btn-sm ${done ? 'btn-green' : 'btn-dark'}" data-bp-quest="${q.id}" ${done ? '' : 'disabled'}>
                    ${done ? 'Забрать XP' : 'В процессе'}
                  </button>
                </div>`;
            }).join('')}
          </div>
        `}
      </div>`;

    root.querySelectorAll('[data-bptab]').forEach(b => {
      b.onclick = () => { bpTab = b.dataset.bptab; refresh(); };
    });
    const cd = root.querySelector('#btnClaimDaily');
    if (cd) cd.onclick = () => { window.Progression.claimDailyReward(); refresh(); };
    const up = root.querySelector('#btnUnlockPremBp');
    if (up) up.onclick = () => { window.Progression.unlockPremiumBp(); refresh(); };
    root.querySelectorAll('[data-bp-claim]').forEach(b => {
      b.onclick = () => {
        const [lv, pr] = b.dataset.bpClaim.split(':');
        window.Progression.claimBpReward(Number(lv), pr === '1');
        refresh();
      };
    });
    root.querySelectorAll('[data-bp-quest]').forEach(b => {
      b.onclick = () => {
        window.Progression.claimBpQuest(b.dataset.bpQuest);
        refresh();
      };
    });
  }

  // =========================================================================
  // 7. PK / KARMA & BOUNTY HUNTER BOARD
  // =========================================================================
  function renderBountyModal(root) {
    const p = window.GameState.player;
    const karma = p.karma || 0;
    const isPk = karma <= -50;
    const wanted = window.Progression.getWantedList();
    const tracked = window.Progression.getTrackedTarget();
    const remoteList = window.Multiplayer ? window.Multiplayer.getRemotePlayers() : [];

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="pixel-inset" style="padding:10px;border-color:${isPk ? '#ef4444' : '#38bdf8'};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-weight:900;color:${isPk ? '#f87171' : '#7cc0ff'};font-size:13px;">
              ${px('bounty')} Ваша Карма: ${karma} (${isPk ? 'PK — ВНЕ ЗАКОНА' : (karma >= 50 ? 'Защитник Аэтельгарда' : 'Нейтральный')})
            </div>
            <div style="font-size:11px;color:#b7c7eb;">Убивайте разыскиваемых PK-разбойников и игроков с наградой за голову. Включите радар, чтобы красная стрелка вела к цели!</div>
          </div>
          ${tracked ? `<button class="pixel-btn btn-sm btn-dark" id="btnUntrackBounty">Снять метку (${esc(tracked.name)})</button>` : ''}
        </div>

        <div class="list-stack" style="max-height:230px;overflow-y:auto;">
          ${wanted.map(w => {
            const isTracked = tracked && tracked.id === w.id;
            return `
              <div class="list-row" style="border-color:${isTracked ? '#ef4444' : '#7f1d1d'};">
                <div class="list-row-left">
                  ${px('skull', 'px-ico-sm', 22)}
                  <div>
                    <div class="list-row-title" style="color:#fca5a5;">
                      ${w.isPlayer ? '[ИГРОК PK] ' : '[РАЗБОЙНИК] '}${esc(w.name)} • Ур.${w.level}
                    </div>
                    <div class="list-row-sub">
                      Награда: <b style="color:#fde047;">${w.bounty.toLocaleString('ru-RU')} зол.</b> • Карма: ${w.karma} • Коорд.: ${Math.round(w.x)}, ${Math.round(w.y)}
                    </div>
                  </div>
                </div>
                <div style="display:flex;gap:5px;">
                  <button class="pixel-btn btn-sm ${isTracked ? 'btn-crimson' : 'btn-gold'}" data-track-id="${w.id}">${isTracked ? 'На радаре' : 'Отследить'}</button>
                  ${!w.isPlayer ? `<button class="pixel-btn btn-sm btn-blue" data-tp-outlaw="${w.id}">Ближе</button>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>

        <div class="pixel-inset" style="padding:10px;border-color:#d9a742;">
          <div style="font-weight:900;color:#ffe08a;margin-bottom:6px;">${px('coin')} Назначить награду за голову онлайн-игрока</div>
          ${remoteList.length > 0 ? `
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <select id="bountyTargetSel" class="modal-input" style="flex:1;min-width:130px;">
                ${remoteList.map(rp => `<option value="${esc(rp.id)}">${esc(rp.name)} (Ур.${rp.level})</option>`).join('')}
              </select>
              <input id="bountyGoldInp" class="modal-input" type="number" min="200" step="100" value="500" style="width:95px;" />
              <button class="pixel-btn btn-crimson btn-sm" id="btnPlaceBounty">Объявить розыск</button>
            </div>
          ` : `<div style="font-size:11px;color:#9fb2db;">Когда рядом появятся онлайн-игроки, вы сможете назначить награду за голову любого соперника!</div>`}
        </div>
      </div>`;

    const ut = root.querySelector('#btnUntrackBounty');
    if (ut) ut.onclick = () => { window.Progression.trackTarget(null); refresh(); };

    root.querySelectorAll('[data-track-id]').forEach(btn => {
      btn.onclick = () => { window.Progression.trackTarget(btn.dataset.trackId); refresh(); };
    });
    root.querySelectorAll('[data-tp-outlaw]').forEach(btn => {
      btn.onclick = () => {
        const o = window.Progression.OUTLAWS.find(x => x.id === btn.dataset.tpOutlaw);
        if (!o) return;
        window.GameState.player.x = Math.max(80, o.x - 120);
        window.GameState.player.y = Math.max(80, o.y + 40);
        window.Progression.trackTarget(o.id);
        window.UI.closeModal();
        window.UI.toast('Вы вышли на след «' + o.name + '»!');
      };
    });
    const pb = root.querySelector('#btnPlaceBounty');
    if (pb) {
      pb.onclick = () => {
        const sel = root.querySelector('#bountyTargetSel');
        const inp = root.querySelector('#bountyGoldInp');
        if (!sel || !inp) return;
        const rp = remoteList.find(r => r.id === sel.value);
        window.Progression.placeBounty(sel.value, rp ? rp.name : 'Игрок', Number(inp.value));
        refresh();
      };
    }
  }

  // =========================================================================
  // 8. CLOUD SAVE SETTINGS TAB (Supabase PostgREST + Backup String)
  // =========================================================================
  function renderCloudTabHtml() {
    const st = window.CloudSave ? window.CloudSave.getStatus() : { accountId: '—', lastStatus: '—', needsTableSql: false };
    return `
      <div style="display:flex;flex-direction:column;gap:10px;max-width:540px;margin:auto;">
        <div class="pixel-inset" style="padding:10px;border-color:#38bdf8;display:flex;flex-direction:column;gap:8px;">
          <div style="font-weight:900;color:#7cc0ff;font-size:13px;">${px('cloud')} Облачное сохранение аккаунта (Supabase)</div>
          <div style="font-size:11px;color:#b7c7eb;">
            Ваш аккаунт привязывается к Telegram ID или коду переноса. Переносите героя, золото, питомцев и косметику между телефоном и ПК!
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            <input id="cloudAccIdInput" class="modal-input" style="flex:1;font-weight:800;" value="${esc(st.accountId)}" />
            <button class="pixel-btn btn-sm btn-dark" id="btnSetCloudId">Применить код</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-green" id="btnCloudUpload">${px('save')} Сохранить в облако</button>
            <button class="pixel-btn btn-blue" id="btnCloudDownload">${px('cloud')} Загрузить из облака</button>
          </div>
          <div style="font-size:11px;color:#fde047;">Статус: ${esc(st.lastStatus)}</div>

          <details ${st.needsTableSql ? 'open' : ''} style="font-size:10.5px;color:#9fb2db;">
            <summary style="cursor:pointer;color:#ffe08a;font-weight:800;">SQL для создания таблицы bladerealm_saves в Supabase (1 клик)</summary>
            <textarea id="cloudSqlBox" class="modal-input" readonly style="width:100%;height:110px;margin-top:6px;font-family:monospace;font-size:10px;">${esc(window.CloudSave ? window.CloudSave.CREATE_TABLE_SQL : '')}</textarea>
            <button class="pixel-btn btn-sm btn-gold" id="btnCopyCloudSql" style="margin-top:4px;">Скопировать SQL</button>
          </details>
        </div>

        <div class="pixel-inset" style="padding:10px;display:flex;flex-direction:column;gap:7px;">
          <div style="font-weight:900;color:#ffe08a;">Резервный код переноса (офлайн-копия)</div>
          <textarea id="backupCodeArea" class="modal-input" placeholder="Нажмите «Экспорт», чтобы получить код, или вставьте код для импорта..." style="width:100%;height:68px;font-family:monospace;font-size:10px;"></textarea>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="pixel-btn btn-sm btn-gold" id="btnExportBackup">Экспорт кода</button>
            <button class="pixel-btn btn-sm btn-green" id="btnImportBackup">Импорт кода</button>
          </div>
        </div>
      </div>`;
  }

  function bindCloudTab(root) {
    if (!window.CloudSave) return;
    const setIdBtn = root.querySelector('#btnSetCloudId');
    if (setIdBtn) {
      setIdBtn.onclick = () => {
        const inp = root.querySelector('#cloudAccIdInput');
        if (inp && window.CloudSave.setCustomAccountId(inp.value)) {
          window.UI.toast('Код аккаунта обновлён!');
          refresh();
        }
      };
    }
    const upBtn = root.querySelector('#btnCloudUpload');
    if (upBtn) upBtn.onclick = async () => { upBtn.disabled = true; await window.CloudSave.uploadToCloud(false); refresh(); };
    const dlBtn = root.querySelector('#btnCloudDownload');
    if (dlBtn) dlBtn.onclick = async () => { dlBtn.disabled = true; await window.CloudSave.downloadFromCloud(false); refresh(); };

    const cpBtn = root.querySelector('#btnCopyCloudSql');
    if (cpBtn) {
      cpBtn.onclick = () => {
        const box = root.querySelector('#cloudSqlBox');
        if (box) {
          box.select();
          try { navigator.clipboard.writeText(box.value); } catch (_e) { document.execCommand('copy'); }
          window.UI.toast('SQL скопирован! Вставьте в Supabase SQL Editor.');
        }
      };
    }
    const expBtn = root.querySelector('#btnExportBackup');
    if (expBtn) {
      expBtn.onclick = () => {
        const area = root.querySelector('#backupCodeArea');
        const code = window.CloudSave.exportBackupString();
        if (area) { area.value = code; area.select(); }
        try { navigator.clipboard.writeText(code); } catch (_e) {}
        window.UI.toast('Код резервной копии создан и скопирован!');
      };
    }
    const impBtn = root.querySelector('#btnImportBackup');
    if (impBtn) {
      impBtn.onclick = () => {
        const area = root.querySelector('#backupCodeArea');
        if (area && window.CloudSave.importBackupString(area.value)) {
          refresh();
        }
      };
    }
  }

  return {
    renderCosmeticsModal,
    renderDungeonsModal,
    renderClanWarsModal,
    renderArenaModal,
    renderPetsModal,
    renderBattlePassModal,
    renderBountyModal,
    renderCloudTabHtml,
    bindCloudTab
  };
})();
