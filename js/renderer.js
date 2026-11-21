// =========================================================================
// 9. HD ISOMETRIC PIXEL ART 2.5D RENDERER (EXPANDED MULTI-BIOME SANCTUM)
//    + 100% PROCEDURAL 8-DIRECTIONAL HERO SPRITES (20x22 / 20x24 HI-RES)
//    + COHESIVE FORM 3 (FUSION OF FORM 1 & 2) + REFINED FORM 2 WEAPON STANCE
//    + FLOATING CLIFF STRATA + 6 TACTICAL COVERS + POOLS + SHRINES + MINIMAP
// =========================================================================

const ISO_TILE_WORLD = 64;
const ISO_GRID_W = Math.ceil(ARENA_W / ISO_TILE_WORLD); // 45 on 2880
const ISO_GRID_H = Math.ceil(ARENA_H / ISO_TILE_WORLD); // 34 on 2176
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

voltSigilCanvas = buildProceduralVoltSigil();

// -------------------------------------------------------------------------
// 9A-2. HI-RES PROCEDURAL 8-DIRECTIONAL HERO SPRITES (20-COL UNIFORM GRIDS)
//       (front, frontDiag, side, backDiag, back + flipX = full 8 directions)
// -------------------------------------------------------------------------
const HERO_8DIR_SPRITES = {
  // =========================================================================
  // ร่าง 1: SOLAR CLEAVE (หมวกปีกกว้าง + เสื้อคลุมเกราะรูนไฟ + สายสะพาย + ขอบขาวแดง)
  // =========================================================================
  solar: {
    front: [
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '......khhhhhhk......',
      '...kkkkmmmmmmkkkk...',
      '....kkkddddddkkk....',
      '......kddkkddk......',
      '......kdfkkfdk......',
      '.....kddddddddk.....',
      '....khhkrddrkhhk....',
      '...khhkdrrddkdfhk...',
      '...kddkddrrdkdyfk...',
      '..khhkdfdrddkdfhk...',
      '..kddkdykrrkdddfk...',
      '..khhkdfddddkdyfk...',
      '..kddkddrrrrkdddk...',
      '..kskkdfddddkrrrk...',
      '..ksskddwwwwkwwwk...',
      '...kkkddrrrrkrrrk...',
      '...k.kddk..kddk.k...',
      '.....khhk..khhk.....',
      '....kdddk..kdddk....',
      '....kkkk....kkkk....',
    ],
    frontDiag: [
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '......khhhhhhk......',
      '....kkkmmmmmmkkkk...',
      '.....kkddddddkkk....',
      '.......kddkkddk.....',
      '.......kddkffdk.....',
      '......kddddddddk....',
      '.....khhkrrddhhk....',
      '....khhkdrrdddfk....',
      '...kdfhkddrrkdyfk...',
      '...kdyfkdddrkdfhk...',
      '...kdfhkddrrkdddk...',
      '...kdddkdfddkdfhk...',
      '...krrrkdyddkrrrk...',
      '..kwwwkdfdddkwwwk...',
      '..krrrkddrrrkrrrk...',
      '..kdddkddkkdksskk...',
      '...kk.kddk.kddkk....',
      '......khhk..khhk....',
      '.....kdddk..kdddk...',
      '.....kkkk....kkkk...',
    ],
    side: [
      '......kkkkkk........',
      '.....khhmmhhk.......',
      '.....khhhhhhk.......',
      '...kkkmmmmmmkkkk....',
      '....kkddddddkk......',
      '......kddddkdk......',
      '......kddddkfk......',
      '.....kddddddddk.....',
      '....khhddddrhhk.....',
      '....kddhhddrrdk.....',
      '...kddkhhdddrfk.....',
      '...kddkmmddddyk.....',
      '...kddkhhddddfk.....',
      '..kdddkmmdddddk.....',
      '..kdddkhhddddfk.....',
      '..kdddkssddrrrk.....',
      '..kddksskkwwwwk.....',
      '..k.kddkk.krrrk.....',
      '.....khhk..kddk.....',
      '.....kddk..khhk.....',
      '.....kdddk.kdddk....',
      '.....kkkk...kkkk....',
    ],
    backDiag: [
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '......khhhhhhk......',
      '...kkkkmmmmmmkkk....',
      '....kkkddddddkk.....',
      '.....kddddddddk.....',
      '.....kddddddddk.....',
      '....khhhhhhhhhhk....',
      '...khhrrddddddhhk...',
      '...khhdrrdddddfhk...',
      '..kdddkdrrdddfydk...',
      '..kdddkddrrdddfdk...',
      '..kdddkdddrkdddfk...',
      '..kdddkdfddkddddk...',
      '..krrrkdyddkddddk...',
      '..kwwwkdfddkddssk...',
      '..krrrkddddkddssk...',
      '..kdddkddddkddkk....',
      '...k.kddk..kddk.....',
      '.....khhk..khhk.....',
      '....kdddk..kdddk....',
      '....kkkk....kkkk....',
    ],
    back: [
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '......khhhhhhk......',
      '...kkkkmmmmmmkkkk...',
      '....kkkddddddkkk....',
      '......kddddddk......',
      '.....kddddddddk.....',
      '....khhhhhhhhhhk....',
      '...khhrrddddddhhk...',
      '...kdddrrddddfddk...',
      '..kdddddrdddfyddk...',
      '..kddddddrrddfddk...',
      '..kdddddfdrddrddk...',
      '..kddddfydrdddddk...',
      '..kdddddfdddddddk...',
      '..krrdddfddddrrrk...',
      '..kwwddddddddwwwk...',
      '..krrddddddddrrrk...',
      '...k.kddk..kddk.k...',
      '.....khhk..khhk.....',
      '....kdddk..kdddk....',
      '....kkkk....kkkk....',
    ],
  },

  // =========================================================================
  // ร่าง 2: CRYO LANCE (เขากวาง + หน้ากากกะโหลก + ผ้าพันคอลาย + ผ้ายันต์รอบเอว)
  // =========================================================================
  cryo: {
    front: [
      '..k..k........k..k..',
      '...kaak..kk..kaak...',
      '..i.kaak.aa.kaak.p..',
      '....k.kaakkaak.k....',
      '.....kkddddddkk.....',
      '....kddbbbbbbddk....',
      '....kdbibbbbibdk....',
      '....kddbbbbbbddk....',
      '...kctwtctwtctwck...',
      '..kccctctwtctwccck..',
      '..kcwcdggddggdcwck..',
      '..kcrcddiccidddwck..',
      '..kcwcddiccidddwck..',
      '..kcrcdrrggrrdcwck..',
      '..kccddrrggrrddcck..',
      '..kcwcrwcwrwcwrwck..',
      '..kcwcrwcwrwcwrwck..',
      '..kcccrwcwrwcwrcck..',
      '...kccwccwccwccck...',
      '....kddk....kddk....',
      '....kddk....kddk....',
      '....kddk....kddk....',
      '.....kk......kk.....',
      '....................',
    ],
    frontDiag: [
      '...k..k......k..k...',
      '....kaak.kk.kaak....',
      '...i.kaakaa.kaak.p..',
      '.....k.kaakkaak.....',
      '......kkddddddkk....',
      '.....kdddbbbbbbdk...',
      '.....kddbibbbibdk...',
      '.....kdddbbbbbbdk...',
      '....kctwtctwtctwck..',
      '...kcccctwtctwccck..',
      '...kcccdggddggdwck..',
      '...kccddiccidddwck..',
      '..kccwddiccidddwck..',
      '..kccrdrrggrrdcwck..',
      '..kcccddrrggrrdcck..',
      '..kcccrwcwrwcwrwck..',
      '..kcccrwcwrwcwrwck..',
      '...kccrwcwrwcwrcck..',
      '....kccwccwccwcck...',
      '.....kddk...kddk....',
      '.....kddk...kddk....',
      '.....kddk...kddk....',
      '......kk.....kk.....',
      '....................',
    ],
    side: [
      '....k..k....k..k....',
      '.....kaak..kaak.....',
      '....i.kaakkaak.p....',
      '......kkaaaakk......',
      '......kkddddkk......',
      '.....kddddbbbbk.....',
      '.....kddddbbibk.....',
      '.....kddddbbbbk.....',
      '....kctwtctwtck.....',
      '...kcccctwtctwck....',
      '...kcccccddggddk....',
      '..kcccdccddicddk....',
      '..kcccdccddrrggk....',
      '..kcccdccddrrggk....',
      '..kcccdccdwcrwck....',
      '..kcccdccdwcrwck....',
      '..kcccdccdwcrwck....',
      '...kccdccdwccwck....',
      '....kccdcckddkk.....',
      '......kddkkddk......',
      '......kddkkddk......',
      '.......kk..kk.......',
      '....................',
      '....................',
    ],
    backDiag: [
      '..k..k........k..k..',
      '...kaak..kk..kaak...',
      '..p.kaak.aa.kaak.i..',
      '....k.kaakkaak.k....',
      '.....kkddddddkk.....',
      '....kddddddddddk....',
      '....kddddddddddk....',
      '...kctwtctwtctwck...',
      '..kcccccccccccccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '...kccdcccccddcck...',
      '....kcck....kcck....',
      '....kddk....kddk....',
      '....kddk....kddk....',
      '.....kk......kk.....',
      '....................',
      '....................',
    ],
    back: [
      '..k..k........k..k..',
      '...kaak..kk..kaak...',
      '..p.kaak.aa.kaak.i..',
      '....k.kaakkaak.k....',
      '.....kkddddddkk.....',
      '....kddddddddddk....',
      '....kddddddddddk....',
      '...kctwtctwtctwck...',
      '..kcccccccccccccck..',
      '..kcccdccccccdccck..',
      '..kcccdccccccdccck..',
      '..kcccdccddccdccck..',
      '..kcccdccddccdccck..',
      '..kcccdccddccdccck..',
      '..kcccdccddccdccck..',
      '..kcccdccddccdccck..',
      '..kcccdccddccdccck..',
      '...kccdccddccdcck...',
      '....kcck....kcck....',
      '....kddk....kddk....',
      '....kddk....kddk....',
      '.....kk......kk.....',
      '....................',
      '....................',
    ],
  },

  // =========================================================================
  // ร่าง 3: VOLT REAPER (ผสานหมวกปีก/ผ้าคลุมร่าง 1 + เขากิ่ง/แถบยันต์ร่าง 2 โทนม่วงสมูท)
  // =========================================================================
  volt: {
    front: [
      '..k..k........k..k..',
      '...vmv...kk...vmv...',
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '.....khhhhhhhhk.....',
      '...kkkkmmmmmmkkkk...',
      '....kkkddddddkkk....',
      '......kddbbddk......',
      '......kdmbmbdk......',
      '.....kddddddddk.....',
      '...kmmtmtmtmtmmk....',
      '..kmmmdmmddmmmdmk...',
      '..kddmddmmddmddmk...',
      '..kmmmdmmddmmmdmmk..',
      '..kddmdmmddmmmdmmk..',
      '..kmmmtmtmtmtmtmmk..',
      '..kddmvdmvdmvdmddk..',
      '..kvmvdmvdmvdmvvmk..',
      '...vv.kddk..kddk.vv.',
      '......khhk..khhk....',
      '.....kdddk..kdddk...',
      '.....kkkk....kkkk...',
    ],
    frontDiag: [
      '...k..k......k..k...',
      '....vmv..kk..vmv....',
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '.....khhhhhhhhk.....',
      '....kkkmmmmmmkkkk...',
      '.....kkddddddkkk....',
      '.......kddbbddk.....',
      '.......kdmbmbdk.....',
      '......kddddddddk....',
      '....kmmtmtmtmtmmk...',
      '...kmmmdmmddmmmdmk..',
      '...kddmddmmddmddmmk.',
      '...kmmmdmmddmmmdmmk.',
      '...kddmdmmddmmmdmmk.',
      '...kmmmtmtmtmtmtmmk.',
      '...kddmvdmvdmvdmddk.',
      '...kvmvdmvdmvdmvvmk.',
      '....vv.kddk..kddk.vv',
      '.......khhk..khhk...',
      '......kdddk..kdddk..',
      '......kkkk....kkkk..',
    ],
    side: [
      '....k..k....k..k....',
      '.....vmv....vmv.....',
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '.....khhhhhhhhk.....',
      '...kkkmmmmmmkkkk....',
      '....kkddddddkk......',
      '......kddbbddk......',
      '......kdmbmbdk......',
      '.....kddddddddk.....',
      '....kmmtmtmtmtmk....',
      '....kmmmdmmddmmk....',
      '...kddmdmmddmmmk....',
      '...kmmmdmmddmmmk....',
      '...kddmdmmddmmmk....',
      '..kmmmtmtmtmtmmk....',
      '..kddmvdmvdmvmmk....',
      '..kvmvdmvdmvvmk.....',
      '....vv.khhk.khhk....',
      '.......kddk.kddk....',
      '......kdddkkdddk....',
      '......kkkkkkkkkk....',
    ],
    backDiag: [
      '..k..k........k..k..',
      '...vmv...kk...vmv...',
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '.....khhhhhhhhk.....',
      '...kkkkmmmmmmkkk....',
      '....kkkddddddkk.....',
      '.....kddddddddk.....',
      '.....kddddddddk.....',
      '....khhhhhhhhhhk....',
      '...kmmtmtmtmtmmk....',
      '...kmmddddddddmmk...',
      '..kddmddddddddmddk..',
      '..kmmdddddddddddmk..',
      '..kddmddddddddddmmk.',
      '..kmmtmtmtmtmtmmmk..',
      '..kddmvdmvdmvdmddk..',
      '..kvmvdmvdmvdmvvmk..',
      '...vv.kddk..kddk.vv.',
      '......khhk..khhk....',
      '.....kdddk..kdddk...',
      '.....kkkk....kkkk...',
    ],
    back: [
      '..k..k........k..k..',
      '...vmv...kk...vmv...',
      '.......kkkkkk.......',
      '......khhmmhhk......',
      '.....khhhhhhhhk.....',
      '...kkkkmmmmmmkkkk...',
      '....kkkddddddkkk....',
      '......kddddddk......',
      '.....kddddddddk.....',
      '....khhhhhhhhhhk....',
      '...kmmtmtmtmtmmk....',
      '...kmmddddddddmmk...',
      '..kddmddddddddmddk..',
      '..kmmdddddddddddmk..',
      '..kddmvdddddddvmddk.',
      '..kmmtmtmtmtmtmmmk..',
      '..kddmvdmvdmvdmddk..',
      '..kvmvdmvdmvdmvvmk..',
      '...vv.kddk..kddk.vv.',
      '......khhk..khhk....',
      '.....kdddk..kdddk...',
      '.....kkkk....kkkk...',
    ],
  },
};

