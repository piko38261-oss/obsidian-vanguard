// =========================================================================
// 9. HD ISOMETRIC PIXEL ART 2.5D RENDERER (MULTI-BIOME SANCTUM)
//    + 3 REDESIGNED HERO FORMS (SOLAR CHAIN / CRYO ANTLERS / VOLT SCYTHE)
//    + GROUND CRACK FISSURES + SKY LIGHTNING + 4 BOSS FORMS + REACTION BADGES
// =========================================================================

const ISO_TILE_WORLD = 64;
const ISO_GRID_W = Math.ceil(ARENA_W / ISO_TILE_WORLD); // 30
const ISO_GRID_H = Math.ceil(ARENA_H / ISO_TILE_WORLD); // 22
const ISO_BORDER = 4;

function worldToIso(wx, wy, wz = 0) {
  return {
    x: (wx - wy) * 0.5,
    y: (wx + wy) * 0.25 - wz,
  };
}

function isoScreenToWorld(sx, sy, viewW, viewH) {
  const camIso = worldToIso(gameState.camera.x, gameState.camera.y, 0);
  const isoX = sx - viewW * 0.5 + camIso.x;
  const isoY = sy - viewH * 0.5 + camIso.y;
  return {
    x: 2 * isoY + isoX,
    y: 2 * isoY - isoX,
  };
}
window.worldToIso = worldToIso;
window.isoScreenToWorld = isoScreenToWorld;

function tileHash(gx, gy, salt = 0) {
  let n = Math.sin(gx * 127.1 + gy * 311.7 + salt * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

// -------------------------------------------------------------------------
// 9A. PROCEDURAL PIXEL-ART SPRITE CACHE & VOLT MAGIC CIRCLE
// -------------------------------------------------------------------------
const pixelSpriteCache = new Map();
let voltSigilCanvas = null;

function buildProceduralVoltSigil() {
  const S = 512;
  const cx = S * 0.5;
  const cy = S * 0.5;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const g = c.getContext('2d');

  g.translate(cx, cy);
  g.strokeStyle = '#c026d3';
  g.fillStyle = '#c026d3';
  g.lineCap = 'round';
  g.lineJoin = 'round';

  g.lineWidth = 5;
  g.beginPath();
  g.arc(0, 0, 236, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 3;
  g.beginPath();
  g.arc(0, 0, 224, 0, Math.PI * 2);
  g.stroke();

  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    g.save();
    g.rotate(a);
    g.lineWidth = 3;
    g.strokeStyle = i % 2 === 0 ? '#d946ef' : '#a855f7';
    g.beginPath();
    if (i % 3 === 0) {
      g.moveTo(202, -5); g.lineTo(214, -5); g.lineTo(208, 5); g.lineTo(216, 5);
    } else if (i % 3 === 1) {
      g.moveTo(204, -4); g.lineTo(204, 4); g.moveTo(212, -5); g.lineTo(212, 5); g.moveTo(204, 0); g.lineTo(212, 0);
    } else {
      g.moveTo(204, -5); g.lineTo(214, 0); g.lineTo(204, 5);
    }
    g.stroke();
    g.restore();
  }

  g.strokeStyle = '#c026d3';
  g.lineWidth = 3.5;
  g.beginPath();
  g.arc(0, 0, 194, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(0, 0, 184, 0, Math.PI * 2);
  g.arc(0, 0, 162, 0, Math.PI * 2);
  g.stroke();

  const hexR = 158;
  g.lineWidth = 3.2;
  g.strokeStyle = '#a855f7';
  for (let tri = 0; tri < 2; tri++) {
    const offset = tri === 0 ? -Math.PI * 0.5 : Math.PI * 0.5;
    g.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = offset + (k * Math.PI * 2) / 3;
      const px = Math.cos(a) * hexR;
      const py = Math.sin(a) * hexR;
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.stroke();
  }

  for (let s = 0; s < 6; s++) {
    const sa = (s * Math.PI) / 3;
    const sx = Math.cos(sa) * 142;
    const sy = Math.sin(sa) * 142;
    g.save();
    g.translate(sx, sy);
    g.fillStyle = '#e879f9';
    g.beginPath();
    for (let p = 0; p < 20; p++) {
      const pa = (p / 20) * Math.PI * 2;
      const r = p % 2 === 0 ? 22 : 5;
      if (p === 0) g.moveTo(Math.cos(pa) * r, Math.sin(pa) * r);
      else g.lineTo(Math.cos(pa) * r, Math.sin(pa) * r);
    }
    g.closePath();
    g.fill();
    g.restore();
  }

  g.strokeStyle = '#d946ef';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(0, 0, 106, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, 96, 0, Math.PI * 2);
  g.stroke();

  for (let d = 0; d < 5; d++) {
    const da = -Math.PI * 0.5 + (d * Math.PI * 2) / 5;
    g.save();
    g.rotate(da);
    g.fillStyle = '#e879f9';
    g.beginPath();
    g.moveTo(106, 0); g.lineTo(121, -7); g.lineTo(136, 0); g.lineTo(121, 7);
    g.closePath();
    g.fill();
    g.restore();

    const dotA = da + Math.PI / 5;
    g.fillStyle = '#d946ef';
    g.beginPath();
    g.arc(Math.cos(dotA) * 90, Math.sin(dotA) * 90, 4.5, 0, Math.PI * 2);
    g.fill();
  }

  const drawCurvedStar = (outerR, innerR, lineW, strokeCol, fillCol) => {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = -Math.PI * 0.5 + (i * Math.PI * 2) / 5;
      const aMid = a1 + Math.PI / 5;
      const a2 = -Math.PI * 0.5 + ((i + 1) * Math.PI * 2) / 5;
      if (i === 0) g.moveTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
      g.quadraticCurveTo(Math.cos(aMid) * innerR, Math.sin(aMid) * innerR, Math.cos(a2) * outerR, Math.sin(a2) * outerR);
    }
    g.closePath();
    if (fillCol) { g.fillStyle = fillCol; g.fill(); }
    if (strokeCol) { g.strokeStyle = strokeCol; g.lineWidth = lineW; g.stroke(); }
  };

  drawCurvedStar(104, 46, 5, '#e879f9', 'rgba(168, 85, 247, 0.22)');
  drawCurvedStar(76, 32, 3.5, '#f5d0fe', null);
  drawCurvedStar(48, 18, 2.5, '#ffffff', 'rgba(217, 70, 239, 0.35)');

  g.fillStyle = '#ffffff';
  g.beginPath();
  for (let p = 0; p < 10; p++) {
    const a = -Math.PI * 0.5 + (p / 10) * Math.PI * 2;
    const r = p % 2 === 0 ? 14 : 6;
    if (p === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fill();

  return c;
}

function initVoltSigilAsset(imgPath = 'assets/volt-circle.jpg') {
  voltSigilCanvas = buildProceduralVoltSigil();

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const S = 512;
      const c = document.createElement('canvas');
      c.width = S;
      c.height = S;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, S, S);

      const imgData = g.getImageData(0, 0, S, S);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const gr = d[i + 1];
        const inkStrength = Math.max(0, 255 - gr);
        if (inkStrength < 18) {
          d[i + 3] = 0;
        } else {
          const boost = Math.min(255, Math.round(inkStrength * 1.35));
          d[i] = Math.min(255, Math.max(r, 200));
          d[i + 1] = Math.min(255, Math.round(65 + (boost / 255) * 70));
          d[i + 2] = 255;
          d[i + 3] = boost;
        }
      }
      g.putImageData(imgData, 0, 0);
      voltSigilCanvas = c;
    } catch (_) {}
  };
  img.src = imgPath;
}
initVoltSigilAsset();

const PIXEL_SPRITES = {
  // ร่าง 1: นักล่าเกราะเพลิงสวมหมวกปีกกว้าง + เสื้อคลุมรูนไฟ (16x18)
  hero_solar: [
    '......kkkk......',
    '.....kddddk.....',
    '....kddddddk....',
    '..kkkggggggkkk..',
    '...kkddffddkk...',
    '....kddyyddk....',
    '...kkddffddkk...',
    '..kggkrrrrkggk..',
    '.kggkdfyyfdkggk.',
    '.kddkdffffdkddk.',
    '.kddkddrrddkddk.',
    '.kddkggggggkddk.',
    '.kddkfrrrrfkddk.',
    '..kdkddddddkdk..',
    '..k.kdd..ddk.k..',
    '....kgg..ggk....',
    '....kdd..ddk....',
    '....kkk..kkk....',
  ],
  // ร่าง 2: นักรบเหมันต์เขากวาง + ผ้าพันคอและผ้ายันต์รอบเอว (16x18)
  hero_cryo: [
    '.k...k....k...k.',
    '..k.kk....kk.k..',
    '...kk.kkkk.kk...',
    '....kkddddkk....',
    '....kdwddwdk....',
    '...kcccccccck...',
    '..kciwiwwiwcik..',
    '..kcddggggddck..',
    '.kccddccccddcck.',
    '.kcwddddddddwck.',
    '.kcwddggggddwck.',
    '.kccddddddddcck.',
    '..kcwcrcwcrcwk..',
    '..kcwcrcwcrcwk..',
    '...kcck..kcck...',
    '...kddk..kddk...',
    '...kiik..kiik...',
    '...kkkk..kkkk...',
  ],
  // ร่าง 3: ยมทูตนักฆ่าสวมฮู้ดดำ ตาเรืองแสง + ออร่าเปลวไฟม่วง (16x18)
  hero_volt: [
    '......vvvv......',
    '.....vvkkvv.....',
    '....vkkddkkv....',
    '...vkddkkddkv...',
    '...vkdkvvdkkv...',
    '...vkddkkddkv...',
    '..vvkkddddkkvv..',
    '.vvkkddddddkkvv.',
    '.vkkdddvvdddkkv.',
    '.vkkddddddddkkv.',
    '.kkddddvvddddkk.',
    '..kddddddddddk..',
    '..kddddddddddk..',
    '...kddddddddk...',
    '...kkk.vv.kkk...',
    '....kv....vk....',
    '....kv....vk....',
    '....kk....kk....',
  ],
  husk: [
    '...k....k...',
    '..krk..krk..',
    '..krrrrrrk..',
    '.krrryyrrrk.',
    '.krrrrrrrrk.',
    '..krrddrrk..',
    '.krdrrrrdrk.',
    'kddkrrrrkddk',
    'k.k.krrk.k.k',
    '....k..k....',
    '...kk..kk...',
  ],
  weaver: [
    '.....kk.....',
    '....kppk....',
    '...kppppk...',
    '..kppccppk..',
    '..kppddppk..',
    '...kppppk...',
    '..kppmmppk..',
    '.kpppmmpppk.',
    '.kpppmmpppk.',
    '..kppppppk..',
    '..kppddppk..',
    '...kppppk...',
    '...kk..kk...',
  ],
  juggernaut: [
    '...kk......kk...',
    '..ksskk..kkssk..',
    '..kssssssssssk..',
    '.kssddddddddssk.',
    'kssddrrddrrddssk',
    'kssddddddddddssk',
    'kssdddkrrkdddssk',
    'kssddkrffrkddssk',
    'kssdddkrrkdddssk',
    '.kssddddddddssk.',
    '.ksskddddddkssk.',
    '..kk.kddddk.kk..',
    '....kdd..ddk....',
    '...kddk..kddk...',
    '...kkkk..kkkk...',
  ],
  stalker: [
    '....kkkk....',
    '...kvvvvk...',
    '..kvvccvvk..',
    '..kvddddvk..',
    '.kcvvvvvvck.',
    'kcckvvvvkcck',
    '.kk.kvvk.kk.',
    '....kvvk....',
    '...kv..vk...',
    '..kk....kk..',
  ],
  boss_overlord: [
    '....kk........kk....',
    '...kggk..kk..kggk...',
    '..kggddkkggkkddggk..',
    '..kdddddddddddddgk..',
    '.kddggddddddddggddk.',
    '.kdddcddddddddcdddk.',
    'kddddddddggddddddddk',
    'kddgddddgccgddddgddk',
    'kddgdddgcvvcgdddgddk',
    'kddgddddgccgddddgddk',
    '.kdddddddggdddddddk.',
    '.kddkddddddddddkddk.',
    '..kk.kddddddddk.kk..',
    '.....kddk..kddk.....',
    '....kdddk..kdddk....',
    '....kkkkk..kkkkk....',
  ],
  boss_wyrm: [
    'k..................k',
    'kgk.....kkkk.....kgk',
    'kggk...kggggk...kggk',
    '.kddk.kgddddgk.kddk.',
    '.kdddkgdcddcdgkdddk.',
    '..kdddgddddddgdddk..',
    '..kdddddvvvvdddddk..',
    '...kddddgvvgddddk...',
    '..kggddddggddddggk..',
    '.kggddkddddddkddggk.',
    'kggk..kddggddk..kggk',
    '.kk...kddccddk...kk.',
    '......kddddddk......',
    '.....kddk..kddk.....',
    '....kggk....kggk....',
    '....kkk......kkk....',
  ],
  boss_lich: [
    '......k.kkkk.k......',
    '.....kggkggkggk.....',
    '......kddddddk......',
    '.....kddvvvvddk.....',
    '.....kdvcvvcvdk.....',
    '.....kddvvvvddk.....',
    '....kkddddddddkk....',
    '...kggkddddddkggk...',
    '..kggk.kddggk.kggk..',
    '..kdk..kdgcck..kdk..',
    '..kk..kddggddk..kk..',
    '.....kddddddddk.....',
    '....kdddkddkdddk....',
    '...kddk.kddk.kddk...',
    '...kkk...kk...kkk...',
    '....................',
  ],
  boss_golem: [
    '..kkkk........kkkk..',
    '.kggggk.kkkk.kggggk.',
    'kggddggkddddkggddggk',
    'kdddddddvvvvdddddddk',
    'kddggddvccccvddggddk',
    'kdddddddvvvvdddddddk',
    'kddddddddddddddddddk',
    '.kddkkddggggddkkddk.',
    '.kddk.kdgccgdk.kddk.',
    '.kddk.kddggddk.kddk.',
    '..kk..kddddddk..kk..',
    '.....kddd..dddk.....',
    '....kdddk..kdddk....',
    '....kgggk..kgggk....',
    '...kddddk..kddddk...',
    '...kkkkkk..kkkkkk...',
  ],
};

