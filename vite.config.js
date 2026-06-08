import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // ── Dev proxy ────────────────────────────────────────────────────────────
    // Proxies /api/* requests from the Vite dev server to your Express backend.
    // This means CORS is never an issue during local development — the browser
    // sees all traffic on the same origin (localhost:5173).
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Warn if any individual chunk exceeds 600 KB (helps spot oversized bundles)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
