// =========================================================================
// 8. CORE COMBAT, AI, ELEMENTAL REACTIONS, SHRINES & TACTICAL COVER ENGINE
//    OBSIDIAN VANGUARD — FULL EXPANDED MULTI-BIOME SANCTUM EDITION
//    + INTEGRATED WAVE BLESSINGS MODAL, GAME OVER SAVE SYNC & main.js BRIDGE
// =========================================================================

// -------------------------------------------------------------------------
// 8.0 SANCTUM HALL LOBBY CONFIGURATION (GOTHIC HUB BEFORE DUNGEON WARP)
// -------------------------------------------------------------------------
const LOBBY_W = 1280;
const LOBBY_H = 1024;
const LOBBY_SPAWN = { x: 640, y: 810 };
const LOBBY_PORTAL = { x: 640, y: 175, r: 72 };
const LOBBY_DUMMY_POS = { x: 640, y: 500 };

const LOBBY_STATIONS = [
  { x: 250, y: 470, r: 54, kind: 'tree',  label: 'CONSTELLATION [F]', color: '#38bdf8' },
  { x: 1030, y: 470, r: 54, kind: 'forge', label: 'OBSIDIAN FORGE [F]', color: '#fbbf24' },
];

const LOBBY_PILLARS = [
  { x: 350, y: 270, r: 26, phase: 0.4, kind: 'brazier' },
  { x: 930, y: 270, r: 26, phase: 1.8, kind: 'brazier' },
  { x: 310, y: 690, r: 26, phase: 3.1, kind: 'brazier' },
  { x: 970, y: 690, r: 26, phase: 4.5, kind: 'brazier' },
];

window.LOBBY_W = LOBBY_W;
window.LOBBY_H = LOBBY_H;
window.LOBBY_PORTAL = LOBBY_PORTAL;
window.LOBBY_STATIONS = LOBBY_STATIONS;
window.LOBBY_PILLARS = LOBBY_PILLARS;

const gameState = {
  zone: 'lobby', // 'lobby' | 'dungeon'
  transitionTargetZone: null,
  phase: 'title', // 'title' | 'playing' | 'paused' | 'upgrade' | 'arpg_pause' | 'gameover'
  worldTime: 0,
  wave: 1,
  biomeIndex: 0,
  lastBossForm: '',
  score: 0,
  combo: 0,
  maxCombo: 0,
  comboTimer: 0,
  kills: 0,
  bossesDefeated: 0,
  reactionsTriggered: 0,
  shrinesCollected: 0,
  portalOpen: false,
  transitionTimer: 0,
  transitionSwapped: false,
  hitstopTimer: 0,
  chromaticTimer: 0,
  shakeMag: 0,
  shakeDirX: 0,
  shakeDirY: 0,
  ventCycleTimer: 0,
  pendingUpgrades: [],
  camera: { x: ARENA_W * 0.5, y: ARENA_H * 0.5 },
  mouseScreen: { x: 0, y: 0 },
  mouseWorld: { x: ARENA_W * 0.5, y: ARENA_H * 0.5 },
  keys: new Set(),
  mouseDown: false,
  player: null,
  enemies: [],
  boss: null,

  // Effect Arrays (ซิงก์ครบกับ js/renderer.js)
  floorDecals: [],
  loots: [],
  dissolvingCorpses: [],
  afterimages: [],
  slashCrescents: [],
  slashes: [],
  overdriveSigils: [],
  astralRings: [],
  shockwaves: [],
  lightningArcs: [],
  playerBolts: [],
  enemyProjectiles: [],
  iceShards: [],
  sparks: [],
  brazierSmoke: [],
  ambientEmbers: [],
  floatingTexts: [],
};

// -------------------------------------------------------------------------
// 8A. INPUT, PAUSE, MATH, COLLISION & AUDIO/UI HELPERS
// -------------------------------------------------------------------------
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function isKeyPressed(...candidates) {
  const k = gameState.keys;
  if (!k) return false;
  if (typeof k.has === 'function') {
    for (let i = 0; i < candidates.length; i++) {
      if (k.has(candidates[i])) return true;
    }
    return false;
  }
  for (let i = 0; i < candidates.length; i++) {
    if (k[candidates[i]]) return true;
  }
  return false;
}

function togglePause() {
  if (gameState.phase !== 'playing' && gameState.phase !== 'paused') return;
  const pauseEl =
    document.getElementById('overlay-pause') ||
    document.getElementById('pause-overlay') ||
    document.getElementById('pause-modal') ||
    document.getElementById('screen-pause') ||
    document.getElementById('pause-screen');

  if (gameState.phase === 'playing') {
    gameState.phase = 'paused';
    gameState.mouseDown = false;
    if (gameState.keys && typeof gameState.keys.clear === 'function') {
      gameState.keys.clear();
    }
    if (pauseEl) pauseEl.classList.remove('hidden');
  } else {
    gameState.phase = 'playing';
    if (pauseEl) pauseEl.classList.add('hidden');
  }
}
window.togglePause = togglePause;

function playSfx(methodName, ...args) {
  // รองรับทั้งระบบ playCombatSfx / playMusicStinger ใน config.js และ AudioEngine
  if (typeof playCombatSfx === 'function') {
    if (methodName === 'playSlash') { playCombatSfx('cleave', 1.0); return; }
    if (methodName === 'playDash') { playCombatSfx('dodge', 1.0); return; }
    if (methodName === 'playHit') { playCombatSfx('hit', args[0] ? 1.25 : 1.0); return; }
    if (methodName === 'playPlayerHurt') { playCombatSfx('hurt', 1.0); return; }
    if (methodName === 'playPickup') { playCombatSfx('pickup', 1.05); return; }
    if (methodName === 'playOverdrive') { playCombatSfx('overdrive_roar', 1.0); return; }
    if (methodName === 'playPortal') { playCombatSfx('surge', 1.1); return; }
    if (methodName === 'playTransform') {
      const asp = args[0] || 'solar';
      playCombatSfx(asp === 'cryo' ? 'ice_burst' : asp === 'volt' ? 'volt_shock' : 'overdrive_roar', 1.05);
      return;
    }
    if (methodName === 'playSkill') {
      const sk = args[0];
      playCombatSfx(sk === 'lance' ? 'lance' : sk === 'cataclysm' ? 'beam' : 'nova', 1.0);
      return;
    }
    if (methodName === 'playReaction') {
      const rk = args[0];
      playCombatSfx(rk === 'superconduct' ? 'volt_shock' : rk === 'melt' ? 'ice_burst' : 'nova', 1.15);
      return;
    }
  }
  if (typeof playMusicStinger === 'function' && methodName === 'setMusicIntensity') {
    if (args[0] === 'boss') playMusicStinger('boss_intro');
    else if (args[0] === 'boss_enrage') playMusicStinger('boss_phase2');
    else if (args[0] === 'boss_victory') playMusicStinger('boss_victory');
    return;
  }
  if (typeof AudioEngine !== 'undefined' && AudioEngine && typeof AudioEngine[methodName] === 'function') {
    try {
      AudioEngine[methodName](...args);
    } catch (_) {}
  }
}

function pushCombatLog(msg, color = '#94a3b8') {
  if (typeof addCombatLog === 'function') {
    addCombatLog(msg, color);
    return;
  }
  const feed = document.getElementById('combat-log') || document.getElementById('hud-combat-log');
  if (feed) {
    const line = document.createElement('div');
    line.style.color = color;
    line.textContent = `> ${msg}`;
    feed.prepend(line);
    while (feed.children.length > 6) feed.lastElementChild.remove();
  }
}

function getEffectiveCooldownScale() {
  const p = gameState.player;
  if (!p) return 1;
  const baseScale = typeof p.cooldownScale === 'number' ? p.cooldownScale : (p.cdScale || 1);
  const relicCdr = typeof getEquippedRelicStat === 'function' ? Math.min(45, getEquippedRelicStat('cdr')) : 0;
  const overdriveBonus = p.surgeTimer > 0 ? 0.72 : 1;
  return Math.max(0.38, baseScale * (1 - relicCdr / 100) * overdriveBonus);
}

function getPlayerDamageMult() {
  const p = gameState.player;
  if (!p) return 1;
  const forgeMult = 1 + (p.forgeLevel || 0) * 0.16;
  const boonMult = typeof p.dmgMult === 'number' ? p.dmgMult : 1;
  const relicDmg = typeof getEquippedRelicStat === 'function' ? 1 + getEquippedRelicStat('dmg') / 100 : 1;
  const constDmg = typeof getConstellationRank === 'function' ? 1 + getConstellationRank('sol_1') * 0.18 : 1;
  const overdriveMult = p.surgeTimer > 0 ? 1.45 : 1;
  const shrineMult = (p.shrineFuryTimer || 0) > 0 ? 1.18 : 1;
  return forgeMult * boonMult * relicDmg * constDmg * overdriveMult * shrineMult;
}
window.getAttackMultiplier = getPlayerDamageMult;

function getPlayerMoveSpeed() {
  const p = gameState.player;
  if (!p) return 268;
  const aspKey = p.weaponAspect || 'solar';
  const aspSpeed = aspKey === 'volt' ? 1.18 : aspKey === 'cryo' ? 0.98 : 1.02;
  const boonSpeed = typeof p.speedMult === 'number' ? p.speedMult : 1;
  const overdriveSpeed = p.surgeTimer > 0 ? 1.16 : 1;
  const voltBurst = (p.voltHasteTimer || 0) > 0 ? 1.2 : 1;
  return (p.moveSpeed || 268) * aspSpeed * boonSpeed * overdriveSpeed * voltBurst;
}

function getAllActiveFoes() {
  return gameState.boss && gameState.boss.hp > 0
    ? [...gameState.enemies, gameState.boss]
    : gameState.enemies;
}

function resolveEntityArenaAndPillars(ent, pad = 64) {
  let hitPillar = null;
  const isLobby = gameState.zone === 'lobby';
  const maxW = isLobby ? LOBBY_W : ARENA_W;
  const maxH = isLobby ? LOBBY_H : ARENA_H;
  const effPad = isLobby ? 115 : pad;
  ent.x = clamp(ent.x, effPad, maxW - effPad);
  ent.y = clamp(ent.y, isLobby ? 135 : pad + 24, maxH - (isLobby ? 105 : pad));

  const activePillars = isLobby ? LOBBY_PILLARS : (typeof PILLARS !== 'undefined' ? PILLARS : []);
  for (let i = 0; i < activePillars.length; i++) {
    const pil = activePillars[i];
    const minDist = (ent.r || 18) + (pil.r || 30);
    const dx = ent.x - pil.x;
    const dy = ent.y - pil.y;
    const d = Math.hypot(dx, dy);
    if (d < minDist) {
      const nx = d > 0.001 ? dx / d : 1;
      const ny = d > 0.001 ? dy / d : 0;
      ent.x = pil.x + nx * minDist;
      ent.y = pil.y + ny * minDist;
      hitPillar = pil;
    }
  }
  return hitPillar;
}

function checkProjectileHitPillar(x, y, r = 6) {
  const activePillars = gameState.zone === 'lobby' ? LOBBY_PILLARS : (typeof PILLARS !== 'undefined' ? PILLARS : []);
  for (let i = 0; i < activePillars.length; i++) {
    const pil = activePillars[i];
    if (Math.hypot(x - pil.x, y - pil.y) < (pil.r || 30) + r) {
      return pil;
    }
  }
  return null;
}

function hasLineOfSight(x1, y1, x2, y2) {
  if (typeof PILLARS === 'undefined' || PILLARS.length === 0) return true;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1) return true;

  for (let i = 0; i < PILLARS.length; i++) {
    const pil = PILLARS[i];
    const t = clamp(((pil.x - x1) * dx + (pil.y - y1) * dy) / lenSq, 0, 1);
    const px = x1 + t * dx;
    const py = y1 + t * dy;
    const blockR = (pil.r || 30) * 0.88;
    if (Math.hypot(px - pil.x, py - pil.y) < blockR) {
      return false;
    }
  }
  return true;
}

// -------------------------------------------------------------------------
// 8B. VFX & FEEDBACK SPAWNERS
// -------------------------------------------------------------------------
function addCameraShake(mag, dirX = 0, dirY = 0) {
  if (mag > gameState.shakeMag) {
    gameState.shakeMag = Math.min(26, mag);
    const len = Math.hypot(dirX, dirY);
    gameState.shakeDirX = len > 0.01 ? dirX / len : (Math.random() - 0.5);
    gameState.shakeDirY = len > 0.01 ? dirY / len : (Math.random() - 0.5);
  }
}
window.triggerDirectionalShake = addCameraShake;

function triggerHitstop(duration) {
  gameState.hitstopTimer = Math.max(gameState.hitstopTimer, Math.min(0.11, duration));
}

function spawnFloatingText(x, y, text, color = '#ffffff', scale = 1) {
  if (gameState.floatingTexts.length >= 64) {
    gameState.floatingTexts.shift();
  }
  gameState.floatingTexts.push({
    x: x + randRange(-14, 14),
    y: y + randRange(-8, 8),
    vy: -52,
    text,
    color,
    scale,
    alpha: 1,
    life: 0.85,
    maxLife: 0.85,
  });
}

function spawnSparks(x, y, countOrColor, colorOrCount, speedMin = 70, speedMax = 240, size = 2.5) {
  // รองรับทั้งรูปแบบ (x, y, count, color, ...) และ (x, y, color, count, speedMax) จาก config.js
  let count = countOrColor;
  let color = colorOrCount;
  if (typeof countOrColor === 'string') {
    color = countOrColor;
    count = Number.isFinite(colorOrCount) ? colorOrCount : 12;
  }
  for (let i = 0; i < count; i++) {
    if (gameState.sparks.length >= 260) gameState.sparks.shift();
    const a = Math.random() * Math.PI * 2;
    const spd = randRange(speedMin, speedMax);
    const life = randRange(0.22, 0.56);
    gameState.sparks.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      size: randRange(size * 0.7, size * 1.35),
      color: color || '#fbbf24',
      life,
      maxLife: life,
    });
  }
}

function spawnShockwave(x, y, maxR, color = '#ff6a00', lineWidth = 4) {
  if (gameState.shockwaves.length >= 40) gameState.shockwaves.shift();
  gameState.shockwaves.push({
    x,
    y,
    r: 14,
    maxR,
    color,
    lineWidth,
    life: 0.34,
    maxLife: 0.34,
  });
}

