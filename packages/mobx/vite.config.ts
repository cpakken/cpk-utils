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
      name: 'cpk-mobx-utils',
      fileName: (format) => `cpk-mobx-utils.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['mobx', '@cpk-utils/common'],
      // external: ['mobx'],
      // output: {
      //   globals: { mobx: 'mobx' },
      // },
    },
  },
})
