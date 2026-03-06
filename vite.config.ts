import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: '/Umbra_PWA/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    cssTarget: 'safari13',
  },
  server: {
    host: true,
  },
  plugins: [
    basicSsl(),
    react(),
    legacy({
      // iOS home-screen web apps can run older WebKit builds than Safari tab mode.
      targets: ['defaults', 'not IE 11', 'iOS >= 12', 'Safari >= 12'],
      modernPolyfills: true,
    }),
    tailwindcss(),
    VitePWA({
      injectRegister: null,
      registerType: 'autoUpdate',
      manifestFilename: 'umbrafi.webmanifest',
      includeAssets: ['icon.svg', 'apple-touch-icon-180x180.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        id: '/Umbra_PWA/',
        name: 'UmbraFi',
        short_name: 'UmbraFi',
        description: 'Decentralized Web3 Marketplace',
        theme_color: '#F5F5F5',
        background_color: '#F5F5F5',
        display: 'standalone',
        orientation: 'portrait',
        display_override: ['standalone', 'minimal-ui'],
        start_url: '/Umbra_PWA/',
        scope: '/Umbra_PWA/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
