
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Nạp biến môi trường dựa trên mode (development, production, etc.)
  // Đối số thứ 3 là '' để nạp tất cả các biến không cần prefix VITE_
  // Fix: Cast process to any to access cwd() and avoid TypeScript error
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env': {
        API_KEY: env.API_KEY || env.GEMINI_API_KEY || '',
        GCP_PROJECT_ID: 'gen-lang-client-0583340708'
      }
    },
    server: {
      port: 3001,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      chunkSizeWarningLimit: 800,
      commonjsOptions: {
        transformMixedEsModules: true
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-icons': ['lucide-react'],
          }
        }
      }
    }
  };
});
