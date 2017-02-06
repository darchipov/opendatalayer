System.config({
  baseUrl: './',
  defaultJSExtensions: false,
  transpiler: 'plugin-babel',
  map: {
    odl: 'src/odl',
    'plugin-babel': './node_modules/systemjs-plugin-babel/plugin-babel',
    'systemjs-babel-build': './node_modules/systemjs-plugin-babel/systemjs-babel-node.js',
  },
  externals: [],
  packages: {
    odl: {
      defaultExtension: 'js',
    },
    node_modules: {
      defaultExtension: 'js',
    },
  },
  warnings: true,
});
