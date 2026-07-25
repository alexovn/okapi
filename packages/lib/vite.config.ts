import { resolve } from 'node:path'

import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [
    dts({
      bundleTypes: true,
      insertTypesEntry: true,
      entryRoot: './src',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      name: 'okapi',
      fileName: 'okapi',
    },
    rolldownOptions: {
      external: ['axios', 'ofetch'],
      output: { globals: { axios: 'axios', ofetch: 'ofetch' } },
    },
  },
})
