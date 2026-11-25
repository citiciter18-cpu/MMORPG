/* ==========================================================================
   BladeRealm — Combat Engine, Monsters AI, Projectiles, Skills VFX & Loot
   ========================================================================== */

window.Combat = (function () {
  const monsters = [];
  const projectiles = [];
  const effects = [];
  const particles = [];
  const floatingTexts = [];
  const groundLoots = [];
  const telegraphs = [];
  let mobIdCounter = 1;
  let screenShake = 0;

  function spawnInitialMonsters() {
    monsters.length = 0;
    window.World.spawnZones.forEach(zone => {
      for (let i = 0; i < zone.count; i++) {
        spawnMonsterInZone(zone);
      }
    });
  }

  function spawnMonsterInZone(zone) {
    const tpl = window.GameData.MONSTER_TYPES[zone.type];
    if (!tpl) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * zone.r;
    const x = Math.max(80, Math.min(window.World.WIDTH - 80, zone.x + Math.cos(angle) * dist));
    const y = Math.max(80, Math.min(window.World.HEIGHT - 80, zone.y + Math.sin(angle) * dist));
    monsters.push({
      id: 'mob_' + (mobIdCounter++),
      typeId: tpl.id,
      zone,
      homeX: zone.x,
      homeY: zone.y,
      x, y,
      facingX: 1,
      name: tpl.name,
      level: tpl.level,
      tier: tpl.tier || 1,
      hp: tpl.hp,
      maxHp: tpl.hp,
      atk: tpl.atk,
      def: tpl.def,
      speed: tpl.speed,
      xp: tpl.xp,
      gold: tpl.gold,
      aggro: tpl.aggro,
      range: tpl.range,
      ranged: !!tpl.ranged,
      projColor: tpl.projColor || '#ef4444',
      isBoss: !!tpl.isBoss,
      isWorldBoss: !!tpl.isWorldBoss,
      bossTier: tpl.bossTier || '',
      body: tpl.body,
      color: tpl.color,
      accent: tpl.accent,
      radius: tpl.radius || 20,
      drops: tpl.drops || [],
      weaponDrops: tpl.weaponDrops || [],
      atkCd: 0.5 + Math.random(),
      bossSkillCd: 4.5,
      hurtTimer: 0,
      burnTimer: 0,
      poisonTimer: 0,
      freezeTimer: 0,
      stunTimer: 0,
      dotTick: 0,
      moving: false,
      targetEntity: null,
      wanderTimer: 1 + Math.random() * 3,
      wanderAngle: Math.random() * Math.PI * 2,
      dead: false,
      respawnTimer: 0
    });
  }

  function addText(x, y, text, color, big) {
    floatingTexts.push({
      x: x + (Math.random() - 0.5) * 18,
      y: y - 16,
      text: String(text),
      color: color || '#ffffff',
      big: !!big,
      life: 1.05,
      maxLife: 1.05
    });
  }

  function addParticles(x, y, color, count, speed) {
    const cap = window.GameState && window.GameState.settings.lowFx ? Math.ceil(count * 0.45) : count;
    for (let i = 0; i < cap; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (speed || 90) * (0.4 + Math.random() * 0.8);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color,
        size: 2.5 + Math.random() * 3,
        life: 0.3 + Math.random() * 0.35
      });
    }
  }

  function triggerShake(amount) {
    screenShake = Math.max(screenShake, amount);
  }

  function calcDamage(attackerStats, targetDef, skillMult, isPvp) {
    const raw = (attackerStats.atk || 15) * (skillMult || 1.0) * (0.9 + Math.random() * 0.22);
    const isCrit = Math.random() * 100 < (attackerStats.crit || 8);
    const pen = Math.min(0.65, attackerStats.armorPen || 0);
    const effDef = (targetDef || 0) * (1 - pen);
    let dmg = Math.max(4, raw - effDef * 0.48);
    if (isCrit) dmg *= (isPvp ? 1.30 : 1.65);
    return { dmg: Math.round(dmg), isCrit };
  }

  // Perform Weapon Basic Attack (Player or Bot)
  function performBasicAttack(attacker, target, stats) {
    const w = (attacker.equipment && attacker.equipment.weapon) || window.GameData.WEAPON_TYPES[0];
    const range = (w.stats && w.stats.range) || w.range || 68;
    const speed = (w.stats && w.stats.speed) || w.speed || 1.0;
    const hasteMult = attacker.buffHaste > 0 ? 1.35 : 1.0;
    const duration = Math.max(0.18, 0.36 / (speed * hasteMult));

    attacker.attackDuration = duration;
    attacker.attackTimer = duration;
    attacker.attackCooldown = Math.max(0.22, 0.72 / (speed * hasteMult));

    let angle = attacker.facingX >= 0 ? 0 : Math.PI;
    if (target) {
      angle = Math.atan2(target.y - attacker.y, target.x - attacker.x);
      attacker.facingX = Math.cos(angle) >= 0 ? 1 : -1;
    }

    const style = w.style || 'slash';
    const isRanged = style === 'arrow' || style === 'bolt' || style === 'orb' || style === 'beam' || style === 'arcane_wave';
    if (attacker.isPlayer && window.GameAudio) window.GameAudio.playSfx('hit');

    if (isRanged) {
      projectiles.push({
        owner: attacker,
        isHostileToPlayer: !attacker.isPlayer && attacker.inDuel,
        x: attacker.x + Math.cos(angle) * 14,
        y: attacker.y - 6 + Math.sin(angle) * 14,
        vx: Math.cos(angle) * (style === 'beam' ? 560 : 420),
        vy: Math.sin(angle) * (style === 'beam' ? 560 : 420),
        radius: style === 'arcane_wave' || style === 'orb' ? 12 : 7,
        color: w.color || '#38bdf8',
        accent: w.accent || '#ffffff',
        style,
        stats,
        effect: w.effect,
        life: Math.min(1.2, (range + 80) / 400),
        pierce: style === 'beam' || w.effect === 'pierce'
      });
      addParticles(attacker.x + Math.cos(angle) * 16, attacker.y - 6, w.accent || '#fff', 4, 55);
    } else {
      // Melee hit cone / cleave
      const hitCandidates = getHostileTargetsFor(attacker);
      const hitRadius = range + 16;
      let hits = 0;
      const maxHits = (style === 'heavy_cleave' || style === 'scythe_arc' || style === 'smash') ? 5 : (style === 'dual_slash' ? 2 : 1);
      for (let i = 0; i < hitCandidates.length; i++) {
        const cand = hitCandidates[i];
        const dist = Math.hypot(cand.x - attacker.x, cand.y - attacker.y);
        if (dist <= hitRadius + (cand.radius || 18)) {
          const toA = Math.atan2(cand.y - attacker.y, cand.x - attacker.x);
          const diff = Math.abs(Math.atan2(Math.sin(toA - angle), Math.cos(toA - angle)));
          if (diff < (maxHits > 1 ? 1.65 : 1.25) || dist < 44) {
            applyHit(attacker, cand, stats, style === 'dual_slash' ? 0.65 : 1.0, w.effect, w.color);
            if (style === 'dual_slash') {
              applyHit(attacker, cand, stats, 0.62, w.effect, w.accent);
            }
            hits++;
            if (hits >= maxHits) break;
          }
        }
      }
      effects.push({
        type: 'melee_arc',
        x: attacker.x,
        y: attacker.y - 4,
        angle,
        radius: Math.min(95, range * 0.85),
        color: w.color || '#ef4444',
        life: 0.2,
        maxLife: 0.2
      });
    }
  }

  // Cast Active Skill
  function castSkill(caster, skillId, target, stats) {
    const sk = window.GameData.SKILL_BY_ID[skillId];
    if (!sk || sk.type !== 'active') return false;
    const rank = (caster.skillRanks && caster.skillRanks[skillId]) || 1;
    if (caster.mp < sk.mp) {
      if (caster.isPlayer && window.UI) window.UI.toast('Недостаточно маны!');
      return false;
    }
    if (caster.skillCooldowns && caster.skillCooldowns[skillId] > 0) return false;

    caster.mp = Math.max(0, caster.mp - sk.mp);
    if (!caster.skillCooldowns) caster.skillCooldowns = {};
    caster.skillCooldowns[skillId] = sk.cd;
    caster.state = 'skill';
    caster.skillTimer = 0.38;
    caster.skillColor = sk.color;
    if (caster.isPlayer && window.GameAudio) window.GameAudio.playSfx('skill');

    const wType = caster.equipment && caster.equipment.weapon && caster.equipment.weapon.weaponType;
    const masteryLv = (caster.isPlayer && wType && window.GameState.mastery && window.GameState.mastery.weapons[wType]?.lv) || 1;
    const skillMult = sk.isWeaponSpell
      ? (sk.mult || 1.7) * (1 + (masteryLv - 1) * 0.045)
      : (sk.mult || 1.5) + (rank - 1) * (sk.multPerLv || 0.24);
    const boostedStats = Object.assign({}, stats, { atk: Math.round(stats.atk * (1 + (stats.skillDmgPct || 0))) });
    const hostiles = getHostileTargetsFor(caster);
    const col = sk.color || '#ef4444';

    if (sk.vfx === 'shield_buff') {
      caster.buffShield = sk.duration || 7;
      const heal = Math.round(caster.maxHp * (0.14 + rank * 0.025));
      caster.hp = Math.min(caster.maxHp, caster.hp + heal);
      addText(caster.x, caster.y - 20, '+' + heal + ' ЩИТ', col, true);
      effects.push({ type: 'ring', x: caster.x, y: caster.y, radius: 75, color: col, life: 0.5, maxLife: 0.5 });
      return true;
    }

    if (sk.vfx === 'haste_buff') {
      caster.buffHaste = sk.duration || 8;
      addText(caster.x, caster.y - 20, sk.name.toUpperCase(), col, true);
      effects.push({ type: 'ring', x: caster.x, y: caster.y, radius: 70, color: col, life: 0.45, maxLife: 0.45 });
      if (caster.isPlayer && window.GameState) window.GameState.recalcStats();
      return true;
    }

    let angle = caster.facingX >= 0 ? 0 : Math.PI;
    if (target) {
      angle = Math.atan2(target.y - caster.y, target.x - caster.x);
      caster.facingX = Math.cos(angle) >= 0 ? 1 : -1;
    }

    if (sk.vfx === 'slash_wave') {
      projectiles.push({
        owner: caster,
        x: caster.x + Math.cos(angle) * 16,
        y: caster.y - 4 + Math.sin(angle) * 16,
        vx: Math.cos(angle) * 440,
        vy: Math.sin(angle) * 440,
        radius: 26,
        color: col,
        accent: '#ffe08a',
        style: 'slash_wave',
        stats: boostedStats,
        mult: skillMult,
        effect: sk.effect || 'bleed',
        life: 0.55,
        pierce: true
      });
    } else if (sk.vfx === 'whirlwind' || sk.vfx === 'vamp_reap') {
      const r = sk.aoe || sk.range || 125;
      effects.push({ type: 'whirlwind', x: caster.x, y: caster.y, radius: r, color: col, life: 0.45, maxLife: 0.45 });
      hostiles.forEach(h => {
        if (Math.hypot(h.x - caster.x, h.y - caster.y) <= r + (h.radius || 18)) {
          applyHit(caster, h, boostedStats, skillMult, sk.vfx === 'vamp_reap' ? 'lifesteal' : (sk.effect || 'knockback'), col);
        }
      });
      if (caster.isPlayer) triggerShake(6);
    } else if (sk.vfx === 'shockwave_slam') {
      const tx = caster.x + Math.cos(angle) * 58;
      const ty = caster.y + Math.sin(angle) * 58;
      const r = sk.aoe || 110;
      effects.push({ type: 'meteor', x: tx, y: ty, radius: r, color: col, life: 0.42, maxLife: 0.42 });
      hostiles.forEach(h => {
        if (Math.hypot(h.x - tx, h.y - ty) <= r + (h.radius || 18)) {
          applyHit(caster, h, boostedStats, skillMult, sk.effect || 'stun', col);
        }
      });
      addParticles(tx, ty, col, 18, 150);
      if (caster.isPlayer) triggerShake(7);
    } else if (sk.vfx === 'meteor' || sk.vfx === 'arrow_rain') {
      const tx = target ? target.x : caster.x + Math.cos(angle) * 150;
      const ty = target ? target.y : caster.y + Math.sin(angle) * 150;
      const r = sk.aoe || 115;
      effects.push({ type: 'meteor', x: tx, y: ty, radius: r, color: col, life: 0.55, maxLife: 0.55 });
      hostiles.forEach(h => {
        if (Math.hypot(h.x - tx, h.y - ty) <= r + (h.radius || 18)) {
          applyHit(caster, h, boostedStats, skillMult, sk.effect || 'burn', col);
        }
      });
      addParticles(tx, ty, col, 22, 160);
      if (caster.isPlayer) triggerShake(8);
    } else if (sk.vfx === 'frost_nova' || sk.vfx === 'holy_nova') {
      const r = sk.aoe || 150;
      effects.push({ type: 'ring', x: caster.x, y: caster.y, radius: r, color: col, life: 0.5, maxLife: 0.5 });
      hostiles.forEach(h => {
        if (Math.hypot(h.x - caster.x, h.y - caster.y) <= r + (h.radius || 18)) {
          applyHit(caster, h, boostedStats, skillMult, sk.effect || (sk.vfx === 'frost_nova' ? 'freeze' : 'burn'), col);
        }
      });
      if (sk.vfx === 'holy_nova') {
        const heal = Math.round(caster.maxHp * 0.16);
        caster.hp = Math.min(caster.maxHp, caster.hp + heal);
        caster.buffShield = Math.max(caster.buffShield || 0, 4.5);
        addText(caster.x, caster.y - 24, '+' + heal + ' СВЕТ', '#fde047', true);
      }
      addParticles(caster.x, caster.y, col, 18, 140);
    } else if (sk.vfx === 'beam_blast') {
      const len = sk.range || 300;
      const ex = caster.x + Math.cos(angle) * len;
      const ey = caster.y + Math.sin(angle) * len;
      effects.push({ type: 'bolt_line', x1: caster.x, y1: caster.y - 8, x2: ex, y2: ey - 8, color: col, life: 0.34, maxLife: 0.34 });
      projectiles.push({
        owner: caster,
        x: caster.x + Math.cos(angle) * 18,
        y: caster.y - 6 + Math.sin(angle) * 18,
        vx: Math.cos(angle) * 680,
        vy: Math.sin(angle) * 680,
        radius: 16,
        color: col,
        accent: '#ffffff',
        style: 'bolt',
        stats: boostedStats,
        mult: skillMult,
        effect: sk.effect || 'pierce',
        life: Math.min(0.6, len / 650),
        pierce: true
      });
      addParticles(caster.x + Math.cos(angle) * 24, caster.y - 6, col, 10, 100);
    } else if (sk.vfx === 'execute_strike') {
      const tg = target || hostiles.find(h => Math.hypot(h.x - caster.x, h.y - caster.y) <= (sk.range || 140));
      if (tg) {
        const lowHpBonus = (tg.hp / Math.max(1, tg.maxHp)) < 0.45 ? 1.45 : 1.0;
        effects.push({ type: 'melee_arc', x: tg.x, y: tg.y, angle, radius: 58, color: col, life: 0.28, maxLife: 0.28 });
        applyHit(caster, tg, Object.assign({}, boostedStats, { crit: Math.min(95, (boostedStats.crit || 10) + 35) }), skillMult * lowHpBonus, sk.effect || 'bleed', col);
        addParticles(tg.x, tg.y, col, 16, 140);
        if (caster.isPlayer) triggerShake(6);
      } else {
        effects.push({ type: 'melee_arc', x: caster.x, y: caster.y, angle, radius: 68, color: col, life: 0.24, maxLife: 0.24 });
      }
    } else if (sk.vfx === 'lightning') {
      const sorted = hostiles
        .filter(h => Math.hypot(h.x - caster.x, h.y - caster.y) <= (sk.range || 280))
        .sort((a, b) => Math.hypot(a.x - caster.x, a.y - caster.y) - Math.hypot(b.x - caster.x, b.y - caster.y))
        .slice(0, 5);
      let prevX = caster.x, prevY = caster.y - 10;
      sorted.forEach(h => {
        effects.push({ type: 'bolt_line', x1: prevX, y1: prevY, x2: h.x, y2: h.y - 10, color: col, life: 0.28, maxLife: 0.28 });
        applyHit(caster, h, boostedStats, skillMult, sk.effect || 'chain', col);
        prevX = h.x; prevY = h.y - 10;
      });
      if (sorted.length === 0) {
        effects.push({ type: 'bolt_line', x1: caster.x, y1: caster.y - 10, x2: caster.x + Math.cos(angle) * 140, y2: caster.y + Math.sin(angle) * 140, color: col, life: 0.25, maxLife: 0.25 });
      }
    } else if (sk.vfx === 'shadow_blink') {
      addParticles(caster.x, caster.y, col, 12, 110);
      if (target) {
        const dx = target.x - caster.x;
        const dy = target.y - caster.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const jump = Math.min(d + 28, sk.range || 220);
        caster.x = Math.max(50, Math.min(window.World.WIDTH - 50, caster.x + (dx / d) * jump));
        caster.y = Math.max(50, Math.min(window.World.HEIGHT - 50, caster.y + (dy / d) * jump));
        applyHit(caster, target, Object.assign({}, boostedStats, { crit: 95 }), skillMult, sk.effect || 'crit_up', col);
      } else {
        caster.x = Math.max(50, Math.min(window.World.WIDTH - 50, caster.x + Math.cos(angle) * 150));
        caster.y = Math.max(50, Math.min(window.World.HEIGHT - 50, caster.y + Math.sin(angle) * 150));
      }
      addParticles(caster.x, caster.y, col, 14, 120);
    } else if (sk.vfx === 'poison_fan' || sk.vfx === 'cone_barrage') {
      for (let k = -2; k <= 2; k++) {
        const a = angle + k * 0.19;
        projectiles.push({
          owner: caster,
          x: caster.x + Math.cos(a) * 14,
          y: caster.y - 4 + Math.sin(a) * 14,
          vx: Math.cos(a) * 430,
          vy: Math.sin(a) * 430,
          radius: 8,
          color: col,
          accent: '#ffffff',
          style: sk.vfx === 'cone_barrage' ? 'arrow' : 'bolt',
          stats: boostedStats,
          mult: skillMult * 0.65,
          effect: sk.effect || 'poison',
          life: 0.65,
          pierce: sk.effect === 'pierce'
        });
      }
    }
    return true;
  }

  function getHostileTargetsFor(attacker) {
    const list = [];
    for (let i = 0; i < monsters.length; i++) {
      if (!monsters[i].dead) list.push(monsters[i]);
    }
    // Include duel opponent or PvP bots
    if (window.Bots && window.GameState) {
      if (attacker.isPlayer) {
        window.Bots.list.forEach(b => {
          if (b.hp > 0 && (b.inDuel || (window.GameState.pvpEnabled && !b.inParty && !window.World.getBiomeAt(b.x, b.y).safe))) {
            list.push(b);
          }
        });
      } else if (attacker.inDuel && window.GameState.player.hp > 0) {
        list.push(window.GameState.player);
      }
    }
    // Include real online players when PvP is enabled in non-safe biomes (never hit party mates)
    if (attacker.isPlayer && window.Multiplayer && window.GameState && window.GameState.pvpEnabled) {
      window.Multiplayer.getRemotePlayers().forEach(rp => {
        if (rp.hp > 0 && !window.Multiplayer.isInMyParty(rp.id) && !window.World.getBiomeAt(rp.x, rp.y).safe) {
          list.push(rp);
        }
      });
    }
    // Include Ranked Arena enemies and World Bounty Outlaws
    if (attacker.isPlayer && window.Activities && window.Activities.getInstanceHostiles) {
      window.Activities.getInstanceHostiles().forEach(h => { if (h && h.hp > 0) list.push(h); });
    }
    if (attacker.isPlayer && window.Progression && window.Progression.OUTLAWS) {
      window.Progression.OUTLAWS.forEach(o => { if (!o.dead && o.hp > 0) list.push(o); });
    }
    return list;
  }

  function applyHit(attacker, target, stats, mult, effect, color, skipChain) {
    if (!target || target.dead || target.hp <= 0) return;
    const ab = window.GameState && window.GameState.adminBot;
    // Admin God Mode: complete invulnerability to damage
    if (target.isPlayer && ab && ab.owned && ab.godMode) {
      addText(target.x, target.y - 20, 'БОГ (0)', '#fbbf24', false);
      return;
    }
    const isPvp = Boolean(
      (attacker.isPlayer || attacker.isBot || attacker.isRemotePlayer) &&
      (target.isPlayer || target.isBot || target.isRemotePlayer)
    );
    const affixes = (attacker.isPlayer && stats && stats.affixes) ? stats.affixes : {};
    let finalMult = mult || 1.0;
    if (affixes.inferno) finalMult *= 1.12;
    if (affixes.executioner && (target.hp / Math.max(1, target.maxHp)) <= 0.35) finalMult *= 1.28;
    // Long Tactical PvP: resilience damage reduction prevents 2-second burst kills
    if (isPvp) finalMult *= 0.28;

    const targetDef = (target.def || 0) * (target.buffShield > 0 ? 1.45 : 1.0);
    let { dmg, isCrit } = calcDamage(stats, targetDef, finalMult, isPvp);
    if (isPvp) {
      const hitCap = Math.max(5, Math.round((target.maxHp || 300) * 0.12));
      dmg = Math.min(dmg, hitCap);
    }
    // Admin One-Hit Kill against monsters and bosses
    if (attacker.isPlayer && target.zone && ab && ab.owned && ab.oneHit) {
      dmg = Math.max(dmg, target.maxHp || 999999);
      isCrit = true;
    }

    target.hp = Math.max(0, target.hp - dmg);
    target.hurtTimer = 0.16;
    if (target.zone) target.targetEntity = attacker;

    // Sync PvP damage to real online player over WebSocket
    if (attacker.isPlayer && target.isRemotePlayer && window.Multiplayer) {
      window.Multiplayer.sendPvpHit(target.id, dmg, isCrit);
    }

    addParticles(target.x, target.y - 6, isCrit ? '#fde047' : (color || '#ef4444'), isCrit ? 10 : 6, isCrit ? 130 : 85);

    // Show floating damage number if near player
    if (attacker.isPlayer || target.isPlayer || (window.GameState && Math.hypot(target.x - window.GameState.player.x, target.y - window.GameState.player.y) < 420)) {
      addText(
        target.x,
        target.y - 18,
        (isCrit ? 'КРИТ ' : '') + dmg,
        target.isPlayer ? '#ff6b77' : (isCrit ? '#fde047' : '#ffffff'),
        isCrit
      );
    }

    if (attacker.isPlayer && isCrit) {
      triggerShake(3.5);
      if (window.GameAudio) window.GameAudio.playSfx('crit');
      if (window.GameAPI) window.GameAPI.vibrate(14);
    }

    // Weapon / Skill / Enchantment Affix Elemental Effects (50% shorter CC in PvP)
    if (effect === 'burn' || affixes.inferno) target.burnTimer = isPvp ? 2.4 : 4.0;
    if (effect === 'poison') target.poisonTimer = isPvp ? 2.8 : 5.0;
    if (effect === 'freeze' || effect === 'slow' || affixes.frostbind) target.freezeTimer = isPvp ? 1.3 : 2.6;
    if (effect === 'stun' && Math.random() < (isPvp ? 0.22 : 0.35)) target.stunTimer = isPvp ? 0.6 : 1.2;

    const vampPct = (effect === 'lifesteal' || effect === 'chaos' ? 0.14 : 0) + (affixes.vampiric ? 0.07 : 0) + (stats.lifestealPct || 0);
    if (vampPct > 0 && attacker.maxHp) {
      const heal = Math.max(3, Math.round(dmg * vampPct * (isPvp ? 0.55 : 1.0)));
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
    }
    if (effect === 'mana_leech') {
      attacker.mp = Math.min(attacker.maxMp, (attacker.mp || 0) + 6);
    }
    if (effect === 'knockback' && !target.isBoss && !target.isRemotePlayer) {
      const a = Math.atan2(target.y - attacker.y, target.x - attacker.x);
      target.x += Math.cos(a) * (isPvp ? 9 : 16);
      target.y += Math.sin(a) * (isPvp ? 9 : 16);
    }
    if (!skipChain && affixes.stormchain && Math.random() < 0.28) {
      const nearby = getHostileTargetsFor(attacker).find(h => h !== target && !h.dead && Math.hypot(h.x - target.x, h.y - target.y) < 165);
      if (nearby) {
        effects.push({ type: 'bolt_line', x1: target.x, y1: target.y - 8, x2: nearby.x, y2: nearby.y - 8, color: '#facc15', life: 0.22, maxLife: 0.22 });
        applyHit(attacker, nearby, stats, 0.45, null, '#facc15', true);
      }
    }

    // Death Handling
    if (target.hp <= 0) {
      if (target.zone) {
        handleMonsterDeath(target, attacker);
      } else if (target.isOutlaw && window.Progression) {
        window.Progression.handleOutlawDefeated(target);
      } else if (target.isArenaFighter) {
        addParticles(target.x, target.y, '#ef4444', 18, 120);
      } else if (target.isBot) {
        handleBotDefeated(target, attacker);
      } else if (target.isPlayer) {
        handlePlayerDefeated(attacker);
      }
    }
  }

  function handleMonsterDeath(m, killer) {
    m.dead = true;
    m.respawnTimer = m.isWorldBoss ? 48 : (m.isBoss ? 30 : 10);
    addParticles(m.x, m.y, m.color || '#ef4444', m.isBoss ? 30 : 14, 150);

    const player = window.GameState.player;
    const killerIsPlayerOrParty = killer && (killer.isPlayer || killer.inParty || killer.isAdminBot);

    if (killerIsPlayerOrParty) {
      const cStats = window.GameState.computedStats || {};
      const goldMult = 1 + (cStats.goldPct || 0) + (window.MMO.getClanBonus('gold'));
      const xpMult = 1 + window.MMO.getClanBonus('xp') + (window.MMO.party.length > 0 ? 0.15 : 0);
      const goldAmt = Math.round((m.gold[0] + Math.random() * (m.gold[1] - m.gold[0])) * goldMult * 1.18);
      const xpAmt = Math.round(m.xp * xpMult);

      window.MMO.grantXp(xpAmt);
      if (player.equipment && player.equipment.weapon && window.MMO.grantWeaponMastery) {
        window.MMO.grantWeaponMastery(player.equipment.weapon.weaponType, m.isBoss ? 36 : 10);
      }
      addText(m.x, m.y - 34, '+' + xpAmt + ' XP', '#fde047', false);

      // Spawn physical loot on ground!
      spawnGroundLoot(m.x, m.y, 'gold', null, goldAmt);

      // Roll resource/catalyst drop (tuned for balanced progression)
      if (m.drops.length > 0 && Math.random() < (m.isBoss ? 1.0 : 0.52)) {
        const dropId = m.drops[Math.floor(Math.random() * m.drops.length)];
        const item = window.GameData.createConsumableItem(dropId, m.isBoss ? 2 : 1);
        spawnGroundLoot(m.x + 18, m.y + 8, 'item', item, 1);
      }

      // Roll Tiered Weapon or Armor drop (scaled to monster tier T1..T8)
      const gearChance = m.isBoss ? 0.90 : 0.24;
      if (Math.random() < gearChance) {
        const luckBonus = (cStats.luck || 0) * 0.45;
        const rarity = window.GameData.rollRarity((m.isBoss ? 32 : (m.tier * 1.2)) + luckBonus);
        const dropTier = Math.max(1, Math.min(8, m.tier || window.GameData.tierFromLevel(m.level)));
        const dropEnch = m.isBoss ? (Math.random() < 0.35 ? 2 : 1) : (Math.random() < 0.08 ? 1 : 0);
        let item;
        if (Math.random() < 0.55 && m.weaponDrops.length > 0) {
          const wId = m.weaponDrops[Math.floor(Math.random() * m.weaponDrops.length)];
          item = window.GameData.createWeaponItem(wId, rarity, m.level, m.isBoss ? 1 : 0, dropTier, dropEnch);
        } else {
          const tpl = window.GameData.ARMOR_TEMPLATES[Math.floor(Math.random() * window.GameData.ARMOR_TEMPLATES.length)];
          item = window.GameData.createArmorItem(tpl.id, rarity, m.level, m.isBoss ? 1 : 0, dropTier, dropEnch);
        }
        spawnGroundLoot(m.x - 18, m.y + 10, 'item', item, 1);
      }

      // Share XP and gold with real online party members
      if (window.Multiplayer && window.Multiplayer.realParty && window.Multiplayer.realParty.id) {
        window.Multiplayer.sharePartyKill(xpAmt, goldAmt, m.name, m.x, m.y);
      }

      window.MMO.onMonsterKilled(m);
    } else if (killer && killer.isBot) {
      killer.xp = (killer.xp || 0) + m.xp;
      killer.gold += Math.round(m.gold[0]);
      if (m.isWorldBoss) {
        window.MMO.addChat('system', 'Система', killer.name + ' добил мирового босса ' + m.name + '!');
      }
    }
  }

  function restoreDuelHp(player, bot) {
    if (player && player.duelBaseMaxHp) {
      const ratio = Math.min(1, Math.max(0.5, player.hp / Math.max(1, player.maxHp)));
      player.maxHp = player.duelBaseMaxHp;
      player.duelBaseMaxHp = 0;
      player.hp = Math.round(player.maxHp * ratio);
    }
    if (bot && bot.duelBaseMaxHp) {
      bot.maxHp = bot.duelBaseMaxHp;
      bot.duelBaseMaxHp = 0;
      bot.hp = bot.maxHp;
      bot.duelPots = 0;
    }
    window.GameState.duelStartTime = 0;
    if (window.GameState.recalcStats) window.GameState.recalcStats();
  }

  function handleBotDefeated(bot, killer) {
    if (bot.inDuel && killer && killer.isPlayer) {
      bot.inDuel = false;
      window.GameState.activeDuelBotId = null;
      restoreDuelHp(window.GameState.player, bot);
      const prize = 140 + bot.level * 28;
      window.GameState.player.gold += prize;
      window.GameState.player.pvpRating = (window.GameState.player.pvpRating || 1000) + 25;
      window.GameState.stats.duelsWon = (window.GameState.stats.duelsWon || 0) + 1;
      window.MMO.onProgressEvent('duel_win', 1);
      window.MMO.addChat('world', bot.name, 'Отличный затяжной бой, ' + window.GameState.player.name + '! Ты силён!');
      window.UI.toast('Победа в дуэли! +' + prize + ' золота, +25 PvP рейтинга');
    } else if (killer && killer.isPlayer) {
      bot.hp = bot.maxHp;
      bot.x = 3950 + (Math.random() - 0.5) * 180;
      bot.y = 3000 + (Math.random() - 0.5) * 180;
      window.GameState.player.pvpRating = (window.GameState.player.pvpRating || 1000) + 15;
      window.UI.toast('Победа в PvP над ' + bot.name + '! +15 рейтинга');
    } else {
      bot.hp = bot.maxHp;
    }
  }

  function applyDeathPenalty(killerName, killerNetId) {
    const p = window.GameState.player;
    if (!p || p.state === 'death') return;

    // 1) Collect ALL equipped gear & ALL inventory items
    const droppedItems = [];
    if (p.equipment) {
      Object.keys(p.equipment).forEach(slot => {
        if (p.equipment[slot]) {
          droppedItems.push(p.equipment[slot]);
          p.equipment[slot] = null;
        }
      });
    }
    const bag = window.GameState.inventory || [];
    while (bag.length > 0) {
      droppedItems.push(bag.pop());
    }

    // 2) Lose 20% of coins on hand (keep 80% on hand + 100% of Bank coins safe!)
    const handBefore = Math.max(0, Math.floor(p.gold || 0));
    const lostGold = Math.floor(handBefore * 0.20);
    p.gold = Math.max(0, handBefore - lostGold);
    const bankSafe = Math.max(0, Math.floor(window.GameState.bankBalance || 0));

    p.hp = 0;
    p.state = 'death';
    p.autoCombat = false;
    p.mountedId = null;
    if (window.GameState.recalcStats) window.GameState.recalcStats();

    // 3) Transfer PvP loot to real killer or spawn ground loot for PvE
    if (killerNetId && window.Multiplayer) {
      window.Multiplayer.sendPvpKillLoot(killerNetId, p.name, lostGold, droppedItems, p.x, p.y);
    } else {
      if (lostGold > 0) spawnGroundLoot(p.x, p.y, 'gold', null, lostGold);
      droppedItems.slice(0, 6).forEach((it, idx) => {
        const ang = (idx / Math.max(1, Math.min(6, droppedItems.length))) * Math.PI * 2;
        spawnGroundLoot(p.x + Math.cos(ang) * 22, p.y + Math.sin(ang) * 18, 'item', it, it.qty || 1);
      });
    }

    if (window.MMO) {
      window.MMO.saveProgress();
      window.MMO.addChat('system', 'Смерть', 'Вы погибли от ' + (killerName || 'врага') + ': потеряно ' + droppedItems.length + ' предм. и ' + lostGold + ' монет (20%). В Банке сохранено: ' + bankSafe.toLocaleString() + ' монет.');
    }

    const reasonEl = document.getElementById('deathReason');
    if (reasonEl) {
      reasonEl.textContent = (killerName || 'Враг') + ' одолел вас! Потеряно всё снаряжение и вещи (' + droppedItems.length + ' шт.) и 20% монет с рук (-' + lostGold.toLocaleString() + '). Сохранено на руках: ' + p.gold.toLocaleString() + ', в Банке монет: ' + bankSafe.toLocaleString() + '.';
    }
    const ov = document.getElementById('deathOverlay');
    if (ov) ov.classList.remove('hidden');
    if (window.GameAudio) window.GameAudio.playSfx('death');
  }

  function handlePlayerDefeated(killer) {
    const p = window.GameState.player;
    // Safe death inside Raid Dungeons & Ranked Arena (0% item/gold loss!)
    if (window.Activities && window.Activities.isInDungeon && window.Activities.isInDungeon()) {
      window.Activities.exitDungeon(false);
      return;
    }
    if (window.Activities && window.Activities.isInArena && window.Activities.isInArena()) {
      window.Activities.finishArenaMatch(false);
      return;
    }
    if (window.GameState.activeDuelBotId) {
      const bot = window.Bots.byId(window.GameState.activeDuelBotId);
      if (bot) {
        bot.inDuel = false;
        window.MMO.addChat('world', bot.name, 'Отличная дуэль! Тренируйся и бери реванш.');
      }
      window.GameState.activeDuelBotId = null;
      restoreDuelHp(p, bot);
      p.hp = Math.round(p.maxHp * 0.55);
      p.state = 'idle';
      window.UI.toast('Дуэль завершена — поражение. Вы восстановлены до 55% HP.');
      return;
    }
    applyDeathPenalty(killer ? killer.name : 'Враг', killer && killer.isRemotePlayer ? killer.id : null);
  }

  function spawnGroundLoot(x, y, kind, item, amount) {
    groundLoots.push({
      id: 'loot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 16,
      kind,
      item,
      amount: amount || 1,
      rarity: item ? item.rarity : 'common',
      life: 45
    });
  }

  function pickupLoot(loot) {
    if (loot.kind === 'gold') {
      window.GameState.player.gold += loot.amount;
      addText(loot.x, loot.y - 10, '+' + loot.amount + ' зол.', '#fbbf24', false);
      if (window.GameAudio) window.GameAudio.playSfx('coin');
      return true;
    }
    if (loot.item) {
      const ok = window.MMO.addItemToBag(loot.item);
      if (ok) {
        const rc = window.GameData.RARITIES[loot.item.rarity]?.color || '#fff';
        addText(loot.x, loot.y - 12, '+' + loot.item.name, rc, loot.item.rarity === 'epic' || loot.item.rarity === 'legendary');
        if (window.GameAudio) window.GameAudio.playSfx('loot');
        return true;
      } else {
        window.UI.toast('Инвентарь переполнен! Сложите вещи на Склад или продайте.');
        return false;
      }
    }
    return true;
  }

  function lootNearby(radius) {
    const p = window.GameState.player;
    let count = 0;
    for (let i = groundLoots.length - 1; i >= 0; i--) {
      const l = groundLoots[i];
      if (Math.hypot(l.x - p.x, l.y - p.y) <= (radius || 145)) {
        if (pickupLoot(l)) {
          groundLoots.splice(i, 1);
          count++;
        }
      }
    }
    return count;
  }

  function update(dt) {
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt * 24);
    const p = window.GameState.player;

    // Update Monsters
    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (m.dead) {
        m.respawnTimer -= dt;
        if (m.respawnTimer <= 0) {
          m.dead = false;
          m.hp = m.maxHp;
          m.x = m.homeX + (Math.random() - 0.5) * m.zone.r;
          m.y = m.homeY + (Math.random() - 0.5) * m.zone.r;
          m.targetEntity = null;
          if (m.isWorldBoss) {
            window.MMO.addChat('system', 'Система', 'Мировой Босс «' + m.name + '» пробудился в Бездне!');
            window.UI.toast('Мировой Босс появился в Подземелье!');
          }
        }
        continue;
      }

      if (m.hurtTimer > 0) m.hurtTimer -= dt;
      if (m.freezeTimer > 0) m.freezeTimer -= dt;
      if (m.stunTimer > 0) { m.stunTimer -= dt; continue; }

      // DoTs (Burn / Poison)
      if (m.burnTimer > 0 || m.poisonTimer > 0) {
        m.dotTick += dt;
        if (m.burnTimer > 0) m.burnTimer -= dt;
        if (m.poisonTimer > 0) m.poisonTimer -= dt;
        if (m.dotTick >= 0.9) {
          m.dotTick = 0;
          const dotDmg = Math.max(6, Math.round(m.maxHp * 0.025));
          m.hp = Math.max(1, m.hp - dotDmg);
          addText(m.x, m.y - 20, dotDmg, m.burnTimer > 0 ? '#fb923c' : '#4ade80', false);
        }
      }

      // Target acquisition / Leash
      const homeDist = Math.hypot(m.x - m.homeX, m.y - m.homeY);
      if (homeDist > 520) {
        m.targetEntity = null;
      } else if (!m.targetEntity || m.targetEntity.hp <= 0 || m.targetEntity.state === 'death') {
        m.targetEntity = null;
        if (p.hp > 0 && p.state !== 'death' && !window.World.getBiomeAt(p.x, p.y).safe) {
          if (Math.hypot(p.x - m.x, p.y - m.y) < m.aggro) m.targetEntity = p;
        }
      }

      const spd = m.speed * (m.freezeTimer > 0 ? 0.45 : 1.0);
      if (m.targetEntity) {
        const dx = m.targetEntity.x - m.x;
        const dy = m.targetEntity.y - m.y;
        const dist = Math.hypot(dx, dy);
        m.facingX = dx >= 0 ? 1 : -1;
        if (dist > m.range) {
          m.x += (dx / dist) * spd * dt;
          m.y += (dy / dist) * spd * dt;
          m.moving = true;
        } else {
          m.moving = false;
          m.atkCd -= dt;
          if (m.atkCd <= 0) {
            m.atkCd = m.isBoss ? 1.25 : 1.5;
            if (m.ranged) {
              const a = Math.atan2(dy, dx);
              projectiles.push({
                owner: m,
                isMonsterProj: true,
                x: m.x, y: m.y - 6,
                vx: Math.cos(a) * 280, vy: Math.sin(a) * 280,
                radius: m.isBoss ? 11 : 7,
                color: m.projColor, accent: '#fef08a',
                style: 'orb',
                stats: { atk: m.atk, crit: 8 },
                life: 1.4
              });
            } else {
              applyHit(m, m.targetEntity, { atk: m.atk, crit: 8 }, 1.0, null, m.accent);
            }
          }
        }

        // Boss AoE Telegraph Slam!
        if (m.isBoss) {
          m.bossSkillCd -= dt;
          if (m.bossSkillCd <= 0) {
            m.bossSkillCd = 5.5;
            telegraphs.push({
              owner: m,
              x: m.targetEntity.x,
              y: m.targetEntity.y,
              radius: m.isWorldBoss ? 92 : 70,
              timer: 1.35,
              maxTimer: 1.35,
              dmg: Math.round(m.atk * 1.9),
              color: m.isWorldBoss ? '#ef4444' : '#c084fc'
            });
          }
        }
      } else {
        // Gentle idle wander near home
        m.wanderTimer -= dt;
        if (m.wanderTimer <= 0) {
          m.wanderTimer = 2.5 + Math.random() * 3.5;
          m.wanderAngle = Math.random() * Math.PI * 2;
          m.moving = Math.random() < 0.55;
        }
        if (m.moving) {
          if (homeDist > m.zone.r * 0.85) {
            m.wanderAngle = Math.atan2(m.homeY - m.y, m.homeX - m.x);
          }
          m.x += Math.cos(m.wanderAngle) * spd * 0.4 * dt;
          m.y += Math.sin(m.wanderAngle) * spd * 0.4 * dt;
          m.facingX = Math.cos(m.wanderAngle) >= 0 ? 1 : -1;
        }
      }
    }

    // Update Telegraphs
    for (let i = telegraphs.length - 1; i >= 0; i--) {
      const t = telegraphs[i];
      t.timer -= dt;
      if (t.timer <= 0) {
        addParticles(t.x, t.y, t.color, 20, 150);
        effects.push({ type: 'ring', x: t.x, y: t.y, radius: t.radius, color: t.color, life: 0.35, maxLife: 0.35 });
        if (p.hp > 0 && p.state !== 'death' && Math.hypot(p.x - t.x, p.y - t.y) <= t.radius) {
          applyHit(t.owner, p, { atk: t.dmg, crit: 12 }, 1.0, 'burn', t.color);
          triggerShake(7);
        }
        telegraphs.splice(i, 1);
      }
    }

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
      if (pr.life <= 0) { projectiles.splice(i, 1); continue; }

      if (pr.isMonsterProj) {
        if (p.hp > 0 && p.state !== 'death' && Math.hypot(p.x - pr.x, p.y - pr.y) < pr.radius + 16) {
          applyHit(pr.owner, p, pr.stats, 1.0, null, pr.color);
          projectiles.splice(i, 1);
          continue;
        }
      } else {
        const targets = getHostileTargetsFor(pr.owner);
        let hitSomething = false;
        for (let k = 0; k < targets.length; k++) {
          const tg = targets[k];
          if (pr.hitIds && pr.hitIds.has(tg.id)) continue;
          if (Math.hypot(tg.x - pr.x, tg.y - pr.y) <= pr.radius + (tg.radius || 18)) {
            applyHit(pr.owner, tg, pr.stats, pr.mult || 1.0, pr.effect, pr.color);
            if (pr.pierce) {
              if (!pr.hitIds) pr.hitIds = new Set();
              pr.hitIds.add(tg.id);
            } else {
              hitSomething = true;
              break;
            }
          }
        }
        if (hitSomething) projectiles.splice(i, 1);
      }
    }

    // Update Visual Effects, Particles, Floating Texts, Ground Loots
    for (let i = effects.length - 1; i >= 0; i--) {
      effects[i].life -= dt;
      if (effects[i].life <= 0) effects.splice(i, 1);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.92;
      pt.vy *= 0.92;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 34 * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
    for (let i = groundLoots.length - 1; i >= 0; i--) {
      const l = groundLoots[i];
      l.life -= dt;
      if (l.life <= 0) { groundLoots.splice(i, 1); continue; }
      if (window.GameState.settings.autoLoot && p.hp > 0 && Math.hypot(l.x - p.x, l.y - p.y) < 62) {
        if (pickupLoot(l)) groundLoots.splice(i, 1);
      }
    }
  }

  function drawWorldCombat(ctx, camX, camY, viewW, viewH, animTime) {
    // Telegraph warning rings
    telegraphs.forEach(t => {
      const prog = 1 - (t.timer / t.maxTimer);
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath(); ctx.arc(t.x, t.y, t.radius * prog, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // Ground Loot Drops — High-Detail Pixel Coins, Weapons, Armor, Flasks & Gems
    const pl = window.GameState ? window.GameState.player : null;
    for (let i = 0; i < groundLoots.length; i++) {
      const l = groundLoots[i];
      if (l.x < camX - 60 || l.x > camX + viewW + 60 || l.y < camY - 60 || l.y > camY + viewH + 60) continue;
      window.Sprites.drawGroundLoot(ctx, l, animTime, pl);
    }

    // Monsters
    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (m.dead) continue;
      if (m.x < camX - 90 || m.x > camX + viewW + 90 || m.y < camY - 90 || m.y > camY + viewH + 90) continue;
      window.Sprites.drawMonster(ctx, m, animTime);
    }

    // Projectiles
    projectiles.forEach(pr => {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      const a = Math.atan2(pr.vy, pr.vx);
      ctx.rotate(a);
      if (pr.style === 'slash_wave') {
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(-8, 0, pr.radius, -0.9, 0.9); ctx.stroke();
        ctx.strokeStyle = pr.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(-5, 0, pr.radius * 0.85, -0.7, 0.7); ctx.stroke();
      } else if (pr.style === 'arrow' || pr.style === 'bolt') {
        ctx.fillStyle = pr.color; ctx.fillRect(-10, -2, 20, 4);
        ctx.fillStyle = pr.accent; ctx.fillRect(6, -3, 6, 6);
      } else {
        ctx.fillStyle = pr.color;
        ctx.beginPath(); ctx.arc(0, 0, pr.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pr.accent;
        ctx.beginPath(); ctx.arc(0, 0, pr.radius * 0.45, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });

    // Effects
    effects.forEach(ef => {
      const a = Math.max(0, ef.life / ef.maxLife);
      ctx.save();
      ctx.globalAlpha = a;
      if (ef.type === 'ring' || ef.type === 'whirlwind' || ef.type === 'meteor') {
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = ef.type === 'meteor' ? 8 : 4;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, ef.radius * (1.15 - a * 0.35), 0, Math.PI * 2);
        ctx.stroke();
        if (ef.type === 'meteor') {
          ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
          ctx.fill();
        }
      } else if (ef.type === 'melee_arc') {
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, ef.radius, ef.angle - 0.85, ef.angle + 0.85);
        ctx.stroke();
      } else if (ef.type === 'bolt_line') {
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(ef.x1, ef.y1);
        ctx.lineTo((ef.x1 + ef.x2) / 2 + (Math.random() - 0.5) * 18, (ef.y1 + ef.y2) / 2 + (Math.random() - 0.5) * 18);
        ctx.lineTo(ef.x2, ef.y2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Particles
    particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    });

    // Floating Combat Texts
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life / ft.maxLife * 1.3);
      ctx.font = ft.big ? '900 16px sans-serif' : '800 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  return {
    monsters,
    groundLoots,
    get shake() { return screenShake; },
    spawnInitialMonsters,
    performBasicAttack,
    castSkill,
    applyHit,
    applyDeathPenalty,
    spawnGroundLoot,
    lootNearby,
    addText,
    addParticles,
    update,
    drawWorldCombat
  };
})();
