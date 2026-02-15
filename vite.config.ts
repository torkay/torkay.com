import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        splash: resolve(__dirname, 'index.html'),
        'text-test': resolve(__dirname, 'text-test.html'),
      },
    },
  },
});
