/**
 * Simpliers Runtime Environment Configuration
 * 
 * Automatically connects to Render backend when hosted, and localhost when developing locally.
 */
(function(window) {
  if (!window.CUSTOM_BACKEND_URL) {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      window.CUSTOM_BACKEND_URL = 'http://127.0.0.1:8000/api';
    } else {
      window.CUSTOM_BACKEND_URL = 'https://simpliers-backend.onrender.com/api';
    }
  }
})(window);