const PIXEL_SPRITES = {
  hero_solar: HERO_8DIR_SPRITES.solar.front,
  hero_cryo: HERO_8DIR_SPRITES.cryo.front,
  hero_volt: HERO_8DIR_SPRITES.volt.front,
  dummy: [
    '....kkkk....',
    '...kwwwwk...',
    '...kwkkwk...',
    '...kwwwwk...',
    '.kkkkkkkkkk.',
    'kbbkmmmmkbbk',
    '.kkkmmmmkkk.',
    '...kmmmmk...',
    '...kbbbbk...',
    '....kbbk....',
    '....kbbk....',
    '...kkkkkk...',
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
      if (!ch || ch === '.') continue;
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
// 9B. BAKED MULTI-BIOME ISOMETRIC PIXEL-ART TERRAIN MAP (FLOATING CLIFFS)
// -------------------------------------------------------------------------
let isoMapCanvas = null;
let isoMapOriginX = 0;
let isoMapOriginY = 0;
const isoWaterProps = [];

function drawIsoPixelBlock(c, cx, cy, heightPx, colors, style = 'stone', seed = 0, biomeIdx = 0) {
  const hw = 32;
  const hh = 16;
  const topY = cy - heightPx;

  // เงาใต้ขอบหน้าผา (ช่วยให้แผ่นดินหลักดูลอยเหนือพื้นที่ด้านล่าง)
  if (style === 'cliff' || style === 'grass') {
    c.fillStyle = 'rgba(2, 6, 12, 0.34)';
    c.beginPath();
    c.moveTo(cx - hw - 4, cy + hh + 6);
    c.lineTo(cx, cy + hh * 2 + 12);
    c.lineTo(cx + hw + 4, cy + hh + 6);
    c.lineTo(cx, cy + hh + 2);
    c.closePath();
    c.fill();
  }

  // ผนังหน้าผาด้านซ้าย
  c.fillStyle = colors.left;
  c.beginPath();
  c.moveTo(cx - hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx, cy + hh * 2);
  c.lineTo(cx - hw, cy + hh);
  c.closePath();
  c.fill();

  // ผนังหน้าผาด้านขวา
  c.fillStyle = colors.right;
  c.beginPath();
  c.moveTo(cx + hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx, cy + hh * 2);
  c.lineTo(cx + hw, cy + hh);
  c.closePath();
  c.fill();

  // ชั้นหินแนวนอนและรอยแยกชั้นหน้าผา (Strata & Cracks)
  if (heightPx >= 12) {
    c.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let y = 7; y < heightPx - 3; y += 9) {
      const shift = Math.floor(((seed * 13 + y) % 5) - 2);
      c.fillRect(Math.round(cx - hw + 3), Math.round(topY + hh + y), 12, 2);
      c.fillRect(Math.round(cx - 15 + shift), Math.round(topY + hh + y + 5), 11, 2);
      c.fillRect(Math.round(cx + 3 + shift), Math.round(topY + hh + y + 5), 11, 2);
      c.fillRect(Math.round(cx + 17), Math.round(topY + hh + y), 12, 2);
    }

    c.strokeStyle = 'rgba(3, 6, 12, 0.45)';
    c.lineWidth = 1;
    const crackX = Math.round(cx - hw + 10 + ((seed * 19) % 14));
    c.beginPath();
    c.moveTo(crackX, Math.round(topY + hh + 2));
    c.lineTo(crackX - 2, Math.round(cy + hh - 2));
    c.stroke();
  }

  // หยักขอบหิน / แท่งน้ำแข็งย้อยสำหรับไบโอมน้ำแข็ง (Biome 2)
  if (style === 'cliff') {
    const isFrostBiome = (biomeIdx % 4) === 2;
    c.fillStyle = isFrostBiome ? '#7dd3fc' : colors.right;
    for (let i = 0; i < 5; i++) {
      const rx = Math.round(cx - hw + 4 + i * 6);
      const ry = Math.round(cy + hh + Math.floor(i * 2.5));
      const toothH = (isFrostBiome ? 8 : 3) + Math.floor((seed * 11 + i * 5) % (isFrostBiome ? 10 : 5));
      c.fillRect(rx, ry, isFrostBiome ? 3 : 4, toothH);
      if (isFrostBiome) {
        c.fillStyle = '#e0f2fe';
        c.fillRect(rx, ry, 1, Math.max(2, toothH - 3));
        c.fillStyle = '#7dd3fc';
      }
    }
    for (let i = 0; i < 5; i++) {
      const rx = Math.round(cx + 4 + i * 6);
      const ry = Math.round(cy + hh * 2 - 2 - Math.floor(i * 2.5));
      const toothH = (isFrostBiome ? 7 : 3) + Math.floor((seed * 17 + i * 3) % (isFrostBiome ? 9 : 5));
      c.fillRect(rx, ry, isFrostBiome ? 3 : 4, toothH);
    }
  }

  if (style === 'rune_wall' && heightPx >= 36) {
    c.fillStyle = (biomeIdx % 4) === 3 ? '#c084fc' : '#ff9800';
    const rx = Math.round(cx - 18);
    const ry = Math.round(topY + hh + 10);
    c.fillRect(rx, ry, 2, Math.min(26, heightPx - 14));
    c.fillRect(rx + 2, ry + 6, 6, 2);
    c.fillRect(rx + 6, ry + 6, 2, 12);
    c.fillStyle = (biomeIdx % 4) === 3 ? '#fae8ff' : '#fde047';
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

  // หน้าตัดด้านบนของบล็อก
  c.fillStyle = colors.top;
  c.beginPath();
  c.moveTo(cx, topY);
  c.lineTo(cx + hw, topY + hh);
  c.lineTo(cx, topY + hh * 2);
  c.lineTo(cx - hw, topY + hh);
  c.closePath();
  c.fill();

  // ขอบรับแสงด้านบน
  c.strokeStyle = colors.highlight || 'rgba(255,255,255,0.16)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - hw + 2, topY + hh);
  c.lineTo(cx, topY + 1);
  c.lineTo(cx + hw - 2, topY + hh);
  c.stroke();

  // เส้นขอบตัดคม
  c.strokeStyle = 'rgba(4, 7, 12, 0.60)';
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
  } else if (style === 'stone' || style === 'ruin' || style === 'rune_wall' || style === 'cliff') {
    c.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(cx - 14, topY + hh - 7);
    c.lineTo(cx + 14, topY + hh + 7);
    c.moveTo(cx + 14, topY + hh - 7);
    c.lineTo(cx - 14, topY + hh + 7);
    c.stroke();
    if (seed > 0.78 && (style === 'ruin' || style === 'cliff')) {
      c.fillStyle = (biomeIdx % 4) === 2 ? '#38bdf8' : (biomeIdx % 4) === 3 ? '#c084fc' : '#f59e0b';
      c.fillRect(Math.round(cx - 4), Math.round(topY + hh - 2), 6, 4);
      c.fillStyle = '#fef9c3';
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
    (typeof THERMAL_VENTS !== 'undefined' ? THERMAL_VENTS : []).map(
      (v) => `${Math.floor(v.x / ISO_TILE_WORLD)},${Math.floor(v.y / ISO_TILE_WORLD)}`
    )
  );

  // 1. ชั้นฐานด้านนอกที่ต่ำลงไปใต้หน้าผา (ขับให้ชานหินหลักดูลอยเด่นขึ้น)
  for (let gy = minGy; gy <= maxGy; gy++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      const isOuter = gx >= ISO_GRID_W || gy >= ISO_GRID_H;
      if (!isOuter) continue;
      const h = tileHash(gx, gy, 11 + biomeIdx * 7);
      if (gx > ISO_GRID_W + 2 && gy > ISO_GRID_H + 2 && h > 0.52) continue;

      const iso = worldToIso(gx * ISO_TILE_WORLD, gy * ISO_TILE_WORLD, 0);
      const cx = isoMapOriginX + iso.x;
      const cy = isoMapOriginY + iso.y + 24;
      const subH = 10 + Math.floor(h * 8);
      drawIsoPixelBlock(mctx, cx, cy, subH, PAL.submerged, 'stone', h, biomeIdx);

      if (h < 0.22 && gx <= ISO_GRID_W + 2 && gy <= ISO_GRID_H + 2) {
        isoWaterProps.push({
          kind: h < 0.12 ? 'lily' : 'reed',
          x: gx * ISO_TILE_WORLD + 32,
          y: gy * ISO_TILE_WORLD + 32,
          phase: h * Math.PI * 2,
        });
      }
    }
  }

  // 2. ผิวน้ำ / ลาวา / เหวหิมะรอบเกาะ
  mctx.save();
  const drawWaterQuad = (x0, y0, x1, y1) => {
    const p0 = worldToIso(x0 * ISO_TILE_WORLD, y0 * ISO_TILE_WORLD, 0);
    const p1 = worldToIso(x1 * ISO_TILE_WORLD, y0 * ISO_TILE_WORLD, 0);
    const p2 = worldToIso(x1 * ISO_TILE_WORLD, y1 * ISO_TILE_WORLD, 0);
    const p3 = worldToIso(x0 * ISO_TILE_WORLD, y1 * ISO_TILE_WORLD, 0);
    mctx.beginPath();
    mctx.moveTo(isoMapOriginX + p0.x, isoMapOriginY + p0.y + 12);
    mctx.lineTo(isoMapOriginX + p1.x, isoMapOriginY + p1.y + 12);
    mctx.lineTo(isoMapOriginX + p2.x, isoMapOriginY + p2.y + 12);
    mctx.lineTo(isoMapOriginX + p3.x, isoMapOriginY + p3.y + 12);
    mctx.closePath();
    mctx.fillStyle = biome ? biome.waterCol : 'rgba(24, 72, 86, 0.56)';
    mctx.fill();
    mctx.strokeStyle = biome ? biome.waterEdge : 'rgba(125, 225, 220, 0.28)';
    mctx.lineWidth = 2;
    mctx.stroke();
  };
  drawWaterQuad(minGx, ISO_GRID_H, maxGx + 1, maxGy + 1);
  drawWaterQuad(ISO_GRID_W, minGy, maxGx + 1, ISO_GRID_H);
  mctx.restore();

  // 3. พื้นสนามหลัก + กำแพงหลัง + ซุ้มประตูอุโมงค์ (ปรับกึ่งกลางตามขนาดแมพอัตโนมัติ)
  const midGx = Math.floor(ISO_GRID_W * 0.5);
  const midGy = Math.floor(ISO_GRID_H * 0.5);

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

        const isGateArea = isBackWallY && gx >= midGx - 2 && gx <= midGx + 2 && gy === -1;
        const isLavaSpout = isBackWallX && gx === -1 && gy >= midGy - 2 && gy <= midGy;
        const isWallPillar = (isBackWallY && (gx === midGx - 3 || gx === midGx + 3) && gy === -1) ||
                             (isBackWallX && (gy === midGy - 3 || gy === midGy + 1) && gx === -1);

        if (isGateArea) {
          drawIsoPixelBlock(mctx, cx, cy, 18, PAL.ruinDark, 'ruin', h, biomeIdx);
          drawIsoPixelBlock(mctx, cx, cy - 54, 18, PAL.ruin, 'ruin', h, biomeIdx);
        } else if (isLavaSpout) {
          drawIsoPixelBlock(mctx, cx, cy, 24, PAL.ruinDark, 'ruin', h, biomeIdx);
          const isFrost = (biomeIdx % 4) === 2;
          mctx.fillStyle = isFrost ? '#0284c7' : '#ea580c';
          mctx.fillRect(Math.round(cx - 8), Math.round(cy - 34), 16, 36);
          mctx.fillStyle = isFrost ? '#38bdf8' : '#fb923c';
          mctx.fillRect(Math.round(cx - 6), Math.round(cy - 32), 10, 34);
          mctx.fillStyle = isFrost ? '#e0f2fe' : '#fef08a';
          mctx.fillRect(Math.round(cx - 3), Math.round(cy - 30), 4, 30);
        } else if (isWallPillar) {
          drawIsoPixelBlock(mctx, cx, cy, 76, PAL.ruin, 'rune_wall', h, biomeIdx);
        } else if (gy === -2 || gx === -2) {
          const wallH = 54 + Math.floor(h * 22);
          drawIsoPixelBlock(mctx, cx, cy, wallH, PAL.ruinDark, h > 0.6 ? 'rune_wall' : 'cliff', h, biomeIdx);
        } else if (gy === -1 || gx === -1) {
          if (gx > ISO_GRID_W * 0.65 || gy > ISO_GRID_H * 0.65) {
            drawIsoPixelBlock(mctx, cx, cy, 26 + Math.floor(h * 12), PAL.grass, 'grass', h, biomeIdx);
          } else {
            drawIsoPixelBlock(mctx, cx, cy, 36 + Math.floor(h * 14), PAL.ruin, 'cliff', h, biomeIdx);
          }
        } else {
          drawIsoPixelBlock(mctx, cx, cy, 16 + Math.floor(h * 14), h > 0.5 ? PAL.dirt : PAL.grass, h > 0.5 ? 'dirt' : 'grass', h, biomeIdx);
        }
        continue;
      }

      const tileKey = `${gx},${gy}`;
      const distCenter = Math.hypot(gx - ISO_GRID_W * 0.5, gy - ISO_GRID_H * 0.5);
      const isOuterCliffRim = gx === ISO_GRID_W - 1 || gy === ISO_GRID_H - 1;
      const nearSouthEdge = gx >= ISO_GRID_W - 2 || gy >= ISO_GRID_H - 2;
      const nearBackEdge = gx <= 1 || gy <= 1;
      const isCrossPath = Math.abs(gx - midGx) <= 1 || Math.abs(gy - midGy) <= 1;

      if (ventTiles.has(tileKey)) {
        drawIsoPixelBlock(mctx, cx, cy, 18, PAL.ruinDark, 'vent', h, biomeIdx);
      } else if (isOuterCliffRim) {
        drawIsoPixelBlock(mctx, cx, cy, 26 + Math.floor(h * 6), PAL.ruinDark, 'cliff', h, biomeIdx);
      } else if (distCenter < 8.5 || isCrossPath) {
        drawIsoPixelBlock(mctx, cx, cy, 18, h > 0.45 ? PAL.ruin : PAL.ruinDark, 'ruin', h, biomeIdx);
      } else if (nearSouthEdge) {
        const isGrass = h > 0.35;
        drawIsoPixelBlock(mctx, cx, cy, isGrass ? 21 : 20, isGrass ? PAL.grass : PAL.ruinDark, isGrass ? 'grass' : 'cliff', h, biomeIdx);
      } else if (nearBackEdge) {
        drawIsoPixelBlock(mctx, cx, cy, 19, h > 0.65 ? PAL.grass : PAL.ruin, h > 0.65 ? 'grass' : 'ruin', h, biomeIdx);
      } else {
        if (h < 0.42) drawIsoPixelBlock(mctx, cx, cy, 18, PAL.stone, 'stone', h, biomeIdx);
        else if (h < 0.72) drawIsoPixelBlock(mctx, cx, cy, 18, PAL.dirt, 'dirt', h, biomeIdx);
        else if (h < 0.88) drawIsoPixelBlock(mctx, cx, cy, 18, PAL.ruinDark, 'ruin', h, biomeIdx);
        else drawIsoPixelBlock(mctx, cx, cy, 19, PAL.grass, 'grass', h, biomeIdx);
      }
    }
  }
}

