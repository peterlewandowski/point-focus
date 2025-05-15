const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const postcss = require('rollup-plugin-postcss')
const peerDepsExternal = require('rollup-plugin-peer-deps-external')
const dts = require('rollup-plugin-dts').default
const typescript = require('@rollup/plugin-typescript')
const path = require('path')
const packageJson = require('./package.json')

module.exports = [
  // JS/TS build with CSS
  {
    input: 'src/index.tsx',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      commonjs(),
      postcss({
        inject: true,
        extract: false,
        minimize: true,
        extensions: ['.css', '.scss'],
        modules: {
          exportLocalsConvention: 'asIs',
        },
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
      }),
    ],
    external: ['react', 'react-dom'],
  },

  {
    input: 'src/index.tsx',
    output: {
      file: packageJson.types,
      format: 'es',
    },
    plugins: [dts()],
    external: [/\.css$/], // 👈 Prevents CSS from being parsed
  },
]
