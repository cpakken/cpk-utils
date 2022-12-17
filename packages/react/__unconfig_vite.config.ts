
let __unconfig_data;
let __unconfig_stub = function (data = {}) { __unconfig_data = data };
__unconfig_stub.default = (data = {}) => { __unconfig_data = data };
import path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'
import packagejson from './package.json'

const external = [...Object.keys(packagejson.dependencies || {}), ...Object.keys(packagejson.peerDependencies || {})]

const __unconfig_default =  defineConfig({
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

if (typeof __unconfig_default === "function") __unconfig_default(...[{"command":"serve","mode":"development"}]);export default __unconfig_data;