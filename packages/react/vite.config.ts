import path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'
import packagejson from './package.json'

const external = [...Object.keys(packagejson.dependencies || {}), ...Object.keys(packagejson.peerDependencies || {})]

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
      name: 'cpk-react-utils',
      fileName: (format) => `cpk-react-utils.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: { external },
  },
})
