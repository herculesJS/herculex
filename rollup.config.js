import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      module: true,
      jsnext: true,
      main: true
    }),
    commonjs(),
    babel({
      exclude: /node_modules/
    })
  ],
  output: {
    file: 'dist/index.js',
    format: 'esm',
    compact: true,
    name: 'herculex',
    exports: 'named',
    globals: []
  }
};
