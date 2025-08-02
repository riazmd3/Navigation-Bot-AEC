import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Navigation-bot/', // 👈 Your repo name
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