function getCachedPixelSprite(cacheKey, grid, palette, px = 3, flipX = false, flashWhite = false) {
  const fullKey = `${cacheKey}_${px}_${flipX ? 1 : 0}_${flashWhite ? 1 : 0}`;
  if (pixelSpriteCache.has(fullKey)) return pixelSpriteCache.get(fullKey);

  const rows = grid.length;
  const cols = grid[0].length;
  const c = document.createElement('canvas');
  c.width = cols * px;
  c.height = rows * px;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    const line = grid[r];
    for (let col = 0; col < cols; col++) {
      const ch = line[col];
      if (ch === '.') continue;
      const color = flashWhite ? '#ffffff' : (palette[ch] || '#ffffff');
      const drawCol = flipX ? cols - 1 - col : col;
      g.fillStyle = color;
      g.fillRect(drawCol * px, r * px, px, px);
    }
  }
  pixelSpriteCache.set(fullKey, c);
  return c;
}

// -------------------------------------------------------------------------
// 9B. BAKED MULTI-BIOME ISOMETRIC PIXEL-ART TERRAIN MAP
// -------------------------------------------------------------------------
let isoMapCanvas = null;
let isoMapOriginX = 0;
let isoMapOriginY = 0;
const isoWaterProps = [];

function drawIsoPixelBlock(c, cx, cy, heightPx, colors, style = 'stone', seed = 0) {
  const hw = 32;
  const hh = 16;
  const topY = cy - heightPx;

  c.fillStyle = colors.left;
  c.beginPath();
  c.moveTo(cx - hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx, cy + hh * 2);
  c.lineTo(cx - hw, cy + hh);
  c.closePath();
  c.fill();

  c.fillStyle = colors.right;
  c.beginPath();
  c.moveTo(cx + hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx, cy + hh * 2);
  c.lineTo(cx + hw, cy + hh);
  c.closePath();
  c.fill();

  if (heightPx >= 10) {
    c.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 6; y < heightPx - 2; y += 8) {
      c.fillRect(Math.round(cx - hw + 4), Math.round(topY + hh + y), 10, 2);
      c.fillRect(Math.round(cx - 14), Math.round(topY + hh + y + 6), 10, 2);
      c.fillRect(Math.round(cx + 4), Math.round(topY + hh + y + 6), 10, 2);
      c.fillRect(Math.round(cx + 18), Math.round(topY + hh + y), 10, 2);
    }
  }

  if (style === 'rune_wall' && heightPx >= 36) {
    c.fillStyle = '#ff9800';
    const rx = Math.round(cx - 18);
    const ry = Math.round(topY + hh + 10);
    c.fillRect(rx, ry, 2, Math.min(26, heightPx - 14));
    c.fillRect(rx + 2, ry + 6, 6, 2);
    c.fillRect(rx + 6, ry + 6, 2, 12);
    c.fillStyle = '#fde047';
    c.fillRect(rx, ry + 2, 2, 4);
    c.fillRect(rx + 6, ry + 14, 2, 4);
  }

  if (style === 'grass') {
    c.fillStyle = colors.overhangLeft || '#4d8b31';
    for (let i = 0; i < 6; i++) {
      const ox = cx - hw + 2 + i * 5;
      const oy = topY + hh + Math.floor(i * 2.5);
      const drop = 4 + Math.floor((seed * 17 + i * 7) % 5);
      c.fillRect(Math.round(ox), Math.round(oy), 4, drop);
    }
    c.fillStyle = colors.overhangRight || '#356622';
    for (let i = 0; i < 6; i++) {
      const ox = cx + 2 + i * 5;
      const oy = topY + hh * 2 - 2 - Math.floor(i * 2.5);
      const drop = 4 + Math.floor((seed * 23 + i * 5) % 5);
      c.fillRect(Math.round(ox), Math.round(oy), 4, drop);
    }
  }

  c.fillStyle = colors.top;
  c.beginPath();
  c.moveTo(cx, topY);
  c.lineTo(cx + hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx - hw, topY + hh);
  c.closePath();
  c.fill();

  c.strokeStyle = colors.highlight || 'rgba(255,255,255,0.14)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - hw + 2, topY + hh);
  c.lineTo(cx, topY + 1);
  c.lineTo(cx + hw - 2, topY + hh);
  c.stroke();

  c.strokeStyle = 'rgba(4, 7, 12, 0.52)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx, topY);
  c.lineTo(cx + hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx - hw, topY + hh);
  c.closePath();
  c.stroke();

  if (style === 'grass') {
    const blades = 5 + Math.floor(seed * 4);
    for (let b = 0; b < blades; b++) {
      const h1 = tileHash(cx + b, cy, 1);
      const h2 = tileHash(cx, cy + b, 2);
      const bx = cx + (h1 - 0.5) * 34;
      const by = topY + hh + (h2 - 0.5) * 14;
      c.fillStyle = b % 2 === 0 ? (colors.highlight || '#a3e635') : (colors.overhangRight || '#4d7c0f');
      c.fillRect(Math.round(bx), Math.round(by), 2, 4);
      c.fillRect(Math.round(bx + 2), Math.round(by + 2), 2, 2);
    }
  } else if (style === 'stone' || style === 'ruin' || style === 'rune_wall') {
    c.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(cx - 14, topY + hh - 7);
    c.lineTo(cx + 14, topY + hh + 7);
    c.moveTo(cx + 14, topY + hh - 7);
    c.lineTo(cx - 14, topY + hh + 7);
    c.stroke();
    if (seed > 0.78 && style === 'ruin') {
      c.fillStyle = '#f59e0b';
      c.fillRect(Math.round(cx - 4), Math.round(topY + hh - 2), 6, 4);
      c.fillStyle = '#fef08a';
      c.fillRect(Math.round(cx - 2), Math.round(topY + hh - 1), 2, 2);
    }
  } else if (style === 'dirt') {
    for (let d = 0; d < 4; d++) {
      const dx = cx + (tileHash(cx + d, cy, 3) - 0.5) * 30;
      const dy = topY + hh + (tileHash(cx, cy + d, 4) - 0.5) * 12;
      c.fillStyle = d % 2 === 0 ? colors.right : colors.highlight;
      c.fillRect(Math.round(dx), Math.round(dy), 4, 2);
    }
  } else if (style === 'vent') {
    c.fillStyle = '#7c2d12';
    c.fillRect(Math.round(cx - 12), Math.round(topY + hh - 5), 24, 10);
    c.fillStyle = '#f97316';
    for (let bar = -10; bar <= 8; bar += 6) {
      c.fillRect(Math.round(cx + bar), Math.round(topY + hh - 4), 4, 8);
    }
    c.fillStyle = '#fef08a';
    c.fillRect(Math.round(cx - 6), Math.round(topY + hh - 2), 12, 4);
  }
}

