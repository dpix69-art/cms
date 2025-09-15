// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/cms/', // <= имя репозитория
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
