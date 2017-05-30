// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  format: 'cjs',
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
    commonjs({
      namedExports: { 'node_modules/spawn-args/index.js': ['spawnargs'] }, // Default: undefined
    }),
  ],
  dest: 'dist/bundle.js',
};