function buildIsometricPixelMap(biomeIdx = 0) {
  const minGx = -ISO_BORDER;
  const maxGx = ISO_GRID_W + ISO_BORDER - 1;
  const minGy = -ISO_BORDER;
  const maxGy = ISO_GRID_H + ISO_BORDER - 1;

  const spanX = (ISO_GRID_W + ISO_GRID_H + ISO_BORDER * 4) * 32 + 240;
  const spanY = (ISO_GRID_W + ISO_GRID_H + ISO_BORDER * 4) * 16 + 340;

  isoMapCanvas = document.createElement('canvas');
  isoMapCanvas.width = spanX;
  isoMapCanvas.height = spanY;
  const mctx = isoMapCanvas.getContext('2d');
  mctx.imageSmoothingEnabled = false;

  isoMapOriginX = Math.floor((ISO_GRID_H + ISO_BORDER * 2) * 32 + 120);
  isoMapOriginY = Math.floor(ISO_BORDER * 32 + 180);
  isoWaterProps.length = 0;

  const biome = (typeof ROOM_BIOMES !== 'undefined' && ROOM_BIOMES[biomeIdx % ROOM_BIOMES.length])
    ? ROOM_BIOMES[biomeIdx % ROOM_BIOMES.length]
    : null;
  const PAL = biome ? biome.pal : {
    ruin: { top: '#244b55', left: '#17343c', right: '#0d2026', highlight: 'rgba(125,211,252,0.22)' },
    ruinDark: { top: '#1c3b44', left: '#122830', right: '#09171d', highlight: 'rgba(94,234,212,0.16)' },
    stone: { top: '#2b3944', left: '#1c2630', right: '#111820', highlight: 'rgba(203,213,225,0.14)' },
    dirt: { top: '#7c5338', left: '#593925', right: '#3d2517', highlight: 'rgba(253,186,116,0.18)' },
    grass: {
      top: '#6ca632',
      left: '#593925',
      right: '#3b2416',
      overhangLeft: '#558b2f',
      overhangRight: '#33691e',
      highlight: 'rgba(217,249,157,0.34)',
    },
    submerged: { top: '#253c42', left: '#192b30', right: '#101d21', highlight: 'rgba(94,234,212,0.10)' },
  };

  const ventTiles = new Set(
    THERMAL_VENTS.map((v) => `${Math.floor(v.x / ISO_TILE_WORLD)},${Math.floor(v.y / ISO_TILE_WORLD)}`)
  );

  // PASS 1: Submerged outer blocks
  for (let gy = minGy; gy <= maxGy; gy++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      const isSwamp = gx >= ISO_GRID_W || gy >= ISO_GRID_H;
      if (!isSwamp) continue;
      const h = tileHash(gx, gy, 11 + biomeIdx * 7);
      if (gx > ISO_GRID_W + 2 && gy > ISO_GRID_H + 2 && h > 0.55) continue;

      const iso = worldToIso(gx * ISO_TILE_WORLD, gy * ISO_TILE_WORLD, 0);
      const cx = isoMapOriginX + iso.x;
      const cy = isoMapOriginY + iso.y + 18;
      const subH = 12 + Math.floor(h * 10);
      drawIsoPixelBlock(mctx, cx, cy, subH, PAL.submerged, 'stone', h);

      if (h < 0.24 && gx <= ISO_GRID_W + 2 && gy <= ISO_GRID_H + 2) {
        isoWaterProps.push({
          kind: h < 0.13 ? 'lily' : 'reed',
          x: gx * ISO_TILE_WORLD + 32,
          y: gy * ISO_TILE_WORLD + 32,
          phase: h * Math.PI * 2,
        });
      }
    }
  }

  // PASS 2: Translucent Water / Lava / Ice Plane
  mctx.save();
  const drawWaterQuad = (x0, y0, x1, y1) => {
    const p0 = worldToIso(x0 * ISO_TILE_WORLD, y0 * ISO_TILE_WORLD, 0);
    const p1 = worldToIso(x1 * ISO_TILE_WORLD, y0 * ISO_TILE_WORLD, 0);
    const p2 = worldToIso(x1 * ISO_TILE_WORLD, y1 * ISO_TILE_WORLD, 0);
    const p3 = worldToIso(x0 * ISO_TILE_WORLD, y1 * ISO_TILE_WORLD, 0);
    mctx.beginPath();
    mctx.moveTo(isoMapOriginX + p0.x, isoMapOriginY + p0.y + 8);
    mctx.lineTo(isoMapOriginX + p1.x, isoMapOriginY + p1.y + 8);
    mctx.lineTo(isoMapOriginX + p2.x, isoMapOriginY + p2.y + 8);
    mctx.lineTo(isoMapOriginX + p3.x, isoMapOriginY + p3.y + 8);
    mctx.closePath();
    mctx.fillStyle = biome ? biome.waterCol : 'rgba(34, 96, 108, 0.56)';
    mctx.fill();
    mctx.strokeStyle = biome ? biome.waterEdge : 'rgba(125, 225, 220, 0.28)';
    mctx.lineWidth = 2;
    mctx.stroke();
  };
  drawWaterQuad(minGx, ISO_GRID_H, maxGx + 1, maxGy + 1);
  drawWaterQuad(ISO_GRID_W, minGy, maxGx + 1, ISO_GRID_H);
  mctx.restore();

  // PASS 3: Playable Arena Blocks + Raised Fortress Walls & Northern Tunnel Archway
  for (let gy = minGy; gy < ISO_GRID_H; gy++) {
    for (let gx = minGx; gx < ISO_GRID_W; gx++) {
      const h = tileHash(gx, gy, 5 + biomeIdx * 13);
      const iso = worldToIso(gx * ISO_TILE_WORLD, gy * ISO_TILE_WORLD, 0);
      const cx = isoMapOriginX + iso.x;
      const cy = isoMapOriginY + iso.y;

      const isBackWallY = gy < 0;
      const isBackWallX = gx < 0;

      if (isBackWallY || isBackWallX) {
        if (gx < -2 && gy < -2) continue;

        const isGateArea = isBackWallY && gx >= 11 && gx <= 15 && gy === -1;
        const isLavaSpout = isBackWallX && gx === -1 && gy >= 8 && gy <= 9;
        const isWallPillar = (isBackWallY && (gx === 10 || gx === 16) && gy === -1) ||
                             (isBackWallX && (gy === 7 || gy === 10) && gx === -1);

        if (isGateArea) {
          drawIsoPixelBlock(mctx, cx, cy, 18, PAL.ruinDark, 'ruin', h);
          drawIsoPixelBlock(mctx, cx, cy - 54, 18, PAL.ruin, 'ruin', h);
        } else if (isLavaSpout) {
          drawIsoPixelBlock(mctx, cx, cy, 24, PAL.ruinDark, 'ruin', h);
          mctx.fillStyle = '#ea580c';
          mctx.fillRect(Math.round(cx - 8), Math.round(cy - 34), 16, 36);
          mctx.fillStyle = '#fb923c';
          mctx.fillRect(Math.round(cx - 6), Math.round(cy - 32), 10, 34);
          mctx.fillStyle = '#fef08a';
          mctx.fillRect(Math.round(cx - 3), Math.round(cy - 30), 4, 30);
        } else if (isWallPillar) {
          drawIsoPixelBlock(mctx, cx, cy, 74, PAL.ruin, 'rune_wall', h);
        } else if (gy === -2 || gx === -2) {
          const wallH = 52 + Math.floor(h * 22);
          drawIsoPixelBlock(mctx, cx, cy, wallH, PAL.ruinDark, h > 0.6 ? 'rune_wall' : 'ruin', h);
        } else if (gy === -1 || gx === -1) {
          if (gx > 19 || gy > 14) {
            drawIsoPixelBlock(mctx, cx, cy, 24 + Math.floor(h * 12), PAL.grass, 'grass', h);
          } else {
            drawIsoPixelBlock(mctx, cx, cy, 34 + Math.floor(h * 16), PAL.ruin, 'ruin', h);
          }
        } else {
          drawIsoPixelBlock(mctx, cx, cy, 14 + Math.floor(h * 16), h > 0.5 ? PAL.dirt : PAL.grass, h > 0.5 ? 'dirt' : 'grass', h);
        }
        continue;
      }

      const tileKey = `${gx},${gy}`;
      const distCenter = Math.hypot(gx - ISO_GRID_W * 0.5, gy - ISO_GRID_H * 0.5);
      const nearSouthEdge = gx >= ISO_GRID_W - 2 || gy >= ISO_GRID_H - 2;
      const nearBackEdge = gx <= 1 || gy <= 1;

      if (ventTiles.has(tileKey)) {
        drawIsoPixelBlock(mctx, cx, cy, 18, PAL.ruinDark, 'vent', h);
      } else if (distCenter < 6.5) {
        drawIsoPixelBlock(mctx, cx, cy, 18, h > 0.45 ? PAL.ruin : PAL.ruinDark, 'ruin', h);
      } else if (nearSouthEdge) {
        const isGrass = h > 0.32;
        drawIsoPixelBlock(mctx, cx, cy, isGrass ? 20 : 17, isGrass ? PAL.grass : PAL.dirt, isGrass ? 'grass' : 'dirt', h);
      } else if (nearBackEdge) {
        drawIsoPixelBlock(mctx, cx, cy, 19, h > 0.65 ? PAL.grass : PAL.ruin, h > 0.65 ? 'grass' : 'ruin', h);
      } else {
        if (h < 0.42) drawIsoPixelBlock(mctx, cx, cy, 18, PAL.stone, 'stone', h);
        else if (h < 0.72) drawIsoPixelBlock(mctx, cx, cy, 18, PAL.dirt, 'dirt', h);
        else if (h < 0.88) drawIsoPixelBlock(mctx, cx, cy, 18, PAL.ruinDark, 'ruin', h);
        else drawIsoPixelBlock(mctx, cx, cy, 19, PAL.grass, 'grass', h);
      }
    }
  }
}

function buildProceduralFloorPattern() {
  buildIsometricPixelMap(gameState.biomeIndex || 0);
}

// -------------------------------------------------------------------------
// 9C. DYNAMIC NIGHT-SANCTUM LIGHTMAP (ISOMETRIC SPACE)
// -------------------------------------------------------------------------
function drawPointLight(lctx, sx, sy, radius, colorStops) {
  const grad = lctx.createRadialGradient(sx, sy, 2, sx, sy, radius);
  for (let i = 0; i < colorStops.length; i++) {
    grad.addColorStop(colorStops[i][0], colorStops[i][1]);
  }
  lctx.fillStyle = grad;
  lctx.beginPath();
  lctx.ellipse(sx, sy, radius, radius * 0.62, 0, 0, Math.PI * 2);
  lctx.fill();
}

