import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        runtimeCaching: [{
          urlPattern: ({ url }) => {
            return url.toString().startsWith('/api');
          },
          handler: "CacheFirst" as const,
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 365 DAYS
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
