import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'
import { resolveApiBaseUrl } from './src/services/apiConfig.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), 'VITE_')
  resolveApiBaseUrl({ isProduction: mode === 'production', configuredUrl: env.VITE_API_URL })
  return {
    plugins: [react()],
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
