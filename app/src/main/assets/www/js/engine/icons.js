/* ==========================================================================
   BladeRealm — 100% Custom Procedural Pixel-Art UI, Menu, HUD & Skill Icons
   ZERO emojis — every button, tab, skill, menu tile, and HUD badge is drawn
   in crisp outlined 16-bit dark-fantasy pixel art and cached as DataURLs.
   ========================================================================== */

window.PixelIcons = (function () {
  const cache = {};

  function p(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function makeIcon(key, size, drawFn) {
    const ck = key + '_' + size;
    if (cache[ck]) return cache[ck];
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, size);
    const url = c.toDataURL();
    cache[ck] = url;
    return url;
  }

  // Helper to draw on a 16x16 virtual pixel grid scaled cleanly to canvas size
  function gridIcon(key, size, fn) {
    return makeIcon(key, size || 32, (ctx, s) => {
      const u = s / 16;
      const g = (x, y, w, h, col) => p(ctx, x * u, y * u, w * u, h * u, col);
      fn(g, ctx, s);
    });
  }

  const DRAWERS = {
    // --- TOP BAR & MENU ICONS (matching Reference Image 2) ---
    map(g) {
      g(1, 3, 14, 10, '#0a0d18');
      g(2, 4, 4, 8, '#e8d39e'); g(6, 3, 4, 9, '#d1b578'); g(10, 4, 4, 8, '#e8d39e');
      g(3, 5, 2, 2, '#3b82f6'); g(7, 6, 3, 2, '#22c55e'); g(11, 8, 2, 2, '#22c55e');
      g(8, 8, 1, 1, '#dc2626'); g(9, 9, 1, 1, '#dc2626'); g(9, 8, 1, 1, '#ef4444'); g(8, 9, 1, 1, '#ef4444');
    },
    quests(g) {
      g(3, 1, 10, 14, '#0a0d18');
      g(4, 2, 8, 2, '#c79b52'); g(4, 12, 8, 2, '#c79b52');
      g(4, 4, 8, 8, '#f0dbb0');
      g(5, 5, 6, 1, '#7c5a2b'); g(5, 7, 5, 1, '#7c5a2b'); g(5, 9, 4, 1, '#7c5a2b');
      g(9, 9, 2, 2, '#dc2626');
    },
    achievements(g) {
      g(4, 2, 8, 1, '#0a0d18'); g(3, 3, 10, 6, '#0a0d18');
      g(4, 3, 8, 5, '#f59e0b'); g(5, 3, 6, 4, '#fde047'); g(6, 4, 2, 2, '#fffbeb');
      g(2, 4, 2, 3, '#d97706'); g(12, 4, 2, 3, '#d97706');
      g(6, 8, 4, 3, '#d97706'); g(7, 8, 2, 3, '#fbbf24');
      g(4, 11, 8, 3, '#0a0d18'); g(5, 12, 6, 1, '#fbbf24');
    },
    shop(g) {
      g(1, 3, 14, 11, '#0a0d18');
      g(2, 4, 12, 4, '#b91c1c'); g(2, 5, 12, 1, '#ef4444');
      g(2, 8, 12, 5, '#7c2d12'); g(3, 9, 10, 3, '#9a3412');
      g(2, 7, 12, 2, '#f59e0b'); g(6, 7, 4, 3, '#fde047'); g(7, 8, 2, 1, '#451a03');
      g(2, 4, 2, 9, '#d97706'); g(12, 4, 2, 9, '#d97706');
    },
    settings(g) {
      g(6, 1, 4, 14, '#0a0d18'); g(1, 6, 14, 4, '#0a0d18'); g(3, 3, 10, 10, '#0a0d18');
      g(7, 2, 2, 12, '#94a3b8'); g(2, 7, 12, 2, '#94a3b8');
      g(4, 4, 8, 8, '#cbd5e1'); g(5, 5, 6, 6, '#64748b');
      g(6, 6, 4, 4, '#131a32');
      g(4, 3, 2, 2, '#cbd5e1'); g(10, 3, 2, 2, '#cbd5e1'); g(4, 11, 2, 2, '#cbd5e1'); g(10, 11, 2, 2, '#cbd5e1');
    },
    menu(g) {
      g(2, 2, 12, 12, '#0a0d18');
      g(3, 3, 10, 2, '#fbbf24'); g(4, 3, 8, 1, '#fef08a');
      g(3, 7, 10, 2, '#cbd5e1'); g(4, 7, 8, 1, '#f8fafc');
      g(3, 11, 10, 2, '#cbd5e1'); g(4, 11, 8, 1, '#f8fafc');
    },
    character(g) {
      g(3, 2, 10, 12, '#0a0d18');
      g(4, 3, 8, 7, '#64748b'); g(5, 2, 6, 2, '#94a3b8'); g(7, 1, 2, 3, '#ef4444');
      g(5, 7, 6, 2, '#0f172a'); g(6, 7, 1, 1, '#ef4444'); g(9, 7, 1, 1, '#ef4444');
      g(4, 10, 3, 3, '#475569'); g(9, 10, 3, 3, '#475569');
    },
    inventory(g) {
      g(2, 3, 12, 11, '#0a0d18');
      g(5, 2, 6, 2, '#78350f');
      g(3, 4, 10, 9, '#92400e'); g(4, 5, 8, 3, '#b45309');
      g(3, 7, 10, 1, '#451a03');
      g(7, 7, 2, 3, '#fbbf24');
      g(4, 10, 3, 2, '#78350f'); g(9, 10, 3, 2, '#78350f');
    },
    skills(g) {
      g(7, 1, 2, 14, '#0a0d18'); g(1, 7, 14, 2, '#0a0d18'); g(4, 4, 8, 8, '#0a0d18');
      g(7, 2, 2, 12, '#f59e0b'); g(2, 7, 12, 2, '#f59e0b');
      g(5, 5, 6, 6, '#fbbf24'); g(6, 6, 4, 4, '#fef08a'); g(7, 7, 2, 2, '#ffffff');
    },
    clan(g) {
      g(2, 2, 12, 9, '#0a0d18'); g(4, 11, 8, 3, '#0a0d18'); g(6, 13, 4, 2, '#0a0d18');
      g(3, 3, 10, 7, '#b91c1c'); g(5, 10, 6, 3, '#991b1b');
      g(3, 3, 10, 1, '#cbd5e1'); g(3, 3, 1, 7, '#cbd5e1'); g(12, 3, 1, 7, '#cbd5e1');
      g(7, 4, 2, 7, '#fde047'); g(5, 6, 6, 2, '#fde047');
    },
    auction(g) {
      g(7, 2, 2, 11, '#0a0d18'); g(2, 4, 12, 2, '#0a0d18');
      g(7, 2, 2, 10, '#fbbf24'); g(3, 4, 10, 1, '#fde047');
      g(4, 12, 8, 2, '#d97706');
      g(3, 5, 1, 4, '#cbd5e1'); g(12, 5, 1, 4, '#cbd5e1');
      g(1, 9, 5, 2, '#f59e0b'); g(10, 9, 5, 2, '#f59e0b');
    },
    trade(g) {
      g(2, 3, 12, 10, '#0a0d18');
      g(3, 4, 10, 3, '#38bdf8'); g(10, 3, 3, 5, '#7dd3fc');
      g(3, 9, 10, 3, '#fbbf24'); g(3, 8, 3, 5, '#fef08a');
    },
    craft(g) {
      g(2, 6, 12, 4, '#0a0d18'); g(5, 10, 6, 4, '#0a0d18');
      g(3, 7, 10, 2, '#64748b'); g(2, 7, 3, 1, '#94a3b8');
      g(6, 9, 4, 3, '#475569'); g(4, 12, 8, 2, '#64748b');
      // Hammer above anvil
      g(7, 2, 5, 3, '#cbd5e1'); g(4, 4, 4, 2, '#92400e');
    },
    mounts(g) {
      g(2, 3, 12, 11, '#0a0d18');
      g(4, 4, 8, 7, '#dc2626'); g(3, 5, 3, 5, '#991b1b');
      g(6, 2, 2, 3, '#fbbf24'); g(10, 2, 2, 3, '#fbbf24');
      g(9, 6, 2, 2, '#fde047');
      g(7, 9, 6, 3, '#7f1d1d');
    },
    storage(g) {
      g(2, 2, 12, 12, '#0a0d18');
      g(3, 3, 10, 10, '#475569'); g(4, 4, 8, 8, '#334155');
      g(3, 7, 10, 2, '#94a3b8'); g(6, 6, 4, 4, '#fbbf24'); g(7, 7, 2, 2, '#0f172a');
    },
    weapons(g) {
      g(2, 11, 3, 3, '#0a0d18');
      g(11, 2, 3, 3, '#ef4444'); g(9, 4, 3, 3, '#ef4444'); g(7, 6, 3, 3, '#dc2626'); g(5, 8, 3, 3, '#b91c1c');
      g(10, 3, 2, 2, '#fca5a5'); g(8, 5, 2, 2, '#fca5a5'); g(6, 7, 2, 2, '#fca5a5');
      g(3, 8, 5, 2, '#fbbf24'); g(6, 10, 2, 3, '#fbbf24');
      g(2, 12, 2, 2, '#78350f');
    },
    leaderboard(g) {
      g(2, 5, 12, 8, '#0a0d18');
      g(3, 6, 2, 6, '#f59e0b'); g(7, 4, 2, 8, '#fbbf24'); g(11, 6, 2, 6, '#f59e0b');
      g(3, 9, 10, 3, '#d97706'); g(4, 10, 8, 1, '#fef08a');
      g(7, 9, 2, 2, '#ef4444');
    },
    exit(g) {
      g(3, 2, 10, 12, '#0a0d18');
      g(4, 3, 8, 10, '#78350f'); g(5, 4, 6, 8, '#92400e');
      g(9, 8, 2, 2, '#fbbf24');
    },
    coin(g) {
      g(3, 2, 10, 12, '#0a0d18'); g(2, 3, 12, 10, '#0a0d18');
      g(4, 3, 8, 10, '#d97706'); g(3, 4, 10, 8, '#f59e0b');
      g(5, 4, 6, 8, '#fbbf24'); g(6, 5, 2, 5, '#fef08a');
    },
    party(g) {
      g(2, 3, 12, 11, '#0a0d18');
      g(6, 3, 4, 4, '#7dd3fc'); g(4, 8, 8, 5, '#2563eb');
      g(2, 5, 3, 3, '#93c5fd'); g(11, 5, 3, 3, '#93c5fd');
      g(2, 9, 3, 4, '#1d4ed8'); g(11, 9, 3, 4, '#1d4ed8');
    },
    trash(g) {
      g(3, 3, 10, 2, '#0a0d18'); g(4, 5, 8, 9, '#0a0d18');
      g(6, 2, 4, 2, '#ef4444'); g(4, 4, 8, 1, '#f87171');
      g(5, 6, 6, 7, '#b91c1c');
      g(6, 7, 1, 5, '#fca5a5'); g(9, 7, 1, 5, '#fca5a5');
    },
    hp_vial(g) {
      g(6, 1, 4, 3, '#d97706'); g(5, 4, 6, 2, '#cbd5e1');
      g(3, 6, 10, 8, '#0a0d18'); g(4, 7, 8, 6, '#dc2626');
      g(5, 8, 6, 4, '#ef4444'); g(5, 8, 2, 2, '#fca5a5');
    },
    mp_vial(g) {
      g(6, 1, 4, 3, '#d97706'); g(5, 4, 6, 2, '#cbd5e1');
      g(3, 6, 10, 8, '#0a0d18'); g(4, 7, 8, 6, '#1d4ed8');
      g(5, 8, 6, 4, '#3b82f6'); g(5, 8, 2, 2, '#93c5fd');
    },
    // --- COMBAT ACTION BUTTONS (Reference Image 2 Bottom-Right) ---
    attack_sword(g) {
      // Crisp bright silver diagonal sword matching Ref Image 2
      g(11, 1, 4, 4, '#f8fafc'); g(9, 3, 4, 4, '#e2e8f0'); g(7, 5, 4, 4, '#cbd5e1'); g(5, 7, 4, 4, '#94a3b8');
      g(10, 2, 2, 2, '#ffffff'); g(8, 4, 2, 2, '#ffffff'); g(6, 6, 2, 2, '#f1f5f9');
      g(3, 8, 5, 2, '#64748b'); g(6, 10, 2, 4, '#64748b');
      g(2, 11, 3, 3, '#334155'); g(1, 13, 2, 2, '#fbbf24');
    },
    auto_slash(g) {
      g(2, 11, 12, 3, '#0ea5e9'); g(4, 8, 10, 3, '#38bdf8');
      g(7, 5, 7, 3, '#7dd3fc'); g(9, 2, 5, 3, '#e0f2fe');
      g(2, 3, 4, 2, '#ef4444'); g(4, 5, 4, 2, '#f87171');
    },
    dash_boot(g) {
      g(2, 4, 5, 2, '#7dd3fc'); g(1, 8, 6, 2, '#38bdf8'); g(3, 12, 4, 1, '#bae6fd');
      g(7, 3, 5, 9, '#cbd5e1'); g(7, 9, 8, 4, '#60a5fa'); g(11, 9, 4, 3, '#e0f2fe');
    },
    loot_gem(g) {
      g(5, 2, 6, 12, '#0a0d18'); g(2, 5, 12, 6, '#0a0d18');
      g(5, 3, 6, 10, '#a855f7'); g(3, 6, 10, 4, '#c084fc');
      g(6, 5, 4, 6, '#f0abfc'); g(6, 5, 2, 2, '#ffffff');
    },
    diamond_quest(g) {
      g(6, 2, 4, 12, '#0a0d18'); g(2, 6, 12, 4, '#0a0d18');
      g(6, 3, 4, 10, '#f59e0b'); g(3, 6, 10, 4, '#fbbf24');
      g(6, 6, 4, 4, '#fef08a'); g(7, 6, 2, 2, '#ffffff');
    },
    // --- EQUIPMENT SLOT PLACEHOLDERS ---
    slot_helmet(g) { DRAWERS.character(g); },
    slot_armor(g) {
      g(3, 2, 10, 12, '#0a0d18'); g(4, 3, 8, 10, '#475569');
      g(2, 3, 3, 4, '#64748b'); g(11, 3, 3, 4, '#64748b'); g(6, 5, 4, 5, '#94a3b8');
    },
    slot_weapon(g) { DRAWERS.weapons(g); },
    slot_offhand(g) { DRAWERS.clan(g); },
    slot_cloak(g) {
      g(4, 2, 8, 3, '#94a3b8'); g(3, 5, 10, 9, '#b91c1c'); g(2, 10, 12, 4, '#7f1d1d');
    },
    slot_amulet(g) {
      g(5, 2, 6, 2, '#fbbf24'); g(4, 4, 2, 4, '#fbbf24'); g(10, 4, 2, 4, '#fbbf24');
      g(5, 8, 6, 6, '#7c3aed'); g(7, 10, 2, 2, '#e9d5ff');
    },
    slot_ring(g) {
      g(4, 5, 8, 8, '#fbbf24'); g(6, 7, 4, 4, '#0d1326'); g(6, 3, 4, 3, '#38bdf8');
    },
    slot_boots(g) {
      g(3, 3, 4, 10, '#64748b'); g(9, 3, 4, 10, '#64748b'); g(2, 10, 5, 3, '#94a3b8'); g(9, 10, 5, 3, '#94a3b8');
    },
    slot_artifact(g) { DRAWERS.loot_gem(g); },

    // --- ALL 15 CUSTOM PIXEL-ART SKILL ICONS (matching Ref Image 2 Skill Bar) ---
    sk_crimson_slash(g) {
      g(0, 0, 16, 16, '#2b0912');
      g(2, 12, 3, 3, '#ef4444'); g(4, 10, 4, 4, '#dc2626'); g(7, 7, 4, 4, '#ef4444'); g(10, 4, 4, 4, '#fca5a5'); g(12, 2, 3, 3, '#ffffff');
      g(1, 13, 2, 2, '#991b1b'); g(5, 11, 2, 2, '#fef08a'); g(9, 6, 2, 2, '#ffffff');
    },
    sk_whirlwind(g) {
      g(0, 0, 16, 16, '#2e1409');
      g(2, 4, 12, 2, '#fb923c'); g(1, 7, 14, 3, '#f97316'); g(3, 11, 10, 2, '#ea580c');
      g(4, 6, 8, 2, '#fde047'); g(6, 8, 4, 2, '#ffffff');
    },
    sk_aegis_shield(g) {
      g(0, 0, 16, 16, '#381e06');
      g(3, 2, 10, 9, '#f59e0b'); g(5, 11, 6, 3, '#d97706');
      g(4, 3, 8, 7, '#fbbf24'); g(6, 4, 4, 6, '#fef08a'); g(7, 5, 2, 4, '#ffffff');
    },
    sk_fire_meteor(g) {
      g(0, 0, 16, 16, '#2e0f07');
      g(8, 1, 6, 5, '#f97316'); g(6, 3, 6, 5, '#fb923c');
      g(3, 7, 8, 7, '#dc2626'); g(4, 8, 6, 5, '#facc15'); g(5, 9, 3, 3, '#ffffff');
    },
    sk_frost_nova(g) {
      g(0, 0, 16, 16, '#09223b');
      g(7, 1, 2, 14, '#38bdf8'); g(1, 7, 14, 2, '#38bdf8');
      g(3, 3, 3, 3, '#7dd3fc'); g(10, 3, 3, 3, '#7dd3fc'); g(3, 10, 3, 3, '#7dd3fc'); g(10, 10, 3, 3, '#7dd3fc');
      g(6, 6, 4, 4, '#e0f2fe'); g(7, 7, 2, 2, '#ffffff');
    },
    sk_chain_lightning(g) {
      g(0, 0, 16, 16, '#1f1c08');
      g(9, 1, 4, 4, '#fde047'); g(6, 4, 5, 3, '#facc15');
      g(5, 7, 6, 3, '#fef08a'); g(3, 10, 5, 4, '#facc15'); g(7, 5, 2, 5, '#ffffff');
    },
    sk_shadow_blink(g) {
      g(0, 0, 16, 16, '#1e0b36');
      g(3, 3, 10, 10, '#7c3aed'); g(4, 4, 8, 8, '#a855f7');
      g(6, 6, 4, 4, '#e9d5ff'); g(7, 7, 2, 2, '#ffffff');
      g(1, 7, 3, 2, '#c084fc'); g(12, 7, 3, 2, '#c084fc');
    },
    sk_poison_fan(g) {
      g(0, 0, 16, 16, '#0a2614');
      g(2, 11, 4, 3, '#22c55e'); g(6, 7, 4, 4, '#4ade80'); g(10, 3, 4, 4, '#bbf7d0');
      g(2, 4, 4, 4, '#16a34a'); g(10, 10, 4, 4, '#22c55e');
    },
    sk_shadow_dance(g) {
      g(0, 0, 16, 16, '#2a0936');
      g(2, 3, 5, 10, '#d946ef'); g(9, 3, 5, 10, '#a855f7'); g(6, 5, 4, 6, '#f5d0fe');
    },
    sk_passive_atk(g) { g(0, 0, 16, 16, '#260d14'); DRAWERS.weapons(g); },
    sk_passive_def(g) { g(0, 0, 16, 16, '#111d36'); DRAWERS.clan(g); },
    sk_passive_mp(g)  { g(0, 0, 16, 16, '#0d1a38'); DRAWERS.mp_vial(g); },
    sk_passive_elem(g){ g(0, 0, 16, 16, '#26180a'); DRAWERS.skills(g); },
    sk_passive_crit(g){ g(0, 0, 16, 16, '#240c2e'); DRAWERS.sk_crimson_slash(g); },
    sk_passive_spd(g) { g(0, 0, 16, 16, '#0c2433'); DRAWERS.dash_boot(g); },

    // --- EXTRA UI / STATUS / CLASS PIXEL ICONS (ZERO EMOJIS) ---
    sack(g) {
      g(5, 1, 6, 3, '#0a0d18'); g(2, 5, 12, 9, '#0a0d18');
      g(6, 2, 4, 2, '#b45309'); g(5, 4, 6, 1, '#f59e0b');
      g(3, 6, 10, 7, '#a16207'); g(4, 7, 8, 5, '#ca8a04');
      g(7, 8, 2, 3, '#38bdf8'); g(7, 8, 1, 1, '#e0f2fe');
    },
    skull(g) {
      g(3, 2, 10, 9, '#0a0d18'); g(5, 11, 6, 4, '#0a0d18');
      g(4, 3, 8, 7, '#e2e8f0'); g(5, 4, 6, 5, '#f8fafc');
      g(5, 6, 2, 2, '#0f172a'); g(9, 6, 2, 2, '#0f172a');
      g(7, 9, 2, 1, '#0f172a');
      g(6, 11, 1, 3, '#cbd5e1'); g(8, 11, 1, 3, '#cbd5e1'); g(10, 11, 1, 3, '#cbd5e1');
    },
    fish(g) {
      g(2, 5, 12, 6, '#0a0d18');
      g(5, 4, 7, 8, '#0284c7'); g(6, 5, 5, 6, '#38bdf8'); g(7, 5, 3, 2, '#bae6fd');
      g(2, 5, 3, 6, '#0369a1'); g(11, 6, 3, 4, '#0284c7');
      g(11, 6, 1, 1, '#0f172a');
    },
    pickaxe(g) {
      g(3, 2, 10, 4, '#0a0d18'); g(7, 5, 3, 9, '#0a0d18');
      g(4, 3, 8, 2, '#cbd5e1'); g(3, 4, 3, 2, '#94a3b8'); g(10, 4, 3, 2, '#94a3b8');
      g(7, 5, 2, 9, '#92400e'); g(7, 6, 1, 7, '#b45309');
    },
    tg_star(g) {
      // Crisp golden 5-point Telegram Star pixel icon
      g(7, 0, 2, 3, '#0a0d18'); g(6, 2, 4, 3, '#0a0d18');
      g(1, 5, 14, 4, '#0a0d18'); g(3, 8, 10, 4, '#0a0d18');
      g(2, 11, 5, 4, '#0a0d18'); g(9, 11, 5, 4, '#0a0d18');
      g(7, 1, 2, 3, '#f59e0b'); g(6, 3, 4, 3, '#fbbf24');
      g(2, 6, 12, 2, '#fbbf24'); g(4, 8, 8, 3, '#f59e0b');
      g(3, 11, 4, 3, '#d97706'); g(9, 11, 4, 3, '#d97706');
      g(7, 2, 1, 4, '#fef08a'); g(4, 6, 5, 1, '#fef9c3'); g(6, 7, 3, 2, '#fde047');
      g(5, 8, 2, 1, '#ffffff');
    },
    admin_bot(g) {
      // Royal Admin Bot pixel helmet/head with golden crown & cyan glowing visor
      g(3, 1, 10, 4, '#0a0d18'); g(2, 4, 12, 10, '#0a0d18');
      g(4, 2, 2, 2, '#fbbf24'); g(7, 1, 2, 3, '#fde047'); g(10, 2, 2, 2, '#fbbf24');
      g(3, 4, 10, 1, '#f59e0b');
      g(3, 5, 10, 8, '#4c1d95'); g(4, 6, 8, 6, '#6d28d9');
      g(4, 7, 8, 3, '#0f172a');
      g(5, 8, 2, 1, '#38bdf8'); g(9, 8, 2, 1, '#38bdf8'); g(7, 8, 2, 1, '#bae6fd');
      g(6, 11, 4, 1, '#fbbf24');
    },
    promo(g) {
      // Golden ticket / gift promo code pixel icon
      g(1, 3, 14, 10, '#0a0d18');
      g(2, 4, 12, 8, '#d97706'); g(3, 5, 10, 6, '#fbbf24');
      g(1, 7, 2, 2, '#0a0d18'); g(13, 7, 2, 2, '#0a0d18');
      g(5, 5, 1, 6, '#92400e');
      g(7, 6, 5, 1, '#fef9c3'); g(7, 8, 4, 1, '#fef08a');
    },
    online(g) {
      // Globe / network signal pixel icon for Multiplayer
      g(3, 2, 10, 12, '#0a0d18'); g(2, 4, 12, 8, '#0a0d18');
      g(4, 3, 8, 10, '#0284c7'); g(3, 5, 10, 6, '#0ea5e9');
      g(5, 4, 3, 3, '#4ade80'); g(8, 8, 4, 3, '#4ade80');
      g(4, 7, 8, 1, '#bae6fd'); g(7, 3, 2, 10, '#38bdf8');
    },
    chat(g) {
      g(1, 2, 14, 10, '#0a0d18'); g(4, 12, 4, 3, '#0a0d18');
      g(2, 3, 12, 8, '#e2e8f0'); g(3, 4, 10, 6, '#f8fafc');
      g(5, 11, 2, 2, '#e2e8f0');
      g(4, 5, 8, 1, '#475569'); g(4, 7, 6, 1, '#475569');
    },
    scale(g) {
      g(2, 2, 10, 10, '#0a0d18'); g(9, 9, 5, 5, '#0a0d18');
      g(3, 3, 8, 8, '#38bdf8'); g(4, 4, 6, 6, '#0f172a');
      g(5, 5, 2, 2, '#bae6fd');
      g(10, 10, 4, 4, '#cbd5e1'); g(11, 11, 2, 2, '#94a3b8');
    },
    pvp(g) {
      g(2, 2, 12, 12, '#0a0d18');
      g(3, 3, 3, 3, '#ef4444'); g(5, 5, 3, 3, '#f87171'); g(7, 7, 3, 3, '#ef4444'); g(9, 9, 3, 3, '#fbbf24');
      g(10, 3, 3, 3, '#ef4444'); g(8, 5, 3, 3, '#f87171'); g(4, 9, 3, 3, '#fbbf24');
    },
    save(g) {
      g(2, 2, 12, 12, '#0a0d18');
      g(3, 3, 10, 10, '#2563eb'); g(5, 3, 6, 4, '#e2e8f0'); g(9, 4, 1, 2, '#1e293b');
      g(4, 8, 8, 4, '#f8fafc'); g(5, 9, 6, 1, '#94a3b8');
    },
    sort(g) {
      g(4, 2, 2, 12, '#38bdf8'); g(2, 4, 6, 2, '#7dd3fc');
      g(10, 2, 2, 12, '#fbbf24'); g(8, 10, 6, 2, '#fef08a');
    },
    split(g) {
      g(2, 4, 5, 8, '#38bdf8'); g(9, 4, 5, 8, '#fbbf24');
      g(7, 2, 2, 12, '#f8fafc');
    },
    bolt(g) {
      g(8, 1, 5, 4, '#facc15'); g(5, 4, 6, 4, '#fde047'); g(4, 8, 6, 3, '#facc15'); g(3, 11, 5, 4, '#eab308');
    },
    check(g) {
      g(2, 8, 3, 3, '#22c55e'); g(4, 10, 3, 3, '#4ade80');
      g(6, 8, 3, 3, '#4ade80'); g(8, 6, 3, 3, '#4ade80'); g(10, 4, 4, 3, '#86efac');
    },
    clock(g) {
      g(3, 2, 10, 12, '#0a0d18'); g(2, 3, 12, 10, '#0a0d18');
      g(4, 3, 8, 10, '#cbd5e1'); g(3, 4, 10, 8, '#cbd5e1');
      g(5, 4, 6, 8, '#0f172a'); g(4, 5, 8, 6, '#0f172a');
      g(7, 5, 2, 4, '#fbbf24'); g(7, 8, 4, 2, '#fbbf24');
    },
    fire(g) {
      g(5, 2, 6, 12, '#dc2626'); g(3, 6, 10, 8, '#ea580c');
      g(5, 7, 6, 6, '#f97316'); g(6, 9, 4, 4, '#fde047'); g(7, 10, 2, 2, '#ffffff');
    },
    heart(g) {
      g(2, 4, 5, 5, '#dc2626'); g(9, 4, 5, 5, '#dc2626'); g(4, 6, 8, 5, '#ef4444');
      g(6, 10, 4, 3, '#dc2626'); g(7, 12, 2, 2, '#b91c1c');
      g(4, 5, 2, 2, '#fca5a5');
    },
    crown(g) {
      g(2, 4, 2, 8, '#f59e0b'); g(7, 2, 2, 10, '#fbbf24'); g(12, 4, 2, 8, '#f59e0b');
      g(2, 8, 12, 4, '#fbbf24'); g(3, 9, 10, 2, '#fef08a');
      g(4, 9, 2, 2, '#ef4444'); g(10, 9, 2, 2, '#38bdf8');
    },
    branch_warrior(g) { DRAWERS.weapons(g); },
    branch_mage(g) { DRAWERS.loot_gem(g); },
    branch_assassin(g) { DRAWERS.sk_shadow_blink(g); },
    axe_tool(g) {
      g(7, 2, 3, 12, '#0a0d18'); g(8, 3, 2, 10, '#92400e');
      g(3, 2, 6, 7, '#0a0d18'); g(4, 3, 4, 5, '#cbd5e1'); g(3, 4, 2, 4, '#f8fafc');
    },
    sickle_tool(g) {
      g(3, 10, 4, 4, '#0a0d18'); g(4, 11, 2, 2, '#92400e');
      g(5, 2, 8, 4, '#0a0d18'); g(10, 4, 4, 6, '#0a0d18'); g(5, 8, 7, 3, '#0a0d18');
      g(6, 3, 6, 2, '#cbd5e1'); g(11, 5, 2, 4, '#f8fafc'); g(6, 9, 5, 1, '#94a3b8');
    },
    enchant(g) {
      g(4, 2, 8, 12, '#0a0d18'); g(2, 4, 12, 8, '#0a0d18');
      g(5, 3, 6, 10, '#7c3aed'); g(3, 5, 10, 6, '#a855f7');
      g(6, 5, 4, 6, '#e879f9'); g(7, 6, 2, 4, '#ffffff');
    },
    scroll(g) {
      g(3, 2, 10, 12, '#0a0d18');
      g(4, 3, 8, 2, '#d97706'); g(4, 11, 8, 2, '#d97706');
      g(4, 5, 8, 6, '#fde68a'); g(5, 7, 6, 2, '#a855f7'); g(7, 6, 2, 4, '#e879f9');
    },
    wood_log(g) {
      g(2, 5, 12, 7, '#0a0d18');
      g(3, 6, 10, 5, '#78350f'); g(4, 7, 8, 3, '#b45309');
      g(3, 6, 3, 5, '#fde68a'); g(4, 7, 1, 3, '#92400e');
    },
    sk_passive_pen(g)  { g(0, 0, 16, 16, '#2b0f14'); DRAWERS.axe_tool(g); },
    sk_passive_vamp(g) { g(0, 0, 16, 16, '#260b24'); DRAWERS.heart(g); },
    sk_passive_luck(g) { g(0, 0, 16, 16, '#241c08'); DRAWERS.coin(g); },

    // --- NEW FEATURE PIXEL ICONS ---
    cosmetics(g) {
      g(2, 2, 12, 12, '#0a0d18');
      g(5, 3, 6, 4, '#ec4899'); g(4, 5, 8, 3, '#f472b6');
      g(3, 8, 10, 4, '#a855f7'); g(4, 9, 8, 2, '#d8b4fe');
      g(7, 2, 2, 2, '#fef08a'); g(2, 7, 2, 2, '#38bdf8'); g(12, 7, 2, 2, '#fbbf24');
    },
    dungeon(g) {
      g(1, 2, 14, 13, '#0a0d18');
      g(2, 3, 12, 11, '#334155'); g(3, 4, 10, 10, '#475569');
      g(5, 5, 6, 9, '#0f172a');
      g(6, 6, 4, 7, '#7c3aed'); g(7, 7, 2, 5, '#c084fc'); g(7, 8, 2, 2, '#ffffff');
      g(2, 5, 2, 2, '#f97316'); g(12, 5, 2, 2, '#f97316');
    },
    fortress(g) {
      g(1, 3, 14, 12, '#0a0d18');
      g(2, 4, 3, 3, '#94a3b8'); g(6, 4, 4, 3, '#cbd5e1'); g(11, 4, 3, 3, '#94a3b8');
      g(2, 7, 12, 7, '#64748b'); g(3, 8, 10, 5, '#475569');
      g(6, 10, 4, 4, '#1e293b');
      g(7, 1, 2, 4, '#fbbf24'); g(9, 1, 4, 2, '#ef4444');
    },
    arena(g) {
      g(1, 1, 14, 14, '#0a0d18');
      g(3, 3, 10, 10, '#1e293b');
      g(4, 3, 3, 3, '#fbbf24'); g(6, 5, 4, 4, '#fde047'); g(9, 8, 3, 3, '#f59e0b');
      g(9, 3, 3, 3, '#38bdf8'); g(4, 8, 3, 3, '#0ea5e9');
      g(7, 7, 2, 2, '#ffffff');
    },
    pet(g) {
      g(3, 2, 10, 12, '#0a0d18');
      g(3, 2, 3, 4, '#ef4444'); g(10, 2, 3, 4, '#ef4444');
      g(4, 4, 8, 8, '#f97316'); g(5, 5, 6, 6, '#fb923c');
      g(5, 6, 2, 2, '#0f172a'); g(9, 6, 2, 2, '#0f172a');
      g(5, 6, 1, 1, '#fef08a'); g(9, 6, 1, 1, '#fef08a');
      g(6, 10, 4, 2, '#fde047');
    },
    battlepass(g) {
      g(2, 1, 12, 14, '#0a0d18');
      g(3, 2, 10, 9, '#7c3aed'); g(4, 3, 8, 7, '#a855f7');
      g(7, 4, 2, 5, '#fde047'); g(5, 6, 6, 2, '#fbbf24');
      g(4, 11, 3, 3, '#f59e0b'); g(9, 11, 3, 3, '#f59e0b');
    },
    bounty(g) {
      g(2, 1, 12, 14, '#0a0d18');
      g(3, 2, 10, 12, '#d97706'); g(4, 3, 8, 10, '#fde68a');
      g(5, 4, 6, 5, '#991b1b'); g(6, 5, 4, 3, '#ef4444');
      g(6, 6, 1, 1, '#fff'); g(9, 6, 1, 1, '#fff');
      g(5, 10, 6, 1, '#78350f'); g(6, 12, 4, 1, '#78350f');
    },
    audio_on(g) {
      g(2, 5, 4, 6, '#cbd5e1'); g(6, 3, 3, 10, '#f8fafc');
      g(10, 5, 2, 6, '#38bdf8'); g(13, 3, 2, 10, '#7dd3fc');
    },
    audio_off(g) {
      g(2, 5, 4, 6, '#64748b'); g(6, 3, 3, 10, '#94a3b8');
      g(10, 5, 2, 2, '#ef4444'); g(12, 7, 2, 2, '#ef4444'); g(14, 9, 2, 2, '#ef4444');
      g(14, 5, 2, 2, '#ef4444'); g(10, 9, 2, 2, '#ef4444');
    },
    cloud(g) {
      g(4, 4, 8, 8, '#0a0d18'); g(2, 6, 12, 6, '#0a0d18');
      g(5, 5, 6, 6, '#38bdf8'); g(3, 7, 10, 4, '#7dd3fc');
      g(7, 9, 2, 4, '#fde047'); g(6, 11, 4, 2, '#fbbf24');
    }
  };

  function get(name, size) {
    const fn = DRAWERS[name] || DRAWERS.skills;
    return gridIcon(name, size || 32, fn);
  }

  function makeWeaponSpellIcon(sk, size) {
    return gridIcon('wsp_' + sk.id, size || 36, (g) => {
      const col = sk.color || '#fbbf24';
      g(0, 0, 16, 16, '#14192e');
      g(1, 1, 14, 14, '#0c1020');
      const v = sk.vfx;
      if (v === 'slash_wave' || v === 'execute_strike') {
        g(2, 11, 4, 3, col); g(5, 8, 4, 4, col); g(8, 5, 4, 4, col); g(11, 2, 3, 3, '#ffffff');
        g(4, 10, 2, 2, '#ffffff'); g(9, 4, 2, 2, '#fef08a');
      } else if (v === 'whirlwind' || v === 'vamp_reap') {
        g(2, 4, 12, 2, col); g(1, 7, 14, 3, col); g(3, 11, 10, 2, col);
        g(5, 7, 6, 2, '#ffffff');
      } else if (v === 'meteor' || v === 'shockwave_slam') {
        g(7, 2, 6, 5, col); g(3, 7, 8, 7, col); g(5, 9, 4, 4, '#fde047'); g(6, 10, 2, 2, '#ffffff');
      } else if (v === 'frost_nova' || v === 'holy_nova') {
        g(7, 2, 2, 12, col); g(2, 7, 12, 2, col);
        g(4, 4, 8, 8, col); g(6, 6, 4, 4, '#ffffff');
      } else if (v === 'lightning' || v === 'beam_blast') {
        g(9, 1, 4, 4, col); g(6, 4, 5, 3, '#ffffff'); g(5, 7, 6, 3, col); g(3, 10, 5, 4, col);
      } else if (v === 'shadow_blink') {
        g(3, 3, 10, 10, col); g(5, 5, 6, 6, '#e9d5ff'); g(7, 7, 2, 2, '#ffffff');
      } else if (v === 'poison_fan' || v === 'cone_barrage' || v === 'arrow_rain') {
        g(2, 11, 4, 3, col); g(6, 7, 4, 4, col); g(10, 3, 4, 4, '#ffffff');
        g(3, 3, 3, 3, col); g(10, 10, 3, 3, col);
      } else if (v === 'shield_buff') {
        g(3, 2, 10, 8, col); g(5, 10, 6, 4, col); g(6, 4, 4, 6, '#ffffff');
      } else {
        g(3, 3, 4, 10, col); g(9, 3, 4, 10, col); g(6, 5, 4, 6, '#ffffff');
      }
      // Crisp gold corner pip indicating Weapon Spell
      g(1, 1, 3, 3, '#fbbf24');
    });
  }

  function skillIcon(skillId, size) {
    const map = {
      crimson_slash: 'sk_crimson_slash',
      whirlwind: 'sk_whirlwind',
      aegis_shield: 'sk_aegis_shield',
      fire_meteor: 'sk_fire_meteor',
      frost_nova: 'sk_frost_nova',
      chain_lightning: 'sk_chain_lightning',
      shadow_blink: 'sk_shadow_blink',
      poison_fan: 'sk_poison_fan',
      shadow_dance: 'sk_shadow_dance',
      p_blade_master: 'sk_passive_atk',
      p_iron_skin: 'sk_passive_def',
      p_armor_pen: 'sk_passive_pen',
      p_arcane_flow: 'sk_passive_mp',
      p_elemental_wrath: 'sk_passive_elem',
      p_spell_vamp: 'sk_passive_vamp',
      p_deadly_crit: 'sk_passive_crit',
      p_wind_step: 'sk_passive_spd',
      p_treasure_hunter: 'sk_passive_luck'
    };
    if (map[skillId]) return get(map[skillId], size || 36);
    const sk = window.GameData && window.GameData.SKILL_BY_ID && window.GameData.SKILL_BY_ID[skillId];
    if (sk && sk.isWeaponSpell) return makeWeaponSpellIcon(sk, size || 36);
    return get('skills', size || 36);
  }

  function imgTag(name, cls, size) {
    return `<img src="${get(name, size || 32)}" class="px-ico ${cls || ''}" alt="" />`;
  }

  // Hydrate all static DOM placeholders <img data-px-icon="...">
  function hydrateDom() {
    document.querySelectorAll('[data-px-icon]').forEach(el => {
      const nm = el.dataset.pxIcon;
      const sz = Number(el.dataset.pxSize) || 32;
      el.src = get(nm, sz);
    });
  }

  return {
    get,
    skillIcon,
    imgTag,
    hydrateDom
  };
})();
