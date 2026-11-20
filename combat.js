const gameState = {
  phase: 'title', // 'title' | 'playing' | 'upgrade' | 'paused' | 'gameover'
  wave: 1,
  score: 0,
  kills: 0,
  combo: 0,
  comboTimer: 0,
  hitstopTimer: 0,
  shakeMag: 0,
  shakeDirX: 0,
  shakeDirY: 0,
  chromaticTimer: 0,
  worldTime: 0,
  waveSpawnQueue: [],
  waveSpawnTimer: 0,
  pendingUpgrades: [],
  camera: { x: ARENA_W * 0.5, y: ARENA_H * 0.5 },
  mouseScreen: { x: 640, y: 360 },
  mouseWorld: { x: ARENA_W * 0.5 + 100, y: ARENA_H * 0.5 },
  keys: new Set(),
  player: null,
  boss: null,
  enemies: [],
  enemyProjectiles: [],
  playerBolts: [],
  slashes: [],
  bladeRibbons: [],
  lightningArcs: [],
  iceShards: [],
  dissolvingCorpses: [],
  brazierSmoke: [],
  shockwaves: [],
  astralRings: [],
  overdriveSigils: [],
  vortexCores: [],
  slashCrescents: [],
  afterimages: [],
  sparks: [],
  floorDecals: [],
  ambientEmbers: [],
  loots: [],
  floatingTexts: [],
  combatLog: [],
};

function initAmbientEmbers() {
  gameState.ambientEmbers = Array.from({ length: 55 }, () => ({
    x: Math.random() * ARENA_W,
    y: Math.random() * ARENA_H,
    vx: -12 + Math.random() * 24,
    vy: -18 - Math.random() * 26,
    r: 1.2 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
    cyan: Math.random() < 0.22,
  }));
}

function addFloorDecal(x, y, radius, kind = 'scorch') {
  if (gameState.floorDecals.length >= 120) {
    gameState.floorDecals.shift();
  }
  const maxLife = kind === 'frost' ? 3.2 : 14.0;
  gameState.floorDecals.push({
    x,
    y,
    r: radius,
    kind, // 'scorch' | 'frost' | 'shock'
    rot: Math.random() * Math.PI * 2,
    life: maxLife,
    maxLife,
    alpha: 0.55,
  });
}

function createInitialPlayer() {
  const startX = ARENA_W * 0.5;
  const startY = ARENA_H * 0.5 + 150;
  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    r: 18,
    aimAngle: -Math.PI * 0.5,
    hp: 100,
    maxHp: 100,
    blessingHpBonus: 0,
    moveSpeed: 320,
    baseDamage: 28,
    cleaveArcDeg: 122,
    cleaveRange: 112,
    vampiricHeal: 0,
    chainNovaBolts: 0,
    lanceBonusDmg: 0,
    cdScale: 1.0,
    // Flowing Cape / Scarf Chain Nodes
    scarf: Array.from({ length: 6 }, (_, idx) => ({
      x: startX,
      y: startY + idx * 7,
    })),
    // Combo & Timers
    comboStep: 0,
    cleaveCd: 0,
    lanceCd: 0,
    lanceMaxCd: 2.5,
    novaCd: 0,
    novaMaxCd: 4.4,
    cataclysmCd: 0,
    cataclysmMaxCd: 11.0,
    surgeGauge: 100,
    surgeTimer: 0,
    surgeDuration: 6.5,
    dashCharges: 2,
    maxDashCharges: 2,
    dashRechargeTimer: 0,
    dashRechargeTime: 1.7,
    dashTimer: 0,
    invulnTimer: 0,
    afterimageTimer: 0,
    swordSwingOffset: 0,
    weaponAspect: 'solar',
    skillPoints: 1,
    shards: 15,
    forgeLevel: 0,
    equippedRelics: [],
    inventoryRelics: [rollArpgRelic('rare')],
  };
}

function pushCombatLog(msg, tone = 'amber') {
  gameState.combatLog.unshift({ msg, tone });
  if (gameState.combatLog.length > 3) gameState.combatLog.length = 3;
  const listEl = document.getElementById('combat-log-list');
  if (!listEl) return;
  listEl.innerHTML = gameState.combatLog
    .map((item) => {
      const colorClass =
        item.tone === 'rose'
          ? 'text-rose-300'
          : item.tone === 'cyan'
          ? 'text-cyan-300'
          : 'text-amber-200/90';
      return `<li class="${colorClass} truncate">> ${item.msg}</li>`;
    })
    .join('');
}

function addFloatingText(x, y, text, color = '#ffb800', scale = 1) {
  gameState.floatingTexts.push({
    x,
    y,
    vy: -60,
    text,
    color,
    scale,
    alpha: 1,
    life: 0.8,
  });
}

function spawnSparks(x, y, color = '#ff6a00', count = 12, speed = 230) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = (0.35 + Math.random() * 0.85) * speed;
    gameState.sparks.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      life: 0.26 + Math.random() * 0.24,
      maxLife: 0.5,
      size: 2 + Math.random() * 2.6,
      color,
    });
  }
}

function triggerDirectionalShake(mag, dx = 0, dy = 0) {
  const len = Math.hypot(dx, dy);
  if (len > 0.001) {
    gameState.shakeDirX = dx / len;
    gameState.shakeDirY = dy / len;
  } else {
    const ang = Math.random() * Math.PI * 2;
    gameState.shakeDirX = Math.cos(ang);
    gameState.shakeDirY = Math.sin(ang);
  }
  gameState.shakeMag = Math.max(gameState.shakeMag, mag);
}

// -------------------------------------------------------------------------
// 4. COLLISION HELPERS (ARENA BOUNDS + PILLARS)
// -------------------------------------------------------------------------
function resolveWorldCollisions(entity) {
  const margin = entity.r + 22;
  if (entity.x < margin) entity.x = margin;
  if (entity.x > ARENA_W - margin) entity.x = ARENA_W - margin;
  if (entity.y < margin) entity.y = margin;
  if (entity.y > ARENA_H - margin) entity.y = ARENA_H - margin;

  for (let i = 0; i < PILLARS.length; i++) {
    const pil = PILLARS[i];
    const dx = entity.x - pil.x;
    const dy = entity.y - pil.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDist = entity.r + pil.r;
    if (dist < minDist) {
      const overlap = minDist - dist;
      entity.x += (dx / dist) * overlap;
      entity.y += (dy / dist) * overlap;
    }
  }
}

function lineHitsPillar(x1, y1, x2, y2) {
  for (let i = 0; i < PILLARS.length; i++) {
    const pil = PILLARS[i];
    const vx = x2 - x1;
    const vy = y2 - y1;
    const lenSq = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((pil.x - x1) * vx + (pil.y - y1) * vy) / lenSq));
    const closestX = x1 + t * vx;
    const closestY = y1 + t * vy;
    if (Math.hypot(pil.x - closestX, pil.y - closestY) < pil.r + 6) {
      return true;
    }
  }
  return false;
}

// -------------------------------------------------------------------------
// 5. PLAYER COMBAT SKILLS (CLEAVE, VOID LANCE, PULSE NOVA, SURGE, PHASE)
// -------------------------------------------------------------------------
function getAttackMultiplier() {
  const surgeMult = gameState.player.surgeTimer > 0 ? 1.75 : 1.0;
  const comboMult = 1 + Math.min(0.65, gameState.combo * 0.02);
  return surgeMult * comboMult;
}

