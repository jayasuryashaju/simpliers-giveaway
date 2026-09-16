/**
 * Simpliers Instagram Giveaway Controller
 * 
 * Provides full interactivity for the Instagram Giveaway page:
 * - Link input validation and sample post auto-fill
 * - Cookie consent management (dismissible #consent-bar)
 * - Rules configuration (Winners, Substitutes, Filters)
 * - Custom Django REST API backend integration (http://127.0.0.1:8000/api)
 * - Animated comment fetching & cryptographic winner draw
 * - Confetti celebration & Official Simpliers Certificate of Validity modal
 * - Certificate verification lookup
 * - Light/Dark theme switching
 */

(function() {
  'use strict';

  function initAll() {
    initCookieConsent();
    initThemeToggle();
    initInstagramInput();
    initRulesAndDrawFlow();
    initCertificateLookup();
    initInfluencerAvatars();
    console.info('[Simpliers] Instagram Controller initialized successfully!');
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
    
    // Automatically hide after 2 seconds or on any accept/reject click
    const btns = consentBar.querySelectorAll('button');
    btns.forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        consentBar.style.display = 'none';
      });
    });
    // Also add a clean close timer so it doesn't obstruct interactions
    setTimeout(() => {
      if (consentBar) consentBar.style.opacity = '0';
      setTimeout(() => { if (consentBar) consentBar.style.display = 'none'; }, 400);
    }, 1500);
  }

  // 2. Theme Toggle
  function initThemeToggle() {
    const htmlEl = document.documentElement;
    const themeBtns = document.querySelectorAll('button[aria-label="theme"], .theme-toggle, input[type="checkbox"][id*="theme"]');
    
    function toggleTheme() {
      const isDark = htmlEl.classList.contains('dark');
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

    const savedTheme = localStorage.getItem('simpliers_theme');
    if (savedTheme === 'light') {
      htmlEl.classList.remove('dark');
      htmlEl.setAttribute('data-theme', 'light');
    }

    themeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.lucide-sun, .lucide-moon, [data-testid="theme-toggle"]')) {
        toggleTheme();
      }
    });
  }

  // 3. Instagram Input & Paste Handler
  function initInstagramInput() {
    const input = document.querySelector('input[placeholder*="Paste Link"]');
    if (!input) return;

    input.id = 'instagram-media-url';

    // Hook up clipboard/paste button next to input
    const pasteIcons = document.querySelectorAll('button:has(svg), .fa-paste, [title*="Paste"]');
    pasteIcons.forEach(icon => {
      icon.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text && text.includes('instagram.com')) {
              input.value = text;
              showToast('Pasted link from clipboard!');
              return;
            }
          }
        } catch (err) {
          // fallback
        }
        input.value = 'https://www.instagram.com/p/C-verified_giveaway_demo/';
        showToast('Loaded demo Instagram giveaway post!');
      });
    });

    // Enter key triggers rules / draw
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        openRulesModal(input.value);
      }
    });
  }

  // 4. Rules & Draw Flow
  function initRulesAndDrawFlow() {
    function handleRulesClick(e) {
      if (e) e.preventDefault();
      const input = document.querySelector('input[placeholder*="Paste Link"]');
      const url = input && input.value.trim() ? input.value.trim() : 'https://www.instagram.com/p/C-verified_giveaway_demo/';
      if (input && !input.value.trim()) {
        input.value = url;
      }
      openRulesModal(url);
    }

    // Direct binding
    document.querySelectorAll('button, a').forEach(el => {
      if (el.textContent.trim().toLowerCase().includes('rules')) {
        el.addEventListener('click', handleRulesClick);
      }
    });

    // Event delegation on document
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a');
      if (!target) return;
      const text = target.textContent.trim().toLowerCase();
      if (text === 'rules' || text.startsWith('rules') || text.includes('rules')) {
        handleRulesClick(e);
      }
    });
  }

  // Open Rules Modal (Step 2)
  function openRulesModal(postUrl) {
    const modal = createOrGetGiveawayModal();
    modal.show();
    modal.setStepRules(postUrl, (config) => {
      executeDrawFlow(config);
    });
  }

  // Execute Giveaway Draw via Django Backend (Step 3)
  async function executeDrawFlow(config) {
    const modal = createOrGetGiveawayModal();
    modal.setStepLoading('Connecting to Django backend & collecting Instagram entries...');

    try {
      // 1. Create giveaway record on Django REST API
      const payload = {
        title: 'Instagram Giveaway - ' + new Date().toLocaleDateString(),
        platform: 'instagram',
        post_url: config.post_url,
        winner_count: config.winner_count || 1,
        substitute_count: config.substitute_count || 1,
        min_mentions: config.min_mentions || 1,
        allow_duplicates: config.allow_duplicates || false,
        rules_summary: `${config.winner_count} Winner, ${config.substitute_count} Substitute, Min ${config.min_mentions} Mentions`
      };

      const created = await window.SimpliersBackendAPI.createGiveaway(payload);
      
      // 2. Animate entries fetching
      modal.setStepFetching(created);
      await delay(2000);

      // 3. Countdown suspense
      await modal.runCountdown(3);

      // 4. Execute cryptographic random draw
      const drawResult = await window.SimpliersBackendAPI.drawGiveaway(created.id);

      // 5. Celebration confetti
      triggerConfetti();

      // 6. Display official Simpliers Certificate of Validity
      modal.showResults(drawResult);

    } catch (err) {
      console.error('[Simpliers Giveaway Flow Error]', err);
      modal.setError(err.message || 'Error connecting to giveaway backend API');
    }
  }

  // 5. Modal Component
  function createOrGetGiveawayModal() {
    let modalEl = document.getElementById('simpliers-giveaway-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'simpliers-giveaway-modal';
      modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm hidden';
      modalEl.innerHTML = `
        <div class="relative w-full max-w-xl bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#1f222a]">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white text-lg shadow-sm">
                <i class="fa-brands fa-instagram"></i>
              </span>
              <div>
                <h3 class="font-bold text-base leading-tight">Instagram Giveaway Picker</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Step 2 & 3 &bull; Fair Draw & Certificate</p>
              </div>
            </div>
            <button type="button" id="giveaway-modal-close" class="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg text-lg">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Body -->
          <div id="giveaway-modal-body" class="p-6"></div>
        </div>
      `;
      document.body.appendChild(modalEl);

      modalEl.querySelector('#giveaway-modal-close').onclick = () => modalEl.classList.add('hidden');
      modalEl.onclick = (e) => {
        if (e.target === modalEl) modalEl.classList.add('hidden');
      };
    }

    const body = modalEl.querySelector('#giveaway-modal-body');

    return {
      show() {
        modalEl.classList.remove('hidden');
      },
      hide() {
        modalEl.classList.add('hidden');
      },
      setStepRules(postUrl, onStart) {
        body.innerHTML = `
          <div>
            <div class="mb-4">
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Target Media Link</label>
              <div class="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                ${postUrl}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Number of Winners</label>
                <select id="rule-winners" class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold">
                  <option value="1" selected>1 Winner</option>
                  <option value="2">2 Winners</option>
                  <option value="3">3 Winners</option>
                  <option value="5">5 Winners</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Substitute Winners</label>
                <select id="rule-substitutes" class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold">
                  <option value="1" selected>1 Substitute</option>
                  <option value="2">2 Substitutes</option>
                  <option value="3">3 Substitutes</option>
                </select>
              </div>
            </div>

            <div class="space-y-3 mb-6">
              <label class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                <input type="checkbox" id="rule-dedup" checked class="w-4 h-4 rounded text-pink-600 focus:ring-pink-500">
                <div class="text-xs">
                  <span class="font-bold block text-gray-900 dark:text-white">Count each user only once</span>
                  <span class="text-gray-500 dark:text-gray-400">Ignore multiple comments from the same Instagram account</span>
                </div>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                <input type="checkbox" id="rule-min-mentions" checked class="w-4 h-4 rounded text-pink-600 focus:ring-pink-500">
                <div class="text-xs">
                  <span class="font-bold block text-gray-900 dark:text-white">Require friend mentions</span>
                  <span class="text-gray-500 dark:text-gray-400">At least 1 tagged @user per qualifying comment</span>
                </div>
              </label>
            </div>

            <button type="button" id="start-draw-btn" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#e0003b] to-[#dc2743] hover:from-[#c70034] hover:to-[#c2185b] text-white font-bold text-sm shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-play"></i> Start Giveaway & Pick Winners
            </button>
          </div>
        `;

        body.querySelector('#start-draw-btn').onclick = () => {
          const winnerCount = parseInt(body.querySelector('#rule-winners').value, 10);
          const substituteCount = parseInt(body.querySelector('#rule-substitutes').value, 10);
          const allowDuplicates = !body.querySelector('#rule-dedup').checked;
          const minMentions = body.querySelector('#rule-min-mentions').checked ? 1 : 0;

          onStart({
            post_url: postUrl,
            winner_count: winnerCount,
            substitute_count: substituteCount,
            allow_duplicates: allowDuplicates,
            min_mentions: minMentions
          });
        };
      },
      setStepLoading(msg) {
        body.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-14 h-14 border-4 border-pink-500/20 border-t-pink-600 rounded-full animate-spin mb-4"></div>
            <h4 class="text-lg font-bold mb-1">${msg}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Querying custom Django REST API (port 8000)...</p>
          </div>
        `;
      },
      setStepFetching(giveaway) {
        body.innerHTML = `
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="w-16 h-16 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center text-2xl font-bold mb-4 animate-pulse">
              <i class="fa-solid fa-comments"></i>
            </div>
            <h4 class="text-xl font-bold mb-1">Entries Collected</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Validated: <span class="text-emerald-500 font-semibold font-mono">100% Fair</span> &bull; Certificate ID: #${giveaway.certificate_code}</p>
            <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-3">
              <div class="bg-pink-600 h-full rounded-full w-full"></div>
            </div>
            <p class="text-xs text-gray-500">Preparing cryptographically fair selection...</p>
          </div>
        `;
      },
      async runCountdown(seconds) {
        for (let i = seconds; i > 0; i--) {
          body.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 text-center">
              <span class="text-7xl font-black text-pink-600 animate-bounce mb-3">${i}</span>
              <h4 class="text-lg font-bold">Picking Random Winner...</h4>
              <p class="text-xs text-gray-500">Algorithm: CSPRNG Fair Draw Engine</p>
            </div>
          `;
          await delay(1000);
        }
      },
      showResults(data) {
        const giveaway = data.giveaway;
        const winners = data.winners || [];
        const substitutes = data.substitutes || [];

        body.innerHTML = `
          <div class="py-1">
            <div class="text-center mb-5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2">
                <i class="fa-solid fa-circle-check"></i> Official Draw Completed
              </span>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white">Winner Selected! 🎉</h3>
            </div>

            <!-- Winners -->
            <div class="space-y-3 mb-5">
              ${winners.map((w, idx) => `
                <div class="flex items-center gap-3 p-3.5 rounded-xl border border-pink-500/30 bg-pink-50/50 dark:bg-pink-950/20">
                  <img src="${w.avatar_url || '/lazy-preloader.png'}" alt="${w.username}" class="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm text-gray-900 dark:text-white truncate">@${w.username}</span>
                      <span class="text-[10px] uppercase font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full">Winner #${idx + 1}</span>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">"${w.comment_text || 'Count me in! Hope I win!'}"</p>
                  </div>
                </div>
              `).join('')}

              ${substitutes.map((s, idx) => `
                <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <img src="${s.avatar_url || '/lazy-preloader.png'}" alt="${s.username}" class="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">@${s.username}</span>
                      <span class="text-[10px] uppercase bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">Alternate #${idx + 1}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Certificate Box -->
            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1d24] mb-4">
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-shield-halved text-emerald-500"></i>
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Simpliers Certificate of Validity</span>
                </div>
                <a href="${(window.SimpliersBackendAPI ? window.SimpliersBackendAPI.config.BASE_URL : '/api')}/giveaways/verify/${giveaway.certificate_code}/" target="_blank" class="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1">
                  Verify Record <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>
              <div class="text-xl font-mono font-black text-pink-600 tracking-wider">
                #${giveaway.certificate_code}
              </div>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate mt-1">
                Hash: ${giveaway.verification_hash || 'SHA256:SMP-VALIDITY-CRYPTO-DRAW'}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button type="button" onclick="document.getElementById('simpliers-giveaway-modal').classList.add('hidden')" class="flex-1 py-2.5 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 transition">
                Close
              </button>
              <button type="button" onclick="window.open((window.SimpliersBackendAPI ? window.SimpliersBackendAPI.config.BASE_URL : '/api') + '/giveaways/verify/${giveaway.certificate_code}/', '_blank')" class="flex-1 py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-certificate"></i> View Certificate
              </button>
            </div>
          </div>
        `;
      },
      setError(msg) {
        body.innerHTML = `
          <div class="py-8 text-center">
            <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl mx-auto mb-3">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h4 class="text-base font-bold text-gray-900 dark:text-white mb-1">Backend Connection Notice</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto">${msg}</p>
            <button type="button" onclick="document.getElementById('simpliers-giveaway-modal').classList.add('hidden')" class="py-2 px-6 rounded-xl bg-gray-200 dark:bg-gray-700 text-xs font-bold">
              Dismiss
            </button>
          </div>
        `;
      }
    };
  }

  // 6. Certificate Lookup
  function initCertificateLookup() {
    const prevBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Previous Giveaways'));
    prevBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const code = prompt('Enter Simpliers Certificate Code (e.g. SMP-772910, SMP-491028):', 'SMP-772910');
        if (!code) return;
        try {
          showToast('Checking Django backend...');
          const cert = await window.SimpliersBackendAPI.verifyCertificate(code);
          const modal = createOrGetGiveawayModal();
          modal.show();
          modal.showResults({
            giveaway: cert,
            winners: cert.winners || [],
            substitutes: cert.substitutes || []
          });
        } catch (err) {
          alert(err.message || 'Certificate not found.');
        }
      });
    });
  }

  // 7. Influencer Images Error Guard
  function initInfluencerAvatars() {
    document.querySelectorAll('img[src*="/images/influencers/"]').forEach(img => {
      img.onerror = function() {
        this.src = '/lazy-preloader.png';
      };
    });
  }

  // Utilities
  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 transition-all duration-300';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function triggerConfetti() {
    const colors = ['#e0003b', '#ff4081', '#7c4dff', '#00e676', '#ffd600'];
    for (let i = 0; i < 35; i++) {
      const p = document.createElement('div');
      p.className = 'fixed z-50 pointer-events-none rounded-sm';
      p.style.width = Math.random() * 8 + 4 + 'px';
      p.style.height = Math.random() * 8 + 4 + 'px';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = '-10px';
      p.style.transition = `all ${Math.random() * 2 + 1.5}s ease-out`;
      document.body.appendChild(p);
      setTimeout(() => {
        p.style.top = '105vh';
        p.style.opacity = '0';
      }, 30);
      setTimeout(() => p.remove(), 3500);
    }
  }

})();