function spawnFloorDecal(x, y, r, kind = 'scorch', duration = 12) {
  if (gameState.floorDecals.length >= 120) {
    gameState.floorDecals.shift();
  }
  gameState.floorDecals.push({
    x,
    y,
    r,
    kind,
    rot: Math.random() * Math.PI * 2,
    life: duration,
    maxLife: duration,
  });
}
window.addFloorDecal = spawnFloorDecal;

function spawnLightningArc(x1, y1, x2, y2, color = '#e879f9', width = 3) {
  if (gameState.lightningArcs.length >= 48) gameState.lightningArcs.shift();
  const segs = 6;
  const pts = [{ x: x1, y: y1 }];
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    pts.push({
      x: x1 + (x2 - x1) * t + randRange(-24, 24),
      y: y1 + (y2 - y1) * t + randRange(-24, 24),
    });
  }
  pts.push({ x: x2, y: y2 });
  gameState.lightningArcs.push({
    pts,
    color,
    width,
    life: 0.24,
    maxLife: 0.24,
  });
}
window.spawnLightningBranch = spawnLightningArc;

function spawnSlashArc(x, y, radius, angle, halfArc, color, life = 0.2) {
  gameState.slashes.push({
    x,
    y,
    radius,
    angle,
    halfArc,
    color,
    life,
    maxLife: life,
  });
}

function spawnSlashCrescent(x, y, angle, halfArc, innerR, outerR, color, coreColor, life = 0.2) {
  gameState.slashCrescents.push({
    x,
    y,
    angle,
    halfArc,
    innerR,
    outerR,
    color,
    coreColor,
    life,
    maxLife: life,
  });
}

// -------------------------------------------------------------------------
// 8C. PLAYER CREATION & WEAPON ASPECT SWITCHING (SOLAR / CRYO / VOLT)
// -------------------------------------------------------------------------
function createInitialPlayer() {
  const startX = ARENA_W * 0.5;
  const startY = ARENA_H * 0.5 + 150;
  const scarf = [];
  for (let i = 0; i < 6; i++) scarf.push({ x: startX, y: startY + i * 6 });

  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    r: 18,
    hp: 150,
    maxHp: 150,
    blessingHpBonus: 50,
    shield: 0,
    baseDamage: 32,
    moveSpeed: 268,
    weaponAspect: 'solar', // 'solar' | 'cryo' | 'volt'
    aimAngle: 0,
    swordSwingOffset: 0,
    swingDir: 1,
    comboStep: 0,
    comboResetTimer: 0,
    attackCd: 0,
    invulnTimer: 0,

    // Dash
    dashCharges: 2,
    maxDashCharges: 2,
    dashRegenTimer: 0,
    dashRegenDuration: 2.1,
    dashTimer: 0,
    dashDirX: 1,
    dashDirY: 0,

    // Skills & Overdrive
    surgeGauge: 0,
    surgeTimer: 0,
    surgeDuration: 7.5,
    surgeCd: 0,
    surgeMaxCd: 9.0,
    lanceCd: 0,
    lanceMaxCd: 3.3,
    novaCd: 0,
    novaMaxCd: 6.4,
    cataclysmCd: 0,
    cataclysmMaxCd: 13.0,

    // Progression & Derived Stats
    skillPoints: 0,
    shards: 0,
    forgeLevel: 0,
    dmgMult: 1,
    critChance: 0.16,
    critBonus: 0,
    critMult: 1.75,
    cooldownScale: 1,
    cdScale: 1,
    speedMult: 1,
    lifeSteal: 0,
    shardBonus: 0,
    reactionMult: 1,
    dashShield: 0,
    shiftBurstLevel: 0,
    shiftHealCd: 0,
    equippedRelics: [],
    inventoryRelics: [],
    unlockedNodes: {},

    // Visual, Buff & Terrain States
    transformAnimTimer: 0,
    transformAnimMax: 1.15,
    shrineFuryTimer: 0,
    voltHasteTimer: 0,
    inIcePool: false,
    lavaTick: 0,
    springTick: 0,
    scarf,
  };
}

function initAmbientEmbers() {
  gameState.ambientEmbers.length = 0;
  for (let i = 0; i < 85; i++) {
    gameState.ambientEmbers.push({
      x: randRange(90, ARENA_W - 90),
      y: randRange(90, ARENA_H - 90),
      phase: Math.random() * Math.PI * 2,
      cyan: (gameState.biomeIndex % 4 === 2) ? i % 4 !== 0 : i % 3 === 0,
    });
  }
}

function switchWeaponAspect(aspectKey) {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing') return;
  if (!['solar', 'cryo', 'volt'].includes(aspectKey)) return;
  if (p.weaponAspect === aspectKey) return;

  p.weaponAspect = aspectKey;
  p.comboStep = 0;
  p.transformAnimMax = aspectKey === 'volt' ? 1.45 : 1.15;
  p.transformAnimTimer = p.transformAnimMax;

  // อัปเดตไฮไลต์ปุ่มสลับร่างบน HUD
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

  const col = aspectKey === 'solar' ? '#ff6a00' : aspectKey === 'cryo' ? '#22d3ee' : '#e879f9';
  const elem = getActiveElementKey(aspectKey);
  const shiftLvl = p.shiftBurstLevel || 0;
  const dmg = Math.round((18 + shiftLvl * 16) * getPlayerDamageMult());

  spawnFloorDecal(p.x, p.y, 82, `crack_${aspectKey}`, 14);
  spawnShockwave(p.x, p.y, 150, col, 5.5);
  spawnSparks(p.x, p.y, 30, col, 95, 310, 3.2);
  addCameraShake(10, 0, 1);
  playSfx('playTransform', aspectKey);

  const foes = getAllActiveFoes();
  if (aspectKey === 'cryo') {
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2;
      gameState.iceShards.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(a) * 360,
        vy: Math.sin(a) * 360,
        r: 8,
        dmg: Math.round(dmg * 0.7),
        life: 0.45,
        maxLife: 0.45,
      });
    }
  } else if (aspectKey === 'volt') {
    p.voltHasteTimer = 1.6;
    let struck = 0;
    for (let i = 0; i < foes.length && struck < 3; i++) {
      const en = foes[i];
      if (en.hp > 0 && Math.hypot(en.x - p.x, en.y - p.y) < 230) {
        spawnLightningArc(p.x, p.y - 120, en.x, en.y, '#e879f9', 3.5);
        damageEnemy(en, dmg, 'volt', false, 0, 0);
        struck++;
      }
    }
  }

  for (let i = 0; i < foes.length; i++) {
    const en = foes[i];
    if (en.hp <= 0) continue;
    const d = Math.hypot(en.x - p.x, en.y - p.y);
    if (d < 155) {
      const a = Math.atan2(en.y - p.y, en.x - p.x);
      damageEnemy(en, dmg, elem, false, Math.cos(a) * 210, Math.sin(a) * 210);
    }
  }

  if (shiftLvl > 0 && (p.shiftHealCd || 0) <= 0) {
    const healAmt = 6 * shiftLvl;
    p.hp = Math.min(p.maxHp, p.hp + healAmt);
    p.shiftHealCd = 3.0;
    spawnFloatingText(p.x, p.y - 54, `+${healAmt} HP`, '#38bdf8', 1.0);
  }

  const label = aspectKey === 'solar' ? 'SOLAR CLEAVE' : aspectKey === 'cryo' ? 'CRYO LANCE' : 'VOLT REAPER';
  spawnFloatingText(p.x, p.y - 38, label, col, 1.18);
}
window.switchWeaponAspect = switchWeaponAspect;
window.selectWeaponAspect = switchWeaponAspect;
window.setWeaponAspect = switchWeaponAspect;

// -------------------------------------------------------------------------
// 8D. ELEMENTAL REACTIONS & DAMAGE PIPELINE
// -------------------------------------------------------------------------
function getActiveElementKey(aspKey) {
  if (aspKey === 'cryo') return 'ice';
  if (aspKey === 'volt') return 'volt';
  return 'fire';
}

function triggerElementalReaction(target, incomingEl, baseDmg) {
  const p = gameState.player;
  const rMult = p ? (p.reactionMult || 1) : 1;

  const hasFire = (target.burnTimer || 0) > 0 || target.element === 'fire';
  const hasIce = (target.slowTimer || 0) > 0 || target.element === 'ice';
  const hasVolt = (target.shockTimer || 0) > 0 || target.element === 'volt';

  // 1. MELT (Fire + Ice)
  if ((incomingEl === 'fire' && hasIce) || (incomingEl === 'ice' && hasFire)) {
    target.burnTimer = 0;
    target.slowTimer = 0;
    gameState.reactionsTriggered++;
    const bonus = Math.round((baseDmg * 0.9 + 26) * rMult);
    spawnShockwave(target.x, target.y, 120, '#fbbf24', 5.5);
    spawnSparks(target.x, target.y, 20, '#67e8f9', 100, 270, 3);
    spawnSparks(target.x, target.y, 14, '#ff6a00', 80, 220, 2.8);
    spawnFloatingText(target.x, target.y - 28, `MELT! +${bonus}`, '#fde047', 1.32);
    addCameraShake(8.5, 0, 1);
    playSfx('playReaction', 'melt');
    return bonus;
  }

  // 2. OVERLOAD (Fire + Volt)
  if ((incomingEl === 'fire' && hasVolt) || (incomingEl === 'volt' && hasFire)) {
    target.burnTimer = 0;
    target.shockTimer = 0;
    gameState.reactionsTriggered++;
    const aoeDmg = Math.round((baseDmg * 0.76 + 30) * rMult);
    spawnShockwave(target.x, target.y, 175, '#ff2a5f', 6.5);
    spawnFloorDecal(target.x, target.y, 62, 'scorch', 10);
    spawnSparks(target.x, target.y, 28, '#e879f9', 120, 340, 3.2);
    spawnFloatingText(target.x, target.y - 28, `OVERLOAD! ${aoeDmg}`, '#fb7185', 1.36);
    addCameraShake(11.5, 1, 0);
    playSfx('playReaction', 'overload');

    if (target.chargeTimer > 0) {
      target.chargeTimer = 0;
      target.stunTimer = Math.max(target.stunTimer || 0, 0.9);
    }

    const foes = getAllActiveFoes();
    for (let i = 0; i < foes.length; i++) {
      const other = foes[i];
      if (other === target || other.hp <= 0) continue;
      const d = Math.hypot(other.x - target.x, other.y - target.y);
      if (d <= 175) {
        const ang = Math.atan2(other.y - target.y, other.x - target.x);
        other.hp -= aoeDmg;
        other.hitFlash = 0.14;
        other.vx += Math.cos(ang) * 280;
        other.vy += Math.sin(ang) * 280;
        if (other.hp <= 0) handleEnemyDeath(other, other === gameState.boss);
      }
    }
    return aoeDmg;
  }

  // 3. SUPERCONDUCT (Ice + Volt)
  if ((incomingEl === 'ice' && hasVolt) || (incomingEl === 'volt' && hasIce)) {
    target.slowTimer = 0;
    target.shockTimer = 0;
    target.vulnTimer = 6.5;
    gameState.reactionsTriggered++;
    const chainDmg = Math.round((baseDmg * 0.62 + 22) * rMult);
    spawnShockwave(target.x, target.y, 155, '#38bdf8', 5);
    spawnFloatingText(target.x, target.y - 28, `SUPERCONDUCT!`, '#67e8f9', 1.28);
    addCameraShake(7.5, 0, -1);
    playSfx('playReaction', 'superconduct');

    let jumped = 0;
    const foes = getAllActiveFoes();
    for (let i = 0; i < foes.length && jumped < 4; i++) {
      const other = foes[i];
      if (other === target || other.hp <= 0) continue;
      if (Math.hypot(other.x - target.x, other.y - target.y) <= 250) {
        other.hp -= chainDmg;
        other.vulnTimer = 5.5;
        other.hitFlash = 0.12;
        spawnLightningArc(target.x, target.y, other.x, other.y, '#67e8f9', 3.4);
        if (other.hp <= 0) handleEnemyDeath(other, other === gameState.boss);
        jumped++;
      }
    }
    return chainDmg;
  }

  if (incomingEl === 'fire') target.burnTimer = Math.max(target.burnTimer || 0, 4.2);
  if (incomingEl === 'ice') target.slowTimer = Math.max(target.slowTimer || 0, 4.4);
  if (incomingEl === 'volt') target.shockTimer = Math.max(target.shockTimer || 0, 4.2);
  return 0;
}
window.applyElementalAura = triggerElementalReaction;

function damageEnemy(en, rawDmg, elem = 'fire', forceCrit = false, knockX = 0, knockY = 0) {
  if (!en || en.hp <= 0) return;
  const p = gameState.player;
  const isBoss = en === gameState.boss;

  const critRate = typeof getEffectiveCritChance === 'function'
    ? Math.max(p ? p.critChance : 0.16, getEffectiveCritChance())
    : (p ? p.critChance : 0.16);
  const isCrit = forceCrit || (p && Math.random() < critRate);
  let dmg = rawDmg * (isCrit ? (p ? p.critMult : 1.75) : 1);
  if ((en.vulnTimer || 0) > 0) dmg *= 1.35;
  if ((en.stunTimer || 0) > 0) dmg *= 1.2;

  if (en.element && en.element !== 'normal') {
    if (en.element === elem) dmg *= 0.85;
    else dmg *= 1.14;
  }

  dmg = Math.max(1, Math.round(dmg));
  const reactBonus = triggerElementalReaction(en, elem, dmg);
  const totalDmg = dmg + reactBonus;

  en.hp -= totalDmg;
  en.hitFlash = 0.12;
  en.squash = 0.72;

  const kbScale = isBoss ? 0.14 : en.type === 'juggernaut' ? 0.32 : 1;
  en.vx = (en.vx || 0) + knockX * kbScale;
  en.vy = (en.vy || 0) + knockY * kbScale;

  const col = isCrit ? '#fef08a' : elem === 'ice' ? '#67e8f9' : elem === 'volt' ? '#f0abfc' : '#fb923c';
  spawnFloatingText(en.x, en.y - 10, isCrit ? `${dmg}!` : `${dmg}`, col, isCrit ? 1.25 : 0.95);
  spawnSparks(en.x, en.y, isCrit ? 12 : 6, col, 60, 215, isCrit ? 3.1 : 2.2);

  if (p) {
    if (p.surgeTimer <= 0 && (p.surgeCd || 0) <= 0) {
      const conduitMult = typeof getConstellationRank === 'function' ? 1 + getConstellationRank('vlt_2') * 0.18 : 1;
      p.surgeGauge = Math.min(100, p.surgeGauge + (isCrit ? 4.8 : 2.6) * conduitMult);
    }
    if ((p.lifeSteal || 0) > 0) {
      p.hp = Math.min(p.maxHp, p.hp + totalDmg * p.lifeSteal);
    }
  }

  gameState.combo++;
  if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
  gameState.comboTimer = 3.4;

  if (isCrit) {
    triggerHitstop(0.032);
    addCameraShake(5.5, knockX, knockY);
  }
  playSfx('playHit', isCrit);

  if (isBoss && en.phase === 1 && en.hp > 0 && en.hp <= en.maxHp * 0.5) {
    en.phase = 2;
    en.speed *= 1.24;
    en.telegraph = null;
    spawnShockwave(en.x, en.y, 310, '#ff2a5f', 7.5);
    spawnFloatingText(en.x, en.y - 44, 'PHASE 2: ENRAGE!', '#ff2a5f', 1.48);
    addCameraShake(16, 0, 1);
    gameState.chromaticTimer = 0.36;
    playSfx('setMusicIntensity', 'boss_enrage');
    pushCombatLog(`${en.name} entered ENRAGE Phase!`, '#ff2a5f');
  }

  if (en.hp <= 0) {
    handleEnemyDeath(en, isBoss);
  }
}

