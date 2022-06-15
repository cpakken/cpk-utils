import path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    dts({
      outputDir: './dist/types',
      entryRoot: './src',
      skipDiagnostics: false,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'cpk-utils-common',
      fileName: (format) => `cpk-utils-common.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['util'],
    },
  },
})