let lobbyMapCanvas = null;
let lobbyMapOriginX = 0;
let lobbyMapOriginY = 0;

function drawLobbyGothicArch(c, cx, cy, w, h, glowTop = '#fef08a', glowMid = '#f97316', glowDark = '#7c2d12') {
  const hw = Math.round(w * 0.5);
  // Outer carved stone frame
  c.fillStyle = '#0f1722';
  c.fillRect(cx - hw - 3, cy - h - 2, w + 6, h + 4);
  c.fillStyle = '#475e75';
  c.fillRect(cx - hw - 2, cy - h - 1, w + 4, 3);
  c.fillRect(cx - hw - 2, cy - h, 2, h);
  c.fillRect(cx + hw, cy - h, 2, h);

  // Inner glowing stained-glass / ember recess
  c.fillStyle = glowDark;
  c.fillRect(cx - hw, cy - h + 2, w, h - 2);
  c.fillStyle = glowMid;
  c.fillRect(cx - hw + 2, cy - h + 5, w - 4, h - 7);
  c.fillStyle = glowTop;
  c.fillRect(cx - Math.max(2, Math.round(hw * 0.45)), cy - h + 8, Math.max(4, Math.round(w * 0.45)), Math.max(4, h - 14));

  // Gothic mullion bars
  c.fillStyle = '#18222e';
  c.fillRect(cx - 1, cy - h + 2, 2, h - 2);
  c.fillRect(cx - hw, cy - Math.round(h * 0.5), w, 2);
}

function drawLobbyTower(c, cx, cy, towerW, towerH, isLeft = true) {
  const hw = Math.round(towerW * 0.5);
  // Base shadow
  c.fillStyle = 'rgba(2, 5, 10, 0.55)';
  c.fillRect(cx - hw - 6, cy - 8, towerW + 12, 16);

  // Main tower shaft (left & right shaded faces for isometric depth)
  c.fillStyle = '#33485c';
  c.fillRect(cx - hw, cy - towerH, hw, towerH);
  c.fillStyle = '#1f2e3d';
  c.fillRect(cx, cy - towerH, hw, towerH);

  // Carved vertical fluted columns
  c.fillStyle = '#53708a';
  c.fillRect(cx - hw + 2, cy - towerH + 6, 4, towerH - 10);
  c.fillRect(cx - 6, cy - towerH + 6, 4, towerH - 10);
  c.fillStyle = '#111a24';
  c.fillRect(cx + hw - 6, cy - towerH + 6, 4, towerH - 10);

  // Horizontal stone cornices / tiers
  for (let tier = 1; tier <= 3; tier++) {
    const ty = cy - Math.round((towerH / 3.4) * tier);
    c.fillStyle = '#6485a3';
    c.fillRect(cx - hw - 4, ty, towerW + 8, 5);
    c.fillStyle = '#15202b';
    c.fillRect(cx - hw - 4, ty + 5, towerW + 8, 3);
  }

  // Crown battlements + domed ancient cap
  const topY = cy - towerH;
  c.fillStyle = '#4a647d';
  c.fillRect(cx - hw - 6, topY - 12, towerW + 12, 12);
  c.fillStyle = '#7ba0c2';
  c.fillRect(cx - hw - 6, topY - 14, towerW + 12, 3);
  // Merlons
  for (let m = -hw - 4; m <= hw - 2; m += 10) {
    c.fillStyle = '#3a5166';
    c.fillRect(cx + m, topY - 20, 6, 8);
    c.fillStyle = '#8cb4d6';
    c.fillRect(cx + m, topY - 20, 6, 2);
  }

  // Glowing gothic arched window on tower facade
  drawLobbyGothicArch(c, cx + (isLeft ? 4 : -4), cy - Math.round(towerH * 0.28), 18, 34);

  // Rooftop beacon brazier
  c.fillStyle = '#b45309';
  c.fillRect(cx - 7, topY - 24, 14, 5);
  c.fillStyle = '#ea580c';
  c.fillRect(cx - 5, topY - 36, 10, 12);
  c.fillStyle = '#fbbf24';
  c.fillRect(cx - 3, topY - 33, 6, 8);
  c.fillStyle = '#fef9c3';
  c.fillRect(cx - 1, topY - 30, 2, 4);
}