function handleEnemyDeath(en, isBoss) {
  if (en.isDummy) {
    en.hp = en.maxHp;
    return;
  }
  if (en._deadHandled) return;
  en._deadHandled = true;

  gameState.kills++;
  const basePts = isBoss ? 1250 : en.type === 'juggernaut' ? 240 : en.type === 'stalker' ? 160 : 110;
  gameState.score += Math.round(basePts * (1 + Math.min(4, gameState.combo * 0.06)));

  const p = gameState.player;
  if (p) {
    const leechOnKill = typeof getEquippedRelicStat === 'function' ? getEquippedRelicStat('leech') : 0;
    if (leechOnKill > 0) p.hp = Math.min(p.maxHp, p.hp + leechOnKill);
  }

  gameState.dissolvingCorpses.push({ x: en.x, y: en.y, life: 0.55, maxLife: 0.55 });
  spawnSparks(en.x, en.y, isBoss ? 52 : 16, isBoss ? '#ff2a5f' : '#ff6a00', 80, isBoss ? 370 : 240, isBoss ? 4.2 : 2.8);

  if (isBoss) {
    gameState.bossesDefeated++;
    spawnShockwave(en.x, en.y, 340, '#fbbf24', 8.5);
    addCameraShake(20, 0, 1);
    triggerHitstop(0.09);
    gameState.chromaticTimer = 0.4;
    for (let i = 0; i < 6; i++) {
      gameState.loots.push({
        x: en.x + randRange(-60, 60),
        y: en.y + randRange(-50, 50),
        kind: i < 2 ? 'heal' : i < 4 ? 'surge' : 'shard',
        life: 26,
      });
    }
    if (p && typeof rollArpgRelic === 'function') {
      p.inventoryRelics = p.inventoryRelics || [];
      const dropRel = rollArpgRelic();
      p.inventoryRelics.push(dropRel);
      pushCombatLog(`BOSS DROPPED RELIC: ${dropRel.name}!`, '#fbbf24');
    }
    pushCombatLog(`DEFEATED ${en.name}!`, '#fbbf24');
    gameState.boss = null;
    playSfx('setMusicIntensity', 'boss_victory');
  } else {
    const roll = Math.random();
    if (roll < 0.14) {
      gameState.loots.push({ x: en.x, y: en.y, kind: 'heal', life: 18 });
    } else if (roll < 0.28) {
      gameState.loots.push({ x: en.x, y: en.y, kind: 'surge', life: 18 });
    } else if (roll < 0.44) {
      gameState.loots.push({ x: en.x, y: en.y, kind: 'shard', life: 18 });
    }
  }
}

function damagePlayer(rawDmg, srcX, srcY) {
  const p = gameState.player;
  if (!p || p.invulnTimer > 0 || p.dashTimer > 0 || gameState.phase !== 'playing') return;

  let dmg = Math.max(1, Math.round(rawDmg));
  if ((p.shield || 0) > 0) {
    const absorbed = Math.min(p.shield, dmg);
    p.shield -= absorbed;
    dmg -= absorbed;
  }

  if (dmg > 0) {
    p.hp = Math.max(0, p.hp - dmg);
    spawnFloatingText(p.x, p.y - 24, `-${dmg}`, '#ff2a5f', 1.15);
  } else {
    spawnFloatingText(p.x, p.y - 24, 'BLOCKED', '#38bdf8', 1.0);
  }

  p.invulnTimer = 0.62;
  const ang = Math.atan2(p.y - srcY, p.x - srcX);
  p.vx += Math.cos(ang) * 230;
  p.vy += Math.sin(ang) * 230;

  addCameraShake(11, Math.cos(ang), Math.sin(ang));
  gameState.chromaticTimer = 0.25;
  spawnSparks(p.x, p.y, 14, '#ff2a5f', 90, 240, 3);
  playSfx('playPlayerHurt');

  if (p.hp <= 0) {
    gameState.phase = 'gameover';
    gameState.mouseDown = false;
    if (gameState.keys && typeof gameState.keys.clear === 'function') gameState.keys.clear();
    syncSaveAndGameOverStats(gameState.wave, gameState.score, gameState.kills);
  }
}

// -------------------------------------------------------------------------
// 8E. PLAYER 3-HIT WEAPON COMBOS & ASPECT-SPECIFIC SKILLS
// -------------------------------------------------------------------------
function performPrimaryAttack() {
  const p = gameState.player;
  if (!p || p.attackCd > 0 || gameState.phase !== 'playing') return;

  const aspKey = p.weaponAspect || 'solar';
  const elem = getActiveElementKey(aspKey);
  const mult = getPlayerDamageMult();

  const step = p.comboStep || 0;
  const isFinisher = step === 2;
  p.comboStep = (step + 1) % 3;
  p.comboResetTimer = 1.1;

  const cdBase = aspKey === 'volt' ? 0.23 : aspKey === 'cryo' ? 0.33 : 0.40;
  p.attackCd = cdBase * (isFinisher ? 1.18 : 1.0) * (p.surgeTimer > 0 ? 0.78 : 1);
  p.swingDir = (p.swingDir || 1) * -1;
  p.swordSwingOffset = p.swingDir * (isFinisher ? 1.42 : 1.12);

  const extraReach = Math.min(30, (p.forgeLevel || 0) * 4);
  const radius = (aspKey === 'solar' ? 130 : aspKey === 'cryo' ? 142 : 120) + extraReach + (isFinisher ? 22 : 0);
  const halfArc = aspKey === 'solar'
    ? (isFinisher ? 1.48 : 1.15)
    : aspKey === 'cryo'
    ? (isFinisher ? 0.92 : 0.68)
    : (isFinisher ? 1.55 : 1.05);

  const stepMult = isFinisher ? 1.42 : step === 1 ? 1.08 : 1.0;
  const baseDmg = Math.round((aspKey === 'solar' ? 38 : aspKey === 'cryo' ? 31 : 24) * mult * stepMult);
  const col = aspKey === 'solar' ? '#ff6a00' : aspKey === 'cryo' ? '#22d3ee' : '#c084fc';
  const coreCol = aspKey === 'solar' ? '#fef08a' : aspKey === 'cryo' ? '#f0f9ff' : '#fae8ff';

  spawnSlashCrescent(p.x, p.y, p.aimAngle, halfArc, radius * 0.44, radius, col, coreCol, isFinisher ? 0.22 : 0.17);
  if (isFinisher) {
    spawnSlashArc(p.x, p.y, radius * 0.92, p.aimAngle, halfArc, coreCol, 0.22);
    addCameraShake(6.5, Math.cos(p.aimAngle), Math.sin(p.aimAngle));
  }

  p.vx += Math.cos(p.aimAngle) * (isFinisher ? 165 : 105);
  p.vy += Math.sin(p.aimAngle) * (isFinisher ? 165 : 105);
  playSfx('playSlash', aspKey);

  if (isFinisher) {
    const fxX = p.x + Math.cos(p.aimAngle) * (radius * 0.65);
    const fxY = p.y + Math.sin(p.aimAngle) * (radius * 0.65);
    if (aspKey === 'solar') {
      spawnShockwave(fxX, fxY, 125, '#ff6a00', 5);
      spawnFloorDecal(fxX, fxY, 48, 'scorch', 8);
    } else if (aspKey === 'cryo') {
      for (let k = -1; k <= 1; k++) {
        const a = p.aimAngle + k * 0.22;
        gameState.iceShards.push({
          x: p.x + Math.cos(a) * 24,
          y: p.y + Math.sin(a) * 24,
          vx: Math.cos(a) * 520,
          vy: Math.sin(a) * 520,
          r: 9,
          dmg: Math.round(baseDmg * 0.45),
          life: 0.55,
          maxLife: 0.55,
        });
      }
    } else if (aspKey === 'volt') {
      spawnShockwave(p.x, p.y, 130, '#e879f9', 4);
    }
  }

  const foes = getAllActiveFoes();
  let voltChained = 0;
  for (let i = 0; i < foes.length; i++) {
    const en = foes[i];
    if (en.hp <= 0) continue;
    const dx = en.x - p.x;
    const dy = en.y - p.y;
    const d = Math.hypot(dx, dy);
    if (d <= radius + (en.r || 18)) {
      const diff = Math.abs(angleDiff(Math.atan2(dy, dx), p.aimAngle));
      if (diff <= halfArc + 0.22) {
        const kb = (aspKey === 'solar' ? 250 : aspKey === 'cryo' ? 155 : 120) * (isFinisher ? 1.3 : 1);
        damageEnemy(en, baseDmg, elem, isFinisher && p.surgeTimer > 0, Math.cos(p.aimAngle) * kb, Math.sin(p.aimAngle) * kb);

        if (aspKey === 'volt' && isFinisher && voltChained < 2) {
          for (let j = 0; j < foes.length; j++) {
            const nxt = foes[j];
            if (nxt === en || nxt.hp <= 0) continue;
            if (Math.hypot(nxt.x - en.x, nxt.y - en.y) < 190) {
              spawnLightningArc(en.x, en.y, nxt.x, nxt.y, '#e879f9', 2.8);
              damageEnemy(nxt, Math.round(baseDmg * 0.48), 'volt', false, 0, 0);
              voltChained++;
              break;
            }
          }
        }
      }
    }
  }
}
window.performPrimaryAttack = performPrimaryAttack;
window.triggerPrimaryAttack = performPrimaryAttack;

function performPhaseDash() {
  const p = gameState.player;
  if (!p || p.dashCharges <= 0 || p.dashTimer > 0 || gameState.phase !== 'playing') return;

  let dx = 0;
  let dy = 0;
  if (isKeyPressed('KeyW', 'w', 'W', 'ArrowUp', 'arrowup')) { dx -= 1; dy -= 1; }
  if (isKeyPressed('KeyS', 's', 'S', 'ArrowDown', 'arrowdown')) { dx += 1; dy += 1; }
  if (isKeyPressed('KeyA', 'a', 'A', 'ArrowLeft', 'arrowleft')) { dx -= 1; dy += 1; }
  if (isKeyPressed('KeyD', 'd', 'D', 'ArrowRight', 'arrowright')) { dx += 1; dy -= 1; }

  const len = Math.hypot(dx, dy);
  if (len > 0.01) {
    p.dashDirX = dx / len;
    p.dashDirY = dy / len;
  } else {
    p.dashDirX = Math.cos(p.aimAngle);
    p.dashDirY = Math.sin(p.aimAngle);
  }

  p.dashCharges--;
  p.dashTimer = 0.21;
  p.invulnTimer = Math.max(p.invulnTimer, 0.3);
  if ((p.dashShield || 0) > 0) {
    p.shield = Math.min(p.maxHp * 0.5, (p.shield || 0) + p.dashShield);
  }

  const aspKey = p.weaponAspect || 'solar';
  const col = aspKey === 'solar' ? '#ff6a00' : aspKey === 'cryo' ? '#67e8f9' : '#e879f9';
  spawnSparks(p.x, p.y, 14, col, 65, 210, 2.6);

  if (aspKey === 'cryo') {
    spawnFloorDecal(p.x, p.y, 52, 'frost', 5);
    const foes = getAllActiveFoes();
    for (let i = 0; i < foes.length; i++) {
      if (Math.hypot(foes[i].x - p.x, foes[i].y - p.y) < 115) {
        foes[i].slowTimer = Math.max(foes[i].slowTimer || 0, 2.8);
      }
    }
  } else if (aspKey === 'volt') {
    const foes = getAllActiveFoes();
    for (let i = 0; i < foes.length; i++) {
      if (foes[i].hp > 0 && Math.hypot(foes[i].x - p.x, foes[i].y - p.y) < 185) {
        spawnLightningArc(p.x, p.y, foes[i].x, foes[i].y, '#e879f9', 2.8);
        damageEnemy(foes[i], Math.round(16 * getPlayerDamageMult()), 'volt', false, 0, 0);
        break;
      }
    }
  }

  playSfx('playDash');
}
window.performPhaseDash = performPhaseDash;
window.triggerDash = performPhaseDash;
window.triggerPhaseDash = performPhaseDash;

function castLanceSkill() {
  const p = gameState.player;
  if (!p || p.lanceCd > 0 || gameState.phase !== 'playing') return;

  const aspKey = p.weaponAspect || 'solar';
  const elem = getActiveElementKey(aspKey);
  const col = aspKey === 'solar' ? '#ff6a00' : aspKey === 'cryo' ? '#22d3ee' : '#e879f9';
  const dmg = Math.round((aspKey === 'solar' ? 58 : aspKey === 'cryo' ? 50 : 42) * getPlayerDamageMult());

  p.lanceCd = p.lanceMaxCd * getEffectiveCooldownScale();
  const baseCount = aspKey === 'volt' ? 2 : 1;
  const count = p.surgeTimer > 0 ? baseCount + 2 : baseCount;
  const spread = aspKey === 'volt' ? 0.14 : 0.17;

  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) * 0.5) * spread;
    const ang = p.aimAngle + offset;
    gameState.playerBolts.push({
      x: p.x + Math.cos(ang) * 20,
      y: p.y + Math.sin(ang) * 20,
      vx: Math.cos(ang) * (aspKey === 'cryo' ? 860 : 750),
      vy: Math.sin(ang) * (aspKey === 'cryo' ? 860 : 750),
      r: aspKey === 'solar' ? 14 : 11,
      dmg,
      color: col,
      element: elem,
      explosive: aspKey === 'solar',
      chainOnHit: aspKey === 'volt',
      pierce: aspKey === 'cryo' ? 4 : 1,
      hitIds: new Set(),
      life: 1.5,
    });
  }

  addCameraShake(5.5, -Math.cos(p.aimAngle), -Math.sin(p.aimAngle));
  playSfx('playSkill', 'lance');
}
window.castLanceSkill = castLanceSkill;
window.castSkillLance = castLanceSkill;

