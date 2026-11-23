// Arena map definitions, AABB physics collision, and raycasting for Vortex Arena
window.ArenaMaps = (function () {
  function box(cx, cy, cz, sx, sy, sz, mat, solid = true, color = [1, 1, 1], emissive = 0.0, uvScale = [1, 1]) {
    return {
      cx, cy, cz, sx, sy, sz,
      minX: cx - sx / 2, maxX: cx + sx / 2,
      minY: cy - sy / 2, maxY: cy + sy / 2,
      minZ: cz - sz / 2, maxZ: cz + sz / 2,
      mat, solid, color, emissive, uvScale
    };
  }

  function addPerimeter(list, half, wallH, accentColor) {
    // Ground floor
    list.push(box(0, -0.5, 0, half * 2, 1.0, half * 2, 'floor', true, [0.95, 0.98, 1.0], 0.0, [half * 0.5, half * 0.5]));
    // 4 outer walls
    list.push(box(0, wallH / 2, -half - 0.5, half * 2 + 2, wallH, 1.0, 'wall', true, [0.85, 0.9, 1.0], 0.0, [half * 0.4, 2.0]));
    list.push(box(0, wallH / 2, half + 0.5, half * 2 + 2, wallH, 1.0, 'wall', true, [0.85, 0.9, 1.0], 0.0, [half * 0.4, 2.0]));
    list.push(box(-half - 0.5, wallH / 2, 0, 1.0, wallH, half * 2 + 2, 'wall', true, [0.85, 0.9, 1.0], 0.0, [half * 0.4, 2.0]));
    list.push(box(half + 0.5, wallH / 2, 0, 1.0, wallH, half * 2 + 2, 'wall', true, [0.85, 0.9, 1.0], 0.0, [half * 0.4, 2.0]));
    // Neon perimeter trim strips
    list.push(box(0, wallH - 0.5, -half + 0.06, half * 2, 0.24, 0.12, 'solid', false, accentColor, 1.0));
    list.push(box(0, wallH - 0.5, half - 0.06, half * 2, 0.24, 0.12, 'solid', false, accentColor, 1.0));
    list.push(box(-half + 0.06, wallH - 0.5, 0, 0.12, 0.24, half * 2, 'solid', false, accentColor, 1.0));
    list.push(box(half - 0.06, wallH - 0.5, 0, 0.12, 0.24, half * 2, 'solid', false, accentColor, 1.0));
  }

  function addStairs(list, x, z, dirX, dirZ, width, steps, totalH, totalLen) {
    const stepH = totalH / steps;
    const stepL = totalLen / steps;
    for (let i = 0; i < steps; i++) {
      const h = (i + 1) * stepH;
      const dist = (i + 0.5) * stepL;
      const sx = dirX !== 0 ? stepL : width;
      const sz = dirZ !== 0 ? stepL : width;
      list.push(box(x + dirX * dist, h / 2, z + dirZ * dist, sx, h, sz, 'wall', true, [0.75, 0.82, 0.92], 0.0, [1, 1]));
    }
  }

  function buildFoundry() {
    const half = 28;
    const boxes = [];
    addPerimeter(boxes, half, 9.5, [1.0, 0.24, 0.38]);

    // Central Plasma Core Platform (elevated y = 3.2)
    boxes.push(box(0, 1.6, 0, 7.2, 3.2, 7.2, 'wall', true, [0.75, 0.82, 0.94], 0.0, [2, 1]));
    // Glowing central plasma reactor column (solid cover in middle of upper deck)
    boxes.push(box(0, 5.4, 0, 2.2, 4.4, 2.2, 'bridge', true, [0.1, 0.95, 1.0], 0.85, [1, 2]));
    boxes.push(box(0, 7.8, 0, 3.4, 0.5, 3.4, 'wall', true, [0.6, 0.7, 0.82], 0.0));
    // Core neon ring trims
    boxes.push(box(0, 3.26, 0, 7.4, 0.16, 7.4, 'solid', false, [0.0, 0.9, 1.0], 0.95));

    // 4 Glowing Energy Bridges extending from central hub
    boxes.push(box(0, 3.05, -10.5, 3.2, 0.3, 14.0, 'bridge', true, [0.05, 0.92, 1.0], 0.45, [1, 4]));
    boxes.push(box(0, 3.05, 10.5, 3.2, 0.3, 14.0, 'bridge', true, [0.05, 0.92, 1.0], 0.45, [1, 4]));
    boxes.push(box(-10.5, 3.05, 0, 14.0, 0.3, 3.2, 'bridge', true, [0.05, 0.92, 1.0], 0.45, [4, 1]));
    boxes.push(box(10.5, 3.05, 0, 14.0, 0.3, 3.2, 'bridge', true, [0.05, 0.92, 1.0], 0.45, [4, 1]));

    // 4 Perimeter elevated catwalk balconies + ramps
    const balconies = [
      [0, -21, 14, 7],
      [0, 21, 14, 7],
      [-21, 0, 7, 14],
      [21, 0, 7, 14]
    ];
    balconies.forEach(([bx, bz, sx, sz]) => {
      boxes.push(box(bx, 1.6, bz, sx, 3.2, sz, 'wall', true, [0.7, 0.78, 0.9], 0.0, [3, 1]));
      boxes.push(box(bx, 3.26, bz, sx + 0.1, 0.12, sz + 0.1, 'solid', false, [1.0, 0.25, 0.4], 0.85));
    });

    // Stairs up to North & South balconies
    addStairs(boxes, -7, -21, -1, 0, 3.6, 8, 3.2, 6.4);
    addStairs(boxes, 7, 21, 1, 0, 3.6, 8, 3.2, 6.4);
    addStairs(boxes, -21, 7, 0, 1, 3.6, 8, 3.2, 6.4);
    addStairs(boxes, 21, -7, 0, -1, 3.6, 8, 3.2, 6.4);

    // Tactical cover crates & pillars in the 4 quadrants
    const quadSigns = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    quadSigns.forEach(([qx, qz]) => {
      // Tall structural pillar
      boxes.push(box(qx * 13, 4.5, qz * 13, 2.4, 9.0, 2.4, 'wall', true, [0.68, 0.76, 0.88], 0.0, [1, 3]));
      boxes.push(box(qx * 13, 4.5, qz * 13, 2.52, 0.22, 2.52, 'solid', false, [0.0, 0.9, 1.0], 0.9));
      // Modular cover crates
      boxes.push(box(qx * 9.5, 1.1, qz * 6.5, 2.4, 2.2, 2.4, 'crate', true, [1, 1, 1], 0.0));
      boxes.push(box(qx * 6.5, 0.9, qz * 11.5, 3.2, 1.8, 1.8, 'crate', true, [1, 1, 1], 0.0));
      boxes.push(box(qx * 18.5, 1.0, qz * 16.5, 2.8, 2.0, 2.8, 'crate', true, [1, 1, 1], 0.0));
      // Low crouch barrier on balconies
      boxes.push(box(qx * 4.5, 3.8, qz * 18.2, 2.4, 1.1, 0.5, 'crate', true, [0.95, 0.95, 1.0], 0.0));
    });

    // Jump pads in quadrants launching onto upper decks
    const jumpPads = [
      { x: -12, y: 0.08, z: -7.5, boost: 13.8 },
      { x: 12, y: 0.08, z: 7.5, boost: 13.8 },
      { x: -7.5, y: 0.08, z: 12, boost: 13.8 },
      { x: 7.5, y: 0.08, z: -12, boost: 13.8 }
    ];

    const pickups = [
      { id: 'hp1', type: 'health', x: -16, y: 0.9, z: -10, active: true, respawnAt: 0 },
      { id: 'hp2', type: 'health', x: 16, y: 0.9, z: 10, active: true, respawnAt: 0 },
      { id: 'hp3', type: 'health', x: 0, y: 4.1, z: -21, active: true, respawnAt: 0 },
      { id: 'hp4', type: 'health', x: 0, y: 4.1, z: 21, active: true, respawnAt: 0 },
      { id: 'am1', type: 'ammo', x: -21, y: 4.1, z: 0, active: true, respawnAt: 0 },
      { id: 'am2', type: 'ammo', x: 21, y: 4.1, z: 0, active: true, respawnAt: 0 },
      { id: 'am3', type: 'ammo', x: 10, y: 0.9, z: -16, active: true, respawnAt: 0 },
      { id: 'am4', type: 'ammo', x: -10, y: 0.9, z: 16, active: true, respawnAt: 0 }
    ];

    const spawns = [
      { x: -22, y: 0.1, z: -22, yaw: -Math.PI * 0.75 },
      { x: 22, y: 0.1, z: 22, yaw: Math.PI * 0.25 },
      { x: 22, y: 0.1, z: -22, yaw: Math.PI * 0.75 },
      { x: -22, y: 0.1, z: 22, yaw: -Math.PI * 0.25 },
      { x: 0, y: 3.3, z: -22, yaw: Math.PI },
      { x: 0, y: 3.3, z: 22, yaw: 0 },
      { x: -22, y: 3.3, z: 0, yaw: -Math.PI * 0.5 },
      { x: 22, y: 3.3, z: 0, yaw: Math.PI * 0.5 }
    ];

    const dronePaths = [
      { ax: -11, az: -16, bx: 11, bz: -16, y: 2.3, speed: 0.45 },
      { ax: -11, az: 16, bx: 11, bz: 16, y: 2.3, speed: 0.52 },
      { ax: -16, az: -10, bx: -16, bz: 10, y: 4.8, speed: 0.4 },
      { ax: 16, az: -10, bx: 16, bz: 10, y: 4.8, speed: 0.48 },
      { ax: -8, az: -8, bx: 8, bz: 8, y: 5.2, speed: 0.35 }
    ];

    return {
      id: 'foundry',
      name: 'Сектор-07',
      halfSize: half,
      skyColor: [0.035, 0.055, 0.105],
      fogColor: [0.045, 0.07, 0.13],
      fogDensity: 0.014,
      boxes,
      jumpPads,
      pickups,
      spawns,
      dronePaths
    };
  }

  function buildCourtyard() {
    const half = 24;
    const boxes = [];
    addPerimeter(boxes, half, 8.0, [0.0, 0.9, 1.0]);

    // Central cross monolith with glowing slits
    boxes.push(box(0, 2.4, 0, 2.8, 4.8, 2.8, 'wall', true, [0.72, 0.8, 0.95], 0.0, [1, 2]));
    boxes.push(box(0, 4.86, 0, 3.0, 0.18, 3.0, 'solid', false, [1.0, 0.68, 0.14], 1.0));

    // Twin elevated flank catwalks (East & West)
    boxes.push(box(-16, 1.4, 0, 6.0, 2.8, 20.0, 'wall', true, [0.7, 0.78, 0.9], 0.0, [2, 4]));
    boxes.push(box(16, 1.4, 0, 6.0, 2.8, 20.0, 'wall', true, [0.7, 0.78, 0.9], 0.0, [2, 4]));
    boxes.push(box(-16, 2.86, 0, 6.1, 0.12, 20.1, 'solid', false, [0.0, 0.9, 1.0], 0.85));
    boxes.push(box(16, 2.86, 0, 6.1, 0.12, 20.1, 'solid', false, [1.0, 0.24, 0.4], 0.85));

    // Stairs at both ends of catwalks
    addStairs(boxes, -16, -10, 0, -1, 4.4, 7, 2.8, 5.6);
    addStairs(boxes, -16, 10, 0, 1, 4.4, 7, 2.8, 5.6);
    addStairs(boxes, 16, -10, 0, -1, 4.4, 7, 2.8, 5.6);
    addStairs(boxes, 16, 10, 0, 1, 4.4, 7, 2.8, 5.6);

    // Mid-lane tactical cover walls & crates
    const covers = [
      [-6.5, 1.2, -7.5, 3.4, 2.4, 1.2],
      [6.5, 1.2, 7.5, 3.4, 2.4, 1.2],
      [6.5, 1.2, -7.5, 1.2, 2.4, 3.4],
      [-6.5, 1.2, 7.5, 1.2, 2.4, 3.4],
      [0, 1.1, -15, 6.0, 2.2, 1.5],
      [0, 1.1, 15, 6.0, 2.2, 1.5],
      [-7.5, 0.95, 0, 2.0, 1.9, 2.6],
      [7.5, 0.95, 0, 2.0, 1.9, 2.6]
    ];
    covers.forEach(([x, y, z, sx, sy, sz]) => {
      boxes.push(box(x, y, z, sx, sy, sz, 'crate', true, [1, 1, 1], 0.0));
    });

    const jumpPads = [
      { x: -9.5, y: 0.08, z: -4.5, boost: 13.0 },
      { x: 9.5, y: 0.08, z: 4.5, boost: 13.0 }
    ];

    const pickups = [
      { id: 'hp1', type: 'health', x: -16, y: 3.7, z: 0, active: true, respawnAt: 0 },
      { id: 'hp2', type: 'health', x: 16, y: 3.7, z: 0, active: true, respawnAt: 0 },
      { id: 'am1', type: 'ammo', x: 0, y: 0.9, z: -11, active: true, respawnAt: 0 },
      { id: 'am2', type: 'ammo', x: 0, y: 0.9, z: 11, active: true, respawnAt: 0 }
    ];

    const spawns = [
      { x: -19, y: 0.1, z: -19, yaw: -Math.PI * 0.75 },
      { x: 19, y: 0.1, z: 19, yaw: Math.PI * 0.25 },
      { x: 19, y: 0.1, z: -19, yaw: Math.PI * 0.75 },
      { x: -19, y: 0.1, z: 19, yaw: -Math.PI * 0.25 },
      { x: 0, y: 0.1, z: -20, yaw: Math.PI },
      { x: 0, y: 0.1, z: 20, yaw: 0 },
      { x: -16, y: 2.9, z: 0, yaw: -Math.PI * 0.5 },
      { x: 16, y: 2.9, z: 0, yaw: Math.PI * 0.5 }
    ];

    const dronePaths = [
      { ax: -8, az: -12, bx: 8, bz: -12, y: 2.2, speed: 0.55 },
      { ax: -8, az: 12, bx: 8, bz: 12, y: 2.2, speed: 0.55 },
      { ax: -10, az: -6, bx: -10, bz: 6, y: 3.4, speed: 0.48 },
      { ax: 10, az: -6, bx: 10, bz: 6, y: 3.4, speed: 0.48 },
      { ax: -4, az: -4, bx: 4, bz: 4, y: 4.4, speed: 0.42 }
    ];

    return {
      id: 'courtyard',
      name: 'Неон-Дворик',
      halfSize: half,
      skyColor: [0.05, 0.04, 0.11],
      fogColor: [0.06, 0.05, 0.13],
      fogDensity: 0.015,
      boxes,
      jumpPads,
      pickups,
      spawns,
      dronePaths
    };
  }

  // Swept player collision with smooth wall sliding & stair step-up
  function movePlayer(map, pos, vel, dt) {
    const R = 0.5;
    const H = 1.82;
    const STEP = 0.52;
    const prevY = pos.y;

    // Horizontal X
    pos.x += vel.x * dt;
    for (let i = 0; i < map.boxes.length; i++) {
      const b = map.boxes[i];
      if (!b.solid) continue;
      if (pos.y + STEP < b.maxY && pos.y + H > b.minY) {
        if (pos.z + R > b.minZ && pos.z - R < b.maxZ) {
          if (pos.x + R > b.minX && pos.x - R < b.maxX) {
            if (vel.x > 0) pos.x = b.minX - R;
            else if (vel.x < 0) pos.x = b.maxX + R;
            else {
              const dLeft = Math.abs((pos.x + R) - b.minX);
              const dRight = Math.abs(b.maxX - (pos.x - R));
              pos.x = dLeft < dRight ? b.minX - R : b.maxX + R;
            }
            vel.x = 0;
          }
        }
      }
    }

    // Horizontal Z
    pos.z += vel.z * dt;
    for (let i = 0; i < map.boxes.length; i++) {
      const b = map.boxes[i];
      if (!b.solid) continue;
      if (pos.y + STEP < b.maxY && pos.y + H > b.minY) {
        if (pos.x + R > b.minX && pos.x - R < b.maxX) {
          if (pos.z + R > b.minZ && pos.z - R < b.maxZ) {
            if (vel.z > 0) pos.z = b.minZ - R;
            else if (vel.z < 0) pos.z = b.maxZ + R;
            else {
              const dBack = Math.abs((pos.z + R) - b.minZ);
              const dFront = Math.abs(b.maxZ - (pos.z - R));
              pos.z = dBack < dFront ? b.minZ - R : b.maxZ + R;
            }
            vel.z = 0;
          }
        }
      }
    }

    // Clamp arena bounds
    const limit = map.halfSize - R - 0.1;
    pos.x = Math.max(-limit, Math.min(limit, pos.x));
    pos.z = Math.max(-limit, Math.min(limit, pos.z));

    // Vertical Y
    pos.y += vel.y * dt;
    let grounded = false;
    let floorY = 0;

    for (let i = 0; i < map.boxes.length; i++) {
      const b = map.boxes[i];
      if (!b.solid) continue;
      if (pos.x + R > b.minX && pos.x - R < b.maxX && pos.z + R > b.minZ && pos.z - R < b.maxZ) {
        if (b.maxY <= prevY + STEP + 0.05 && b.maxY > floorY) {
          floorY = b.maxY;
        }
        // Ceiling check
        if (vel.y > 0 && prevY + H <= b.minY + 0.12 && pos.y + H > b.minY) {
          pos.y = b.minY - H;
          vel.y = 0;
        }
      }
    }

    if (pos.y <= floorY + 0.001) {
      pos.y = floorY;
      vel.y = 0;
      grounded = true;
    }

    // Jump pads
    let boosted = false;
    for (let i = 0; i < map.jumpPads.length; i++) {
      const pad = map.jumpPads[i];
      const dx = pos.x - pad.x;
      const dz = pos.z - pad.z;
      if (dx * dx + dz * dz < 1.85 * 1.85 && Math.abs(pos.y - pad.y) < 0.7 && vel.y < pad.boost * 0.7) {
        vel.y = pad.boost;
        grounded = false;
        boosted = true;
      }
    }

    return { grounded, boosted };
  }

  // Ray vs AABB slab intersection
  function rayBoxHit(ox, oy, oz, dx, dy, dz, b, maxDist) {
    let tmin = 0.001;
    let tmax = maxDist;

    if (Math.abs(dx) < 1e-6) {
      if (ox < b.minX || ox > b.maxX) return -1;
    } else {
      let t1 = (b.minX - ox) / dx;
      let t2 = (b.maxX - ox) / dx;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return -1;
    }

    if (Math.abs(dy) < 1e-6) {
      if (oy < b.minY || oy > b.maxY) return -1;
    } else {
      let t1 = (b.minY - oy) / dy;
      let t2 = (b.maxY - oy) / dy;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return -1;
    }

    if (Math.abs(dz) < 1e-6) {
      if (oz < b.minZ || oz > b.maxZ) return -1;
    } else {
      let t1 = (b.minZ - oz) / dz;
      let t2 = (b.maxZ - oz) / dz;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return -1;
    }
    return tmin;
  }

  function raycastWorld(map, ox, oy, oz, dx, dy, dz, maxDist) {
    let best = maxDist;
    for (let i = 0; i < map.boxes.length; i++) {
      const b = map.boxes[i];
      if (!b.solid) continue;
      const t = rayBoxHit(ox, oy, oz, dx, dy, dz, b, best);
      if (t > 0 && t < best) best = t;
    }
    return best;
  }

  // Ray vs sphere for headshot/drone checks
  function raySphereHit(ox, oy, oz, dx, dy, dz, cx, cy, cz, r, maxDist) {
    const fx = ox - cx;
    const fy = oy - cy;
    const fz = oz - cz;
    const b = fx * dx + fy * dy + fz * dz;
    const c = fx * fx + fy * fy + fz * fz - r * r;
    const disc = b * b - c;
    if (disc < 0) return -1;
    const t = -b - Math.sqrt(disc);
    if (t > 0.05 && t < maxDist) return t;
    return -1;
  }

  return {
    create(mapId) {
      return mapId === 'courtyard' ? buildCourtyard() : buildFoundry();
    },
    movePlayer,
    raycastWorld,
    rayBoxHit,
    raySphereHit
  };
})();
