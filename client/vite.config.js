
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { cwd } from 'node:process'
import { resolveApiBaseUrl } from './src/services/apiConfig.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), 'VITE_')

  resolveApiBaseUrl({
    isProduction: mode === 'production',
    configuredUrl: env.VITE_API_URL,
  })

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'TaskFlow Pro',
          short_name: 'TaskFlow',
          description: 'Manage your tasks with TaskFlow Pro.',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