function castNovaSkill() {
  const p = gameState.player;
  if (!p || p.novaCd > 0 || gameState.phase !== 'playing') return;

  const aspKey = p.weaponAspect || 'solar';
  const elem = getActiveElementKey(aspKey);
  const col = aspKey === 'solar' ? '#ff6a00' : aspKey === 'cryo' ? '#38bdf8' : '#d946ef';
  const radius = aspKey === 'solar' ? 245 : aspKey === 'cryo' ? 235 : 255;
  const dmg = Math.round((aspKey === 'solar' ? 72 : 62) * getPlayerDamageMult());

  p.novaCd = p.novaMaxCd * getEffectiveCooldownScale();
  spawnShockwave(p.x, p.y, radius, col, 7.5);
  spawnFloorDecal(p.x, p.y, 102, aspKey === 'cryo' ? 'frost' : aspKey === 'volt' ? 'shock' : 'scorch', 11);
  gameState.astralRings.push({ x: p.x, y: p.y, r: radius * 0.9, rot: 0, color: col, life: 0.48, maxLife: 0.48 });
  spawnSparks(p.x, p.y, 38, col, 120, 350, 3.2);
  addCameraShake(12.5, 0, 1);
  playSfx('playSkill', 'nova');

  if (aspKey === 'cryo') {
    for (let s = 0; s < 12; s++) {
      const a = (s / 12) * Math.PI * 2;
      gameState.iceShards.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(a) * 460,
        vy: Math.sin(a) * 460,
        r: 9,
        dmg: Math.round(dmg * 0.44),
        life: 0.68,
        maxLife: 0.68,
      });
    }
  } else if (aspKey === 'volt') {
    p.voltHasteTimer = Math.max(p.voltHasteTimer || 0, 2.4);
  }

  const foes = getAllActiveFoes();
  for (let i = 0; i < foes.length; i++) {
    const en = foes[i];
    if (en.hp <= 0) continue;
    const d = Math.hypot(en.x - p.x, en.y - p.y);
    if (d <= radius + (en.r || 18)) {
      const a = Math.atan2(en.y - p.y, en.x - p.x);
      if (aspKey === 'volt') {
        spawnLightningArc(p.x, p.y, en.x, en.y, '#e879f9', 3.2);
      }
      damageEnemy(en, dmg, elem, false, Math.cos(a) * 330, Math.sin(a) * 330);
    }
  }
}
window.castNovaSkill = castNovaSkill;
window.castSkillNova = castNovaSkill;

function activateOverdrive() {
  const p = gameState.player;
  if (!p || p.surgeTimer > 0 || (p.surgeCd || 0) > 0 || gameState.phase !== 'playing') return;

  if (p.surgeGauge < 100) {
    const bloodCost = Math.round(p.maxHp * 0.2);
    if (p.hp <= bloodCost + 10) {
      spawnFloatingText(p.x, p.y - 28, 'LOW HP!', '#ff2a5f', 1.05);
      return;
    }
    p.hp -= bloodCost;
    spawnFloatingText(p.x, p.y - 44, `BLOOD OVERDRIVE (-${bloodCost} HP)`, '#ff2a5f', 1.22);
    pushCombatLog(`Sacrificed ${bloodCost} HP to ignite Blood Overdrive!`, '#ff2a5f');
  } else {
    spawnFloatingText(p.x, p.y - 38, 'OVERDRIVE UNLEASHED!', '#fbbf24', 1.35);
    pushCombatLog('Overdrive unleashed!', '#fbbf24');
  }

  p.surgeGauge = 0;
  p.surgeTimer = p.surgeDuration;
  p.surgeCd = p.surgeMaxCd * getEffectiveCooldownScale();
  p.invulnTimer = Math.max(p.invulnTimer, 0.58);

  gameState.overdriveSigils.push({ x: p.x, y: p.y, r: 140, rot: 0, life: p.surgeDuration, maxLife: p.surgeDuration });
  spawnShockwave(p.x, p.y, 270, '#ffb800', 8);
  spawnSparks(p.x, p.y, 44, '#fef08a', 130, 380, 3.6);
  addCameraShake(14, 0, -1);
  gameState.chromaticTimer = 0.28;
  playSfx('playOverdrive');
}
window.activateOverdrive = activateOverdrive;
window.triggerOverdrive = activateOverdrive;

function castCataclysmSkill() {
  const p = gameState.player;
  if (!p || p.cataclysmCd > 0 || gameState.phase !== 'playing') return;

  const aspKey = p.weaponAspect || 'solar';
  const elem = getActiveElementKey(aspKey);
  const col = aspKey === 'solar' ? '#ff6a00' : aspKey === 'cryo' ? '#38bdf8' : '#e879f9';
  const tx = clamp(gameState.mouseWorld.x, 80, ARENA_W - 80);
  const ty = clamp(gameState.mouseWorld.y, 100, ARENA_H - 80);
  const radius = 265;
  const dmg = Math.round(135 * getPlayerDamageMult());

  p.cataclysmCd = p.cataclysmMaxCd * getEffectiveCooldownScale();
  spawnShockwave(tx, ty, radius, col, 9);
  spawnShockwave(tx, ty, radius * 0.6, '#fef08a', 5);
  spawnFloorDecal(tx, ty, 118, `crack_${aspKey}`, 16);
  gameState.astralRings.push({ x: tx, y: ty, r: radius * 0.88, rot: 0, color: '#fef08a', life: 0.72, maxLife: 0.72 });
  spawnSparks(tx, ty, 58, col, 140, 440, 3.8);
  addCameraShake(19, 0, 1);
  triggerHitstop(0.065);
  gameState.chromaticTimer = 0.32;
  playSfx('playSkill', 'cataclysm');

  if (aspKey === 'cryo') {
    for (let s = 0; s < 16; s++) {
      const a = (s / 16) * Math.PI * 2;
      gameState.iceShards.push({
        x: tx,
        y: ty,
        vx: Math.cos(a) * 480,
        vy: Math.sin(a) * 480,
        r: 10,
        dmg: Math.round(dmg * 0.35),
        life: 0.75,
        maxLife: 0.75,
      });
    }
  } else if (aspKey === 'volt') {
    for (let b = 0; b < 5; b++) {
      const bx = tx + randRange(-95, 95);
      const by = ty + randRange(-70, 70);
      spawnLightningArc(bx, by - 260, bx, by, '#e879f9', 5);
    }
  }

  const foes = getAllActiveFoes();
  for (let i = 0; i < foes.length; i++) {
    const en = foes[i];
    if (en.hp <= 0) continue;
    const d = Math.hypot(en.x - tx, en.y - ty);
    if (d <= radius + (en.r || 18)) {
      const a = Math.atan2(en.y - ty, en.x - tx);
      damageEnemy(en, dmg, elem, true, Math.cos(a) * 400, Math.sin(a) * 400);
    }
  }
}
window.castCataclysmSkill = castCataclysmSkill;
window.castSkillCataclysm = castCataclysmSkill;

// -------------------------------------------------------------------------
// 8F. ENVIRONMENTAL TACTICS (THERMAL VENTS, ELEMENTAL POOLS & SHRINES)
// -------------------------------------------------------------------------
function updateThermalVents(dt) {
  if (typeof THERMAL_VENTS === 'undefined' || THERMAL_VENTS.length === 0) return;

  gameState.ventCycleTimer += dt;
  if (gameState.ventCycleTimer >= 6.5) {
    gameState.ventCycleTimer = 0;
    const p = gameState.player;
    const foes = getAllActiveFoes();

    for (let v = 0; v < THERMAL_VENTS.length; v++) {
      const vent = THERMAL_VENTS[v];
      spawnShockwave(vent.x, vent.y, 105, '#ff6a00', 4.5);
      spawnSparks(vent.x, vent.y, 16, '#fbbf24', 80, 240, 2.8);

      for (let i = 0; i < foes.length; i++) {
        const en = foes[i];
        if (en.hp > 0 && Math.hypot(en.x - vent.x, en.y - vent.y) < 105) {
          damageEnemy(en, Math.round(28 * getPlayerDamageMult()), 'fire', false, 0, 0);
        }
      }

      if (p && Math.hypot(p.x - vent.x, p.y - vent.y) < 88) {
        damagePlayer(10, vent.x, vent.y);
      }
    }
  } else if (gameState.ventCycleTimer > 5.4 && Math.random() < 0.35) {
    const vent = THERMAL_VENTS[Math.floor(Math.random() * THERMAL_VENTS.length)];
    spawnSparks(vent.x, vent.y, 3, '#fbbf24', 30, 90, 2);
  }
}

function updateMapShrinesAndPools(dt) {
  const p = gameState.player;
  if (!p) return;

  if (typeof MAP_SHRINES !== 'undefined') {
    for (let i = 0; i < MAP_SHRINES.length; i++) {
      const sh = MAP_SHRINES[i];
      if (sh.used) continue;
      if (Math.hypot(p.x - sh.x, p.y - sh.y) < sh.r + 24) {
        sh.used = true;
        gameState.shrinesCollected++;
        if (sh.kind === 'heal_spring') {
          const healAmt = Math.round(p.maxHp * 0.28);
          p.hp = Math.min(p.maxHp, p.hp + healAmt);
          p.shield = Math.min(p.maxHp * 0.5, (p.shield || 0) + 30);
          spawnFloatingText(sh.x, sh.y - 20, `+${healAmt} HP & SHIELD`, '#2dd4bf', 1.22);
          pushCombatLog('Sanctum Spring restored HP & granted a Barrier!', '#2dd4bf');
        } else if (sh.kind === 'ember_altar') {
          p.surgeGauge = Math.min(100, (p.surgeGauge || 0) + 50);
          p.shrineFuryTimer = 8.0;
          spawnFloatingText(sh.x, sh.y - 20, '+50% SURGE & FURY', '#fbbf24', 1.22);
          pushCombatLog('Surge Altar ignited Overdrive Gauge & +18% DMG (8s)!', '#fbbf24');
        } else {
          const bonusShards = 4 + Math.floor(gameState.wave * 0.5);
          p.shards = (p.shards || 0) + bonusShards;
          spawnFloatingText(sh.x, sh.y - 20, `+${bonusShards} SHARDS`, '#38bdf8', 1.22);
          pushCombatLog(`Relic Crystal harvested (+${bonusShards} Shards)!`, '#38bdf8');
        }
        spawnShockwave(sh.x, sh.y, 135, '#67e8f9', 4.5);
        spawnSparks(sh.x, sh.y, 24, '#67e8f9', 85, 240, 3);
        playSfx('playPickup');
      }
    }
  }

  p.inIcePool = false;
  if (typeof MAP_POOLS === 'undefined' || MAP_POOLS.length === 0) return;

  const foes = getAllActiveFoes();
  for (let i = 0; i < MAP_POOLS.length; i++) {
    const pl = MAP_POOLS[i];

    const pnx = (p.x - pl.x) / pl.rx;
    const pny = (p.y - pl.y) / pl.ry;
    if (pnx * pnx + pny * pny <= 1) {
      if (pl.kind === 'ice') {
        p.inIcePool = true;
        p.x += p.vx * dt * 0.22;
        p.y += p.vy * dt * 0.22;
      } else if (pl.kind === 'lava' && p.invulnTimer <= 0 && p.dashTimer <= 0) {
        p.lavaTick = (p.lavaTick || 0) + dt;
        if (p.lavaTick >= 0.48) {
          p.lavaTick = 0;
          p.hp = Math.max(1, p.hp - 4);
          spawnFloatingText(p.x, p.y - 24, 'LAVA -4', '#ff6a00', 0.9);
        }
      } else if (pl.kind === 'turquoise') {
        p.springTick = (p.springTick || 0) + dt;
        if (p.springTick >= 0.65 && p.hp < p.maxHp) {
          p.springTick = 0;
          p.hp = Math.min(p.maxHp, p.hp + 2);
        }
      } else if (pl.kind === 'void' && p.surgeTimer <= 0 && (p.surgeCd || 0) <= 0) {
        p.surgeGauge = Math.min(100, p.surgeGauge + dt * 6);
      }
    }

    for (let j = 0; j < foes.length; j++) {
      const en = foes[j];
      if (en.hp <= 0) continue;
      const enx = (en.x - pl.x) / pl.rx;
      const eny = (en.y - pl.y) / pl.ry;
      if (enx * enx + eny * eny <= 1) {
        if (pl.kind === 'lava') {
          en.burnTimer = Math.max(en.burnTimer || 0, 2.0);
        } else if (pl.kind === 'ice') {
          en.slowTimer = Math.max(en.slowTimer || 0, 1.8);
        } else if (pl.kind === 'void') {
          en.shockTimer = Math.max(en.shockTimer || 0, 2.0);
        }
      }
    }
  }
}

// -------------------------------------------------------------------------
// 8G. WAVE, BIOME, ENEMY & 4-ARCHETYPE BOSS SPAWNING (ENDLESS WAVES)
// -------------------------------------------------------------------------
function findSafeSpawnPoint(minDistFromPlayer = 380) {
  const p = gameState.player;
  for (let attempt = 0; attempt < 28; attempt++) {
    const sx = randRange(170, ARENA_W - 170);
    const sy = randRange(190, ARENA_H - 170);
    if (p && Math.hypot(sx - p.x, sy - p.y) < minDistFromPlayer) continue;
    if (checkProjectileHitPillar(sx, sy, 40)) continue;
    return { x: sx, y: sy };
  }
  return { x: ARENA_W * 0.5, y: 260 };
}

