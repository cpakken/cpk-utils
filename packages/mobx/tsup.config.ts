import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  minify: true,
  treeshake: true,
  dts: true,
  clean: true,
})
