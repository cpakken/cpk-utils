import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    dts({
      outDir: './dist/types',
      entryRoot: './src',
      exclude: ['**/vite-env.d.ts'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
      name: 'index',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['node:util'],
      // output: {preserveModules: true},
    },
  },
})