function spawnEnemyOfType(type, waveNum) {
  const waveScale = 1 + (waveNum - 1) * 0.22;
  const pt = findSafeSpawnPoint(360);

  const elPool = ['normal', 'fire', 'ice', 'volt'];
  const elRoll = Math.random();
  const element = elRoll < 0.34 ? 'normal' : elPool[1 + Math.floor(Math.random() * 3)];

  const baseStats = {
    husk:       { hp: 64,  speed: Math.min(208, 130 + waveNum * 4), dmg: 12, r: 16, name: 'HUSK' },
    weaver:     { hp: 56,  speed: Math.min(148, 98 + waveNum * 2),  dmg: 14, r: 17, name: 'WEAVER' },
    juggernaut: { hp: 175, speed: Math.min(126, 84 + waveNum * 2),  dmg: 22, r: 24, name: 'JUGGERNAUT' },
    stalker:    { hp: 82,  speed: Math.min(248, 168 + waveNum * 5), dmg: 16, r: 15, name: 'STALKER' },
  };
  const cfg = baseStats[type] || baseStats.husk;
  const maxHp = Math.round(cfg.hp * waveScale);

  gameState.enemies.push({
    x: pt.x,
    y: pt.y,
    vx: 0,
    vy: 0,
    r: cfg.r,
    type,
    element,
    displayName: element === 'normal' ? cfg.name : `${element.toUpperCase()} ${cfg.name}`,
    hp: maxHp,
    maxHp,
    speed: cfg.speed,
    dmg: Math.round(cfg.dmg * (1 + (waveNum - 1) * 0.14)),
    attackCd: randRange(0.7, 2.0),
    abilityCd: randRange(2.4, 4.2),
    strafeDir: Math.random() < 0.5 ? 1 : -1,
    chargeTimer: 0,
    chargeDirX: 0,
    chargeDirY: 0,
    stunTimer: 0,
    hitFlash: 0,
    squash: 0,
    burnTimer: 0,
    slowTimer: 0,
    shockTimer: 0,
    vulnTimer: 0,
    dotTick: 0,
    _deadHandled: false,
  });
}

function spawnBossForWave(waveNum) {
  const forms = ['boss_overlord', 'boss_wyrm', 'boss_lich', 'boss_golem'];
  const available = forms.filter((f) => f !== gameState.lastBossForm);
  const visualForm = available[Math.floor(Math.random() * available.length)];
  gameState.lastBossForm = visualForm;

  const archKeys = typeof BOSS_ARCHETYPES !== 'undefined' ? Object.keys(BOSS_ARCHETYPES) : ['sovereign'];
  const archetype = archKeys[(Math.floor(waveNum / 2) - 1) % archKeys.length];
  const archInfo = (typeof BOSS_ARCHETYPES !== 'undefined' && BOSS_ARCHETYPES[archetype]) || {
    prefix: 'OBSIDIAN OVERLORD',
  };

  const maxHp = Math.round(820 * (1 + (waveNum - 1) * 0.34));
  const pt = findSafeSpawnPoint(460);

  gameState.boss = {
    x: pt.x,
    y: pt.y,
    vx: 0,
    vy: 0,
    r: 34,
    type: 'boss',
    name: archInfo.name || archInfo.prefix || 'OBSIDIAN OVERLORD',
    archetype,
    visualForm,
    element: ['fire', 'ice', 'volt'][waveNum % 3],
    phase: 1,
    hp: maxHp,
    maxHp,
    speed: Math.min(188, 120 + waveNum * 3),
    dmg: Math.round(24 * (1 + (waveNum - 1) * 0.14)),
    skillCd: 2.6,
    patternIdx: 0,
    chargeTimer: 0,
    chargeDirX: 0,
    chargeDirY: 0,
    stunTimer: 0,
    telegraph: null,
    hitFlash: 0,
    squash: 0,
    burnTimer: 0,
    slowTimer: 0,
    shockTimer: 0,
    vulnTimer: 0,
    dotTick: 0,
    _deadHandled: false,
  };

  spawnShockwave(pt.x, pt.y, 280, '#ff2a5f', 7.5);
  spawnFloatingText(pt.x, pt.y - 46, `BOSS: ${gameState.boss.name}`, '#ff2a5f', 1.42);
  playSfx('setMusicIntensity', 'boss');
  pushCombatLog(`WARNING: ${gameState.boss.name} appeared!`, '#ff2a5f');
}

function startWave(waveNum) {
  gameState.wave = waveNum;
  gameState.portalOpen = false;
  gameState.enemies.length = 0;
  gameState.boss = null;
  gameState.enemyProjectiles.length = 0;
  gameState.ventCycleTimer = 0;

  const p = gameState.player;
  if (p && waveNum > 1) {
    p.skillPoints = (p.skillPoints || 0) + 1;
    const shardGain = 5 + (p.shardBonus || 0);
    p.shards = (p.shards || 0) + shardGain;
    spawnFloatingText(p.x, p.y - 42, `WAVE ${waveNum} // +1 SP +${shardGain} SHARDS`, '#67e8f9', 1.22);
    pushCombatLog(`Wave ${waveNum} started (+1 Skill Point, +${shardGain} Shards).`, '#67e8f9');
  }

  const baseCount = Math.min(28, 7 + waveNum * 2);
  for (let i = 0; i < baseCount; i++) {
    const r = Math.random();
    if (r < 0.42) spawnEnemyOfType('husk', waveNum);
    else if (r < 0.68) spawnEnemyOfType('weaver', waveNum);
    else if (r < 0.85) spawnEnemyOfType('stalker', waveNum);
    else spawnEnemyOfType('juggernaut', waveNum);
  }

  if (waveNum % 2 === 0) {
    spawnBossForWave(waveNum);
  } else {
    playSfx('setMusicIntensity', 'combat');
  }
}
window.startWave = startWave;

function enterNextWaveTunnel() {
  if (!gameState.portalOpen || gameState.transitionTimer > 0) return;
  gameState.portalOpen = false;
  gameState.transitionTimer = 0.85;
  gameState.transitionSwapped = false;
  playSfx('playPortal');
}

function spawnLobbyDummy() {
  gameState.enemies.push({
    x: LOBBY_DUMMY_POS.x,
    y: LOBBY_DUMMY_POS.y,
    vx: 0,
    vy: 0,
    r: 22,
    type: 'dummy',
    isDummy: true,
    element: 'normal',
    displayName: 'TRAINING DUMMY',
    hp: 99999,
    maxHp: 99999,
    speed: 0,
    dmg: 0,
    attackCd: 99,
    abilityCd: 99,
    strafeDir: 1,
    chargeTimer: 0,
    chargeDirX: 0,
    chargeDirY: 0,
    stunTimer: 0,
    hitFlash: 0,
    squash: 0,
    burnTimer: 0,
    slowTimer: 0,
    shockTimer: 0,
    vulnTimer: 0,
    dotTick: 0,
    _deadHandled: false,
  });
}

function enterLobbyZone() {
  gameState.zone = 'lobby';
  gameState.portalOpen = false;
  gameState.enemies.length = 0;
  gameState.boss = null;
  gameState.enemyProjectiles.length = 0;
  gameState.playerBolts.length = 0;
  gameState.floorDecals.length = 0;
  gameState.loots.length = 0;

  if (gameState.player) {
    gameState.player.x = LOBBY_SPAWN.x;
    gameState.player.y = LOBBY_SPAWN.y;
    gameState.player.vx = 0;
    gameState.player.vy = 0;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.surgeGauge = 100;
    if (gameState.player.scarf) {
      gameState.player.scarf.forEach((pt, idx) => {
        pt.x = LOBBY_SPAWN.x;
        pt.y = LOBBY_SPAWN.y + idx * 5;
      });
    }
    gameState.camera.x = LOBBY_SPAWN.x;
    gameState.camera.y = LOBBY_SPAWN.y - 60;
  }

  spawnLobbyDummy();
  playSfx('setMusicIntensity', 'ambient');
  pushCombatLog('Welcome to Obsidian Sanctum Hall! Practice combos or enter the Crimson Rift.', '#fbbf24');
}
window.enterLobbyZone = enterLobbyZone;

function enterDungeonFromLobby() {
  if (gameState.zone !== 'lobby' || gameState.transitionTimer > 0) return;
  gameState.transitionTargetZone = 'dungeon';
  gameState.transitionTimer = 0.85;
  gameState.transitionSwapped = false;
  playSfx('playPortal');
  pushCombatLog('Warping into the Obsidian Dungeon...', '#ff2a5f');
}
window.enterDungeonFromLobby = enterDungeonFromLobby;

function handleLobbyInteractKey() {
  if (gameState.phase !== 'playing' || gameState.zone !== 'lobby' || !gameState.player) return;
  const p = gameState.player;

  // Check proximity to Crimson Rift
  if (Math.hypot(p.x - LOBBY_PORTAL.x, p.y - LOBBY_PORTAL.y) < LOBBY_PORTAL.r + 36) {
    enterDungeonFromLobby();
    return;
  }

  // Check proximity to Altar / Forge
  for (let i = 0; i < LOBBY_STATIONS.length; i++) {
    const st = LOBBY_STATIONS[i];
    if (Math.hypot(p.x - st.x, p.y - st.y) < st.r + 52) {
      if (typeof toggleArpgModal === 'function') {
        toggleArpgModal(st.kind);
      }
      return;
    }
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyF') {
    handleLobbyInteractKey();
  }
});

function resetGameState() {
  gameState.phase = 'playing';
  gameState.worldTime = 0;
  gameState.wave = 1;
  gameState.biomeIndex = 0;
  gameState.lastBossForm = '';
  gameState.score = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.comboTimer = 0;
  gameState.kills = 0;
  gameState.bossesDefeated = 0;
  gameState.reactionsTriggered = 0;
  gameState.shrinesCollected = 0;
  gameState.portalOpen = false;
  gameState.transitionTimer = 0;
  gameState.transitionSwapped = false;
  gameState.hitstopTimer = 0;
  gameState.chromaticTimer = 0;
  gameState.shakeMag = 0;
  gameState.ventCycleTimer = 0;
  gameState.pendingUpgrades = [];
  gameState.mouseDown = false;
  if (gameState.keys && typeof gameState.keys.clear === 'function') {
    gameState.keys.clear();
  }

  // รีเซ็ตระดับโหนดกลุ่มดาวเมื่อเริ่มรอบใหม่
  if (typeof CONSTELLATION_NODES !== 'undefined' && Array.isArray(CONSTELLATION_NODES)) {
    CONSTELLATION_NODES.forEach((n) => { n.rank = 0; n.unlocked = false; });
  }

  gameState.enemies.length = 0;
  gameState.boss = null;
  gameState.floorDecals.length = 0;
  gameState.loots.length = 0;
  gameState.dissolvingCorpses.length = 0;
  gameState.afterimages.length = 0;
  gameState.slashCrescents.length = 0;
  gameState.slashes.length = 0;
  gameState.overdriveSigils.length = 0;
  gameState.astralRings.length = 0;
  gameState.shockwaves.length = 0;
  gameState.lightningArcs.length = 0;
  gameState.playerBolts.length = 0;
  gameState.enemyProjectiles.length = 0;
  gameState.iceShards.length = 0;
  gameState.sparks.length = 0;
  gameState.brazierSmoke.length = 0;
  gameState.floatingTexts.length = 0;

  if (typeof buildBiomeMapLayout === 'function') buildBiomeMapLayout(0);
  if (typeof buildProceduralFloorPattern === 'function') buildProceduralFloorPattern();

  gameState.transitionTargetZone = null;
  gameState.player = createInitialPlayer();
  initAmbientEmbers();
  enterLobbyZone();
}
window.resetGameState = resetGameState;
window.resetGame = resetGameState;

