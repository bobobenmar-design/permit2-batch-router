import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  server: {
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
