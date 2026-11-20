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
      'ฝ่าวงล้อมศัตรูในวิหารไซเบอร์พังก์หินออบซิเดียน ฟันกวาดคอมโบด้วยดาบยักษ์ SOLAR EDGE พุ่งหอกทะลวงเกราะ ปลดปล่อยคลื่นน้ำแข็ง/สายฟ้า โหมดคลั่งทอง [Q] และมหาเวทสุริยัน [R] เผชิญหน้าบอสหลายเฟส!',
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
      'Carve through cybernetic swarms in an obsidian gothic sanctum with SOLAR EDGE, pierce with Heavy Lance, unleash Frost/Lightning Novas, Overdrive [Q], and Solar Cataclysm [R] against multi-phase bosses.',
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
// 2. ZERO-DEPENDENCY WEB AUDIO API COMBAT SFX + AMBIENT PULSE
// -------------------------------------------------------------------------
const sfx = {
  ctx: null,
  master: null,
  muted: false,
  pulseTimer: null,
  pulseStep: 0,
};

function ensureAudio() {
  if (sfx.muted) return null;
  try {
    if (!sfx.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      sfx.ctx = new AudioCtx();
      sfx.master = sfx.ctx.createGain();
      sfx.master.gain.setValueAtTime(0.34, sfx.ctx.currentTime);
      sfx.master.connect(sfx.ctx.destination);
      startAmbientPulse();
    }
    if (sfx.ctx.state === 'suspended') {
      sfx.ctx.resume().catch(() => {});
    }
    return sfx.ctx;
  } catch (_) {
    return null;
  }
}

function startAmbientPulse() {
  if (sfx.pulseTimer) return;
  const bassNotes = [55, 55, 65.41, 73.42, 55, 55, 82.41, 73.42];
  sfx.pulseTimer = setInterval(() => {
    if (sfx.muted || !sfx.ctx || sfx.ctx.state !== 'running') return;
    if (gameState.phase !== 'playing') return;
    try {
      const now = sfx.ctx.currentTime;
      const osc = sfx.ctx.createOscillator();
      const filter = sfx.ctx.createBiquadFilter();
      const gain = sfx.ctx.createGain();

      const freq = bassNotes[sfx.pulseStep % bassNotes.length] * (gameState.boss ? 1.25 : 1);
      sfx.pulseStep++;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(gameState.player.surgeTimer > 0 ? 540 : 240, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.068, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(sfx.master);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }, 250);
}

let cachedNoiseBuffer = null;

function getWhiteNoiseBuffer(ctx) {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const length = Math.floor(ctx.sampleRate * 1.2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
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
// 3. SANCTUM ENVIRONMENT, BLESSINGS & CORE CANVAS HANDLES
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
  {
    id: 'twin_cleave',
    tag: 'BLADE // ARC',
    accent: 'border-orange-400 text-amber-300',
    name: { th: 'Twin Cleave Arc', en: 'Twin Cleave Arc' },
    desc: {
      th: 'ขยายมุมฟันกวาดเสี้ยวพระจันทร์ +35% และเพิ่มความเสียหายฟันอีก +28%',
      en: '+35% wider crescent cleave arc and +28% blade damage',
    },
  },
  {
    id: 'vampiric_edge',
    tag: 'CRIMSON // LEECH',
    accent: 'border-rose-400 text-rose-300',
    name: { th: 'Vampiric Edge', en: 'Vampiric Edge' },
    desc: {
      th: 'ดูดพลังชีวิต +4 ต่อการฟันโดนศัตรู และเพิ่มพลังชีวิตสูงสุด +20',
      en: 'Leech +4 HP per cleave hit and gain +20 Max HP',
    },
  },
  {
    id: 'chain_nova',
    tag: 'EMBER // NOVA',
    accent: 'border-amber-400 text-amber-300',
    name: { th: 'Molten Chain Nova', en: 'Molten Chain Nova' },
    desc: {
      th: 'เพิ่มรัศมีคลื่นโนวา +32% และปล่อยลูกไฟพลังงานเพิ่ม 4 ทิศทาง',
      en: '+32% Nova blast radius and launch 4 radial ember bolts',
    },
  },
  {
    id: 'overclock_cd',
    tag: 'ARC // HASTE',
    accent: 'border-cyan-400 text-cyan-300',
    name: { th: 'Overclocked Phase', en: 'Overclocked Phase' },
    desc: {
      th: 'ลดคูลดาวน์สกิลและฟื้นฟูพริบตาเร็วขึ้น 25% พร้อมความเร็วเดิน +12%',
      en: '25% faster skill/phase cooldowns and +12% move speed',
    },
  },
  {
    id: 'void_piercer',
    tag: 'VOID // CRIT',
    accent: 'border-purple-400 text-purple-300',
    name: { th: 'Void Piercer', en: 'Void Piercer' },
    desc: {
      th: 'หอกหนักทะลวงแรงขึ้น +40% และสร้างคลื่นกระแทกปลายทาง',
      en: '+40% Heavy Lance damage with a shock detonation at impact',
    },
  },
];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Offscreen Dynamic Lightmap Canvas (used by renderer.js)
const lightCanvas = document.createElement('canvas');
const lightCtx = lightCanvas.getContext('2d');

// -------------------------------------------------------------------------
// 4. ARPG EXPANSION: WEAPON ASPECTS [1/2/3], CONSTELLATION [T], FORGE [I]
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
  let crit = 0.15 + getConstellationRank('sol_2') * 0.05;
  if (p.surgeTimer > 0) crit += 0.25;
  return Math.min(0.85, crit);
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
  p.transformAnimTimer = aspectKey === 'volt' ? 1.4 : 0.75;
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

  if (aspectKey === 'solar') {
    gameState.overdriveSigils.push({
      x: p.x,
      y: p.y,
      r: 86,
      rot: 0,
      life: 0.9,
      maxLife: 0.9,
      color: '#ff6a00',
      aspectTag: 'solar',
    });
  }

  spawnSparks(p.x, p.y, asp.color, 18, 250);
  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 14,
    maxR: 112,
    life: 0.26,
    maxLife: 0.26,
    color: asp.color,
    lineWidth: 3.5,
  });
  addFloatingText(p.x, p.y - 32, asp.label, asp.core, 1.08);
  playCombatSfx('surge', 1.08);
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

  // Helper: ไอคอน SVG ประจำแต่ละโหนด
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

  // Helper: ข้อความเปรียบเทียบ Lv.ปัจจุบัน vs Lv.ถัดไป (ไฮไลต์ตัวเลขสีส้มทอง)
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

  // =========================================================================
  // 1. LEFT / CENTER: SYMMETRICAL TRACE MAP + OBSIDIAN CREST WATERMARK
  // =========================================================================
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

  // =========================================================================
  // 2. RIGHT SIDE: CLEAN INSPECTOR PANEL (Lv.CURRENT vs Lv.NEXT)
  // =========================================================================
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