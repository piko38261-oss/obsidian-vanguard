/**
 * =========================================================================
 * OBSIDIAN VANGUARD // ARPG — GOTHIC-CYBERPUNK 2D ACTION RPG ENGINE
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. LOCALIZATION & STORAGE
// -------------------------------------------------------------------------
const STORAGE_KEY = 'obsidian_vanguard_arpg_save_v2';

const I18N = {
  th: {
    hpLabel: 'พลังชีวิต (HP)',
    dashLabel: 'พริบตา [SPACE/SHIFT]',
    surgeGaugeLabel: 'โอเวอร์ไดรฟ์ [Q] (แลกเลือด)',
    waveLabel: 'เวฟ',
    scoreLabel: 'คะแนน',
    comboLabel: 'คอมโบ',
    skillCleave: 'ฟันกวาด',
    skillLance: 'หอกทะลวง',
    skillNova: 'คลื่นโนวา',
    skillSurge: 'คลั่งทอง',
    skillCataclysm: 'สุริยัน',
    skillDash: 'พริบตา',
    combatFeedTitle: 'บันทึกการรบ',
    startDesc:
      'เมื่อวิหารหินออบซิเดียนกลางหุบเขาน้ำตกถูกฝูงอสูรไซเบอร์และจอมทัพบอสบุกกลืนกิน Vanguard ผู้กุมดาบยักษ์ SOLAR EDGE จึงต้องลุกขึ้นสลับร่างธาตุ Solar / Cryo / Volt หลอมพลังและเปิด Overdrive [Q] แลกเลือดเพื่อทวงคืนแสงสว่างให้วิหาร',
    ctrlMove: 'เคลื่อนที่ & หลบเสาไฟ',
    ctrlCleave: 'ฟันกวาดเสี้ยวพระจันทร์',
    ctrlLance: 'พุ่งหอกหนักทะลวง (i-frames)',
    ctrlNova: 'คลื่นโนวา & สายฟ้าชิ่ง',
    ctrlSurge: 'โหมดคลั่งทอง [Q] / สุริยัน [R]',
    ctrlDodge: 'พริบตาหลบมีชาร์จ',
    btnDeploy: 'DEPLOY VANGUARD // เริ่มเกม',
    upgradeSub: 'WAVE CLEARED // SELECT TACTICAL BLESSING',
    upgradeTitle: 'เลือกพรอัปเกรดยุทธวิธีประจำเวฟ',
    pauseTitle: 'พักการรบชั่วคราว',
    pauseDesc: 'กด P หรือ Esc อีกครั้งเพื่อกลับเข้าสู่สนามประลองทันที',
    btnResume: 'เล่นต่อ [P]',
    btnRestart: 'เริ่มใหม่',
    gameoverTag: 'VANGUARD SIGNAL LOST',
    gameoverTitle: 'ภารกิจสิ้นสุดลง',
    finalScore: 'คะแนน',
    finalWave: 'เวฟสูงสุด',
    finalKills: 'กำจัดศัตรู',
    btnPlayAgain: 'REDEPLOY // เล่นใหม่อีกครั้ง',
    logDeploy: 'เข้าสู่วิหารออบซิเดียน // เตรียมพร้อมต่อสู้',
    logWaveStart: (w) => `เริ่มเวฟที่ ${w}`,
    logBossSpawn: 'คำเตือน: บอส SOVEREIGN เข้าสู่วิหาร!',
    logBossPhase2: 'บอสเข้าสู่ PHASE 2 // ลำแสงและแรงกระแทกทวีคูณ!',
    logUpgrade: (name) => `รับพรอัปเกรด: ${name}`,
  },
  en: {
    hpLabel: 'VITALITY (HP)',
    dashLabel: 'PHASE [SPACE/SHIFT]',
    surgeGaugeLabel: 'OVERDRIVE [Q] (HP DRAIN)',
    waveLabel: 'WAVE',
    scoreLabel: 'SCORE',
    comboLabel: 'COMBO',
    skillCleave: 'CLEAVE',
    skillLance: 'LANCE',
    skillNova: 'NOVA',
    skillSurge: 'SURGE',
    skillCataclysm: 'SOLAR',
    skillDash: 'PHASE',
    combatFeedTitle: 'COMBAT TELEMETRY',
    startDesc:
      'As cybernetic swarms and ancient warlords overrun the Obsidian Sanctum, the last Vanguard wields SOLAR EDGE—shifting between Solar, Cryo, and Volt aspects and burning vitality in Overdrive [Q] to reclaim the fallen temple.',
    ctrlMove: 'Move & cover around pillars',
    ctrlCleave: 'Crescent arc slash',
    ctrlLance: 'Heavy piercing thrust (i-frames)',
    ctrlNova: 'Frost nova & chain lightning',
    ctrlSurge: 'Overdrive [Q] & Cataclysm [R]',
    ctrlDodge: 'Charged phase dash',
    btnDeploy: 'DEPLOY VANGUARD // START',
    upgradeSub: 'WAVE CLEARED // SELECT TACTICAL BLESSING',
    upgradeTitle: 'CHOOSE TACTICAL BLESSING',
    pauseTitle: 'TACTICAL PAUSE',
    pauseDesc: 'Press P or Esc to resume real-time arena combat.',
    btnResume: 'RESUME [P]',
    btnRestart: 'RESTART RUN',
    gameoverTag: 'VANGUARD SIGNAL LOST',
    gameoverTitle: 'RUN TERMINATED',
    finalScore: 'SCORE',
    finalWave: 'WAVE',
    finalKills: 'KILLS',
    btnPlayAgain: 'REDEPLOY // PLAY AGAIN',
    logDeploy: 'VANGUARD DEPLOYED // SANCTUM LIVE',
    logWaveStart: (w) => `WAVE ${w} INITIATED`,
    logBossSpawn: 'WARNING: SOVEREIGN BOSS DETECTED!',
    logBossPhase2: 'BOSS ENTERED PHASE 2 // BEAM & SLAM OVERDRIVE!',
    logUpgrade: (name) => `BLESSING GRANTED: ${name}`,
  },
};

let currentLang = 'th';

function loadSaveData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { highScore: 0, maxWave: 1 };
    const parsed = JSON.parse(raw);
    return {
      highScore: Number.isFinite(parsed.highScore) ? parsed.highScore : 0,
      maxWave: Number.isFinite(parsed.maxWave) ? parsed.maxWave : 1,
    };
  } catch (_) {
    return { highScore: 0, maxWave: 1 };
  }
}

function saveHighScore(score, wave) {
  let isNew = false;
  if (score > saveData.highScore) {
    saveData.highScore = score;
    isNew = true;
  }
  if (wave > saveData.maxWave) {
    saveData.maxWave = wave;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch (_) {}
  refreshHighScoreUI();
  return isNew;
}

let saveData = loadSaveData();

function refreshHighScoreUI() {
  const topBest = document.getElementById('hud-best-score');
  const startBanner = document.getElementById('start-highscore-banner');
  if (topBest) topBest.textContent = `BEST: ${String(saveData.highScore).padStart(6, '0')}`;
  if (startBanner) {
    startBanner.textContent = `HIGH SCORE: ${String(saveData.highScore).padStart(6, '0')} • MAX WAVE: ${String(saveData.maxWave).padStart(2, '0')}`;
  }
}

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'th';
  document.documentElement.lang = currentLang;
  const dict = I18N[currentLang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && typeof dict[key] === 'string') {
      el.textContent = dict[key];
    }
  });
  if (gameState.phase === 'upgrade') {
    renderUpgradeChoices(gameState.pendingUpgrades);
  }
}

// -------------------------------------------------------------------------
// 2. ADAPTIVE BGM SEQUENCER + BIOME AMBIENCE + COMBAT SFX (WEB AUDIO API)
// -------------------------------------------------------------------------
const sfx = {
  ctx: null,
  master: null,
  bgmGain: null,
  ambientGain: null,
  muted: false,
  pulseTimer: null,
  pulseStep: 0,
  ambientStarted: false,
  ambientFilter: null,
};

function ensureAudio() {
  if (sfx.muted) return null;
  try {
    if (!sfx.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      sfx.ctx = new AudioCtx();

      sfx.master = sfx.ctx.createGain();
      sfx.master.gain.setValueAtTime(0.36, sfx.ctx.currentTime);
      sfx.master.connect(sfx.ctx.destination);

      // Dedicated BGM Bus (smoothly swells during Boss fights & ducks in menus)
      sfx.bgmGain = sfx.ctx.createGain();
      sfx.bgmGain.gain.setValueAtTime(0.22, sfx.ctx.currentTime);
      sfx.bgmGain.connect(sfx.master);

      // Dedicated Ambient Wind / Biome Bed Bus
      sfx.ambientGain = sfx.ctx.createGain();
      sfx.ambientGain.gain.setValueAtTime(0.055, sfx.ctx.currentTime);
      sfx.ambientGain.connect(sfx.master);

      startBiomeAmbience();
      startDynamicBgmEngine();
    }
    if (sfx.ctx.state === 'suspended') {
      sfx.ctx.resume().catch(() => {});
    }
    return sfx.ctx;
  } catch (_) {
    return null;
  }
}

let cachedNoiseBuffer = null;

function getWhiteNoiseBuffer(ctx) {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const length = Math.floor(ctx.sampleRate * 1.6);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

function startBiomeAmbience() {
  if (sfx.ambientStarted || !sfx.ctx) return;
  sfx.ambientStarted = true;
  try {
    const src = sfx.ctx.createBufferSource();
    src.buffer = getWhiteNoiseBuffer(sfx.ctx);
    src.loop = true;

    const filter = sfx.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, sfx.ctx.currentTime);
    filter.Q.setValueAtTime(1.4, sfx.ctx.currentTime);
    sfx.ambientFilter = filter;

    src.connect(filter);
    filter.connect(sfx.ambientGain);
    src.start();
  } catch (_) {}
}

function playBgmNote(ctx, now, type, freq, duration, vol, filterFreq = 1600, attack = 0.008) {
  if (!freq || freq <= 0) return;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, now);

  gain.gain.setValueAtTime(0.0006, now);
  gain.gain.linearRampToValueAtTime(vol, now + Math.min(attack, duration * 0.35));
  gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfx.bgmGain);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playBgmDrum(ctx, now, kind, vol) {
  if (kind === 'kick') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.14);
    osc.connect(gain);
    gain.connect(sfx.bgmGain);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (kind === 'snare') {
    const src = ctx.createBufferSource();
    src.buffer = getWhiteNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1250, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.11);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.bgmGain);
    src.start(now);
    src.stop(now + 0.13);
  } else if (kind === 'hat') {
    const src = ctx.createBufferSource();
    src.buffer = getWhiteNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6200, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.bgmGain);
    src.start(now);
    src.stop(now + 0.06);
  }
}

function startDynamicBgmEngine() {
  if (sfx.pulseTimer) return;

  const normalBass = [55, 0, 55, 0, 65.41, 0, 55, 0, 73.42, 0, 65.41, 0, 49.0, 0, 51.91, 0];
  const normalArp  = [220, 0, 261.63, 0, 329.63, 0, 261.63, 0, 293.66, 0, 261.63, 0, 246.94, 0, 196.0, 0];

  const bossBass   = [82.41, 82.41, 98.0, 82.41, 110.0, 82.41, 123.47, 110.0, 82.41, 82.41, 130.81, 123.47, 110.0, 98.0, 92.5, 77.78];
  const bossLead   = [329.63, 0, 392.0, 440.0, 493.88, 0, 440.0, 392.0, 523.25, 0, 493.88, 440.0, 392.0, 369.99, 311.13, 329.63];
  const bossP2Lead = [659.25, 622.25, 659.25, 783.99, 880.0, 783.99, 659.25, 622.25, 783.99, 0, 739.99, 659.25, 587.33, 523.25, 493.88, 622.25];

  sfx.pulseTimer = setInterval(() => {
    if (sfx.muted || !sfx.ctx || sfx.ctx.state !== 'running') return;
    if (typeof gameState === 'undefined') return;

    const now = sfx.ctx.currentTime;
    const isPlaying = gameState.phase === 'playing';
    const isMenuDucked = gameState.phase === 'paused' || gameState.phase === 'upgrade' || gameState.phase === 'arpg_pause';
    const boss = gameState.boss && gameState.boss.hp > 0 ? gameState.boss : null;
    const isBoss = Boolean(boss);
    const isPhase2 = Boolean(boss && boss.phase === 2);
    const isOverdrive = Boolean(gameState.player && gameState.player.surgeTimer > 0);

    let targetBgmVol = 0.0;
    if (isPlaying) {
      targetBgmVol = isPhase2 ? 0.50 : isBoss ? 0.40 : isOverdrive ? 0.30 : 0.21;
    } else if (isMenuDucked) {
      targetBgmVol = 0.08;
    } else if (gameState.phase === 'title') {
      targetBgmVol = 0.10;
    }
    sfx.bgmGain.gain.setTargetAtTime(targetBgmVol, now, 0.28);

    if (sfx.ambientFilter) {
      const biomeFreqs = [340, 210, 680, 480];
      const bFreq = biomeFreqs[(gameState.biomeIndex || 0) % biomeFreqs.length];
      sfx.ambientFilter.frequency.setTargetAtTime(isBoss ? bFreq * 1.45 : bFreq, now, 0.5);
      sfx.ambientGain.gain.setTargetAtTime(isPlaying || gameState.phase === 'title' ? 0.05 : 0.015, now, 0.3);
    }

    if (!isPlaying && !isMenuDucked) return;

    const step = sfx.pulseStep % 16;
    sfx.pulseStep++;

    try {
      if (isBoss) {
        const bassFreq = bossBass[step];
        playBgmNote(sfx.ctx, now, 'sawtooth', bassFreq, 0.16, isPhase2 ? 0.24 : 0.20, isPhase2 ? 780 : 560, 0.005);

        if (step % 4 === 0) {
          playBgmNote(sfx.ctx, now, 'triangle', bassFreq * 0.5, 0.35, 0.22, 260, 0.01);
          playBgmDrum(sfx.ctx, now, 'kick', isPhase2 ? 0.34 : 0.28);
        }
        if (isPhase2 && (step === 2 || step === 10 || step === 14)) {
          playBgmDrum(sfx.ctx, now, 'kick', 0.24);
        }
        if (step === 4 || step === 12) {
          playBgmDrum(sfx.ctx, now, 'snare', isPhase2 ? 0.22 : 0.17);
        }
        if (step % 2 === 1 || isPhase2) {
          playBgmDrum(sfx.ctx, now, 'hat', step % 2 === 1 ? 0.08 : 0.045);
        }

        const leadFreq = isPhase2 ? bossP2Lead[step] : bossLead[step];
        if (leadFreq > 0) {
          playBgmNote(
            sfx.ctx,
            now,
            isPhase2 ? 'sawtooth' : 'square',
            leadFreq,
            isPhase2 ? 0.14 : 0.20,
            isPhase2 ? 0.13 : 0.10,
            isPhase2 ? 2600 : 1850,
            0.008
          );
        }
      } else {
        const biomePitch = [1.0, 0.943, 1.059, 1.122][(gameState.biomeIndex || 0) % 4];
        const bassFreq = normalBass[step] * biomePitch;
        if (bassFreq > 0) {
          playBgmNote(
            sfx.ctx,
            now,
            'sawtooth',
            bassFreq,
            0.22,
            0.16,
            isOverdrive ? 620 : 300,
            0.015
          );
        }

        if (step === 0 || step === 8) {
          playBgmDrum(sfx.ctx, now, 'kick', isOverdrive ? 0.24 : 0.16);
        }
        if (isOverdrive && (step === 4 || step === 12)) {
          playBgmDrum(sfx.ctx, now, 'snare', 0.12);
        }
        if (step % 4 === 2) {
          playBgmDrum(sfx.ctx, now, 'hat', 0.045);
        }

        const arpFreq = normalArp[step] * biomePitch;
        if (arpFreq > 0) {
          playBgmNote(sfx.ctx, now, 'triangle', arpFreq, 0.26, 0.085, isOverdrive ? 1800 : 1100, 0.012);
        }
      }
    } catch (_) {}
  }, 145);
}

function playMusicStinger(kind) {
  const ctx = ensureAudio();
  if (!ctx || sfx.muted) return;
  try {
    const now = ctx.currentTime;
    if (kind === 'boss_intro') {
      playSubThump(ctx, now, 110, 32, 0.75, 0.42);
      playToneSweep(ctx, now, 'sawtooth', 82.41, 82.41, 0.95, 0.22, 0.06);
      playToneSweep(ctx, now + 0.04, 'sawtooth', 123.47, 123.47, 0.92, 0.16, 0.06);
      playToneSweep(ctx, now + 0.08, 'square', 155.56, 164.81, 0.85, 0.11, 0.08);
      playFilteredNoiseBurst(ctx, now, 0.65, 'lowpass', 900, 140, 1.8, 0.24);
    } else if (kind === 'boss_phase2') {
      playToneSweep(ctx, now, 'sawtooth', 164.81, 493.88, 0.55, 0.20, 0.04);
      playToneSweep(ctx, now + 0.08, 'square', 246.94, 659.25, 0.55, 0.14, 0.05);
      playSubThump(ctx, now + 0.12, 160, 28, 0.6, 0.4);
      playFilteredNoiseBurst(ctx, now, 0.5, 'bandpass', 600, 3200, 2.2, 0.26);
    } else if (kind === 'boss_victory') {
      const notes = [220, 277.18, 329.63, 440, 554.37];
      notes.forEach((n, idx) => {
        playToneSweep(ctx, now + idx * 0.09, 'triangle', n, n, 0.75, 0.17, 0.015);
        playToneSweep(ctx, now + idx * 0.09, 'sine', n * 2, n * 2, 0.55, 0.07, 0.015);
      });
    }
  } catch (_) {}
}

function playFilteredNoiseBurst(ctx, now, duration, filterType, startFreq, endFreq, qVal, peakGain) {
  const src = ctx.createBufferSource();
  src.buffer = getWhiteNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.Q.setValueAtTime(qVal, now);
  filter.frequency.setValueAtTime(Math.max(40, startFreq), now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0008, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + Math.min(0.015, duration * 0.18));
  gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(sfx.master);
  src.start(now);
  src.stop(now + duration + 0.02);
}

function playSubThump(ctx, now, startFreq, endFreq, duration, peakGain) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(Math.max(30, startFreq), now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(24, endFreq), now + duration);

  gain.gain.setValueAtTime(0.0008, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

  osc.connect(gain);
  gain.connect(sfx.master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playToneSweep(ctx, now, waveType, startFreq, endFreq, duration, peakGain, attack = 0.008) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = waveType;
  osc.frequency.setValueAtTime(Math.max(30, startFreq), now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(28, endFreq), now + duration);

  gain.gain.setValueAtTime(0.0008, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + Math.min(attack, duration * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

  osc.connect(gain);
  gain.connect(sfx.master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playCombatSfx(type, pitchScale = 1) {
  const ctx = ensureAudio();
  if (!ctx || sfx.muted) return;
  try {
    const now = ctx.currentTime;
    const asp = (gameState.player && gameState.player.weaponAspect) || 'solar';
    const microJitter = 0.94 + Math.random() * 0.12;
    const pScale = pitchScale * microJitter;

    if (type === 'cleave') {
      if (asp === 'cryo') {
        playFilteredNoiseBurst(ctx, now, 0.14, 'bandpass', 2750 * pScale, 740, 2.8, 0.22);
        playToneSweep(ctx, now, 'sine', 1520 * pScale, 680, 0.09, 0.06, 0.004);
      } else if (asp === 'volt') {
        playFilteredNoiseBurst(ctx, now, 0.12, 'highpass', 2200 * pScale, 850, 2.2, 0.23);
        playToneSweep(ctx, now, 'triangle', 980 * pScale, 290, 0.075, 0.08, 0.003);
      } else {
        playFilteredNoiseBurst(ctx, now, 0.16, 'bandpass', 1580 * pScale, 290, 2.0, 0.25);
        playSubThump(ctx, now, 135 * pScale, 44, 0.12, 0.16);
      }
    } else if (type === 'lance') {
      playFilteredNoiseBurst(ctx, now, 0.23, 'bandpass', 4100 * pScale, 620, 3.6, 0.29);
      playToneSweep(ctx, now, 'triangle', 1240 * pScale, 220, 0.14, 0.11, 0.005);
      playSubThump(ctx, now, 205 * pScale, 38, 0.19, 0.24);
    } else if (type === 'ice_burst') {
      playSubThump(ctx, now, 150, 32, 0.28, 0.28);
      playFilteredNoiseBurst(ctx, now, 0.34, 'highpass', 3400 * pScale, 950, 2.2, 0.27);
      playFilteredNoiseBurst(ctx, now + 0.03, 0.26, 'bandpass', 5200 * pScale, 1600, 4.2, 0.18);
      playToneSweep(ctx, now, 'sine', 2240 * pScale, 760, 0.16, 0.09, 0.004);
      playToneSweep(ctx, now + 0.04, 'triangle', 1680 * pScale, 540, 0.19, 0.07, 0.005);
    } else if (type === 'volt_shock') {
      playSubThump(ctx, now, 185, 25, 0.46, 0.36);
      playFilteredNoiseBurst(ctx, now, 0.16, 'highpass', 4600 * pScale, 1400, 3.5, 0.32);
      playFilteredNoiseBurst(ctx, now + 0.04, 0.32, 'bandpass', 2900 * pScale, 520, 2.6, 0.26);
      playToneSweep(ctx, now, 'sawtooth', 1420 * pScale, 145, 0.14, 0.14, 0.002);
      playToneSweep(ctx, now + 0.06, 'triangle', 960 * pScale, 110, 0.22, 0.12, 0.004);
    } else if (type === 'overdrive_roar') {
      playSubThump(ctx, now, 120, 30, 0.52, 0.38);
      playToneSweep(ctx, now, 'sawtooth', 135, 62, 0.44, 0.18, 0.015);
      playToneSweep(ctx, now + 0.03, 'triangle', 240, 980, 0.34, 0.16, 0.02);
      playFilteredNoiseBurst(ctx, now, 0.42, 'bandpass', 720, 3400, 1.9, 0.26);
      playFilteredNoiseBurst(ctx, now + 0.08, 0.3, 'highpass', 2600, 880, 2.4, 0.18);
    } else if (type === 'nova') {
      playSubThump(ctx, now, 165, 26, 0.44, 0.35);
      playFilteredNoiseBurst(ctx, now, 0.36, 'lowpass', 2800, 180, 1.4, 0.25);
    } else if (type === 'dodge') {
      playFilteredNoiseBurst(ctx, now, 0.12, 'bandpass', 1450 * pScale, 380, 2.2, 0.16);
      playToneSweep(ctx, now, 'sine', 420 * pScale, 175, 0.085, 0.09, 0.004);
    } else if (type === 'surge') {
      playToneSweep(ctx, now, 'triangle', 220, 880, 0.28, 0.16, 0.02);
      playFilteredNoiseBurst(ctx, now, 0.3, 'bandpass', 600, 3100, 2.4, 0.22);
      playSubThump(ctx, now, 90, 180, 0.26, 0.22);
    } else if (type === 'beam') {
      playSubThump(ctx, now, 115, 32, 0.34, 0.27);
      playFilteredNoiseBurst(ctx, now, 0.3, 'bandpass', 1450, 250, 2.0, 0.21);
    } else if (type === 'hit') {
      const isHeavy = pitchScale >= 1.2;
      playSubThump(ctx, now, isHeavy ? 215 : 165, 40, isHeavy ? 0.14 : 0.09, isHeavy ? 0.27 : 0.18);
      playFilteredNoiseBurst(ctx, now, isHeavy ? 0.13 : 0.08, 'highpass', isHeavy ? 1850 : 1200, 420, 1.8, isHeavy ? 0.22 : 0.15);
      playToneSweep(ctx, now, 'triangle', (isHeavy ? 1180 : 860) * pScale, 240, 0.075, isHeavy ? 0.11 : 0.065, 0.004);
    } else if (type === 'pickup') {
      playToneSweep(ctx, now, 'sine', 587.33 * pScale, 1046.5 * pScale, 0.13, 0.11, 0.008);
    } else if (type === 'hurt') {
      playSubThump(ctx, now, 135, 30, 0.24, 0.32);
      playFilteredNoiseBurst(ctx, now, 0.2, 'bandpass', 950, 180, 1.6, 0.24);
    }
  } catch (_) {}
}

// -------------------------------------------------------------------------
// 3. SANCTUM ENVIRONMENT, 15 MULTI-BRANCH BLESSINGS & CANVAS HANDLES
// -------------------------------------------------------------------------
const ARENA_W = 1920;
const ARENA_H = 1360;

const PILLARS = [
  { x: 560, y: 420, r: 44, phase: 0.2 },
  { x: 1360, y: 420, r: 44, phase: 1.7 },
  { x: 560, y: 940, r: 44, phase: 3.1 },
  { x: 1360, y: 940, r: 44, phase: 4.5 },
  { x: 960, y: 680, r: 34, phase: 2.3 },
];

const THERMAL_VENTS = [
  { x: 340, y: 260, r: 78, phase: 0.0 },
  { x: 1580, y: 260, r: 78, phase: 1.4 },
  { x: 340, y: 1100, r: 78, phase: 2.8 },
  { x: 1580, y: 1100, r: 78, phase: 4.2 },
  { x: 960, y: 310, r: 92, phase: 0.9 },
  { x: 960, y: 1050, r: 92, phase: 3.7 },
];

const RELIC_POOL = [
  // --- 1. BLADE (สายดาบ & คริติคอล) ---
  {
    id: 'twin_cleave',
    branch: 'blade',
    tag: 'BLADE // ARC',
    accent: 'border-orange-400 text-amber-300',
    name: { th: 'Twin Cleave Arc', en: 'Twin Cleave Arc' },
    desc: {
      th: 'ขยายมุมฟันกวาดเสี้ยวพระจันทร์ +35% และเพิ่มความเสียหายฟันอีก +25%',
      en: '+35% wider crescent cleave arc and +25% blade damage',
    },
  },
  {
    id: 'phantom_blade',
    branch: 'blade',
    tag: 'BLADE // ECHO',
    accent: 'border-amber-400 text-amber-200',
    name: { th: 'Phantom Echo', en: 'Phantom Echo' },
    desc: {
      th: 'ฮิตที่ 3 ของการฟันจะปล่อยคลื่นดาบทะลวงพุ่งไปข้างหน้า สร้างดาเมจ 85%',
      en: '3rd combo cleave fires a piercing energy blade wave forward (85% dmg)',
    },
  },
  {
    id: 'executioner_edge',
    branch: 'blade',
    tag: 'BLADE // EXECUTE',
    accent: 'border-red-500 text-red-300',
    name: { th: "Executioner's Mark", en: "Executioner's Mark" },
    desc: {
      th: 'ศัตรูที่เลือดต่ำกว่า 40% รับดาเมจแรงขึ้น +45% และเพิ่มโอกาสคริติคอล +10%',
      en: '+45% damage against foes below 40% HP and +10% Crit Chance',
    },
  },

  // --- 2. ELEMENTAL (สายปฏิกิริยาธาตุ) ---
  {
    id: 'elemental_catalyst',
    branch: 'elemental',
    tag: 'ELEMENT // CATALYST',
    accent: 'border-fuchsia-400 text-fuchsia-300',
    name: { th: 'Elemental Catalyst', en: 'Elemental Catalyst' },
    desc: {
      th: 'ปฏิกิริยาธาตุ (Melt / Overload / Superconduct) แรงขึ้น +45% และติดซ้ำไวขึ้น',
      en: '+45% Elemental Reaction damage and faster reaction trigger window',
    },
  },
  {
    id: 'chain_nova',
    branch: 'elemental',
    tag: 'ELEMENT // NOVA',
    accent: 'border-cyan-400 text-cyan-300',
    name: { th: 'Molten Chain Nova', en: 'Molten Chain Nova' },
    desc: {
      th: 'เพิ่มรัศมีคลื่นโนวา [E] +32% และปล่อยลูกไฟพลังงานเพิ่ม 4 ทิศทาง',
      en: '+32% Pulse Nova radius and launch 4 radial ember bolts',
    },
  },
  {
    id: 'prismatic_shift',
    branch: 'elemental',
    tag: 'ELEMENT // SHIFT',
    accent: 'border-sky-400 text-sky-200',
    name: { th: 'Prismatic Shift', en: 'Prismatic Shift' },
    desc: {
      th: 'กดสลับร่าง [1/2/3] สร้างคลื่นระเบิดดาเมจธาตุรอบตัว + ฟื้นฟู +6 HP (CD 3 วิ)',
      en: 'Aspect shifts deal AoE elemental burst damage & heal +6 HP (3s CD)',
    },
  },

  // --- 3. VANGUARD (สายถึก เกราะ & สวนกลับ) ---
  {
    id: 'vampiric_edge',
    branch: 'vanguard',
    tag: 'VANGUARD // LEECH',
    accent: 'border-rose-400 text-rose-300',
    name: { th: 'Vampiric Edge', en: 'Vampiric Edge' },
    desc: {
      th: 'ดูดพลังชีวิต +4 ต่อการฟันโดนศัตรู และเพิ่มพลังชีวิตสูงสุด +25',
      en: 'Leech +4 HP per cleave hit and gain +25 Max HP',
    },
  },
  {
    id: 'thorns_aegis',
    branch: 'vanguard',
    tag: 'VANGUARD // THORNS',
    accent: 'border-emerald-400 text-emerald-300',
    name: { th: 'Obsidian Thorns', en: 'Obsidian Thorns' },
    desc: {
      th: 'ลดความเสียหายที่ได้รับลง 15% และเมื่อโดนตีจะระเบิดคลื่นสวนกลับผลักศัตรูรอบตัว',
      en: '-15% incoming damage and unleash a counter shockwave when hit',
    },
  },
  {
    id: 'second_wind',
    branch: 'vanguard',
    tag: 'VANGUARD // SHIELD',
    accent: 'border-teal-400 text-teal-200',
    name: { th: 'Solar Aegis', en: 'Solar Aegis' },
    desc: {
      th: 'รับเกราะดูดซับดาเมจ +35 Shield (รีเกราะเต็มอัตโนมัติทุกเวฟและเมื่อเก็บลูกแก้วฮีล)',
      en: 'Gain +35 rechargeable Shield (refills every wave and on Heal Orb)',
    },
  },

  // --- 4. TEMPO (สายพริ้ว พริบตา & คูลดาวน์) ---
  {
    id: 'overclock_cd',
    branch: 'tempo',
    tag: 'TEMPO // HASTE',
    accent: 'border-cyan-300 text-cyan-200',
    name: { th: 'Overclocked Phase', en: 'Overclocked Phase' },
    desc: {
      th: 'ลดคูลดาวน์สกิลและฟื้นฟูพริบตาเร็วขึ้น 22% พร้อมความเร็วเดิน +12%',
      en: '22% faster skill/phase cooldowns and +12% move speed',
    },
  },
  {
    id: 'phase_lightning',
    branch: 'tempo',
    tag: 'TEMPO // VOLT STEP',
    accent: 'border-violet-400 text-violet-300',
    name: { th: 'Volt Step', en: 'Volt Step' },
    desc: {
      th: 'เพิ่มชาร์จพริบตา +1 และทุกครั้งที่พุ่ง [SPACE] จะฟาดสายฟ้าใส่ศัตรูรอบตัว',
      en: '+1 max Phase Dash charge; dashing strikes nearby foes with lightning',
    },
  },
  {
    id: 'void_piercer',
    branch: 'tempo',
    tag: 'TEMPO // LANCE',
    accent: 'border-purple-400 text-purple-300',
    name: { th: 'Void Piercer', en: 'Void Piercer' },
    desc: {
      th: 'หอกทะลวง [คลิกขวา] แรงขึ้น +40%, คูลดาวน์ไวขึ้น 15% และระเบิดดาเมจ AoE ปลายทาง',
      en: '+40% Heavy Lance damage, -15% CD, and AoE blast at impact',
    },
  },

  // --- 5. OVERDRIVE (สายคลั่งทอง & มหาเวท) ---
  {
    id: 'blood_frenzy',
    branch: 'overdrive',
    tag: 'OVERDRIVE // PACT',
    accent: 'border-yellow-400 text-yellow-300',
    name: { th: 'Blood Frenzy', en: 'Blood Frenzy' },
    desc: {
      th: 'ลดการเสียเลือดในโหมด Overdrive [Q] ลง 40% และยืดระยะเวลาคลั่งทอง +2 วินาที',
      en: '-40% HP drain during Overdrive [Q] and +2s duration',
    },
  },
  {
    id: 'solar_echo',
    branch: 'overdrive',
    tag: 'OVERDRIVE // SOLAR',
    accent: 'border-orange-500 text-orange-300',
    name: { th: 'Cataclysm Echo', en: 'Cataclysm Echo' },
    desc: {
      th: 'มหาเวทสุริยัน [R] คูลดาวน์ไวขึ้น 25% และยิงลูกไฟสุริยันกระจายซ้ำอีก 6 ลูก',
      en: '-25% Solar Cataclysm [R] CD and unleash 6 extra radial solar bolts',
    },
  },
  {
    id: 'orb_magnet',
    branch: 'overdrive',
    tag: 'OVERDRIVE // HARVEST',
    accent: 'border-amber-300 text-amber-200',
    name: { th: 'Soul Harvester', en: 'Soul Harvester' },
    desc: {
      th: 'ดูดลูกแก้วไกลขึ้น 65%, เติมเกจ Overdrive แรงขึ้น +35% และดรอป Shards เพิ่ม +2',
      en: '+65% orb magnet range, +35% Overdrive gain, and +2 bonus Shards',
    },
  },
];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const lightCanvas = document.createElement('canvas');
const lightCtx = lightCanvas.getContext('2d');

// -------------------------------------------------------------------------
// 4. ARPG EXPANSION: ASPECTS, BOSSES, BIOMES, ELEMENTS & TUNNEL GATE
// -------------------------------------------------------------------------
const WEAPON_ASPECTS = {
  solar: { key: 'solar', label: 'SOLAR CLEAVE', color: '#ff6a00', core: '#ffb800', arcMult: 1.0, dmgMult: 1.15 },
  cryo:  { key: 'cryo',  label: 'CRYO LANCE',   color: '#22d3ee', core: '#e0f2fe', arcMult: 0.78, dmgMult: 1.05 },
  volt:  { key: 'volt',  label: 'VOLT REAPER',  color: '#c084fc', core: '#f3e8ff', arcMult: 1.18, dmgMult: 0.96 },
};

const BOSS_ARCHETYPES = {
  sovereign: {
    key: 'sovereign',
    prefix: 'SOVEREIGN',
    primaryColor: '#ffb800',
    enrageColor: '#ff2a5f',
    speedMult: 1.0,
    hpMult: 1.0,
    patternCd: 2.25,
  },
  cryo_archon: {
    key: 'cryo_archon',
    prefix: 'CRYO ARCHON',
    primaryColor: '#22d3ee',
    enrageColor: '#38bdf8',
    speedMult: 0.92,
    hpMult: 1.12,
    patternCd: 2.1,
  },
  volt_tyrant: {
    key: 'volt_tyrant',
    prefix: 'VOLT TYRANT',
    primaryColor: '#c084fc',
    enrageColor: '#ff2a5f',
    speedMult: 1.18,
    hpMult: 0.95,
    patternCd: 1.85,
  },
};

const ROOM_BIOMES = [
  {
    key: 'swamp_ruins',
    name: { th: 'หนองน้ำวิหารออบซิเดียน', en: 'OBSIDIAN SWAMP SANCTUM' },
    skyTop: '#132429', skyMid: '#192f34', skyBot: '#0b161a',
    waterCol: 'rgba(34, 96, 108, 0.56)', waterEdge: 'rgba(125, 225, 220, 0.28)',
    pal: {
      ruin: { top: '#244b55', left: '#17343c', right: '#0d2026', highlight: 'rgba(125,211,252,0.22)' },
      ruinDark: { top: '#1c3b44', left: '#122830', right: '#09171d', highlight: 'rgba(94,234,212,0.16)' },
      stone: { top: '#2b3944', left: '#1c2630', right: '#111820', highlight: 'rgba(203,213,225,0.14)' },
      dirt: { top: '#7c5338', left: '#593925', right: '#3d2517', highlight: 'rgba(253,186,116,0.18)' },
      grass: { top: '#6ca632', left: '#593925', right: '#3b2416', overhangLeft: '#558b2f', overhangRight: '#33691e', highlight: 'rgba(217,249,157,0.34)' },
      submerged: { top: '#253c42', left: '#192b30', right: '#101d21', highlight: 'rgba(94,234,212,0.10)' },
    },
  },
  {
    key: 'molten_crypt',
    name: { th: 'สุสานเถ้าลาวา', en: 'MOLTEN ASH CRYPT' },
    skyTop: '#241114', skyMid: '#301518', skyBot: '#14080a',
    waterCol: 'rgba(234, 88, 12, 0.72)', waterEdge: 'rgba(253, 224, 71, 0.55)',
    pal: {
      ruin: { top: '#4a2b29', left: '#331c1b', right: '#1f1010', highlight: 'rgba(251,146,60,0.28)' },
      ruinDark: { top: '#361f20', left: '#241314', right: '#140a0b', highlight: 'rgba(249,115,22,0.20)' },
      stone: { top: '#3a3035', left: '#261f24', right: '#171216', highlight: 'rgba(253,186,116,0.16)' },
      dirt: { top: '#693424', left: '#4a2217', right: '#2e130c', highlight: 'rgba(251,146,60,0.22)' },
      grass: { top: '#9a3412', left: '#4a2217', right: '#2e130c', overhangLeft: '#c2410c', overhangRight: '#7c2d12', highlight: 'rgba(253,224,71,0.35)' },
      submerged: { top: '#451a12', left: '#2e100b', right: '#1c0906', highlight: 'rgba(251,146,60,0.16)' },
    },
  },
  {
    key: 'frost_citadel',
    name: { th: 'ปราการเหมันต์นิรันดร์', en: 'GLACIAL CITADEL' },
    skyTop: '#0d1e2e', skyMid: '#152e45', skyBot: '#07101a',
    waterCol: 'rgba(14, 116, 144, 0.62)', waterEdge: 'rgba(186, 230, 253, 0.45)',
    pal: {
      ruin: { top: '#335c75', left: '#224054', right: '#142836', highlight: 'rgba(186,230,253,0.34)' },
      ruinDark: { top: '#24465c', left: '#173040', right: '#0d1d29', highlight: 'rgba(125,211,252,0.22)' },
      stone: { top: '#3b4e63', left: '#273545', right: '#18212c', highlight: 'rgba(224,242,254,0.24)' },
      dirt: { top: '#4b5c6e', left: '#33404f', right: '#1f2833', highlight: 'rgba(186,230,253,0.18)' },
      grass: { top: '#7dd3fc', left: '#33404f', right: '#1f2833', overhangLeft: '#38bdf8', overhangRight: '#0284c7', highlight: 'rgba(240,249,255,0.5)' },
      submerged: { top: '#1e3a4c', left: '#122633', right: '#09151e', highlight: 'rgba(125,211,252,0.15)' },
    },
  },
  {
    key: 'storm_sanctum',
    name: { th: 'วิหารพายุอัสนี', en: 'STORM VOID SANCTUM' },
    skyTop: '#1a122b', skyMid: '#25183d', skyBot: '#0d0817',
    waterCol: 'rgba(88, 28, 135, 0.58)', waterEdge: 'rgba(232, 121, 249, 0.42)',
    pal: {
      ruin: { top: '#3e2c5c', left: '#2a1d40', right: '#181026', highlight: 'rgba(216,180,254,0.28)' },
      ruinDark: { top: '#2d1f45', left: '#1d132e', right: '#100a1c', highlight: 'rgba(192,132,252,0.20)' },
      stone: { top: '#333047', left: '#211f30', right: '#14121f', highlight: 'rgba(233,213,255,0.16)' },
      dirt: { top: '#4c3554', left: '#332238', right: '#1f1424', highlight: 'rgba(216,180,254,0.18)' },
      grass: { top: '#7e22ce', left: '#332238', right: '#1f1424', overhangLeft: '#9333ea', overhangRight: '#581c87', highlight: 'rgba(245,208,254,0.38)' },
      submerged: { top: '#281c3b', left: '#1a1126', right: '#0e0917', highlight: 'rgba(192,132,252,0.15)' },
    },
  },
];

const MONSTER_ELEMENTS = {
  normal: { key: 'normal', prefix: '',       color: '#ef4444', hpMult: 1.0,  spdMult: 1.0,  dmgMult: 1.0 },
  fire:   { key: 'fire',   prefix: 'Pyro ',  color: '#ff6a00', hpMult: 1.05, spdMult: 1.05, dmgMult: 1.2 },
  ice:    { key: 'ice',    prefix: 'Frost ', color: '#22d3ee', hpMult: 1.30, spdMult: 0.90, dmgMult: 1.05 },
  volt:   { key: 'volt',   prefix: 'Volt ',  color: '#c084fc', hpMult: 0.92, spdMult: 1.24, dmgMult: 1.15 },
};

const BOSS_VISUAL_FORMS = ['boss_overlord', 'boss_wyrm', 'boss_lich', 'boss_golem'];

const TUNNEL_GATE = { x: 864, y: 42, r: 78 };

const CONSTELLATION_NODES = [
  { id: 'sol_1', branch: 'SOLAR OVERLOAD', color: '#ff6a00', name: 'Cinder Edge', desc: '+18% Blade Damage & ignite burn per level', rank: 0, maxRank: 3, unlocked: false, keystone: false },
  { id: 'sol_2', branch: 'SOLAR OVERLOAD', color: '#ff6a00', name: 'Sunfire Vigor', desc: '+25 Max HP & +5% Crit chance per level', rank: 0, maxRank: 3, unlocked: false, keystone: false },
  { id: 'sol_3', branch: 'SOLAR OVERLOAD', color: '#ff6a00', name: 'KEYSTONE: SUPERNOVA', desc: 'Burning foes detonate a fiery blast on death', rank: 0, maxRank: 1, unlocked: false, keystone: true },

  { id: 'cry_1', branch: 'CRYO SHATTER', color: '#22d3ee', name: 'Permafrost Chill', desc: 'Cleaves chill & slow foes (-45% speed)', rank: 0, maxRank: 3, unlocked: false, keystone: false },
  { id: 'cry_2', branch: 'CRYO SHATTER', color: '#22d3ee', name: 'Glacial Lance', desc: '+25% Heavy Lance damage & frost trails', rank: 0, maxRank: 3, unlocked: false, keystone: false },
  { id: 'cry_3', branch: 'CRYO SHATTER', color: '#22d3ee', name: 'KEYSTONE: SHATTER NOVA', desc: 'Pulse Nova launches piercing frost shards', rank: 0, maxRank: 1, unlocked: false, keystone: true },

  { id: 'vlt_1', branch: 'STORM CONDUIT', color: '#c084fc', name: 'Arcane Haste', desc: '+15% Move speed & faster cooldowns per level', rank: 0, maxRank: 3, unlocked: false, keystone: false },
  { id: 'vlt_2', branch: 'STORM CONDUIT', color: '#c084fc', name: 'Surge Conduit', desc: '+18% Overdrive gain from hits & orbs', rank: 0, maxRank: 3, unlocked: false, keystone: false },
  { id: 'vlt_3', branch: 'STORM CONDUIT', color: '#c084fc', name: 'KEYSTONE: ARC CHAIN', desc: 'Cleaves arc lightning across nearby foes', rank: 0, maxRank: 1, unlocked: false, keystone: true },
];

const ARPG_RELIC_TEMPLATES = [
  { name: 'Signet of Slaughter', stat: 'dmg', desc: '+{v}% Blade Damage', min: 14, max: 28 },
  { name: 'Heart of the Brazier', stat: 'hp', desc: '+{v} Max HP', min: 30, max: 75 },
  { name: 'Chrono-Pendulum', stat: 'cdr', desc: '+{v}% Cooldown Speed', min: 12, max: 24 },
  { name: 'Vampiric Fang', stat: 'leech', desc: '+{v} HP on Kill', min: 4, max: 11 },
];

function hasConstellation(id) {
  return CONSTELLATION_NODES.some((n) => n.id === id && (n.unlocked || (n.rank || 0) > 0));
}

function getConstellationRank(id) {
  const node = CONSTELLATION_NODES.find((n) => n.id === id);
  return node ? (node.rank || (node.unlocked ? 1 : 0)) : 0;
}

function rollArpgRelic(forcedRarity = null) {
  const r = Math.random();
  const rarity = forcedRarity || (r > 0.8 ? 'mythic' : r > 0.42 ? 'epic' : 'rare');
  const mult = rarity === 'mythic' ? 1.55 : rarity === 'epic' ? 1.25 : 1.0;
  const tpl = ARPG_RELIC_TEMPLATES[Math.floor(Math.random() * ARPG_RELIC_TEMPLATES.length)];
  const val = Math.round((tpl.min + Math.random() * (tpl.max - tpl.min)) * mult);
  return {
    id: 'rel_' + Math.random().toString(36).slice(2, 9),
    name: `${rarity.toUpperCase()} ${tpl.name}`,
    rarity,
    stat: tpl.stat,
    val,
    desc: tpl.desc.replace('{v}', val),
  };
}

function getEquippedRelicStat(stat) {
  const p = gameState.player;
  if (!p || !Array.isArray(p.equippedRelics)) return 0;
  return p.equippedRelics.filter((item) => item.stat === stat).reduce((acc, item) => acc + item.val, 0);
}

function getEffectiveCooldownScale() {
  const p = gameState.player;
  if (!p) return 1.0;
  const cdrPct = Math.min(45, getEquippedRelicStat('cdr'));
  return Math.max(0.35, (p.cdScale || 1.0) * (1 - cdrPct / 100));
}

function getEffectiveCritChance() {
  const p = gameState.player;
  if (!p) return 0.15;
  let crit = 0.15 + getConstellationRank('sol_2') * 0.05 + (p.critBonus || 0);
  if (p.surgeTimer > 0) crit += 0.25;
  return Math.min(0.90, crit);
}

function syncPlayerRelicMaxHp(healDelta = 0) {
  const p = gameState.player;
  if (!p) return;
  const baseMax = 100 + getConstellationRank('sol_2') * 25 + (p.blessingHpBonus || 0);
  const relicHp = getEquippedRelicStat('hp');
  p.maxHp = baseMax + relicHp;
  p.hp = Math.max(0, Math.min(p.maxHp, p.hp + healDelta));
}

function switchWeaponAspect(aspectKey) {
  const p = gameState.player;
  if (!p || !WEAPON_ASPECTS[aspectKey]) return;
  p.weaponAspect = aspectKey;
  p.transformAnimTimer = aspectKey === 'volt' ? 1.45 : 1.15;
  p.transformAnimMax = p.transformAnimTimer;
  p.frostTrailTimer = 0;
  const asp = WEAPON_ASPECTS[aspectKey];

  const btnSolar = document.getElementById('aspect-btn-solar');
  const btnCryo = document.getElementById('aspect-btn-cryo');
  const btnVolt = document.getElementById('aspect-btn-volt');
  if (btnSolar) {
    btnSolar.className = 'pixel-btn px-2.5 py-1 font-bold cursor-pointer ' +
      (aspectKey === 'solar' ? 'border-amber-300 text-amber-300' : 'text-slate-400');
  }
  if (btnCryo) {
    btnCryo.className = 'pixel-btn px-2.5 py-1 font-bold cursor-pointer ' +
      (aspectKey === 'cryo' ? 'border-cyan-300 text-cyan-200' : 'text-slate-400');
  }
  if (btnVolt) {
    btnVolt.className = 'pixel-btn px-2.5 py-1 font-bold cursor-pointer ' +
      (aspectKey === 'volt' ? 'border-purple-300 text-purple-200' : 'text-slate-400');
  }

  // 1. พื้นแตกเป็นรอยร้าวตามธาตุ
  if (typeof addFloorDecal === 'function') {
    addFloorDecal(p.x, p.y, 92, `crack_${aspectKey}`);
  }

  // 2. วงเวทย์ใต้เท้า + เอฟเฟกต์ประจำร่าง
  if (aspectKey === 'solar') {
    gameState.overdriveSigils.push({
      x: p.x,
      y: p.y,
      r: 96,
      rot: 0,
      life: 1.1,
      maxLife: 1.1,
      color: '#ff6a00',
      aspectTag: 'solar',
    });
    spawnSparks(p.x, p.y, '#ff6a00', 26, 300);
    spawnSparks(p.x, p.y, '#fef08a', 14, 240);
    playCombatSfx('overdrive_roar', 1.05);
  } else if (aspectKey === 'cryo') {
    gameState.astralRings.push({
      x: p.x,
      y: p.y,
      r: 108,
      rot: 0,
      spokes: 8,
      color: '#22d3ee',
      life: 1.05,
      maxLife: 1.05,
    });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      gameState.iceShards.push({
        x: p.x + Math.cos(a) * 18,
        y: p.y + Math.sin(a) * 18,
        vx: Math.cos(a) * 260,
        vy: Math.sin(a) * 260,
        rot: a,
        size: 10,
        life: 0.45,
        maxLife: 0.45,
      });
    }
    spawnSparks(p.x, p.y, '#67e8f9', 24, 260);
    playCombatSfx('ice_burst', 1.12);
  } else if (aspectKey === 'volt') {
    if (typeof spawnLightningBranch === 'function') {
      for (let b = 0; b < 4; b++) {
        const ba = (b / 4) * Math.PI * 2 + Math.random() * 0.5;
        spawnLightningBranch(p.x, p.y, p.x + Math.cos(ba) * 125, p.y + Math.sin(ba) * 125, '#e879f9', 3.0);
      }
    }
    spawnSparks(p.x, p.y, '#e879f9', 28, 320);
    playCombatSfx('volt_shock', 1.05);
  }

  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 16,
    maxR: 155,
    life: 0.34,
    maxLife: 0.34,
    color: asp.color,
    lineWidth: 5,
  });
  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 10,
    maxR: 96,
    life: 0.24,
    maxLife: 0.24,
    color: asp.core,
    lineWidth: 3,
  });

  // 3. แปะเชื้อธาตุรอบตัว & เอฟเฟกต์พร Prismatic Shift (ดาเมจ AoE + ฮีล)
  if (typeof applyElementalAura === 'function' && gameState.phase === 'playing') {
    const burstEl = aspectKey === 'solar' ? 'fire' : aspectKey === 'cryo' ? 'ice' : 'volt';
    const shiftLvl = p.shiftBurstLevel || 0;
    const burstDmg = Math.round(
      p.baseDamage * (0.75 + shiftLvl * 0.7) * (typeof getAttackMultiplier === 'function' ? getAttackMultiplier() : 1)
    );
    const nearbyFoes = gameState.boss && gameState.boss.hp > 0 ? [...gameState.enemies, gameState.boss] : gameState.enemies;
    for (let i = nearbyFoes.length - 1; i >= 0; i--) {
      const foe = nearbyFoes[i];
      if (!foe || foe.hp <= 0) continue;
      if (Math.hypot(foe.x - p.x, foe.y - p.y) <= 165 + foe.r) {
        if (shiftLvl > 0 && typeof damageEnemy === 'function') {
          damageEnemy(foe, burstDmg, 0, 0, true);
        }
        applyElementalAura(foe, burstEl, burstDmg);
      }
    }
    if (shiftLvl > 0 && (p.shiftHealCd || 0) <= 0) {
      const healAmt = 6 * shiftLvl;
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
      p.shiftHealCd = 3.0;
      addFloatingText(p.x, p.y - 52, `+${healAmt} HP`, '#38bdf8', 1.0);
    }
  }

  if (typeof triggerDirectionalShake === 'function') triggerDirectionalShake(10.5);
  gameState.chromaticTimer = 0.24;
  addFloatingText(p.x, p.y - 38, asp.label, asp.core, 1.2);
}

function toggleArpgModal(kind) {
  if (gameState.phase !== 'playing' && gameState.phase !== 'arpg_pause') return;
  const treeEl = document.getElementById('overlay-tree');
  const forgeEl = document.getElementById('overlay-forge');
  const targetEl = kind === 'tree' ? treeEl : forgeEl;
  if (!targetEl) return;

  const isOpening = targetEl.classList.contains('hidden');
  treeEl?.classList.add('hidden');
  forgeEl?.classList.add('hidden');

  if (isOpening) {
    targetEl.classList.remove('hidden');
    gameState.phase = 'arpg_pause';
    if (kind === 'tree') renderConstellationModal();
    if (kind === 'forge') renderForgeModal();
  } else {
    gameState.phase = 'playing';
  }
}

let selectedConstellationId = 'sol_1';

function renderConstellationModal() {
  const p = gameState.player;
  const grid = document.getElementById('tree-branches-grid');
  const spEl = document.getElementById('tree-sp-count');
  if (!p || !grid) return;
  if (spEl) spEl.textContent = String(p.skillPoints || 0);

  grid.innerHTML = '';
  grid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden border-2 border-[#5c3b16] bg-[#0c1018]';

  const getNodeIconSvg = (id, color) => {
    const icons = {
      sol_1: `<path d="M-8,8 L6,-6 M2,-8 L8,-8 L8,-2 M-5,2 L-1,6" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="square"/>`,
      sol_2: `<path d="M0,-8 L7,-4 L7,3 L0,9 L-7,3 L-7,-4 Z" stroke="${color}" stroke-width="2" fill="none"/><rect x="-2" y="-2" width="4" height="4" fill="${color}"/>`,
      sol_3: `<polygon points="0,-9 3,-3 9,0 3,3 0,9 -3,3 -9,0 -3,-3" fill="${color}"/>`,
      cry_1: `<path d="M0,-9 L0,9 M-8,-4 L8,4 M-8,4 L8,-4" stroke="${color}" stroke-width="2" fill="none"/>`,
      cry_2: `<path d="M-7,7 L7,-7 M1,-7 L7,-7 L7,-1 M-3,-1 L1,3" stroke="${color}" stroke-width="2.2" fill="none"/>`,
      cry_3: `<polygon points="0,-9 6,0 0,9 -6,0" stroke="${color}" stroke-width="2" fill="none"/><polygon points="0,-4 3,0 0,4 -3,0" fill="${color}"/>`,
      vlt_1: `<path d="M-6,6 L2,-2 M-2,-6 L6,-6 L6,2 M-7,0 L-2,0" stroke="${color}" stroke-width="2.2" fill="none"/>`,
      vlt_2: `<polyline points="2,-9 -5,1 1,1 -2,9 6,-1 0,-1 2,-9" fill="${color}"/>`,
      vlt_3: `<polyline points="-6,-6 1,-1 -2,2 6,7" stroke="${color}" stroke-width="2.4" fill="none"/><circle cx="-6" cy="-6" r="2.2" fill="${color}"/><circle cx="6" cy="7" r="2.2" fill="${color}"/>`,
    };
    return icons[id] || `<circle cx="0" cy="0" r="5" fill="${color}"/>`;
  };

  const getLevelDescHtml = (node, lv) => {
    const effLv = Math.max(1, lv);
    const hl = (txt) => `<span class="text-amber-400 font-bold">${txt}</span>`;
    if (node.id === 'sol_1') return `เพิ่มพลังโจมตีดาบ ${hl('+' + (effLv * 18) + '%')} และเผาไหม้ศัตรูสร้างดาเมจ ${hl((9 + effLv * 7) + '/วิ')}`;
    if (node.id === 'sol_2') return `เพิ่มพลังชีวิตสูงสุด ${hl('+' + (effLv * 25) + ' HP')} และโอกาสติดคริติคอล ${hl('+' + (effLv * 5) + '%')}`;
    if (node.id === 'sol_3') return `ศัตรูที่ติดสถานะเผาไหม้จะระเบิดเพลิงสร้างความเสียหาย ${hl('110%')} รอบตัวเมื่อถูกกำจัด`;
    if (node.id === 'cry_1') return `การฟันกวาดจะแช่แข็งและลดความเร็วศัตรูลง ${hl('-45%')} นาน ${hl((1.8 + effLv * 0.6).toFixed(1) + ' วินาที')}`;
    if (node.id === 'cry_2') return `เพิ่มความเสียหายหอกทะลวง ${hl('+' + (effLv * 25) + '%')} และปล่อยเศษน้ำแข็งทะลวงแนวหน้า`;
    if (node.id === 'cry_3') return `สกิล Pulse Nova ยิงผลึกน้ำแข็งเจาะเกราะเพิ่มเติม ${hl('+6 ชิ้น')} รอบทิศทาง`;
    if (node.id === 'vlt_1') return `เพิ่มความเร็วเคลื่อนที่ ${hl('+' + (effLv * 12) + '%')} และลดคูลดาวน์สกิลทั้งหมด ${hl('-' + (effLv * 12) + '%')}`;
    if (node.id === 'vlt_2') return `ฟื้นฟูเกจ Overdrive จากการโจมตีและลูกแก้วเร็วขึ้น ${hl('+' + (effLv * 18) + '%')}`;
    if (node.id === 'vlt_3') return `การฟันกวาดจะชิ่งสายฟ้าใส่ศัตรูใกล้เคียงโดยอัตโนมัติ`;
    return node.desc;
  };

  const webWrapper = document.createElement('div');
  webWrapper.className =
    'lg:col-span-8 relative overflow-hidden flex items-center justify-center min-h-[450px] p-2 bg-[radial-gradient(circle_at_50%_48%,#232938_0%,#111520_58%,#080b12_100%)]';

  const W = 640;
  const H = 450;
  const cx = W * 0.5;
  const cy = H * 0.5;

  const nodeCoords = {
    sol_1: { x: cx,       y: cy - 110, major: true },
    sol_2: { x: cx,       y: cy + 5,   major: true },
    vlt_2: { x: cx,       y: cy + 120, major: true },

    cry_1: { x: cx - 108, y: cy - 28,  major: true },
    vlt_1: { x: cx + 108, y: cy - 28,  major: true },

    sol_3: { x: cx - 195, y: cy - 112, major: false },
    cry_2: { x: cx - 195, y: cy + 78,  major: false },
    cry_3: { x: cx + 195, y: cy - 112, major: false },
    vlt_3: { x: cx + 195, y: cy + 78,  major: false },
  };

  const links = [
    ['sol_1', 'sol_2'],
    ['sol_2', 'vlt_2'],
    ['sol_1', 'cry_1'],
    ['sol_1', 'vlt_1'],
    ['cry_1', 'sol_3'],
    ['cry_1', 'cry_2'],
    ['vlt_1', 'cry_3'],
    ['vlt_1', 'vlt_3'],
    ['cry_2', 'vlt_2'],
    ['vlt_3', 'vlt_2'],
  ];

  let svg = `
    <svg viewBox="0 0 ${W} ${H}" class="w-full h-full max-h-[440px] select-none">
      <defs>
        <radialGradient id="selectedGoldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.65"/>
          <stop offset="65%" stop-color="#f59e0b" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <circle cx="${cx}" cy="${cy}" r="198" fill="none" stroke="rgba(226,232,240,0.09)" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${cy}" r="154" fill="none" stroke="rgba(226,232,240,0.06)" stroke-width="1" stroke-dasharray="4 6"/>

      <g opacity="0.11" fill="#e2e8f0">
        <rect x="${cx - 34}" y="${cy - 135}" width="68" height="245"/>
        <rect x="${cx - 42}" y="${cy - 148}" width="18" height="22"/>
        <rect x="${cx - 9}"  y="${cy - 148}" width="18" height="22"/>
        <rect x="${cx + 24}" y="${cy - 148}" width="18" height="22"/>
        <path d="M${cx - 42},${cy + 70} Q${cx - 135},${cy + 25} ${cx - 105},${cy - 95} Q${cx - 85},${cy - 20} ${cx - 42},${cy - 10} Z"/>
        <path d="M${cx + 42},${cy + 70} Q${cx + 135},${cy + 25} ${cx + 105},${cy - 95} Q${cx + 85},${cy - 20} ${cx + 42},${cy - 10} Z"/>
        <path d="M${cx - 105},${cy + 115} Q${cx},${cy + 148} ${cx + 105},${cy + 115} L${cx + 80},${cy + 92} Q${cx},${cy + 116} ${cx - 80},${cy + 92} Z"/>
      </g>
  `;

  links.forEach(([aId, bId]) => {
    const a = nodeCoords[aId];
    const b = nodeCoords[bId];
    const nA = CONSTELLATION_NODES.find((x) => x.id === aId);
    const nB = CONSTELLATION_NODES.find((x) => x.id === bId);
    const bothLit = (nA?.rank || 0) > 0 && (nB?.rank || 0) > 0;
    const oneLit = (nA?.rank || 0) > 0 || (nB?.rank || 0) > 0;
    const strokeCol = bothLit ? '#fbbf24' : oneLit ? 'rgba(226,232,240,0.65)' : 'rgba(148,163,184,0.28)';
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${strokeCol}" stroke-width="${bothLit ? '2.4' : '1.5'}"/>`;
  });

  CONSTELLATION_NODES.forEach((node) => {
    const pt = nodeCoords[node.id];
    if (!pt) return;
    const curRank = node.rank || (node.unlocked ? 1 : 0);
    const active = curRank > 0;
    const isSelected = selectedConstellationId === node.id;
    const r = pt.major ? 26 : 20;

    svg += `<g class="cursor-pointer" data-node-id="${node.id}">`;

    if (isSelected) {
      svg += `<circle cx="${pt.x}" cy="${pt.y}" r="${r + 16}" fill="url(#selectedGoldGlow)"/>`;
      svg += `<circle cx="${pt.x}" cy="${pt.y}" r="${r + 5}" fill="none" stroke="#fde047" stroke-width="2"/>`;
    }

    svg += `
      <circle cx="${pt.x}" cy="${pt.y}" r="${r}"
        fill="${active ? '#090b10' : 'rgba(30,38,52,0.85)'}"
        stroke="${isSelected ? '#fde047' : active ? '#e2e8f0' : 'rgba(148,163,184,0.5)'}"
        stroke-width="${pt.major ? '2.5' : '1.8'}"/>
      <g transform="translate(${pt.x}, ${pt.y}) scale(${pt.major ? '1.1' : '0.88'})">
        ${getNodeIconSvg(node.id, active ? (isSelected ? '#fde047' : node.color) : '#94a3b8')}
      </g>
    `;

    if (active || pt.major) {
      svg += `
        <rect x="${pt.x - 19}" y="${pt.y + r - 3}" width="38" height="14" fill="#090b10" stroke="${active ? '#9a6728' : '#334155'}" stroke-width="1"/>
        <text x="${pt.x}" y="${pt.y + r + 7}" text-anchor="middle" fill="${active ? '#f8fafc' : '#64748b'}" font-size="9" font-weight="700" font-family="Silkscreen, monospace">Lv.${curRank}</text>
      `;
    }

    if (!active) {
      const lx = pt.x + r * 0.72;
      const ly = pt.y - r * 0.72;
      svg += `
        <g transform="translate(${lx}, ${ly})">
          <circle cx="0" cy="0" r="6.5" fill="#090b10" stroke="#64748b" stroke-width="1"/>
          <rect x="-3" y="-1" width="6" height="4.5" fill="#94a3b8"/>
          <path d="M-2,-1 L-2,-3 A2,2 0 0,1 2,-3 L2,-1" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
        </g>
      `;
    }

    svg += `</g>`;
  });

  svg += `
      <line x1="28" y1="${H - 18}" x2="290" y2="${H - 18}" stroke="rgba(226,232,240,0.35)" stroke-width="1.2"/>
      <circle cx="296" cy="${H - 18}" r="2.5" fill="#fbbf24"/>
    </svg>
  `;
  webWrapper.innerHTML = svg;

  webWrapper.querySelectorAll('[data-node-id]').forEach((gEl) => {
    const nid = gEl.getAttribute('data-node-id');
    gEl.addEventListener('click', () => {
      selectedConstellationId = nid;
      playCombatSfx('pickup', 0.95);
      renderConstellationModal();
    });
  });

  const inspNode = CONSTELLATION_NODES.find((n) => n.id === selectedConstellationId) || CONSTELLATION_NODES[0];
  const curRank = inspNode.rank || (inspNode.unlocked ? 1 : 0);
  const maxR = inspNode.maxRank || 1;
  const canUpgrade = curRank < maxR && (p.skillPoints || 0) > 0;
  const displayLv = Math.max(1, curRank);
  const hasNextLv = curRank > 0 && curRank < maxR;

  const inspCol = document.createElement('div');
  inspCol.className = 'lg:col-span-4 bg-[#0b0f19]/95 border-t-2 lg:border-t-0 lg:border-l-2 border-[#3b2914] p-5 flex flex-col justify-between gap-4';

  inspCol.innerHTML = `
    <div class="space-y-4">
      <div class="flex flex-col items-center text-center pt-1 space-y-2">
        <div class="w-14 h-14 flex items-center justify-center bg-[#070910] border-2" style="border-color:${inspNode.color}">
          <svg viewBox="-14 -14 28 28" class="w-9 h-9">${getNodeIconSvg(inspNode.id, inspNode.color)}</svg>
        </div>
        <div class="px-3 py-0.5 bg-[#231a0e] border border-[#9a6728] font-mono text-[10px] font-bold tracking-wider uppercase text-amber-300">
          ${inspNode.keystone ? 'KEYSTONE' : inspNode.branch}
        </div>
        <div class="font-display text-lg font-bold text-white">${inspNode.name}</div>
        <div class="font-mono text-[11px] text-slate-400">ระดับปัจจุบัน: <span class="text-amber-300 font-bold">Lv.${curRank} / ${maxR}</span></div>
      </div>

      <div class="border-t border-slate-800 pt-3 space-y-3 text-xs leading-relaxed">
        <div>
          <div class="font-mono font-bold text-white mb-1">Lv.${displayLv} ${curRank === 0 ? '<span class="text-slate-400 font-normal">(ยังไม่ปลดล็อก)</span>' : ''}</div>
          <p class="text-slate-200">${getLevelDescHtml(inspNode, displayLv)}</p>
        </div>

        ${hasNextLv ? `
          <div class="opacity-55">
            <div class="font-mono font-bold text-slate-300 mb-1">Lv.${curRank + 1}</div>
            <p class="text-slate-300">${getLevelDescHtml(inspNode, curRank + 1)}</p>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="space-y-2 pt-3 border-t border-slate-800">
      ${!canUpgrade && curRank < maxR ? `
        <div class="text-right font-mono text-[11px] text-rose-400">
          ต้องการแต้มกลุ่มดาวอย่างน้อย 1 แต้ม (ผ่านเวฟเพื่อรับเพิ่ม)
        </div>
      ` : ''}
      <button id="btn-inspector-upgrade" type="button" class="w-full py-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer ${
        canUpgrade ? 'pixel-btn-gold' : 'pixel-btn text-slate-500 cursor-not-allowed'
      }">
        ${curRank >= maxR ? 'MAX LEVEL' : canUpgrade ? (curRank === 0 ? 'UNLOCK NODE (1 PT)' : `UPGRADE TO Lv.${curRank + 1} (1 PT)`) : 'INSUFFICIENT POINTS'}
      </button>
    </div>
  `;

  grid.appendChild(webWrapper);
  grid.appendChild(inspCol);

  const upgBtn = inspCol.querySelector('#btn-inspector-upgrade');
  if (upgBtn && canUpgrade) {
    upgBtn.addEventListener('click', () => {
      inspNode.rank = curRank + 1;
      inspNode.unlocked = true;
      p.skillPoints--;
      if (inspNode.id === 'sol_2') {
        syncPlayerRelicMaxHp(25);
      } else if (inspNode.id === 'vlt_1') {
        p.moveSpeed = Math.round(p.moveSpeed * 1.12);
        p.cdScale = Math.max(0.5, p.cdScale * 0.88);
      }
      playCombatSfx('pickup', 1.25);
      syncHudDom();
      renderConstellationModal();
    });
  }
}

function renderForgeModal() {
  const p = gameState.player;
  if (!p) return;
  p.inventoryRelics = p.inventoryRelics || [];
  p.equippedRelics = p.equippedRelics || [];

  const shardsEl = document.getElementById('forge-shards-count');
  const lvlEl = document.getElementById('forge-blade-lvl');
  const bonusEl = document.getElementById('forge-dmg-pct');
  const eqCountEl = document.getElementById('forge-eq-count');
  const upgBtn = document.getElementById('btn-forge-upgrade');

  const forgeLvl = p.forgeLevel || 0;
  const cost = 15 + forgeLvl * 10;

  if (shardsEl) shardsEl.textContent = String(p.shards || 0);
  if (lvlEl) lvlEl.textContent = String(forgeLvl);
  if (bonusEl) bonusEl.textContent = `+${forgeLvl * 16}%`;
  if (eqCountEl) eqCountEl.textContent = `${p.equippedRelics.length} / 3`;
  if (upgBtn) {
    upgBtn.textContent = `FORGE UPGRADE (${cost} SHARDS)`;
    upgBtn.disabled = (p.shards || 0) < cost;
  }

  const eqList = document.getElementById('forge-equipped-list');
  if (eqList) {
    eqList.innerHTML = p.equippedRelics.length === 0
      ? '<div class="text-slate-500">ยังไม่ได้สวมใส่ Relic</div>'
      : '';
    p.equippedRelics.forEach((rel) => {
      const row = document.createElement('div');
      row.className = 'bg-[#0b101d] border-2 border-cyan-500 p-2.5 flex items-center justify-between gap-2';
      row.innerHTML = `<div><div class="font-bold text-white">${rel.name}</div><div class="text-amber-300 mt-0.5">${rel.desc}</div></div>`;
      const unequipBtn = document.createElement('button');
      unequipBtn.type = 'button';
      unequipBtn.className = 'pixel-btn px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer';
      unequipBtn.textContent = 'REMOVE';
      unequipBtn.addEventListener('click', () => {
        p.equippedRelics = p.equippedRelics.filter((x) => x.id !== rel.id);
        p.inventoryRelics.push(rel);
        syncPlayerRelicMaxHp(0);
        renderForgeModal();
        syncHudDom();
      });
      row.appendChild(unequipBtn);
      eqList.appendChild(row);
    });
  }

  const invList = document.getElementById('forge-inventory-list');
  if (invList) {
    invList.innerHTML = p.inventoryRelics.length === 0
      ? '<div class="text-slate-500 col-span-2">กำจัดบอสหรือศัตรูเพื่อเก็บ Relic Orbs</div>'
      : '';
    p.inventoryRelics.forEach((rel) => {
      const rarityBorder =
        rel.rarity === 'mythic'
          ? 'border-amber-400'
          : rel.rarity === 'epic'
          ? 'border-purple-400'
          : 'border-cyan-500';
      const card = document.createElement('div');
      card.className = `bg-[#0b101d] border-2 ${rarityBorder} p-2.5 space-y-2`;
      card.innerHTML = `<div class="font-bold text-white">${rel.name}</div><div class="text-cyan-300">${rel.desc}</div>`;
      const actRow = document.createElement('div');
      actRow.className = 'flex gap-1.5';

      const eqBtn = document.createElement('button');
      eqBtn.type = 'button';
      eqBtn.className = 'pixel-btn flex-1 py-1 text-[10px] font-bold text-cyan-200 cursor-pointer';
      eqBtn.textContent = 'EQUIP';
      eqBtn.disabled = p.equippedRelics.length >= 3;
      eqBtn.addEventListener('click', () => {
        if (p.equippedRelics.length >= 3) return;
        p.inventoryRelics = p.inventoryRelics.filter((x) => x.id !== rel.id);
        p.equippedRelics.push(rel);
        syncPlayerRelicMaxHp(rel.stat === 'hp' ? rel.val : 0);
        playCombatSfx('pickup', 1.1);
        renderForgeModal();
        syncHudDom();
      });

      const salBtn = document.createElement('button');
      salBtn.type = 'button';
      salBtn.className = 'pixel-btn py-1 px-2 text-[10px] font-bold text-amber-300 cursor-pointer';
      salBtn.textContent = '+8 SHD';
      salBtn.addEventListener('click', () => {
        p.inventoryRelics = p.inventoryRelics.filter((x) => x.id !== rel.id);
        p.shards = (p.shards || 0) + 8;
        playCombatSfx('hit', 1.2);
        renderForgeModal();
        syncHudDom();
      });

      actRow.appendChild(eqBtn);
      actRow.appendChild(salBtn);
      card.appendChild(actRow);
      invList.appendChild(card);
    });
  }
}