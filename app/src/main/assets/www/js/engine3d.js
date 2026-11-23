// Self-contained zero-dependency WebGL 3D FPS Renderer for Vortex Arena
window.Engine3D = (function () {
  // Minimal fast 4x4 column-major matrix math
  function mat4Identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad * 0.5);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  function mat4LookAt(ex, ey, ez, tx, ty, tz) {
    let zx = ex - tx, zy = ey - ty, zz = ez - tz;
    let len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;

    // up = (0, 1, 0)
    let xx = zz, xy = 0, xz = -zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xz /= len;

    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;

    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * ex + xy * ey + xz * ez),
      -(yx * ex + yy * ey + yz * ez),
      -(zx * ex + zy * ey + zz * ez),
      1
    ]);
  }

  function mat4Multiply(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      const b0 = b[col * 4], b1 = b[col * 4 + 1], b2 = b[col * 4 + 2], b3 = b[col * 4 + 3];
      out[col * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
      out[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
      out[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      out[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    return out;
  }

  function mat4TRS(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    const cx = Math.cos(rx), sxr = Math.sin(rx);
    const cy = Math.cos(ry), syr = Math.sin(ry);
    const cz = Math.cos(rz), szr = Math.sin(rz);

    // Rotation order: Y * X * Z
    const r00 = cy * cz + syr * sxr * szr;
    const r01 = cz * syr * sxr - cy * szr;
    const r02 = cx * syr;
    const r10 = cx * szr;
    const r11 = cx * cz;
    const r12 = -sxr;
    const r20 = cy * sxr * szr - cz * syr;
    const r21 = cy * cz * sxr + syr * szr;
    const r22 = cx * cy;

    return new Float32Array([
      r00 * sx, r10 * sx, r20 * sx, 0,
      r01 * sy, r11 * sy, r21 * sy, 0,
      r02 * sz, r12 * sz, r22 * sz, 0,
      tx, ty, tz, 1
    ]);
  }

  function projectPoint(vp, x, y, z, width, height) {
    const cx = vp[0] * x + vp[4] * y + vp[8] * z + vp[12];
    const cy = vp[1] * x + vp[5] * y + vp[9] * z + vp[13];
    const cw = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
    if (cw <= 0.1) return null;
    const ndcX = cx / cw;
    const ndcY = cy / cw;
    if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) return null;
    return {
      x: (ndcX * 0.5 + 0.5) * width,
      y: (0.5 - ndcY * 0.5) * height,
      dist: cw
    };
  }

  // Unit cube geometry (positions, normals, uvs)
  function createUnitCubeData() {
    const faces = [
      // +Z front
      { n: [0, 0, 1], v: [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]] },
      // -Z back
      { n: [0, 0, -1], v: [[.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5]] },
      // +X right
      { n: [1, 0, 0], v: [[.5, -.5, .5], [.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5]] },
      // -X left
      { n: [-1, 0, 0], v: [[-.5, -.5, -.5], [-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5]] },
      // +Y top
      { n: [0, 1, 0], v: [[-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5], [-.5, .5, -.5]] },
      // -Y bottom
      { n: [0, -1, 0], v: [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5]] }
    ];
    const verts = [];
    const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const idx = [0, 1, 2, 0, 2, 3];
    for (const f of faces) {
      for (const i of idx) {
        verts.push(
          f.v[i][0], f.v[i][1], f.v[i][2],
          f.n[0], f.n[1], f.n[2],
          uvs[i][0], uvs[i][1]
        );
      }
    }
    return new Float32Array(verts);
  }

  function createProceduralTexture(gl, kind) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');

    if (kind === 'floor') {
      g.fillStyle = '#141c2b';
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#22314a';
      g.lineWidth = 4;
      g.strokeRect(4, 4, 248, 248);
      g.strokeStyle = '#1a2538';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(128, 0); g.lineTo(128, 256);
      g.moveTo(0, 128); g.lineTo(256, 128);
      g.stroke();
      g.fillStyle = 'rgba(0, 229, 255, 0.28)';
      g.fillRect(10, 10, 10, 10);
      g.fillRect(236, 10, 10, 10);
      g.fillRect(10, 236, 10, 10);
      g.fillRect(236, 236, 10, 10);
    } else if (kind === 'wall') {
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#222f46');
      grad.addColorStop(0.5, '#192336');
      grad.addColorStop(1, '#121928');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#2f415e';
      g.lineWidth = 4;
      g.strokeRect(6, 6, 244, 118);
      g.strokeRect(6, 132, 244, 118);
      g.fillStyle = '#394f72';
      for (let x = 24; x <= 232; x += 68) {
        g.fillRect(x, 18, 6, 6);
        g.fillRect(x, 144, 6, 6);
      }
    } else if (kind === 'crate') {
      g.fillStyle = '#202b3d';
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#384c6b';
      g.lineWidth = 10;
      g.strokeRect(10, 10, 236, 236);
      // Hazard accent stripe
      g.fillStyle = '#ffb020';
      g.fillRect(24, 206, 208, 18);
      g.fillStyle = '#141c2b';
      for (let i = 0; i < 8; i++) {
        g.beginPath();
        g.moveTo(24 + i * 28, 206);
        g.lineTo(38 + i * 28, 206);
        g.lineTo(28 + i * 28, 224);
        g.lineTo(14 + i * 28, 224);
        g.fill();
      }
      g.strokeStyle = '#00e5ff';
      g.lineWidth = 3;
      g.strokeRect(48, 48, 160, 130);
    } else if (kind === 'bridge') {
      g.fillStyle = '#082636';
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#00e5ff';
      g.lineWidth = 8;
      g.strokeRect(6, 6, 244, 244);
      g.strokeStyle = 'rgba(0, 229, 255, 0.55)';
      g.lineWidth = 3;
      for (let i = 32; i < 256; i += 32) {
        g.beginPath();
        g.moveTo(i, 0); g.lineTo(i, 256);
        g.moveTo(0, i); g.lineTo(256, i);
        g.stroke();
      }
    } else {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, 256, 256);
    }

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  function create(canvas) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL unavailable');

    const vsSource = `
      attribute vec3 aPos;
      attribute vec3 aNorm;
      attribute vec2 aUv;
      uniform mat4 uModel;
      uniform mat4 uVP;
      uniform vec2 uUvScale;
      varying vec3 vNorm;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vec4 wp = uModel * vec4(aPos, 1.0);
        vWorldPos = wp.xyz;
        vNorm = normalize(mat3(uModel) * aNorm);
        vUv = aUv * uUvScale;
        gl_Position = uVP * wp;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D uTex;
      uniform vec3 uColor;
      uniform float uEmissive;
      uniform vec3 uCamPos;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform float uUseFog;
      varying vec3 vNorm;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vec3 texCol = texture2D(uTex, vUv).rgb * uColor;
        vec3 n = normalize(vNorm);
        vec3 sunDir = normalize(vec3(0.45, 0.85, 0.35));
        vec3 rimDir = normalize(vec3(-0.6, 0.35, -0.7));
        float ndl = max(dot(n, sunDir), 0.0);
        float rim = max(dot(n, rimDir), 0.0);
        vec3 hemi = mix(vec3(0.14, 0.18, 0.28), vec3(0.46, 0.56, 0.72), n.y * 0.5 + 0.5);
        vec3 lit = texCol * (hemi + vec3(0.72, 0.78, 0.9) * ndl + vec3(0.08, 0.34, 0.48) * rim);
        vec3 finalCol = mix(lit, texCol * 1.35, uEmissive);
        if (uUseFog > 0.5) {
          float dist = length(vWorldPos - uCamPos);
          float fogFactor = 1.0 - exp(-dist * uFogDensity);
          finalCol = mix(finalCol, uFogColor, clamp(fogFactor, 0.0, 0.92));
        }
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh));
      }
      return sh;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const loc = {
      aPos: gl.getAttribLocation(prog, 'aPos'),
      aNorm: gl.getAttribLocation(prog, 'aNorm'),
      aUv: gl.getAttribLocation(prog, 'aUv'),
      uModel: gl.getUniformLocation(prog, 'uModel'),
      uVP: gl.getUniformLocation(prog, 'uVP'),
      uUvScale: gl.getUniformLocation(prog, 'uUvScale'),
      uTex: gl.getUniformLocation(prog, 'uTex'),
      uColor: gl.getUniformLocation(prog, 'uColor'),
      uEmissive: gl.getUniformLocation(prog, 'uEmissive'),
      uCamPos: gl.getUniformLocation(prog, 'uCamPos'),
      uFogColor: gl.getUniformLocation(prog, 'uFogColor'),
      uFogDensity: gl.getUniformLocation(prog, 'uFogDensity'),
      uUseFog: gl.getUniformLocation(prog, 'uUseFog')
    };

    const cubeData = createUnitCubeData();
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, cubeData, gl.STATIC_DRAW);

    const stride = 8 * 4;
    gl.enableVertexAttribArray(loc.aPos);
    gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(loc.aNorm);
    gl.vertexAttribPointer(loc.aNorm, 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(loc.aUv);
    gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, stride, 6 * 4);

    const textures = {
      floor: createProceduralTexture(gl, 'floor'),
      wall: createProceduralTexture(gl, 'wall'),
      crate: createProceduralTexture(gl, 'crate'),
      bridge: createProceduralTexture(gl, 'bridge'),
      solid: createProceduralTexture(gl, 'solid')
    };

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    let lastTex = null;
    function bindTex(name) {
      const t = textures[name] || textures.solid;
      if (t !== lastTex) {
        gl.bindTexture(gl.TEXTURE_2D, t);
        lastTex = t;
      }
    }

    function drawBox(model, texName, color, emissive = 0.0, uvScale = [1, 1]) {
      bindTex(texName);
      gl.uniformMatrix4fv(loc.uModel, false, model);
      gl.uniform3f(loc.uColor, color[0], color[1], color[2]);
      gl.uniform1f(loc.uEmissive, emissive);
      gl.uniform2f(loc.uUvScale, uvScale[0], uvScale[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // Draw a 3D glowing tracer beam between two world points
    function drawBeam(ax, ay, az, bx, by, bz, width, color) {
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const len = Math.hypot(dx, dy, dz);
      if (len < 0.05) return;
      const mx = (ax + bx) * 0.5;
      const my = (ay + by) * 0.5;
      const mz = (az + bz) * 0.5;
      const yaw = Math.atan2(dx, dz);
      const horiz = Math.hypot(dx, dz);
      const pitch = -Math.atan2(dy, horiz);
      const m = mat4TRS(mx, my, mz, pitch, yaw, 0, width, width, len);
      drawBox(m, 'solid', color, 1.0);
    }

    // Draw segmented 3D tactical humanoid soldier for multiplayer peers
    function drawRemotePlayer(p, time) {
      if (!p.alive) return;
      const accent = p.rgb || [1.0, 0.24, 0.38];
      const darkArmor = [0.16, 0.21, 0.31];
      const stride = p.moving ? Math.sin(time * 11 + p.animSeed) * 0.35 : 0;
      const y = p.y;
      const ry = p.yaw + Math.PI; // face forward direction

      function part(lx, ly, lz, sx, sy, sz, rx, col, em = 0.0) {
        const root = mat4TRS(p.x, y, p.z, 0, ry, 0, 1, 1, 1);
        const local = mat4TRS(lx, ly, lz, rx, 0, 0, sx, sy, sz);
        drawBox(mat4Multiply(root, local), 'solid', col, em);
      }

      // Legs
      part(-0.17, 0.42, stride * 0.25, 0.22, 0.82, 0.24, stride, darkArmor);
      part(0.17, 0.42, -stride * 0.25, 0.22, 0.82, 0.24, -stride, darkArmor);
      // Torso + glowing chest core
      part(0, 1.12, 0, 0.58, 0.66, 0.34, 0, darkArmor);
      part(0, 1.16, 0.18, 0.34, 0.22, 0.05, 0, accent, 0.9);
      // Shoulder pauldrons
      part(-0.38, 1.28, 0, 0.2, 0.26, 0.32, 0, accent, 0.45);
      part(0.38, 1.28, 0, 0.2, 0.26, 0.32, 0, accent, 0.45);
      // Helmet + glowing visor
      part(0, 1.66, 0, 0.38, 0.38, 0.38, 0, [0.22, 0.28, 0.4]);
      part(0, 1.68, 0.19, 0.32, 0.12, 0.05, 0, accent, 1.0);
      // Held weapon
      part(0.32, 1.14, 0.36, 0.11, 0.13, 0.72, -p.pitch * 0.7, [0.12, 0.15, 0.22]);
      part(0.32, 1.17, 0.46, 0.05, 0.04, 0.42, -p.pitch * 0.7, accent, 0.9);
    }

    // Draw 3D tactical holographic target drone (Solo Training Range)
    function drawDrone(d, time) {
      if (!d.alive) return;
      const bob = Math.sin(time * 3.5 + d.phase) * 0.22;
      const cy = d.y + bob;
      const spin = time * 2.2 + d.phase;
      const col = d.hitFlash > 0 ? [1.0, 1.0, 1.0] : [1.0, 0.26, 0.42];
      // Core chassis
      drawBox(mat4TRS(d.x, cy, d.z, 0, spin, 0, 0.74, 0.74, 0.74), 'crate', [0.85, 0.9, 1.0], 0.05);
      // Glowing eye core
      drawBox(mat4TRS(d.x, cy, d.z, 0, spin, 0, 0.82, 0.28, 0.82), 'solid', col, 0.95);
      // Outer rotating gyro bars
      drawBox(mat4TRS(d.x, cy, d.z, spin * 0.6, -spin * 1.2, 0, 1.25, 0.12, 0.16), 'solid', [0.0, 0.92, 1.0], 0.9);
      drawBox(mat4TRS(d.x, cy, d.z, -spin * 0.6, spin * 1.2, Math.PI * 0.5, 1.25, 0.12, 0.16), 'solid', [0.0, 0.92, 1.0], 0.9);
    }

    // Draw first-person 3D weapon viewmodel in camera space (never clips walls!)
    function drawViewModel(weaponId, recoil, bobX, bobY, adsBlend, reloadProgress, muzzleTimer, aspect) {
      if (weaponId === 'railgun' && adsBlend > 0.78) return; // hidden inside scope

      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(loc.uUseFog, 0.0);
      gl.uniform3f(loc.uCamPos, 0, 0, 0);
      const vmProj = mat4Perspective(58 * Math.PI / 180, aspect, 0.03, 15.0);
      gl.uniformMatrix4fv(loc.uVP, false, vmProj);

      const xOff = (0.31 * (1 - adsBlend)) + bobX * (1 - adsBlend * 0.75);
      const yOff = (-0.27 * (1 - adsBlend * 0.35)) + bobY * (1 - adsBlend * 0.75) - reloadProgress * 0.22;
      const zOff = -0.58 + recoil * 0.16;
      const rx = recoil * 0.45 - reloadProgress * 0.55;
      const ry = reloadProgress * 0.35;

      const root = mat4TRS(xOff, yOff, zOff, rx, ry, 0, 1, 1, 1);

      function vmPart(lx, ly, lz, sx, sy, sz, col, em = 0.0) {
        drawBox(mat4Multiply(root, mat4TRS(lx, ly, lz, 0, 0, 0, sx, sy, sz)), 'solid', col, em);
      }

      const gunMetal = [0.16, 0.20, 0.29];
      const darkSteel = [0.09, 0.12, 0.18];

      if (weaponId === 'rifle') {
        vmPart(0, 0, 0, 0.11, 0.13, 0.52, gunMetal);
        vmPart(0, 0.03, -0.34, 0.06, 0.06, 0.36, darkSteel);
        vmPart(0, 0.085, 0.02, 0.07, 0.045, 0.16, darkSteel);
        vmPart(0, 0.09, 0.02, 0.042, 0.028, 0.02, [0.0, 0.95, 1.0], 1.0); // Holo sight
        vmPart(0, 0.04, -0.14, 0.118, 0.022, 0.34, [0.0, 0.92, 1.0], 0.95); // Cyan accent rails
        vmPart(0, -0.13, -0.05, 0.065, 0.18, 0.09, darkSteel); // Mag
      } else if (weaponId === 'shotgun') {
        vmPart(0, -0.01, 0.02, 0.14, 0.15, 0.48, gunMetal);
        vmPart(0, 0.03, -0.34, 0.095, 0.08, 0.42, darkSteel);
        vmPart(0, -0.04, -0.26, 0.11, 0.075, 0.24, [1.0, 0.66, 0.14], 0.25); // Amber pump grip
        vmPart(0, 0.075, -0.1, 0.05, 0.025, 0.34, [1.0, 0.66, 0.14], 0.9);
      } else {
        // LR-7 Railgun
        vmPart(0, 0, 0.04, 0.13, 0.15, 0.50, gunMetal);
        vmPart(-0.042, 0.025, -0.45, 0.032, 0.065, 0.64, darkSteel); // Left rail
        vmPart(0.042, 0.025, -0.45, 0.032, 0.065, 0.64, darkSteel); // Right rail
        vmPart(0, 0.025, -0.42, 0.034, 0.03, 0.56, [1.0, 0.24, 0.42], 1.0); // Plasma accelerator core
        vmPart(0, 0.11, -0.04, 0.068, 0.068, 0.26, darkSteel); // Optics tube
        vmPart(0, 0.11, -0.175, 0.05, 0.05, 0.02, [0.0, 0.95, 1.0], 1.0);
      }

      if (muzzleTimer > 0) {
        const s = 0.08 + muzzleTimer * 1.4;
        const mCol = window.WEAPONS[weaponId].color;
        vmPart(0, 0.03, -0.68, s, s, s * 1.6, mCol, 1.0);
      }
    }

    function render(scene) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);

      const map = scene.map;
      gl.clearColor(map.skyColor[0], map.skyColor[1], map.skyColor[2], 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const aspect = w / Math.max(1, h);
      const proj = mat4Perspective(scene.fov * Math.PI / 180, aspect, 0.1, 180.0);
      const cam = scene.cam;
      const view = mat4LookAt(
        cam.x, cam.y, cam.z,
        cam.x + cam.fx, cam.y + cam.fy, cam.z + cam.fz
      );
      const vp = mat4Multiply(proj, view);

      gl.uniformMatrix4fv(loc.uVP, false, vp);
      gl.uniform3f(loc.uCamPos, cam.x, cam.y, cam.z);
      gl.uniform3f(loc.uFogColor, map.fogColor[0], map.fogColor[1], map.fogColor[2]);
      gl.uniform1f(loc.uFogDensity, map.fogDensity);
      gl.uniform1f(loc.uUseFog, 1.0);

      // 1. Arena geometry
      for (let i = 0; i < map.boxes.length; i++) {
        const b = map.boxes[i];
        const m = mat4TRS(b.cx, b.cy, b.cz, 0, 0, 0, b.sx, b.sy, b.sz);
        drawBox(m, b.mat, b.color, b.emissive, b.uvScale);
      }

      // 2. Jump pads
      const pulse = 0.72 + Math.sin(scene.time * 6.0) * 0.28;
      for (let i = 0; i < map.jumpPads.length; i++) {
        const pad = map.jumpPads[i];
        drawBox(mat4TRS(pad.x, pad.y, pad.z, 0, 0, 0, 2.5, 0.18, 2.5), 'solid', [0.12, 0.18, 0.28], 0.1);
        drawBox(mat4TRS(pad.x, pad.y + 0.11, pad.z, 0, scene.time * 1.4, 0, 1.7, 0.08, 1.7), 'solid', [0.0, 0.92 * pulse, 1.0], 1.0);
      }

      // 3. Pickups
      for (let i = 0; i < map.pickups.length; i++) {
        const pk = map.pickups[i];
        if (!pk.active) continue;
        const bobY = pk.y + Math.sin(scene.time * 3.0 + i) * 0.16;
        const col = pk.type === 'health' ? [0.0, 0.95, 0.48] : [1.0, 0.72, 0.12];
        drawBox(mat4TRS(pk.x, bobY, pk.z, 0, scene.time * 1.8 + i, 0, 0.56, 0.56, 0.56), 'solid', col, 0.9);
      }

      // 4. Remote multiplayer players
      for (let i = 0; i < scene.remotes.length; i++) {
        drawRemotePlayer(scene.remotes[i], scene.time);
      }

      // 5. Training drones
      for (let i = 0; i < scene.drones.length; i++) {
        drawDrone(scene.drones[i], scene.time);
      }

      // 6. Bullet tracers & beams
      for (let i = 0; i < scene.beams.length; i++) {
        const bm = scene.beams[i];
        const fade = Math.max(0.15, bm.life / bm.maxLife);
        drawBeam(bm.ax, bm.ay, bm.az, bm.bx, bm.by, bm.bz, bm.width * fade, bm.color);
      }

      // 7. Impact & explosion sparks
      for (let i = 0; i < scene.particles.length; i++) {
        const pt = scene.particles[i];
        const sz = pt.size * Math.max(0.1, pt.life / pt.maxLife);
        drawBox(mat4TRS(pt.x, pt.y, pt.z, pt.life * 6, pt.life * 5, 0, sz, sz, sz), 'solid', pt.color, 1.0);
      }

      // 8. First-person weapon viewmodel
      if (scene.alive) {
        drawViewModel(
          scene.weaponId,
          scene.recoil,
          scene.bobX,
          scene.bobY,
          scene.adsBlend,
          scene.reloadProgress,
          scene.muzzleTimer,
          aspect
        );
      }

      return vp;
    }

    return { render, projectPoint };
  }

  return { create };
})();