function performBladeCleave() {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing' || p.cleaveCd > 0) return;

  const speedMult = p.surgeTimer > 0 ? 1.65 : 1.0;
  const cdMult = getEffectiveCooldownScale();
  p.cleaveCd = (0.27 / speedMult) * cdMult;
  p.comboStep = (p.comboStep + 1) % 3;

  const asp = WEAPON_ASPECTS[p.weaponAspect || 'solar'] || WEAPON_ASPECTS.solar;
  const dir = p.aimAngle;
  const dxDir = Math.cos(dir);
  const dyDir = Math.sin(dir);
  const halfArc = (((p.cleaveArcDeg * asp.arcMult) * Math.PI) / 180) * 0.5;
  const isFinisher = p.comboStep === 2;
  const isCrit = isFinisher || Math.random() < getEffectiveCritChance();
  const forgeMult = 1 + (p.forgeLevel || 0) * 0.12 + getEquippedRelicStat('dmg') / 100 + getConstellationRank('sol_1') * 0.18;
  const dmg = Math.round(
    p.baseDamage * asp.dmgMult * forgeMult * (isFinisher ? 1.48 : 1.0) * (isCrit ? 1.35 : 1.0) * getAttackMultiplier()
  );

  const slashColor = p.surgeTimer > 0 ? '#ffb800' : asp.color;
  const cleaveR = p.cleaveRange * (asp.key === 'cryo' ? 1.16 : 1.02);
  gameState.slashes.push({
    x: p.x,
    y: p.y,
    angle: dir,
    halfArc,
    radius: cleaveR,
    swingSign: p.comboStep % 2 === 0 ? 1 : -1,
    life: 0.21,
    maxLife: 0.21,
    color: slashColor,
    aspect: asp.key,
  });
  gameState.slashCrescents.push({
    x: p.x + dxDir * 14,
    y: p.y + dyDir * 14,
    angle: dir,
    halfArc: halfArc * 0.92,
    outerR: cleaveR * 1.06,
    innerR: cleaveR * 0.56,
    color: slashColor,
    coreColor: p.surgeTimer > 0 ? '#fef08a' : asp.core,
    life: 0.18,
    maxLife: 0.18,
  });
  p.swordSwingOffset = (p.comboStep % 2 === 0 ? 1 : -1) * 1.15;

  // Motion-Ribbon Blade Trail Samples
  for (let r = 0; r < 9; r++) {
    const frac = r / 8;
    const a = dir - halfArc + frac * halfArc * 2;
    const reach = p.cleaveRange * (asp.key === 'cryo' ? 1.1 : 0.94);
    gameState.bladeRibbons.push({
      x: p.x + Math.cos(a) * reach,
      y: p.y + Math.sin(a) * reach,
      ix: p.x + Math.cos(a) * (p.r + 10),
      iy: p.y + Math.sin(a) * (p.r + 10),
      life: 0.21 - frac * 0.04,
      maxLife: 0.21,
      gold: p.surgeTimer > 0 || isFinisher,
      color: slashColor,
    });
  }

  // Aspect-specific visual flair on every cleave
  if (asp.key === 'cryo') {
    for (let s = -1; s <= 1; s++) {
      const sa = dir + s * 0.18;
      gameState.iceShards.push({
        x: p.x + Math.cos(sa) * 32,
        y: p.y + Math.sin(sa) * 32,
        vx: Math.cos(sa) * 340,
        vy: Math.sin(sa) * 340,
        rot: sa,
        size: 9,
        life: 0.26,
        maxLife: 0.26,
      });
    }
  } else if (asp.key === 'volt') {
    const tipX = p.x + dxDir * (p.cleaveRange * 0.95);
    const tipY = p.y + dyDir * (p.cleaveRange * 0.95);
    spawnLightningBranch(p.x + dxDir * 22, p.y + dyDir * 22, tipX, tipY, '#c084fc', 2.4);
  }

  if (isFinisher) {
    addFloorDecal(p.x + dxDir * 45, p.y + dyDir * 45, 42, 'scorch');
    gameState.chromaticTimer = 0.14;
  }

  p.x += dxDir * 11;
  p.y += dyDir * 11;
  resolveWorldCollisions(p);

  let hitAny = false;
  const targets = gameState.boss ? [...gameState.enemies, gameState.boss] : gameState.enemies;

  for (let i = targets.length - 1; i >= 0; i--) {
    const en = targets[i];
    if (!en || en.hp <= 0) continue;
    const dx = en.x - p.x;
    const dy = en.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= p.cleaveRange + en.r) {
      let diff = Math.atan2(dy, dx) - dir;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      if (Math.abs(diff) <= halfArc + 0.25) {
        hitAny = true;
        if (asp.key === 'cryo' || hasConstellation('cry_1')) en.slowTimer = Math.max(en.slowTimer || 0, 2.4);
        if (asp.key === 'solar' || hasConstellation('sol_1')) en.burnTimer = Math.max(en.burnTimer || 0, 2.8);
        if (asp.key === 'volt' || hasConstellation('vlt_3')) {
          spawnLightningBranch(p.x, p.y, en.x, en.y, '#c084fc', 2.2);
        }
        damageEnemy(en, dmg, dxDir * 230, dyDir * 230, isCrit);
        spawnSparks(en.x, en.y, p.surgeTimer > 0 ? '#ffb800' : asp.color, 10, 220);
        if (p.vampiricHeal > 0) {
          p.hp = Math.min(p.maxHp, p.hp + p.vampiricHeal);
          addFloatingText(p.x, p.y - 36, `+${p.vampiricHeal} HP`, '#10b981', 0.9);
        }
      }
    }
  }

  if (hitAny) {
    gameState.hitstopTimer = isFinisher ? 0.045 : 0.022;
    triggerDirectionalShake(isFinisher ? 7.5 : 3.8, dxDir, dyDir);
    playCombatSfx('cleave', 0.9 + p.comboStep * 0.12);
  } else {
    playCombatSfx('cleave', 1.15);
  }
}

function performVoidLance() {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing' || p.lanceCd > 0) return;

  p.lanceCd = p.lanceMaxCd * getEffectiveCooldownScale();
  p.invulnTimer = Math.max(p.invulnTimer, 0.34);
  p.dashTimer = 0.19;

  const dir = p.aimAngle;
  const dxDir = Math.cos(dir);
  const dyDir = Math.sin(dir);
  const lanceSpeed = 940;
  p.vx = dxDir * lanceSpeed;
  p.vy = dyDir * lanceSpeed;

  const dmg = Math.round((p.baseDamage * 1.95 + p.lanceBonusDmg) * 1.35 * getAttackMultiplier());
  const hitSet = new Set();

  const aspLance = WEAPON_ASPECTS[p.weaponAspect || 'solar'] || WEAPON_ASPECTS.solar;
  const lanceCol = aspLance.key === 'volt' ? '#c084fc' : aspLance.key === 'solar' ? '#ffb800' : '#22d3ee';
  addFloorDecal(p.x + dxDir * 90, p.y + dyDir * 90, 44, aspLance.key === 'cryo' ? 'frost' : 'shock');
  gameState.shockwaves.push({
    x: p.x + dxDir * 48,
    y: p.y + dyDir * 48,
    r: 18,
    maxR: 108,
    life: 0.24,
    maxLife: 0.24,
    color: lanceCol,
    lineWidth: 4.5,
  });
  if (aspLance.key === 'cryo' || hasConstellation('cry_2')) {
    for (let ic = -2; ic <= 2; ic++) {
      const ia = dir + ic * 0.14;
      gameState.iceShards.push({
        x: p.x + dxDir * 40,
        y: p.y + dyDir * 40,
        vx: Math.cos(ia) * 430,
        vy: Math.sin(ia) * 430,
        rot: ia,
        size: 10,
        life: 0.34,
        maxLife: 0.34,
      });
    }
  } else if (aspLance.key === 'volt') {
    spawnLightningBranch(p.x, p.y, p.x + dxDir * 210, p.y + dyDir * 210, '#c084fc', 3.0);
  }

  const targets = gameState.boss ? [...gameState.enemies, gameState.boss] : gameState.enemies;
  for (let i = targets.length - 1; i >= 0; i--) {
    const en = targets[i];
    if (!en || en.hp <= 0 || hitSet.has(en)) continue;
    const segLen = 240;
    const ex = en.x - p.x;
    const ey = en.y - p.y;
    const proj = Math.max(0, Math.min(segLen, ex * dxDir + ey * dyDir));
    const cx = p.x + dxDir * proj;
    const cy = p.y + dyDir * proj;
    if (Math.hypot(en.x - cx, en.y - cy) <= en.r + 36) {
      hitSet.add(en);
      damageEnemy(en, dmg, dxDir * 350, dyDir * 350, true);
      spawnSparks(en.x, en.y, '#22d3ee', 12, 260);
    }
  }

  if (p.lanceBonusDmg > 0) {
    const endX = p.x + dxDir * 170;
    const endY = p.y + dyDir * 170;
    gameState.shockwaves.push({
      x: endX,
      y: endY,
      r: 10,
      maxR: 125,
      life: 0.26,
      maxLife: 0.26,
      color: '#a855f7',
      lineWidth: 3.5,
    });
  }

  gameState.astralRings.push({
    x: p.x + dxDir * 64,
    y: p.y + dyDir * 64,
    r: 72,
    rot: dir,
    spokes: 6,
    color: lanceCol,
    life: 0.28,
    maxLife: 0.28,
  });
  gameState.hitstopTimer = 0.038;
  gameState.chromaticTimer = 0.16;
  triggerDirectionalShake(7.0, dxDir, dyDir);
  playCombatSfx('lance', 1.0);
}

function spawnLightningBranch(x1, y1, x2, y2, color = '#22d3ee', width = 2.6) {
  const segments = 7;
  const pts = [{ x: x1, y: y1 }];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let s = 1; s < segments; s++) {
    const t = s / segments;
    const jitter = (Math.random() - 0.5) * 34;
    pts.push({
      x: x1 + dx * t + nx * jitter,
      y: y1 + dy * t + ny * jitter,
    });
  }
  pts.push({ x: x2, y: y2 });
  gameState.lightningArcs.push({
    pts,
    life: 0.22,
    maxLife: 0.22,
    color,
    width,
  });
}

