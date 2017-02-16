// import nodeResolve from 'rollup-plugin-node-resolve';
import rollupReplace from 'rollup-plugin-replace';
import rollupBabel from 'rollup-plugin-babel';
import fs from 'fs';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const name = 'opendatalayer';

export default {
  entry: 'index.es6.js',
  format: 'cjs',
  dest: `dist/${name}.cjs.js`,
  moduleName: 'opendatalayer',
  banner: `/*
 * OpenDataLayer v${version}
 */`,
  plugins: [
    rollupBabel({
      // use our own config here
      babelrc: false,
      presets: [['es2015', { modules: false }]],
      plugins: ['external-helpers'],
    }),
    rollupReplace({
      VERSION: JSON.stringify(version),
    }),
  ],
};
