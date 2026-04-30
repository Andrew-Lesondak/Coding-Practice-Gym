import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      module: fileURLToPath(new URL('./src/shims/module.ts', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    forceExit: true,
    hookTimeout: 10000,
    teardownTimeout: 10000
  }
});