function performPulseNova() {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing' || p.novaCd > 0) return;

  p.novaCd = p.novaMaxCd * getEffectiveCooldownScale();
  const radius = p.chainNovaBolts > 0 ? 280 : 215;
  const dmg = Math.round(p.baseDamage * 1.6 * 1.3 * getAttackMultiplier());

  addFloorDecal(p.x, p.y, radius * 0.48, 'frost');
  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 20,
    maxR: radius,
    life: 0.35,
    maxLife: 0.35,
    color: '#22d3ee',
    lineWidth: 5,
  });

  // Crystalline Ice Shards Burst
  const shardTotal = 16 + (hasConstellation('cry_3') ? 6 : 0);
  for (let s = 0; s < shardTotal; s++) {
    const ang = (s / shardTotal) * Math.PI * 2 + Math.random() * 0.2;
    const spd = 210 + Math.random() * 190;
    gameState.iceShards.push({
      x: p.x + Math.cos(ang) * 20,
      y: p.y + Math.sin(ang) * 20,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      rot: ang,
      size: 8 + Math.random() * 7,
      life: 0.36 + Math.random() * 0.14,
      maxLife: 0.5,
    });
  }

  const targets = gameState.boss ? [...gameState.enemies, gameState.boss] : gameState.enemies;
  let prevChainX = p.x;
  let prevChainY = p.y;
  let chainedCount = 0;

  for (let i = targets.length - 1; i >= 0; i--) {
    const en = targets[i];
    if (!en || en.hp <= 0) continue;
    const dx = en.x - p.x;
    const dy = en.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist <= radius + en.r) {
      en.slowTimer = 2.6;
      damageEnemy(en, dmg, (dx / dist) * 380, (dy / dist) * 380, true);
      spawnSparks(en.x, en.y, '#22d3ee', 10, 220);

      if (chainedCount < 5) {
        spawnLightningBranch(prevChainX, prevChainY, en.x, en.y, '#38bdf8', 2.8);
        spawnLightningBranch(
          en.x,
          en.y,
          en.x + (Math.random() - 0.5) * 70,
          en.y + (Math.random() - 0.5) * 70,
          '#bae6fd',
          1.4
        );
        prevChainX = en.x;
        prevChainY = en.y;
        chainedCount++;
      }
    }
  }

  if (p.chainNovaBolts > 0) {
    for (let b = 0; b < p.chainNovaBolts; b++) {
      const ang = (b / p.chainNovaBolts) * Math.PI * 2 + p.aimAngle;
      gameState.playerBolts.push({
        x: p.x + Math.cos(ang) * 24,
        y: p.y + Math.sin(ang) * 24,
        vx: Math.cos(ang) * 570,
        vy: Math.sin(ang) * 570,
        r: 7,
        dmg: Math.round(p.baseDamage * 0.95 * getAttackMultiplier()),
        life: 0.9,
      });
    }
  }

  gameState.astralRings.push({
    x: p.x,
    y: p.y,
    r: radius * 0.88,
    rot: p.aimAngle,
    spokes: 12,
    color: '#22d3ee',
    life: 0.42,
    maxLife: 0.42,
  });
  gameState.vortexCores.push({
    x: p.x,
    y: p.y,
    maxR: radius * 0.65,
    color: '#38bdf8',
    life: 0.36,
    maxLife: 0.36,
  });
  gameState.hitstopTimer = 0.035;
  gameState.chromaticTimer = 0.16;
  triggerDirectionalShake(9.0);
  playCombatSfx('ice_burst', 1.0);
}

function performSolarCataclysm() {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing' || p.cataclysmCd > 0) return;

  p.cataclysmCd = p.cataclysmMaxCd * getEffectiveCooldownScale();
  p.invulnTimer = Math.max(p.invulnTimer, 0.65);

  const radius = 340;
  const dmg = Math.round(p.baseDamage * 3.1 * getAttackMultiplier());

  addFloorDecal(p.x, p.y, 135, 'scorch');
  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 24,
    maxR: radius,
    life: 0.48,
    maxLife: 0.48,
    color: '#ffb800',
    lineWidth: 7,
  });
  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 12,
    maxR: radius * 0.72,
    life: 0.36,
    maxLife: 0.36,
    color: '#ff6a00',
    lineWidth: 4,
  });

  // Radial Solar Pillars & Lightning Arcs
  for (let ray = 0; ray < 8; ray++) {
    const ang = (ray / 8) * Math.PI * 2 + p.aimAngle;
    const tx = p.x + Math.cos(ang) * (radius * 0.85);
    const ty = p.y + Math.sin(ang) * (radius * 0.85);
    spawnLightningBranch(p.x, p.y, tx, ty, '#ffb800', 3.0);
    spawnSparks(tx, ty, '#ff6a00', 8, 220);
  }

  const targets = gameState.boss ? [...gameState.enemies, gameState.boss] : gameState.enemies;
  for (let i = targets.length - 1; i >= 0; i--) {
    const en = targets[i];
    if (!en || en.hp <= 0) continue;
    const dx = en.x - p.x;
    const dy = en.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist <= radius + en.r) {
      damageEnemy(en, dmg, (dx / dist) * 460, (dy / dist) * 460, true);
      spawnSparks(en.x, en.y, '#ffb800', 14, 280);
    }
  }

  gameState.astralRings.push({
    x: p.x,
    y: p.y,
    r: radius * 0.92,
    rot: p.aimAngle,
    spokes: 16,
    color: '#ffb800',
    life: 0.56,
    maxLife: 0.56,
  });
  gameState.astralRings.push({
    x: p.x,
    y: p.y,
    r: radius * 0.56,
    rot: -p.aimAngle,
    spokes: 8,
    color: '#ff6a00',
    life: 0.48,
    maxLife: 0.48,
  });
  gameState.vortexCores.push({
    x: p.x,
    y: p.y,
    maxR: radius * 0.78,
    color: '#ffb800',
    life: 0.48,
    maxLife: 0.48,
  });
  gameState.hitstopTimer = 0.055;
  gameState.chromaticTimer = 0.28;
  triggerDirectionalShake(13.5);
  addFloatingText(p.x, p.y - 38, 'SOLAR CATACLYSM!', '#ffb800', 1.35);
  playCombatSfx('volt_shock', 1.0);
}

function performBloodGoldSurge() {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing' || p.surgeTimer > 0 || (p.surgeCd || 0) > 0 || p.surgeGauge < 100) return;

  const minFloorHp = Math.max(1, Math.ceil(p.maxHp * 0.1));
  if (p.hp <= minFloorHp + 4) {
    addFloatingText(p.x, p.y - 30, 'HP TOO LOW (MIN 10%)', '#fb7185', 1.0);
    playCombatSfx('hurt', 0.8);
    return;
  }

  p.surgeGauge = 0;
  p.surgeTimer = p.surgeDuration;
  p.surgeMaxCd = 9.0;
  p.surgeCd = 0;
  p.invulnTimer = Math.max(p.invulnTimer, 0.35);

  // Immediate blood sacrifice burst (capped so HP stays above 10% floor)
  const sacrificeCost = Math.min(14, Math.max(0, p.hp - minFloorHp));
  p.hp = Math.max(minFloorHp, p.hp - sacrificeCost);

  addFloorDecal(p.x, p.y, 75, 'scorch');
  gameState.overdriveSigils.push({
    x: p.x,
    y: p.y,
    r: 92,
    rot: 0,
    life: p.surgeDuration,
    maxLife: p.surgeDuration,
    color: '#ffb800',
  });
  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 16,
    maxR: 195,
    life: 0.34,
    maxLife: 0.34,
    color: '#ffb800',
    lineWidth: 4.5,
  });
  spawnSparks(p.x, p.y, '#ffb800', 24, 290);
  addFloatingText(p.x, p.y - 30, 'BLOOD OVERDRIVE!', '#ffb800', 1.25);
  playCombatSfx('overdrive_roar', 1.0);
}