function drawLobbyAncientMonolith(c, cx, cy) {
  // Massive carved purple-obsidian ancient monolith framing the Crimson Rift (inspired by reference)
  // 1. Stepped ancient dais & root-like carved stone base
  c.fillStyle = '#1a1124';
  c.beginPath();
  c.ellipse(cx, cy + 8, 122, 48, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#2d1e3d';
  c.beginPath();
  c.ellipse(cx, cy + 2, 106, 38, 0, 0, Math.PI * 2);
  c.fill();

  // 2. Twin carved guardian buttresses flanking the central maw
  for (let side = -1; side <= 1; side += 2) {
    const bx = cx + side * 66;
    c.fillStyle = side < 0 ? '#3f2c54' : '#291b38';
    c.beginPath();
    c.moveTo(bx - 30, cy + 10);
    c.lineTo(bx - 22, cy - 135);
    c.lineTo(bx + 22, cy - 135);
    c.lineTo(bx + 30, cy + 10);
    c.closePath();
    c.fill();

    // Carved ancient ribs & highlights
    c.fillStyle = side < 0 ? '#654b82' : '#3d2a52';
    for (let r = 0; r < 6; r++) {
      c.fillRect(Math.round(bx - 18), Math.round(cy - 18 - r * 20), 36, 4);
    }

    // Glowing amber guardian eyes embedded in lower stone carvings
    const eyeX = cx + side * 42;
    const eyeY = cy - 18;
    c.fillStyle = '#09060e';
    c.fillRect(eyeX - 6, eyeY - 4, 12, 8);
    c.fillStyle = '#ea580c';
    c.fillRect(eyeX - 4, eyeY - 2, 8, 4);
    c.fillStyle = '#fef08a';
    c.fillRect(eyeX - 2, eyeY - 1, 4, 2);
  }

  // 3. Central monumental carved arch & ancient crest dome
  c.fillStyle = '#384c61';
  c.beginPath();
  c.moveTo(cx - 78, cy - 125);
  c.lineTo(cx, cy - 182);
  c.lineTo(cx + 78, cy - 125);
  c.lineTo(cx + 60, cy - 102);
  c.lineTo(cx - 60, cy - 102);
  c.closePath();
  c.fill();

  // Highlight ridge on the ancient crest
  c.strokeStyle = '#89adc9';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(cx - 74, cy - 126);
  c.lineTo(cx, cy - 180);
  c.lineTo(cx + 74, cy - 126);
  c.stroke();

  // Central carved skull/sigil medallion at apex
  c.fillStyle = '#1b2633';
  c.fillRect(cx - 16, cy - 156, 32, 24);
  c.fillStyle = '#6c8da8';
  c.fillRect(cx - 12, cy - 152, 24, 16);
  c.fillStyle = '#0f1722';
  c.fillRect(cx - 7, cy - 146, 5, 5);
  c.fillRect(cx + 2, cy - 146, 5, 5);

  // 4. Deep Crimson Maw Recess (organ-like vertical obsidian spires inside the rift)
  c.fillStyle = '#1a060e';
  c.beginPath();
  c.ellipse(cx, cy - 68, 44, 58, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#5c407a';
  c.lineWidth = 5;
  c.stroke();

  // Jagged stone teeth / ancient ribs framing the maw
  c.fillStyle = '#4c3566';
  for (let i = -3; i <= 3; i++) {
    c.fillRect(cx + i * 11 - 3, cy - 122 + Math.abs(i) * 4, 6, 12);
    c.fillRect(cx + i * 11 - 3, cy - 22 - Math.abs(i) * 3, 6, 10);
  }
}

function drawLobbyFrontGatehouse(c, cx, cy) {
  // Ornate ancient entrance pavilion at the bottom-center of the courtyard
  c.fillStyle = 'rgba(2, 5, 10, 0.52)';
  c.beginPath();
  c.ellipse(cx, cy + 12, 48, 22, 0, 0, Math.PI * 2);
  c.fill();

  // Domed shrine / gatehouse
  c.fillStyle = '#253545';
  c.fillRect(cx - 26, cy - 34, 52, 36);
  c.fillStyle = '#3b5269';
  c.beginPath();
  c.arc(cx, cy - 34, 26, Math.PI, 0);
  c.fill();
  c.strokeStyle = '#7da2c2';
  c.lineWidth = 2;
  c.stroke();

  // Crimson velvet inner doorway
  c.fillStyle = '#4c0519';
  c.fillRect(cx - 12, cy - 24, 24, 26);
  c.fillStyle = '#9f1239';
  c.fillRect(cx - 9, cy - 21, 18, 23);

  // Flanking golden braziers
  for (let side = -1; side <= 1; side += 2) {
    const bx = cx + side * 34;
    c.fillStyle = '#475569';
    c.fillRect(bx - 5, cy - 16, 10, 18);
    c.fillStyle = '#d97706';
    c.fillRect(bx - 7, cy - 20, 14, 5);
    c.fillStyle = '#fbbf24';
    c.fillRect(bx - 4, cy - 26, 8, 7);
    c.fillStyle = '#fef9c3';
    c.fillRect(bx - 2, cy - 25, 4, 4);
  }
}

function buildLobbyPixelMap() {
  const gw = Math.ceil((typeof LOBBY_W !== 'undefined' ? LOBBY_W : 1280) / ISO_TILE_WORLD); // 20
  const gh = Math.ceil((typeof LOBBY_H !== 'undefined' ? LOBBY_H : 1024) / ISO_TILE_WORLD); // 16
  const border = 4;

  const spanX = (gw + gh + border * 4) * 32 + 320;
  const spanY = (gw + gh + border * 4) * 16 + 520;

  lobbyMapCanvas = document.createElement('canvas');
  lobbyMapCanvas.width = spanX;
  lobbyMapCanvas.height = spanY;
  const mctx = lobbyMapCanvas.getContext('2d');
  mctx.imageSmoothingEnabled = false;

  lobbyMapOriginX = Math.floor((gh + border * 2) * 32 + 160);
  lobbyMapOriginY = Math.floor(border * 32 + 320);

  const LPAL = {
    floorA:   { top: '#435b73', left: '#27384a', right: '#182330', highlight: 'rgba(186,230,253,0.22)' },
    floorB:   { top: '#374c61', left: '#202f3e', right: '#131d28', highlight: 'rgba(148,163,184,0.16)' },
    trimGold: { top: '#596e82', left: '#364657', right: '#1e2936', highlight: 'rgba(251,191,36,0.34)' },
    carpet:   { top: '#592339', left: '#3b1525', right: '#240b16', highlight: 'rgba(253,164,175,0.26)' },
    wall:     { top: '#34485c', left: '#213040', right: '#131d28', highlight: 'rgba(186,230,253,0.24)' },
    wallDark: { top: '#223140', left: '#15202b', right: '#0b1118', highlight: 'rgba(148,163,184,0.18)' },
    monolith: { top: '#4a3461', left: '#322245', right: '#1e132b', highlight: 'rgba(216,180,254,0.26)' },
  };

  const midGx = Math.floor(gw * 0.5);
  const midGy = Math.floor(gh * 0.5);

  // 1. Base Isometric Courtyard, Tiered Walls & Balustrades
  for (let gy = -2; gy < gh + 1; gy++) {
    for (let gx = -2; gx < gw + 1; gx++) {
      const h = tileHash(gx, gy, 77);
      const iso = worldToIso(gx * ISO_TILE_WORLD, gy * ISO_TILE_WORLD, 0);
      const cx = lobbyMapOriginX + iso.x;
      const cy = lobbyMapOriginY + iso.y;

      const isBackY = gy < 0;
      const isBackX = gx < 0;
      const isFrontRim = gx === gw || gy === gh;

      if (isBackY || isBackX) {
        if (gx < -1 && gy < -1) continue;
        const isMonolith = isBackY && gx >= midGx - 3 && gx <= midGx + 2;
        if (isMonolith) {
          const mH = 72 + Math.floor(h * 16);
          drawIsoPixelBlock(mctx, cx, cy, mH, LPAL.monolith, 'cliff', h, 3);
        } else {
          const wH = (gy === -2 || gx === -2) ? 84 + Math.floor(h * 14) : 56 + Math.floor(h * 10);
          drawIsoPixelBlock(mctx, cx, cy, wH, (gy === -2 || gx === -2) ? LPAL.wallDark : LPAL.wall, 'cliff', h, 0);

          // Glowing Gothic Windows along upper colonnades
          if ((gy === -1 && (gx === 3 || gx === gw - 4)) || (gx === -1 && (gy === 3 || gy === gh - 5))) {
            drawLobbyGothicArch(mctx, Math.round(cx), Math.round(cy - 18), 16, 26);
          }
        }
        continue;
      }

      if (isFrontRim) {
        // Ornate carved parapet & stepped rim around the floating sanctum
        const isEntrance = gy === gh && gx >= midGx - 1 && gx <= midGx + 1;
        const isCornerPost = (gx === gw && gy === gh) || (gx === gw && gy % 4 === 0) || (gy === gh && gx % 4 === 0);
        const rimH = isEntrance ? 18 : isCornerPost ? 38 : 28;
        drawIsoPixelBlock(mctx, cx, cy, rimH, isCornerPost ? LPAL.wall : LPAL.wallDark, 'cliff', h, 0);

        // Mini parapet torches on alternating balustrade posts
        if (isCornerPost && !isEntrance) {
          mctx.fillStyle = '#d97706';
          mctx.fillRect(Math.round(cx - 4), Math.round(cy - rimH - 4), 8, 4);
          mctx.fillStyle = '#f97316';
          mctx.fillRect(Math.round(cx - 3), Math.round(cy - rimH - 11), 6, 7);
          mctx.fillStyle = '#fef08a';
          mctx.fillRect(Math.round(cx - 1), Math.round(cy - rimH - 9), 2, 4);
        }
        continue;
      }

      // Courtyard floor: Ceremonial crimson carpet, gilded border inlays & carved blue-slate flagstones
      const isCarpet = Math.abs(gx - midGx) <= 1 && gy >= 1 && gy <= gh - 2;
      const isBorderInlay = gx === 1 || gx === gw - 2 || gy === 1 || gy === gh - 2;
      const isCross = Math.abs(gy - midGy) <= 0 && gx >= 2 && gx <= gw - 3;

      if (isCarpet) {
        drawIsoPixelBlock(mctx, cx, cy, 18, LPAL.carpet, 'ruin', h, 0);
      } else if (isBorderInlay) {
        drawIsoPixelBlock(mctx, cx, cy, 18, LPAL.trimGold, 'ruin', h, 0);
      } else if (isCross || (gx + gy) % 2 === 0) {
        drawIsoPixelBlock(mctx, cx, cy, 18, LPAL.floorA, 'stone', h, 0);
      } else {
        drawIsoPixelBlock(mctx, cx, cy, 18, LPAL.floorB, 'stone', h, 0);
      }

      // Ancient moss clusters clinging to inner wall corners
      if ((gx === 0 && (gy === 2 || gy === 5)) || (gy === 0 && (gx === 4 || gx === gw - 5))) {
        mctx.fillStyle = '#14532d';
        mctx.fillRect(Math.round(cx - 12), Math.round(cy - 18), 24, 12);
        mctx.fillStyle = '#3f6212';
        mctx.fillRect(Math.round(cx - 8), Math.round(cy - 22), 16, 8);
        mctx.fillStyle = '#65a30d';
        mctx.fillRect(Math.round(cx - 4), Math.round(cy - 20), 6, 4);
      }
    }
  }

  // 2. Monumental Twin Citadel Towers flanking the back monolith
  const leftTowerIso = worldToIso(3.2 * ISO_TILE_WORLD, -1.2 * ISO_TILE_WORLD, 0);
  const rightTowerIso = worldToIso((gw - 3.8) * ISO_TILE_WORLD, -1.2 * ISO_TILE_WORLD, 0);
  drawLobbyTower(mctx, Math.round(lobbyMapOriginX + leftTowerIso.x), Math.round(lobbyMapOriginY + leftTowerIso.y - 12), 78, 155, true);
  drawLobbyTower(mctx, Math.round(lobbyMapOriginX + rightTowerIso.x), Math.round(lobbyMapOriginY + rightTowerIso.y - 12), 78, 155, false);

  // Outer wing watchtowers (left & right wings)
  const wingLeftIso = worldToIso(-1.1 * ISO_TILE_WORLD, 3.2 * ISO_TILE_WORLD, 0);
  const wingRightIso = worldToIso((gw - 0.8) * ISO_TILE_WORLD, 3.2 * ISO_TILE_WORLD, 0);
  drawLobbyTower(mctx, Math.round(lobbyMapOriginX + wingLeftIso.x), Math.round(lobbyMapOriginY + wingLeftIso.y - 10), 54, 118, true);
  drawLobbyTower(mctx, Math.round(lobbyMapOriginX + wingRightIso.x), Math.round(lobbyMapOriginY + wingRightIso.y - 10), 54, 118, false);

  // 3. Central Ancient Purple Monolith framing the Crimson Warp Rift
  const monoIso = worldToIso(midGx * ISO_TILE_WORLD, -0.4 * ISO_TILE_WORLD, 0);
  drawLobbyAncientMonolith(mctx, Math.round(lobbyMapOriginX + monoIso.x), Math.round(lobbyMapOriginY + monoIso.y - 12));

  // 4. Ornate Front Entrance Gatehouse at bottom-center of courtyard
  const gateIso = worldToIso(midGx * ISO_TILE_WORLD, (gh + 0.1) * ISO_TILE_WORLD, 0);
  drawLobbyFrontGatehouse(mctx, Math.round(lobbyMapOriginX + gateIso.x), Math.round(lobbyMapOriginY + gateIso.y - 10));
}

function drawLobbyInteractiveProps(c, originX, originY, withIsoGroundPlane) {
  const t = gameState.worldTime;
  const p = gameState.player;

  // 1. ประตูรอยแยกสีแดงฉาน (Crimson Warp Rift) กลางซุ้มหินโบราณ
  if (typeof LOBBY_PORTAL !== 'undefined') {
    const gPos = worldToIso(LOBBY_PORTAL.x, LOBBY_PORTAL.y, 26);
    const gx = Math.round(originX + gPos.x);
    const gy = Math.round(originY + gPos.y);
    const pulse = 0.88 + Math.sin(t * 5.5) * 0.12;

    // วงเวทย์สีแดงบนพื้นหน้าประตู
    withIsoGroundPlane(LOBBY_PORTAL.x, LOBBY_PORTAL.y + 22, 2, () => {
      c.strokeStyle = 'rgba(255, 42, 95, 0.82)';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(0, 0, 68 * pulse, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = 'rgba(254, 202, 202, 0.65)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, 44, 0, Math.PI * 2);
      c.stroke();
    });

    // รอยแยกพลังงานสีแดงแนวตั้ง (Crimson Rift)
    c.save();
    c.globalCompositeOperation = 'lighter';
    const rg = c.createRadialGradient(gx, gy - 34, 8, gx, gy - 34, 104 * pulse);
    rg.addColorStop(0, 'rgba(255, 240, 240, 0.96)');
    rg.addColorStop(0.26, 'rgba(255, 42, 95, 0.88)');
    rg.addColorStop(0.62, 'rgba(153, 27, 27, 0.46)');
    rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = rg;
    c.beginPath();
    c.ellipse(gx, gy - 34, 46 * pulse, 92 * pulse, 0, 0, Math.PI * 2);
    c.fill();

    // เส้นสายพลังงานสีแดงพุ่งขึ้นภายในรอยแยก
    c.strokeStyle = '#fda4af';
    c.lineWidth = 2;
    for (let s = -3; s <= 3; s++) {
      const sx = gx + s * 7 + Math.sin(t * 9 + s) * 2;
      const h = 54 + Math.sin(t * 7 + s * 1.7) * 16;
      c.beginPath();
      c.moveTo(sx, gy + 10);
      c.lineTo(sx, gy + 10 - h);
      c.stroke();
    }
    c.restore();

    // ป้ายลอยเชิญเข้าดันเจี้ยน
    c.save();
    c.font = '700 11px Silkscreen, monospace';
    c.textAlign = 'center';
    c.lineWidth = 4;
    c.strokeStyle = '#04060a';
    const bounce = Math.round(Math.sin(t * 5) * 4);
    const label = '▼ ENTER DUNGEON (WAVE 01) ▼';
    c.strokeText(label, gx, gy - 118 + bounce);
    c.fillStyle = '#fda4af';
    c.fillText(label, gx, gy - 118 + bounce);
    c.restore();
  }

  // 2. แท่นโต้ตอบซ้าย-ขวา (Constellation Altar & Obsidian Forge)
  if (typeof LOBBY_STATIONS !== 'undefined') {
    for (let i = 0; i < LOBBY_STATIONS.length; i++) {
      const st = LOBBY_STATIONS[i];
      const pos = worldToIso(st.x, st.y, 0);
      const sx = Math.round(originX + pos.x);
      const sy = Math.round(originY + pos.y);
      const near = p && Math.hypot(p.x - st.x, p.y - st.y) < st.r + 58;

      drawPixelShadow(c, sx, sy + 4, 34, 16);
      // ฐานแท่นหินสลัก 2 ชั้น
      c.fillStyle = '#15202b';
      c.fillRect(sx - 26, sy - 8, 52, 12);
      c.fillStyle = '#33485c';
      c.fillRect(sx - 22, sy - 14, 44, 8);
      c.fillStyle = '#6485a3';
      c.fillRect(sx - 22, sy - 15, 44, 2);

      const hover = Math.sin(t * 4 + i * 2) * 5;
      if (st.kind === 'tree') {
        // แท่นกลุ่มดาว (เสาผลึกโบราณสีฟ้าเรืองแสง + วงแหวนหมุน)
        c.fillStyle = '#082f49';
        c.fillRect(sx - 10, Math.round(sy - 44 + hover), 20, 26);
        c.fillStyle = '#38bdf8';
        c.fillRect(sx - 8, Math.round(sy - 42 + hover), 16, 22);
        c.fillStyle = '#e0f2fe';
        c.fillRect(sx - 3, Math.round(sy - 37 + hover), 6, 12);
      } else {
        // เตาหลอม Obsidian Forge (ทั่งเหล็กโบราณ + เปลวเพลิงสีส้มทอง)
        c.fillStyle = '#292524';
        c.fillRect(sx - 16, sy - 28, 32, 14);
        c.fillStyle = '#57534e';
        c.fillRect(sx - 18, sy - 30, 36, 4);
        c.fillStyle = '#ea580c';
        c.fillRect(sx - 10, Math.round(sy - 40 - Math.abs(hover) * 0.6), 20, 12);
        c.fillStyle = '#fef08a';
        c.fillRect(sx - 5, Math.round(sy - 36 - Math.abs(hover) * 0.4), 10, 7);
      }

      c.save();
      c.font = '700 10px Silkscreen, monospace';
      c.textAlign = 'center';
      c.lineWidth = 3;
      c.strokeStyle = '#04060a';
      const txtY = Math.round(sy - 54 + (near ? Math.sin(t * 8) * 3 : 0));
      c.strokeText(st.label, sx, txtY);
      c.fillStyle = near ? '#ffffff' : st.color;
      c.fillText(st.label, sx, txtY);
      c.restore();
    }
  }
}

function buildProceduralFloorPattern() {
  buildIsometricPixelMap(gameState.biomeIndex || 0);
}
window.buildProceduralFloorPattern = buildProceduralFloorPattern;

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
  const bIdx = (gameState.biomeIndex || 0) % 4;
  lightCtx.fillStyle = gameState.boss && gameState.boss.phase === 2
    ? 'rgba(78, 46, 60, 0.46)'
    : bIdx === 2
    ? 'rgba(84, 108, 128, 0.36)'
    : 'rgba(78, 92, 112, 0.40)';
  lightCtx.fillRect(0, 0, viewW, viewH);

  lightCtx.globalCompositeOperation = 'lighter';

  const isLobbyLight = gameState.zone === 'lobby';
  const activeLightPillars = isLobbyLight && typeof LOBBY_PILLARS !== 'undefined' ? LOBBY_PILLARS : PILLARS;

  if (isLobbyLight && typeof LOBBY_PORTAL !== 'undefined') {
    const rPos = worldToIso(LOBBY_PORTAL.x, LOBBY_PORTAL.y, 32);
    const pulseR = 0.92 + Math.sin(gameState.worldTime * 5) * 0.08;
    drawPointLight(lightCtx, originX + rPos.x, originY + rPos.y, 320 * pulseR, [
      [0, 'rgba(255, 70, 115, 0.96)'],
      [0.45, 'rgba(185, 28, 28, 0.48)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
    if (typeof LOBBY_STATIONS !== 'undefined') {
      for (let s = 0; s < LOBBY_STATIONS.length; s++) {
        const st = LOBBY_STATIONS[s];
        const sPos = worldToIso(st.x, st.y, 20);
        drawPointLight(lightCtx, originX + sPos.x, originY + sPos.y, 200, [
          [0, st.kind === 'tree' ? 'rgba(56, 189, 248, 0.82)' : 'rgba(251, 191, 36, 0.85)'],
          [1, 'rgba(0, 0, 0, 0)'],
        ]);
      }
    }
  }

  // แสงสว่างจากเสาไฟ บ่อไฟ ผลึกคริสตัล และซุ้มหิน
  for (let i = 0; i < activeLightPillars.length; i++) {
    const pil = activeLightPillars[i];
    const kind = pil.kind || 'brazier';
    const pos = worldToIso(pil.x, pil.y, kind === 'fire_pit' ? 16 : 44);
    const flicker = 0.92 + Math.sin(gameState.worldTime * 11 + pil.phase) * 0.1;

    if (kind === 'brazier' || kind === 'frost_torch' || kind === 'fire_pit' || kind === 'ruin_arch') {
      drawPointLight(lightCtx, originX + pos.x, originY + pos.y, (kind === 'fire_pit' ? 230 : 260) * flicker, [
        [0, 'rgba(255, 225, 130, 0.90)'],
        [0.42, 'rgba(255, 130, 35, 0.44)'],
        [1, 'rgba(0, 0, 0, 0)'],
      ]);
    } else if (kind === 'crystal_cluster') {
      const isStorm = bIdx === 3;
      drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 190 * flicker, [
        [0, isStorm ? 'rgba(232, 121, 249, 0.78)' : 'rgba(251, 191, 36, 0.78)'],
        [1, 'rgba(0, 0, 0, 0)'],
      ]);
    } else if (kind === 'volcano_rock') {
      drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 145 * flicker, [
        [0, 'rgba(255, 106, 0, 0.48)'],
        [1, 'rgba(0, 0, 0, 0)'],
      ]);
    }
  }

  // แสงจากปล่องความร้อน (เฉพาะในดันเจี้ยน)
  if (!isLobbyLight) for (let v = 0; v < THERMAL_VENTS.length; v++) {
    const vent = THERMAL_VENTS[v];
    const pos = worldToIso(vent.x, vent.y, 0);
    const warnBoost = (gameState.ventCycleTimer || 0) > 5.2 ? 1.5 : 1.0;
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 130 * warnBoost, [
      [0, 'rgba(255, 150, 50, 0.58)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  // แสงเรืองจากจุดสำรวจที่ยังไม่ถูกเก็บ (Exploration Shrines)
  if (!isLobbyLight && typeof MAP_SHRINES !== 'undefined') {
    for (let i = 0; i < MAP_SHRINES.length; i++) {
      const sh = MAP_SHRINES[i];
      if (sh.used) continue;
      const pos = worldToIso(sh.x, sh.y, 18);
      const col = sh.kind === 'heal_spring'
        ? 'rgba(45, 212, 191, 0.85)'
        : sh.kind === 'ember_altar'
        ? 'rgba(251, 191, 36, 0.85)'
        : 'rgba(56, 189, 248, 0.85)';
      drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 185, [
        [0, col],
        [1, 'rgba(0, 0, 0, 0)'],
      ]);
    }
  }

  if (gameState.portalOpen) {
    const gPos = worldToIso(TUNNEL_GATE.x, TUNNEL_GATE.y, 16);
    drawPointLight(lightCtx, originX + gPos.x, originY + gPos.y, 260, [
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
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, isGold || isTransformBurst ? 360 : 280, [
      [0, inner],
      [0.5, outer],
      [1, 'rgba(0, 0, 0, 0)'],
    ]);
  }

  if (gameState.boss && gameState.boss.hp > 0) {
    const b = gameState.boss;
    const pos = worldToIso(b.x, b.y, 26);
    drawPointLight(lightCtx, originX + pos.x, originY + pos.y, 300, [
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
// 9D. ENTITY & TACTICAL COVER PIXEL-ART DRAWERS (6 COVER STYLES + HERO)
// -------------------------------------------------------------------------
function drawPixelShadow(c, sx, sy, rx, ry) {
  c.fillStyle = 'rgba(4, 7, 14, 0.52)';
  c.beginPath();
  c.ellipse(Math.round(sx), Math.round(sy), Math.round(rx), Math.round(ry), 0, 0, Math.PI * 2);
  c.fill();
}

function drawIsoPillar(c, pil, sx, sy) {
  const kind = pil.kind || 'brazier';
  const t = gameState.worldTime;
  const rx = Math.round(sx);
  const ry = Math.round(sy);
  const bIdx = (gameState.biomeIndex || 0) % 4;

  if (kind === 'volcano_rock') {
    // ยอดหินภูเขาไฟหยักสูง + รอยแยกแมกมาเรืองแสง
    drawPixelShadow(c, rx, ry + 6, 44, 22);
    c.fillStyle = '#18181b';
    c.beginPath();
    c.moveTo(rx - 40, ry + 4);
    c.lineTo(rx - 18, ry - 48);
    c.lineTo(rx - 4, ry - 64);
    c.lineTo(rx + 18, ry - 42);
    c.lineTo(rx + 40, ry + 4);
    c.closePath();
    c.fill();

    c.fillStyle = '#3f3f46';
    c.beginPath();
    c.moveTo(rx - 36, ry + 2);
    c.lineTo(rx - 16, ry - 44);
    c.lineTo(rx - 4, ry - 58);
    c.lineTo(rx - 2, ry + 4);
    c.closePath();
    c.fill();

    c.fillStyle = '#52525b';
    c.beginPath();
    c.moveTo(rx - 24, ry - 12);
    c.lineTo(rx - 14, ry - 42);
    c.lineTo(rx - 5, ry - 54);
    c.lineTo(rx - 12, ry - 16);
    c.closePath();
    c.fill();

    const glow = 0.75 + Math.sin(t * 7 + pil.phase) * 0.25;
    c.strokeStyle = bIdx === 3
      ? `rgba(192, 132, 252, ${glow.toFixed(2)})`
      : `rgba(255, 106, 0, ${glow.toFixed(2)})`;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(rx - 4, ry - 54);
    c.lineTo(rx + 4, ry - 32);
    c.lineTo(rx + 14, ry - 14);
    c.lineTo(rx + 22, ry + 2);
    c.stroke();
    c.strokeStyle = bIdx === 3 ? '#fae8ff' : '#fef08a';
    c.lineWidth = 1.3;
    c.stroke();
    return;
  }

  if (kind === 'fire_pit') {
    // บ่อไฟหินปูวงกลมลุกโชน
    drawPixelShadow(c, rx, ry + 4, 38, 19);
    c.fillStyle = '#27272a';
    c.beginPath();
    c.ellipse(rx, ry, 34, 17, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#52525b';
    c.lineWidth = 4;
    c.stroke();

    c.fillStyle = '#7c2d12';
    c.beginPath();
    c.ellipse(rx, ry - 1, 22, 11, 0, 0, Math.PI * 2);
    c.fill();

    const f = Math.sin(t * 14 + pil.phase) * 5;
    c.fillStyle = '#ea580c';
    c.beginPath();
    c.moveTo(rx - 16, ry);
    c.quadraticCurveTo(rx - 8, ry - 32 - f, rx, ry - 40 - f);
    c.quadraticCurveTo(rx + 10, ry - 28 + f * 0.5, rx + 16, ry);
    c.closePath();
    c.fill();

    c.fillStyle = '#fbbf24';
    c.beginPath();
    c.moveTo(rx - 10, ry);
    c.quadraticCurveTo(rx, ry - 26 - f * 0.8, rx + 10, ry);
    c.closePath();
    c.fill();

    c.fillStyle = '#fef9c3';
    c.fillRect(rx - 4, ry - 12, 8, 10);
    return;
  }

  if (kind === 'ice_pillar') {
    // แท่งหินน้ำแข็งหิมะปกคลุม + ผลึกย้อย
    drawPixelShadow(c, rx, ry + 5, 34, 17);
    drawIsoPixelBlock(
      c, rx, ry - 8, 52,
      { top: '#e0f2fe', left: '#38bdf8', right: '#0369a1', highlight: '#ffffff' },
      'cliff', pil.phase, 2
    );
    c.fillStyle = '#f0f9ff';
    c.fillRect(rx - 14, ry - 60, 28, 7);
    c.fillStyle = '#7dd3fc';
    c.fillRect(rx - 16, ry - 48, 5, 18);
    c.fillRect(rx + 11, ry - 44, 5, 16);
    return;
  }

  if (kind === 'crystal_cluster') {
    // กลุ่มผลึกแร่เรืองแสงสีส้มทอง / ม่วง
    const isStorm = bIdx === 3;
    const outerCol = isStorm ? '#9333ea' : '#ea580c';
    const midCol = isStorm ? '#e879f9' : '#f59e0b';
    const coreCol = isStorm ? '#fae8ff' : '#fef08a';
    drawPixelShadow(c, rx, ry + 5, 36, 18);

    c.fillStyle = '#292524';
    c.beginPath();
    c.ellipse(rx, ry, 30, 15, 0, 0, Math.PI * 2);
    c.fill();

    const spires = [
      { ox: -14, h: 32, w: 12 },
      { ox: 12,  h: 28, w: 11 },
      { ox: 0,   h: 48, w: 16 },
    ];
    spires.forEach((sp) => {
      c.fillStyle = '#090b10';
      c.beginPath();
      c.moveTo(rx + sp.ox - sp.w * 0.6, ry);
      c.lineTo(rx + sp.ox, ry - sp.h - 4);
      c.lineTo(rx + sp.ox + sp.w * 0.6, ry);
      c.closePath();
      c.fill();

      c.fillStyle = outerCol;
      c.beginPath();
      c.moveTo(rx + sp.ox - sp.w * 0.45, ry - 1);
      c.lineTo(rx + sp.ox, ry - sp.h);
      c.lineTo(rx + sp.ox + sp.w * 0.45, ry - 1);
      c.closePath();
      c.fill();

      c.fillStyle = midCol;
      c.fillRect(Math.round(rx + sp.ox - 3), Math.round(ry - sp.h * 0.72), 6, Math.round(sp.h * 0.62));
      c.fillStyle = coreCol;
      c.fillRect(Math.round(rx + sp.ox - 1), Math.round(ry - sp.h * 0.8), 2, Math.round(sp.h * 0.45));
    });
    return;
  }

  if (kind === 'ruin_arch') {
    // ซุ้มหินหุบผาโบราณพร้อมผลึกไฟคู่
    drawPixelShadow(c, rx, ry + 6, 40, 20);
    drawIsoPixelBlock(
      c, rx - 16, ry - 4, 46,
      { top: '#78716c', left: '#57534e', right: '#292524', highlight: 'rgba(253,186,116,0.35)' },
      'stone', pil.phase, bIdx
    );
    drawIsoPixelBlock(
      c, rx + 16, ry - 4, 46,
      { top: '#78716c', left: '#57534e', right: '#292524', highlight: 'rgba(253,186,116,0.35)' },
      'stone', pil.phase + 1, bIdx
    );
    c.fillStyle = '#44403c';
    c.fillRect(rx - 26, ry - 58, 52, 12);
    c.fillStyle = '#78716c';
    c.fillRect(rx - 26, ry - 60, 52, 4);
    c.fillStyle = bIdx === 3 ? '#c084fc' : '#f59e0b';
    c.fillRect(rx - 18, ry - 68, 6, 8);
    c.fillRect(rx + 12, ry - 68, 6, 8);
    c.fillStyle = '#fef08a';
    c.fillRect(rx - 16, ry - 66, 2, 4);
    c.fillRect(rx + 14, ry - 66, 2, 4);
    return;
  }

  // Default: brazier / frost_torch (เสาคบเพลิงหลัก 4 มุมลานกลาง)
  drawPixelShadow(c, rx, ry + 4, 28, 14);
  drawIsoPixelBlock(
    c, rx, ry - 12, 42,
    kind === 'frost_torch'
      ? { top: '#bae6fd', left: '#38bdf8', right: '#0c4a6e', highlight: '#ffffff' }
      : { top: '#475569', left: '#334155', right: '#1e293b', highlight: 'rgba(251,191,36,0.45)' },
    'rune_wall', pil.phase, bIdx
  );

  const topY = ry - 46;
  c.fillStyle = '#1e1b18';
  c.fillRect(rx - 14, topY - 4, 28, 8);
  c.fillStyle = '#b45309';
  c.fillRect(rx - 16, topY - 6, 32, 4);
  c.fillStyle = '#fbbf24';
  c.fillRect(rx - 12, topY - 6, 24, 2);

  const f = Math.sin(t * 14 + pil.phase);
  const f2 = Math.cos(t * 19 + pil.phase);
  const flameH = 14 + Math.round(f * 4);
  c.fillStyle = '#ea580c';
  c.fillRect(rx - 10, topY - 6 - flameH, 20, flameH);
  c.fillRect(rx - 6 + Math.round(f2 * 3), topY - 10 - flameH, 12, 8);
  c.fillStyle = '#fbbf24';
  c.fillRect(rx - 7, topY - 4 - Math.round(flameH * 0.72), 14, Math.round(flameH * 0.72));
  c.fillStyle = '#fef9c3';
  c.fillRect(rx - 3, topY - 4 - Math.round(flameH * 0.45), 6, Math.round(flameH * 0.45));
}

function drawMapPoolsAndShrines(c, originX, originY, withIsoGroundPlane) {
  const t = gameState.worldTime;

  // 1. วาดบ่อธาตุ (บ่อฟ้าอมเขียว / บ่อน้ำแข็ง / บ่อลาวา / บ่อสายฟ้า)
  if (typeof MAP_POOLS !== 'undefined') {
    for (let i = 0; i < MAP_POOLS.length; i++) {
      const pl = MAP_POOLS[i];
      withIsoGroundPlane(pl.x, pl.y, 1, () => {
        const isLava = pl.kind === 'lava';
        const isIce = pl.kind === 'ice';
        const isVoid = pl.kind === 'void';

        c.fillStyle = isLava ? '#7c2d12' : isIce ? '#0369a1' : isVoid ? '#3b0764' : '#0f766e';
        c.beginPath();
        c.ellipse(0, 0, pl.rx, pl.ry, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = isLava ? '#ea580c' : isIce ? '#38bdf8' : isVoid ? '#7e22ce' : '#2dd4bf';
        c.beginPath();
        c.ellipse(0, 0, pl.rx * 0.84, pl.ry * 0.82, 0, 0, Math.PI * 2);
        c.fill();

        const pulse = 0.55 + Math.sin(t * 3 + i) * 0.14;
        c.strokeStyle = isLava ? '#fef08a' : isIce ? '#e0f2fe' : isVoid ? '#f0abfc' : '#ccfbf1';
        c.lineWidth = 3;
        c.globalAlpha = 0.65;
        c.beginPath();
        c.ellipse(0, 0, pl.rx * pulse, pl.ry * pulse, 0, 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;
      });
    }
  }

  // 2. วาดพร็อพตกแต่งริมแมพที่ไม่ขวางทางเดิน (ต้นสน / พุ่มน้ำแข็ง / หน่อคริสตัล)
  if (typeof MAP_DECOR !== 'undefined') {
    for (let i = 0; i < MAP_DECOR.length; i++) {
      const dec = MAP_DECOR[i];
      const pos = worldToIso(dec.x, dec.y, 0);
      const dx = Math.round(originX + pos.x);
      const dy = Math.round(originY + pos.y);
      const sway = Math.round(Math.sin(t * 2.5 + dec.phase) * 2);

      if (dec.kind === 'amber_sprout') {
        c.fillStyle = '#ea580c';
        c.fillRect(dx - 3, dy - 10, 6, 10);
        c.fillStyle = '#fef08a';
        c.fillRect(dx - 1, dy - 12, 2, 6);
      } else if (dec.kind === 'ice_bush') {
        c.fillStyle = '#0284c7';
        c.fillRect(dx - 7, dy - 8, 14, 8);
        c.fillStyle = '#bae6fd';
        c.fillRect(dx - 5 + sway, dy - 12, 10, 6);
      } else {
        c.fillStyle = '#14532d';
        c.fillRect(dx - 5, dy - 14, 10, 14);
        c.fillStyle = '#3f6212';
        c.fillRect(dx - 3 + sway, dy - 22, 6, 10);
      }
    }
  }

  // 3. วาดจุดสำรวจประจำห้อง (Exploration Shrines)
  if (typeof MAP_SHRINES !== 'undefined') {
    for (let i = 0; i < MAP_SHRINES.length; i++) {
      const sh = MAP_SHRINES[i];
      const pos = worldToIso(sh.x, sh.y, 0);
      const sx = Math.round(originX + pos.x);
      const sy = Math.round(originY + pos.y);
      const col = sh.kind === 'heal_spring' ? '#2dd4bf' : sh.kind === 'ember_altar' ? '#fbbf24' : '#38bdf8';

      drawPixelShadow(c, sx, sy + 3, 24, 12);
      c.fillStyle = '#1e293b';
      c.fillRect(sx - 16, sy - 8, 32, 10);
      c.fillStyle = '#475569';
      c.fillRect(sx - 14, sy - 10, 28, 4);

      if (!sh.used) {
        const hover = Math.sin(t * 4.5 + sh.phase) * 6;
        c.fillStyle = '#090b10';
        c.fillRect(sx - 7, Math.round(sy - 34 + hover), 14, 20);
        c.fillStyle = col;
        c.fillRect(sx - 5, Math.round(sy - 32 + hover), 10, 16);
        c.fillStyle = '#ffffff';
        c.fillRect(sx - 2, Math.round(sy - 29 + hover), 4, 10);

        c.font = '700 9px Silkscreen, monospace';
        c.textAlign = 'center';
        c.lineWidth = 3;
        c.strokeStyle = '#04060a';
        c.strokeText(sh.label, sx, Math.round(sy - 40 + hover));
        c.fillStyle = col;
        c.fillText(sh.label, sx, Math.round(sy - 40 + hover));
      }
    }
  }
}

function getHero8DirState(aimAngle) {
  const isoX = Math.cos(aimAngle) - Math.sin(aimAngle);
  const isoY = (Math.cos(aimAngle) + Math.sin(aimAngle)) * 0.5;
  const screenAngle = Math.atan2(isoY, isoX);

  const sector = (Math.round(screenAngle / (Math.PI / 4)) + 8) % 8;
  const poses = [
    { viewKey: 'side',      flipX: false }, // 0: E
    { viewKey: 'frontDiag', flipX: false }, // 1: SE
    { viewKey: 'front',     flipX: false }, // 2: S
    { viewKey: 'frontDiag', flipX: true  }, // 3: SW
    { viewKey: 'side',      flipX: true  }, // 4: W
    { viewKey: 'backDiag',  flipX: true  }, // 5: NW
    { viewKey: 'back',      flipX: false }, // 6: N
    { viewKey: 'backDiag',  flipX: false }, // 7: NE
  ];
  return { sector, screenAngle, ...poses[sector] };
}

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function getWeaponPoseForSector(aspKey, sector) {
  if (aspKey === 'volt') {
    const table = [
      { hx: 12,  hy: -19, restAngle: 0.52,  behind: false },
      { hx: 15,  hy: -18, restAngle: 0.72,  behind: false },
      { hx: 16,  hy: -18, restAngle: 0.92,  behind: false },
      { hx: -16, hy: -18, restAngle: 2.22,  behind: false },
      { hx: -12, hy: -19, restAngle: 2.62,  behind: false },
      { hx: -16, hy: -22, restAngle: -2.35, behind: true  },
      { hx: 16,  hy: -22, restAngle: -0.92, behind: true  },
      { hx: 16,  hy: -22, restAngle: -0.78, behind: true  },
    ];
    return table[sector];
  }
  if (aspKey === 'cryo') {
    const table = [
      { hx: 11,  hy: -19, restAngle: 0.48,  behind: false },
      { hx: 14,  hy: -18, restAngle: 0.72,  behind: false },
      { hx: 15,  hy: -18, restAngle: 0.95,  behind: false },
      { hx: -15, hy: -18, restAngle: 2.19,  behind: false },
      { hx: -11, hy: -19, restAngle: 2.66,  behind: false },
      { hx: -15, hy: -22, restAngle: -2.32, behind: true  },
      { hx: 15,  hy: -22, restAngle: -0.95, behind: true  },
      { hx: 15,  hy: -22, restAngle: -0.82, behind: true  },
    ];
    return table[sector];
  }
  const table = [
    { hx: 10,  hy: -18, restAngle: 0.45,  behind: false },
    { hx: 14,  hy: -17, restAngle: 0.68,  behind: false },
    { hx: -16, hy: -17, restAngle: 2.38,  behind: false },
    { hx: -14, hy: -17, restAngle: 2.46,  behind: false },
    { hx: -10, hy: -18, restAngle: 2.68,  behind: false },
    { hx: -16, hy: -20, restAngle: 2.55,  behind: true  },
    { hx: 16,  hy: -20, restAngle: 0.62,  behind: true  },
    { hx: 16,  hy: -20, restAngle: 0.55,  behind: true  },
  ];
  return table[sector];
}

function drawHeroWeapon(c, aspKey, isOverdrive, heroAccent, extraLen, t, flipBlade = false) {
  c.save();
  if (flipBlade) c.scale(1, -1);

  if (aspKey === 'volt') {
    const shaftLen = 46 + extraLen;
    c.fillStyle = '#07040e';
    c.fillRect(-20, -3, shaftLen + 20, 6);
    c.fillStyle = '#2e1065';
    c.fillRect(-19, -2, shaftLen + 18, 4);
    c.fillStyle = '#a855f7';
    c.fillRect(-16, -1, shaftLen + 12, 2);
    c.fillStyle = '#e879f9';
    c.fillRect(-22, -5, 3, 10);

    c.strokeStyle = '#f0abfc';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-12, 0);
    for (let seg = 1; seg <= 5; seg++) {
      const lx = -12 + (seg / 5) * (shaftLen + 8);
      const ly = Math.sin(t * 28 + seg * 2.1) * 5;
      c.lineTo(lx, ly);
    }
    c.stroke();

    const tipX = shaftLen - 2;
    c.fillStyle = '#07040e';
    c.beginPath();
    c.moveTo(tipX + 6, -5);
    c.quadraticCurveTo(tipX + 18, 17, tipX - 18, 34);
    c.quadraticCurveTo(tipX - 2, 16, tipX - 6, 2);
    c.closePath();
    c.fill();

    c.fillStyle = isOverdrive ? '#fbbf24' : '#a855f7';
    c.beginPath();
    c.moveTo(tipX + 4, -3);
    c.quadraticCurveTo(tipX + 14, 16, tipX - 15, 31);
    c.quadraticCurveTo(tipX - 1, 15, tipX - 4, 2);
    c.closePath();
    c.fill();

    c.fillStyle = isOverdrive ? '#fef08a' : '#f5d0fe';
    c.beginPath();
    c.moveTo(tipX + 3, 0);
    c.quadraticCurveTo(tipX + 10, 14, tipX - 10, 25);
    c.quadraticCurveTo(tipX + 2, 14, tipX - 1, 2);
    c.closePath();
    c.fill();

    const spOff = Math.round(Math.sin(t * 24) * 3);
    c.fillStyle = '#ffffff';
    c.fillRect(tipX + 5 + spOff, 11, 3, 3);
    c.fillStyle = '#e879f9';
    c.fillRect(tipX - 6 - spOff, 22, 3, 3);
  } else if (aspKey === 'cryo') {
    const bladeLen = 36 + extraLen;
    c.fillStyle = '#060a12';
    c.fillRect(-10, -3, 18, 6);
    c.fillStyle = '#475569';
    c.fillRect(-9, -2, 16, 4);
    c.fillStyle = '#060a12';
    c.fillRect(-14, -4, 6, 8);
    c.fillStyle = '#fbbf24';
    c.fillRect(-13, -3, 4, 6);
    c.fillStyle = '#fef08a';
    c.fillRect(-12, -2, 2, 3);

    c.fillStyle = '#060a12';
    c.fillRect(5, -12, 6, 24);
    c.fillStyle = '#67e8f9';
    c.fillRect(6, -11, 4, 22);
    c.fillStyle = '#fbbf24';
    c.fillRect(7, -3, 3, 6);

    const wave = Math.sin(t * 7.5) * 2.5;
    for (let b = 1; b <= 3; b++) {
      c.fillStyle = '#060a12';
      c.fillRect(7 + Math.round(wave * (b * 0.35)), 10 + b * 5, 5, 5);
      c.fillStyle = b === 2 ? '#a855f7' : '#22d3ee';
      c.fillRect(8 + Math.round(wave * (b * 0.35)), 11 + b * 5, 3, 3);
    }

    c.fillStyle = '#060a12';
    c.beginPath();
    c.moveTo(11, -7); c.lineTo(11 + bladeLen + 14, 0); c.lineTo(11, 7);
    c.closePath();
    c.fill();

    c.fillStyle = isOverdrive ? '#fbbf24' : '#22d3ee';
    c.beginPath();
    c.moveTo(12, -5); c.lineTo(11 + bladeLen + 11, 0); c.lineTo(12, 5);
    c.closePath();
    c.fill();

    c.fillStyle = '#ecfeff';
    c.beginPath();
    c.moveTo(13, -2); c.lineTo(11 + bladeLen + 7, 0); c.lineTo(13, 2);
    c.closePath();
    c.fill();
  } else {
    const bladeLen = 38 + extraLen;
    c.fillStyle = '#090b10';
    c.fillRect(-12, -3, 14, 6);
    c.fillStyle = '#7f1d1d';
    c.fillRect(-11, -2, 12, 4);
    c.fillStyle = '#090b10';
    c.fillRect(1, -11, 7, 22);
    c.fillStyle = '#334155';
    c.fillRect(2, -10, 5, 20);

    c.fillStyle = '#090b10';
    c.beginPath();
    c.moveTo(8, -8);
    c.lineTo(8 + bladeLen, -8);
    c.lineTo(8 + bladeLen + 7, 0);
    c.lineTo(8 + bladeLen, 8);
    c.lineTo(8, 8);
    c.closePath();
    c.fill();

    c.fillStyle = '#18181f';
    c.beginPath();
    c.moveTo(9, -6);
    c.lineTo(8 + bladeLen - 1, -6);
    c.lineTo(8 + bladeLen + 5, 0);
    c.lineTo(8 + bladeLen - 1, 6);
    c.lineTo(9, 6);
    c.closePath();
    c.fill();

    c.fillStyle = '#334155';
    c.fillRect(9, -6, bladeLen - 2, 2);
    for (let rn = 0; rn < 4; rn++) {
      const rx = 13 + rn * 8;
      c.fillStyle = '#ff6a00';
      c.fillRect(rx, -3, 5, 6);
      c.fillStyle = rn % 2 === 0 ? '#fef08a' : heroAccent;
      c.fillRect(rx + 1, -2, 3, 4);
    }
    const fl = Math.round(Math.sin(t * 22) * 2);
    c.fillStyle = '#ff6a00';
    c.fillRect(18 + fl, -9, 5, 2);
    c.fillRect(26 - fl, 7, 5, 2);
  }
  c.restore();
}

function drawSolarBackChain(c, sx, sy, bob, sideSign, t) {
  const sway = Math.sin(t * 6.2) * 4;
  const rodX = Math.round(sx + sideSign * 22);
  const rodY = Math.round(sy - 52 - bob);
  c.strokeStyle = '#090b10';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(Math.round(sx + sideSign * 4), Math.round(sy - 32 - bob));
  c.lineTo(rodX, rodY);
  c.stroke();
  c.strokeStyle = '#334155';
  c.lineWidth = 2;
  c.stroke();

  for (let ch = 0; ch < 5; ch++) {
    const cx = Math.round(rodX + sway * (ch / 4));
    const cy = rodY + 2 + ch * 5;
    c.fillStyle = '#090b10';
    c.fillRect(cx - 2, cy, 4, 4);
    c.fillStyle = ch % 2 === 0 ? '#94a3b8' : '#475569';
    c.fillRect(cx - 1, cy + 1, 2, 2);
  }
}

function drawIsoHero(c, p, sx, sy) {
  const aspKey = p.weaponAspect || 'solar';
  const activeAsp = WEAPON_ASPECTS[aspKey] || WEAPON_ASPECTS.solar;
  const isOverdrive = p.surgeTimer > 0;
  const heroAccent = isOverdrive ? '#ffb800' : activeAsp.color;
  const t = gameState.worldTime;

  const { sector, viewKey, flipX, screenAngle } = getHero8DirState(p.aimAngle);
  const isBackView = viewKey === 'back' || viewKey === 'backDiag';

  const speed = Math.hypot(p.vx, p.vy);
  const bob = speed > 20
    ? Math.abs(Math.sin(t * (aspKey === 'volt' ? 18 : 14))) * (aspKey === 'volt' ? 5 : 4)
    : Math.sin(t * (aspKey === 'cryo' ? 3 : 4.5)) * (aspKey === 'cryo' ? 2.5 : 1.5);

  drawPixelShadow(c, sx, sy + 2, aspKey === 'solar' ? 23 : 20, 11);

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
  } else {
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

  // 2. OVERDRIVE WINGS & BACK-LAYER ATTACHMENTS
  if (isOverdrive) {
    const flap = Math.sin(t * 14) * 5;
    for (let side = -1; side <= 1; side += 2) {
      c.fillStyle = '#f59e0b';
      c.fillRect(Math.round(sx + side * 14 - (side < 0 ? 18 : 0)), Math.round(sy - 42 - bob + flap), 18, 6);
      c.fillRect(Math.round(sx + side * 18 - (side < 0 ? 16 : 0)), Math.round(sy - 49 - bob + flap * 1.3), 16, 5);
      c.fillStyle = '#fef08a';
      c.fillRect(Math.round(sx + side * 12 - (side < 0 ? 14 : 0)), Math.round(sy - 40 - bob + flap), 14, 3);
    }
  }

  const chainSide = flipX ? 1 : -1;
  if (aspKey === 'solar' && !isBackView) {
    drawSolarBackChain(c, sx, sy, bob, chainSide, t);
  }

  if (aspKey === 'volt') {
    for (let vf = 0; vf < 5; vf++) {
      const fx = Math.round(sx + Math.sin(t * 8 + vf * 1.7) * 14);
      const fy = Math.round(sy - 46 - bob - ((t * 32 + vf * 7) % 16));
      c.fillStyle = vf % 2 === 0 ? '#e879f9' : '#c084fc';
      c.fillRect(fx - 2, fy - 2, 4, 4);
    }
  }

  const wPose = getWeaponPoseForSector(aspKey, sector);
  const extraLen = Math.min(14, (p.forgeLevel || 0) * 2);
  const swingMag = Math.abs(p.swordSwingOffset || 0);
  const swingBlend = Math.min(1, swingMag * 2.4);
  const targetAttackAngle = screenAngle + (p.swordSwingOffset || 0);
  const weaponAngle = swingBlend > 0.02
    ? lerpAngle(wPose.restAngle, targetAttackAngle, swingBlend)
    : wPose.restAngle + Math.sin(t * 3.5) * 0.04;
  const flipBlade = Math.cos(weaponAngle) < 0;

  const drawWeaponAtAnchor = () => {
    c.save();
    c.translate(Math.round(sx + wPose.hx), Math.round(sy + wPose.hy - bob));
    c.rotate(weaponAngle);
    drawHeroWeapon(c, aspKey, isOverdrive, heroAccent, extraLen, t, flipBlade);
    c.restore();
  };

  if (wPose.behind && swingBlend < 0.35) {
    drawWeaponAtAnchor();
  }

  // 3. HI-RES 8-DIRECTIONAL CHARACTER SPRITE (20x22 / 20x24 @ px=3)
  const dirSet = HERO_8DIR_SPRITES[aspKey] || HERO_8DIR_SPRITES.solar;
  const grid = dirSet[viewKey] || dirSet.front;

  let palette;
  if (aspKey === 'cryo') {
    palette = {
      k: '#070a10',
      a: '#574b5e',
      c: isOverdrive ? '#ca8a04' : '#0f766e',
      t: isOverdrive ? '#fef08a' : '#14b8a6',
      d: p.invulnTimer > 0 ? '#0369a1' : '#0b292c',
      i: '#67e8f9',
      p: '#a855f7',
      b: '#c4b5a5',
      w: '#f1f5f9',
      r: '#dc2626',
      g: '#fbbf24',
    };
  } else if (aspKey === 'volt') {
    palette = {
      k: '#06040d',
      d: p.invulnTimer > 0 ? '#4c1d95' : '#191624',
      h: '#353147',
      m: isOverdrive ? '#fef08a' : '#e879f9',
      t: isOverdrive ? '#fde047' : '#c084fc',
      v: isOverdrive ? '#f59e0b' : '#9333ea',
      b: '#d8b4fe',
      w: '#f5d0fe',
    };
  } else {
    palette = {
      k: '#090b10',
      h: '#2c313c',
      d: p.invulnTimer > 0 ? '#0e7490' : '#191c24',
      m: '#474e5e',
      f: isOverdrive ? '#fde047' : '#ff6a00',
      y: '#fef08a',
      r: '#991b1b',
      w: '#d6cfc7',
      s: '#d9a077',
    };
  }

  const spr = getCachedPixelSprite(
    `hero_pro8_v4_${aspKey}_${viewKey}_${isOverdrive ? 1 : 0}_${p.invulnTimer > 0 ? 1 : 0}`,
    grid,
    palette,
    3,
    flipX,
    false
  );
  c.drawImage(spr, Math.round(sx - spr.width * 0.5), Math.round(sy - spr.height + 6 - bob));

  if (aspKey === 'solar' && isBackView) {
    drawSolarBackChain(c, sx, sy, bob, chainSide, t);
  }

  if (aspKey === 'cryo') {
    const swayBead = Math.sin(t * 5.2) * 3.5;
    for (let side = -1; side <= 1; side += 2) {
      const bx = Math.round(sx + side * 20);
      const by = Math.round(sy - 58 - bob);
      c.strokeStyle = '#94a3b8';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(bx, by);
      c.lineTo(bx + swayBead, by + 10);
      c.stroke();
      c.fillStyle = side < 0 ? '#22d3ee' : '#a855f7';
      c.fillRect(Math.round(bx + swayBead) - 2, by + 8, 4, 4);
      c.fillStyle = '#ffffff';
      c.fillRect(Math.round(bx + swayBead) - 1, by + 9, 2, 2);
    }
    for (let k = 0; k < 3; k++) {
      const ca = t * 2.8 + k * ((Math.PI * 2) / 3);
      const cx = Math.round(sx + Math.cos(ca) * 28);
      const cy = Math.round(sy - 30 - bob + Math.sin(ca) * 10);
      c.fillStyle = '#083344';
      c.fillRect(cx - 3, cy - 5, 6, 10);
      c.fillStyle = '#22d3ee';
      c.fillRect(cx - 2, cy - 4, 4, 8);
      c.fillStyle = '#f0f9ff';
      c.fillRect(cx - 1, cy - 2, 2, 4);
    }
  }

  // 4. FRONT-LAYER WEAPON
  if (!wPose.behind || swingBlend >= 0.35) {
    drawWeaponAtAnchor();
  }

  // 5. TRANSFORMATION BURST VFX
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
  } else if (en.isDummy || en.type === 'dummy') {
    spr = getCachedPixelSprite(
      `dummy_${en.slowTimer > 0 ? 1 : 0}`,
      PIXEL_SPRITES.dummy,
      { k: '#090b10', w: '#e2e8f0', b: '#92400e', m: en.slowTimer > 0 ? '#38bdf8' : '#64748b' },
      3,
      false,
      en.hitFlash > 0
    );
    label = 'TRAINING DUMMY';
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

  // ดาวหมุนบนหัวเมื่อ Juggernaut หรือ บอสชนสิ่งกำบังจนติด Stun
  if ((en.stunTimer || 0) > 0) {
    for (let st = 0; st < 3; st++) {
      const sa = gameState.worldTime * 7 + st * ((Math.PI * 2) / 3);
      const ox = Math.round(sx + Math.cos(sa) * 18);
      const oy = Math.round(sy - drawH - 4 - bob + Math.sin(sa) * 5);
      c.fillStyle = '#090b10';
      c.fillRect(ox - 3, oy - 3, 6, 6);
      c.fillStyle = '#fde047';
      c.fillRect(ox - 2, oy - 2, 4, 4);
    }
  }

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

    if (en.isDummy) {
      c.font = '700 10px Silkscreen, monospace';
      c.textAlign = 'center';
      c.lineWidth = 3;
      c.strokeStyle = '#04060a';
      c.strokeText(label, Math.round(sx), by);
      c.fillStyle = '#fde047';
      c.fillText(label, Math.round(sx), by);
    } else if (en.hp < en.maxHp || en.type === 'juggernaut' || en.type === 'weaver' || elKey !== 'normal') {
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
// 9D-2. TACTICAL SECTOR MINIMAP (DARK MODE HUD OVERLAY)
// -------------------------------------------------------------------------
function drawTacticalMinimap(c, viewW, viewH) {
  if (gameState.phase !== 'playing' || !gameState.player) return;
  const mw = 184;
  const mh = 138;
  const mx = viewW - mw - 18;
  const my = viewH - mh - 18;
  const sx = mw / ARENA_W;
  const sy = mh / ARENA_H;

  c.save();
  c.fillStyle = 'rgba(7, 11, 18, 0.84)';
  c.fillRect(mx, my, mw, mh);
  c.strokeStyle = 'rgba(148, 163, 184, 0.48)';
  c.lineWidth = 2;
  c.strokeRect(mx, my, mw, mh);

  // บ่อธาตุ
  if (typeof MAP_POOLS !== 'undefined') {
    for (let i = 0; i < MAP_POOLS.length; i++) {
      const pl = MAP_POOLS[i];
      c.fillStyle = pl.kind === 'lava'
        ? 'rgba(234,88,12,0.58)'
        : pl.kind === 'ice'
        ? 'rgba(56,189,248,0.55)'
        : pl.kind === 'void'
        ? 'rgba(168,85,247,0.52)'
        : 'rgba(45,212,191,0.50)';
      c.beginPath();
      c.ellipse(mx + pl.x * sx, my + pl.y * sy, pl.rx * sx, pl.ry * sy, 0, 0, Math.PI * 2);
      c.fill();
    }
  }

  // สิ่งกำบัง (PILLARS)
  c.fillStyle = '#64748b';
  for (let i = 0; i < PILLARS.length; i++) {
    const pil = PILLARS[i];
    c.fillRect(Math.round(mx + pil.x * sx - 2), Math.round(my + pil.y * sy - 2), 4, 4);
  }

  // จุดสำรวจที่ยังไม่เก็บ (Shrines)
  if (typeof MAP_SHRINES !== 'undefined') {
    for (let i = 0; i < MAP_SHRINES.length; i++) {
      const sh = MAP_SHRINES[i];
      if (sh.used) continue;
      c.fillStyle = sh.kind === 'heal_spring' ? '#2dd4bf' : sh.kind === 'ember_altar' ? '#fbbf24' : '#38bdf8';
      c.fillRect(Math.round(mx + sh.x * sx - 3), Math.round(my + sh.y * sy - 3), 6, 6);
    }
  }

  // ประตูอุโมงค์เมื่อเคลียร์เวฟ
  if (gameState.portalOpen) {
    c.fillStyle = '#67e8f9';
    c.fillRect(Math.round(mx + TUNNEL_GATE.x * sx - 4), Math.round(my + TUNNEL_GATE.y * sy - 3), 8, 6);
  }

  // มอนสเตอร์และบอส
  c.fillStyle = '#f43f5e';
  for (let i = 0; i < gameState.enemies.length; i++) {
    const en = gameState.enemies[i];
    c.fillRect(Math.round(mx + en.x * sx - 1.5), Math.round(my + en.y * sy - 1.5), 3, 3);
  }
  if (gameState.boss && gameState.boss.hp > 0) {
    c.fillStyle = '#ff2a5f';
    c.fillRect(Math.round(mx + gameState.boss.x * sx - 4), Math.round(my + gameState.boss.y * sy - 4), 8, 8);
    c.strokeStyle = '#fef08a';
    c.lineWidth = 1;
    c.strokeRect(Math.round(mx + gameState.boss.x * sx - 4), Math.round(my + gameState.boss.y * sy - 4), 8, 8);
  }

  // ตำแหน่งผู้เล่น
  const px = mx + gameState.player.x * sx;
  const py = my + gameState.player.y * sy;
  c.fillStyle = '#ffffff';
  c.fillRect(Math.round(px - 3), Math.round(py - 3), 6, 6);
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 1.5;
  c.strokeRect(Math.round(px - 3), Math.round(py - 3), 6, 6);

  c.font = '700 9px Silkscreen, monospace';
  c.textAlign = 'left';
  c.fillStyle = '#94a3b8';
  c.fillText('SECTOR MAP', mx + 6, my + 12);
  c.restore();
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

  const isLobby = gameState.zone === 'lobby';
  if (isLobby) {
    if (!lobbyMapCanvas) buildLobbyPixelMap();
  } else {
    if (!isoMapCanvas) buildIsometricPixelMap(gameState.biomeIndex || 0);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  if (isLobby) {
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, viewW, viewH);
  } else {
    const activeBiome = ROOM_BIOMES[(gameState.biomeIndex || 0) % ROOM_BIOMES.length];
    const bgGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    bgGrad.addColorStop(0, activeBiome ? activeBiome.skyTop : '#132429');
    bgGrad.addColorStop(0.55, activeBiome ? activeBiome.skyMid : '#192f34');
    bgGrad.addColorStop(1, activeBiome ? activeBiome.skyBot : '#0b161a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  const shakeMag = gameState.shakeMag;
  const jitter = shakeMag > 0 ? (Math.random() - 0.5) * shakeMag * 0.6 : 0;
  const shakeX = shakeMag > 0 ? gameState.shakeDirX * shakeMag * 1.3 + jitter : 0;
  const shakeY = shakeMag > 0 ? gameState.shakeDirY * shakeMag * 1.3 - jitter : 0;

  const camIso = worldToIso(gameState.camera.x, gameState.camera.y, 0);
  const originX = Math.round(viewW * 0.5 - camIso.x + shakeX);
  const originY = Math.round(viewH * 0.5 - camIso.y + shakeY);

  if (isLobby) {
    ctx.drawImage(lobbyMapCanvas, originX - lobbyMapOriginX, originY - lobbyMapOriginY);
  } else {
    ctx.drawImage(isoMapCanvas, originX - isoMapOriginX, originY - isoMapOriginY);
  }

  if (!isLobby) for (let i = 0; i < isoWaterProps.length; i++) {
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

  const withIsoGroundPlane = (wx, wy, wz, drawFn) => {
    const pos = worldToIso(wx, wy, wz);
    ctx.save();
    ctx.translate(originX + pos.x, originY + pos.y);
    ctx.transform(0.5, 0.25, -0.5, 0.25, 0, 0);
    drawFn();
    ctx.restore();
  };

  if (isLobby) {
    drawLobbyInteractiveProps(ctx, originX, originY, withIsoGroundPlane);
  } else {
    drawMapPoolsAndShrines(ctx, originX, originY, withIsoGroundPlane);
  }

  // เตือนวงปล่องความร้อนก่อนปะทุ (5.2s - 6.5s)
  if ((gameState.ventCycleTimer || 0) > 5.2 && typeof THERMAL_VENTS !== 'undefined') {
    const warnProg = Math.min(1, ((gameState.ventCycleTimer - 5.2) / 1.3));
    for (let v = 0; v < THERMAL_VENTS.length; v++) {
      const vent = THERMAL_VENTS[v];
      withIsoGroundPlane(vent.x, vent.y, 2, () => {
        ctx.beginPath();
        ctx.arc(0, 0, 96, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 106, 0, 0.65)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 96 * warnProg, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 106, 0, 0.22)';
        ctx.fill();
      });
    }
  }

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

  // เส้นเตือนท่าโจมตีของบอส (รองรับ slam, beam, charge, ring)
  if (gameState.boss && gameState.boss.telegraph) {
    const tel = gameState.boss.telegraph;
    const prog = 1 - Math.max(0, tel.timer / tel.maxTimer);
    withIsoGroundPlane(tel.x, tel.y, 2, () => {
      if (tel.kind === 'beam' || tel.kind === 'charge') {
        const halfW = tel.kind === 'charge' ? 34 : 28;
        ctx.rotate(tel.angle);
        ctx.fillStyle = tel.kind === 'charge' ? 'rgba(251, 191, 36, 0.22)' : 'rgba(255, 42, 95, 0.22)';
        ctx.fillRect(0, -halfW, tel.r, halfW * 2);
        ctx.fillStyle = tel.kind === 'charge'
          ? `rgba(251, 146, 60, ${(0.25 + prog * 0.42).toFixed(2)})`
          : `rgba(255, 42, 95, ${(0.25 + prog * 0.4).toFixed(2)})`;
        ctx.fillRect(0, -halfW * prog, tel.r, halfW * 2 * prog);
        ctx.strokeStyle = tel.kind === 'charge' ? '#fbbf24' : '#ff2a5f';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, -halfW, tel.r, halfW * 2);
      } else {
        const strokeCol = tel.kind === 'ring' ? '#e879f9' : '#ff2a5f';
        ctx.beginPath();
        ctx.arc(0, 0, tel.r, 0, Math.PI * 2);
        ctx.fillStyle = tel.kind === 'ring' ? 'rgba(232, 121, 249, 0.16)' : 'rgba(255, 42, 95, 0.18)';
        ctx.fill();
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, tel.r * prog, 0, Math.PI * 2);
        ctx.fillStyle = tel.kind === 'ring' ? 'rgba(232, 121, 249, 0.32)' : 'rgba(255, 42, 95, 0.36)';
        ctx.fill();
      }
    });
  }

  const renderQueue = [];
  const activeRenderPillars = isLobby && typeof LOBBY_PILLARS !== 'undefined' ? LOBBY_PILLARS : PILLARS;
  for (let i = 0; i < activeRenderPillars.length; i++) renderQueue.push({ depth: activeRenderPillars[i].x + activeRenderPillars[i].y, kind: 'pillar', obj: activeRenderPillars[i] });
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
      const poseAi = gameState.player
        ? getHero8DirState(gameState.player.aimAngle)
        : { viewKey: 'front', flipX: false };
      const sprGrid = (HERO_8DIR_SPRITES[curAsp] && HERO_8DIR_SPRITES[curAsp][poseAi.viewKey]) || PIXEL_SPRITES.hero_solar;
      const aiPal = curAsp === 'volt'
        ? { k: '#581c87', d: '#7e22ce', h: '#a855f7', m: '#f5d0fe', t: '#e879f9', v: '#c084fc', b: '#fae8ff', w: '#ffffff' }
        : curAsp === 'cryo'
        ? { k: '#0369a1', a: '#38bdf8', c: '#0ea5e9', t: '#7dd3fc', d: '#0284c7', i: '#e0f2fe', p: '#c084fc', b: '#bae6fd', w: '#ffffff', r: '#7dd3fc', g: '#e0f2fe' }
        : { k: '#9a3412', h: '#ea580c', d: '#c2410c', m: '#fb923c', f: '#fde047', y: '#fef9c3', r: '#f97316', w: '#fed7aa', s: '#fdba74' };
      ctx.save();
      ctx.globalAlpha = Math.max(0, ai.alpha * 0.58);
      const spr = getCachedPixelSprite(`hero_pro8_v4_ai_${curAsp}_${poseAi.viewKey}`, sprGrid, aiPal, 3, poseAi.flipX, false);
      ctx.drawImage(spr, Math.round(sx - spr.width * 0.5), Math.round(sy - spr.height + 6));
      ctx.restore();
    }
  }

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
    ctx.fillStyle = b.color || '#ffb800';
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
  vig.addColorStop(1, 'rgba(3,6,10,0.48)');
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
      !String(ft.text).includes('SUPERCONDUCT') &&
      !String(ft.text).includes('STUNNED') &&
      !String(ft.text).includes('STAGGERED')
    ) {
      ctx.font = '800 10px Silkscreen, monospace';
      ctx.strokeText('CRIT', tx, ty + 12);
      ctx.fillStyle = '#ff6a00';
      ctx.fillText('CRIT', tx, ty + 12);
    }
    ctx.restore();
  }

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

  if (isLobby) {
    ctx.save();
    ctx.fillStyle = 'rgba(7, 11, 18, 0.72)';
    ctx.fillRect(viewW - 196, viewH - 44, 178, 28);
    ctx.strokeStyle = 'rgba(255, 42, 95, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(viewW - 196, viewH - 44, 178, 28);
    ctx.font = '700 9px Silkscreen, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fda4af';
    ctx.fillText('SANCTUM HALL // LOBBY', viewW - 107, viewH - 27);
    ctx.restore();
  } else {
    drawTacticalMinimap(ctx, viewW, viewH);
  }

  if (gameState.transitionTimer > 0) {
    const mid = 0.425;
    const fadeAlpha = 1 - Math.abs(gameState.transitionTimer - mid) / mid;
    ctx.fillStyle = `rgba(4, 6, 12, ${Math.max(0, Math.min(1, fadeAlpha)).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  syncHudDom();
}

let hudCompactInjected = false;
let hudLogCollapsed = false;

function applyGothicCyberHudStyle() {
  if (!hudCompactInjected) {
    hudCompactInjected = true;
    const style = document.createElement('style');
    style.id = 'ov-clean-hud-css';
    style.textContent = `
      /* Compact, sleek Dark Mode HUD that leaves maximum viewport for the Sanctum & Arena */
      .ov-chamfer-panel {
        background: rgba(7, 11, 18, 0.72) !important;
        backdrop-filter: blur(4px);
        border-color: rgba(148, 163, 184, 0.28) !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      }
      #hud-status-card {
        transform: scale(0.88);
        transform-origin: top left;
        padding: 8px 10px !important;
      }
      #hud-wave-card {
        transform: scale(0.86);
        transform-origin: top center;
        padding: 6px 12px !important;
      }
      #hud-controls-card {
        transform: scale(0.84);
        transform-origin: top right;
        gap: 4px !important;
      }
      #hud-skill-dock {
        transform: scale(0.86);
        transform-origin: bottom left;
      }
      #hud-log-card {
        transform: scale(0.84);
        transform-origin: bottom right;
        max-width: 240px !important;
        opacity: 0.82;
        transition: opacity 0.2s ease, transform 0.2s ease;
        margin-right: 196px !important; /* เว้นที่ให้ Minimap / Sanctum Badge มุมล่างขวาไม่ซ้อนทับ */
      }
      #hud-log-card:hover {
        opacity: 1;
      }
      #hud-log-card.ov-log-minimized #combat-log,
      #hud-log-card.ov-log-minimized #hud-combat-log {
        display: none !important;
      }
      #hud-log-card.ov-log-minimized {
        padding-top: 4px !important;
        padding-bottom: 4px !important;
        opacity: 0.65;
      }
      body.ov-hud-minimal #hud-log-card,
      body.ov-hud-minimal #hud-wave-card {
        opacity: 0.22;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // กด [H] เพื่อสลับโหมด Minimal HUD (ซ่อน/แสดงกรอบเสริมให้จอโล่งสุดๆ)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH' && typeof gameState !== 'undefined' && gameState.phase === 'playing') {
        document.body.classList.toggle('ov-hud-minimal');
      }
    });
  }

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

  // ทำให้กรอบบันทึกการรบคลิกพับ/กางได้ เพื่อไม่ให้เกะกะหน้าจอ
  const logCard = document.getElementById('hud-log-card');
  if (logCard && !logCard.dataset.collapsibleBound) {
    logCard.dataset.collapsibleBound = '1';
    logCard.style.cursor = 'pointer';
    logCard.title = 'คลิกเพื่อพับ/กางบันทึกการรบ (หรือกด H เพื่อโหมดจอโล่ง)';
    logCard.addEventListener('click', () => {
      hudLogCollapsed = !hudLogCollapsed;
      logCard.classList.toggle('ov-log-minimized', hudLogCollapsed);
    });
  }

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
  if (hpText) {
    const shTxt = (p.shield || 0) > 0 ? ` [+${Math.ceil(p.shield)} SHD]` : '';
    hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}${shTxt}`;
  }

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