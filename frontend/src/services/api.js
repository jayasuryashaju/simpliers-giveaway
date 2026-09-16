/**
 * Resolves the backend API base URL dynamically across development and production:
 * - Checks import.meta.env.VITE_API_BASE_URL (set in Render environment or Blueprint)
 * - Checks window.CUSTOM_BACKEND_URL or window.RENDER_BACKEND_URL (set via runtime config.js)
 * - Defaults to http://127.0.0.1:8000/api when running on localhost / 127.0.0.1
 */

export function getApiBaseUrl() {
  let envUrl = import.meta.env && import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    envUrl = envUrl.trim();
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
      envUrl = `https://${envUrl}`;
    }
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    if (window.CUSTOM_BACKEND_URL) {
      return window.CUSTOM_BACKEND_URL.replace(/\/+$/, '');
    }
    if (window.RENDER_BACKEND_URL) {
      return window.RENDER_BACKEND_URL.replace(/\/+$/, '');
    }
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      return `${window.location.origin}/api`;
    }
  }

  return 'http://127.0.0.1:8000/api';
}

export const API_BASE_URL = getApiBaseUrl();

export default {
  getApiBaseUrl,
  API_BASE_URL,
};
