import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin to handle /_ipx/ Nuxt Image paths and multi-page routing
function ipxMiddleware() {
  return {
    name: 'ipx-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : ''

        // Handle Nuxt Image /_ipx/ paths
        // Pattern: /_ipx/<modifiers>/<actual-path>
        // Example: /_ipx/f_webp/images/logo.png -> /images/logo.png
        if (url.startsWith('/_ipx/')) {
          // Strip /_ipx/<modifier>/ prefix - find the actual file path
          // The format is /_ipx/<modifiers>/<path> where modifiers don't contain /images/ etc.
          const withoutPrefix = url.replace(/^\/_ipx\/[^/]+\//, '/')
          const filePath = path.resolve(__dirname, 'public' + withoutPrefix)

          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
              '.ico': 'image/x-icon',
            }
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            res.end(fs.readFileSync(filePath))
            return
          }

          // Try stripping multiple path segments to find the file
          const parts = withoutPrefix.split('/').filter(Boolean)
          for (let i = 1; i < parts.length; i++) {
            const candidate = '/' + parts.slice(i).join('/')
            const candidatePath = path.resolve(__dirname, 'public' + candidate)
            if (fs.existsSync(candidatePath)) {
              const ext = path.extname(candidatePath).toLowerCase()
              const mimeTypes = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.gif': 'image/gif',
                '.ico': 'image/x-icon',
              }
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
              res.setHeader('Cache-Control', 'public, max-age=3600')
              res.end(fs.readFileSync(candidatePath))
              return
            }
          }
        }

        next()
      })
    }
  }
}

// The bundled Nuxt app (public/simpliers/*.js) calls its backend with
// relative paths like "api/games/list-giveaways/save" (no leading slash),
// which the browser resolves against the current page path instead of the
// site root, so they never reach the existing `/api` -> Django proxy below.
// This rewrites req.url to the canonical /api/... path whenever it ends in
// one of those known relative endpoints, so the proxy picks it up.
function nuxtApiPathFixMiddleware() {
  const knownApiSuffixes = [
    'api/games/list-giveaways/save-list',
    'api/games/list-giveaways/save-giveaway',
    'api/games/list-giveaways/save',
    'api/games/list-giveaways/get-lists',
    'api/games/list-giveaways/get-list',
    'api/games/list-giveaways/get-giveaways',
    'api/games/list-giveaways/get-giveaway',
    'api/games/list-giveaways/delete-list',
    'api/games/list-giveaways/delete-giveaway',
  ]

  // Purely cosmetic analytics/telemetry/auth-token calls the bundle makes
  // that have no equivalent in the local Django backend. Some of these are
  // called with a leading slash (hits the /api proxy directly and 404s from
  // Django), others relative (never reach the proxy at all). Short-circuit
  // both with harmless mock responses instead of building real endpoints.
  const mockJsonBySuffix = {
    'api/token': { 'tracker-token': 'local-dev-token', data: { session: {}, limits: {}, user: null } },
    'api/stats': { data: {} },
    'api/account/subscription': { data: { subscription: null } },
    'api/track/log-event-web': { data: {} },
    'api/track/web-error-logs': { data: {} },
    'api/track/offer-session': { data: {} },
    'api/track/sync-tracker-domain': { data: {} },
    'api/track/tracker-domain-sync-error-log': { data: {} },
    'api/track': { data: {} },
  }

  return {
    name: 'nuxt-api-path-fix',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname] = (req.url || '').split('?')

        const mockSuffix = Object.keys(mockJsonBySuffix).find((suffix) => pathname.endsWith(suffix))
        if (mockSuffix) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(mockJsonBySuffix[mockSuffix]))
          return
        }

        if (!pathname.startsWith('/api/')) {
          const matched = knownApiSuffixes.find((suffix) => pathname.endsWith(suffix))
          if (matched) {
            const [, query] = (req.url || '').split('?')
            req.url = '/' + matched + (query ? '?' + query : '')
            next()
            return
          }
        }

        next()
      })
    }
  }
}

// Custom plugin to route multi-page exact clones
function multiPageRouter() {
  return {
    name: 'multi-page-router',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : ''
        
        // Front page (/en)
        if (url === '/en' || url === '/en/') {
          const filePath = path.resolve(__dirname, 'public/en/index.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }

        // Instagram Giveaway page
        if (
          url === '/en/giveaway/instagram' ||
          url === '/en/giveaway/instagram/' ||
          url === '/giveaway/instagram' ||
          url === '/giveaway/instagram/' ||
          url === '/instagram' ||
          url === '/instagram.html'
        ) {
          const filePath = path.resolve(__dirname, 'public/en/giveaway/instagram/index.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }


        // Admin panel (/admin)
        if (
          url === '/admin' ||
          url === '/admin/' ||
          url === '/admin/index.html'
        ) {
          const filePath = path.resolve(__dirname, 'public/admin/index.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nuxtApiPathFixMiddleware(), ipxMiddleware(), multiPageRouter()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app.html'),
      }
    }
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})

