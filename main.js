// -------------------------------------------------------------------------
    // 10. INPUT BINDINGS & MAIN LOOP
    // -------------------------------------------------------------------------
    function bindInputsAndButtons() {
      window.addEventListener('keydown', (e) => {
        const code = e.code;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
          e.preventDefault();
        }
        gameState.keys.add(code);

        if (code === 'KeyT') {
          toggleArpgModal('tree');
          return;
        }
        if (code === 'KeyI') {
          toggleArpgModal('forge');
          return;
        }
        if (code === 'Escape') {
          const treeEl = document.getElementById('overlay-tree');
          const forgeEl = document.getElementById('overlay-forge');
          if (treeEl && !treeEl.classList.contains('hidden')) {
            toggleArpgModal('tree');
            return;
          }
          if (forgeEl && !forgeEl.classList.contains('hidden')) {
            toggleArpgModal('forge');
            return;
          }
        }
        if (code === 'Digit1') {
          switchWeaponAspect('solar');
          return;
        }
        if (code === 'Digit2') {
          switchWeaponAspect('cryo');
          return;
        }
        if (code === 'Digit3') {
          switchWeaponAspect('volt');
          return;
        }
        if (code === 'KeyP' || code === 'Escape') {
          if (gameState.phase === 'arpg_pause') {
            document.getElementById('overlay-tree')?.classList.add('hidden');
            document.getElementById('overlay-forge')?.classList.add('hidden');
            gameState.phase = 'playing';
            return;
          }
          if (gameState.phase === 'playing' || gameState.phase === 'paused') {
            togglePause();
          }
          return;
        }

        if (code === 'KeyM') {
          sfx.muted = !sfx.muted;
          const lbl = document.getElementById('label-audio');
          const ico = document.getElementById('icon-audio');
          if (lbl) lbl.textContent = sfx.muted ? 'MUTED' : 'SFX ON';
          if (ico) ico.className = sfx.muted ? 'w-4 h-4 text-slate-500' : 'w-4 h-4 text-amber-400';
          if (!sfx.muted) ensureAudio();
          return;
        }

        if (gameState.phase !== 'playing') return;

        if (code === 'KeyJ') performBladeCleave();
        else if (code === 'KeyK') performVoidLance();
        else if (code === 'KeyE' || code === 'KeyL') performPulseNova();
        else if (code === 'KeyQ') performBloodGoldSurge();
        else if (code === 'KeyR') performSolarCataclysm();
        else if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') performDodgeRoll();
      });

      window.addEventListener('keyup', (e) => {
        gameState.keys.delete(e.code);
      });

      canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gameState.mouseScreen.x = e.clientX - rect.left;
        gameState.mouseScreen.y = e.clientY - rect.top;
      });

      canvas.addEventListener('pointerdown', (e) => {
        const rect = canvas.getBoundingClientRect();
        gameState.mouseScreen.x = e.clientX - rect.left;
        gameState.mouseScreen.y = e.clientY - rect.top;

        if (gameState.phase !== 'playing') return;
        if (e.button === 2) {
          performVoidLance();
        } else {
          performBladeCleave();
        }
      });

      canvas.addEventListener('contextmenu', (e) => e.preventDefault());

      // HUD Buttons
      document.getElementById('btn-lang')?.addEventListener('click', () => {
        setLanguage(currentLang === 'th' ? 'en' : 'th');
      });

      document.getElementById('btn-mute')?.addEventListener('click', () => {
        sfx.muted = !sfx.muted;
        const lbl = document.getElementById('label-audio');
        const ico = document.getElementById('icon-audio');
        if (lbl) lbl.textContent = sfx.muted ? 'MUTED' : 'SFX ON';
        if (ico) ico.className = sfx.muted ? 'w-4 h-4 text-slate-500' : 'w-4 h-4 text-amber-400';
        if (!sfx.muted) ensureAudio();
      });

      document.getElementById('btn-pause')?.addEventListener('click', togglePause);
      document.getElementById('btn-resume')?.addEventListener('click', togglePause);
      document.getElementById('btn-restart-pause')?.addEventListener('click', startNewRun);
      document.getElementById('btn-start-game')?.addEventListener('click', startNewRun);
      document.getElementById('btn-play-again')?.addEventListener('click', startNewRun);

      document.getElementById('skill-btn-cleave')?.addEventListener('click', performBladeCleave);
      document.getElementById('skill-btn-lance')?.addEventListener('click', performVoidLance);
      document.getElementById('skill-btn-nova')?.addEventListener('click', performPulseNova);
      document.getElementById('skill-btn-surge')?.addEventListener('click', performBloodGoldSurge);
      document.getElementById('skill-btn-cataclysm')?.addEventListener('click', performSolarCataclysm);
      document.getElementById('skill-btn-dash')?.addEventListener('click', performDodgeRoll);

      document.getElementById('btn-open-tree')?.addEventListener('click', () => toggleArpgModal('tree'));
      document.getElementById('btn-close-tree')?.addEventListener('click', () => toggleArpgModal('tree'));
      document.getElementById('btn-open-forge')?.addEventListener('click', () => toggleArpgModal('forge'));
      document.getElementById('btn-close-forge')?.addEventListener('click', () => toggleArpgModal('forge'));
      document.getElementById('aspect-btn-solar')?.addEventListener('click', () => switchWeaponAspect('solar'));
      document.getElementById('aspect-btn-cryo')?.addEventListener('click', () => switchWeaponAspect('cryo'));
      document.getElementById('aspect-btn-volt')?.addEventListener('click', () => switchWeaponAspect('volt'));

      document.getElementById('btn-forge-upgrade')?.addEventListener('click', () => {
        const p = gameState.player;
        if (!p) return;
        const cost = 15 + (p.forgeLevel || 0) * 10;
        if ((p.shards || 0) >= cost) {
          p.shards -= cost;
          p.forgeLevel = (p.forgeLevel || 0) + 1;
          p.baseDamage = Math.round(p.baseDamage * 1.16);
          playCombatSfx('surge', 1.25);
          renderForgeModal();
          syncHudDom();
        }
      });
    }

    let lastTime = performance.now();

    function mainLoop(now) {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      updateSimulation(dt);
      renderArena();

      requestAnimationFrame(mainLoop);
    }

    window.addEventListener('DOMContentLoaded', () => {
      initAmbientEmbers();
      gameState.player = createInitialPlayer();
      refreshHighScoreUI();
      setLanguage('th');
      bindInputsAndButtons();
      requestAnimationFrame(mainLoop);
    });
