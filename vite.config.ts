import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        // Frontend ve API aynı origin'den sunulur; böylece refresh token cookie'si (SameSite=Strict) sorunsuz çalışır
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://localhost:7206',
          changeOrigin: true,
          secure: false, // HTTPS self-signed certificate için
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // antd tek başına ~1 MB; uygulama kodundan ayrı chunk olduğu için tarayıcıda uzun süre önbellekte kalır
      chunkSizeWarningLimit: 1100,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            antd: ['antd'],
            icons: ['@ant-design/icons'],
          }
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    }
  }
})
