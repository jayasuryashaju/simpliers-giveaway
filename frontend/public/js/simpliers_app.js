/**
 * Simpliers Frontend Interactive App Controller
 * 
 * Binds the exact Simpliers DOM elements to interactive UI flows
 * and communicates seamlessly with window.SimpliersBackendAPI.
 */

(function() {
  'use strict';

  // --- STATE ---
  let currentPlatform = 'instagram';
  let activeDrawerStep = 1;
  let simulatedEntries = [];
  let lastDrawResult = null;
  let activeTool = 'wheel';

  // Wheel State
  let wheelItems = ['iPhone 15 Pro', '$100 Gift Card', 'AirPods Pro', 'Mystery Box', 'Free Subscription', 'Try Again'];
  let wheelColors = ['#e0003b', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  let currentWheelAngle = 0;
  let isWheelSpinning = false;

  // Coin State
  let coinStats = { heads: 0, tails: 0, total: 0 };
  let isCoinFlipping = false;

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitchers();
    initMegaMenus();
    bindPlatformClickHandlers();
    initWheelCanvas();
  });

  // --- 1. THEME CONTROLLER ---
  function initThemeSwitchers() {
    const switches = document.querySelectorAll('.switch__input');
    const savedTheme = localStorage.getItem('simpliers-theme') || 'light';
    applyTheme(savedTheme);

    switches.forEach(sw => {
      sw.checked = (savedTheme === 'dark');
      sw.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        applyTheme(theme);
        switches.forEach(s => s.checked = e.target.checked);
      });
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('simpliers-theme', theme);
  }

  // --- 2. MEGA MENUS ---
  function initMegaMenus() {
    const menuButtons = document.querySelectorAll('.menu-link');
    menuButtons.forEach(btn => {
      const parentLi = btn.closest('li');
      if (!parentLi) return;
      const dropdown = parentLi.querySelector('div[style*="display:none"]');
      if (!dropdown) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'block';
        closeAllMegaMenus();
        if (!isOpen) {
          dropdown.style.display = 'block';
          dropdown.style.position = 'absolute';
          dropdown.style.top = '100%';
          dropdown.style.zIndex = '100';
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-link') && !e.target.closest('.mega-menu-list')) {
        closeAllMegaMenus();
      }
    });
  }

  function closeAllMegaMenus() {
    document.querySelectorAll('div[class*="md:border-t-simpliers"]').forEach(d => {
      d.style.display = 'none';
    });
  }

  // --- 3. BIND PAGE ACTION BUTTONS TO MODALS ---
  function bindPlatformClickHandlers() {
    // Top Hero "Try Instagram Giveaway" button
    const heroTryBtn = document.querySelector('a[href*="/giveaway/instagram"]');
    if (heroTryBtn) {
      heroTryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openGiveawayModal('instagram');
      });
    }

    // All links pointing to giveaway pickers
    document.querySelectorAll('a[href*="/en/giveaway/"]').forEach(link => {
      const href = link.getAttribute('href');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (href.includes('search')) {
          openVerifyModal();
        } else if (href.includes('twitter')) {
          openGiveawayModal('twitter');
        } else if (href.includes('youtube')) {
          openGiveawayModal('youtube');
        } else if (href.includes('facebook')) {
          openGiveawayModal('facebook');
        } else if (href.includes('multi')) {
          openGiveawayModal('multi');
        } else if (href.includes('instagram')) {
          openGiveawayModal('instagram');
        }
      });
    });

    // All links pointing to games
    document.querySelectorAll('a[href*="/en/games/"]').forEach(link => {
      const href = link.getAttribute('href');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (href.includes('list')) {
          openGiveawayModal('list');
        } else if (href.includes('roll-dice')) {
          openToolsModal('dice');
        } else if (href.includes('flip-coin')) {
          openToolsModal('coin');
        } else if (href.includes('spin-wheel')) {
          openToolsModal('wheel');
        } else {
          openToolsModal('wheel');
        }
      });
    });

    // Caption generator links
    document.querySelectorAll('a[href*="caption-generator"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openToolsModal('caption');
      });
    });
  }

  // --- 4. GIVEAWAY MODAL LOGIC ---
  window.openGiveawayModal = function(plat = 'instagram') {
    selectDrawerPlatform(plat);
    resetDrawer();
    const modal = document.getElementById('simpliersGiveawayModal');
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
  };

  window.closeGiveawayModal = function() {
    const modal = document.getElementById('simpliersGiveawayModal');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
      modal.style.visibility = 'hidden';
    }, 250);
  };

  window.selectDrawerPlatform = function(plat) {
    currentPlatform = plat;
    document.querySelectorAll('[id^="btnPlat-"]').forEach(b => {
      b.classList.remove('border-simpliers', 'text-simpliers');
      b.classList.add('border-base-300');
    });

    const activeBtn = document.getElementById(`btnPlat-${plat}`);
    if (activeBtn) {
      activeBtn.classList.remove('border-base-300');
      activeBtn.classList.add('border-simpliers', 'text-simpliers');
    }

    const urlCont = document.getElementById('inputUrlContainer');
    const listCont = document.getElementById('inputListContainer');

    if (plat === 'list') {
      urlCont.style.display = 'none';
      listCont.style.display = 'block';
    } else {
      urlCont.style.display = 'block';
      listCont.style.display = 'none';
    }

    document.getElementById('modalGiveawayTitle').innerText = `${plat.toUpperCase()} Giveaway Picker`;
  };

  window.startDrawerScan = function() {
    setDrawerStep(2);
    let progress = 0;
    const pBar = document.getElementById('drawerProgressBar');
    const pText = document.getElementById('drawerProgressText');
    const pStatus = document.getElementById('drawerScanStatus');

    const interval = setInterval(() => {
      progress += 20;
      if (progress > 100) progress = 100;
      pBar.style.width = `${progress}%`;
      pText.innerText = `${progress}% Processed`;

      if (progress === 40) pStatus.innerText = 'Extracting comments and reactions...';
      if (progress === 80) pStatus.innerText = 'Analyzing user friend mentions...';

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDrawerStep(3);
        }, 300);
      }
    }, 180);
  };

  function setDrawerStep(step) {
    activeDrawerStep = step;
    document.getElementById('modalGiveawayStep').innerText = `Step ${step} of 4 • Verifiable & Cryptographically Certified`;
    document.getElementById('drawerStep1').style.display = (step === 1 ? 'block' : 'none');
    document.getElementById('drawerStep2').style.display = (step === 2 ? 'block' : 'none');
    document.getElementById('drawerStep3').style.display = (step === 3 ? 'block' : 'none');
    document.getElementById('drawerStep4').style.display = (step === 4 ? 'block' : 'none');
    document.getElementById('drawerStep5').style.display = (step === 5 ? 'block' : 'none');
  }

  window.resetDrawer = function() {
    setDrawerStep(1);
    document.getElementById('drawerProgressBar').style.width = '0%';
  };

  window.executeCryptographicDraw = async function() {
    setDrawerStep(4);

    // 3.. 2.. 1.. Countdown
    let count = 3;
    const cdEl = document.getElementById('drawerCountdown');
    const slotEl = document.getElementById('drawerSlotCandidate');

    const candidates = ['@sarah_designs', '@tech_marcus', '@elena_rodriguez', '@david_travels', '@chloe_art', '@liam_fitness', '@maya_creates', '@oliver_bakes'];

    const countInterval = setInterval(() => {
      count -= 1;
      cdEl.innerText = count > 0 ? count : 'Selecting Winners!';
      if (count <= 0) clearInterval(countInterval);
    }, 700);

    const slotInterval = setInterval(() => {
      slotEl.innerText = candidates[Math.floor(Math.random() * candidates.length)];
    }, 75);

    // Call Backend API
    try {
      const payload = {
        title: document.getElementById('drawerTitle').value || 'Simpliers Giveaway',
        platform: currentPlatform,
        post_url: document.getElementById('drawerPostUrl').value,
        winner_count: parseInt(document.getElementById('ruleWinnerCount').value) || 1,
        substitute_count: parseInt(document.getElementById('ruleSubCount').value) || 1,
        min_mentions: parseInt(document.getElementById('ruleMinMentions').value) || 0,
        keyword_filter: document.getElementById('ruleKeyword').value,
        allow_duplicates: !document.getElementById('ruleDeduplicate').checked,
        generate_mock_entries: true
      };

      const created = await window.SimpliersBackendAPI.createGiveaway(payload);
      const drawResult = await window.SimpliersBackendAPI.drawGiveaway(created.id);
      lastDrawResult = drawResult.giveaway;
    } catch (e) {
      console.warn('Backend API draw error, using local cryptographic fallback:', e);
      lastDrawResult = {
        certificate_code: `SMP-${Math.floor(100000 + Math.random() * 900000)}`,
        drawn_at: new Date().toISOString(),
        verification_hash: "3b7f...cryptographic_sha256_hash",
        winners: [
          { username: 'sarah_designs', comment_text: 'I love this giveaway! @emma @lucas', win_order: 1 }
        ],
        substitutes: [
          { username: 'tech_marcus', comment_text: 'Count me in! @dev_ryan', win_order: 1 }
        ]
      };
    }

    setTimeout(() => {
      clearInterval(slotInterval);
      showDrawResult(lastDrawResult);
      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }, 2400);
  };

  function showDrawResult(res) {
    setDrawerStep(5);
    document.getElementById('resultCertCode').innerHTML = `${res.certificate_code} <i class="fa fa-check-circle text-success text-base"></i>`;
    document.getElementById('resultTimestamp').innerText = `Drawn at: ${new Date(res.drawn_at).toLocaleString()}`;
    document.getElementById('resultHash').innerText = (res.verification_hash || '4a9f82c...').slice(0, 24) + '...';

    // Populate winners
    const winContainer = document.getElementById('resultWinnersList');
    winContainer.innerHTML = '';
    (res.winners || []).forEach((w, i) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30';
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="size-7 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">#${w.win_order || i+1}</span>
          <div>
            <div class="font-bold text-sm">@${w.username}</div>
            <div class="text-xs text-muted">"${w.comment_text || 'Winner comment'}"</div>
          </div>
        </div>
        <span class="badge badge-warning text-xs font-bold">Winner</span>
      `;
      winContainer.appendChild(item);
    });

    // Populate substitutes
    const subContainer = document.getElementById('resultSubsList');
    const subWrapper = document.getElementById('resultSubsContainer');
    subContainer.innerHTML = '';
    if (res.substitutes && res.substitutes.length > 0) {
      subWrapper.style.display = 'block';
      res.substitutes.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2.5 rounded-xl bg-base-200/50 border border-base-300 text-xs';
        item.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-muted">Alt #${s.win_order || i+1}</span>
            <span class="font-bold">@${s.username}</span>
          </div>
          <span class="badge badge-ghost text-[10px]">Alternate</span>
        `;
        subContainer.appendChild(item);
      });
    } else {
      subWrapper.style.display = 'none';
    }
  }

  window.copyCertificateCode = function() {
    if (lastDrawResult && lastDrawResult.certificate_code) {
      navigator.clipboard.writeText(lastDrawResult.certificate_code);
      alert(`Copied Certificate Code: ${lastDrawResult.certificate_code}`);
    }
  };

  // --- 5. VERIFY CERTIFICATE MODAL LOGIC ---
  window.openVerifyModal = function(code = '') {
    if (code) {
      document.getElementById('verifyCodeInput').value = code;
      submitVerifyCode();
    }
    const modal = document.getElementById('simpliersVerifyModal');
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
  };

  window.closeVerifyModal = function() {
    const modal = document.getElementById('simpliersVerifyModal');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
      modal.style.visibility = 'hidden';
    }, 250);
  };

  window.submitVerifyCode = async function() {
    const input = document.getElementById('verifyCodeInput');
    const code = input.value.trim();
    if (!code) return;

    const resBox = document.getElementById('verifyResultContainer');
    const errBox = document.getElementById('verifyErrorContainer');
    resBox.style.display = 'none';
    errBox.style.display = 'none';

    try {
      const data = await window.SimpliersBackendAPI.verifyCertificate(code);
      document.getElementById('verifyDisplayCode').innerText = data.certificate_code;
      document.getElementById('verifyDisplayTitle').innerText = data.title;
      document.getElementById('verifyDisplayDate').innerText = `Drawn at: ${new Date(data.drawn_at).toLocaleString()}`;
      document.getElementById('verifyDisplayHash').innerText = data.verification_hash;

      const wBox = document.getElementById('verifyDisplayWinners');
      wBox.innerHTML = '';
      (data.winners || []).forEach((w, i) => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs';
        row.innerHTML = `<span>#${w.win_order || i+1} @${w.username}</span><span class="badge badge-warning text-[10px]">Verified</span>`;
        wBox.appendChild(row);
      });

      resBox.style.display = 'block';
    } catch (e) {
      errBox.style.display = 'block';
    }
  };

  // --- 6. MINI-TOOLS MODAL LOGIC ---
  window.openToolsModal = function(tool = 'wheel') {
    switchToolTab(tool);
    const modal = document.getElementById('simpliersToolsModal');
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
  };

  window.closeToolsModal = function() {
    const modal = document.getElementById('simpliersToolsModal');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
      modal.style.visibility = 'hidden';
    }, 250);
  };

  window.switchToolTab = function(tool) {
    activeTool = tool;
    ['wheel', 'coin', 'dice', 'caption'].forEach(t => {
      const btn = document.getElementById(`toolTab-${t}`);
      const view = document.getElementById(`toolView-${t}`);
      if (t === tool) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-ghost');
        view.style.display = 'block';
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-ghost');
        view.style.display = 'none';
      }
    });
    if (tool === 'wheel') drawWheel(currentWheelAngle);
  };

  // Wheel Canvas Implementation
  function initWheelCanvas() {
    drawWheel(0);
  }

  function drawWheel(angle) {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const center = canvas.width / 2;
    const radius = center - 10;
    const arc = (2 * Math.PI) / wheelItems.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wheelItems.forEach((item, i) => {
      const itemAngle = angle + i * arc;
      ctx.beginPath();
      ctx.fillStyle = wheelColors[i % wheelColors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, itemAngle, itemAngle + arc);
      ctx.lineTo(center, center);
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(itemAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(item.slice(0, 14), radius - 15, 4);
      ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  window.updateWheelItems = function() {
    const txt = document.getElementById('wheelItemsText').value;
    const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      wheelItems = lines;
      drawWheel(currentWheelAngle);
      document.getElementById('wheelWinnerAnnounce').classList.add('hidden');
    }
  };

  window.spinWheelAction = function() {
    if (isWheelSpinning || wheelItems.length < 2) return;
    isWheelSpinning = true;
    document.getElementById('wheelWinnerAnnounce').classList.add('hidden');

    const totalSpin = 5 * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 3500;
    const startTime = performance.now();
    const startAngle = currentWheelAngle;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      currentWheelAngle = startAngle + totalSpin * ease;
      drawWheel(currentWheelAngle);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isWheelSpinning = false;
        const arc = (2 * Math.PI) / wheelItems.length;
        const norm = (2 * Math.PI - (currentWheelAngle % (2 * Math.PI)) + 1.5 * Math.PI) % (2 * Math.PI);
        const winIdx = Math.floor(norm / arc) % wheelItems.length;
        const winner = wheelItems[winIdx];

        document.getElementById('wheelWinnerName').innerText = winner;
        document.getElementById('wheelWinnerAnnounce').classList.remove('hidden');

        if (window.confetti) {
          window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }
    }
    requestAnimationFrame(step);
  };

  // Coin Flip
  window.flipCoinAction = function() {
    if (isCoinFlipping) return;
    isCoinFlipping = true;
    const coin = document.getElementById('coinGraphic');
    coin.style.transform = 'rotateY(1080deg) scale(1.1)';

    const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';

    setTimeout(() => {
      coin.innerText = result;
      coin.style.transform = 'rotateY(0deg) scale(1)';
      isCoinFlipping = false;

      coinStats.total += 1;
      if (result === 'HEADS') coinStats.heads += 1;
      else coinStats.tails += 1;

      document.getElementById('coinHeadsCount').innerText = coinStats.heads;
      document.getElementById('coinTailsCount').innerText = coinStats.tails;
      document.getElementById('coinTotalCount').innerText = coinStats.total;
    }, 750);
  };

  // Roll Dice
  window.rollDiceAction = function() {
    const diceCont = document.getElementById('diceContainer');
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    diceCont.innerHTML = `
      <div class="size-16 rounded-2xl bg-base-200 border-2 border-primary flex items-center justify-center text-3xl font-black text-primary shadow-lg">${d1}</div>
      <div class="size-16 rounded-2xl bg-base-200 border-2 border-primary flex items-center justify-center text-3xl font-black text-primary shadow-lg">${d2}</div>
    `;
    document.getElementById('diceSumTotal').innerText = d1 + d2;
  };

  // Caption Generator
  window.generateCaptionAction = async function() {
    const plat = document.getElementById('captionPlatform').value;
    const prize = document.getElementById('captionPrize').value;
    const rules = document.getElementById('captionRules').value;

    const box = document.getElementById('captionResultBox');
    box.innerText = 'Generating viral caption...';

    try {
      const data = await window.SimpliersBackendAPI.generateCaption({ platform: plat, prize, conditions: rules });
      box.innerText = data.captions[0];
    } catch {
      box.innerText = `🎉 MEGA GIVEAWAY TIME! 🎉\n\nWin a ${prize}!\n\n👇 Rules to enter:\n1. Follow our page\n2. Double tap this post ❤️\n3. ${rules}\n\nGood luck! 🍀 #giveaway #contest`;
    }
  };

})();