function performDodgeRoll() {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing' || p.dashCharges <= 0 || p.dashTimer > 0) return;

  p.dashCharges--;
  p.dashTimer = 0.17;
  p.invulnTimer = Math.max(p.invulnTimer, 0.32);
  p.phasePayoffArmed = true;

  let mx = 0;
  let my = 0;
  if (gameState.keys.has('KeyW') || gameState.keys.has('ArrowUp')) my -= 1;
  if (gameState.keys.has('KeyS') || gameState.keys.has('ArrowDown')) my += 1;
  if (gameState.keys.has('KeyA') || gameState.keys.has('ArrowLeft')) mx -= 1;
  if (gameState.keys.has('KeyD') || gameState.keys.has('ArrowRight')) mx += 1;

  // Isometric screen-aligned dodge direction
  let rollAngle = p.aimAngle;
  if (mx !== 0 || my !== 0) {
    const isoMx = mx + my;
    const isoMy = my - mx;
    rollAngle = Math.atan2(isoMy, isoMx);
  }
  const rollSpeed = 780;
  p.vx = Math.cos(rollAngle) * rollSpeed;
  p.vy = Math.sin(rollAngle) * rollSpeed;

  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 10,
    maxR: 68,
    life: 0.18,
    maxLife: 0.18,
    color: '#22d3ee',
    lineWidth: 2.5,
  });
  addFloatingText(p.x, p.y - 24, 'PHASE', '#22d3ee', 0.9);
  playCombatSfx('dodge', 1.0);
}

function triggerPhasePayoff(p, hitX, hitY) {
  if (!p || !p.phasePayoffArmed) return;
  p.phasePayoffArmed = false;

  // Refund cooldowns on Lance & Nova, boost Overdrive gauge, and emit shock pulse
  p.lanceCd = Math.max(0, (p.lanceCd || 0) - 0.85);
  p.novaCd = Math.max(0, (p.novaCd || 0) - 1.15);
  if (p.surgeTimer <= 0 && (p.surgeCd || 0) <= 0) {
    p.surgeGauge = Math.min(100, (p.surgeGauge || 0) + 16);
  }

  gameState.shockwaves.push({
    x: p.x,
    y: p.y,
    r: 14,
    maxR: 132,
    life: 0.25,
    maxLife: 0.25,
    color: '#34d399',
    lineWidth: 3.5,
  });
  spawnSparks(p.x, p.y, '#34d399', 14, 240);
  if (typeof hitX === 'number' && typeof hitY === 'number') {
    spawnLightningBranch(p.x, p.y, hitX, hitY, '#34d399', 2.2);
  }
  addFloatingText(p.x, p.y - 36, 'EVADE PAYOFF! -CD', '#34d399', 1.15);
  pushCombatLog(
    currentLang === 'th'
      ? 'หลบเฉียดสำเร็จ! ลดคูลดาวน์สกิล & เติม Overdrive +16%'
      : 'EVADE PAYOFF! Skill CDs reduced & +16% Overdrive',
    'cyan'
  );
  playCombatSfx('pickup', 1.28);
}

// -------------------------------------------------------------------------
// 6. ENEMY ARCHETYPES (HUSK, WEAVER, JUGGERNAUT) & MULTI-PHASE BOSS
// -------------------------------------------------------------------------
function spawnEnemyOfType(type) {
  const edge = Math.floor(Math.random() * 4);
  let x = ARENA_W * 0.5;
  let y = ARENA_H * 0.5;
  if (edge === 0) { x = 80 + Math.random() * (ARENA_W - 160); y = 70; }
  else if (edge === 1) { x = ARENA_W - 70; y = 80 + Math.random() * (ARENA_H - 160); }
  else if (edge === 2) { x = 80 + Math.random() * (ARENA_W - 160); y = ARENA_H - 70; }
  else { x = 70; y = 80 + Math.random() * (ARENA_H - 160); }

  const waveScale = 1 + (gameState.wave - 1) * 0.18;

  if (type === 'juggernaut') {
    gameState.enemies.push({
      type: 'juggernaut',
      x,
      y,
      vx: 0,
      vy: 0,
      r: 25,
      hp: Math.round(135 * waveScale),
      maxHp: Math.round(135 * waveScale),
      speed: 118,
      dmg: Math.round(20 * waveScale),
      fireCd: 99,
      slowTimer: 0,
      hitFlash: 0,
      squash: 0,
    });
  } else if (type === 'weaver') {
    gameState.enemies.push({
      type: 'weaver',
      x,
      y,
      vx: 0,
      vy: 0,
      r: 18,
      hp: Math.round(68 * waveScale),
      maxHp: Math.round(68 * waveScale),
      speed: 145,
      dmg: Math.round(15 * waveScale),
      fireCd: 1.35 + Math.random() * 1.0,
      slowTimer: 0,
      hitFlash: 0,
      squash: 0,
    });
  } else if (type === 'stalker') {
    // Void Stalker: Fast assassin archetype
    gameState.enemies.push({
      type: 'stalker',
      x,
      y,
      vx: 0,
      vy: 0,
      r: 16,
      hp: Math.round(64 * waveScale),
      maxHp: Math.round(64 * waveScale),
      speed: 255 + Math.min(65, gameState.wave * 5),
      dmg: Math.round(17 * waveScale),
      fireCd: 99,
      slowTimer: 0,
      burnTimer: 0,
      hitFlash: 0,
      squash: 0,
    });
  } else {
    // Skittering Husk
    gameState.enemies.push({
      type: 'husk',
      x,
      y,
      vx: 0,
      vy: 0,
      r: 15,
      hp: Math.round(46 * waveScale),
      maxHp: Math.round(46 * waveScale),
      speed: 215 + Math.min(60, gameState.wave * 5),
      dmg: Math.round(12 * waveScale),
      fireCd: 99,
      slowTimer: 0,
      hitFlash: 0,
      squash: 0,
    });
  }
}

function spawnArenaBoss() {
  const order = ['sovereign', 'cryo_archon', 'volt_tyrant'];
  const archKey = order[(Math.floor(gameState.wave / 2) - 1) % order.length] || 'sovereign';
  const arch = BOSS_ARCHETYPES[archKey] || BOSS_ARCHETYPES.sovereign;
  const bossMaxHp = Math.round((980 + (gameState.wave - 1) * 340) * arch.hpMult);

  gameState.boss = {
    archetype: arch.key,
    name: `${arch.prefix} // MK-${gameState.wave}`,
    x: ARENA_W * 0.5,
    y: 260,
    vx: 0,
    vy: 0,
    r: 44,
    hp: bossMaxHp,
    maxHp: bossMaxHp,
    speed: Math.round(148 * arch.speedMult),
    dmg: 22,
    phase: 1,
    patternIndex: 0,
    patternTimer: arch.patternCd,
    telegraph: null, // { kind: 'slam' | 'beam' | 'nova_ring', x, y, angle, r, timer, maxTimer }
    slowTimer: 0,
    hitFlash: 0,
  };
  pushCombatLog(
    currentLang === 'th'
      ? `คำเตือน: บอส ${gameState.boss.name} เข้าสู่วิหาร!`
      : `WARNING: ${gameState.boss.name} ENTERED SANCTUM!`,
    'rose'
  );
  triggerDirectionalShake(10);
  playCombatSfx('nova', 0.72);
}

function startWave(waveNum) {
  gameState.wave = waveNum;
  gameState.waveSpawnQueue = [];
  gameState.waveSpawnTimer = 0.4;

  const isBossWave = waveNum % 2 === 0;
  if (isBossWave) {
    spawnArenaBoss();
  }

  const huskCount = 5 + waveNum * 3;
  const weaverCount = waveNum >= 2 ? 2 + Math.floor(waveNum * 1.2) : 1;
  const juggernautCount = waveNum >= 2 ? 1 + Math.floor(waveNum * 0.9) : 0;

  for (let i = 0; i < huskCount; i++) gameState.waveSpawnQueue.push('husk');
  for (let i = 0; i < weaverCount; i++) gameState.waveSpawnQueue.push('weaver');
  for (let i = 0; i < juggernautCount; i++) gameState.waveSpawnQueue.push('juggernaut');
  const stalkerCount = waveNum >= 2 ? 1 + Math.floor(waveNum * 0.8) : 0;
  for (let i = 0; i < stalkerCount; i++) gameState.waveSpawnQueue.push('stalker');

  for (let i = gameState.waveSpawnQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameState.waveSpawnQueue[i], gameState.waveSpawnQueue[j]] = [
      gameState.waveSpawnQueue[j],
      gameState.waveSpawnQueue[i],
    ];
  }

  if (waveNum > 1 && gameState.player) {
    gameState.player.skillPoints = (gameState.player.skillPoints || 0) + 1;
    gameState.player.shards = (gameState.player.shards || 0) + 5;
  }
  pushCombatLog(I18N[currentLang].logWaveStart(waveNum), 'amber');
  addFloatingText(gameState.player.x, gameState.player.y - 45, `WAVE ${waveNum}`, '#ffb800', 1.35);
}

function spawnLootOrb(x, y, kind = 'xp') {
  const ang = Math.random() * Math.PI * 2;
  const spd = 70 + Math.random() * 130;
  gameState.loots.push({
    kind, // 'xp' | 'heal' | 'surge'
    x,
    y,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    r: kind === 'xp' ? 6 : 9,
    life: 18,
  });
}

