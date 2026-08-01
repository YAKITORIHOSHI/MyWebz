import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: true,
    cors: true,
  },
})



