import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative asset paths so the build works whether it's served from the
  // domain root (local preview) or a GitHub Pages project subpath.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '75 Hard Tracker',
        short_name: '75 Hard',
        description: 'Daily checklist tracker for the 75 Hard challenge, with streaks, goals, and a progress calendar.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#120a1f',
        theme_color: '#120a1f',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