// -------------------------------------------------------------------------
// 8H. ENEMY & 4-FORM BOSS AI SUB-UPDATERS
// -------------------------------------------------------------------------
function updateEnemiesAI(dt, p) {
  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const en = gameState.enemies[i];
    if (en.hp <= 0) {
      gameState.enemies.splice(i, 1);
      continue;
    }

    en.hitFlash = Math.max(0, en.hitFlash - dt);
    en.squash = Math.max(0, en.squash - dt * 4);
    en.burnTimer = Math.max(0, (en.burnTimer || 0) - dt);
    en.slowTimer = Math.max(0, (en.slowTimer || 0) - dt);
    en.shockTimer = Math.max(0, (en.shockTimer || 0) - dt);
    en.vulnTimer = Math.max(0, (en.vulnTimer || 0) - dt);
    en.stunTimer = Math.max(0, (en.stunTimer || 0) - dt);

    if (en.burnTimer > 0) {
      en.dotTick = (en.dotTick || 0) + dt;
      if (en.dotTick >= 0.55) {
        en.dotTick = 0;
        const burnDmg = Math.max(4, Math.round(6.5 * getPlayerDamageMult()));
        en.hp -= burnDmg;
        spawnFloatingText(en.x, en.y - 12, `${burnDmg}`, '#ff6a00', 0.8);
        if (en.hp <= 0) {
          handleEnemyDeath(en, false);
          gameState.enemies.splice(i, 1);
          continue;
        }
      }
    }

    if (en.isDummy) {
      en.vx *= Math.max(0, 1 - dt * 12);
      en.vy *= Math.max(0, 1 - dt * 12);
      // ดึงหุ่นซ้อมกลับจุดเดิมเบาๆ ไม่ให้กระเด็นหายไปนอกลาน
      en.x += (LOBBY_DUMMY_POS.x - en.x) * Math.min(1, dt * 4.5);
      en.y += (LOBBY_DUMMY_POS.y - en.y) * Math.min(1, dt * 4.5);
      if (en.hp < en.maxHp * 0.5) en.hp = en.maxHp;
      continue;
    }

    const dx = p.x - en.x;
    const dy = p.y - en.y;
    const distToP = Math.hypot(dx, dy) || 1;
    const moveSpd = en.speed * (en.slowTimer > 0 ? 0.56 : 1);

    if (en.stunTimer > 0) {
      en.vx *= Math.max(0, 1 - dt * 9);
      en.vy *= Math.max(0, 1 - dt * 9);
    } else if (en.type === 'weaver') {
      const hasLOS = hasLineOfSight(en.x, en.y, p.x, p.y);
      const desiredDist = 330;
      let tx = 0;
      let ty = 0;

      if (!hasLOS) {
        const perpX = (-dy / distToP) * en.strafeDir;
        const perpY = (dx / distToP) * en.strafeDir;
        tx = (dx / distToP * 0.45 + perpX * 0.85) * moveSpd;
        ty = (dy / distToP * 0.45 + perpY * 0.85) * moveSpd;
      } else {
        const moveFactor = distToP > desiredDist + 45 ? 1 : distToP < desiredDist - 70 ? -0.8 : 0.15;
        const strafe = 0.35 * en.strafeDir;
        tx = ((dx / distToP) * moveFactor + (-dy / distToP) * strafe) * moveSpd;
        ty = ((dy / distToP) * moveFactor + (dx / distToP) * strafe) * moveSpd;
      }

      en.vx += (tx - en.vx) * Math.min(1, dt * 6);
      en.vy += (ty - en.vy) * Math.min(1, dt * 6);

      en.attackCd -= dt;
      if (en.attackCd <= 0 && distToP < 680 && hasLOS) {
        en.attackCd = randRange(1.85, 2.55);
        const a = Math.atan2(dy, dx);
        const pCol = en.element === 'fire' ? '#fb923c' : en.element === 'ice' ? '#38bdf8' : '#e879f9';
        gameState.enemyProjectiles.push({
          x: en.x,
          y: en.y,
          vx: Math.cos(a) * 335,
          vy: Math.sin(a) * 335,
          r: 8,
          dmg: en.dmg,
          color: pCol,
          life: 2.6,
        });
      }
    } else if (en.type === 'juggernaut') {
      if (en.chargeTimer > 0) {
        en.chargeTimer -= dt;
        const cSpd = moveSpd * 3.1;
        en.vx = en.chargeDirX * cSpd;
        en.vy = en.chargeDirY * cSpd;
        if (Math.random() < 0.35) spawnSparks(en.x, en.y, 2, '#f97316', 30, 80, 2);
      } else {
        en.vx += ((dx / distToP) * moveSpd - en.vx) * Math.min(1, dt * 5);
        en.vy += ((dy / distToP) * moveSpd - en.vy) * Math.min(1, dt * 5);
        en.abilityCd -= dt;
        if (en.abilityCd <= 0 && distToP < 380 && distToP > 110 && hasLineOfSight(en.x, en.y, p.x, p.y)) {
          en.abilityCd = randRange(3.6, 4.8);
          en.chargeTimer = 0.72;
          en.chargeDirX = dx / distToP;
          en.chargeDirY = dy / distToP;
          spawnFloatingText(en.x, en.y - 26, 'CHARGE!', '#fb923c', 1.0);
        }
      }
    } else if (en.type === 'stalker') {
      en.vx += ((dx / distToP) * moveSpd - en.vx) * Math.min(1, dt * 7);
      en.vy += ((dy / distToP) * moveSpd - en.vy) * Math.min(1, dt * 7);
      en.abilityCd -= dt;
      if (en.abilityCd <= 0 && distToP < 360 && distToP > 130) {
        en.abilityCd = randRange(3.4, 4.6);
        spawnSparks(en.x, en.y, 10, '#c084fc', 60, 170, 2.5);
        const blinkAngle = Math.atan2(dy, dx) + (Math.random() < 0.5 ? 0.65 : -0.65);
        en.x = clamp(en.x + Math.cos(blinkAngle) * 145, 70, ARENA_W - 70);
        en.y = clamp(en.y + Math.sin(blinkAngle) * 145, 90, ARENA_H - 70);
        resolveEntityArenaAndPillars(en, 64);
        spawnSparks(en.x, en.y, 12, '#e879f9', 80, 200, 2.5);
      }
    } else {
      en.vx += ((dx / distToP) * moveSpd - en.vx) * Math.min(1, dt * 6);
      en.vy += ((dy / distToP) * moveSpd - en.vy) * Math.min(1, dt * 6);
    }

    for (let j = i - 1; j >= 0; j--) {
      const other = gameState.enemies[j];
      const ox = en.x - other.x;
      const oy = en.y - other.y;
      const od = Math.hypot(ox, oy);
      const minSep = en.r + other.r + 4;
      if (od > 0.01 && od < minSep) {
        const push = (minSep - od) * 0.5;
        en.x += (ox / od) * push;
        en.y += (oy / od) * push;
        other.x -= (ox / od) * push;
        other.y -= (oy / od) * push;
      }
    }

    en.x += en.vx * dt;
    en.y += en.vy * dt;
    const hitPillar = resolveEntityArenaAndPillars(en, 64);

    if (hitPillar && en.type === 'juggernaut' && en.chargeTimer > 0) {
      en.chargeTimer = 0;
      en.stunTimer = 1.6;
      en.vulnTimer = Math.max(en.vulnTimer || 0, 4.0);
      en.vx = 0;
      en.vy = 0;
      spawnShockwave(en.x, en.y, 110, '#fbbf24', 4.5);
      spawnFloatingText(en.x, en.y - 30, 'CRASH STUNNED!', '#fde047', 1.25);
      addCameraShake(9, 0, 1);
      playSfx('playHit', true);
    }

    if (Math.hypot(p.x - en.x, p.y - en.y) < p.r + en.r) {
      damagePlayer(en.chargeTimer > 0 ? en.dmg * 1.35 : en.dmg, en.x, en.y);
      if (en.chargeTimer > 0) en.chargeTimer = 0;
    }
  }
}

function updateBossAI(dt, p) {
  const b = gameState.boss;
  if (!b || b.hp <= 0) return;

  b.hitFlash = Math.max(0, b.hitFlash - dt);
  b.squash = Math.max(0, b.squash - dt * 4);
  b.burnTimer = Math.max(0, (b.burnTimer || 0) - dt);
  b.slowTimer = Math.max(0, (b.slowTimer || 0) - dt);
  b.shockTimer = Math.max(0, (b.shockTimer || 0) - dt);
  b.vulnTimer = Math.max(0, (b.vulnTimer || 0) - dt);
  b.stunTimer = Math.max(0, (b.stunTimer || 0) - dt);

  if (b.burnTimer > 0) {
    b.dotTick = (b.dotTick || 0) + dt;
    if (b.dotTick >= 0.6) {
      b.dotTick = 0;
      const burnDmg = Math.max(5, Math.round(7 * getPlayerDamageMult()));
      b.hp -= burnDmg;
      spawnFloatingText(b.x, b.y - 20, `${burnDmg}`, '#ff6a00', 0.85);
      if (b.hp <= 0) {
        handleEnemyDeath(b, true);
        return;
      }
    }
  }

  const dx = p.x - b.x;
  const dy = p.y - b.y;
  const distToP = Math.hypot(dx, dy) || 1;
  const bSpd = b.speed * (b.slowTimer > 0 ? 0.72 : 1);

  if (b.stunTimer > 0) {
    b.vx *= Math.max(0, 1 - dt * 8);
    b.vy *= Math.max(0, 1 - dt * 8);
  } else if (b.chargeTimer > 0) {
    b.chargeTimer -= dt;
    b.vx = b.chargeDirX * bSpd * 3.0;
    b.vy = b.chargeDirY * bSpd * 3.0;
    if (Math.random() < 0.45) spawnSparks(b.x, b.y, 3, '#ff2a5f', 40, 120, 2.5);
  } else if (b.telegraph) {
    b.telegraph.timer -= dt;
    b.vx *= Math.max(0, 1 - dt * 10);
    b.vy *= Math.max(0, 1 - dt * 10);

    if (b.telegraph.timer <= 0) {
      const tel = b.telegraph;
      b.telegraph = null;

      if (tel.kind === 'slam') {
        spawnShockwave(tel.x, tel.y, tel.r, '#ff2a5f', 7.5);
        spawnFloorDecal(tel.x, tel.y, tel.r * 0.45, 'scorch', 10);
        addCameraShake(14, 0, 1);
        if (Math.hypot(p.x - tel.x, p.y - tel.y) <= tel.r) {
          damagePlayer(tel.dmg, tel.x, tel.y);
        }
      } else if (tel.kind === 'beam') {
        const fan = b.phase === 2 ? 2 : 1;
        for (let k = -fan; k <= fan; k++) {
          const ang = tel.angle + k * 0.13;
          gameState.enemyProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(ang) * 480,
            vy: Math.sin(ang) * 480,
            r: 10,
            dmg: tel.dmg,
            color: '#ff2a5f',
            life: 2.3,
          });
        }
        addCameraShake(10, Math.cos(tel.angle), Math.sin(tel.angle));
      } else if (tel.kind === 'ring') {
        const orbs = b.phase === 2 ? 12 : 8;
        for (let k = 0; k < orbs; k++) {
          const ang = (k / orbs) * Math.PI * 2 + gameState.worldTime;
          gameState.enemyProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(ang) * 320,
            vy: Math.sin(ang) * 320,
            r: 9,
            dmg: tel.dmg * 0.85,
            color: '#e879f9',
            life: 2.8,
          });
        }
        spawnShockwave(b.x, b.y, 180, '#e879f9', 6);
      } else if (tel.kind === 'charge') {
        b.chargeTimer = 0.78;
        b.chargeDirX = Math.cos(tel.angle);
        b.chargeDirY = Math.sin(tel.angle);
        spawnFloatingText(b.x, b.y - 40, 'RUSH!', '#ff2a5f', 1.2);
      }
    }
  } else {
    b.vx += ((dx / distToP) * bSpd - b.vx) * Math.min(1, dt * 5);
    b.vy += ((dy / distToP) * bSpd - b.vy) * Math.min(1, dt * 5);
    b.skillCd -= dt;

    if (b.skillCd <= 0) {
      b.skillCd = b.phase === 2 ? 1.95 : 2.9;
      b.patternIdx = (b.patternIdx + 1) % 3;
      const aimToP = Math.atan2(dy, dx);

      if (b.visualForm === 'boss_lich' && b.patternIdx === 1) {
        b.telegraph = { kind: 'ring', x: b.x, y: b.y, r: 140, angle: 0, timer: 0.65, maxTimer: 0.65, dmg: b.dmg };
        if (b.phase === 2 && gameState.enemies.length < 6) {
          spawnEnemyOfType('husk', gameState.wave);
          spawnEnemyOfType('stalker', gameState.wave);
        }
      } else if ((b.visualForm === 'boss_wyrm' || b.visualForm === 'boss_golem') && b.patternIdx === 2 && distToP > 190) {
        b.telegraph = { kind: 'charge', x: b.x, y: b.y, r: 420, angle: aimToP, timer: 0.68, maxTimer: 0.68, dmg: b.dmg * 1.25 };
      } else if (distToP < 250 || b.patternIdx === 0) {
        b.telegraph = { kind: 'slam', x: p.x, y: p.y, r: b.phase === 2 ? 175 : 155, angle: 0, timer: 0.74, maxTimer: 0.74, dmg: b.dmg * 1.35 };
      } else {
        b.telegraph = { kind: 'beam', x: b.x, y: b.y, r: 460, angle: aimToP, timer: 0.62, maxTimer: 0.62, dmg: b.dmg };
      }
    }
  }

  b.x += b.vx * dt;
  b.y += b.vy * dt;
  const hitPillar = resolveEntityArenaAndPillars(b, 72);

  if (hitPillar && b.chargeTimer > 0) {
    b.chargeTimer = 0;
    b.stunTimer = 1.4;
    b.vulnTimer = Math.max(b.vulnTimer || 0, 3.8);
    b.vx = 0;
    b.vy = 0;
    spawnShockwave(b.x, b.y, 160, '#fbbf24', 6);
    spawnFloatingText(b.x, b.y - 44, 'BOSS STAGGERED!', '#fde047', 1.38);
    addCameraShake(14, 0, 1);
    playSfx('playHit', true);
  }

  if (Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r) {
    damagePlayer(b.chargeTimer > 0 ? b.dmg * 1.3 : b.dmg, b.x, b.y);
    if (b.chargeTimer > 0) b.chargeTimer = 0;
  }
}