function damageEnemy(en, amount, kbX = 0, kbY = 0, isCrit = false) {
  en.hp -= amount;
  en.vx += kbX;
  en.vy += kbY;
  en.hitFlash = 0.09;
  en.squash = 0.35;

  gameState.combo++;
  gameState.comboTimer = 3.6;

  const dispAmount = isCrit ? `${amount}!` : `${amount}`;
  addFloatingText(
    en.x + (Math.random() - 0.5) * 18,
    en.y - en.r - 6,
    dispAmount,
    isCrit ? '#ffb800' : '#f8fafc',
    isCrit ? 1.24 : 1.0
  );
  playCombatSfx('hit', isCrit ? 1.25 : 1.0);

  if (en === gameState.boss) {
    if (en.hp <= en.maxHp * 0.5 && en.phase === 1) {
      en.phase = 2;
      en.speed *= 1.32;
      addFloorDecal(en.x, en.y, 90, 'scorch');
      gameState.shockwaves.push({
        x: en.x,
        y: en.y,
        r: 20,
        maxR: 330,
        life: 0.45,
        maxLife: 0.45,
        color: '#ff2a5f',
        lineWidth: 6,
      });
      triggerDirectionalShake(12);
      pushCombatLog(I18N[currentLang].logBossPhase2, 'rose');
      addFloatingText(en.x, en.y - 54, 'PHASE 2 // ENRAGE!', '#ff2a5f', 1.35);
    }

    if (en.hp <= 0) {
      gameState.score += 1200 * gameState.wave;
      gameState.kills++;
      const killLeech = getEquippedRelicStat('leech');
      if (killLeech > 0 && gameState.player) {
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + killLeech);
      }
      if ((en.burnTimer || 0) > 0 && hasConstellation('sol_3')) {
        gameState.shockwaves.push({
          x: en.x, y: en.y, r: 12, maxR: 135, life: 0.26, maxLife: 0.26, color: '#ff6a00', lineWidth: 4
        });
        for (let k = gameState.enemies.length - 1; k >= 0; k--) {
          const other = gameState.enemies[k];
          if (other && other.hp > 0 && Math.hypot(other.x - en.x, other.y - en.y) <= 135) {
            other.hp -= Math.round((gameState.player ? gameState.player.baseDamage : 28) * 1.1);
          }
        }
      }
      addFloorDecal(en.x, en.y, 105, 'scorch');
      spawnSparks(en.x, en.y, '#ffb800', 36, 340);
      spawnSparks(en.x, en.y, '#ff2a5f', 24, 280);
      for (let k = 0; k < 8; k++) spawnLootOrb(en.x, en.y, 'xp');
      spawnLootOrb(en.x, en.y, 'heal');
      spawnLootOrb(en.x, en.y, 'surge');
      if (gameState.player) {
        gameState.player.shards = (gameState.player.shards || 0) + 25;
        gameState.player.inventoryRelics = gameState.player.inventoryRelics || [];
        gameState.player.inventoryRelics.push(rollArpgRelic('mythic'));
        addFloatingText(en.x, en.y - 72, '+25 SHARDS & MYTHIC RELIC!', '#ffb800', 1.25);
      }
      gameState.boss = null;
      triggerDirectionalShake(14);
    }
    return;
  }

  if (en.hp <= 0) {
    const idx = gameState.enemies.indexOf(en);
    if (idx !== -1) gameState.enemies.splice(idx, 1);

    // Dissolving Ember-Ash Death Silhouette
    gameState.dissolvingCorpses.push({
      x: en.x,
      y: en.y,
      r: en.r,
      type: en.type,
      life: 0.65,
      maxLife: 0.65,
    });

    gameState.kills++;
    const pts = en.type === 'juggernaut' ? 220 : en.type === 'weaver' ? 160 : 100;
    gameState.score += pts * (1 + Math.floor(gameState.combo / 10));
    addFloorDecal(en.x, en.y, en.r * 1.4, 'scorch');
    spawnSparks(
      en.x,
      en.y,
      en.type === 'juggernaut' ? '#ff6a00' : en.type === 'weaver' ? '#a855f7' : '#ff2a5f',
      16,
      240
    );

    spawnLootOrb(en.x, en.y, 'xp');
    if (Math.random() < 0.16) spawnLootOrb(en.x, en.y, 'heal');
    else if (Math.random() < 0.22) spawnLootOrb(en.x, en.y, 'surge');
    if (gameState.player && (en.type === 'juggernaut' || en.type === 'stalker')) {
      gameState.player.shards = (gameState.player.shards || 0) + 4;
      if (Math.random() < 0.35) {
        gameState.player.inventoryRelics = gameState.player.inventoryRelics || [];
        gameState.player.inventoryRelics.push(rollArpgRelic());
      }
    }
  }
}

function damagePlayer(amount) {
  const p = gameState.player;
  if (!p || gameState.phase !== 'playing') return;

  if (p.invulnTimer > 0) {
    addFloatingText(p.x, p.y - 26, 'PHASED', '#22d3ee', 0.95);
    return;
  }

  p.hp = Math.max(0, p.hp - amount);
  p.invulnTimer = 0.65;
  gameState.combo = 0;
  triggerDirectionalShake(10);
  gameState.hitstopTimer = 0.04;
  spawnSparks(p.x, p.y, '#ff2a5f', 14, 220);
  addFloatingText(p.x, p.y - 24, `-${amount}`, '#ff2a5f', 1.15);
  playCombatSfx('hurt', 1.0);

  if (p.hp <= 0) {
    triggerGameOver();
  }
}

// -------------------------------------------------------------------------
// 7. UPGRADE DRAFT & RUN LIFECYCLE
// -------------------------------------------------------------------------
function openWaveUpgradeDraft() {
  gameState.phase = 'upgrade';
  const shuffled = [...RELIC_POOL].sort(() => Math.random() - 0.5);
  gameState.pendingUpgrades = shuffled.slice(0, 3);
  renderUpgradeChoices(gameState.pendingUpgrades);
  document.getElementById('overlay-upgrade')?.classList.remove('hidden');
}

function renderUpgradeChoices(choices) {
  const container = document.getElementById('upgrade-cards-container');
  if (!container) return;
  container.innerHTML = '';

  choices.forEach((relic) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `action-btn text-left rounded-2xl p-4 bg-slate-950/85 border ${relic.accent} hover:bg-slate-900/95 flex flex-col justify-between gap-3 cursor-pointer`;
    card.innerHTML = `
      <div class="space-y-2">
        <div class="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-400">${relic.tag}</div>
        <div class="font-display text-base font-extrabold text-white">${relic.name[currentLang]}</div>
        <p class="text-xs text-slate-300 leading-relaxed">${relic.desc[currentLang]}</p>
      </div>
      <div class="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300 pt-2 border-t border-slate-800">
        SELECT BLESSING ›
      </div>
    `;
    card.addEventListener('click', () => applyRelicUpgrade(relic.id));
    container.appendChild(card);
  });
}

function applyRelicUpgrade(relicId) {
  const p = gameState.player;
  if (!p) return;

  const relicObj = RELIC_POOL.find((r) => r.id === relicId);
  if (relicId === 'twin_cleave') {
    p.cleaveArcDeg = Math.min(185, p.cleaveArcDeg + 42);
    p.baseDamage = Math.round(p.baseDamage * 1.28);
  } else if (relicId === 'vampiric_edge') {
    p.vampiricHeal += 4;
    p.blessingHpBonus = (p.blessingHpBonus || 0) + 20;
    syncPlayerRelicMaxHp(30);
  } else if (relicId === 'chain_nova') {
    p.chainNovaBolts += 4;
    p.baseDamage = Math.round(p.baseDamage * 1.12);
  } else if (relicId === 'overclock_cd') {
    p.cdScale = Math.max(0.45, p.cdScale * 0.75);
    p.moveSpeed = Math.round(p.moveSpeed * 1.12);
  } else if (relicId === 'void_piercer') {
    p.lanceBonusDmg += 32;
    p.lanceMaxCd = Math.max(1.2, p.lanceMaxCd * 0.85);
  }

  if (relicObj) {
    pushCombatLog(I18N[currentLang].logUpgrade(relicObj.name[currentLang]), 'cyan');
  }
  playCombatSfx('pickup', 1.15);

  document.getElementById('overlay-upgrade')?.classList.add('hidden');
  gameState.phase = 'playing';
  startWave(gameState.wave + 1);
}

