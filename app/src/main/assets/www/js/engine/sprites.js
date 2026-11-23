/* ==========================================================================
   BladeRealm — 16-Bit Pixel-Art Procedural Sprite & Icon Rendering Engine
   High-detail outlined Dark Fantasy Hero (matching Reference Image 1),
   23 Weapons, 12 Mounts, Monsters & Bosses, and Cached Item Icons
   ========================================================================== */

window.Sprites = (function () {
  const iconCache = {};

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // =========================================================================
  // 23 WEAPONS — Detailed Outlined Pixel Art (Icons & Character Hands)
  // =========================================================================
  function drawWeaponShape(ctx, typeId, color, accent, enhance) {
    const c = color || '#e53935';
    const a = accent || '#ffffff';
    const out = '#090b14';
    ctx.save();
    if (enhance >= 5) {
      ctx.shadowColor = enhance >= 10 ? '#fbbf24' : a;
      ctx.shadowBlur = enhance >= 10 ? 11 : 6;
    }

    switch (typeId) {
      case 'sword':
      case 'flame_blade':
      case 'frost_blade':
      case 'lightning_blade':
      case 'legendary_sword': {
        px(ctx, -3, 5, 6, 5, out);
        px(ctx, -2, 6, 4, 3, '#fbbf24');
        px(ctx, -2, 0, 4, 7, out);
        px(ctx, -1, 1, 2, 5, '#451a03');
        px(ctx, -8, -2, 16, 4, out);
        px(ctx, -7, -1, 14, 2, typeId === 'legendary_sword' ? '#fbbf24' : '#94a3b8');
        px(ctx, -1, -2, 2, 3, '#ef4444');
        // Outlined Crimson/Elemental Blade
        px(ctx, -4, -23, 8, 22, out);
        px(ctx, -3, -22, 6, 20, '#1e293b');
        px(ctx, -2, -23, 4, 21, c);
        px(ctx, -1, -24, 2, 21, a);
        if (typeId === 'flame_blade') {
          px(ctx, -5, -16, 2, 6, '#fb923c'); px(ctx, 3, -20, 2, 7, '#fde047');
        } else if (typeId === 'frost_blade') {
          px(ctx, -5, -14, 2, 5, '#bae6fd'); px(ctx, 3, -18, 2, 6, '#7dd3fc');
        } else if (typeId === 'lightning_blade') {
          px(ctx, -5, -17, 2, 4, '#fef08a'); px(ctx, 3, -12, 2, 4, '#fef08a');
        }
        break;
      }
      case 'greatsword': {
        px(ctx, -3, 7, 6, 5, out); px(ctx, -2, 8, 4, 3, '#cbd5e1');
        px(ctx, -2, 0, 4, 9, out); px(ctx, -1, 1, 2, 7, '#334155');
        px(ctx, -9, -2, 18, 4, out); px(ctx, -8, -1, 16, 2, '#94a3b8');
        px(ctx, -5, -27, 10, 26, out);
        px(ctx, -4, -26, 8, 24, '#334155');
        px(ctx, -3, -26, 6, 23, c);
        px(ctx, -1, -28, 2, 24, a);
        break;
      }
      case 'dagger':
      case 'poison_dagger': {
        px(ctx, -2, 2, 4, 6, out); px(ctx, -1, 3, 2, 4, '#475569');
        px(ctx, -5, 0, 10, 3, out); px(ctx, -4, 1, 8, 1, '#94a3b8');
        px(ctx, -3, -14, 6, 15, out);
        px(ctx, -2, -13, 4, 13, c);
        px(ctx, -1, -15, 2, 13, a);
        if (typeId === 'poison_dagger') {
          px(ctx, -4, -9, 2, 2, '#4ade80'); px(ctx, 2, -12, 2, 2, '#22c55e');
        }
        break;
      }
      case 'dual_blades': {
        ctx.save(); ctx.rotate(-0.35);
        px(ctx, -3, -19, 6, 20, out); px(ctx, -2, -18, 4, 18, c); px(ctx, -1, -19, 2, 16, a);
        px(ctx, -5, -1, 10, 3, '#94a3b8');
        ctx.restore();
        ctx.save(); ctx.rotate(0.35);
        px(ctx, -3, -19, 6, 20, out); px(ctx, -2, -18, 4, 18, '#1e293b'); px(ctx, -1, -19, 2, 16, c);
        px(ctx, -5, -1, 10, 3, '#fbbf24');
        ctx.restore();
        break;
      }
      case 'axe': {
        px(ctx, -2, -15, 5, 24, out); px(ctx, -1, -14, 3, 22, '#78350f');
        px(ctx, 1, -17, 11, 14, out); px(ctx, 2, -16, 9, 12, '#475569');
        px(ctx, 4, -15, 7, 10, c); px(ctx, 9, -14, 2, 8, a);
        break;
      }
      case 'greataxe': {
        px(ctx, -2, -19, 5, 30, out); px(ctx, -1, -18, 3, 28, '#451a03');
        px(ctx, -12, -19, 11, 16, out); px(ctx, 2, -19, 11, 16, out);
        px(ctx, -11, -18, 9, 14, c); px(ctx, 3, -18, 9, 14, c);
        px(ctx, -11, -16, 2, 10, a); px(ctx, 10, -16, 2, 10, a);
        break;
      }
      case 'warhammer': {
        px(ctx, -2, -13, 5, 24, out); px(ctx, -1, -12, 3, 22, '#78350f');
        px(ctx, -10, -21, 21, 13, out); px(ctx, -9, -20, 19, 11, '#334155');
        px(ctx, -8, -19, 17, 9, c); px(ctx, -3, -17, 7, 5, a);
        break;
      }
      case 'mace': {
        px(ctx, -2, -11, 5, 21, out); px(ctx, -1, -10, 3, 19, '#57534e');
        px(ctx, -7, -20, 15, 13, out); px(ctx, -6, -19, 13, 11, '#334155');
        px(ctx, -4, -18, 9, 9, c);
        px(ctx, -9, -15, 3, 3, a); px(ctx, 7, -15, 3, 3, a); px(ctx, -1, -23, 3, 3, a);
        break;
      }
      case 'bow': {
        px(ctx, -2, -18, 2, 36, '#e2e8f0');
        px(ctx, 0, -19, 6, 6, out); px(ctx, 3, -14, 6, 28, out); px(ctx, 0, 13, 6, 6, out);
        px(ctx, 1, -18, 4, 5, c); px(ctx, 4, -13, 4, 26, c); px(ctx, 1, 13, 4, 5, c);
        px(ctx, 5, -4, 3, 8, a);
        break;
      }
      case 'crossbow': {
        px(ctx, -3, -13, 6, 24, out); px(ctx, -2, -12, 4, 22, '#78350f');
        px(ctx, -12, -10, 24, 6, out); px(ctx, -11, -9, 22, 4, c);
        px(ctx, -9, -5, 18, 2, '#e2e8f0'); px(ctx, -1, -16, 2, 12, a);
        break;
      }
      case 'staff':
      case 'crystal_staff': {
        px(ctx, -2, -17, 5, 30, out); px(ctx, -1, -16, 3, 28, '#581c87');
        px(ctx, -6, -25, 13, 12, out); px(ctx, -5, -24, 11, 10, c);
        px(ctx, -3, -22, 7, 6, a); px(ctx, -6, -17, 13, 2, '#fbbf24');
        break;
      }
      case 'wand': {
        px(ctx, -2, -11, 4, 20, out); px(ctx, -1, -10, 2, 18, '#60a5fa');
        px(ctx, -5, -18, 10, 10, out); px(ctx, -4, -17, 8, 8, c); px(ctx, -2, -15, 4, 4, a);
        break;
      }
      case 'spear': {
        px(ctx, -2, -13, 4, 28, out); px(ctx, -1, -12, 2, 26, '#92400e');
        px(ctx, -5, -23, 10, 13, out); px(ctx, -4, -22, 8, 11, c); px(ctx, -2, -26, 4, 13, a);
        break;
      }
      case 'halberd': {
        px(ctx, -2, -17, 5, 32, out); px(ctx, -1, -16, 3, 30, '#475569');
        px(ctx, -2, -27, 4, 11, a);
        px(ctx, 2, -21, 10, 14, out); px(ctx, 3, -20, 8, 12, c); px(ctx, -7, -17, 6, 4, a);
        break;
      }
      case 'scythe': {
        px(ctx, -2, -19, 5, 34, out); px(ctx, -1, -18, 3, 32, '#57534e');
        px(ctx, 1, -22, 15, 6, out); px(ctx, 7, -18, 10, 6, out);
        px(ctx, 1, -21, 13, 4, c); px(ctx, 7, -17, 8, 4, c);
        px(ctx, 11, -13, 5, 5, a); px(ctx, 3, -20, 9, 2, a);
        break;
      }
      case 'spellbook': {
        px(ctx, -10, -12, 20, 24, out); px(ctx, -9, -11, 18, 22, '#3b0764');
        px(ctx, -8, -10, 16, 20, c); px(ctx, -9, -10, 3, 20, '#fbbf24');
        px(ctx, -3, -4, 6, 8, a); px(ctx, -1, -2, 2, 4, '#fff');
        break;
      }
      case 'ancient_artifact': {
        px(ctx, -3, 3, 6, 8, out); px(ctx, -2, 4, 4, 6, '#fbbf24');
        px(ctx, -8, -3, 16, 6, out); px(ctx, -7, -2, 14, 4, '#f59e0b');
        px(ctx, -5, -24, 10, 22, out); px(ctx, -4, -22, 8, 20, '#3b0764');
        px(ctx, -3, -24, 6, 22, c); px(ctx, -1, -26, 2, 24, a);
        px(ctx, -6, -15, 2, 6, '#e879f9'); px(ctx, 4, -15, 2, 6, '#e879f9');
        break;
      }
      default: {
        px(ctx, -3, -17, 6, 22, out); px(ctx, -2, -16, 4, 20, c); px(ctx, -1, -17, 2, 18, a);
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // CACHED PIXEL ICON DATA URLS FOR INVENTORY / SHOP / AUCTION / TRADE
  // =========================================================================
  function getItemIcon(item) {
    if (!item) return '';
    const key = [item.category, item.weaponType || item.toolKind || item.templateId, item.color || '', item.tier || 0, item.enchantLv || 0, item.enhance >= 5 ? 1 : 0].join('|');
    if (iconCache[key]) return iconCache[key];

    const c = document.createElement('canvas');
    c.width = 40;
    c.height = 40;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (item.category === 'weapon') {
      ctx.save();
      ctx.translate(20, 22);
      ctx.rotate(Math.PI / 5);
      drawWeaponShape(ctx, item.weaponType, item.color, item.accent, (item.enhance || 0) + (item.enchantLv || 0) * 2);
      ctx.restore();
    } else if (item.category === 'tool') {
      const col = item.color || '#cbd5e1';
      const out = '#090b14';
      if (item.toolKind === 'axe') {
        // Lumberjack Axe T1-T8
        px(ctx, 18, 6, 7, 29, out); px(ctx, 20, 8, 3, 25, '#92400e');
        px(ctx, 7, 6, 15, 16, out); px(ctx, 9, 8, 11, 12, col);
        px(ctx, 8, 9, 3, 10, '#ffffff');
      } else if (item.toolKind === 'pickaxe') {
        // Miner Pickaxe T1-T8
        px(ctx, 18, 10, 6, 25, out); px(ctx, 19, 12, 4, 21, '#92400e');
        px(ctx, 5, 6, 30, 9, out); px(ctx, 7, 8, 26, 5, col);
        px(ctx, 5, 11, 6, 6, out); px(ctx, 29, 11, 6, 6, out);
        px(ctx, 7, 12, 4, 4, '#ffffff'); px(ctx, 29, 12, 4, 4, '#ffffff');
      } else {
        // Herbalist Sickle T1-T8
        px(ctx, 9, 23, 8, 12, out); px(ctx, 11, 25, 4, 8, '#92400e');
        px(ctx, 11, 6, 20, 8, out); px(ctx, 23, 10, 8, 16, out); px(ctx, 13, 20, 14, 7, out);
        px(ctx, 13, 8, 16, 4, col); px(ctx, 25, 11, 4, 13, '#ffffff'); px(ctx, 15, 22, 11, 3, col);
      }
    } else if (item.category === 'armor') {
      const col = item.color || '#64748b';
      const acc = item.accent || '#fbbf24';
      const out = '#090b14';
      switch (item.slot) {
        case 'helmet':
          px(ctx, 8, 7, 24, 24, out);
          px(ctx, 10, 9, 20, 18, col);
          px(ctx, 12, 7, 16, 4, acc);
          px(ctx, 13, 17, 14, 5, '#0f172a');
          px(ctx, 15, 19, 4, 2, '#ef4444');
          px(ctx, 21, 19, 4, 2, '#ef4444');
          px(ctx, 10, 24, 6, 7, col);
          px(ctx, 24, 24, 6, 7, col);
          break;
        case 'armor':
          px(ctx, 5, 7, 30, 26, out);
          px(ctx, 8, 9, 24, 22, col);
          px(ctx, 6, 9, 6, 10, acc);
          px(ctx, 28, 9, 6, 10, acc);
          px(ctx, 15, 14, 10, 12, acc);
          px(ctx, 17, 16, 6, 8, '#0f172a');
          break;
        case 'offhand':
          px(ctx, 8, 6, 24, 24, out);
          px(ctx, 10, 8, 20, 20, col);
          px(ctx, 13, 28, 14, 5, col);
          px(ctx, 16, 33, 8, 3, col);
          px(ctx, 13, 11, 14, 15, acc);
          px(ctx, 16, 14, 8, 9, col);
          break;
        case 'cloak':
          px(ctx, 6, 7, 28, 26, out);
          px(ctx, 12, 8, 16, 5, acc);
          px(ctx, 9, 13, 22, 19, col);
          px(ctx, 7, 25, 26, 7, col);
          break;
        case 'amulet':
          px(ctx, 13, 7, 14, 3, '#fbbf24');
          px(ctx, 11, 10, 3, 10, '#fbbf24');
          px(ctx, 26, 10, 3, 10, '#fbbf24');
          px(ctx, 12, 16, 16, 18, out);
          px(ctx, 14, 18, 12, 14, col);
          px(ctx, 17, 21, 6, 8, acc);
          break;
        case 'ring':
          px(ctx, 10, 12, 20, 20, out);
          px(ctx, 12, 14, 16, 16, '#fbbf24');
          px(ctx, 15, 17, 10, 10, '#0d1326');
          px(ctx, 16, 9, 8, 7, col);
          px(ctx, 18, 11, 4, 3, acc);
          break;
        case 'boots':
          px(ctx, 7, 9, 13, 23, out); px(ctx, 20, 9, 13, 23, out);
          px(ctx, 9, 10, 9, 20, col); px(ctx, 22, 10, 9, 20, col);
          px(ctx, 7, 25, 12, 6, acc); px(ctx, 21, 25, 12, 6, acc);
          break;
        default:
          px(ctx, 9, 9, 22, 22, out);
          px(ctx, 11, 11, 18, 18, col);
          px(ctx, 15, 15, 10, 10, acc);
          px(ctx, 18, 18, 4, 4, '#fff');
      }
    } else if (item.category === 'potion') {
      if (item.templateId && item.templateId.startsWith('fish')) {
        px(ctx, 9, 13, 26, 14, '#090b14');
        px(ctx, 11, 15, 18, 10, item.color || '#60a5fa');
        px(ctx, 28, 13, 6, 14, item.color || '#60a5fa');
        px(ctx, 14, 18, 3, 3, '#0f172a');
        px(ctx, 16, 16, 9, 3, '#fff');
      } else {
        px(ctx, 15, 5, 10, 7, '#090b14');
        px(ctx, 16, 6, 8, 5, '#d97706');
        px(ctx, 14, 11, 12, 4, '#cbd5e1');
        px(ctx, 8, 14, 24, 21, '#090b14');
        px(ctx, 10, 15, 20, 18, '#1e293b');
        px(ctx, 12, 17, 16, 14, item.color || '#ef4444');
        px(ctx, 14, 19, 4, 6, 'rgba(255,255,255,0.65)');
      }
    } else {
      const tid = item.templateId || '';
      if (tid.startsWith('wood_t')) {
        // Stacked Logs tinted by Wood Tier
        px(ctx, 5, 18, 30, 14, '#090b14'); px(ctx, 7, 20, 26, 10, item.color || '#92400e');
        px(ctx, 9, 10, 24, 12, '#090b14'); px(ctx, 11, 12, 20, 8, item.color || '#b45309');
        px(ctx, 7, 20, 7, 10, '#fde68a'); px(ctx, 9, 23, 3, 4, '#78350f');
        px(ctx, 11, 12, 6, 8, '#fef3c7'); px(ctx, 13, 14, 2, 4, '#78350f');
      } else if (tid.startsWith('ore_t')) {
        // Jagged Tiered Ore Chunk
        px(ctx, 6, 11, 28, 22, '#090b14'); px(ctx, 8, 13, 24, 18, '#1e293b');
        px(ctx, 10, 11, 12, 12, item.color || '#94a3b8');
        px(ctx, 20, 16, 10, 11, item.color || '#94a3b8');
        px(ctx, 12, 13, 5, 5, '#ffffff');
      } else if (tid.startsWith('herb_t') || tid === 'herb_leaf') {
        px(ctx, 17, 21, 6, 14, '#090b14');
        px(ctx, 18, 22, 4, 12, '#15803d');
        px(ctx, 9, 10, 11, 13, '#090b14'); px(ctx, 10, 11, 9, 11, item.color || '#22c55e');
        px(ctx, 20, 8, 11, 13, '#090b14'); px(ctx, 21, 9, 9, 11, item.color || '#4ade80');
        px(ctx, 15, 13, 10, 8, '#ffffff');
      } else if (tid === 'scroll_enchant') {
        px(ctx, 8, 6, 24, 28, '#090b14');
        px(ctx, 10, 8, 20, 5, '#d97706'); px(ctx, 10, 27, 20, 5, '#d97706');
        px(ctx, 10, 13, 20, 14, '#fde68a');
        px(ctx, 10, 18, 20, 4, '#a855f7'); px(ctx, 17, 15, 6, 10, '#e879f9');
        px(ctx, 19, 18, 2, 4, '#ffffff');
      } else if (tid === 'rune_t1' || tid === 'soul_t2' || tid === 'relic_t3' || tid === 'ancient_essence') {
        px(ctx, 9, 5, 22, 30, '#090b14');
        px(ctx, 11, 7, 18, 26, '#1e293b');
        px(ctx, 13, 9, 14, 22, item.color || '#4ade80');
        px(ctx, 17, 11, 6, 18, '#ffffff');
        px(ctx, 13, 17, 14, 4, '#ffffff');
      } else if (tid === 'swamp_shroom') {
        px(ctx, 15, 20, 10, 14, '#090b14'); px(ctx, 16, 21, 8, 12, '#cbd5e1');
        px(ctx, 7, 10, 26, 13, '#090b14'); px(ctx, 9, 12, 22, 9, '#9333ea');
        px(ctx, 12, 14, 4, 4, '#f0abfc'); px(ctx, 22, 13, 4, 4, '#e879f9');
      } else if (tid === 'desert_spice') {
        px(ctx, 9, 13, 22, 20, '#090b14'); px(ctx, 11, 15, 18, 16, '#92400e');
        px(ctx, 12, 10, 16, 8, '#f59e0b'); px(ctx, 15, 8, 10, 6, '#fde047');
        px(ctx, 11, 21, 18, 3, '#fbbf24');
      } else if (tid === 'sea_pearl') {
        px(ctx, 8, 14, 24, 18, '#090b14'); px(ctx, 10, 16, 20, 14, '#1e3a8a');
        px(ctx, 13, 12, 14, 14, '#090b14'); px(ctx, 15, 14, 10, 10, '#67e8f9');
        px(ctx, 17, 15, 4, 4, '#ffffff');
      } else if (tid === 'frost_shard') {
        px(ctx, 15, 5, 10, 30, '#090b14'); px(ctx, 10, 13, 20, 16, '#090b14');
        px(ctx, 17, 7, 6, 26, '#38bdf8'); px(ctx, 12, 15, 16, 12, '#7dd3fc');
        px(ctx, 17, 11, 4, 12, '#ffffff');
      } else if (tid === 'magma_core') {
        px(ctx, 9, 9, 22, 22, '#090b14'); px(ctx, 11, 11, 18, 18, '#b91c1c');
        px(ctx, 13, 13, 14, 14, '#f97316'); px(ctx, 16, 16, 8, 8, '#fde047');
        px(ctx, 18, 18, 4, 4, '#ffffff');
      } else if (tid === 'dragon_scale') {
        px(ctx, 10, 7, 20, 26, '#090b14'); px(ctx, 12, 9, 16, 22, '#991b1b');
        px(ctx, 14, 11, 12, 16, '#ef4444'); px(ctx, 16, 13, 6, 8, '#fbbf24');
      } else if (tid === 'upgrade_stone' || tid === 'star_crystal') {
        px(ctx, 14, 4, 12, 32, '#090b14');
        px(ctx, 8, 12, 24, 16, '#090b14');
        px(ctx, 16, 6, 8, 28, item.color || '#f59e0b');
        px(ctx, 10, 14, 20, 12, item.color || '#f59e0b');
        px(ctx, 16, 14, 8, 8, '#fff');
      } else {
        px(ctx, 7, 12, 26, 20, '#090b14');
        px(ctx, 9, 14, 22, 16, '#334155');
        px(ctx, 12, 11, 16, 15, item.color || '#94a3b8');
        px(ctx, 15, 14, 6, 5, '#fff');
      }
    }

    const url = c.toDataURL();
    iconCache[key] = url;
    return url;
  }

  // =========================================================================
  // UPGRADED HIGH-DETAIL MOUNT PIXEL ART RENDERER (All 12 Mounts — Ref Image 3)
  // Layered shading, saddles, barding armor, glowing runes, flames & ice spikes
  // =========================================================================
  function drawMount(ctx, mountId, dirX, animTime, moving) {
    const m = window.GameData.MOUNT_BY_ID[mountId];
    if (!m) return;
    const facing = dirX < 0 ? -1 : 1;
    const stride = moving ? Math.sin(animTime * 13) * 6 : Math.sin(animTime * 3) * 1.1;
    const stride2 = moving ? Math.sin(animTime * 13 + Math.PI) * 5.5 : -Math.sin(animTime * 3) * 1.0;
    const bob = moving ? Math.abs(Math.cos(animTime * 13)) * 2.8 : Math.sin(animTime * 3.2) * 1.1;
    const flamePulse = Math.sin(animTime * 14) * 2.2;
    const out = '#090b14';

    ctx.save();
    ctx.scale(facing, 1);

    // Rich Ground Shadow + Elemental Aura Ring
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.ellipse(0, 17, 29, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (m.rarity === 'epic' || m.rarity === 'legendary' || m.rarity === 'rare') {
      ctx.save();
      ctx.strokeStyle = m.glow;
      ctx.globalAlpha = (m.rarity === 'legendary' ? 0.65 : 0.42) + Math.sin(animTime * 6) * 0.18;
      ctx.lineWidth = m.rarity === 'legendary' ? 2.4 : 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 15, 30, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.translate(0, -bob);

    switch (m.bodyType) {
      case 'dragon':
      case 'fire_dragon': {
        const isFire = m.bodyType === 'fire_dragon';
        const flap = Math.sin(animTime * (moving ? 14 : 6.5)) * 9;
        const scaleDark = isFire ? '#1f1614' : '#151926';
        const scaleMid = isFire ? '#36231e' : '#262d42';
        const bellyCol = isFire ? '#f97316' : '#dc2626';
        const wingCol = isFire ? '#ea580c' : '#b91c1c';
        const wingHi = isFire ? '#facc15' : '#ef4444';
        const glowCol = isFire ? '#fde047' : '#ff4d5a';

        // Back Wing (darker silhouette)
        px(ctx, -18, -32 + flap * 0.8, 22, 18, out);
        px(ctx, -16, -30 + flap * 0.8, 18, 14, isFire ? '#9a3412' : '#7f1d1d');

        // Barbed Segmented Dragon Tail
        const tailWave = Math.sin(animTime * 8) * 2.5;
        px(ctx, -37, -1 + tailWave, 20, 8, out);
        px(ctx, -36, 0 + tailWave, 18, 6, scaleDark);
        px(ctx, -34, 3 + tailWave, 14, 2, bellyCol);
        px(ctx, -41, -4 + tailWave, 8, 7, out);
        px(ctx, -40, -3 + tailWave, 6, 5, isFire ? '#facc15' : '#ef4444');
        if (isFire) px(ctx, -43, -6 + tailWave + flamePulse * 0.5, 5, 5, '#fef08a');

        // Far Legs
        px(ctx, -15 + stride2, 6, 8, 12, out); px(ctx, -14 + stride2, 7, 6, 10, scaleDark);
        px(ctx, 8 + stride, 6, 8, 12, out); px(ctx, 9 + stride, 7, 6, 10, scaleDark);

        // Muscular Dragon Torso + Molten Belly Scales
        px(ctx, -22, -10, 42, 20, out);
        px(ctx, -20, -8, 38, 16, scaleDark);
        px(ctx, -18, -7, 32, 8, scaleMid);
        // Glowing magma/crimson belly & seam lines
        px(ctx, -15, 2, 27, 6, bellyCol);
        px(ctx, -12, 4, 21, 3, glowCol);
        px(ctx, -10, -4, 4, 3, glowCol); px(ctx, 0, -2, 5, 3, glowCol); px(ctx, 8, -4, 4, 3, glowCol);

        // Royal Gold/Red Dragon Harness Saddle
        px(ctx, -8, -10, 14, 9, out);
        px(ctx, -7, -9, 12, 7, '#7f1d1d');
        px(ctx, -7, -9, 12, 2, '#fbbf24');

        // Near Legs with Glowing Magma Claws
        px(ctx, -17 + stride, 5, 9, 13, out);
        px(ctx, -16 + stride, 6, 7, 11, scaleMid);
        px(ctx, -16 + stride, 13, 8, 4, bellyCol);
        px(ctx, 7 + stride2, 5, 9, 13, out);
        px(ctx, 8 + stride2, 6, 7, 11, scaleMid);
        px(ctx, 9 + stride2, 13, 8, 4, bellyCol);

        // Front Huge Articulated Wing
        px(ctx, -28, -30 + flap, 28, 20, out);
        px(ctx, -26, -28 + flap, 24, 16, wingCol);
        px(ctx, -24, -26 + flap, 18, 10, wingHi);
        px(ctx, -28, -30 + flap, 26, 3, scaleMid); // wing bone ridge
        px(ctx, -14, -27 + flap, 3, 15, scaleDark); // wing rib
        px(ctx, -22, -26 + flap, 3, 13, scaleDark); // wing rib
        if (isFire) {
          px(ctx, -27, -20 + flap, 14, 5, '#fef08a');
        }

        // Long Armored Neck & Horned Dragon Head
        px(ctx, 12, -20, 13, 16, out);
        px(ctx, 13, -19, 11, 14, scaleMid);
        px(ctx, 19, -17, 4, 11, bellyCol);
        px(ctx, 14, -27, 21, 13, out);
        px(ctx, 15, -26, 19, 11, scaleMid);
        px(ctx, 25, -21, 9, 6, scaleDark); // snout & jaw
        px(ctx, 27, -18, 6, 2, glowCol); // fiery mouth glow
        // Swept Horns
        px(ctx, 13, -32, 5, 7, out); px(ctx, 14, -31, 3, 6, isFire ? '#facc15' : '#b45309');
        px(ctx, 19, -31, 4, 6, out); px(ctx, 20, -30, 2, 5, '#fbbf24');
        // Fierce Glowing Eye
        px(ctx, 24, -24, 4, 3, glowCol); px(ctx, 26, -24, 2, 2, '#ffffff');
        if (isFire) {
          px(ctx, 34, -21 + flamePulse * 0.4, 5, 3, '#f97316');
          px(ctx, 37, -22 - flamePulse * 0.4, 3, 2, '#fef08a');
        }
        break;
      }

      case 'spider': {
        // 8 Articulated Obsidian Legs with Glowing Violet Joints & Tips
        const legBase = [-18, -10, -2, 6];
        for (let i = 0; i < 4; i++) {
          const swing = Math.sin(animTime * (moving ? 16 : 4) + i * 1.45) * (moving ? 5 : 1.2);
          // Back/far leg
          px(ctx, legBase[i] - 5, -6, 4, 10, '#0f172a');
          px(ctx, legBase[i] - 9 + swing, 1, 5, 14, out);
          px(ctx, legBase[i] - 8 + swing, 2, 3, 11, '#312e81');
          px(ctx, legBase[i] - 8 + swing, 12, 3, 3, '#d946ef');
          // Front/near leg
          px(ctx, legBase[i] + 9, -4, 5, 9, out);
          px(ctx, legBase[i] + 13 - swing, 2, 5, 14, out);
          px(ctx, legBase[i] + 14 - swing, 3, 3, 11, '#4c1d95');
          px(ctx, legBase[i] + 14 - swing, 13, 3, 3, '#f0abfc');
        }
        // Bulbous Shadow Abdomen with Glowing Magenta Orbs
        px(ctx, -31, -16, 28, 23, out);
        px(ctx, -29, -14, 24, 19, '#1a1033');
        px(ctx, -27, -13, 20, 12, '#2e1065');
        px(ctx, -24, -10, 6, 6, '#a855f7'); px(ctx, -23, -9, 3, 3, '#f5d0fe');
        px(ctx, -14, -7, 5, 5, '#d946ef'); px(ctx, -13, -6, 2, 2, '#ffffff');
        px(ctx, -21, -1, 4, 4, '#c084fc');
        // Cephalothorax & Saddle
        px(ctx, -5, -11, 22, 16, out);
        px(ctx, -4, -10, 20, 14, '#1e1b4b');
        px(ctx, -2, -10, 12, 5, '#7c3aed');
        // Glowing Cluster Eyes & Venom Fangs
        px(ctx, 11, -8, 3, 3, '#f0abfc'); px(ctx, 14, -6, 3, 3, '#e879f9'); px(ctx, 11, -4, 2, 2, '#ffffff');
        px(ctx, 15, -1, 4, 6, out); px(ctx, 16, 0, 2, 4, '#4ade80');
        break;
      }

      case 'mammoth': {
        // Massive Woolly Back Legs
        px(ctx, -20 + stride2 * 0.55, 7, 10, 11, out); px(ctx, -19 + stride2 * 0.55, 8, 8, 9, '#451a03');
        px(ctx, 8 + stride * 0.55, 7, 10, 11, out); px(ctx, 9 + stride * 0.55, 8, 8, 9, '#451a03');

        // Huge Shaggy Woolly Torso
        px(ctx, -27, -17, 46, 28, out);
        px(ctx, -25, -15, 42, 24, '#6b3a17');
        px(ctx, -23, -14, 38, 15, '#854d1e');
        px(ctx, -25, 4, 42, 5, '#4c260d'); // shaggy lower fur trim

        // Ornate Royal Crimson & Gold Saddle Blanket with Steel Shield Plates
        px(ctx, -18, -15, 26, 17, out);
        px(ctx, -17, -14, 24, 15, '#991b1b');
        px(ctx, -17, -14, 24, 2, '#fbbf24');
        px(ctx, -17, -1, 24, 2, '#fbbf24');
        px(ctx, -10, -10, 10, 9, '#475569'); // steel crest shield
        px(ctx, -8, -8, 6, 5, '#cbd5e1');
        px(ctx, -6, -7, 2, 3, '#ef4444');

        // Massive Pillar Front/Near Legs
        px(ctx, -22 + stride * 0.55, 6, 11, 12, out);
        px(ctx, -21 + stride * 0.55, 7, 9, 10, '#6b3a17');
        px(ctx, -21 + stride * 0.55, 14, 9, 3, '#cbd5e1'); // toenails
        px(ctx, 6 + stride2 * 0.55, 6, 11, 12, out);
        px(ctx, 7 + stride2 * 0.55, 7, 9, 10, '#6b3a17');
        px(ctx, 7 + stride2 * 0.55, 14, 9, 3, '#cbd5e1');

        // Giant Domed Head, Shaggy Crown & Curling Trunk
        px(ctx, 13, -19, 18, 21, out);
        px(ctx, 14, -18, 16, 19, '#7c441c');
        px(ctx, 16, -18, 12, 6, '#9c5a27');
        px(ctx, 14, -10, 7, 9, '#572d10'); // ear
        // Animated Trunk
        const trunkSwing = Math.sin(animTime * 4) * 2;
        px(ctx, 27, -7, 7, 17, out);
        px(ctx, 28, -6, 5, 15, '#7c441c');
        px(ctx, 29 + trunkSwing, 6, 6, 5, '#854d1e');
        // Sweeping Curved Ivory Tusks
        px(ctx, 22, -2, 16, 5, out); px(ctx, 23, -1, 14, 3, '#fef3c7');
        px(ctx, 33, -9, 6, 10, out); px(ctx, 34, -8, 4, 8, '#fffbeb');
        // Eye
        px(ctx, 23, -13, 3, 3, '#090b14'); px(ctx, 24, -13, 1, 1, '#fef08a');
        break;
      }

      case 'bear': {
        // Back Legs
        px(ctx, -18 + stride2 * 0.7, 6, 9, 11, out); px(ctx, -17 + stride2 * 0.7, 7, 7, 9, '#451a03');
        px(ctx, 9 + stride * 0.7, 6, 9, 11, out); px(ctx, 10 + stride * 0.7, 7, 7, 9, '#451a03');

        // Massive Muscular Grizzly Body
        px(ctx, -25, -14, 44, 24, out);
        px(ctx, -23, -12, 40, 20, '#693a14');
        px(ctx, -21, -11, 36, 12, '#854d1e');
        px(ctx, -18, 3, 32, 5, '#4c260d');

        // Riveted Iron & Gold Battle Armor Plates (Ref Image 3)
        px(ctx, -18, -13, 28, 14, out);
        px(ctx, -17, -12, 26, 12, '#334155');
        px(ctx, -16, -11, 24, 3, '#64748b');
        px(ctx, -17, -12, 26, 2, '#fbbf24');
        px(ctx, -17, -1, 26, 2, '#fbbf24');
        px(ctx, -8, -8, 8, 6, '#991b1b'); // red saddle seat

        // Near Legs + Claws
        px(ctx, -20 + stride * 0.7, 5, 10, 12, out);
        px(ctx, -19 + stride * 0.7, 6, 8, 10, '#783f15');
        px(ctx, -17 + stride * 0.7, 14, 7, 3, '#e2e8f0');
        px(ctx, 7 + stride2 * 0.7, 5, 10, 12, out);
        px(ctx, 8 + stride2 * 0.7, 6, 8, 10, '#783f15');
        px(ctx, 10 + stride2 * 0.7, 14, 7, 3, '#e2e8f0');

        // Fierce Bear Head, Armored Collar, Ears & Snout
        px(ctx, 13, -16, 17, 16, out);
        px(ctx, 14, -15, 15, 14, '#7c441c');
        px(ctx, 14, -19, 5, 5, out); px(ctx, 15, -18, 3, 3, '#854d1e');
        px(ctx, 25, -9, 7, 7, out); px(ctx, 26, -8, 5, 5, '#a1622e'); // snout
        px(ctx, 29, -8, 3, 2, '#090b14'); // nose
        px(ctx, 27, -4, 3, 2, '#ffffff'); // fang
        px(ctx, 22, -11, 3, 3, '#fbbf24'); // amber eye
        break;
      }

      case 'quadruped_wolf':
      case 'ice_wolf':
      case 'tiger': {
        const isIce = m.bodyType === 'ice_wolf';
        const isTiger = m.bodyType === 'tiger';
        const furMain = isTiger ? '#f97316' : (isIce ? '#93c5fd' : '#e2e8f0');
        const furHi = isTiger ? '#fdba74' : (isIce ? '#e0f2fe' : '#f8fafc');
        const furDark = isTiger ? '#c2410c' : (isIce ? '#3b82f6' : '#94a3b8');

        // Bushy / Striped Tail
        const tailWag = Math.sin(animTime * 9) * 2.5;
        px(ctx, -32, -8 + tailWag, 15, 8, out);
        px(ctx, -31, -7 + tailWag, 13, 6, furMain);
        px(ctx, -31, -7 + tailWag, 6, 4, isTiger ? '#1e1b18' : (isIce ? '#38bdf8' : '#7dd3fc'));

        // Far Legs
        px(ctx, -16 + stride2, 5, 6, 12, out); px(ctx, -15 + stride2, 6, 4, 10, furDark);
        px(ctx, 10 + stride, 5, 6, 12, out); px(ctx, 11 + stride, 6, 4, 10, furDark);

        // Agile Shaded Body
        px(ctx, -21, -10, 39, 18, out);
        px(ctx, -19, -8, 35, 14, furMain);
        px(ctx, -17, -7, 31, 6, furHi);
        px(ctx, -14, 2, 26, 4, isTiger ? '#fef3c7' : furDark);

        if (isTiger) {
          // Crisp Black Tiger Stripes + Battle Harness
          px(ctx, -14, -8, 3, 11, '#111827');
          px(ctx, -7, -8, 3, 12, '#111827');
          px(ctx, 0, -8, 3, 11, '#111827');
          px(ctx, 7, -8, 3, 11, '#111827');
          px(ctx, -10, -9, 14, 7, '#991b1b');
          px(ctx, -10, -9, 14, 2, '#fbbf24');
        } else if (isIce) {
          // Jagged Glowing Ice Crystals on Back & Tail (Ref Image 3)
          px(ctx, -20, -17, 6, 10, out); px(ctx, -19, -16, 4, 8, '#38bdf8'); px(ctx, -18, -15, 2, 5, '#ffffff');
          px(ctx, -11, -21, 7, 13, out); px(ctx, -10, -20, 5, 11, '#7dd3fc'); px(ctx, -9, -19, 2, 7, '#ffffff');
          px(ctx, -1, -18, 6, 10, out); px(ctx, 0, -17, 4, 8, '#38bdf8'); px(ctx, 1, -16, 2, 5, '#e0f2fe');
          px(ctx, 7, -15, 5, 8, '#7dd3fc');
        } else {
          // Silver-White Wolf with Glowing Icy-Blue Runes & Leather Saddle (Ref Image 3)
          px(ctx, -15, -4, 4, 6, '#38bdf8'); px(ctx, -13, -2, 3, 3, '#bae6fd');
          px(ctx, -8, -9, 14, 8, '#1e293b'); px(ctx, -7, -8, 12, 3, '#dc2626');
          px(ctx, 7, -7, 4, 8, '#38bdf8');
        }

        // Near Legs
        px(ctx, -18 + stride, 4, 7, 13, out); px(ctx, -17 + stride, 5, 5, 11, furMain);
        px(ctx, 8 + stride2, 4, 7, 13, out); px(ctx, 9 + stride2, 5, 5, 11, furMain);
        if (isIce) {
          px(ctx, -17 + stride, 13, 5, 3, '#38bdf8');
          px(ctx, 9 + stride2, 13, 5, 3, '#38bdf8');
        }

        // Detailed Head, Ears, Snout & Glowing Eyes
        px(ctx, 11, -17, 16, 14, out);
        px(ctx, 12, -16, 14, 12, furMain);
        px(ctx, 13, -15, 10, 5, furHi);
        px(ctx, 24, -11, 7, 6, out); px(ctx, 25, -10, 5, 4, isTiger ? '#fef3c7' : furHi); // muzzle
        px(ctx, 28, -10, 2, 2, '#090b14'); // nose
        px(ctx, 13, -21, 5, 6, out); px(ctx, 14, -20, 3, 5, furDark); // ear
        px(ctx, 21, -13, 3, 3, isTiger ? '#fde047' : '#38bdf8');
        px(ctx, 22, -13, 1, 1, '#ffffff');
        break;
      }

      default: {
        // HORSE, UNICORN, SKELETON HORSE, PHANTOM HORSE (Detailed Ref Image 3)
        const isSkel = m.bodyType === 'skeleton_horse';
        const isUni = m.bodyType === 'unicorn';
        const isPhan = m.bodyType === 'phantom_horse';

        const coat = isUni ? '#f8fafc' : (isSkel ? '#e2e8f0' : (isPhan ? '#1e1b4b' : '#854d0e'));
        const coatHi = isUni ? '#ffffff' : (isSkel ? '#ffffff' : (isPhan ? '#4c1d95' : '#a16207'));
        const coatDark = isUni ? '#cbd5e1' : (isSkel ? '#94a3b8' : (isPhan ? '#0f172a' : '#572d08'));
        const maneCol = isUni ? '#c084fc' : (isSkel ? '#38bdf8' : (isPhan ? '#a855f7' : '#1e1b18'));
        const maneHi = isUni ? '#f5d0fe' : (isSkel ? '#bae6fd' : (isPhan ? '#f0abfc' : '#44403c'));

        // Flowing Tail (with spectral fire for Skeleton/Phantom/Unicorn!)
        const tWave = Math.sin(animTime * 10) * 2.5;
        px(ctx, -31, -7 + tWave, 14, 13, out);
        px(ctx, -30, -6 + tWave, 12, 11, maneCol);
        px(ctx, -28, -4 + tWave, 7, 7, maneHi);
        if (isSkel || isPhan) {
          px(ctx, -34, -10 + flamePulse, 6, 8, maneHi);
        }

        // Far Legs
        px(ctx, -16 + stride2, 5, 6, 13, out); px(ctx, -15 + stride2, 6, 4, 11, coatDark);
        px(ctx, 10 + stride, 5, 6, 13, out); px(ctx, 11 + stride, 6, 4, 11, coatDark);

        // Steed Torso
        px(ctx, -21, -11, 39, 19, out);
        px(ctx, -19, -9, 35, 15, isSkel ? '#0f172a' : coat);
        if (!isSkel) {
          px(ctx, -17, -8, 31, 6, coatHi);
        }

        if (isSkel) {
          // Crisp Ribcage & Spine Bones!
          px(ctx, -17, -8, 31, 3, '#f8fafc');
          for (let r = -12; r <= 6; r += 5) {
            px(ctx, r, -5, 3, 10, '#e2e8f0');
            px(ctx, r + 1, -4, 1, 8, '#ffffff');
          }
          px(ctx, -14, -6, 26, 2, '#38bdf8'); // ghostly spine glow
        } else if (isPhan) {
          // Silver-Violet Spectral Barding Armor
          px(ctx, -18, -9, 12, 11, '#312e81');
          px(ctx, -17, -8, 10, 3, '#c084fc');
          px(ctx, -6, -9, 14, 10, '#4c1d95');
          px(ctx, 8, -9, 8, 10, '#312e81');
          px(ctx, -6, -9, 14, 2, '#e879f9');
        } else if (isUni) {
          // Ethereal Violet Glow Trim
          px(ctx, -8, -9, 14, 7, '#a855f7');
          px(ctx, -7, -8, 12, 2, '#f5d0fe');
        } else {
          // Knight Warhorse Steel Barding & Crimson Royal Caparison
          px(ctx, -19, -9, 12, 12, '#475569'); px(ctx, -18, -8, 10, 3, '#cbd5e1');
          px(ctx, -8, -9, 15, 13, '#b91c1c'); px(ctx, -8, -9, 15, 2, '#fbbf24'); px(ctx, -8, 2, 15, 2, '#fbbf24');
          px(ctx, 8, -8, 8, 10, '#475569'); px(ctx, 9, -7, 6, 2, '#fbbf24');
        }

        // Near Legs + Spectral Hoof Fire
        px(ctx, -18 + stride, 4, 7, 14, out);
        px(ctx, -17 + stride, 5, 5, 12, coat);
        px(ctx, 8 + stride2, 4, 7, 14, out);
        px(ctx, 9 + stride2, 5, 5, 12, coat);
        if (isSkel || isPhan || isUni) {
          px(ctx, -18 + stride, 13, 7, 5, maneCol);
          px(ctx, 8 + stride2, 13, 7, 5, maneCol);
          px(ctx, -17 + stride, 14 + flamePulse * 0.3, 5, 3, maneHi);
          px(ctx, 9 + stride2, 14 - flamePulse * 0.3, 5, 3, maneHi);
        } else {
          px(ctx, -17 + stride, 15, 5, 3, '#1e293b');
          px(ctx, 9 + stride2, 15, 5, 3, '#1e293b');
        }

        // Neck, Flowing Mane & Head
        px(ctx, 9, -22, 13, 17, out);
        px(ctx, 10, -21, 11, 15, coat);
        px(ctx, 8, -23 + (isSkel || isPhan ? flamePulse * 0.4 : 0), 6, 15, maneCol);
        px(ctx, 9, -21, 3, 11, maneHi);

        px(ctx, 15, -26, 18, 12, out);
        px(ctx, 16, -25, 16, 10, coat);
        px(ctx, 16, -25, 10, 4, coatHi);
        if (isSkel) {
          px(ctx, 25, -20, 6, 4, '#0f172a'); // skull jaw gap
          px(ctx, 26, -18, 5, 2, '#f8fafc');
        }
        // Glowing Eye
        px(ctx, 25, -22, 3, 3, isUni ? '#c084fc' : (isSkel ? '#38bdf8' : (isPhan ? '#f0abfc' : '#fbbf24')));
        px(ctx, 26, -22, 1, 1, '#ffffff');
        // Unicorn Spiral Glowing Horn!
        if (isUni) {
          px(ctx, 28, -32, 4, 10, out);
          px(ctx, 29, -31, 2, 8, '#e879f9');
          px(ctx, 30, -34, 2, 5, '#ffffff');
        }
        break;
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // UPGRADED GROUND LOOT & COIN DROP PIXEL-ART RENDERER
  // Draws gleaming coin stacks/pouches, floating real weapons, armor, flasks,
  // crystals, rarity pillars, ground shadow, sparkle glints & crisp labels!
  // =========================================================================
  function drawGroundLoot(ctx, loot, animTime, player) {
    const isGold = loot.kind === 'gold';
    const rarObj = window.GameData.RARITIES[loot.rarity] || window.GameData.RARITIES.common;
    const rc = isGold ? '#fbbf24' : rarObj.color;
    const bob = Math.sin(animTime * 5.2 + loot.x * 0.1) * 3.2;
    const out = '#090b14';

    ctx.save();
    ctx.translate(Math.round(loot.x), Math.round(loot.y));

    // Soft Ground Shadow + Rarity Halo Ring
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 9, isGold ? 10 : 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!isGold && loot.rarity !== 'common') {
      ctx.save();
      ctx.strokeStyle = rc;
      ctx.globalAlpha = 0.55 + Math.sin(animTime * 7 + loot.x) * 0.2;
      ctx.lineWidth = loot.rarity === 'legendary' ? 2.2 : 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 8, 14, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Vertical Light Pillar for Uncommon / Rare / Epic / Legendary (and big gold piles!)
    const beamTier = isGold ? (loot.amount >= 160 ? 2 : 0) : (loot.rarity === 'legendary' ? 4 : (loot.rarity === 'epic' ? 3 : (loot.rarity === 'rare' ? 2 : (loot.rarity === 'uncommon' ? 1 : 0))));
    if (beamTier > 0) {
      const beamH = 28 + beamTier * 14;
      const beamW = 6 + beamTier * 2.5;
      const grad = ctx.createLinearGradient(0, -beamH, 0, 8);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.55, rc);
      grad.addColorStop(1, rc);
      ctx.save();
      ctx.globalAlpha = 0.22 + beamTier * 0.08;
      ctx.fillStyle = grad;
      ctx.fillRect(-beamW / 2, -beamH, beamW, beamH + 8);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(0, Math.round(bob));

    if (isGold) {
      const amt = loot.amount || 10;
      if (amt >= 150) {
        // Overflowing Royal Gold Treasure Pouch + Scattered Coins!
        px(ctx, -9, -8, 18, 15, out);
        px(ctx, -6, -12, 12, 5, out);
        px(ctx, -5, -11, 10, 3, '#b45309');
        px(ctx, -8, -7, 16, 13, '#92400e');
        px(ctx, -7, -6, 14, 10, '#b45309');
        px(ctx, -6, -8, 12, 3, '#fbbf24'); // gold drawstring
        // Gleaming gold coins spilling out
        px(ctx, -11, 1, 7, 6, out); px(ctx, -10, 2, 5, 4, '#fbbf24'); px(ctx, -9, 2, 2, 2, '#fef9c3');
        px(ctx, 5, 0, 7, 6, out); px(ctx, 6, 1, 5, 4, '#f59e0b'); px(ctx, 7, 1, 2, 2, '#fef08a');
        px(ctx, -2, 3, 7, 5, out); px(ctx, -1, 4, 5, 3, '#fde047');
      } else if (amt >= 45) {
        // Stacked Pixel Gold Coins Pile
        px(ctx, -9, -4, 10, 10, out); px(ctx, -8, -3, 8, 8, '#d97706'); px(ctx, -7, -3, 6, 3, '#fde047');
        px(ctx, -1, -7, 10, 12, out); px(ctx, 0, -6, 8, 10, '#f59e0b'); px(ctx, 1, -6, 6, 3, '#fef08a');
        px(ctx, -5, 0, 10, 8, out); px(ctx, -4, 1, 8, 6, '#fbbf24'); px(ctx, -3, 1, 5, 2, '#ffffff');
      } else {
        // Crisp Gleaming Single/Double Gold Coin
        px(ctx, -6, -6, 12, 12, out);
        px(ctx, -5, -5, 10, 10, '#d97706');
        px(ctx, -4, -4, 8, 8, '#fbbf24');
        px(ctx, -3, -3, 3, 5, '#fef08a');
        px(ctx, -2, -2, 2, 2, '#ffffff');
      }
    } else if (loot.item) {
      const it = loot.item;
      if (it.category === 'weapon') {
        // Render ACTUAL miniature floating weapon pixel art!
        ctx.save();
        ctx.rotate(0.55 + Math.sin(animTime * 3 + loot.x) * 0.14);
        ctx.scale(0.68, 0.68);
        drawWeaponShape(ctx, it.weaponType, it.color, it.accent, it.enhance || (it.rarity === 'legendary' ? 10 : (it.rarity === 'epic' ? 5 : 0)));
        ctx.restore();
      } else if (it.category === 'armor') {
        const c = it.color || '#64748b';
        const a = it.accent || '#fbbf24';
        if (it.slot === 'helmet') {
          px(ctx, -7, -8, 14, 14, out); px(ctx, -6, -7, 12, 11, c);
          px(ctx, -4, -9, 8, 3, a); px(ctx, -4, -2, 8, 3, '#0f172a');
          px(ctx, -3, -1, 2, 1, '#ef4444'); px(ctx, 1, -1, 2, 1, '#ef4444');
        } else if (it.slot === 'ring') {
          px(ctx, -6, -5, 12, 12, out); px(ctx, -5, -4, 10, 10, '#fbbf24');
          px(ctx, -3, -2, 6, 6, '#0d1326'); px(ctx, -2, -7, 4, 4, c);
        } else if (it.slot === 'amulet') {
          px(ctx, -5, -9, 10, 3, '#fbbf24'); px(ctx, -6, -5, 12, 11, out);
          px(ctx, -5, -4, 10, 9, c); px(ctx, -2, -2, 4, 5, a);
        } else if (it.slot === 'cloak') {
          px(ctx, -8, -8, 16, 15, out); px(ctx, -7, -7, 14, 13, c);
          px(ctx, -5, -8, 10, 3, a);
        } else if (it.slot === 'offhand') {
          px(ctx, -7, -8, 14, 15, out); px(ctx, -6, -7, 12, 12, c);
          px(ctx, -4, -5, 8, 8, a);
        } else {
          // Chestplate / Boots / Relic
          px(ctx, -8, -8, 16, 15, out); px(ctx, -7, -7, 14, 13, c);
          px(ctx, -9, -7, 4, 6, a); px(ctx, 5, -7, 4, 6, a);
          px(ctx, -3, -4, 6, 6, a);
        }
      } else if (it.category === 'potion') {
        if (it.templateId && it.templateId.startsWith('fish')) {
          px(ctx, -9, -5, 18, 10, out); px(ctx, -7, -4, 12, 8, it.color || '#60a5fa');
          px(ctx, 4, -5, 4, 10, it.color || '#60a5fa'); px(ctx, -5, -2, 2, 2, '#0f172a');
        } else {
          // Corked Glass Potion Vial
          px(ctx, -3, -10, 6, 4, out); px(ctx, -2, -9, 4, 3, '#d97706');
          px(ctx, -4, -6, 8, 2, '#cbd5e1');
          px(ctx, -7, -4, 14, 12, out); px(ctx, -6, -3, 12, 10, it.color || '#ef4444');
          px(ctx, -4, -1, 3, 4, 'rgba(255,255,255,0.75)');
        }
      } else {
        // Resource / Crystal / Upgrade Stone / Dragon Scale / Spice / Pearl
        const tid = it.templateId || '';
        if (tid === 'upgrade_stone' || tid === 'star_crystal' || tid === 'frost_shard') {
          px(ctx, -5, -10, 10, 18, out); px(ctx, -8, -6, 16, 10, out);
          px(ctx, -4, -9, 8, 16, it.color || '#f59e0b');
          px(ctx, -6, -4, 12, 6, it.color || '#f59e0b');
          px(ctx, -2, -6, 4, 6, '#ffffff');
        } else if (tid === 'herb_leaf' || tid === 'swamp_shroom') {
          px(ctx, -7, -7, 14, 13, out);
          px(ctx, -6, -6, 12, 9, it.color || '#22c55e');
          px(ctx, -2, 1, 4, 5, tid === 'swamp_shroom' ? '#cbd5e1' : '#15803d');
          px(ctx, -4, -4, 3, 3, '#ffffff');
        } else if (tid === 'dragon_scale' || tid === 'magma_core') {
          px(ctx, -7, -8, 14, 15, out); px(ctx, -6, -7, 12, 13, it.color || '#ef4444');
          px(ctx, -3, -4, 6, 6, '#fde047'); px(ctx, -1, -2, 2, 2, '#ffffff');
        } else {
          // Sparkling Ore Chunk / Pearl / Spice Sack
          px(ctx, -8, -6, 16, 12, out); px(ctx, -7, -5, 14, 10, '#334155');
          px(ctx, -5, -4, 6, 5, it.color || '#94a3b8'); px(ctx, 1, -2, 5, 5, it.color || '#94a3b8');
          px(ctx, -4, -3, 2, 2, '#ffffff');
        }
      }
    }

    // Animated Glint / Twinkle Sparkles
    const spPhase = (animTime * 4 + loot.x * 0.05) % 2;
    if (spPhase < 0.7 || beamTier >= 2) {
      const sx = Math.cos(animTime * 3.5 + loot.x) * 10;
      const sy = -6 + Math.sin(animTime * 4.2 + loot.y) * 5;
      px(ctx, sx - 1, sy - 3, 2, 6, '#ffffff');
      px(ctx, sx - 3, sy - 1, 6, 2, isGold ? '#fef08a' : rc);
    }

    ctx.restore();

    // Compact Crisp Ground Label Pill when nearby or high rarity
    const nearPlayer = player && Math.hypot(player.x - loot.x, player.y - loot.y) < 220;
    if (nearPlayer || beamTier >= 2) {
      const label = isGold ? ('+' + loot.amount + ' зол.') : (loot.item ? (loot.item.name + (loot.item.qty > 1 ? ' x' + loot.item.qty : '')) : '');
      if (label) {
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        const tw = ctx.measureText(label).width + 8;
        ctx.fillStyle = 'rgba(7, 10, 20, 0.82)';
        ctx.fillRect(-tw / 2, -26 + bob * 0.4, tw, 12);
        ctx.strokeStyle = rc;
        ctx.lineWidth = 1;
        ctx.strokeRect(-tw / 2, -26 + bob * 0.4, tw, 12);
        ctx.fillStyle = rc;
        ctx.fillText(label, 0, -17 + bob * 0.4);
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // UPGRADED HIGH-DETAIL PIXEL-ART HERO RENDERER (Matching Reference Image 1)
  // Full 1px dark outline, 3-tone spiky hair, detailed pauldrons, crimson
  // glowing chest core, layered billowing cape, greaves & arcane foot circle!
  // =========================================================================
  function drawCharacter(ctx, entity, animTime) {
    const facing = (entity.facingX || 1) < 0 ? -1 : 1;
    const isMounted = !!entity.mountedId && entity.state !== 'death';
    const isMoving = entity.state === 'walk' || entity.state === 'run';
    const isRunning = entity.state === 'run';

    ctx.save();
    ctx.translate(Math.round(entity.x), Math.round(entity.y));

    // Glowing Arcane Rune Circle beneath Hero (exact Ref Image 1 purple/crimson glow)
    if (entity.isPlayer || entity.showAura || entity.buffShield > 0 || entity.buffHaste > 0 || entity.state === 'skill') {
      ctx.save();
      const ringCol = entity.buffShield > 0 ? '#fbbf24' : (entity.buffHaste > 0 ? '#d946ef' : '#a855f7');
      const rW = isMounted ? 30 : 21;
      const rH = isMounted ? 11 : 7;
      ctx.fillStyle = 'rgba(139, 92, 246, 0.18)';
      ctx.beginPath(); ctx.ellipse(0, 15, rW, rH, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ringCol;
      ctx.lineWidth = entity.state === 'skill' ? 3 : 1.6;
      ctx.beginPath(); ctx.ellipse(0, 15, rW, rH, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 15, rW * 0.72, rH * 0.72, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // Mount underneath rider
    if (isMounted) {
      drawMount(ctx, entity.mountedId, facing, animTime, isMoving);
      ctx.translate(0, -17);
    } else if (entity.state !== 'death') {
      ctx.fillStyle = 'rgba(0,0,0,0.48)';
      ctx.beginPath();
      ctx.ellipse(0, 15, 14, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (entity.state === 'death') {
      ctx.save();
      ctx.rotate(facing * Math.PI / 2);
      ctx.translate(0, 6);
      drawCharacterBody(ctx, entity, 0, 0, false, false, animTime);
      ctx.restore();
      ctx.restore();
      return;
    }

    const walkFreq = isRunning ? 15 : 10;
    const stride = isMoving && !isMounted ? Math.sin(animTime * walkFreq) * (isRunning ? 5 : 3.2) : 0;
    const bob = isMoving && !isMounted ? Math.abs(Math.sin(animTime * walkFreq)) * 2.2 : Math.sin(animTime * 3.5) * 0.9;

    ctx.save();
    ctx.scale(facing, 1);
    ctx.translate(0, -bob);
    if (isRunning && !isMounted) ctx.rotate(0.10);
    if (entity.hurtTimer > 0) ctx.filter = 'brightness(1.9) saturate(1.5)';

    drawCharacterBody(ctx, entity, stride, bob, isMounted, isRunning, animTime);

    ctx.restore();

    if (entity.state === 'skill') {
      ctx.save();
      ctx.strokeStyle = entity.skillColor || '#ef4444';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, -4, 22 + Math.sin(animTime * 26) * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (!entity.hideNameplate && entity.name) {
      drawNameplate(ctx, entity, isMounted ? -50 : -38);
    }

    ctx.restore();
  }

  function drawCharacterBody(ctx, entity, stride, bob, isMounted, isRunning, animTime) {
    const eq = entity.equipment || {};
    const app = entity.appearance || { hair: '#151829', cloak: '#c81d32', armor: '#1f2438', skin: '#f7d5b0', eye: '#ef4444' };
    const out = '#090b14';
    const cloakCol = (eq.cloak && eq.cloak.color) || app.cloak || '#c81d32';
    const cloakDark = '#6b0f1d';
    const armorCol = (eq.armor && eq.armor.color) || app.armor || '#1f2438';
    const armorHi = '#5b6891';
    const armorAcc = (eq.armor && eq.armor.accent) || '#ef4444';
    const bootsCol = (eq.boots && eq.boots.color) || '#2a334d';

    // 1. MULTI-LAYER BILLOWING CRIMSON CAPE / WINGS (with crisp dark outline)
    const capeSway = Math.sin(animTime * (isRunning ? 14 : 4)) * (isRunning ? 5.5 : 2.2);
    px(ctx, -16 - capeSway * 0.5, -10, 14, 23, out);
    px(ctx, -19 - capeSway, 1, 11, 14, out);
    px(ctx, -15 - capeSway * 0.5, -9, 12, 21, cloakDark);
    px(ctx, -14 - capeSway * 0.4, -8, 10, 18, cloakCol);
    px(ctx, -18 - capeSway, 2, 9, 12, cloakCol);
    px(ctx, -16 - capeSway * 0.8, 4, 3, 8, '#f87171'); // highlight fold
    if (eq.cloak && eq.cloak.templateId === 'cloak_wings') {
      px(ctx, -23 - capeSway * 0.4, -16, 12, 15, out);
      px(ctx, -22 - capeSway * 0.4, -15, 10, 13, '#6d28d9');
      px(ctx, -25 - capeSway * 0.5, -20, 8, 9, '#c084fc');
    }

    // 2. OUTLINED LEGS, ARMORED GREAVES & KNEE GUARDS
    if (!isMounted) {
      // Back leg
      px(ctx, -7 + stride, 2, 7, 13, out);
      px(ctx, -6 + stride, 3, 5, 11, '#111626');
      px(ctx, -6 + stride, 6, 5, 2, armorAcc); // knee trim
      px(ctx, -6 + stride, 9, 6, 5, bootsCol);
      px(ctx, -5 + stride, 10, 2, 3, armorHi);
      // Front leg
      px(ctx, 1 - stride, 2, 7, 13, out);
      px(ctx, 2 - stride, 3, 5, 11, '#182036');
      px(ctx, 2 - stride, 6, 5, 2, armorAcc);
      px(ctx, 2 - stride, 9, 6, 5, bootsCol);
      px(ctx, 3 - stride, 10, 2, 3, armorHi);
    } else {
      px(ctx, -3, 3, 8, 11, out);
      px(ctx, -2, 4, 6, 9, bootsCol);
      px(ctx, -1, 5, 3, 3, armorHi);
    }

    // 3. DETAILED DARK-STEEL ARMORED TORSO, PAULDRONS, BELT & CRIMSON CORE
    px(ctx, -9, -12, 18, 17, out);
    px(ctx, -8, -11, 16, 15, armorCol);
    px(ctx, -6, -10, 12, 11, '#2b3452'); // breastplate sheen
    // Crimson Chest Crest & V-trim (matching Reference Image 1)
    px(ctx, -4, -9, 8, 2, armorAcc);
    px(ctx, -3, -7, 6, 6, '#14192b');
    px(ctx, -2, -6, 4, 4, armorAcc);
    px(ctx, -1, -5, 2, 2, '#fca5a5');
    // Ornate Metallic Belt & Crimson Tassets
    px(ctx, -8, 1, 16, 3, '#111524');
    px(ctx, -2, 1, 4, 3, '#fbbf24');
    px(ctx, -7, 3, 4, 3, armorCol);
    px(ctx, 3, 3, 4, 3, armorCol);

    // Layered Spiked Shoulder Pauldrons (Left & Right)
    px(ctx, -12, -12, 7, 8, out);
    px(ctx, -11, -11, 5, 6, '#2a3350');
    px(ctx, -11, -11, 5, 2, armorHi);
    px(ctx, -10, -8, 3, 2, armorAcc);

    px(ctx, 5, -12, 7, 8, out);
    px(ctx, 6, -11, 5, 6, '#2a3350');
    px(ctx, 6, -11, 5, 2, armorHi);
    px(ctx, 7, -8, 3, 2, armorAcc);

    // Armored Front Gauntlet Arm
    px(ctx, 5, -5, 6, 8, out);
    px(ctx, 6, -4, 4, 6, '#2a3350');
    px(ctx, 6, -1, 4, 2, armorAcc);

    // Flowing Crimson Neck Scarf (signature knight look from Ref Image 1)
    px(ctx, -9, -13, 18, 4, out);
    px(ctx, -8, -12, 16, 3, cloakCol);
    px(ctx, -5, -12, 7, 1, '#f87171');

    // 4. ANIME-PIXEL HEAD, FACE & EXPRESSIVE GLOWING EYES
    px(ctx, -8, -26, 16, 15, out);
    px(ctx, -7, -25, 14, 13, app.skin || '#f7d5b0');
    // Subtle cheek/chin shading
    px(ctx, -7, -14, 14, 2, '#dfb388');
    px(ctx, -7, -25, 2, 11, '#e5bc92');
    // Expressive Fierce Eyes (left & right with dark lash, crimson iris, white highlight)
    px(ctx, -1, -20, 4, 4, '#0f1220');
    px(ctx, 0, -19, 3, 3, app.eye || '#ef4444');
    px(ctx, 0, -19, 1, 1, '#ffffff');
    px(ctx, 4, -20, 3, 4, '#0f1220');
    px(ctx, 4, -19, 2, 3, app.eye || '#ef4444');
    px(ctx, 4, -19, 1, 1, '#ffffff');

    // 5. DETAILED 3-TONE SPIKY DARK HAIR OR KNIGHT HELMET
    if (eq.helmet) {
      px(ctx, -10, -31, 20, 12, out);
      px(ctx, -9, -30, 18, 10, eq.helmet.color || '#334155');
      px(ctx, -7, -32, 14, 4, eq.helmet.accent || '#ef4444');
      px(ctx, -8, -29, 16, 2, armorHi);
      px(ctx, -10, -21, 4, 9, eq.helmet.color || '#334155');
    } else {
      const h = app.hair || '#151829';
      const hHi = '#3b456b';
      // Dark outline silhouette for dramatic anime spikes
      px(ctx, -10, -31, 20, 10, out);
      px(ctx, -12, -27, 5, 10, out);
      px(ctx, -7, -34, 6, 5, out);
      px(ctx, -1, -35, 7, 6, out);
      px(ctx, 5, -32, 6, 7, out);
      // Base spiky hair fill
      px(ctx, -9, -30, 18, 8, h);
      px(ctx, -11, -26, 4, 8, h);
      px(ctx, -6, -33, 4, 5, h);
      px(ctx, 0, -34, 5, 6, h);
      px(ctx, 5, -31, 5, 6, h);
      // Front bangs framing forehead & eyes
      px(ctx, -6, -24, 3, 5, h);
      px(ctx, -1, -24, 3, 4, h);
      px(ctx, 4, -24, 3, 3, h);
      // Cool pixel-art hair highlights
      px(ctx, -5, -30, 3, 2, hHi);
      px(ctx, 1, -31, 3, 2, hHi);
      px(ctx, 5, -28, 2, 2, hHi);
    }

    // 6. OFFHAND SHIELD
    if (eq.offhand) {
      px(ctx, -13, -8, 10, 14, out);
      px(ctx, -12, -7, 8, 12, eq.offhand.color || '#64748b');
      px(ctx, -10, -5, 4, 8, eq.offhand.accent || '#fbbf24');
    }

    // 7. EQUIPPED WEAPON + DRAMATIC MULTI-RING SLASH ANIMATION (Ref Image 1)
    const w = eq.weapon || window.GameData.WEAPON_TYPES[0];
    ctx.save();
    let wx = 9, wy = -1, rot = 0.45;
    if (entity.attackTimer > 0) {
      const prog = 1 - (entity.attackTimer / (entity.attackDuration || 0.28));
      const style = w.style || 'slash';
      if (style === 'stab' || style === 'thrust') {
        wx = 11 + Math.sin(prog * Math.PI) * 15;
        rot = Math.PI / 2;
      } else if (style === 'arrow' || style === 'bolt' || style === 'orb' || style === 'beam' || style === 'arcane_wave') {
        wx = 12; wy = -5; rot = 0.05;
      } else {
        rot = -1.45 + prog * 3.2;
        wx = 10 + Math.sin(prog * Math.PI) * 6;
      }
      if (style !== 'arrow' && style !== 'bolt' && style !== 'orb' && style !== 'beam') {
        ctx.save();
        const r = style === 'heavy_cleave' ? 35 : 27;
        ctx.globalAlpha = Math.max(0, 1 - prog * 0.85);
        ctx.strokeStyle = w.color || '#ef4444';
        ctx.lineWidth = style === 'heavy_cleave' || style === 'scythe_arc' ? 7 : 5;
        ctx.beginPath(); ctx.arc(8, -4, r, -1.35, -1.35 + prog * 2.65); ctx.stroke();
        ctx.strokeStyle = w.accent || '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(8, -4, r - 2, -1.25, -1.25 + prog * 2.45); ctx.stroke();
        ctx.restore();
      }
    }
    ctx.translate(wx, wy);
    ctx.rotate(rot);
    drawWeaponShape(ctx, w.weaponType || w.id, w.color, w.accent, w.enhance || 0);
    ctx.restore();
  }

  function drawNameplate(ctx, entity, yOff) {
    ctx.save();
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';

    const tag = entity.clanTag ? '[' + entity.clanTag + '] ' : '';
    const title = tag + entity.name + ' Ур.' + entity.level;

    // Small pixel gold crown above Player nameplate (matching Ref Image 2!)
    if (entity.isPlayer) {
      px(ctx, -6, yOff - 26, 12, 6, '#090b14');
      px(ctx, -5, -1 + yOff - 24, 2, 4, '#fbbf24');
      px(ctx, -1, -2 + yOff - 24, 2, 5, '#fde047');
      px(ctx, 3, -1 + yOff - 24, 2, 4, '#fbbf24');
      px(ctx, -5, yOff - 22, 10, 2, '#f59e0b');
    }

    ctx.fillStyle = 'rgba(8, 12, 24, 0.78)';
    const tw = ctx.measureText(title).width + 10;
    ctx.fillRect(-tw / 2, yOff - 16, tw, 13);

    ctx.fillStyle = entity.isPlayer ? '#fde047' : (entity.inParty ? '#38bdf8' : (entity.inDuel ? '#ff6b77' : '#e2e8f0'));
    ctx.fillText(title, 0, yOff - 6);

    const bw = 40;
    const pct = Math.max(0, Math.min(1, entity.hp / Math.max(1, entity.maxHp)));
    ctx.fillStyle = '#090d1a';
    ctx.fillRect(-bw / 2 - 1, yOff - 1, bw + 2, 6);
    ctx.fillStyle = entity.isPlayer ? '#22c55e' : (entity.inDuel ? '#ef4444' : '#38bdf8');
    ctx.fillRect(-bw / 2, yOff, bw * pct, 4);
    ctx.restore();
  }

  // =========================================================================
  // MONSTERS & BOSSES PIXEL RENDERER (with crisp outlines)
  // =========================================================================
  function drawMonster(ctx, m, animTime) {
    const facing = (m.facingX || 1) < 0 ? -1 : 1;
    const stride = m.moving ? Math.sin(animTime * 10) * 4 : Math.sin(animTime * 3) * 1;
    const scale = m.isWorldBoss ? 1.85 : (m.isBoss ? 1.48 : 1.0);
    const out = '#090b14';

    ctx.save();
    ctx.translate(Math.round(m.x), Math.round(m.y));

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 14 * scale, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (m.isBoss) {
      ctx.strokeStyle = m.isWorldBoss ? '#ef4444' : '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 14 * scale, 24 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (m.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.scale(facing * scale, scale);
    if (m.hurtTimer > 0) ctx.filter = 'brightness(2)';

    const c = m.color || '#94a3b8';
    const a = m.accent || '#ef4444';

    switch (m.body) {
      case 'wolf':
        px(ctx, -19, -5, 10, 6, out); px(ctx, -18, -4, 8, 4, c);
        px(ctx, -14, -7, 26, 13, out); px(ctx, -13, -6, 24, 11, c);
        px(ctx, -12 + stride, 4, 6, 10, out); px(ctx, -11 + stride, 4, 4, 9, c);
        px(ctx, 5 - stride, 4, 6, 10, out); px(ctx, 6 - stride, 4, 4, 9, c);
        px(ctx, 8, -13, 13, 11, out); px(ctx, 9, -12, 11, 9, c);
        px(ctx, 18, -8, 5, 4, a); px(ctx, 11, -15, 3, 4, a); px(ctx, 16, -9, 2, 2, '#ef4444');
        break;
      case 'goblin':
        px(ctx, -6 + stride, 4, 6, 9, out); px(ctx, -5 + stride, 4, 4, 8, a);
        px(ctx, 0 - stride, 4, 6, 9, out); px(ctx, 1 - stride, 4, 4, 8, a);
        px(ctx, -7, -8, 14, 14, out); px(ctx, -6, -7, 12, 12, a);
        px(ctx, -7, -19, 14, 13, out); px(ctx, -6, -18, 12, 11, c);
        px(ctx, -11, -15, 5, 3, c); px(ctx, 6, -15, 5, 3, c);
        px(ctx, 1, -14, 3, 2, '#ef4444'); px(ctx, 8, -10, 3, 14, '#cbd5e1');
        break;
      case 'orc':
        px(ctx, -9 + stride, 5, 8, 11, out); px(ctx, -8 + stride, 5, 6, 10, '#3f6212');
        px(ctx, 1 - stride, 5, 8, 11, out); px(ctx, 2 - stride, 5, 6, 10, '#3f6212');
        px(ctx, -12, -13, 24, 20, out); px(ctx, -11, -12, 22, 18, c); px(ctx, -10, -10, 20, 6, a);
        px(ctx, -8, -25, 16, 14, out); px(ctx, -7, -24, 14, 12, c);
        px(ctx, 2, -16, 3, 4, '#fff'); px(ctx, 11, -18, 5, 22, '#94a3b8');
        break;
      case 'skeleton':
        px(ctx, -5 + stride, 5, 5, 10, out); px(ctx, -4 + stride, 5, 3, 9, c);
        px(ctx, 1 - stride, 5, 5, 10, out); px(ctx, 2 - stride, 5, 3, 9, c);
        px(ctx, -7, -9, 14, 14, out); px(ctx, -6, -8, 12, 12, '#1e293b');
        px(ctx, -5, -7, 10, 2, c); px(ctx, -5, -3, 10, 2, c);
        px(ctx, -7, -22, 14, 14, out); px(ctx, -6, -21, 12, 12, c);
        px(ctx, -2, -17, 3, 3, a); px(ctx, 3, -17, 3, 3, a); px(ctx, 8, -16, 3, 20, a);
        break;
      case 'zombie':
        px(ctx, -7 + stride, 4, 7, 11, out); px(ctx, -6 + stride, 4, 5, 10, a);
        px(ctx, 0 - stride, 4, 7, 11, out); px(ctx, 1 - stride, 4, 5, 10, a);
        px(ctx, -8, -10, 16, 16, out); px(ctx, -7, -9, 14, 14, a);
        px(ctx, 6, -8, 9, 4, c);
        px(ctx, -7, -22, 14, 14, out); px(ctx, -6, -21, 12, 12, c);
        px(ctx, 2, -17, 3, 3, '#ef4444');
        break;
      case 'demon':
        px(ctx, -19, -19, 14, 16, out); px(ctx, -18, -18, 12, 14, '#7f1d1d');
        px(ctx, -8 + stride, 5, 7, 11, out); px(ctx, -7 + stride, 5, 5, 10, '#450a0a');
        px(ctx, 1 - stride, 5, 7, 11, out); px(ctx, 2 - stride, 5, 5, 10, '#450a0a');
        px(ctx, -10, -12, 20, 19, out); px(ctx, -9, -11, 18, 17, c);
        px(ctx, -8, -24, 16, 14, out); px(ctx, -7, -23, 14, 12, c);
        px(ctx, -9, -29, 4, 7, '#111'); px(ctx, 5, -29, 4, 7, '#111'); px(ctx, 1, -19, 3, 3, a);
        break;
      case 'lich_boss':
      case 'ancient_boss':
        px(ctx, -12, -13, 24, 26, out); px(ctx, -11, -12, 22, 24, c);
        px(ctx, -8, -12, 16, 20, '#0f172a');
        px(ctx, -8, -27, 16, 16, out); px(ctx, -7, -26, 14, 14, a);
        px(ctx, -8, -32, 16, 6, '#fbbf24'); px(ctx, 1, -21, 4, 3, '#fff');
        px(ctx, 12, -26, 4, 34, '#fbbf24'); px(ctx, 10, -31, 8, 8, a);
        break;
      case 'troll':
        px(ctx, -10 + stride, 5, 9, 12, out); px(ctx, -9 + stride, 5, 7, 10, '#365314');
        px(ctx, 2 - stride, 5, 9, 12, out); px(ctx, 3 - stride, 5, 7, 10, '#365314');
        px(ctx, -13, -15, 26, 22, out); px(ctx, -12, -14, 24, 20, c);
        px(ctx, -9, -12, 8, 6, a); px(ctx, 4, -8, 6, 5, a); // glowing swamp fungi
        px(ctx, -8, -26, 16, 14, out); px(ctx, -7, -25, 14, 12, c);
        px(ctx, 1, -20, 4, 3, '#fde047'); px(ctx, 11, -16, 6, 24, '#78350f');
        break;
      case 'pirate':
        px(ctx, -6 + stride, 4, 6, 11, out); px(ctx, -5 + stride, 4, 4, 10, '#1e293b');
        px(ctx, 1 - stride, 4, 6, 11, out); px(ctx, 2 - stride, 4, 4, 10, '#1e293b');
        px(ctx, -8, -11, 16, 16, out); px(ctx, -7, -10, 14, 14, c);
        px(ctx, -7, -2, 14, 3, a);
        px(ctx, -7, -23, 14, 13, out); px(ctx, -6, -22, 12, 11, '#f5cfa0');
        px(ctx, -11, -28, 22, 7, out); px(ctx, -10, -27, 20, 5, '#1e293b'); px(ctx, -3, -26, 6, 3, a);
        px(ctx, 10, -14, 4, 18, '#e2e8f0');
        break;
      case 'golem':
        px(ctx, -11 + stride * 0.5, 6, 9, 12, out); px(ctx, -10 + stride * 0.5, 6, 7, 11, '#312e81');
        px(ctx, 2 - stride * 0.5, 6, 9, 12, out); px(ctx, 3 - stride * 0.5, 6, 7, 11, '#312e81');
        px(ctx, -15, -16, 30, 24, out); px(ctx, -14, -15, 28, 22, c);
        px(ctx, -7, -11, 14, 12, a); px(ctx, -3, -8, 6, 6, '#ffffff');
        px(ctx, -9, -27, 18, 13, out); px(ctx, -8, -26, 16, 11, c);
        px(ctx, -4, -22, 8, 4, a);
        break;
      case 'elemental': {
        const fl = Math.sin(animTime * 11) * 3;
        px(ctx, -13, -15 + fl * 0.4, 26, 25, out);
        px(ctx, -12, -14 + fl * 0.4, 24, 22, c);
        px(ctx, -8, -10 + fl * 0.4, 16, 14, '#f97316');
        px(ctx, -4, -6 + fl * 0.4, 8, 8, a);
        px(ctx, -9, -26 + fl * 0.6, 18, 14, out);
        px(ctx, -8, -25 + fl * 0.6, 16, 12, c);
        px(ctx, -4, -21 + fl * 0.6, 4, 3, '#ffffff'); px(ctx, 2, -21 + fl * 0.6, 4, 3, '#ffffff');
        break;
      }
      case 'kraken_boss': {
        const tent = Math.sin(animTime * 8) * 4;
        for (let t = -2; t <= 2; t++) {
          px(ctx, t * 8 - 3, 2, 6, 14 + (t % 2 ? tent : -tent), out);
          px(ctx, t * 8 - 2, 3, 4, 12 + (t % 2 ? tent : -tent), c);
        }
        px(ctx, -16, -24, 32, 28, out); px(ctx, -14, -22, 28, 24, c);
        px(ctx, -10, -18, 20, 12, a);
        px(ctx, -8, -10, 5, 4, '#fde047'); px(ctx, 3, -10, 5, 4, '#fde047');
        break;
      }
      case 'dragon':
      case 'world_dragon': {
        const flap = Math.sin(animTime * 8) * 7;
        px(ctx, -23, -27 + flap, 24, 18, out); px(ctx, -22, -26 + flap, 22, 16, a);
        px(ctx, -28, -8, 14, 6, c);
        px(ctx, -17, -9, 32, 19, out); px(ctx, -16, -8, 30, 17, c); px(ctx, -12, -1, 20, 7, a);
        px(ctx, -12 + stride, 7, 6, 9, c); px(ctx, 8 - stride, 7, 6, 9, c);
        px(ctx, 11, -20, 12, 16, out); px(ctx, 12, -19, 10, 14, c);
        px(ctx, 14, -26, 18, 13, out); px(ctx, 15, -25, 16, 11, c);
        px(ctx, 17, -30, 4, 6, '#fbbf24'); px(ctx, 25, -21, 4, 3, '#facc15');
        break;
      }
      default:
        px(ctx, -10, -10, 20, 20, c);
    }

    ctx.restore();

    const yOff = -28 * scale;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = m.isBoss ? '#fda4af' : '#e2e8f0';
    ctx.fillText(m.name + ' Ур.' + m.level, 0, yOff - 5);

    const bw = m.isBoss ? 64 : 38;
    const pct = Math.max(0, Math.min(1, m.hp / Math.max(1, m.maxHp)));
    ctx.fillStyle = '#090d1a';
    ctx.fillRect(-bw / 2 - 1, yOff, bw + 2, 6);
    ctx.fillStyle = m.isBoss ? '#f43f5e' : '#ef4444';
    ctx.fillRect(-bw / 2, yOff + 1, bw * pct, 4);

    ctx.restore();
  }

  return {
    drawWeaponShape,
    getItemIcon,
    drawMount,
    drawGroundLoot,
    drawCharacter,
    drawMonster
  };
})();