// -------------------------------------------------------------------------
// 8I. MAIN SIMULATION UPDATE LOOP
// -------------------------------------------------------------------------
function updateSimulation(rawDt) {
  const dt = Math.min(0.05, rawDt);
  if (gameState.phase !== 'playing' || !gameState.player) return;

  gameState.worldTime += dt;

  if (gameState.transitionTimer > 0) {
    gameState.transitionTimer = Math.max(0, gameState.transitionTimer - dt);
    if (!gameState.transitionSwapped && gameState.transitionTimer <= 0.425) {
      gameState.transitionSwapped = true;
      gameState.floorDecals.length = 0;
      gameState.loots.length = 0;

      if (gameState.transitionTargetZone === 'dungeon') {
        gameState.transitionTargetZone = null;
        gameState.zone = 'dungeon';
        gameState.biomeIndex = 0;
        gameState.score = 0;
        gameState.combo = 0;
        gameState.kills = 0;
        if (typeof buildBiomeMapLayout === 'function') buildBiomeMapLayout(0);
        if (typeof buildProceduralFloorPattern === 'function') buildProceduralFloorPattern();
        gameState.player.x = ARENA_W * 0.5;
        gameState.player.y = ARENA_H * 0.5 + 180;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.surgeGauge = 0;
        gameState.player.surgeTimer = 0;
        gameState.camera.x = gameState.player.x;
        gameState.camera.y = gameState.player.y;
        initAmbientEmbers();
        startWave(1);
      } else {
        gameState.biomeIndex = (gameState.biomeIndex + 1) % (typeof ROOM_BIOMES !== 'undefined' ? ROOM_BIOMES.length : 4);
        if (typeof buildBiomeMapLayout === 'function') buildBiomeMapLayout(gameState.biomeIndex);
        if (typeof buildProceduralFloorPattern === 'function') buildProceduralFloorPattern();
        gameState.player.x = ARENA_W * 0.5;
        gameState.player.y = ARENA_H * 0.5 + 180;
        gameState.camera.x = gameState.player.x;
        gameState.camera.y = gameState.player.y;
        initAmbientEmbers();
        startWave(gameState.wave + 1);
      }
    }
    return;
  }

  if (gameState.hitstopTimer > 0) {
    gameState.hitstopTimer = Math.max(0, gameState.hitstopTimer - dt);
    return;
  }

  if (gameState.shakeMag > 0) gameState.shakeMag = Math.max(0, gameState.shakeMag - dt * 36);
  if (gameState.chromaticTimer > 0) gameState.chromaticTimer = Math.max(0, gameState.chromaticTimer - dt);
  if (gameState.comboTimer > 0) {
    gameState.comboTimer -= dt;
    if (gameState.comboTimer <= 0) gameState.combo = 0;
  }

  const p = gameState.player;

  // 1. คูลดาวน์และบัฟผู้เล่น
  p.attackCd = Math.max(0, p.attackCd - dt);
  p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  p.lanceCd = Math.max(0, p.lanceCd - dt);
  p.novaCd = Math.max(0, p.novaCd - dt);
  p.cataclysmCd = Math.max(0, p.cataclysmCd - dt);
  p.surgeCd = Math.max(0, (p.surgeCd || 0) - dt);
  p.shiftHealCd = Math.max(0, (p.shiftHealCd || 0) - dt);
  p.transformAnimTimer = Math.max(0, (p.transformAnimTimer || 0) - dt);
  p.shrineFuryTimer = Math.max(0, (p.shrineFuryTimer || 0) - dt);
  p.voltHasteTimer = Math.max(0, (p.voltHasteTimer || 0) - dt);
  p.swordSwingOffset *= Math.pow(0.001, dt);

  if (p.comboResetTimer > 0) {
    p.comboResetTimer -= dt;
    if (p.comboResetTimer <= 0) p.comboStep = 0;
  }

  if (p.surgeTimer > 0) {
    p.surgeTimer = Math.max(0, p.surgeTimer - dt);
  }

  if (p.dashCharges < p.maxDashCharges) {
    p.dashRegenTimer += dt;
    if (p.dashRegenTimer >= p.dashRegenDuration * getEffectiveCooldownScale()) {
      p.dashRegenTimer = 0;
      p.dashCharges++;
    }
  }

  if (typeof isoScreenToWorld === 'function' && typeof canvas !== 'undefined') {
    const viewW = canvas.clientWidth || window.innerWidth;
    const viewH = canvas.clientHeight || window.innerHeight;
    const mw = isoScreenToWorld(gameState.mouseScreen.x, gameState.mouseScreen.y, viewW, viewH);
    gameState.mouseWorld.x = mw.x;
    gameState.mouseWorld.y = mw.y;
    p.aimAngle = Math.atan2(mw.y - p.y, mw.x - p.x);
  }

  // 2. การเคลื่อนที่ Isometric + Phase Dash
  if (p.dashTimer > 0) {
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    const dashSpeed = 840;
    p.vx = p.dashDirX * dashSpeed;
    p.vy = p.dashDirY * dashSpeed;
    gameState.afterimages.push({ x: p.x, y: p.y, alpha: 0.72 });
  } else {
    let ix = 0;
    let iy = 0;
    if (isKeyPressed('KeyW', 'w', 'W', 'ArrowUp', 'arrowup')) { ix -= 1; iy -= 1; }
    if (isKeyPressed('KeyS', 's', 'S', 'ArrowDown', 'arrowdown')) { ix += 1; iy += 1; }
    if (isKeyPressed('KeyA', 'a', 'A', 'ArrowLeft', 'arrowleft')) { ix -= 1; iy += 1; }
    if (isKeyPressed('KeyD', 'd', 'D', 'ArrowRight', 'arrowright')) { ix += 1; iy -= 1; }

    const len = Math.hypot(ix, iy);
    const spd = getPlayerMoveSpeed();
    if (len > 0.01) {
      const tx = (ix / len) * spd;
      const ty = (iy / len) * spd;
      p.vx += (tx - p.vx) * Math.min(1, dt * 14);
      p.vy += (ty - p.vy) * Math.min(1, dt * 14);
      if (p.weaponAspect === 'volt' && Math.random() < 0.25) {
        gameState.afterimages.push({ x: p.x, y: p.y, alpha: 0.42 });
      }
    } else {
      const drag = p.inIcePool ? 4.2 : 13;
      p.vx *= Math.max(0, 1 - dt * drag);
      p.vy *= Math.max(0, 1 - dt * drag);
    }
  }

  p.x += p.vx * dt;
  p.y += p.vy * dt;
  resolveEntityArenaAndPillars(p, 64);

  if (p.scarf && p.scarf.length > 0) {
    p.scarf[0].x = p.x;
    p.scarf[0].y = p.y;
    for (let s = 1; s < p.scarf.length; s++) {
      const prev = p.scarf[s - 1];
      const cur = p.scarf[s];
      cur.x += (prev.x - cur.x) * Math.min(1, dt * 16);
      cur.y += (prev.y - cur.y) * Math.min(1, dt * 16);
    }
  }

  if (gameState.mouseDown) {
    performPrimaryAttack();
  }

  // 3. ระบบสภาพแวดล้อม (แยกโหมด Lobby กับ Dungeon)
  if (gameState.zone === 'lobby') {
    // ในล็อบบี้: รีเจน HP & เกจ Overdrive ไวขึ้นเพื่อซ้อมคอมโบและสกิลได้เต็มที่
    p.hp = Math.min(p.maxHp, p.hp + dt * 25);
    if (p.surgeTimer <= 0 && (p.surgeCd || 0) <= 0) {
      p.surgeGauge = Math.min(100, p.surgeGauge + dt * 18);
    }
    // เดินเข้าประตูรอยแยกสีแดง (Crimson Rift) ด้านบน -> วาร์ปเข้าดันเจี้ยนเวฟ 1
    if (Math.hypot(p.x - LOBBY_PORTAL.x, p.y - LOBBY_PORTAL.y) < LOBBY_PORTAL.r + 12) {
      enterDungeonFromLobby();
      return;
    }
  } else {
    updateThermalVents(dt);
    updateMapShrinesAndPools(dt);

    // 4. เข้าประตูอุโมงค์หลังเคลียร์เวฟ
    if (gameState.portalOpen && Math.hypot(p.x - TUNNEL_GATE.x, p.y - TUNNEL_GATE.y) < TUNNEL_GATE.r + 22) {
      enterNextWaveTunnel();
      return;
    }
  }

  // กล้องติดตามนุ่มนวล
  const lookAheadX = (gameState.mouseWorld.x - p.x) * 0.085;
  const lookAheadY = (gameState.mouseWorld.y - p.y) * 0.085;
  const targetCamX = p.x + clamp(lookAheadX, -115, 115);
  const targetCamY = p.y + clamp(lookAheadY, -85, 85);
  gameState.camera.x += (targetCamX - gameState.camera.x) * Math.min(1, dt * 7.5);
  gameState.camera.y += (targetCamY - gameState.camera.y) * Math.min(1, dt * 7.5);

  // 5. อัปเดต AI มอนสเตอร์และบอส
  updateEnemiesAI(dt, p);
  updateBossAI(dt, p);

  // 6. อัปเดตกระสุนผู้เล่น (`playerBolts`)
  const foes = getAllActiveFoes();
  for (let i = gameState.playerBolts.length - 1; i >= 0; i--) {
    const b = gameState.playerBolts[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    if (b.life <= 0 || b.x < 40 || b.x > ARENA_W - 40 || b.y < 60 || b.y > ARENA_H - 40) {
      gameState.playerBolts.splice(i, 1);
      continue;
    }

    if (checkProjectileHitPillar(b.x, b.y, b.r * 0.6)) {
      spawnSparks(b.x, b.y, 10, b.color, 65, 195, 2.4);
      if (b.explosive) {
        spawnShockwave(b.x, b.y, 110, '#ff6a00', 4.5);
        for (let k = 0; k < foes.length; k++) {
          if (foes[k].hp > 0 && Math.hypot(foes[k].x - b.x, foes[k].y - b.y) < 110) {
            damageEnemy(foes[k], Math.round(b.dmg * 0.7), 'fire', false, 0, 0);
          }
        }
      }
      gameState.playerBolts.splice(i, 1);
      continue;
    }

    let consumed = false;
    for (let j = 0; j < foes.length; j++) {
      const en = foes[j];
      if (en.hp <= 0 || b.hitIds.has(en)) continue;
      if (Math.hypot(en.x - b.x, en.y - b.y) < en.r + b.r) {
        b.hitIds.add(en);
        damageEnemy(en, b.dmg, b.element, false, b.vx * 0.25, b.vy * 0.25);

        if (b.explosive) {
          spawnShockwave(b.x, b.y, 115, '#ff6a00', 4.5);
          for (let k = 0; k < foes.length; k++) {
            const other = foes[k];
            if (other !== en && other.hp > 0 && Math.hypot(other.x - b.x, other.y - b.y) < 115) {
              damageEnemy(other, Math.round(b.dmg * 0.65), 'fire', false, 0, 0);
            }
          }
        } else if (b.chainOnHit) {
          for (let k = 0; k < foes.length; k++) {
            const other = foes[k];
            if (other !== en && other.hp > 0 && Math.hypot(other.x - en.x, other.y - en.y) < 200) {
              spawnLightningArc(en.x, en.y, other.x, other.y, '#e879f9', 3);
              damageEnemy(other, Math.round(b.dmg * 0.55), 'volt', false, 0, 0);
              break;
            }
          }
        }

        b.pierce--;
        if (b.pierce <= 0) {
          consumed = true;
          break;
        }
      }
    }
    if (consumed) gameState.playerBolts.splice(i, 1);
  }

  // 7. อัปเดตกระสุนศัตรู (`enemyProjectiles`) + บล็อกด้วยหิน/เสา
  for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
    const pr = gameState.enemyProjectiles[i];
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;

    if (pr.life <= 0 || pr.x < 40 || pr.x > ARENA_W - 40 || pr.y < 60 || pr.y > ARENA_H - 40) {
      gameState.enemyProjectiles.splice(i, 1);
      continue;
    }

    if (checkProjectileHitPillar(pr.x, pr.y, pr.r * 0.7)) {
      spawnSparks(pr.x, pr.y, 10, pr.color, 70, 200, 2.4);
      gameState.enemyProjectiles.splice(i, 1);
      continue;
    }

    if (Math.hypot(p.x - pr.x, p.y - pr.y) < p.r + pr.r) {
      damagePlayer(pr.dmg, pr.x, pr.y);
      gameState.enemyProjectiles.splice(i, 1);
    }
  }

  // 8. อัปเดตเศษผลึกน้ำแข็ง (`iceShards`)
  for (let i = gameState.iceShards.length - 1; i >= 0; i--) {
    const sh = gameState.iceShards[i];
    sh.x += sh.vx * dt;
    sh.y += sh.vy * dt;
    sh.life -= dt;
    if (sh.life <= 0 || checkProjectileHitPillar(sh.x, sh.y, 6)) {
      gameState.iceShards.splice(i, 1);
      continue;
    }
    for (let j = 0; j < foes.length; j++) {
      const en = foes[j];
      if (en.hp > 0 && Math.hypot(en.x - sh.x, en.y - sh.y) < en.r + sh.r) {
        damageEnemy(en, sh.dmg || 18, 'ice', false, sh.vx * 0.18, sh.vy * 0.18);
        gameState.iceShards.splice(i, 1);
        break;
      }
    }
  }

  // 9. ไอเทมดรอป (`loots`)
  for (let i = gameState.loots.length - 1; i >= 0; i--) {
    const orb = gameState.loots[i];
    orb.life -= dt;
    if (orb.life <= 0) {
      gameState.loots.splice(i, 1);
      continue;
    }
    const d = Math.hypot(p.x - orb.x, p.y - orb.y);
    if (d < 165) {
      orb.x += ((p.x - orb.x) / (d || 1)) * 360 * dt;
      orb.y += ((p.y - orb.y) / (d || 1)) * 360 * dt;
    }
    if (d < p.r + 16) {
      if (orb.kind === 'heal') {
        const amt = Math.round(p.maxHp * 0.16);
        p.hp = Math.min(p.maxHp, p.hp + amt);
        spawnFloatingText(p.x, p.y - 20, `+${amt} HP`, '#22c55e', 1.0);
      } else if (orb.kind === 'surge') {
        p.surgeGauge = Math.min(100, p.surgeGauge + 22);
        spawnFloatingText(p.x, p.y - 20, '+22% SURGE', '#fbbf24', 1.0);
      } else {
        p.shards = (p.shards || 0) + 2;
        spawnFloatingText(p.x, p.y - 20, '+2 SHARDS', '#38bdf8', 1.0);
      }
      playSfx('playPickup');
      gameState.loots.splice(i, 1);
    }
  }

  // 10. ควันคบเพลิง + อัปเดตอาร์เรย์เอฟเฟกต์ทั้งหมดแบบลูปถอยหลัง
  if (typeof PILLARS !== 'undefined' && Math.random() < 0.28) {
    const pil = PILLARS[Math.floor(Math.random() * PILLARS.length)];
    if (pil && (pil.kind === 'brazier' || pil.kind === 'frost_torch' || pil.kind === 'fire_pit')) {
      gameState.brazierSmoke.push({ x: pil.x + randRange(-8, 8), y: pil.y, r: randRange(8, 15), life: 1.7, maxLife: 1.7 });
    }
  }

  for (let i = gameState.sparks.length - 1; i >= 0; i--) {
    const sp = gameState.sparks[i];
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.vx *= Math.max(0, 1 - dt * 5);
    sp.vy *= Math.max(0, 1 - dt * 5);
    sp.life -= dt;
    if (sp.life <= 0) gameState.sparks.splice(i, 1);
  }

  for (let i = gameState.shockwaves.length - 1; i >= 0; i--) {
    const sw = gameState.shockwaves[i];
    sw.life -= dt;
    const prog = 1 - Math.max(0, sw.life / sw.maxLife);
    sw.r = 14 + (sw.maxR - 14) * prog;
    if (sw.life <= 0) gameState.shockwaves.splice(i, 1);
  }

  for (let i = gameState.slashCrescents.length - 1; i >= 0; i--) {
    gameState.slashCrescents[i].life -= dt;
    if (gameState.slashCrescents[i].life <= 0) gameState.slashCrescents.splice(i, 1);
  }

  for (let i = gameState.slashes.length - 1; i >= 0; i--) {
    gameState.slashes[i].life -= dt;
    if (gameState.slashes[i].life <= 0) gameState.slashes.splice(i, 1);
  }

  for (let i = gameState.lightningArcs.length - 1; i >= 0; i--) {
    gameState.lightningArcs[i].life -= dt;
    if (gameState.lightningArcs[i].life <= 0) gameState.lightningArcs.splice(i, 1);
  }

  for (let i = gameState.afterimages.length - 1; i >= 0; i--) {
    gameState.afterimages[i].alpha -= dt * 3.2;
    if (gameState.afterimages[i].alpha <= 0) gameState.afterimages.splice(i, 1);
  }

  for (let i = gameState.overdriveSigils.length - 1; i >= 0; i--) {
    const os = gameState.overdriveSigils[i];
    os.x = p.x;
    os.y = p.y;
    os.rot += dt * 1.4;
    os.life -= dt;
    if (os.life <= 0) gameState.overdriveSigils.splice(i, 1);
  }

  for (let i = gameState.astralRings.length - 1; i >= 0; i--) {
    const ar = gameState.astralRings[i];
    ar.rot += dt * 2.2;
    ar.life -= dt;
    if (ar.life <= 0) gameState.astralRings.splice(i, 1);
  }

  for (let i = gameState.dissolvingCorpses.length - 1; i >= 0; i--) {
    gameState.dissolvingCorpses[i].life -= dt;
    if (gameState.dissolvingCorpses[i].life <= 0) gameState.dissolvingCorpses.splice(i, 1);
  }

  for (let i = gameState.brazierSmoke.length - 1; i >= 0; i--) {
    gameState.brazierSmoke[i].life -= dt;
    if (gameState.brazierSmoke[i].life <= 0) gameState.brazierSmoke.splice(i, 1);
  }

  for (let i = gameState.floorDecals.length - 1; i >= 0; i--) {
    gameState.floorDecals[i].life -= dt;
    if (gameState.floorDecals[i].life <= 0) gameState.floorDecals.splice(i, 1);
  }

  for (let i = gameState.floatingTexts.length - 1; i >= 0; i--) {
    const ft = gameState.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.vy *= Math.max(0, 1 - dt * 2.5);
    ft.life -= dt;
    ft.alpha = Math.max(0, ft.life / ft.maxLife);
    if (ft.life <= 0) gameState.floatingTexts.splice(i, 1);
  }

  // 11. เคลียร์เวฟ (เฉพาะในดันเจี้ยน) -> บันทึกสถิติ + เปิดหน้าต่างเลือกพรประจำเวฟ + เปิดประตูอุโมงค์
  if (gameState.zone !== 'lobby' && !gameState.portalOpen && gameState.enemies.length === 0 && (!gameState.boss || gameState.boss.hp <= 0)) {
    gameState.portalOpen = true;
    if (typeof saveHighScore === 'function') {
      saveHighScore(gameState.score, gameState.wave);
    }
    spawnShockwave(TUNNEL_GATE.x, TUNNEL_GATE.y, 210, '#22d3ee', 6);
    playSfx('setMusicIntensity', 'ambient');
    pushCombatLog(`Wave ${gameState.wave} cleared! Choose a Tactical Blessing.`, '#67e8f9');
    openWaveUpgradeModal();
  }
}
window.updateSimulation = updateSimulation;
window.updateGame = updateSimulation;

