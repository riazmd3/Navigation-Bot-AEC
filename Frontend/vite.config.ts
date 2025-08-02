import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Navigation-Bot-AEC/', 
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
