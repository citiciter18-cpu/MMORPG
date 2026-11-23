// Zero-asset procedural Web Audio SFX engine for Vortex Arena
window.SoundFX = (function () {
  let ctx = null;
  let enabled = true;
  let noiseBuf = null;

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playNoise(duration, filterFreq, gainVal, q = 1.0) {
    const c = ensure();
    if (!c || !noiseBuf) return;
    const now = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.value = q;
    const gain = c.createGain();
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    src.start(now);
    src.stop(now + duration);
  }

  function playTone(type, f1, f2, duration, gainVal) {
    const c = ensure();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), now + duration);
    const gain = c.createGain();
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  return {
    setEnabled(val) {
      enabled = !!val;
    },
    shoot(weaponId) {
      if (weaponId === 'rifle') {
        playTone('sawtooth', 420, 110, 0.085, 0.14);
        playNoise(0.075, 1600, 0.18, 1.2);
      } else if (weaponId === 'shotgun') {
        playTone('triangle', 190, 42, 0.18, 0.28);
        playNoise(0.2, 720, 0.3, 0.7);
      } else if (weaponId === 'railgun') {
        playTone('sawtooth', 1480, 140, 0.24, 0.18);
        playTone('sine', 760, 1800, 0.12, 0.12);
        playNoise(0.14, 2400, 0.16, 2.0);
      }
    },
    hit(headshot) {
      if (headshot) {
        playTone('sine', 1650, 2200, 0.11, 0.2);
        playTone('triangle', 1200, 1800, 0.08, 0.14);
      } else {
        playTone('triangle', 920, 560, 0.055, 0.14);
      }
    },
    kill() {
      playTone('sine', 520, 880, 0.14, 0.16);
      setTimeout(() => playTone('sine', 880, 1320, 0.16, 0.15), 70);
    },
    reload() {
      playTone('square', 320, 480, 0.06, 0.08);
      setTimeout(() => playTone('square', 520, 740, 0.07, 0.09), 180);
    },
    jumpPad() {
      playTone('sine', 220, 980, 0.28, 0.18);
    },
    pickup() {
      playTone('sine', 660, 1180, 0.14, 0.15);
    },
    hurt() {
      playTone('sawtooth', 150, 65, 0.14, 0.2);
    },
    step() {
      playNoise(0.03, 380, 0.04, 1.4);
    }
  };
})();
