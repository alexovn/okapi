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
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        fetch: resolve(import.meta.dirname, 'src/adapters/fetch.ts'),
        axios: resolve(import.meta.dirname, 'src/adapters/axios.ts'),
        ofetch: resolve(import.meta.dirname, 'src/adapters/ofetch.ts'),
      },
      formats: ['es'],
      name: 'okapi',
      fileName: (_, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: ['axios', 'ofetch'],
      output: { globals: { axios: 'axios', ofetch: 'ofetch' } },
    },
  },
})
