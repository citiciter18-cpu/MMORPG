/* ==========================================================================
   BladeRealm — 8-Bit / 16-Bit Procedural WebAudio Music & SFX Synthesizer
   Zero external MP3 files required — runs cleanly in WebView & Telegram.
   ========================================================================== */

window.GameAudio = (function () {
  let ctx = null;
  let unlocked = false;
  let muted = false;
  let musicVol = 0.28;
  let sfxVol = 0.50;
  let bgmTimer = null;
  let stepIdx = 0;
  let currentTheme = 'town';

  const THEMES = {
    town: {
      tempoMs: 260,
      wave: 'triangle',
      lead: [261.6, 329.6, 392.0, 523.3, 392.0, 329.6, 293.7, 349.2, 440.0, 349.2, 329.6, 293.7, 261.6, 0, 392.0, 0],
      bass: [130.8, 0, 196.0, 0, 146.8, 0, 174.6, 0, 130.8, 0, 196.0, 0, 130.8, 0, 196.0, 0]
    },
    wilds: {
      tempoMs: 210,
      wave: 'square',
      lead: [293.7, 349.2, 440.0, 523.3, 440.0, 392.0, 349.2, 329.6, 293.7, 440.0, 587.3, 523.3, 440.0, 392.0, 349.2, 0],
      bass: [146.8, 146.8, 220.0, 0, 174.6, 174.6, 196.0, 0, 146.8, 146.8, 220.0, 0, 164.8, 0, 146.8, 0]
    },
    dark: {
      tempoMs: 195,
      wave: 'sawtooth',
      lead: [220.0, 233.1, 261.6, 220.0, 196.0, 220.0, 261.6, 311.1, 293.7, 261.6, 233.1, 220.0, 196.0, 174.6, 196.0, 0],
      bass: [110.0, 0, 110.0, 130.8, 98.0, 0, 98.0, 116.5, 110.0, 0, 110.0, 130.8, 87.3, 0, 98.0, 0]
    },
    battle: {
      tempoMs: 145,
      wave: 'square',
      lead: [329.6, 392.0, 440.0, 523.3, 493.9, 440.0, 392.0, 329.6, 349.2, 440.0, 523.3, 659.3, 587.3, 523.3, 493.9, 440.0],
      bass: [164.8, 164.8, 220.0, 164.8, 146.8, 146.8, 196.0, 146.8, 174.6, 174.6, 220.0, 174.6, 196.0, 196.0, 246.9, 196.0]
    }
  };

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    const c = ensureCtx();
    if (!c) return;
    unlocked = true;
    syncFromSettings();
    startMusicLoop();
  }

  function syncFromSettings() {
    const set = window.GameState && window.GameState.settings;
    if (!set) return;
    if (typeof set.audioMuted === 'boolean') muted = set.audioMuted;
    if (typeof set.musicVol === 'number') musicVol = set.musicVol;
    if (typeof set.sfxVol === 'number') sfxVol = set.sfxVol;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted || !unlocked || !freq) return;
    const c = ensureCtx();
    if (!c || c.state !== 'running') return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + dur);
    gain.gain.setValueAtTime(Math.max(0.0001, vol), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function noiseBurst(dur, vol) {
    if (muted || !unlocked) return;
    const c = ensureCtx();
    if (!c || c.state !== 'running') return;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
  }

  function playSfx(kind) {
    if (muted || !unlocked || sfxVol <= 0.01) return;
    const v = sfxVol * 0.22;
    switch (kind) {
      case 'attack':
        tone(340, 0.09, 'sawtooth', v * 0.7, 120);
        noiseBurst(0.06, v * 0.45);
        break;
      case 'magic':
        tone(520, 0.14, 'triangle', v * 0.85, 920);
        break;
      case 'crit':
        tone(680, 0.11, 'square', v, 240);
        tone(1020, 0.09, 'triangle', v * 0.8, 1380);
        break;
      case 'hit':
        tone(160, 0.08, 'sawtooth', v * 0.75, 70);
        break;
      case 'coin':
        tone(988, 0.07, 'square', v * 0.65);
        setTimeout(() => tone(1318, 0.12, 'square', v * 0.65), 55);
        break;
      case 'loot':
        tone(659, 0.08, 'triangle', v * 0.7);
        setTimeout(() => tone(880, 0.11, 'triangle', v * 0.7), 60);
        break;
      case 'levelup':
        [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'square', v * 0.75), i * 85));
        break;
      case 'enhance_ok':
        [440, 554, 659, 880].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', v * 0.8), i * 65));
        break;
      case 'enhance_fail':
        tone(240, 0.18, 'sawtooth', v * 0.8, 110);
        break;
      case 'dash':
        noiseBurst(0.11, v * 0.5);
        tone(420, 0.1, 'sine', v * 0.5, 220);
        break;
      case 'skill':
        tone(420, 0.13, 'square', v * 0.7, 840);
        break;
      case 'death':
        [330, 294, 247, 196].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'sawtooth', v * 0.7), i * 130));
        break;
      case 'bounty':
        [440, 440, 587].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'square', v * 0.7), i * 100));
        break;
      case 'victory':
        [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'square', v * 0.75), i * 90));
        break;
      case 'pet':
        tone(760, 0.08, 'triangle', v * 0.6, 1120);
        break;
      default:
        tone(540, 0.05, 'triangle', v * 0.45, 620);
    }
  }

  function pickCurrentTheme() {
    if (window.Activities) {
      if (window.Activities.isInDungeon() || window.Activities.isInArena()) return 'battle';
    }
    const p = window.GameState && window.GameState.player;
    if (!p || !window.World) return 'town';
    const nearBoss = window.Combat && window.Combat.monsters &&
      window.Combat.monsters.some(m => !m.dead && m.isBoss && Math.hypot(m.x - p.x, m.y - p.y) < 380);
    if (nearBoss) return 'battle';
    const b = window.World.getBiomeAt(p.x, p.y);
    if (b.safe) return 'town';
    if (b.id === 'volcano' || b.id === 'abyss' || b.id === 'swamp') return 'dark';
    return 'wilds';
  }

  function scheduleNextBeat() {
    clearTimeout(bgmTimer);
    const theme = THEMES[currentTheme] || THEMES.town;
    bgmTimer = setTimeout(() => {
      if (window.GameState && window.GameState.started && !muted && unlocked && musicVol > 0.01) {
        const nextTheme = pickCurrentTheme();
        if (nextTheme !== currentTheme) {
          currentTheme = nextTheme;
          stepIdx = 0;
        }
        const t = THEMES[currentTheme] || THEMES.town;
        const nLead = t.lead[stepIdx % t.lead.length];
        const nBass = t.bass[stepIdx % t.bass.length];
        const mv = musicVol * 0.095;
        if (nLead) tone(nLead, (t.tempoMs / 1000) * 0.78, t.wave, mv);
        if (nBass) tone(nBass, (t.tempoMs / 1000) * 0.85, 'triangle', mv * 0.9);
        stepIdx = (stepIdx + 1) % 16;
      }
      scheduleNextBeat();
    }, theme.tempoMs);
  }

  function startMusicLoop() {
    if (bgmTimer) return;
    scheduleNextBeat();
  }

  function setMuted(val) {
    muted = !!val;
    if (window.GameState && window.GameState.settings) {
      window.GameState.settings.audioMuted = muted;
    }
    updateHudAudioBtn();
  }

  function toggleMute() {
    unlock();
    setMuted(!muted);
    if (!muted) playSfx('coin');
    if (window.UI) window.UI.toast(muted ? 'Звук и музыка выключены' : 'Звук и 8-bit музыка включены!');
  }

  function setMusicVol(v) {
    musicVol = Math.max(0, Math.min(1, Number(v) || 0));
    if (window.GameState && window.GameState.settings) window.GameState.settings.musicVol = musicVol;
  }

  function setSfxVol(v) {
    sfxVol = Math.max(0, Math.min(1, Number(v) || 0));
    if (window.GameState && window.GameState.settings) window.GameState.settings.sfxVol = sfxVol;
  }

  function updateHudAudioBtn() {
    const ico = document.getElementById('hudAudioIcon');
    const txt = document.getElementById('btnToggleAudioText');
    if (ico && window.PixelIcons) {
      ico.src = window.PixelIcons.get(muted ? 'audio_off' : 'audio_on', 14);
    }
    if (txt) txt.textContent = muted ? 'Звук: 0' : 'Звук';
  }

  function init() {
    const firstGesture = () => {
      unlock();
      window.removeEventListener('pointerdown', firstGesture);
      window.removeEventListener('keydown', firstGesture);
    };
    window.addEventListener('pointerdown', firstGesture, { passive: true });
    window.addEventListener('keydown', firstGesture, { passive: true });
    syncFromSettings();
    updateHudAudioBtn();
  }

  return {
    init,
    unlock,
    playSfx,
    setMuted,
    toggleMute,
    isMuted: () => muted,
    getMusicVol: () => musicVol,
    getSfxVol: () => sfxVol,
    setMusicVol,
    setSfxVol,
    updateHudAudioBtn
  };
})();
