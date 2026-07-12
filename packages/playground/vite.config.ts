import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: 'src',
  plugins: [vue()],
  resolve: {
    alias: {
      '@alexovn/okapi': fileURLToPath(new URL('../lib/src/index.ts', import.meta.url)),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
