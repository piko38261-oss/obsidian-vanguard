// =========================================================================
// OBSIDIAN VANGUARD // HD ISOMETRIC PIXEL ART TITLE SCENE + LIVE VFX
// Loads assets/title-bg.jpg (or .png) + Mouse Parallax + Live Embers & Mist
// =========================================================================
(function initTitleScenery() {
  let titleCanvas = null;
  let tctx = null;
  let bgImage = null;
  let bgReady = false;
  let sceneTime = 0;
  let lastFrame = performance.now();

  let mouseNormX = 0;
  let mouseNormY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Load title background image (supports both .jpg and .png automatically)
  function loadTitleArtwork() {
    const candidates = ['assets/title-bg.jpg', 'assets/title-bg.png', 'assets/title-bg.webp'];
    let idx = 0;

    const tryNext = () => {
      if (idx >= candidates.length) return;
      const img = new Image();
      img.onload = () => {
        bgImage = img;
        bgReady = true;
      };
      img.onerror = () => {
        idx++;
        tryNext();
      };
      img.src = candidates[idx];
    };
    tryNext();
  }

  // Drifting warm pixel embers rising from the central courtyard fire & brazier
  const embers = Array.from({ length: 46 }, (_, i) => ({
    x: 0.22 + Math.random() * 0.56,
    y: 0.25 + Math.random() * 0.72,
    vy: 0.032 + Math.random() * 0.055,
    vx: (Math.random() - 0.5) * 0.015,
    size: i % 4 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
    phase: Math.random() * Math.PI * 2,
    cyan: i % 7 === 0,
  }));

  // Creeping cool blue-teal valley mist clouds along lower & outer edges
  const mistPuffs = Array.from({ length: 14 }, (_, i) => ({
    x: Math.random(),
    y: i < 7 ? 0.68 + Math.random() * 0.3 : 0.1 + Math.random() * 0.28,
    r: 0.12 + Math.random() * 0.14,
    spd: 0.008 + Math.random() * 0.012,
    alpha: 0.08 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
  }));

  // Waterfall spray & shimmer particles for the lower-left cliff cascade
  const waterDrops = Array.from({ length: 24 }, () => ({
    x: 0.02 + Math.random() * 0.11,
    y: 0.72 + Math.random() * 0.28,
    vy: 0.16 + Math.random() * 0.14,
    len: 4 + Math.random() * 8,
  }));

  function renderTitleFrame(dt) {
    if (!titleCanvas || !tctx) return;

    const viewW = titleCanvas.clientWidth || window.innerWidth;
    const viewH = titleCanvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (titleCanvas.width !== Math.floor(viewW * dpr) || titleCanvas.height !== Math.floor(viewH * dpr)) {
      titleCanvas.width = Math.floor(viewW * dpr);
      titleCanvas.height = Math.floor(viewH * dpr);
    }

    const g = tctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Smooth camera parallax following cursor
    mouseNormX += (targetMouseX - mouseNormX) * Math.min(1, dt * 4.5);
    mouseNormY += (targetMouseY - mouseNormY) * Math.min(1, dt * 4.5);

    const maxShiftX = Math.min(22, viewW * 0.018);
    const maxShiftY = Math.min(14, viewH * 0.018);
    const shiftX = -mouseNormX * maxShiftX;
    const shiftY = -mouseNormY * maxShiftY;

    // 1. Base Backdrop Fill
    g.fillStyle = '#070b14';
    g.fillRect(0, 0, viewW, viewH);

    // 2. Draw HD Isometric Pixel Art Background (Cover Fit + Parallax Overscan)
    let imgDrawX = 0;
    let imgDrawY = 0;
    let imgDrawW = viewW;
    let imgDrawH = viewH;

    if (bgReady && bgImage) {
      const overscan = 1.06;
      const imgAspect = bgImage.width / Math.max(1, bgImage.height);
      const viewAspect = viewW / Math.max(1, viewH);

      if (viewAspect > imgAspect) {
        imgDrawW = viewW * overscan;
        imgDrawH = imgDrawW / imgAspect;
      } else {
        imgDrawH = viewH * overscan;
        imgDrawW = imgDrawH * imgAspect;
      }

      imgDrawX = (viewW - imgDrawW) * 0.5 + shiftX;
      imgDrawY = (viewH - imgDrawH) * 0.5 + shiftY;

      g.save();
      g.imageSmoothingEnabled = false;
      g.drawImage(bgImage, Math.round(imgDrawX), Math.round(imgDrawY), Math.round(imgDrawW), Math.round(imgDrawH));
      g.restore();
    }

    // Helper to map normalized artwork coordinates (0..1) onto screen with parallax
    const toScreenX = (nx) => imgDrawX + nx * imgDrawW;
    const toScreenY = (ny) => imgDrawY + ny * imgDrawH;

    // 3. Animated Flickering Campfire & Brazier Warm Light Bloom
    const fireFlicker = 0.88 + Math.sin(sceneTime * 11.5) * 0.07 + Math.sin(sceneTime * 19.3) * 0.05;
    g.save();
    g.globalCompositeOperation = 'lighter';

    // Central campfire glow (around courtyard center)
    const fireX = toScreenX(0.49);
    const fireY = toScreenY(0.61);
    const fireR = Math.max(140, imgDrawW * 0.19) * fireFlicker;
    const fireGrad = g.createRadialGradient(fireX, fireY, 4, fireX, fireY, fireR);
    fireGrad.addColorStop(0, 'rgba(255, 225, 130, 0.34)');
    fireGrad.addColorStop(0.35, 'rgba(255, 115, 20, 0.18)');
    fireGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
    g.fillStyle = fireGrad;
    g.beginPath();
    g.arc(fireX, fireY, fireR, 0, Math.PI * 2);
    g.fill();

    // Left bronze brazier warm glow
    const brazX = toScreenX(0.28);
    const brazY = toScreenY(0.60);
    const brazR = Math.max(85, imgDrawW * 0.11) * (0.9 + Math.cos(sceneTime * 13) * 0.08);
    const brazGrad = g.createRadialGradient(brazX, brazY, 2, brazX, brazY, brazR);
    brazGrad.addColorStop(0, 'rgba(255, 210, 110, 0.28)');
    brazGrad.addColorStop(0.45, 'rgba(255, 106, 0, 0.12)');
    brazGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
    g.fillStyle = brazGrad;
    g.beginPath();
    g.arc(brazX, brazY, brazR, 0, Math.PI * 2);
    g.fill();

    // Subtle breathing glow on the hero's Solar Greatsword
    const swordX = toScreenX(0.55);
    const swordY = toScreenY(0.65);
    const swordR = Math.max(42, imgDrawW * 0.055) * (0.88 + Math.sin(sceneTime * 6) * 0.12);
    const swordGrad = g.createRadialGradient(swordX, swordY, 2, swordX, swordY, swordR);
    swordGrad.addColorStop(0, 'rgba(255, 190, 60, 0.30)');
    swordGrad.addColorStop(1, 'rgba(255, 106, 0, 0)');
    g.fillStyle = swordGrad;
    g.beginPath();
    g.arc(swordX, swordY, swordR, 0, Math.PI * 2);
    g.fill();
    g.restore();

    // 4. Lower-Left Waterfall Animated Shimmer Streaks
    g.save();
    for (let i = 0; i < waterDrops.length; i++) {
      const wd = waterDrops[i];
      wd.y += wd.vy * dt;
      if (wd.y > 1.02) {
        wd.y = 0.72 + Math.random() * 0.05;
        wd.x = 0.02 + Math.random() * 0.11;
      }
      const wx = Math.round(toScreenX(wd.x));
      const wy = Math.round(toScreenY(wd.y));
      g.fillStyle = 'rgba(186, 240, 255, 0.45)';
      g.fillRect(wx, wy, 2, Math.round(wd.len));
    }
    g.restore();

    // 5. Drifting Cool Blue-Teal Valley Mist
    g.save();
    for (let i = 0; i < mistPuffs.length; i++) {
      const m = mistPuffs[i];
      m.x = (m.x + m.spd * dt) % 1.3;
      const mx = (m.x - 0.15) * viewW + shiftX * 1.4;
      const my = m.y * viewH + Math.sin(sceneTime * 0.8 + m.phase) * 8 + shiftY * 1.4;
      const mr = m.r * Math.max(viewW, viewH);
      const mg = g.createRadialGradient(mx, my, 4, mx, my, mr);
      mg.addColorStop(0, `rgba(90, 175, 205, ${m.alpha.toFixed(3)})`);
      mg.addColorStop(1, 'rgba(20, 60, 85, 0)');
      g.fillStyle = mg;
      g.beginPath();
      g.ellipse(mx, my, mr, mr * 0.48, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();

    // 6. Rising Crisp Pixel Embers & Arcane Fireflies
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.y -= e.vy * dt;
      e.x += (e.vx + Math.sin(sceneTime * 2.2 + e.phase) * 0.008) * dt;
      if (e.y < 0.04) {
        e.y = 0.62 + Math.random() * 0.34;
        e.x = 0.24 + Math.random() * 0.52;
      }
      const ex = Math.round(toScreenX(e.x) + shiftX * 0.5);
      const ey = Math.round(toScreenY(e.y) + shiftY * 0.5);
      const twinkle = 0.45 + (Math.sin(sceneTime * 6 + e.phase) + 1) * 0.27;
      g.fillStyle = e.cyan
        ? `rgba(103, 232, 249, ${twinkle.toFixed(2)})`
        : `rgba(255, 190, 65, ${twinkle.toFixed(2)})`;
      g.fillRect(ex, ey, e.size, e.size);
    }
    g.restore();

    // 7. Soft Top & Bottom Gradient Vignette for Sharp Logo & Button Readability
    const topFade = g.createLinearGradient(0, 0, 0, viewH * 0.26);
    topFade.addColorStop(0, 'rgba(4, 7, 14, 0.72)');
    topFade.addColorStop(1, 'rgba(4, 7, 14, 0)');
    g.fillStyle = topFade;
    g.fillRect(0, 0, viewW, viewH * 0.26);

    const botFade = g.createLinearGradient(0, viewH * 0.74, 0, viewH);
    botFade.addColorStop(0, 'rgba(4, 7, 14, 0)');
    botFade.addColorStop(1, 'rgba(4, 7, 14, 0.80)');
    g.fillStyle = botFade;
    g.fillRect(0, viewH * 0.74, viewW, viewH * 0.26);
  }

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;

    const overlay = document.getElementById('overlay-start');
    if (overlay && !overlay.classList.contains('hidden')) {
      sceneTime += dt;
      renderTitleFrame(dt);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('DOMContentLoaded', () => {
    titleCanvas = document.getElementById('title-bg-canvas');
    if (!titleCanvas) return;
    tctx = titleCanvas.getContext('2d');

    loadTitleArtwork();

    window.addEventListener('pointermove', (e) => {
      targetMouseX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      targetMouseY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    });

    const toggleCtrlBtn = document.getElementById('btn-toggle-controls');
    const ctrlDrawer = document.getElementById('title-controls-drawer');
    if (toggleCtrlBtn && ctrlDrawer) {
      toggleCtrlBtn.addEventListener('click', () => {
        ctrlDrawer.classList.toggle('hidden');
      });
    }

    const titleLangBtn = document.getElementById('btn-title-lang');
    if (titleLangBtn) {
      titleLangBtn.addEventListener('click', () => {
        if (typeof setLanguage === 'function' && typeof currentLang !== 'undefined') {
          setLanguage(currentLang === 'th' ? 'en' : 'th');
        }
      });
    }

    requestAnimationFrame(loop);
  });
})();