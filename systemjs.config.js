System.config({
  baseUrl: './',
  defaultJSExtensions: false,
  transpiler: 'plugin-babel',
  map: {
    odl: 'src/odl',
    'plugin-babel': './node_modules/systemjs-plugin-babel/plugin-babel',
    'systemjs-babel-build': './node_modules/systemjs-plugin-babel/systemjs-babel-node.js',
  },
  externals: [
    'jquery',
    'gk/*',
    'https://www.googleadservices.com/pagead/conversion_async.js',
    'https://cdn.optimizely.com/js/216755552.js',
    'https://media.richrelevance.com/rrserver/js/1.0/p13n.js',
  ],
  meta: {
    'vendor/richrelevance.js': {
      format: 'global', // load this module as a global
      exports: 'rr',
    },
  },
  packages: {
    odl: {
      defaultExtension: 'js',
    },
    node_modules: {
      defaultExtension: 'js',
    },
  },
});
