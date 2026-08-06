import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useLocalHttps = env.VITE_DEV_HTTPS === 'true'

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(useLocalHttps ? [basicSsl()] : []),
    ],
    build: {
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('firebase')) return 'vendor-firebase'
            if (id.includes('recharts')) return 'vendor-recharts'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('react')) return 'vendor-react'
            return undefined
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      https: useLocalHttps,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
    },
  }
})
