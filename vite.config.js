import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy /api/push → discover.flowics.com (HTTP Push)
      '/api/push': {
        target: 'https://discover.flowics.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/push/, ''),
        secure: true,
      },
      // Proxy /api/flowics → api.flowics.com (Control API, if needed later)
      '/api/flowics': {
        target: 'https://api.flowics.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flowics/, ''),
        secure: true,
      },
    },
  },
})
