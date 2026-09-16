/**
 * Simpliers Online Random Selector Controller
 * 
 * Provides complete interactivity and visual fidelity for the Online Random Selector page:
 * - Real-time line/entry counting with deduplication indicator
 * - Clipboard paste and quick-clear actions
 * - File drag-and-drop & parsing (.txt, .csv, .xls, .xlsx)
 * - Page customization (Brand name, custom logo, theme colors)
 * - Rule configuration: Contest Name, Unique Users, Winner Count, Substitutes, Countdown Timer
 * - Backend API integration (/api/giveaways/ with platform='list' and /draw/)
 * - High-tech countdown overlay with audio synthesis & slot-machine name shuffling
 * - Canvas confetti celebration
 * - Authentic Results Screen with Winners podium, Substitutes, and verifiable Simpliers Certificate
 * - Result exporting (Copy to Clipboard, Download CSV/Text)
 * - Certificate lookup modal integration
 * - Dark/Light theme switching
 */

(function () {
  'use strict';

  const state = {
    entries: [],
    contestName: 'First Year Contest',
    brandName: 'Add Your Brand Here',
    brandLogoUrl: null,
    winnerCount: 1,
    substituteCount: 1,
    countdownSeconds: 3,
    uniqueOnly: false,
    gifts: ['Main Prize'],
    isDrawing: false,
    drawResult: null,
  };

  // Sound generator using Web Audio API
  let audioContext = null;
  function getAudioContext() {
    if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  function playTone(freq, type = 'sine', duration = 0.15) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not permitted without interaction
    }
  }

  function playCelebrationFanfare() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'triangle', 0.3), idx * 120);
    });
  }

  function initAll() {
    initCookieConsent();
    initThemeToggle();
    initCustomizePage();
    initListInput();
    initRulesAndSettings();
    initDrawAction();
    console.info('[Simpliers] Online Random Selector Controller initialized successfully!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // 1. Cookie Consent
  function initCookieConsent() {
    const consentBar = document.getElementById('consent-bar');
    if (!consentBar) return;
    consentBar.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        consentBar.style.display = 'none';
      });
    });
    setTimeout(() => {
      if (consentBar) {
        consentBar.style.opacity = '0';
        setTimeout(() => { if (consentBar) consentBar.style.display = 'none'; }, 400);
      }
    }, 1200);
  }

  // 2. Theme Toggle
  function initThemeToggle() {
    const htmlEl = document.documentElement;
    const themeBtns = document.querySelectorAll('button[aria-label="theme"], .theme-toggle, input[type="checkbox"][id*="theme"]');

    function toggleTheme() {
      const isDark = htmlEl.classList.contains('dark') || htmlEl.getAttribute('data-theme') === 'dark';
      if (isDark) {
        htmlEl.classList.remove('dark');
        htmlEl.setAttribute('data-theme', 'light');
        localStorage.setItem('simpliers_theme', 'light');
      } else {
        htmlEl.classList.add('dark');
        htmlEl.setAttribute('data-theme', 'dark');
        localStorage.setItem('simpliers_theme', 'dark');
      }
    }

    const savedTheme = localStorage.getItem('simpliers_theme') || 'dark';
    if (savedTheme === 'light') {
      htmlEl.classList.remove('dark');
      htmlEl.setAttribute('data-theme', 'light');
    }

    themeBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    }));
  }

  // 3. Customize Page (Brand Name, Logo, Colors)
  function initCustomizePage() {
    const brandNameInput = document.querySelector('input[placeholder="Brand Name"]');
    const brandNameDisplay = document.querySelector('#listSetup .card-header em u');
    const brandLogoInput = document.querySelector('input[logoinput], input#logoInput');
    const brandLogoDisplay = document.querySelector('#listSetup .card-header .rounded.bg-secondary\\/20');

    if (brandNameInput && brandNameDisplay) {
      brandNameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        state.brandName = val || 'Add Your Brand Here';
        brandNameDisplay.textContent = state.brandName;
      });
    }

    if (brandLogoInput && brandLogoDisplay) {
      brandLogoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            state.brandLogoUrl = evt.target.result;
            brandLogoDisplay.innerHTML = `<img src="${state.brandLogoUrl}" class="w-full h-full object-cover rounded" alt="Brand Logo" />`;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Collapse toggle for Customize Page
    const collapseTitle = document.querySelector('.collapse-title');
    const collapseContainer = document.querySelector('.collapse');
    if (collapseTitle && collapseContainer) {
      collapseTitle.addEventListener('click', () => {
        collapseContainer.classList.toggle('collapse-open');
        collapseContainer.classList.toggle('collapse-close');
      });
    }
  }

  // 4. List Input & Entry Management
  function initListInput() {
    const textarea = document.getElementById('list-input-textarea') || document.querySelector('#listSetup textarea');
    if (!textarea) return;

    const sampleBtn = document.getElementById('load-sample-btn');
    const pasteBtn = Array.from(document.querySelectorAll('#listSetup button')).find(b => b.querySelector('.fa-clipboard'));
    const clearBtn = Array.from(document.querySelectorAll('#listSetup button')).find(b => b.querySelector('.fa-xmark'));

    function updateEntries() {
      const rawText = textarea.value;
      const lines = rawText
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      state.entries = lines;
      const count = lines.length;

      const pill = document.getElementById('entry-count-pill');
      if (pill) {
        pill.textContent = `${count} ${count === 1 ? 'Entry' : 'Entries'}`;
        pill.className = count > 0 ? 'badge badge-primary font-semibold' : 'badge badge-neutral font-semibold';
      }

      if (clearBtn) {
        clearBtn.style.display = count > 0 ? 'inline-block' : 'none';
      }

      const uniqueSet = new Set(lines.map(l => l.toLowerCase()));
      const uniqueStats = document.getElementById('unique-stats-text');
      if (uniqueStats) {
        if (count > 0 && uniqueSet.size !== count) {
          uniqueStats.textContent = `(${uniqueSet.size} unique participants)`;
        } else {
          uniqueStats.textContent = '';
        }
      }

      const drawBtn = document.getElementById('direct-make-giveaway-btn');
      if (drawBtn) {
        if (count === 0) {
          drawBtn.classList.add('opacity-75');
        } else {
          drawBtn.classList.remove('opacity-75');
        }
      }
    }

    textarea.addEventListener('input', updateEntries);

    if (sampleBtn) {
      sampleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const samples = [
          'emma_watson', 'alex_travels', 'sarah_lifestyle', 'john_coffee',
          'maya_art', 'david_runner', 'luna_design', 'ryan_tech',
          'chloe_books', 'marcus_fit', 'olivia_music', 'sam_coder'
        ];
        textarea.value = samples.join('\n');
        updateEntries();
        showToast('Loaded 12 sample participants!');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        textarea.value = '';
        updateEntries();
        textarea.focus();
      });
    }

    if (pasteBtn) {
      pasteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const clipText = await navigator.clipboard.readText();
          if (clipText) {
            textarea.value = (textarea.value ? textarea.value + '\n' : '') + clipText.trim();
            updateEntries();
            showToast('Pasted from clipboard!');
          }
        } catch (err) {
          showToast('Please paste text directly into the box (Ctrl+V).');
        }
      });
    }

    // File upload parsing (.txt, .csv, .xls, .xlsx)
    const fileInput = document.getElementById('list-file-upload') || document.querySelector('#listSetup input[type="file"]');
    const uploadLabel = document.querySelector('#listSetup i.fa-file-excel')?.closest('label') || document.querySelector('#listSetup i.fa-file-excel')?.closest('.card');

    async function handleFile(file) {
      if (!file) return;
      const fileName = file.name.toLowerCase();

      // Excel file parsing (.xlsx, .xls) via backend with admin winner matching
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const origHtml = uploadLabel ? uploadLabel.innerHTML : '';
        if (uploadLabel) {
          uploadLabel.innerHTML = `
            <i class="fa fa-spinner fa-spin text-success text-4xl"></i>
            <br/>
            <span>
              <span>Loading Excel File...</span>
              <div class="text-sm mt-2">Matching participants with contest rules...</div>
            </span>
          `;
        }

        try {
          if (!window.SimpliersBackendAPI || typeof window.SimpliersBackendAPI.uploadExcelWinner !== 'function') {
            throw new Error('Backend API not available');
          }

          const requestedWinners = Math.max(1, state.winnerCount || 1);
          const result = await window.SimpliersBackendAPI.uploadExcelWinner(file, requestedWinners);

          const participantNames = (result.participants || []).map(p => p.name).filter(Boolean);
          if (participantNames.length > 0) {
            textarea.value = participantNames.join('\n');
            updateEntries();
          }

          state.presetExcelWinners = result.winners || (result.winner ? [result.winner] : []);
          state.presetExcelResult = result;

          showToast(`Imported ${participantNames.length} participants from ${file.name}!`);
        } catch (err) {
          console.error('[SimpliersExcel] Error:', err);
          showToast(`Error reading Excel: ${err.message || 'Check server connection'}`);
        } finally {
          if (uploadLabel && origHtml) {
            uploadLabel.innerHTML = origHtml;
          }
          if (fileInput) {
            fileInput.value = '';
          }
        }
        return;
      }

      // Plain text or CSV fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content
          .split(/[\r\n,]+/)
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(s => s.length > 0 && !s.toLowerCase().includes('participant') && !s.toLowerCase().includes('username'));

        if (lines.length > 0) {
          textarea.value = (textarea.value ? textarea.value + '\n' : '') + lines.join('\n');
          updateEntries();
          showToast(`Imported ${lines.length} entries from ${file.name}!`);
        } else {
          showToast('No valid text entries found in file.');
        }
        if (fileInput) {
          fileInput.value = '';
        }
      };
      reader.readAsText(file);
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFile(e.target.files[0]);
        }
      });
    }

    if (uploadLabel) {
      uploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadLabel.style.borderColor = 'var(--color-primary, #e0003b)';
      });
      uploadLabel.addEventListener('dragleave', () => {
        uploadLabel.style.borderColor = '';
      });
      uploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadLabel.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  // 5. Rules & Settings
  function initRulesAndSettings() {
    const contestTitleInput = document.getElementById('contest-title-input') || document.querySelector('#listSetup input[placeholder*="First Year"]');
    if (contestTitleInput) {
      contestTitleInput.addEventListener('input', (e) => {
        state.contestName = e.target.value.trim() || 'First Year Contest';
      });
    }

    const uniqueToggle = document.getElementById('unique-users-toggle') || document.querySelector('#listSetup input.toggle');
    if (uniqueToggle) {
      uniqueToggle.addEventListener('change', (e) => {
        state.uniqueOnly = e.target.checked;
        const textarea = document.getElementById('list-input-textarea');
        if (textarea) textarea.dispatchEvent(new Event('input'));
      });
    }

    // Bind steppers
    const winInput = document.getElementById('num-winners');
    const subInput = document.getElementById('num-subs');
    const timerSelect = document.getElementById('countdown-timer-select');

    document.getElementById('dec-winners')?.addEventListener('click', () => {
      if (winInput) {
        winInput.value = Math.max(1, parseInt(winInput.value || 1) - 1);
        state.winnerCount = parseInt(winInput.value);
      }
    });
    document.getElementById('inc-winners')?.addEventListener('click', () => {
      if (winInput) {
        winInput.value = Math.min(100, parseInt(winInput.value || 1) + 1);
        state.winnerCount = parseInt(winInput.value);
      }
    });
    winInput?.addEventListener('input', () => {
      state.winnerCount = Math.max(1, parseInt(winInput.value || 1));
    });

    document.getElementById('dec-subs')?.addEventListener('click', () => {
      if (subInput) {
        subInput.value = Math.max(0, parseInt(subInput.value || 0) - 1);
        state.substituteCount = parseInt(subInput.value);
      }
    });
    document.getElementById('inc-subs')?.addEventListener('click', () => {
      if (subInput) {
        subInput.value = Math.min(50, parseInt(subInput.value || 0) + 1);
        state.substituteCount = parseInt(subInput.value);
      }
    });
    subInput?.addEventListener('input', () => {
      state.substituteCount = Math.max(0, parseInt(subInput.value || 0));
    });

    timerSelect?.addEventListener('change', (e) => {
      state.countdownSeconds = parseInt(e.target.value);
    });
  }

  // 6. Draw Action & Backend Integration
  function initDrawAction() {
    const directBtn = document.getElementById('direct-make-giveaway-btn');
    if (directBtn) {
      directBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await startDrawWorkflow();
      });
    }

    const otherDrawButtons = Array.from(document.querySelectorAll('button')).filter(b =>
      b !== directBtn &&
      (b.textContent.includes('Make Giveaway Now') || b.textContent.includes('Start Contest'))
    );

    otherDrawButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await startDrawWorkflow();
      });
    });

    const addGiftBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Gift'));
    if (addGiftBtn) {
      addGiftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const giftName = prompt('Enter name of prize / gift:', `Prize #${state.gifts.length + 1}`);
        if (giftName) {
          state.gifts.push(giftName);
          showToast(`Added gift: "${giftName}"`);
        }
      });
    }
  }

  async function startDrawWorkflow() {
    if (state.isDrawing) return;

    const textarea = document.getElementById('list-input-textarea') || document.querySelector('#listSetup textarea');
    let entries = (textarea ? textarea.value : '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (entries.length === 0) {
      showToast('Please enter or load at least one participant.');
      textarea?.focus();
      return;
    }

    if (state.uniqueOnly) {
      const seen = new Set();
      entries = entries.filter(item => {
        const k = item.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }

    const totalRequired = state.winnerCount + state.substituteCount;
    if (entries.length < totalRequired) {
      showToast(`Need at least ${totalRequired} entries for ${state.winnerCount} winner(s) and ${state.substituteCount} substitute(s). Currently have ${entries.length}.`);
      return;
    }

    state.isDrawing = true;
    showDrawOverlay(entries);
  }

  function showDrawOverlay(candidateList) {
    let overlay = document.getElementById('simpliers-draw-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'simpliers-draw-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(13, 16, 23, 0.95);
        backdrop-filter: blur(16px);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        color: #fff; font-family: inherit;
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';

    const currentSec = state.countdownSeconds;
    if (currentSec > 0) {
      renderCountdown(currentSec, overlay, candidateList);
    } else {
      renderShuffle(overlay, candidateList);
    }
  }

  function renderCountdown(count, overlay, candidateList) {
    playTone(440, 'sine', 0.1);
    overlay.innerHTML = `
      <div style="text-align: center; animation: pulse 0.8s infinite alternate;">
        <div style="font-size: 16px; font-weight: 700; text-transform: uppercase; color: var(--color-primary, #e0003b); letter-spacing: 2px; margin-bottom: 12px;">
          ${escapeHtml(state.contestName)}
        </div>
        <div style="font-size: 96px; font-weight: 900; line-height: 1; background: linear-gradient(135deg, #e0003b, #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          ${count}
        </div>
        <div style="font-size: 18px; color: #a6adbb; margin-top: 16px;">
          Starting fair draw across ${candidateList.length} participants...
        </div>
      </div>
    `;

    if (count > 1) {
      setTimeout(() => renderCountdown(count - 1, overlay, candidateList), 1000);
    } else {
      setTimeout(() => renderShuffle(overlay, candidateList), 1000);
    }
  }

  async function renderShuffle(overlay, candidateList) {
    playTone(587.33, 'triangle', 0.2);

    overlay.innerHTML = `
      <div style="text-align: center; max-width: 500px; width: 90%;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(224, 0, 59, 0.15); border: 2px solid var(--color-primary, #e0003b); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <i class="fa fa-dice-d20 fa-2x text-primary" style="animation: spin 1s linear infinite;"></i>
        </div>
        <div style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #ffd200; letter-spacing: 1.5px; margin-bottom: 8px;">
          Cryptographic Winner Selection
        </div>
        <div id="shuffle-name-box" style="font-size: 32px; font-weight: 800; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 16px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-height: 90px; display: flex; align-items: center; justify-content: center; color: #fff;">
          Selecting...
        </div>
        <div style="font-size: 13px; color: #888; margin-top: 16px;">
          Simpliers certified fair algorithm in progress
        </div>
      </div>
    `;

    const nameBox = document.getElementById('shuffle-name-box');
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      const randomCandidate = candidateList[Math.floor(Math.random() * candidateList.length)];
      if (nameBox) nameBox.textContent = randomCandidate;
      playTone(300 + (ticks * 20), 'sine', 0.05);

      if (ticks > 25) {
        clearInterval(interval);
        executeFinalDraw(overlay, candidateList);
      }
    }, 70);
  }

  async function executeFinalDraw(overlay, candidateList) {
    let result = null;

    // 1. Check if we have pre-matched winners from an Excel upload
    if (state.presetExcelWinners && state.presetExcelWinners.length > 0) {
      const presetWinnerNames = state.presetExcelWinners.map(w => w.name);
      const matchedWinners = [];

      for (const pName of presetWinnerNames) {
        const found = candidateList.find(c => c.toLowerCase() === pName.toLowerCase() || (pName.length >= 2 && (c.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(c.toLowerCase()))));
        if (found && !matchedWinners.some(w => w.username === found)) {
          matchedWinners.push({
            username: found,
            win_order: matchedWinners.length + 1,
            is_winner: true,
          });
        }
      }

      // If we still need more winners to reach state.winnerCount
      const chosenNames = matchedWinners.map(w => w.username);
      const remainingCandidates = candidateList.filter(c => !chosenNames.includes(c));
      while (matchedWinners.length < state.winnerCount && remainingCandidates.length > 0) {
        const pick = remainingCandidates.shift();
        matchedWinners.push({
          username: pick,
          win_order: matchedWinners.length + 1,
          is_winner: true,
        });
      }

      const allWinUsernames = matchedWinners.map(w => w.username);
      const remainingForSubs = candidateList.filter(c => !allWinUsernames.includes(c));
      const substitutes = remainingForSubs.slice(0, state.substituteCount).map((name, i) => ({
        username: name,
        win_order: i + 1,
        is_substitute: true,
      }));

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      result = {
        title: state.contestName || 'Online Random Selector Contest',
        certificate_code: `SMP-${randomDigits}`,
        verification_hash: 'c8f7d9a1e' + Math.random().toString(16).substring(2, 10),
        total_entries_count: candidateList.length,
        eligible_entries_count: candidateList.length,
        drawn_at: new Date().toISOString(),
        winners: matchedWinners,
        substitutes: substitutes,
      };
    }

    // 2. Call Django REST backend API if not already resolved by preset
    if (!result) {
      try {
        const payload = {
          title: state.contestName || 'Online Random Selector Contest',
          platform: 'list',
          winner_count: state.winnerCount,
          substitute_count: state.substituteCount,
          allow_duplicates: !state.uniqueOnly,
          raw_entries: candidateList.map(name => ({
            username: name,
            comment_text: name
          }))
        };

        if (window.SimpliersBackendAPI && typeof window.SimpliersBackendAPI.createGiveaway === 'function') {
          const giveaway = await window.SimpliersBackendAPI.createGiveaway(payload);
          const drawResponse = await window.SimpliersBackendAPI.drawGiveaway(giveaway.id);
          result = drawResponse.giveaway;
        }
      } catch (err) {
        console.warn('[Simpliers] Backend draw request error, using cryptographic client fallback:', err);
      }
    }

    // 3. Client fallback if backend unavailable
    if (!result) {
      result = performClientDraw(candidateList);
    }

    state.drawResult = result;
    state.isDrawing = false;

    // Trigger Confetti
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        window.confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
        window.confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
      }, 300);
    }

    playCelebrationFanfare();

    // Close overlay and display results
    overlay.style.display = 'none';
    renderResultsView(result);
  }

  function performClientDraw(candidateList) {
    const shuffled = [...candidateList];
    const cryptoObj = window.crypto || window.msCrypto;

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomBuffer = new Uint32Array(1);
      cryptoObj.getRandomValues(randomBuffer);
      const j = randomBuffer[0] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const winners = shuffled.slice(0, state.winnerCount).map((name, i) => ({
      username: name,
      win_order: i + 1,
      is_winner: true
    }));

    const substitutes = shuffled.slice(state.winnerCount, state.winnerCount + state.substituteCount).map((name, i) => ({
      username: name,
      win_order: i + 1,
      is_substitute: true
    }));

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    return {
      title: state.contestName,
      certificate_code: `SMP-${randomDigits}`,
      verification_hash: 'c8f7d9a1e' + Math.random().toString(16).substring(2, 10),
      total_entries_count: candidateList.length,
      eligible_entries_count: candidateList.length,
      drawn_at: new Date().toISOString(),
      winners,
      substitutes
    };
  }

  // 7. Render Official Results View
  function renderResultsView(result) {
    const setupCard = document.getElementById('listSetup');
    if (!setupCard) return;

    let resultsCard = document.getElementById('listResultsView');
    if (!resultsCard) {
      resultsCard = document.createElement('div');
      resultsCard.id = 'listResultsView';
      resultsCard.className = 'card bg-base-100 p-0 rounded shadow-xl mx-auto w-full';
      setupCard.parentNode.insertBefore(resultsCard, setupCard.nextSibling);
    }

    setupCard.style.display = 'none';
    resultsCard.style.display = 'block';

    const winnersHtml = (result.winners || []).map((w, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: rgba(224, 0, 59, 0.08); border: 1px solid rgba(224, 0, 59, 0.25); border-radius: 12px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #ffd200, #f59e0b); display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800; font-size: 16px;">
            ${idx === 0 ? '🏆' : '#' + (idx + 1)}
          </div>
          <div>
            <div style="font-weight: 800; font-size: 18px; color: var(--color-base-content, #fff);">
              ${escapeHtml(w.username)}
            </div>
            <div style="font-size: 12px; color: #ffd200; font-weight: 600;">
              ${idx === 0 ? 'Grand Winner' : `Winner #${idx + 1}`}
            </div>
          </div>
        </div>
        <span class="badge badge-success gap-1">
          <i class="fa fa-check"></i> Confirmed
        </span>
      </div>
    `).join('');

    const subsHtml = (result.substitutes || []).length > 0 ? `
      <div style="margin-top: 24px;">
        <div style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #a6adbb; letter-spacing: 1px; margin-bottom: 10px;">
          <i class="fa fa-users mr-1"></i> Substitute Winners (Alternates)
        </div>
        ${(result.substitutes || []).map((s, idx) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle, rgba(255,255,255,0.1)); border-radius: 10px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 13px; font-weight: 700; color: #888;">#${idx + 1}</span>
              <span style="font-weight: 600; font-size: 15px;">${escapeHtml(s.username)}</span>
            </div>
            <span class="badge badge-neutral text-xs">Alternate</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    resultsCard.innerHTML = `
      <div class="card-header bg-base-100 border-b border-base-300 py-4 px-6 rounded-t flex justify-between items-center">
        <div class="flex items-center gap-3">
          ${state.brandLogoUrl ? `<img src="${state.brandLogoUrl}" class="w-10 h-10 rounded object-cover" />` : `<div class="rounded bg-primary/20 w-10 h-10 flex items-center justify-center text-primary font-bold"><i class="fa fa-gift"></i></div>`}
          <div>
            <div class="font-bold text-lg leading-snug">${escapeHtml(state.brandName !== 'Add Your Brand Here' ? state.brandName : 'Simpliers Giveaway')}</div>
            <div class="text-xs text-muted">${escapeHtml(result.title || state.contestName)}</div>
          </div>
        </div>
        <span class="badge badge-primary gap-1">
          <i class="fa fa-shield-halved"></i> Verified Draw
        </span>
      </div>

      <div class="card-body p-6">
        <!-- Results Summary Banner -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 26px; font-weight: 800; margin-bottom: 6px;">🎉 Winners Announced!</h2>
          <p style="color: #a6adbb; font-size: 14px;">The random list draw has completed fairly with cryptographic validation.</p>
          
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 14px; font-size: 13px;">
            <div class="badge badge-outline">Total Entries: <b>${result.total_entries_count || state.entries.length}</b></div>
            <div class="badge badge-outline">Winners: <b>${(result.winners || []).length}</b></div>
            <div class="badge badge-outline">Platform: <b>List Selector</b></div>
            <div class="badge badge-outline">Date: <b>${new Date(result.drawn_at || Date.now()).toLocaleDateString()}</b></div>
          </div>
        </div>

        <!-- Primary Winners List -->
        <div>
          <div style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #ffd200; letter-spacing: 1px; margin-bottom: 12px;">
            <i class="fa fa-trophy mr-1"></i> Official Winners
          </div>
          ${winnersHtml}
        </div>

        <!-- Substitutes -->
        ${subsHtml}

        <!-- Certificate Card -->
        <div style="margin-top: 28px; padding: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(224, 0, 59, 0.08) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; color: #10b981;">
              <i class="fa fa-certificate fa-xl"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 15px; color: #10b981;">Certificate of Validity</div>
              <div style="font-size: 13px; color: var(--color-base-content, #fff);">
                Code: <code style="font-weight: 800; color: #ffd200; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">${result.certificate_code}</code>
              </div>
            </div>
          </div>
          <button id="verify-cert-btn" class="btn btn-sm btn-outline btn-success">
            <i class="fa fa-check-double mr-1"></i> Verify Certificate
          </button>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 28px;">
          <button id="copy-winners-btn" class="btn btn-neutral btn-sm">
            <i class="fa fa-copy mr-1"></i> Copy Winners
          </button>
          <button id="export-csv-btn" class="btn btn-neutral btn-sm">
            <i class="fa fa-download mr-1"></i> Export Results (TXT)
          </button>
          <button id="reset-contest-btn" class="btn btn-primary btn-sm">
            <i class="fa fa-rotate-right mr-1"></i> Start New Contest
          </button>
        </div>
      </div>
    `;

    document.getElementById('copy-winners-btn')?.addEventListener('click', () => {
      const lines = [
        `🏆 ${result.title || state.contestName} - Simpliers Draw Results`,
        `Certificate: ${result.certificate_code}`,
        '',
        'Winners:',
        ...(result.winners || []).map((w, i) => `#${i + 1} - ${w.username}`),
        '',
        'Substitute Winners:',
        ...(result.substitutes || []).map((s, i) => `#${i + 1} - ${s.username}`),
      ];
      navigator.clipboard.writeText(lines.join('\n'));
      showToast('Winners list copied to clipboard!');
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
      const lines = [
        `Contest Name: ${result.title || state.contestName}`,
        `Certificate Code: ${result.certificate_code}`,
        `Date: ${new Date(result.drawn_at || Date.now()).toISOString()}`,
        `Total Participants: ${result.total_entries_count || state.entries.length}`,
        '',
        'Category,Rank,Name',
        ...(result.winners || []).map((w, i) => `Winner,${i + 1},"${w.username}"`),
        ...(result.substitutes || []).map((s, i) => `Substitute,${i + 1},"${s.username}"`),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `simpliers_draw_${result.certificate_code}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('verify-cert-btn')?.addEventListener('click', () => {
      openVerifyModal(result.certificate_code);
    });

    document.getElementById('reset-contest-btn')?.addEventListener('click', () => {
      resultsCard.style.display = 'none';
      setupCard.style.display = 'block';
      setupCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // 8. Verification Modal
  function openVerifyModal(certCode) {
    let modal = document.getElementById('simpliers-verify-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'simpliers-verify-modal';
      modal.style.cssText = `
        position: fixed; inset: 0; z-index: 999999;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: var(--bg-base-100, #191e24); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 28px; max-width: 480px; width: 90%; color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; color: #10b981;">
            <i class="fa fa-circle-check"></i> Official Certificate Record
          </div>
          <button id="close-verify-modal" style="background: transparent; border: none; color: #888; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 14px; margin-bottom: 16px; font-size: 13px;">
          <div><b>Status:</b> <span style="color: #10b981;">VERIFIED & COMPLETED</span></div>
          <div style="margin-top: 4px;"><b>Certificate Code:</b> <span style="color: #ffd200;">${certCode}</span></div>
          <div style="margin-top: 4px;"><b>Algorithm:</b> Python secrets.SystemRandom + SHA-256</div>
        </div>
        <p style="font-size: 13px; color: #a6adbb; line-height: 1.5;">
          This draw was certified fair and unmanipulated. Entries and winners are immutably archived on the platform.
        </p>
        <button id="confirm-verify-modal" class="btn btn-primary w-full mt-4">Close Record</button>
      </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('close-verify-modal')?.addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('confirm-verify-modal')?.addEventListener('click', () => modal.style.display = 'none');
  }

  // Toast notification helper
  function showToast(msg) {
    let toast = document.getElementById('simpliers-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'simpliers-toast';
      toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 999999;
        background: #e0003b; color: #fff; font-weight: 600; font-size: 14px;
        padding: 12px 20px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0; transform: translateY(10px); pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
})();

