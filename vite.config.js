import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  build: {
    assetsDir: '',
  },
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    open: false,
  }
});
