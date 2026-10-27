import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@alexovn/okapi/fetch': fileURLToPath(
        new URL('../lib/src/adapters/fetch.ts', import.meta.url),
      ),
      '@alexovn/okapi/axios': fileURLToPath(
        new URL('../lib/src/adapters/axios.ts', import.meta.url),
      ),
      '@alexovn/okapi/ofetch': fileURLToPath(
        new URL('../lib/src/adapters/ofetch.ts', import.meta.url),
      ),
      '@alexovn/okapi': fileURLToPath(new URL('../lib/src/index.ts', import.meta.url)),
    },
  },
  build: { outDir: '../dist', emptyOutDir: true },
})
