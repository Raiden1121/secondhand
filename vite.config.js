import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = parseInt(env.VITE_PORT) || 5173
  const API_URL = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      port: PORT,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
        '/uploads': {
          target: API_URL,
          changeOrigin: true,
        },
        '/socket.io': {
          target: API_URL,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})