function startNewRun() {
  ensureAudio();
  CONSTELLATION_NODES.forEach((n) => { n.unlocked = false; n.rank = 0; });
  gameState.player = createInitialPlayer();
  gameState.boss = null;
  gameState.enemies = [];
  gameState.enemyProjectiles = [];
  gameState.playerBolts = [];
  gameState.slashes = [];
  gameState.bladeRibbons = [];
  gameState.lightningArcs = [];
  gameState.iceShards = [];
  gameState.dissolvingCorpses = [];
  gameState.brazierSmoke = [];
  gameState.shockwaves = [];
  gameState.astralRings = [];
  gameState.overdriveSigils = [];
  gameState.vortexCores = [];
  gameState.slashCrescents = [];
  gameState.afterimages = [];
  gameState.sparks = [];
  gameState.floorDecals = [];
  gameState.loots = [];
  gameState.floatingTexts = [];
  gameState.score = 0;
  gameState.kills = 0;
  gameState.combo = 0;
  gameState.comboTimer = 0;
  gameState.hitstopTimer = 0;
  gameState.shakeMag = 0;
  gameState.camera.x = gameState.player.x;
  gameState.camera.y = gameState.player.y;
  gameState.combatLog = [];

  document.getElementById('overlay-start')?.classList.add('hidden');
  document.getElementById('overlay-pause')?.classList.add('hidden');
  document.getElementById('overlay-gameover')?.classList.add('hidden');
  document.getElementById('overlay-upgrade')?.classList.add('hidden');

  gameState.phase = 'playing';
  pushCombatLog(I18N[currentLang].logDeploy, 'amber');
  startWave(1);
}

function togglePause() {
  if (gameState.phase === 'playing') {
    gameState.phase = 'paused';
    document.getElementById('overlay-pause')?.classList.remove('hidden');
  } else if (gameState.phase === 'paused') {
    gameState.phase = 'playing';
    document.getElementById('overlay-pause')?.classList.add('hidden');
  }
}

function triggerGameOver() {
  gameState.phase = 'gameover';
  const isNewRec = saveHighScore(gameState.score, gameState.wave);

  const endScore = document.getElementById('end-score');
  const endWave = document.getElementById('end-wave');
  const endKills = document.getElementById('end-kills');
  const recBanner = document.getElementById('end-new-record');

  if (endScore) endScore.textContent = gameState.score.toLocaleString();
  if (endWave) endWave.textContent = String(gameState.wave);
  if (endKills) endKills.textContent = String(gameState.kills);
  if (recBanner) recBanner.classList.toggle('hidden', !isNewRec);

  document.getElementById('overlay-gameover')?.classList.remove('hidden');
}