// -------------------------------------------------------------------------
// 8J. WAVE BLESSING SELECTION MODAL & GAMEOVER SAVE SYNC
// -------------------------------------------------------------------------
function resolveUpgradeContainer() {
  const modal = document.getElementById('overlay-upgrade');
  if (!modal) return { modal: null, container: null };

  const knownIds = [
    'upgrade-cards-container',
    'upgrade-choices',
    'upgrade-options',
    'blessing-cards',
    'blessings-container',
  ];
  for (let i = 0; i < knownIds.length; i++) {
    const el = document.getElementById(knownIds[i]);
    if (el) return { modal, container: el };
  }

  const candidates = Array.from(modal.querySelectorAll('div')).filter((div) => {
    if (div === modal) return false;
    const cls = div.className || '';
    const hasGridOrFlex = /\b(grid|flex)\b/.test(cls);
    const hasHeading = div.querySelector('h1, h2, h3, [data-i18n="upgradeTitle"], [data-i18n="upgradeSub"]');
    return hasGridOrFlex && !hasHeading;
  });

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.querySelectorAll('*').length - a.querySelectorAll('*').length);
    return { modal, container: candidates[candidates.length - 1] };
  }

  const created = document.createElement('div');
  created.id = 'upgrade-cards-container';
  created.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-4';
  modal.appendChild(created);
  return { modal, container: created };
}

function openWaveUpgradeModal() {
  const poolSource = (typeof RELIC_POOL !== 'undefined' && Array.isArray(RELIC_POOL) && RELIC_POOL.length > 0)
    ? RELIC_POOL
    : [
        {
          id: 'twin_cleave',
          tag: 'BLADE // ARC',
          accent: 'border-orange-400 text-amber-300',
          name: { th: 'Twin Cleave Arc', en: 'Twin Cleave Arc' },
          desc: { th: 'เพิ่มความเสียหายฟัน +25%', en: '+25% blade damage' },
        },
        {
          id: 'elemental_catalyst',
          tag: 'ELEMENT // CATALYST',
          accent: 'border-fuchsia-400 text-fuchsia-300',
          name: { th: 'Elemental Catalyst', en: 'Elemental Catalyst' },
          desc: { th: 'ปฏิกิริยาธาตุแรงขึ้น +45%', en: '+45% elemental reaction damage' },
        },
        {
          id: 'overclock_cd',
          tag: 'TEMPO // HASTE',
          accent: 'border-cyan-300 text-cyan-200',
          name: { th: 'Overclocked Phase', en: 'Overclocked Phase' },
          desc: { th: 'ลดคูลดาวน์เร็วขึ้น 22% และเดินไวขึ้น +12%', en: '22% faster CD & +12% speed' },
        },
      ];

  const shuffled = [...poolSource].sort(() => Math.random() - 0.5);
  gameState.pendingUpgrades = shuffled.slice(0, Math.min(3, shuffled.length));
  gameState.phase = 'upgrade';
  gameState.mouseDown = false;
  if (gameState.keys && typeof gameState.keys.clear === 'function') {
    gameState.keys.clear();
  }

  renderUpgradeChoices(gameState.pendingUpgrades);

  const { modal } = resolveUpgradeContainer();
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = '';
    modal.style.zIndex = '60';
  }
}
window.openWaveUpgradeModal = openWaveUpgradeModal;

function renderUpgradeChoices(choices = []) {
  const { container } = resolveUpgradeContainer();
  if (!container) return;

  const list = Array.isArray(choices) && choices.length > 0
    ? choices
    : (gameState.pendingUpgrades || []);

  container.innerHTML = '';
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'th';

  list.forEach((rel) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const accentCls = rel.accent || 'border-amber-400 text-amber-300';
    btn.className = `bg-[#0b101d] border-2 ${accentCls} p-4 text-left hover:brightness-125 transition cursor-pointer flex flex-col justify-between gap-3`;

    const titleText = typeof rel.name === 'object'
      ? (rel.name[lang] || rel.name.en || rel.name.th || rel.id)
      : (rel.name || rel.id);
    const descText = typeof rel.desc === 'object'
      ? (rel.desc[lang] || rel.desc.en || rel.desc.th || '')
      : (rel.desc || '');

    btn.innerHTML = `
      <div>
        <div class="font-mono text-[10px] tracking-widest opacity-80 mb-1">${rel.tag || 'BLESSING'}</div>
        <div class="font-display text-base font-bold text-white mb-2">${titleText}</div>
        <div class="text-xs text-slate-300 leading-relaxed">${descText}</div>
      </div>
      <div class="font-mono text-[11px] font-bold text-amber-300 pt-2 border-t border-slate-800">SELECT BLESSING ▸</div>
    `;

    btn.addEventListener('click', () => {
      applyTacticalBlessing(rel);
    });
    container.appendChild(btn);
  });
}
window.renderUpgradeChoices = renderUpgradeChoices;

function applyTacticalBlessing(rel) {
  const p = gameState.player;
  if (p && rel) {
    if (rel.id === 'twin_cleave' || rel.id === 'phantom_blade') {
      p.dmgMult = (p.dmgMult || 1) + 0.25;
    } else if (rel.id === 'executioner_edge') {
      p.dmgMult = (p.dmgMult || 1) + 0.20;
      p.critChance = Math.min(0.85, (p.critChance || 0.16) + 0.10);
      p.critBonus = (p.critBonus || 0) + 0.10;
    } else if (rel.id === 'elemental_catalyst') {
      p.reactionMult = (p.reactionMult || 1) + 0.45;
    } else if (rel.id === 'chain_nova') {
      p.dmgMult = (p.dmgMult || 1) + 0.16;
    } else if (rel.id === 'prismatic_shift') {
      p.shiftBurstLevel = (p.shiftBurstLevel || 0) + 1;
    } else if (rel.id === 'vampiric_edge') {
      p.lifeSteal = (p.lifeSteal || 0) + 0.04;
      p.blessingHpBonus = (p.blessingHpBonus || 50) + 25;
      p.maxHp += 25;
      p.hp = Math.min(p.maxHp, p.hp + 25);
    } else if (rel.id === 'thorns_aegis') {
      p.dmgMult = (p.dmgMult || 1) + 0.12;
      p.shield = Math.min(p.maxHp * 0.6, (p.shield || 0) + 20);
    } else if (rel.id === 'second_wind') {
      p.shield = Math.min(p.maxHp * 0.6, (p.shield || 0) + 35);
    } else if (rel.id === 'overclock_cd') {
      p.cooldownScale = Math.max(0.45, (p.cooldownScale || 1) * 0.78);
      p.cdScale = p.cooldownScale;
      p.speedMult = (p.speedMult || 1) + 0.12;
    } else if (rel.id === 'phase_lightning') {
      p.maxDashCharges = (p.maxDashCharges || 2) + 1;
      p.dashCharges = p.maxDashCharges;
    } else if (rel.id === 'void_piercer') {
      p.dmgMult = (p.dmgMult || 1) + 0.22;
      p.cooldownScale = Math.max(0.45, (p.cooldownScale || 1) * 0.85);
      p.cdScale = p.cooldownScale;
    } else if (rel.id === 'blood_frenzy') {
      p.surgeDuration = (p.surgeDuration || 7.5) + 2.0;
    } else if (rel.id === 'solar_echo') {
      p.cooldownScale = Math.max(0.45, (p.cooldownScale || 1) * 0.75);
      p.cdScale = p.cooldownScale;
      p.dmgMult = (p.dmgMult || 1) + 0.15;
    } else if (rel.id === 'orb_magnet') {
      p.shardBonus = (p.shardBonus || 0) + 2;
      p.shards = (p.shards || 0) + 2;
    } else {
      p.dmgMult = (p.dmgMult || 1) + 0.18;
    }

    const lang = typeof currentLang !== 'undefined' ? currentLang : 'th';
    const label = typeof rel.name === 'object'
      ? (rel.name[lang] || rel.name.en || rel.id)
      : (rel.name || rel.id);
    spawnFloatingText(p.x, p.y - 42, `${label}!`, '#fde047', 1.2);
    pushCombatLog(`Blessing granted: ${label}`, '#fde047');
    playSfx('playPickup');
  }

  gameState.pendingUpgrades = [];
  const modal = document.getElementById('overlay-upgrade');
  if (modal) {
    modal.classList.add('hidden');
  }
  gameState.phase = 'playing';
  if (p) {
    spawnFloatingText(p.x, p.y - 62, 'ENTER TUNNEL ▸', '#67e8f9', 1.15);
  }
  if (typeof syncHudDom === 'function') syncHudDom();
}
window.applyTacticalBlessing = applyTacticalBlessing;

function syncSaveAndGameOverStats(wave, score, kills) {
  const safeWave = Math.max(1, Number.isFinite(wave) ? Math.round(wave) : (gameState.wave || 1));
  const safeScore = Math.max(0, Number.isFinite(score) ? Math.round(score) : (gameState.score || 0));
  const safeKills = Math.max(0, Number.isFinite(kills) ? Math.round(kills) : (gameState.kills || 0));

  if (typeof saveHighScore === 'function') {
    saveHighScore(safeScore, safeWave);
  } else {
    try {
      const key = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : 'obsidian_vanguard_arpg_save_v2';
      const prev = JSON.parse(localStorage.getItem(key) || '{"highScore":0,"maxWave":1}');
      const next = {
        highScore: Math.max(prev.highScore || 0, safeScore),
        maxWave: Math.max(prev.maxWave || 1, safeWave),
      };
      localStorage.setItem(key, JSON.stringify(next));
      if (typeof saveData === 'object' && saveData) {
        saveData.highScore = next.highScore;
        saveData.maxWave = next.maxWave;
      }
      if (typeof refreshHighScoreUI === 'function') refreshHighScoreUI();
    } catch (_) {}
  }

  const scoreStr = String(safeScore).padStart(6, '0');
  const waveStr = String(safeWave).padStart(2, '0');
  const killsStr = String(safeKills);

  const goEl = document.getElementById('overlay-gameover');
  if (!goEl) return;

  const setByIds = (ids, val) => {
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el) el.textContent = val;
    }
  };

  setByIds(['final-score', 'gameover-score', 'go-score', 'stat-final-score', 'end-score'], scoreStr);
  setByIds(['final-wave', 'gameover-wave', 'go-wave', 'stat-final-wave', 'end-wave'], waveStr);
  setByIds(['final-kills', 'gameover-kills', 'go-kills', 'stat-final-kills', 'end-kills'], killsStr);

  const i18nMap = {
    finalScore: scoreStr,
    finalWave: waveStr,
    finalKills: killsStr,
  };
  Object.entries(i18nMap).forEach(([key, val]) => {
    const lbl = goEl.querySelector(`[data-i18n="${key}"]`);
    if (lbl && lbl.parentElement) {
      const targetChild = Array.from(lbl.parentElement.children).find((ch) => ch !== lbl && !ch.matches('[data-i18n]'));
      if (targetChild) targetChild.textContent = val;
    }
  });

  const statBoxes = goEl.querySelectorAll('div');
  statBoxes.forEach((box) => {
    if (box.children.length === 2) {
      const firstTxt = (box.children[0].textContent || '').trim().toLowerCase();
      const secondEl = box.children[1];
      if (!secondEl.querySelector('*')) {
        if (firstTxt.includes('คะแนน') || firstTxt.includes('score')) secondEl.textContent = scoreStr;
        else if (firstTxt.includes('เวฟ') || firstTxt.includes('wave')) secondEl.textContent = waveStr;
        else if (firstTxt.includes('กำจัด') || firstTxt.includes('kill')) secondEl.textContent = killsStr;
      }
    }
  });

  goEl.classList.remove('hidden');
}

function showGameOverScreen(wave, score, kills) {
  syncSaveAndGameOverStats(wave, score, kills);
}
window.showGameOverScreen = showGameOverScreen;
window.syncSaveAndGameOverStats = syncSaveAndGameOverStats;

// -------------------------------------------------------------------------
// 8K. COMPATIBILITY BRIDGE FOR main.js & config.js
// -------------------------------------------------------------------------
function startNewRun() {
  if (typeof ensureAudio === 'function') ensureAudio();

  [
    'overlay-start',
    'overlay-pause',
    'overlay-gameover',
    'overlay-upgrade',
    'overlay-tree',
    'overlay-forge',
  ].forEach((id) => {
    document.getElementById(id)?.classList.add('hidden');
  });

  resetGameState();
  if (typeof syncHudDom === 'function') syncHudDom();
}

const performBladeCleave = performPrimaryAttack;
const performVoidLance = castLanceSkill;
const performPulseNova = castNovaSkill;
const performBloodGoldSurge = activateOverdrive;
const performSolarCataclysm = castCataclysmSkill;
const performDodgeRoll = performPhaseDash;
const addFloatingText = spawnFloatingText;

window.startNewRun = startNewRun;
window.performBladeCleave = performBladeCleave;
window.performVoidLance = performVoidLance;
window.performPulseNova = performPulseNova;
window.performBloodGoldSurge = performBloodGoldSurge;
window.performSolarCataclysm = performSolarCataclysm;
window.performDodgeRoll = performDodgeRoll;
window.addFloatingText = addFloatingText;