function renderDynamicLightmap(viewW, viewH, originX, originY) {
  if (lightCanvas.width !== viewW || lightCanvas.height !== viewH) {
    lightCanvas.width = viewW;
    lightCanvas.height = viewH;
  }

  lightCtx.save();
  lightCtx.globalCompositeOperation = 'source-over';
  lightCtx.fillStyle = gameState.boss && gameState.boss.phase === 2
    ? 'rgba(72, 46, 58, 0.50)'
    : 'rgba(74, 88, 108, 0.44)';
  lightCtx.fillRect(0, 0, viewW, viewH);

  lightCtx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < PILLARS.length; i++) {
    const pil = PILLARS[i];
    const pos = worldToIso(pil.x, pil.y, 44);
    const flicker = 0.92 + Math.sin(gameState.worldTime * 11 + pil.phase) * 0.1;
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 260 * flicker, [
      [0, 'rgba(255, 225, 130, 0.92)'],
      [0.4, 'rgba(255, 130, 35, 0.45)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  for (let v = 0; v < THERMAL_VENTS.length; v++) {
    const vent = THERMAL_VENTS[v];
    const pos = worldToIso(vent.x, vent.y, 0);
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 130, [
      [0, 'rgba(255, 150, 50, 0.55)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  if (gameState.portalOpen) {
    const gPos = worldToIso(TUNNEL_GATE.x, TUNNEL_GATE.y, 16);
    drawPointLight(lightCtx, originX + gPos.x, originY + gPos.y, 240, [
      [0, 'rgba(120, 245, 255, 0.95)'],
      [0.5, 'rgba(168, 85, 247, 0.45)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  const p = gameState.player;
  if (p) {
    const pos = worldToIso(p.x, p.y, 18);
    const isGold = p.surgeTimer > 0;
    const aspKey = p.weaponAspect || 'solar';
    const isTransformBurst = (p.transformAnimTimer || 0) > 0;
    const inner = isGold
      ? 'rgba(255, 235, 150, 0.95)'
      : aspKey === 'cryo'
      ? 'rgba(155, 245, 255, 0.90)'
      : aspKey === 'volt'
      ? 'rgba(232, 165, 255, 0.94)'
      : 'rgba(255, 205, 120, 0.88)';
    const outer = isGold
      ? 'rgba(255, 155, 35, 0.35)'
      : aspKey === 'cryo'
      ? 'rgba(34, 211, 238, 0.32)'
      : aspKey === 'volt'
      ? 'rgba(192, 132, 252, 0.42)'
      : 'rgba(255, 120, 35, 0.30)';
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, isGold || isTransformBurst ? 350 : 260, [
      [0, inner],
      [0.5, outer],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  if (gameState.boss && gameState.boss.hp > 0) {
    const b = gameState.boss;
    const pos = worldToIso(b.x, b.y, 26);
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 290, [
      [0, b.phase === 2 ? 'rgba(255, 70, 115, 0.88)' : 'rgba(195, 115, 255, 0.72)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  for (let i = 0; i < gameState.shockwaves.length; i++) {
    const sw = gameState.shockwaves[i];
    const pos = worldToIso(sw.x, sw.y, 8);
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, sw.r * 1.1, [
      [0, 'rgba(255, 235, 160, 0.55)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  lightCtx.restore();
}

// -------------------------------------------------------------------------
// 9D. ENTITY PIXEL-ART DRAWERS (PILLARS, HERO FORMS, ELEMENTAL ENEMIES & BOSS)
// -------------------------------------------------------------------------
function drawPixelShadow(c, sx, sy, rx, ry) {
  c.fillStyle = 'rgba(4, 7, 14, 0.52)';
  c.beginPath();
  c.ellipse(Math.round(sx), Math.round(sy), Math.round(rx), Math.round(ry), 0, 0, Math.PI * 2);
  c.fill();
}

function drawIsoPillar(c, pil, sx, sy) {
  drawPixelShadow(c, sx, sy + 4, 28, 14);

  drawIsoPixelBlock(
    c,
    Math.round(sx),
    Math.round(sy - 12),
    42,
    { top: '#475569', left: '#334155', right: '#1e293b', highlight: 'rgba(251,191,36,0.45)' },
    'rune_wall',
    pil.phase
  );

  const topY = Math.round(sy - 46);
  c.fillStyle = '#1e1b18';
  c.fillRect(Math.round(sx - 14), topY - 4, 28, 8);
  c.fillStyle = '#b45309';
  c.fillRect(Math.round(sx - 16), topY - 6, 32, 4);
  c.fillStyle = '#fbbf24';
  c.fillRect(Math.round(sx - 12), topY - 6, 24, 2);

  const f = Math.sin(gameState.worldTime * 14 + pil.phase);
  const f2 = Math.cos(gameState.worldTime * 19 + pil.phase);
  const flameH = 14 + Math.round(f * 4);

  c.fillStyle = '#ea580c';
  c.fillRect(Math.round(sx - 10), topY - 6 - flameH, 20, flameH);
  c.fillRect(Math.round(sx - 6 + f2 * 3), topY - 10 - flameH, 12, 8);
  c.fillStyle = '#fbbf24';
  c.fillRect(Math.round(sx - 7), topY - 4 - Math.round(flameH * 0.72), 14, Math.round(flameH * 0.72));
  c.fillStyle = '#fef9c3';
  c.fillRect(Math.round(sx - 3), topY - 4 - Math.round(flameH * 0.45), 6, Math.round(flameH * 0.45));
}

function drawIsoHero(c, p, sx, sy) {
  const aspKey = p.weaponAspect || 'solar';
  const activeAsp = WEAPON_ASPECTS[aspKey] || WEAPON_ASPECTS.solar;
  const isOverdrive = p.surgeTimer > 0;
  const heroAccent = isOverdrive ? '#ffb800' : activeAsp.color;
  const t = gameState.worldTime;

  const aimIsoX = Math.cos(p.aimAngle) - Math.sin(p.aimAngle);
  const aimIsoY = (Math.cos(p.aimAngle) + Math.sin(p.aimAngle)) * 0.5;
  const screenAimAngle = Math.atan2(aimIsoY, aimIsoX);
  const flipX = aimIsoX < 0;

  const speed = Math.hypot(p.vx, p.vy);
  const bob = speed > 20
    ? Math.abs(Math.sin(t * (aspKey === 'volt' ? 18 : 14))) * (aspKey === 'volt' ? 5 : 4)
    : Math.sin(t * (aspKey === 'cryo' ? 3 : 4.5)) * (aspKey === 'cryo' ? 2.5 : 1.5);

  drawPixelShadow(c, sx, sy + 2, aspKey === 'solar' ? 22 : 19, 10);

  // 1. UNDER-FOOT ELEMENTAL AURA
  c.save();
  if (aspKey === 'solar') {
    const pulse = 24 + Math.sin(t * 7) * 2.5;
    c.strokeStyle = isOverdrive ? 'rgba(254, 240, 138, 0.85)' : 'rgba(255, 106, 0, 0.65)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.ellipse(Math.round(sx), Math.round(sy + 1), pulse, pulse * 0.5, 0, 0, Math.PI * 2);
    c.stroke();
    for (let f = 0; f < 6; f++) {
      const fa = t * 2.6 + f * (Math.PI / 3);
      const fx = Math.round(sx + Math.cos(fa) * 22);
      const fy = Math.round(sy - 4 + Math.sin(fa) * 10 - ((t * 36 + f * 9) % 24));
      c.fillStyle = f % 2 === 0 ? '#fbbf24' : '#ff6a00';
      c.fillRect(fx - 2, fy - 3, 4, 5);
    }
  } else if (aspKey === 'cryo') {
    c.translate(Math.round(sx), Math.round(sy + 1));
    c.scale(1, 0.5);
    c.rotate(t * 0.9);
    c.strokeStyle = 'rgba(103, 232, 249, 0.68)';
    c.lineWidth = 2;
    for (let arm = 0; arm < 3; arm++) {
      const a = (arm * Math.PI) / 3;
      c.beginPath();
      c.moveTo(Math.cos(a) * -28, Math.sin(a) * -28);
      c.lineTo(Math.cos(a) * 28, Math.sin(a) * 28);
      c.stroke();
    }
    c.beginPath();
    c.arc(0, 0, 18, 0, Math.PI * 2);
    c.stroke();
  } else if (aspKey === 'volt') {
    c.strokeStyle = 'rgba(217, 70, 239, 0.72)';
    c.lineWidth = 2.2;
    c.beginPath();
    for (let seg = 0; seg <= 12; seg++) {
      const a = (seg / 12) * Math.PI * 2 + t * 4.5;
      const jit = (seg % 2 === 0 ? 1 : -1) * 3.5;
      const vx = sx + Math.cos(a) * (24 + jit);
      const vy = sy + 1 + Math.sin(a) * (12 + jit * 0.5);
      if (seg === 0) c.moveTo(vx, vy);
      else c.lineTo(vx, vy);
    }
    c.closePath();
    c.stroke();
  }
  c.restore();

  // 2. FLOWING ASSASSIN CLOAK / TALISMAN RIBBONS / FIRE MANTLE
  if (p.scarf && p.scarf.length > 1) {
    const heroIso = worldToIso(p.x, p.y, 0);
    const ox = sx - heroIso.x;
    const oy = sy - heroIso.y;
    for (let s = p.scarf.length - 1; s >= 1; s--) {
      const a = worldToIso(p.scarf[s - 1].x, p.scarf[s - 1].y, 24 - s * 1.6);
      const b = worldToIso(p.scarf[s].x, p.scarf[s].y, 22 - s * 1.6);
      if (aspKey === 'volt') {
        c.strokeStyle = '#090612';
        c.lineWidth = Math.max(9, 20 - s * 1.8);
        c.beginPath();
        c.moveTo(Math.round(ox + a.x), Math.round(oy + a.y));
        c.lineTo(Math.round(ox + b.x), Math.round(oy + b.y));
        c.stroke();
        c.strokeStyle = '#d946ef';
        c.lineWidth = 2.2;
        c.beginPath();
        c.moveTo(Math.round(ox + a.x), Math.round(oy + a.y - 4));
        c.lineTo(Math.round(ox + b.x), Math.round(oy + b.y - 4));
        c.stroke();
      } else if (aspKey === 'cryo') {
        c.strokeStyle = s % 2 === 0 ? '#22d3ee' : '#e0f2fe';
        c.lineWidth = Math.max(3, 8 - s);
        c.beginPath();
        c.moveTo(Math.round(ox + a.x), Math.round(oy + a.y - 2));
        c.lineTo(Math.round(ox + b.x), Math.round(oy + b.y - 2));
        c.stroke();
        c.strokeStyle = '#f43f5e';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(Math.round(ox + a.x), Math.round(oy + a.y + 4));
        c.lineTo(Math.round(ox + b.x), Math.round(oy + b.y + 4));
        c.stroke();
      } else {
        c.strokeStyle = s % 2 === 0 ? '#dc2626' : '#ff6a00';
        c.lineWidth = Math.max(5, 13 - s * 1.3);
        c.beginPath();
        c.moveTo(Math.round(ox + a.x), Math.round(oy + a.y));
        c.lineTo(Math.round(ox + b.x), Math.round(oy + b.y));
        c.stroke();
      }
    }
  }

  // 3. BACK ATTACHMENTS (SOLAR CHAIN / VOLT FLAME AURA / OVERDRIVE WINGS)
  if (isOverdrive) {
    const flap = Math.sin(t * 14) * 5;
    for (let side = -1; side <= 1; side += 2) {
      c.fillStyle = '#f59e0b';
      c.fillRect(Math.round(sx + side * 12 - (side < 0 ? 18 : 0)), Math.round(sy - 38 - bob + flap), 18, 6);
      c.fillRect(Math.round(sx + side * 16 - (side < 0 ? 16 : 0)), Math.round(sy - 44 - bob + flap * 1.3), 16, 5);
      c.fillStyle = '#fef08a';
      c.fillRect(Math.round(sx + side * 10 - (side < 0 ? 14 : 0)), Math.round(sy - 36 - bob + flap), 14, 3);
    }
  } else if (aspKey === 'solar') {
    const dirSide = flipX ? 1 : -1;
    const sway = Math.sin(t * 6.5) * 4;
    const rodX = Math.round(sx + dirSide * 18);
    const rodY = Math.round(sy - 44 - bob);
    c.strokeStyle = '#18181b';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(Math.round(sx), Math.round(sy - 26 - bob));
    c.lineTo(rodX, rodY);
    c.stroke();
    for (let ch = 0; ch < 5; ch++) {
      const cx = Math.round(rodX + sway * (ch / 4));
      const cy = rodY + ch * 5;
      c.fillStyle = '#090b10';
      c.fillRect(cx - 2, cy, 4, 4);
      c.fillStyle = ch % 2 === 0 ? '#f97316' : '#64748b';
      c.fillRect(cx - 1, cy + 1, 2, 2);
    }
  } else if (aspKey === 'volt') {
    for (let vf = 0; vf < 7; vf++) {
      const fx = Math.round(sx + Math.sin(t * 9 + vf * 1.7) * 14);
      const fy = Math.round(sy - 38 - bob - ((t * 38 + vf * 7) % 20));
      c.fillStyle = vf % 2 === 0 ? '#e879f9' : '#a855f7';
      c.fillRect(fx - 2, fy - 2, 4, 4);
    }
  }

  // 4. FORM-SPECIFIC PIXEL SPRITE (16x18)
  let grid = PIXEL_SPRITES.hero_solar;
  let palette;
  if (aspKey === 'cryo') {
    grid = PIXEL_SPRITES.hero_cryo;
    palette = {
      k: '#060a12',
      c: isOverdrive ? '#fde047' : '#0d9488',
      i: '#67e8f9',
      d: p.invulnTimer > 0 ? '#0ea5e9' : '#1e293b',
      w: '#f8fafc',
      r: '#ef4444',
      g: '#fbbf24',
    };
  } else if (aspKey === 'volt') {
    grid = PIXEL_SPRITES.hero_volt;
    palette = {
      k: '#06040c',
      d: p.invulnTimer > 0 ? '#581c87' : '#141124',
      v: isOverdrive ? '#fde047' : '#e879f9',
    };
  } else {
    grid = PIXEL_SPRITES.hero_solar;
    palette = {
      k: '#090b10',
      g: isOverdrive ? '#fef08a' : '#f59e0b',
      d: p.invulnTimer > 0 ? '#0891b2' : '#1f2937',
      f: '#ff6a00',
      y: '#fef08a',
      r: '#dc2626',
    };
  }

  const spr = getCachedPixelSprite(
    `hero2_${aspKey}_${isOverdrive ? 1 : 0}_${p.invulnTimer > 0 ? 1 : 0}`,
    grid,
    palette,
    3,
    flipX,
    false
  );
  c.drawImage(spr, Math.round(sx - spr.width * 0.5), Math.round(sy - spr.height + 5 - bob));

  // เครื่องประดับพริ้วไหวร่าง 2: ลูกปัดห้อยแกว่งจากเขากวาง + ผลึกน้ำแข็งหมุนรอบตัว
  if (aspKey === 'cryo') {
    const swayBead = Math.sin(t * 5.2) * 3.5;
    for (let side = -1; side <= 1; side += 2) {
      const bx = Math.round(sx + side * 16);
      const by = Math.round(sy - 46 - bob);
      c.strokeStyle = '#94a3b8';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(bx, by);
      c.lineTo(bx + swayBead, by + 11);
      c.stroke();
      c.fillStyle = side < 0 ? '#22d3ee' : '#a855f7';
      c.fillRect(Math.round(bx + swayBead) - 2, by + 9, 4, 4);
      c.fillStyle = '#ffffff';
      c.fillRect(Math.round(bx + swayBead) - 1, by + 10, 2, 2);
    }
    for (let k = 0; k < 3; k++) {
      const ca = t * 2.8 + k * ((Math.PI * 2) / 3);
      const cx = Math.round(sx + Math.cos(ca) * 26);
      const cy = Math.round(sy - 26 - bob + Math.sin(ca) * 10);
      c.fillStyle = '#083344';
      c.fillRect(cx - 3, cy - 5, 6, 10);
      c.fillStyle = '#22d3ee';
      c.fillRect(cx - 2, cy - 4, 4, 8);
      c.fillStyle = '#f0f9ff';
      c.fillRect(cx - 1, cy - 2, 2, 4);
    }
  }

  // 5. FORM-SPECIFIC WEAPONS (SOLAR RUNE BLADE / CRYO CHARM LANCE / VOLT LONG SCYTHE)
  c.save();
  c.translate(Math.round(sx), Math.round(sy - 22 - bob));
  c.rotate(screenAimAngle + (p.swordSwingOffset || 0));

  const extraLen = Math.min(14, (p.forgeLevel || 0) * 2);

  if (aspKey === 'volt') {
    const shaftLen = 48 + extraLen;
    c.fillStyle = '#07050f';
    c.fillRect(-16, -3, shaftLen + 16, 6);
    c.fillStyle = '#4c1d95';
    c.fillRect(-15, -2, shaftLen + 14, 4);
    c.fillStyle = '#e879f9';
    c.fillRect(-12, -1, shaftLen + 8, 2);
    c.fillStyle = '#e879f9';
    c.fillRect(-19, -5, 3, 10);

    const tipX = shaftLen - 2;
    c.fillStyle = '#07050f';
    c.beginPath();
    c.moveTo(tipX + 6, -4);
    c.quadraticCurveTo(tipX + 16, 18, tipX - 18, 34);
    c.quadraticCurveTo(tipX - 2, 16, tipX - 5, 2);
    c.closePath();
    c.fill();

    c.fillStyle = isOverdrive ? '#fbbf24' : '#a855f7';
    c.beginPath();
    c.moveTo(tipX + 4, -2);
    c.quadraticCurveTo(tipX + 13, 17, tipX - 15, 31);
    c.quadraticCurveTo(tipX - 1, 15, tipX - 3, 2);
    c.closePath();
    c.fill();

    c.fillStyle = isOverdrive ? '#fef08a' : '#f5d0fe';
    c.beginPath();
    c.moveTo(tipX + 3, 0);
    c.quadraticCurveTo(tipX + 9, 14, tipX - 11, 26);
    c.quadraticCurveTo(tipX + 2, 14, tipX - 1, 2);
    c.closePath();
    c.fill();

    const sparkOff = Math.round(Math.sin(t * 28) * 3);
    c.fillStyle = '#ffffff';
    c.fillRect(tipX + 5 + sparkOff, 10, 3, 3);
    c.fillStyle = '#e879f9';
    c.fillRect(tipX - 6 - sparkOff, 22, 3, 3);
  } else if (aspKey === 'cryo') {
    const shaftLen = 32 + extraLen;
    c.fillStyle = '#060a12';
    c.fillRect(-6, -3, shaftLen + 6, 6);
    c.fillStyle = '#64748b';
    c.fillRect(-5, -2, shaftLen + 4, 4);
    c.fillStyle = '#fbbf24';
    c.fillRect(-8, -3, 4, 6);

    c.fillStyle = '#0891b2';
    c.fillRect(8, -11, 5, 22);
    c.fillStyle = '#a5f3fc';
    c.fillRect(9, -9, 3, 18);
    const beadWave = Math.sin(t * 8) * 3;
    for (let b = 1; b <= 3; b++) {
      c.fillStyle = b === 2 ? '#c084fc' : '#22d3ee';
      c.fillRect(10 + Math.round(beadWave * (b * 0.4)), 10 + b * 5, 4, 4);
    }

    c.fillStyle = '#060a12';
    c.beginPath();
    c.moveTo(13, -7); c.lineTo(shaftLen + 22, 0); c.lineTo(13, 7);
    c.closePath();
    c.fill();
    c.fillStyle = isOverdrive ? '#fbbf24' : '#38bdf8';
    c.beginPath();
    c.moveTo(14, -5); c.lineTo(shaftLen + 19, 0); c.lineTo(14, 5);
    c.closePath();
    c.fill();
    c.fillStyle = '#f0f9ff';
    c.fillRect(15, -1, shaftLen - 2, 2);
  } else {
    const bladeLen = 40 + extraLen;
    c.fillStyle = '#090b10';
    c.fillRect(4, -12, 7, 24);
    c.fillStyle = '#f59e0b';
    c.fillRect(5, -11, 5, 22);
    c.fillStyle = '#090b10';
    c.fillRect(11, -7, bladeLen + 4, 14);
    c.fillStyle = '#18181b';
    c.fillRect(12, -5, bladeLen, 10);
    c.fillStyle = heroAccent;
    c.fillRect(12, -6, bladeLen, 2);
    c.fillRect(12, 4, bladeLen, 2);
    for (let rn = 0; rn < 4; rn++) {
      const rx = 16 + rn * 8;
      c.fillStyle = rn % 2 === 0 ? '#ff6a00' : '#fef08a';
      c.fillRect(rx, -2, 4, 4);
    }
    const fl = Math.round(Math.sin(t * 24) * 2);
    c.fillStyle = '#ff6a00';
    c.fillRect(22 + fl, -9, 6, 3);
    c.fillRect(30 - fl, 6, 6, 3);
  }
  c.restore();

  // 6. EPIC TRANSFORMATION BURST VFX (เสาเพลิง / แท่งน้ำแข็งพุ่ง / ฟ้าฟาด 3 สาย)
  if ((p.transformAnimTimer || 0) > 0) {
    const maxT = p.transformAnimMax || 1.15;
    const prog = Math.min(1, p.transformAnimTimer / maxT);
    c.save();
    c.globalAlpha = Math.min(1, prog * 1.4);
    if (aspKey === 'solar') {
      const colW = Math.round(48 * prog);
      c.fillStyle = 'rgba(255, 106, 0, 0.35)';
      c.fillRect(Math.round(sx - colW * 0.5), Math.round(sy - 190), colW, 195);
      c.fillStyle = 'rgba(254, 240, 138, 0.72)';
      c.fillRect(Math.round(sx - colW * 0.22), Math.round(sy - 190), Math.max(4, Math.round(colW * 0.44)), 195);
      c.strokeStyle = '#fbbf24';
      c.lineWidth = 4 * prog + 1;
      c.beginPath();
      c.ellipse(Math.round(sx), Math.round(sy - 14), 66 * (1.2 - prog * 0.5), 30 * (1.2 - prog * 0.5), 0, 0, Math.PI * 2);
      c.stroke();
    } else if (aspKey === 'cryo') {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + (1 - prog) * 0.5;
        const ix = Math.round(sx + Math.cos(a) * (38 * (1.15 - prog * 0.35)));
        const iy = Math.round(sy + Math.sin(a) * 19);
        const h = Math.round((28 + (i % 2) * 12) * prog);
        c.fillStyle = '#0284c7';
        c.fillRect(ix - 4, iy - h, 8, h);
        c.fillStyle = '#67e8f9';
        c.fillRect(ix - 3, iy - h, 5, h);
        c.fillStyle = '#ffffff';
        c.fillRect(ix - 1, iy - h, 2, Math.round(h * 0.75));
      }
    } else if (aspKey === 'volt') {
      const bolts = [
        { ox: 0, w: 7, jitter: 14 },
        { ox: -28, w: 4, jitter: 10 },
        { ox: 28, w: 4, jitter: 10 },
      ];
      for (let b = 0; b < bolts.length; b++) {
        const bt = bolts[b];
        const bx = sx + bt.ox;
        const jit = Math.sin(t * 60 + b * 2) * bt.jitter;
        c.strokeStyle = '#e879f9';
        c.lineWidth = bt.w * prog + 2;
        c.beginPath();
        c.moveTo(Math.round(bx + jit * 0.6), Math.round(sy - 240));
        c.lineTo(Math.round(bx - jit), Math.round(sy - 160));
        c.lineTo(Math.round(bx + jit * 0.8), Math.round(sy - 85));
        c.lineTo(Math.round(bx), Math.round(sy - 6));
        c.stroke();
        c.strokeStyle = '#ffffff';
        c.lineWidth = Math.max(1.5, bt.w * 0.45 * prog);
        c.stroke();
      }
    }
    c.restore();
  }
}

function drawIsoEnemy(c, en, sx, sy) {
  const isBoss = en === gameState.boss;
  const p = gameState.player;
  const flipX = p ? (p.x - p.y) < (en.x - en.y) : false;
  const bob = Math.abs(Math.sin(gameState.worldTime * (en.type === 'husk' ? 14 : 7) + en.x * 0.05)) * (isBoss ? 5 : 3);

  drawPixelShadow(c, sx, sy + 3, isBoss ? 34 : en.r * 0.95, isBoss ? 17 : en.r * 0.48);

  const elKey = en.element || 'normal';
  if (!isBoss && elKey !== 'normal') {
    const elInfo = MONSTER_ELEMENTS[elKey] || MONSTER_ELEMENTS.normal;
    c.strokeStyle = elInfo.color;
    c.globalAlpha = 0.55;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(Math.round(sx), Math.round(sy + 2), en.r + 3, (en.r + 3) * 0.48, 0, 0, Math.PI * 2);
    c.stroke();
    c.globalAlpha = 1;
  }

  if (en.slowTimer > 0) {
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(Math.round(sx), Math.round(sy + 2), en.r + 5, (en.r + 5) * 0.5, 0, 0, Math.PI * 2);
    c.stroke();
  }

  if (en.type === 'weaver') {
    c.save();
    c.translate(Math.round(sx + (flipX ? -18 : 18)), Math.round(sy - 20 - bob));
    c.strokeStyle = elKey === 'fire' ? '#fb923c' : elKey === 'ice' ? '#38bdf8' : '#e879f9';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, 0, 10 + Math.sin(gameState.worldTime * 8) * 2, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  let spr;
  let label = en.displayName || en.type;
  if (isBoss) {
    const bArch = BOSS_ARCHETYPES[en.archetype] || BOSS_ARCHETYPES.sovereign;
    const accent = en.phase === 2 ? bArch.enrageColor : bArch.primaryColor;
    const formKey = en.visualForm || 'boss_overlord';
    const bossGrid = PIXEL_SPRITES[formKey] || PIXEL_SPRITES.boss_overlord;
    spr = getCachedPixelSprite(
      `${formKey}_${en.archetype}_${en.phase}`,
      bossGrid,
      { k: '#06080d', d: en.phase === 2 ? '#4c0519' : '#1e293b', g: accent, c: '#fef08a', v: '#ffffff' },
      4,
      flipX,
      en.hitFlash > 0
    );
    label = en.name;
  } else if (en.type === 'juggernaut') {
    const primary = en.slowTimer > 0 ? '#38bdf8' : elKey === 'fire' ? '#b45309' : elKey === 'ice' ? '#0284c7' : elKey === 'volt' ? '#6d28d9' : '#475569';
    const core = elKey === 'fire' ? '#ff6a00' : elKey === 'ice' ? '#22d3ee' : elKey === 'volt' ? '#e879f9' : '#ff2a5f';
    spr = getCachedPixelSprite(
      `jug_${elKey}_${en.slowTimer > 0 ? 1 : 0}`,
      PIXEL_SPRITES.juggernaut,
      { k: '#090b10', s: primary, d: '#1e293b', r: core, f: '#fde047' },
      3,
      flipX,
      en.hitFlash > 0
    );
  } else if (en.type === 'weaver') {
    const robe = en.slowTimer > 0 ? '#0284c7' : elKey === 'fire' ? '#9a3412' : elKey === 'ice' ? '#0369a1' : elKey === 'volt' ? '#581c87' : '#6b21a8';
    const trim = elKey === 'fire' ? '#fb923c' : elKey === 'ice' ? '#67e8f9' : '#c084fc';
    spr = getCachedPixelSprite(
      `wev_${elKey}_${en.slowTimer > 0 ? 1 : 0}`,
      PIXEL_SPRITES.weaver,
      { k: '#090b10', p: robe, m: trim, d: '#1e1b4b', c: '#38bdf8' },
      3,
      flipX,
      en.hitFlash > 0
    );
  } else if (en.type === 'stalker') {
    const body = en.slowTimer > 0 ? '#0284c7' : elKey === 'fire' ? '#991b1b' : elKey === 'ice' ? '#0c4a6e' : '#312e81';
    const blade = elKey === 'fire' ? '#fbbf24' : elKey === 'ice' ? '#67e8f9' : '#e879f9';
    spr = getCachedPixelSprite(
      `stk_${elKey}_${en.slowTimer > 0 ? 1 : 0}`,
      PIXEL_SPRITES.stalker,
      { k: '#090b10', v: body, d: '#0f172a', c: blade },
      3,
      flipX,
      en.hitFlash > 0
    );
  } else {
    const skin = en.slowTimer > 0 ? '#0284c7' : elKey === 'fire' ? '#ea580c' : elKey === 'ice' ? '#0284c7' : elKey === 'volt' ? '#7e22ce' : '#be123c';
    const dark = elKey === 'fire' ? '#7c2d12' : elKey === 'ice' ? '#082f49' : elKey === 'volt' ? '#3b0764' : '#4c0519';
    spr = getCachedPixelSprite(
      `hsk_${elKey}_${en.slowTimer > 0 ? 1 : 0}`,
      PIXEL_SPRITES.husk,
      { k: '#090b10', r: skin, d: dark, y: '#fbbf24' },
      3,
      flipX,
      en.hitFlash > 0
    );
  }

  const sqX = 1 + (en.squash || 0) * 0.25;
  const sqY = 1 - (en.squash || 0) * 0.2;
  const drawW = Math.round(spr.width * sqX);
  const drawH = Math.round(spr.height * sqY);
  c.drawImage(spr, Math.round(sx - drawW * 0.5), Math.round(sy - drawH + 4 - bob), drawW, drawH);

  // Orbiting Skulls for Arch-Lich Boss
  if (isBoss && en.visualForm === 'boss_lich') {
    for (let s = 0; s < 3; s++) {
      const sa = gameState.worldTime * 3.2 + s * ((Math.PI * 2) / 3);
      const ox = Math.round(sx + Math.cos(sa) * 38);
      const oy = Math.round(sy - 34 + Math.sin(sa) * 14);
      c.fillStyle = '#090b10';
      c.fillRect(ox - 5, oy - 5, 10, 10);
      c.fillStyle = '#e2e8f0';
      c.fillRect(ox - 4, oy - 4, 8, 8);
      c.fillStyle = '#ff2a5f';
      c.fillRect(ox - 2, oy - 1, 2, 2);
      c.fillRect(ox + 1, oy - 1, 2, 2);
    }
  }

  if (!isBoss) {
    const bw = en.type === 'juggernaut' ? 44 : 32;
    const bx = Math.round(sx - bw * 0.5);
    const by = Math.round(sy - drawH - 8 - bob);
    const elInfo = MONSTER_ELEMENTS[elKey] || MONSTER_ELEMENTS.normal;

    if (en.hp < en.maxHp || en.type === 'juggernaut' || en.type === 'weaver' || elKey !== 'normal') {
      c.fillStyle = '#090b10';
      c.fillRect(bx - 1, by - 1, bw + 2, 6);
      c.fillStyle = '#3f1d2e';
      c.fillRect(bx, by, bw, 4);
      c.fillStyle = elInfo.color;
      c.fillRect(bx, by, Math.round(bw * Math.max(0, en.hp / en.maxHp)), 4);

      c.font = '700 10px Silkscreen, monospace';
      c.textAlign = 'center';
      c.lineWidth = 3;
      c.strokeStyle = '#04060a';
      c.strokeText(label, Math.round(sx), by - 4);
      c.fillStyle = elKey === 'normal' ? '#f8fafc' : elInfo.color;
      c.fillText(label, Math.round(sx), by - 4);
    }
  }

  // Elemental Primer & Vulnerable Badges above enemy (ส้ม=ไฟ, ฟ้า=น้ำแข็ง, ม่วง=สายฟ้า, แดง=เกราะแตก)
  const badges = [];
  if ((en.burnTimer || 0) > 0 || en.element === 'fire') badges.push('#ff6a00');
  if ((en.slowTimer || 0) > 0 || en.element === 'ice') badges.push('#22d3ee');
  if ((en.shockTimer || 0) > 0 || en.element === 'volt') badges.push('#c084fc');
  if ((en.vulnTimer || 0) > 0) badges.push('#f43f5e');

  if (badges.length > 0) {
    const startX = Math.round(sx - ((badges.length - 1) * 10) * 0.5);
    const badgeY = Math.round(sy - drawH - (isBoss ? 14 : 24) - bob);
    for (let b = 0; b < badges.length; b++) {
      const bx = startX + b * 10;
      c.fillStyle = '#090b10';
      c.fillRect(bx - 4, badgeY - 4, 8, 8);
      c.fillStyle = badges[b];
      c.fillRect(bx - 3, badgeY - 3, 6, 6);
    }
  }
}

// -------------------------------------------------------------------------
// 9E. MAIN ISOMETRIC ARENA RENDER LOOP
// -------------------------------------------------------------------------
function renderArena() {
  const viewW = canvas.clientWidth || window.innerWidth;
  const viewH = canvas.clientHeight || window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (canvas.width !== Math.floor(viewW * dpr) || canvas.height !== Math.floor(viewH * dpr)) {
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
  }

  if (!isoMapCanvas) {
    buildIsometricPixelMap(gameState.biomeIndex || 0);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // 0. Biome-Aware Atmospheric Backdrop
  const activeBiome = ROOM_BIOMES[(gameState.biomeIndex || 0) % ROOM_BIOMES.length];
  const bgGrad = ctx.createLinearGradient(0, 0, 0, viewH);
  bgGrad.addColorStop(0, activeBiome ? activeBiome.skyTop : '#132429');
  bgGrad.addColorStop(0.55, activeBiome ? activeBiome.skyMid : '#192f34');
  bgGrad.addColorStop(1, activeBiome ? activeBiome.skyBot : '#0b161a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, viewW, viewH);

  const shakeMag = gameState.shakeMag;
  const jitter = shakeMag > 0 ? (Math.random() - 0.5) * shakeMag * 0.6 : 0;
  const shakeX = shakeMag > 0 ? gameState.shakeDirX * shakeMag * 1.3 + jitter : 0;
  const shakeY = shakeMag > 0 ? gameState.shakeDirY * shakeMag * 1.3 - jitter : 0;

  const camIso = worldToIso(gameState.camera.x, gameState.camera.y, 0);
  const originX = Math.round(viewW * 0.5 - camIso.x + shakeX);
  const originY = Math.round(viewH * 0.5 - camIso.y + shakeY);

  // 1. Baked Isometric Pixel-Art Terrain Map
  ctx.drawImage(isoMapCanvas, originX - isoMapOriginX, originY - isoMapOriginY);

  // 2. Animated Swamp Lily Pads & Reeds
  for (let i = 0; i < isoWaterProps.length; i++) {
    const prop = isoWaterProps[i];
    const pos = worldToIso(prop.x, prop.y, -4);
    const sx = Math.round(originX + pos.x);
    const sy = Math.round(originY + pos.y);
    const bob = Math.sin(gameState.worldTime * 2.4 + prop.phase) * 1.5;

    if (prop.kind === 'lily') {
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(sx - 8, Math.round(sy - 4 + bob), 16, 8);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(sx - 6, Math.round(sy - 3 + bob), 12, 5);
      ctx.fillStyle = '#1f5a63';
      ctx.fillRect(sx + 2, Math.round(sy - 2 + bob), 4, 2);
    } else {
      const sway = Math.round(Math.sin(gameState.worldTime * 2.8 + prop.phase) * 2);
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(sx - 1, sy - 18, 2, 18);
      ctx.fillRect(sx + 4, sy - 14, 2, 14);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx - 2 + sway, sy - 22, 4, 7);
    }
  }

  // 2B. NORTHERN TUNNEL GATEWAY PORTAL (เปิดเมื่อเคลียร์เวฟเสร็จ)
  if (gameState.portalOpen) {
    const gPos = worldToIso(TUNNEL_GATE.x, TUNNEL_GATE.y, 14);
    const gx = Math.round(originX + gPos.x);
    const gy = Math.round(originY + gPos.y);
    const pulse = 0.85 + Math.sin(gameState.worldTime * 7) * 0.15;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pg = ctx.createRadialGradient(gx, gy, 6, gx, gy, 78 * pulse);
    pg.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
    pg.addColorStop(0.35, 'rgba(34, 211, 238, 0.78)');
    pg.addColorStop(0.7, 'rgba(168, 85, 247, 0.36)');
    pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(gx, gy, 68 * pulse, 44 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.font = '700 11px Silkscreen, monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#04060a';
    const bounceY = Math.round(Math.sin(gameState.worldTime * 6) * 4);
    const gateText = `▼ ENTER TUNNEL (WAVE ${gameState.wave + 1}) ▼`;
    ctx.strokeText(gateText, gx, gy - 44 + bounceY);
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(gateText, gx, gy - 44 + bounceY);
    ctx.restore();
  }

  // 3. Isometric Ground-Projected Decals, Ground Cracks, Volt Magic Circle & Boss Telegraphs
  const withIsoGroundPlane = (wx, wy, wz, drawFn) => {
    const pos = worldToIso(wx, wy, wz);
    ctx.save();
    ctx.translate(originX + pos.x, originY + pos.y);
    ctx.transform(0.5, 0.25, -0.5, 0.25, 0, 0);
    drawFn();
    ctx.restore();
  };

  for (let i = 0; i < gameState.floorDecals.length; i++) {
    const dec = gameState.floorDecals[i];
    const lifeRatio = typeof dec.life === 'number' && dec.maxLife ? Math.max(0, dec.life / dec.maxLife) : 1;
    withIsoGroundPlane(dec.x, dec.y, 1, () => {
      if (String(dec.kind).startsWith('crack_')) {
        const crackCol = dec.kind === 'crack_solar' ? '#ff6a00' : dec.kind === 'crack_cryo' ? '#38bdf8' : '#d946ef';
        const coreCol = dec.kind === 'crack_solar' ? '#fef08a' : dec.kind === 'crack_cryo' ? '#e0f2fe' : '#f5d0fe';
        ctx.globalAlpha = Math.min(1, lifeRatio * 1.25);
        ctx.rotate(dec.rot || 0);
        ctx.fillStyle = 'rgba(5, 7, 12, 0.72)';
        ctx.beginPath();
        ctx.arc(0, 0, dec.r * 0.36, 0, Math.PI * 2);
        ctx.fill();
        for (let f = 0; f < 7; f++) {
          const ang = (f / 7) * Math.PI * 2 + (f % 2) * 0.2;
          const len = dec.r * (0.72 + (f % 3) * 0.16);
          const mx = Math.cos(ang + 0.14) * (len * 0.52);
          const my = Math.sin(ang + 0.14) * (len * 0.52);
          const ex = Math.cos(ang) * len;
          const ey = Math.sin(ang) * len;

          ctx.strokeStyle = '#05070c';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(mx, my); ctx.lineTo(ex, ey);
          ctx.stroke();

          ctx.strokeStyle = crackCol;
          ctx.lineWidth = 3.5;
          ctx.stroke();

          ctx.strokeStyle = coreCol;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      } else {
        ctx.globalAlpha = lifeRatio * 0.75;
        ctx.fillStyle = dec.kind === 'frost' ? 'rgba(34,211,238,0.28)' : dec.kind === 'shock' ? 'rgba(168,85,247,0.22)' : 'rgba(10,12,18,0.58)';
        ctx.strokeStyle = dec.kind === 'frost' ? '#67e8f9' : 'rgba(255,106,0,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, dec.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  // 3B. VOLT REAPER TRANSFORMATION MAGIC CIRCLE
  if (
    gameState.player &&
    gameState.player.weaponAspect === 'volt' &&
    (gameState.player.transformAnimTimer || 0) > 0 &&
    voltSigilCanvas
  ) {
    const pHero = gameState.player;
    const maxT = pHero.transformAnimMax || 1.45;
    const remain = Math.max(0, pHero.transformAnimTimer / maxT);
    const elapsed = 1 - remain;
    const popScale = Math.min(1, elapsed * 4.2);
    const alpha = remain > 0.35 ? 0.95 : (remain / 0.35) * 0.95;
    const drawRadius = 155 * (0.4 + popScale * 0.6);

    withIsoGroundPlane(pHero.x, pHero.y, 2, () => {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha;
      ctx.rotate(gameState.worldTime * 1.4);
      ctx.drawImage(voltSigilCanvas, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);

      const glow = ctx.createRadialGradient(0, 0, drawRadius * 0.1, 0, 0, drawRadius * 1.05);
      glow.addColorStop(0, 'rgba(232, 121, 249, 0.36)');
      glow.addColorStop(0.65, 'rgba(168, 85, 247, 0.16)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, drawRadius * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  if (gameState.boss && gameState.boss.telegraph) {
    const tel = gameState.boss.telegraph;
    const prog = 1 - Math.max(0, tel.timer / tel.maxTimer);
    withIsoGroundPlane(tel.x, tel.y, 2, () => {
      if (tel.kind === 'beam') {
        ctx.rotate(tel.angle);
        ctx.fillStyle = 'rgba(255, 42, 95, 0.22)';
        ctx.fillRect(0, -28, tel.r, 56);
        ctx.fillStyle = `rgba(255, 42, 95, ${(0.25 + prog * 0.4).toFixed(2)})`;
        ctx.fillRect(0, -28 * prog, tel.r, 56 * prog);
        ctx.strokeStyle = '#ff2a5f';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, -28, tel.r, 56);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, tel.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 42, 95, 0.18)';
        ctx.fill();
        ctx.strokeStyle = '#ff2a5f';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, tel.r * prog, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 42, 95, 0.36)';
        ctx.fill();
      }
    });
  }

  // 4. Depth-Sorted 2.5D Render Queue
  const renderQueue = [];
  for (let i = 0; i < PILLARS.length; i++) renderQueue.push({ depth: PILLARS[i].x + PILLARS[i].y, kind: 'pillar', obj: PILLARS[i] });
  for (let i = 0; i < gameState.loots.length; i++) renderQueue.push({ depth: gameState.loots[i].x + gameState.loots[i].y, kind: 'loot', obj: gameState.loots[i] });
  for (let i = 0; i < gameState.dissolvingCorpses.length; i++) renderQueue.push({ depth: gameState.dissolvingCorpses[i].x + gameState.dissolvingCorpses[i].y, kind: 'corpse', obj: gameState.dissolvingCorpses[i] });
  for (let i = 0; i < gameState.afterimages.length; i++) renderQueue.push({ depth: gameState.afterimages[i].x + gameState.afterimages[i].y - 1, kind: 'afterimage', obj: gameState.afterimages[i] });
  for (let i = 0; i < gameState.enemies.length; i++) renderQueue.push({ depth: gameState.enemies[i].x + gameState.enemies[i].y, kind: 'enemy', obj: gameState.enemies[i] });
  if (gameState.boss && gameState.boss.hp > 0) renderQueue.push({ depth: gameState.boss.x + gameState.boss.y, kind: 'enemy', obj: gameState.boss });
  if (gameState.player) renderQueue.push({ depth: gameState.player.x + gameState.player.y, kind: 'hero', obj: gameState.player });

  renderQueue.sort((a, b) => a.depth - b.depth);

  for (let i = 0; i < renderQueue.length; i++) {
    const item = renderQueue[i];
    const pos = worldToIso(item.obj.x, item.obj.y, 0);
    const sx = originX + pos.x;
    const sy = originY + pos.y;

    if (item.kind === 'pillar') {
      drawIsoPillar(ctx, item.obj, sx, sy);
    } else if (item.kind === 'hero') {
      drawIsoHero(ctx, item.obj, sx, sy);
    } else if (item.kind === 'enemy') {
      drawIsoEnemy(ctx, item.obj, sx, sy);
    } else if (item.kind === 'loot') {
      const orb = item.obj;
      const bounce = Math.abs(Math.sin(gameState.worldTime * 5 + orb.x)) * 5;
      const col = orb.kind === 'heal' ? '#22c55e' : orb.kind === 'surge' ? '#f59e0b' : '#38bdf8';
      drawPixelShadow(ctx, sx, sy + 2, 7, 3.5);
      ctx.fillStyle = '#090b10';
      ctx.fillRect(Math.round(sx - 6), Math.round(sy - 10 - bounce), 12, 12);
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(sx - 5), Math.round(sy - 9 - bounce), 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(sx - 3), Math.round(sy - 7 - bounce), 4, 4);
    } else if (item.kind === 'corpse') {
      const dc = item.obj;
      const a = Math.max(0, dc.life / dc.maxLife);
      ctx.save();
      ctx.globalAlpha = a * 0.7;
      ctx.fillStyle = '#ff6a00';
      ctx.fillRect(Math.round(sx - 10), Math.round(sy - 14), 20, 14);
      ctx.restore();
    } else if (item.kind === 'afterimage') {
      const ai = item.obj;
      const curAsp = (gameState.player && gameState.player.weaponAspect) || 'solar';
      const sprGrid = curAsp === 'cryo' ? PIXEL_SPRITES.hero_cryo : curAsp === 'volt' ? PIXEL_SPRITES.hero_volt : PIXEL_SPRITES.hero_solar;
      const aiPal = curAsp === 'volt'
        ? { k: '#581c87', d: '#7e22ce', v: '#f5d0fe' }
        : curAsp === 'cryo'
        ? { k: '#0284c7', c: '#38bdf8', i: '#bae6fd', d: '#0369a1', w: '#ffffff', g: '#7dd3fc', r: '#e0f2fe' }
        : { k: '#9a3412', g: '#fbbf24', d: '#ea580c', f: '#fdba74', y: '#fef08a', r: '#f97316' };
      const flipAi = gameState.player ? (Math.cos(gameState.player.aimAngle) - Math.sin(gameState.player.aimAngle)) < 0 : false;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ai.alpha * 0.65);
      const spr = getCachedPixelSprite(`hero2_ai_${curAsp}`, sprGrid, aiPal, 3, flipAi, false);
      ctx.drawImage(spr, Math.round(sx - spr.width * 0.5), Math.round(sy - spr.height + 5));
      ctx.restore();
    }
  }

  // 5. Additive Pixel-Styled Combat VFX Pass
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < gameState.slashCrescents.length; i++) {
    const sc = gameState.slashCrescents[i];
    const alpha = Math.max(0, sc.life / sc.maxLife);
    withIsoGroundPlane(sc.x, sc.y, 18, () => {
      ctx.globalAlpha = alpha * 0.78;
      ctx.fillStyle = sc.color;
      ctx.beginPath();
      ctx.arc(0, 0, sc.outerR, sc.angle - sc.halfArc, sc.angle + sc.halfArc, false);
      ctx.arc(0, 0, sc.innerR, sc.angle + sc.halfArc, sc.angle - sc.halfArc, true);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sc.coreColor;
      ctx.lineWidth = 6 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, sc.outerR * 0.96, sc.angle - sc.halfArc * 0.9, sc.angle + sc.halfArc * 0.9);
      ctx.stroke();
    });
  }

  for (let i = 0; i < gameState.slashes.length; i++) {
    const sl = gameState.slashes[i];
    const alpha = Math.max(0, sl.life / sl.maxLife);
    withIsoGroundPlane(sl.x, sl.y, 18, () => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sl.color;
      ctx.lineWidth = 14 * alpha + 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius, sl.angle - sl.halfArc, sl.angle + sl.halfArc);
      ctx.stroke();
    });
  }

  for (let i = 0; i < gameState.overdriveSigils.length; i++) {
    const osig = gameState.overdriveSigils[i];
    const lifeFrac = Math.max(0, osig.life / osig.maxLife);
    withIsoGroundPlane(osig.x, osig.y, 3, () => {
      ctx.rotate(osig.rot);
      ctx.globalAlpha = Math.min(0.85, 0.35 + lifeFrac * 0.5);
      ctx.strokeStyle = '#ffb800';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, osig.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t < 3; t++) {
        const a1 = -Math.PI * 0.5 + t * ((Math.PI * 2) / 3);
        const a2 = -Math.PI * 0.5 + ((t + 1) % 3) * ((Math.PI * 2) / 3);
        ctx.moveTo(Math.cos(a1) * osig.r * 0.85, Math.sin(a1) * osig.r * 0.85);
        ctx.lineTo(Math.cos(a2) * osig.r * 0.85, Math.sin(a2) * osig.r * 0.85);
      }
      ctx.stroke();
    });
  }

  for (let i = 0; i < gameState.astralRings.length; i++) {
    const ar = gameState.astralRings[i];
    const alpha = Math.max(0, ar.life / ar.maxLife);
    withIsoGroundPlane(ar.x, ar.y, 4, () => {
      ctx.rotate(ar.rot);
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = ar.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, ar.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ar.r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  for (let i = 0; i < gameState.shockwaves.length; i++) {
    const sw = gameState.shockwaves[i];
    const alpha = Math.max(0, sw.life / sw.maxLife);
    withIsoGroundPlane(sw.x, sw.y, 6, () => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth * 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, sw.r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  for (let i = 0; i < gameState.lightningArcs.length; i++) {
    const arc = gameState.lightningArcs[i];
    const a = Math.max(0, arc.life / arc.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = arc.color;
    ctx.lineWidth = arc.width + 2;
    ctx.beginPath();
    for (let k = 0; k < arc.pts.length; k++) {
      const pPos = worldToIso(arc.pts[k].x, arc.pts[k].y, 24);
      const lx = Math.round(originX + pPos.x);
      const ly = Math.round(originY + pPos.y);
      if (k === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, arc.width * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < gameState.playerBolts.length; i++) {
    const b = gameState.playerBolts[i];
    const pos = worldToIso(b.x, b.y, 18);
    ctx.fillStyle = '#ffb800';
    ctx.fillRect(Math.round(originX + pos.x - 5), Math.round(originY + pos.y - 5), 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(originX + pos.x - 2), Math.round(originY + pos.y - 2), 4, 4);
  }

  for (let i = 0; i < gameState.enemyProjectiles.length; i++) {
    const pr = gameState.enemyProjectiles[i];
    const pos = worldToIso(pr.x, pr.y, 18);
    ctx.fillStyle = pr.color;
    ctx.fillRect(Math.round(originX + pos.x - 5), Math.round(originY + pos.y - 5), 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(originX + pos.x - 2), Math.round(originY + pos.y - 2), 4, 4);
  }

  for (let i = 0; i < gameState.iceShards.length; i++) {
    const sh = gameState.iceShards[i];
    const pos = worldToIso(sh.x, sh.y, 18);
    ctx.globalAlpha = Math.max(0, sh.life / sh.maxLife);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(Math.round(originX + pos.x - 4), Math.round(originY + pos.y - 4), 8, 8);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(Math.round(originX + pos.x - 2), Math.round(originY + pos.y - 2), 4, 4);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < gameState.sparks.length; i++) {
    const sp = gameState.sparks[i];
    const pos = worldToIso(sp.x, sp.y, 16);
    const sz = Math.max(2, Math.round(sp.size * 1.4));
    ctx.globalAlpha = Math.max(0, sp.life / sp.maxLife);
    ctx.fillStyle = sp.color;
    ctx.fillRect(Math.round(originX + pos.x), Math.round(originY + pos.y), sz, sz);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < gameState.brazierSmoke.length; i++) {
    const sm = gameState.brazierSmoke[i];
    const pos = worldToIso(sm.x, sm.y, 62 + (1.7 - sm.life) * 28);
    ctx.globalAlpha = Math.max(0, (sm.life / sm.maxLife) * 0.24);
    ctx.fillStyle = '#94a3b8';
    const r = Math.round(sm.r * 0.9);
    ctx.fillRect(Math.round(originX + pos.x - r * 0.5), Math.round(originY + pos.y - r * 0.5), r, r);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < gameState.ambientEmbers.length; i++) {
    const emb = gameState.ambientEmbers[i];
    const pos = worldToIso(emb.x, emb.y, 20 + Math.sin(gameState.worldTime * 2 + emb.phase) * 14);
    const a = 0.35 + (Math.sin(gameState.worldTime * 3 + emb.phase) + 1) * 0.28;
    ctx.fillStyle = emb.cyan ? `rgba(34,211,238,${a.toFixed(2)})` : `rgba(255,180,50,${a.toFixed(2)})`;
    ctx.fillRect(Math.round(originX + pos.x), Math.round(originY + pos.y), 3, 3);
  }
  ctx.restore();

  // 6. Dynamic Lightmap Multiply Pass
  renderDynamicLightmap(viewW, viewH, originX, originY);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(lightCanvas, 0, 0, viewW, viewH);
  ctx.restore();

  const vig = ctx.createRadialGradient(
    viewW * 0.5, viewH * 0.5, Math.min(viewW, viewH) * 0.38,
    viewW * 0.5, viewH * 0.5, Math.max(viewW, viewH) * 0.78
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(3,6,10,0.52)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, viewW, viewH);

  if (gameState.chromaticTimer > 0) {
    const ca = Math.min(0.45, gameState.chromaticTimer * 2.2);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(255, 42, 95, ${ca.toFixed(3)})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, viewW - 8, viewH - 8);
    ctx.strokeStyle = `rgba(34, 211, 238, ${ca.toFixed(3)})`;
    ctx.strokeRect(10, 10, viewW - 20, viewH - 20);
    ctx.restore();
  }

  // 7. Bold Outlined Floating Damage Numbers
  ctx.textAlign = 'center';
  for (let i = 0; i < gameState.floatingTexts.length; i++) {
    const ft = gameState.floatingTexts[i];
    const pos = worldToIso(ft.x, ft.y, 44);
    const tx = Math.round(originX + pos.x);
    const ty = Math.round(originY + pos.y);
    const isCritText = String(ft.text).includes('!');

    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.font = `800 ${Math.round(15 * ft.scale)}px Silkscreen, monospace`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#06080d';
    ctx.strokeText(ft.text, tx, ty);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, tx, ty);

    if (
      isCritText &&
      ft.scale > 1.1 &&
      !String(ft.text).includes('MELT') &&
      !String(ft.text).includes('OVERLOAD') &&
      !String(ft.text).includes('SUPERCONDUCT')
    ) {
      ctx.font = '800 10px Silkscreen, monospace';
      ctx.strokeText('CRIT', tx, ty + 12);
      ctx.fillStyle = '#ff6a00';
      ctx.fillText('CRIT', tx, ty + 12);
    }
    ctx.restore();
  }

  // 8. Cursor Reticle, Off-Screen Enemy Chevrons & Tunnel Direction Indicator
  const p = gameState.player;
  if (gameState.phase === 'playing' && p) {
    const mx = Math.round(gameState.mouseScreen.x);
    const my = Math.round(gameState.mouseScreen.y);
    const aspCur = WEAPON_ASPECTS[p.weaponAspect || 'solar'] || WEAPON_ASPECTS.solar;

    ctx.save();
    ctx.translate(mx, my);
    ctx.strokeStyle = aspCur.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.fillStyle = aspCur.core;
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();

    const pad = 34;
    if (gameState.portalOpen) {
      const gPos = worldToIso(TUNNEL_GATE.x, TUNNEL_GATE.y, 16);
      const gsx = originX + gPos.x;
      const gsy = originY + gPos.y;
      if (gsx < 0 || gsx > viewW || gsy < 0 || gsy > viewH) {
        const cx = viewW * 0.5;
        const cy = viewH * 0.5;
        const ang = Math.atan2(gsy - cy, gsx - cx);
        const cosA = Math.cos(ang);
        const sinA = Math.sin(ang);
        const maxT = Math.min(
          Math.abs((viewW * 0.5 - pad) / (cosA || 0.0001)),
          Math.abs((viewH * 0.5 - pad) / (sinA || 0.0001))
        );
        const ix = cx + cosA * maxT;
        const iy = cy + sinA * maxT;
        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(ang);
        ctx.fillStyle = '#22d3ee';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, 0); ctx.lineTo(-8, -8); ctx.lineTo(-4, 0); ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    const allFoes = gameState.boss && gameState.boss.hp > 0 ? [...gameState.enemies, gameState.boss] : gameState.enemies;
    for (let i = 0; i < allFoes.length; i++) {
      const foe = allFoes[i];
      const fPos = worldToIso(foe.x, foe.y, 16);
      const sx = originX + fPos.x;
      const sy = originY + fPos.y;
      if (sx >= 0 && sx <= viewW && sy >= 0 && sy <= viewH) continue;

      const cx = viewW * 0.5;
      const cy = viewH * 0.5;
      const ang = Math.atan2(sy - cy, sx - cx);
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      const maxT = Math.min(
        Math.abs((viewW * 0.5 - pad) / (cosA || 0.0001)),
        Math.abs((viewH * 0.5 - pad) / (sinA || 0.0001))
      );
      const ix = cx + cosA * maxT;
      const iy = cy + sinA * maxT;
      const isBossFoe = foe === gameState.boss;

      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(ang);
      ctx.fillStyle = isBossFoe ? '#ff2a5f' : '#ff6a00';
      ctx.strokeStyle = '#ffb800';
      ctx.lineWidth = isBossFoe ? 2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(isBossFoe ? 15 : 8, 0);
      ctx.lineTo(isBossFoe ? -9 : -6, isBossFoe ? -8 : -5);
      ctx.lineTo(isBossFoe ? -4 : -3, 0);
      ctx.lineTo(isBossFoe ? -9 : -6, isBossFoe ? 8 : 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // 9. Smooth Room Transition Fade Overlay
  if (gameState.transitionTimer > 0) {
    const mid = 0.425;
    const fadeAlpha = 1 - Math.abs(gameState.transitionTimer - mid) / mid;
    ctx.fillStyle = `rgba(4, 6, 12, ${Math.max(0, Math.min(1, fadeAlpha)).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  syncHudDom();
}

function applyGothicCyberHudStyle() {
  const idsToChamfer = [
    'hud-status-card',
    'hud-wave-card',
    'hud-controls-card',
    'hud-log-card',
    'hud-skill-dock',
  ];
  idsToChamfer.forEach((id) => {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('ov-chamfer-panel')) {
      el.classList.add('ov-chamfer-panel');
    }
  });
  document.querySelectorAll('[id^="cd-text-"]').forEach((txtEl) => {
    const slot = txtEl.closest('button, div');
    if (slot && !slot.classList.contains('ov-skill-slot')) {
      slot.classList.add('ov-skill-slot');
    }
  });
}

function syncHudDom() {
  applyGothicCyberHudStyle();
  const p = gameState.player;
  if (!p) return;

  const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
  const hpBar = document.getElementById('hud-hp-bar');
  const hpText = document.getElementById('hud-hp-text');
  if (hpBar) hpBar.style.width = `${hpPct}%`;
  if (hpText) hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;

  const dashCount = document.getElementById('hud-dash-count');
  if (dashCount) dashCount.textContent = `${p.dashCharges}/${p.maxDashCharges}`;
  const pip0 = document.getElementById('dash-pip-0');
  const pip1 = document.getElementById('dash-pip-1');
  if (pip0) pip0.style.opacity = p.dashCharges >= 1 ? '1' : '0.2';
  if (pip1) pip1.style.opacity = p.dashCharges >= 2 ? '1' : '0.2';

  const effCdScale = getEffectiveCooldownScale();
  const onSurgeCd = (p.surgeCd || 0) > 0 && p.surgeTimer <= 0;
  const surgeMaxCd = Math.max(0.1, (p.surgeMaxCd || 9.0) * effCdScale);
  const surgeVal = p.surgeTimer > 0
    ? Math.ceil((p.surgeTimer / p.surgeDuration) * 100)
    : onSurgeCd
    ? Math.max(0, Math.ceil((1 - p.surgeCd / surgeMaxCd) * 100))
    : Math.floor(p.surgeGauge);
  const surgeBar = document.getElementById('hud-surge-bar');
  const surgePct = document.getElementById('hud-surge-pct');
  if (surgeBar) surgeBar.style.width = `${Math.max(0, Math.min(100, surgeVal))}%`;
  if (surgePct) {
    surgePct.textContent = p.surgeTimer > 0
      ? 'DRAINING'
      : onSurgeCd
      ? `CD ${p.surgeCd.toFixed(1)}s`
      : `${surgeVal}%`;
  }

  const waveEl = document.getElementById('hud-wave');
  const scoreEl = document.getElementById('hud-score');
  const comboEl = document.getElementById('hud-combo');
  if (waveEl) waveEl.textContent = String(gameState.wave).padStart(2, '0');
  const spBadge = document.getElementById('hud-sp-badge');
  const shardBadge = document.getElementById('hud-shard-badge');
  if (spBadge) spBadge.textContent = String(p.skillPoints || 0);
  if (shardBadge) shardBadge.textContent = String(p.shards || 0);
  if (scoreEl) scoreEl.textContent = String(gameState.score).padStart(6, '0');
  if (comboEl) comboEl.textContent = `${gameState.combo}x`;

  const lanceOv = document.getElementById('cd-overlay-lance');
  const lanceTxt = document.getElementById('cd-text-lance');
  if (lanceOv && lanceTxt) {
    const pct = Math.min(100, (p.lanceCd / Math.max(0.1, p.lanceMaxCd * effCdScale)) * 100);
    lanceOv.style.height = `${pct}%`;
    lanceTxt.textContent = p.lanceCd > 0.05 ? `${p.lanceCd.toFixed(1)}s` : I18N[currentLang].skillLance;
  }

  const novaOv = document.getElementById('cd-overlay-nova');
  const novaTxt = document.getElementById('cd-text-nova');
  if (novaOv && novaTxt) {
    const pct = Math.min(100, (p.novaCd / Math.max(0.1, p.novaMaxCd * effCdScale)) * 100);
    novaOv.style.height = `${pct}%`;
    novaTxt.textContent = p.novaCd > 0.05 ? `${p.novaCd.toFixed(1)}s` : I18N[currentLang].skillNova;
  }

  const surgeOv = document.getElementById('cd-overlay-surge');
  if (surgeOv) {
    if (p.surgeTimer > 0) {
      surgeOv.style.height = '0%';
    } else if ((p.surgeCd || 0) > 0) {
      surgeOv.style.height = `${Math.min(100, (p.surgeCd / surgeMaxCd) * 100)}%`;
    } else {
      surgeOv.style.height = p.surgeGauge >= 100 ? '0%' : `${100 - p.surgeGauge}%`;
    }
  }

  const catOv = document.getElementById('cd-overlay-cataclysm');
  const catTxt = document.getElementById('cd-text-cataclysm');
  if (catOv && catTxt) {
    const pct = Math.min(100, (p.cataclysmCd / Math.max(0.1, p.cataclysmMaxCd * effCdScale)) * 100);
    catOv.style.height = `${pct}%`;
    catTxt.textContent = p.cataclysmCd > 0.05 ? `${p.cataclysmCd.toFixed(1)}s` : I18N[currentLang].skillCataclysm;
  }

  const bossPanel = document.getElementById('boss-hud-panel');
  if (bossPanel) {
    if (gameState.boss && gameState.boss.hp > 0) {
      bossPanel.classList.remove('hidden');
      const bPct = Math.max(0, (gameState.boss.hp / gameState.boss.maxHp) * 100);
      const bBar = document.getElementById('boss-hp-bar');
      const bText = document.getElementById('boss-hp-text');
      const bName = document.getElementById('boss-name-label');
      if (bBar) bBar.style.width = `${bPct}%`;
      if (bText) bText.textContent = `${Math.ceil(bPct)}%`;
      if (bName) {
        bName.textContent = gameState.boss.phase === 2 ? `${gameState.boss.name} // ENRAGE` : gameState.boss.name;
      }
    } else {
      bossPanel.classList.add('hidden');
    }
  }
}