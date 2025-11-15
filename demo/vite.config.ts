import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  root: './demo',
  base: process.env.NODE_ENV === 'production' ? '/vue-book-viewer/' : '/',
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
