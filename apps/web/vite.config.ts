import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'Sleek Shop',
        short_name: 'Sleek Shop',
        description: 'Style, technology and everyday essentials, delivered across Kenya.',
        lang: 'en-KE',
        dir: 'ltr',
        categories: ['shopping', 'lifestyle'],
        theme_color: '#5a2149',
        background_color: '#f8f3e8',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'any',
        scope: '/',
        start_url: '/?source=pwa',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: 'Shop all products', short_name: 'Shop', url: '/shop', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'My bag', short_name: 'Bag', url: '/cart', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'My account', short_name: 'Account', url: '/account', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico,woff2,txt}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sleek-remote-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: true, type: 'classic', navigateFallback: 'index.html' }
    })
  ],
  server: { port: 5173 },
  preview: { port: 4173 }
});