// -------------------------------------------------------------------------
// 8. SIMULATION UPDATE STEP
// -------------------------------------------------------------------------
function updateSimulation(dt) {
  gameState.worldTime += dt;

  // Ambient drifting embers always animate
  for (let i = 0; i < gameState.ambientEmbers.length; i++) {
    const emb = gameState.ambientEmbers[i];
    emb.x += (emb.vx + Math.sin(gameState.worldTime * 1.4 + emb.phase) * 14) * dt;
    emb.y += emb.vy * dt;
    if (emb.y < 16) {
      emb.y = ARENA_H - 20;
      emb.x = Math.random() * ARENA_W;
    }
    if (emb.x < 16) emb.x = ARENA_W - 16;
    if (emb.x > ARENA_W - 16) emb.x = 16;
  }

  if (gameState.phase !== 'playing') return;

  if (gameState.hitstopTimer > 0) {
    gameState.hitstopTimer = Math.max(0, gameState.hitstopTimer - dt);
    return;
  }

  const p = gameState.player;
  if (!p) return;

  // Cooldowns & Timers
  p.cleaveCd = Math.max(0, p.cleaveCd - dt);
  p.lanceCd = Math.max(0, p.lanceCd - dt);
  p.novaCd = Math.max(0, p.novaCd - dt);
  p.cataclysmCd = Math.max(0, p.cataclysmCd - dt);
  if ((p.surgeCd || 0) > 0) {
    p.surgeCd = Math.max(0, p.surgeCd - dt);
  }
  if ((p.surgeTimer || 0) > 0) {
    p.surgeTimer = Math.max(0, p.surgeTimer - dt);
    const minFloorHp = Math.max(1, Math.ceil(p.maxHp * 0.1));
    const drainRate = p.maxHp * 0.085; // ~8.5% max HP per second drain, clamped at 10% HP
    if (p.hp > minFloorHp) {
      p.hp = Math.max(minFloorHp, p.hp - drainRate * dt);
    }
    if (p.surgeTimer === 0) {
      p.surgeCd = (p.surgeMaxCd || 9.0) * getEffectiveCooldownScale();
      addFloatingText(p.x, p.y - 28, 'OVERDRIVE CD', '#fb7185', 0.95);
    }
  }
  p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  p.transformAnimTimer = Math.max(0, (p.transformAnimTimer || 0) - dt);
  if (p.weaponAspect === 'cryo' && Math.hypot(p.vx, p.vy) > 45) {
    p.frostTrailTimer = (p.frostTrailTimer || 0) - dt;
    if (p.frostTrailTimer <= 0) {
      p.frostTrailTimer = 0.24;
      addFloorDecal(p.x, p.y + p.r * 0.45, 22, 'frost');
    }
  }
  p.swordSwingOffset *= Math.pow(0.02, dt);
  gameState.chromaticTimer = Math.max(0, gameState.chromaticTimer - dt);

  // Rising Volumetric Brazier Smoke & Sparks
  if (Math.random() < 0.45) {
    const pil = PILLARS[Math.floor(Math.random() * PILLARS.length)];
    gameState.brazierSmoke.push({
      x: pil.x + (Math.random() - 0.5) * 14,
      y: pil.y - 6,
      vx: -8 + Math.random() * 16,
      vy: -28 - Math.random() * 24,
      r: 6 + Math.random() * 8,
      life: 1.1 + Math.random() * 0.6,
      maxLife: 1.7,
    });
  }

  if (p.dashCharges < p.maxDashCharges) {
    p.dashRechargeTimer += dt;
    if (p.dashRechargeTimer >= p.dashRechargeTime * p.cdScale) {
      p.dashRechargeTimer = 0;
      p.dashCharges++;
    }
  }

  if (gameState.combo > 0) {
    gameState.comboTimer -= dt;
    if (gameState.comboTimer <= 0) {
      gameState.combo = 0;
    }
  }

  // Movement & Phase Dash (Isometric screen-aligned WASD)
  if (p.dashTimer > 0) {
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    if (p.dashTimer === 0 && p.invulnTimer <= 0.05) {
      p.phasePayoffArmed = false;
    }
    p.afterimageTimer -= dt;
    if (p.afterimageTimer <= 0) {
      p.afterimageTimer = 0.028;
      gameState.afterimages.push({
        x: p.x,
        y: p.y,
        r: p.r,
        alpha: 0.55,
        color: p.surgeTimer > 0 ? '#ffb800' : '#22d3ee',
      });
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  } else {
    let mx = 0;
    let my = 0;
    if (gameState.keys.has('KeyW') || gameState.keys.has('ArrowUp')) my -= 1;
    if (gameState.keys.has('KeyS') || gameState.keys.has('ArrowDown')) my += 1;
    if (gameState.keys.has('KeyA') || gameState.keys.has('ArrowLeft')) mx -= 1;
    if (gameState.keys.has('KeyD') || gameState.keys.has('ArrowRight')) mx += 1;

    const worldMx = mx + my;
    const worldMy = my - mx;
    const len = Math.hypot(worldMx, worldMy);
    const dirX = len > 0 ? worldMx / len : 0;
    const dirY = len > 0 ? worldMy / len : 0;

    const spd = p.moveSpeed * (p.surgeTimer > 0 ? 1.42 : 1.0);
    p.vx = p.vx * 0.78 + dirX * spd * 0.22;
    p.vy = p.vy * 0.78 + dirY * spd * 0.22;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  resolveWorldCollisions(p);

  // Flowing Scarf / Cape Chain Physics
  if (p.scarf && p.scarf.length > 0) {
    const backX = p.x - Math.cos(p.aimAngle) * 10;
    const backY = p.y - Math.sin(p.aimAngle) * 10 + 4;
    p.scarf[0].x = backX;
    p.scarf[0].y = backY;
    const segLen = 6.5;
    for (let s = 1; s < p.scarf.length; s++) {
      const prev = p.scarf[s - 1];
      const curr = p.scarf[s];
      curr.x += Math.sin(gameState.worldTime * 7 + s * 0.8) * 18 * dt;
      curr.y += (8 + Math.cos(gameState.worldTime * 5 + s) * 12) * dt;
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist > segLen) {
        curr.x = prev.x + (dx / dist) * segLen;
        curr.y = prev.y + (dy / dist) * segLen;
      }
    }
  }

  // Update Aim Angle from Isometric Mouse World Pos
  const viewW = canvas.clientWidth || window.innerWidth;
  const viewH = canvas.clientHeight || window.innerHeight;
  if (typeof isoScreenToWorld === 'function') {
    const mw = isoScreenToWorld(gameState.mouseScreen.x, gameState.mouseScreen.y, viewW, viewH);
    gameState.mouseWorld.x = mw.x;
    gameState.mouseWorld.y = mw.y;
  } else {
    gameState.mouseWorld.x = gameState.mouseScreen.x + (gameState.camera.x - viewW * 0.5);
    gameState.mouseWorld.y = gameState.mouseScreen.y + (gameState.camera.y - viewH * 0.5);
  }
  p.aimAngle = Math.atan2(gameState.mouseWorld.y - p.y, gameState.mouseWorld.x - p.x);

  // Smooth Camera Follow
  const camLerp = 1 - Math.exp(-8.5 * dt);
  gameState.camera.x += (p.x - gameState.camera.x) * camLerp;
  gameState.camera.y += (p.y - gameState.camera.y) * camLerp;
  gameState.shakeMag = Math.max(0, gameState.shakeMag - dt * 28);

  // Wave Spawner
  if (gameState.waveSpawnQueue.length > 0) {
    gameState.waveSpawnTimer -= dt;
    if (gameState.waveSpawnTimer <= 0 && gameState.enemies.length < 18) {
      const nextType = gameState.waveSpawnQueue.shift();
      spawnEnemyOfType(nextType);
      gameState.waveSpawnTimer = Math.max(0.32, 0.92 - gameState.wave * 0.05);
    }
  } else if (gameState.enemies.length === 0 && !gameState.boss) {
    openWaveUpgradeDraft();
    return;
  }

  // Update Player Bolts
  for (let i = gameState.playerBolts.length - 1; i >= 0; i--) {
    const b = gameState.playerBolts[i];
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    let consumed = b.life <= 0 || lineHitsPillar(b.x - b.vx * dt, b.y - b.vy * dt, b.x, b.y);
    if (!consumed) {
      const targets = gameState.boss ? [...gameState.enemies, gameState.boss] : gameState.enemies;
      for (let t = 0; t < targets.length; t++) {
        const en = targets[t];
        if (en && en.hp > 0 && Math.hypot(en.x - b.x, en.y - b.y) <= en.r + b.r) {
          damageEnemy(en, b.dmg, b.vx * 0.25, b.vy * 0.25, true);
          spawnSparks(b.x, b.y, '#ffb800', 6, 160);
          consumed = true;
          break;
        }
      }
    }
    if (consumed) gameState.playerBolts.splice(i, 1);
  }

  // Update Enemies (Husk, Weaver, Juggernaut, Stalker)
  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const en = gameState.enemies[i];
    en.hitFlash = Math.max(0, en.hitFlash - dt);
    en.squash = Math.max(0, en.squash - dt * 2.2);
    en.slowTimer = Math.max(0, en.slowTimer - dt);
    if ((en.burnTimer || 0) > 0) {
      en.burnTimer = Math.max(0, en.burnTimer - dt);
      const burnTick = (9 + getConstellationRank('sol_1') * 7) * dt;
      en.hp -= burnTick;
      if (Math.random() < 0.25) spawnSparks(en.x, en.y, '#ff6a00', 1, 80);
      if (en.hp <= 0) {
        damageEnemy(en, 0, 0, 0, false);
        continue;
      }
    }
    const slowFactor = en.slowTimer > 0 ? 0.45 : 1.0;

    const dx = p.x - en.x;
    const dy = p.y - en.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    if (en.type === 'weaver') {
      en.fireCd -= dt * slowFactor;
      if (en.fireCd <= 0) {
        en.fireCd = 2.25;
        const projSpd = 300;
        gameState.enemyProjectiles.push({
          x: en.x + nx * 22,
          y: en.y + ny * 22,
          vx: nx * projSpd,
          vy: ny * projSpd,
          r: 7,
          dmg: en.dmg,
          life: 3.0,
          color: '#a855f7',
        });
      }
      const desiredDist = 240;
      const moveSign = dist > desiredDist + 30 ? 1 : dist < desiredDist - 30 ? -0.5 : 0;
      en.vx = en.vx * 0.85 + nx * en.speed * slowFactor * moveSign * 0.15;
      en.vy = en.vy * 0.85 + ny * en.speed * slowFactor * moveSign * 0.15;
    } else {
      en.vx = en.vx * 0.84 + nx * en.speed * slowFactor * 0.16;
      en.vy = en.vy * 0.84 + ny * en.speed * slowFactor * 0.16;
    }

    en.x += en.vx * dt;
    en.y += en.vy * dt;
    resolveWorldCollisions(en);

    if (p.phasePayoffArmed && Math.hypot(p.x - en.x, p.y - en.y) <= p.r + en.r + 24) {
      triggerPhasePayoff(p, en.x, en.y);
    }
    if (Math.hypot(p.x - en.x, p.y - en.y) < p.r + en.r) {
      damagePlayer(en.dmg);
    }
  }

  // Update Multi-Phase Boss (Ground Slam & Sweeping/Radial Beam Attack)
  const boss = gameState.boss;
  if (boss && boss.hp > 0) {
    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
    boss.slowTimer = Math.max(0, boss.slowTimer - dt);
    const slowFactor = boss.slowTimer > 0 ? 0.5 : 1.0;

    if (boss.telegraph) {
      boss.telegraph.timer -= dt;
      if (boss.telegraph.timer <= 0) {
        const tel = boss.telegraph;
        boss.telegraph = null;

        if (tel.kind === 'slam') {
          addFloorDecal(tel.x, tel.y, tel.r * 0.65, 'scorch');
          gameState.shockwaves.push({
            x: tel.x,
            y: tel.y,
            r: 20,
            maxR: tel.r,
            life: 0.34,
            maxLife: 0.34,
            color: '#ff2a5f',
            lineWidth: 5,
          });
          triggerDirectionalShake(12);
          playCombatSfx('nova', 0.65);
          if (Math.hypot(p.x - tel.x, p.y - tel.y) <= tel.r + p.r * 0.6) {
            damagePlayer(boss.dmg + 8);
          }
        } else if (tel.kind === 'beam') {
          playCombatSfx('beam', 1.0);
          triggerDirectionalShake(8, Math.cos(tel.angle), Math.sin(tel.angle));
          const count = boss.phase === 2 ? 14 : 9;
          const projColor = boss.archetype === 'cryo_archon' ? '#22d3ee' : boss.archetype === 'volt_tyrant' ? '#c084fc' : '#ff2a5f';
          for (let k = 0; k < count; k++) {
            const ang = tel.angle + ((k - (count - 1) * 0.5) * 0.22);
            gameState.enemyProjectiles.push({
              x: boss.x + Math.cos(ang) * 44,
              y: boss.y + Math.sin(ang) * 44,
              vx: Math.cos(ang) * (boss.phase === 2 ? 340 : 265),
              vy: Math.sin(ang) * (boss.phase === 2 ? 340 : 265),
              r: 8,
              dmg: boss.dmg,
              life: 3.4,
              color: projColor,
            });
          }
        } else if (tel.kind === 'nova_ring') {
          playCombatSfx('nova', 0.85);
          triggerDirectionalShake(10);
          const ringCount = boss.phase === 2 ? 16 : 12;
          const ringCol = boss.archetype === 'cryo_archon' ? '#38bdf8' : boss.archetype === 'volt_tyrant' ? '#e879f9' : '#ffb800';
          gameState.shockwaves.push({
            x: boss.x, y: boss.y, r: 24, maxR: 250, life: 0.32, maxLife: 0.32, color: ringCol, lineWidth: 4.5
          });
          for (let k = 0; k < ringCount; k++) {
            const ang = (k / ringCount) * Math.PI * 2 + gameState.worldTime;
            gameState.enemyProjectiles.push({
              x: boss.x + Math.cos(ang) * 46,
              y: boss.y + Math.sin(ang) * 46,
              vx: Math.cos(ang) * (boss.phase === 2 ? 295 : 230),
              vy: Math.sin(ang) * (boss.phase === 2 ? 295 : 230),
              r: 7.5,
              dmg: boss.dmg,
              life: 3.6,
              color: ringCol,
            });
          }
        }
      }
    } else {
      const dx = p.x - boss.x;
      const dy = p.y - boss.y;
      const dist = Math.hypot(dx, dy) || 1;
      boss.vx = boss.vx * 0.88 + (dx / dist) * boss.speed * slowFactor * 0.12;
      boss.vy = boss.vy * 0.88 + (dy / dist) * boss.speed * slowFactor * 0.12;
      boss.x += boss.vx * dt;
      boss.y += boss.vy * dt;
      resolveWorldCollisions(boss);

      if (dist < p.r + boss.r) {
        damagePlayer(boss.dmg);
      }

      boss.patternTimer -= dt * slowFactor;
      if (boss.patternTimer <= 0) {
        const arch = BOSS_ARCHETYPES[boss.archetype] || BOSS_ARCHETYPES.sovereign;
        boss.patternTimer = (boss.phase === 2 ? arch.patternCd * 0.78 : arch.patternCd);
        const seq = arch.key === 'cryo_archon'
          ? ['nova_ring', 'slam', 'beam']
          : arch.key === 'volt_tyrant'
          ? ['beam', 'nova_ring', 'slam']
          : ['slam', 'beam', 'nova_ring'];
        const chosenKind = seq[(boss.patternIndex || 0) % seq.length];
        boss.patternIndex = (boss.patternIndex || 0) + 1;

        if (chosenKind === 'slam') {
          boss.telegraph = {
            kind: 'slam',
            x: p.x,
            y: p.y,
            angle: Math.atan2(dy, dx),
            r: boss.phase === 2 ? 170 : 138,
            timer: 0.76,
            maxTimer: 0.76,
          };
        } else if (chosenKind === 'nova_ring') {
          boss.telegraph = {
            kind: 'nova_ring',
            x: boss.x,
            y: boss.y,
            angle: Math.atan2(dy, dx),
            r: 230,
            timer: 0.68,
            maxTimer: 0.68,
          };
        } else {
          boss.telegraph = {
            kind: 'beam',
            x: boss.x,
            y: boss.y,
            angle: Math.atan2(dy, dx),
            r: 420,
            timer: 0.62,
            maxTimer: 0.62,
          };
        }
      }
    }
  }

  // Update Enemy Projectiles
  for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
    const pr = gameState.enemyProjectiles[i];
    pr.life -= dt;
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;

    let remove = pr.life <= 0 || lineHitsPillar(pr.x - pr.vx * dt, pr.y - pr.vy * dt, pr.x, pr.y);
    if (!remove && p.phasePayoffArmed && Math.hypot(p.x - pr.x, p.y - pr.y) <= p.r + pr.r + 34) {
      triggerPhasePayoff(p, pr.x, pr.y);
    }
    if (!remove && Math.hypot(p.x - pr.x, p.y - pr.y) <= p.r + pr.r) {
      damagePlayer(pr.dmg);
      remove = true;
    }
    if (remove) gameState.enemyProjectiles.splice(i, 1);
  }

  // Update Loot Orbs with Magnetic Pull
  for (let i = gameState.loots.length - 1; i >= 0; i--) {
    const orb = gameState.loots[i];
    orb.life -= dt;
    const dx = p.x - orb.x;
    const dy = p.y - orb.y;
    const dist = Math.hypot(dx, dy) || 1;
    const magnetRadius = 195;

    if (dist < magnetRadius) {
      const pull = ((magnetRadius - dist) / magnetRadius) * 620;
      orb.vx += (dx / dist) * pull * dt * 6;
      orb.vy += (dy / dist) * pull * dt * 6;
    } else {
      orb.vx *= 0.92;
      orb.vy *= 0.92;
    }

    orb.x += orb.vx * dt;
    orb.y += orb.vy * dt;

    if (dist <= p.r + orb.r + 8) {
      if (orb.kind === 'heal') {
        p.hp = Math.min(p.maxHp, p.hp + 18);
        addFloatingText(p.x, p.y - 22, '+18 HP', '#10b981', 1.05);
      } else if (orb.kind === 'surge') {
        if (p.surgeTimer <= 0 && (p.surgeCd || 0) <= 0) p.surgeGauge = Math.min(100, p.surgeGauge + 26);
        addFloatingText(p.x, p.y - 22, '+OVERDRIVE', '#ffb800', 1.0);
      } else {
        gameState.score += 50;
        if (p.surgeTimer <= 0 && (p.surgeCd || 0) <= 0) p.surgeGauge = Math.min(100, p.surgeGauge + 6);
      }
      playCombatSfx('pickup', 1.0);
      gameState.loots.splice(i, 1);
      continue;
    }

    if (orb.life <= 0) gameState.loots.splice(i, 1);
  }

  // Update VFX Arrays
  for (let i = gameState.slashes.length - 1; i >= 0; i--) {
    gameState.slashes[i].life -= dt;
    if (gameState.slashes[i].life <= 0) gameState.slashes.splice(i, 1);
  }
  for (let i = gameState.bladeRibbons.length - 1; i >= 0; i--) {
    gameState.bladeRibbons[i].life -= dt;
    if (gameState.bladeRibbons[i].life <= 0) gameState.bladeRibbons.splice(i, 1);
  }
  for (let i = gameState.lightningArcs.length - 1; i >= 0; i--) {
    gameState.lightningArcs[i].life -= dt;
    if (gameState.lightningArcs[i].life <= 0) gameState.lightningArcs.splice(i, 1);
  }
  for (let i = gameState.iceShards.length - 1; i >= 0; i--) {
    const sh = gameState.iceShards[i];
    sh.life -= dt;
    sh.vx *= 0.91;
    sh.vy *= 0.91;
    sh.x += sh.vx * dt;
    sh.y += sh.vy * dt;
    if (sh.life <= 0) gameState.iceShards.splice(i, 1);
  }
  for (let i = gameState.dissolvingCorpses.length - 1; i >= 0; i--) {
    const dc = gameState.dissolvingCorpses[i];
    dc.life -= dt;
    dc.y -= 14 * dt;
    if (Math.random() < 0.55) {
      spawnSparks(
        dc.x + (Math.random() - 0.5) * dc.r * 1.4,
        dc.y + (Math.random() - 0.5) * dc.r * 1.4,
        '#ffb800',
        1,
        70
      );
    }
    if (dc.life <= 0) gameState.dissolvingCorpses.splice(i, 1);
  }
  for (let i = gameState.brazierSmoke.length - 1; i >= 0; i--) {
    const sm = gameState.brazierSmoke[i];
    sm.life -= dt;
    sm.x += sm.vx * dt;
    sm.y += sm.vy * dt;
    sm.r += 10 * dt;
    if (sm.life <= 0) gameState.brazierSmoke.splice(i, 1);
  }
  for (let i = gameState.shockwaves.length - 1; i >= 0; i--) {
    const sw = gameState.shockwaves[i];
    sw.life -= dt;
    const prog = 1 - Math.max(0, sw.life / sw.maxLife);
    sw.r = 16 + (sw.maxR - 16) * prog;
    if (sw.life <= 0) gameState.shockwaves.splice(i, 1);
  }
  for (let i = gameState.astralRings.length - 1; i >= 0; i--) {
    const ar = gameState.astralRings[i];
    ar.life -= dt;
    ar.rot += dt * 3.8;
    if (ar.life <= 0) gameState.astralRings.splice(i, 1);
  }
  for (let i = gameState.overdriveSigils.length - 1; i >= 0; i--) {
    const osig = gameState.overdriveSigils[i];
    osig.life -= dt;
    osig.rot += dt * 1.45;
    if (gameState.player) {
      osig.x = gameState.player.x;
      osig.y = gameState.player.y;
    }
    if (osig.life <= 0 || (gameState.player && gameState.player.surgeTimer <= 0)) {
      gameState.overdriveSigils.splice(i, 1);
    }
  }
  for (let i = gameState.vortexCores.length - 1; i >= 0; i--) {
    const vc = gameState.vortexCores[i];
    vc.life -= dt;
    if (vc.life <= 0) gameState.vortexCores.splice(i, 1);
  }
  for (let i = gameState.slashCrescents.length - 1; i >= 0; i--) {
    const sc = gameState.slashCrescents[i];
    sc.life -= dt;
    if (sc.life <= 0) gameState.slashCrescents.splice(i, 1);
  }
  for (let i = gameState.afterimages.length - 1; i >= 0; i--) {
    gameState.afterimages[i].alpha -= dt * 2.8;
    if (gameState.afterimages[i].alpha <= 0) gameState.afterimages.splice(i, 1);
  }
  for (let i = gameState.sparks.length - 1; i >= 0; i--) {
    const sp = gameState.sparks[i];
    sp.life -= dt;
    sp.vx *= 0.92;
    sp.vy *= 0.92;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    if (sp.life <= 0) gameState.sparks.splice(i, 1);
  }
  for (let i = gameState.floorDecals.length - 1; i >= 0; i--) {
    const dec = gameState.floorDecals[i];
    if (typeof dec.life === 'number') {
      dec.life -= dt;
      if (dec.life <= 0) {
        gameState.floorDecals.splice(i, 1);
      }
    }
  }
  for (let i = gameState.floatingTexts.length - 1; i >= 0; i--) {
    const ft = gameState.floatingTexts[i];
    ft.life -= dt;
    ft.y += ft.vy * dt;
    ft.alpha = Math.max(0, ft.life / 0.8);
    if (ft.life <= 0) gameState.floatingTexts.splice(i, 1);
  }
}