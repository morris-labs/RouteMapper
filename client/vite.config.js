import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE || 'http://localhost:3001';
  return {
    // Deployed under morrislabs.app/routemapper/, not the domain root -- the
    // dev server keeps '/' so `npm run dev` still works at localhost:5173/.
    base: command === 'build' ? '/routemapper/' : '/',
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: apiBase, changeOrigin: true },
      },
    },
  };
});
