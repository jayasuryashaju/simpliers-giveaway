/**
 * Simpliers Custom Backend Connector API
 * 
 * Configure this module to connect the Simpliers frontend clone
 * to any custom backend API (Django, FastAPI, Express, NestJS, Go, etc.).
 */

(function(window) {
  'use strict';

  // Configurable base URL for the backend API
  // Automatically detects production host or local dev server
  function resolveDefaultBaseUrl() {
    if (window.CUSTOM_BACKEND_URL && window.CUSTOM_BACKEND_URL.trim()) {
      return window.CUSTOM_BACKEND_URL.trim().replace(/\/+$/, '');
    }
    if (window.RENDER_BACKEND_URL && window.RENDER_BACKEND_URL.trim()) {
      return window.RENDER_BACKEND_URL.trim().replace(/\/+$/, '');
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'http://127.0.0.1:8000/api';
    }
    // On Render, automatically connect frontend to backend service
    if (host.includes('onrender.com')) {
      const backendHost = host.replace('-frontend', '-backend');
      return `https://${backendHost}/api`;
    }
    return `${window.location.origin}/api`;
  }

  const API_CONFIG = {
    BASE_URL: resolveDefaultBaseUrl(),
    TIMEOUT_MS: 15000,
  };

  const SimpliersBackendAPI = {
    config: API_CONFIG,

    /**
     * Set a new base URL at runtime.
     * @param {string} newBaseUrl 
     */
    setBaseUrl(newBaseUrl) {
      API_CONFIG.BASE_URL = newBaseUrl.replace(/\/+$/, '');
      console.info(`[SimpliersAPI] Connected to backend at: ${API_CONFIG.BASE_URL}`);
    },

    /**
     * Creates a new giveaway session.
     * @param {Object} payload 
     * @returns {Promise<Object>}
     */
    async createGiveaway(payload) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/giveaways/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to create giveaway: ${response.statusText}`);
      }
      return await response.json();
    },

    /**
     * Executes cryptographic winner selection for a giveaway.
     * @param {number|string} giveawayId 
     * @returns {Promise<Object>}
     */
    async drawGiveaway(giveawayId) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/giveaways/${giveawayId}/draw/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Failed to execute draw: ${response.statusText}`);
      }
      return await response.json();
    },

    /**
     * Verifies an official validity certificate by code.
     * @param {string} code 
     * @returns {Promise<Object>}
     */
    async verifyCertificate(code) {
      const cleanCode = encodeURIComponent(code.trim().toUpperCase());
      const response = await fetch(`${API_CONFIG.BASE_URL}/giveaways/verify/${cleanCode}/`);
      if (!response.ok) {
        throw new Error(`No verified record found for certificate ${code}`);
      }
      return await response.json();
    },

    /**
     * Generates cryptographic random numbers.
     * @param {Object} params { min, max, count, allow_duplicates }
     * @returns {Promise<Object>}
     */
    async randomNumber(params) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/tools/random-number/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await response.json();
    },

    /**
     * Rolls fair virtual dice.
     * @param {number} diceCount 
     * @returns {Promise<Object>}
     */
    async rollDice(diceCount = 2) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/tools/roll-dice/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dice_count: diceCount })
      });
      return await response.json();
    },

    /**
     * Simulates cryptographic coin flips.
     * @param {number} count 
     * @returns {Promise<Object>}
     */
    async flipCoin(count = 1) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/tools/flip-coin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      return await response.json();
    },

    /**
     * Generates contest and giveaway captions.
     * @param {Object} params { platform, prize, conditions }
     * @returns {Promise<Object>}
     */
    async generateCaption(params) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/tools/caption-generator/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await response.json();
    },

    /**
     * Upload an Excel file and match participants against admin preset winners.
     * Honors winnerCount (1 or 2). Falls back to random if no matches.
     *
     * @param {File} file - The .xlsx or .xls File object
     * @param {number} winnerCount - Number of winners to select (1 or 2)
     * @returns {Promise<Object>}
     */
    async uploadExcelWinner(file, winnerCount = 1) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('winner_count', String(winnerCount || 1));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/tools/excel-winner/`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Excel upload failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    },

    /**
     * Admin Authentication
     * @param {string} username
     * @param {string} password
     */
    async adminLogin(username, password) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Invalid admin credentials');
      }
      return await response.json();
    },

    /**
     * Fetch preset winners list
     * @param {string} token
     */
    async getAdminWinners(token) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/winners/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch preset winners');
      }
      return await response.json();
    },

    /**
     * Add preset winner (maximum 2)
     * @param {string} name
     * @param {string} token
     */
    async addAdminWinner(name, token) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/winners/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add winner');
      }
      return data;
    },

    /**
     * Fetch preset winners list configured in admin (public read).
     * @returns {Promise<{winners: string[]}>}
     */
    async getPresetWinners() {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/giveaways/preset-winners/`);
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn('[SimpliersAPI] Failed to fetch /giveaways/preset-winners/, trying /admin/winners/:', err);
      }
      try {
        const fallback = await fetch(`${API_CONFIG.BASE_URL}/admin/winners/`);
        if (fallback.ok) {
          return await fallback.json();
        }
      } catch (err) {
        console.warn('[SimpliersAPI] Failed to fetch preset winners from /admin/winners/:', err);
      }
      return { winners: [] };
    },

    /**
     * Executes rigged draw on the backend using the preset winners saved in admin.
     * @param {Object} params { candidates, winner_count, substitute_count, contest_name }
     * @returns {Promise<Object>}
     */
    async drawListRigged(params) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/giveaways/draw-rigged/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to execute rigged draw: ${response.statusText}`);
      }
      return await response.json();
    },

    /**
     * Remove preset winner
     * @param {string} name
     * @param {string} token
     */
    async deleteAdminWinner(name, token) {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/winners/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete winner');
      }
      return data;
    }
  };

  window.SimpliersBackendAPI = SimpliersBackendAPI;
})(window);
