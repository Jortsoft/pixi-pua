import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  resolve: {
    alias: {
      pua: fileURLToPath(new URL('./src/pua', import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
