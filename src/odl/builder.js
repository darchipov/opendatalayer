var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

/**
 * Normalize a module name to an identifier that can be used as variable name.
 * Example: "foo/bar/example" would become "foo_bar_example"
 */
function normalizePluginName (moduleName) {
  return moduleName.replace(/\//g, '_');
}
module.exports.normalizePluginName = normalizePluginName;

/**
 * Generate a string with ES6 import statements based on the given configuration
 * @return {String}
 */
function generateES6ImportString(config) {
  var output = 'import odl from \'../src/odl/ODL\';\n';
  for (const name in config.plugins || {}) {
    if (!config.hasOwnProperty(name)) {
      output += 'import ' + normalizePluginName(name) + ' from \'../src/' + name + '\';\n';
    }
  }
  return output;
}

/**
 * Validate a single ODL plugin configuration and check if rule and config are
 * syntactically correct.
 * @param config
 * @return {Object}
 */
function validateConfiguration(config) {
  // validate configuration and rules
  if (!config.config) {
    throw new Error(`validateConfiguration: config missing for plugin ${config}`);
  }
  if (!config.rule) {
    throw new Error(`validateConfiguration: rule missing for plugin ${config}`);
  }
}

/**
 * Generate an ODL plugin configuration based on the given plugin list
 * @param plugins  {Array<Object>}   object literal with plugin configurations
 * @return {String}
 */
function generateConfiguration(plugins) {
  // build configuration block
  var output = 'var ODL_CONFIG = {\n';
  for (const name in plugins || {}) {
    if (plugins.hasOwnProperty(name)) {
      const entry = plugins[name];
      output += '  \'' + name + '\': ' + JSON.stringify(entry.config) + ',\n';
    }
  }
  output += '};\n';
  return output;
}

/**
 * Generate an ODL plugin ruleset based on the given plugin list
 * @param plugins  {Array<Object>}   object literal with plugin configurations
 * @return {String}
 */
function generateRuleset(plugins) {
  // build configuration block
  var output = 'var ODL_RULES = {\n';
  for (const name in plugins || {}) {
    if (plugins.hasOwnProperty(name)) {
      const entry = plugins[name];
      output += '  \'' + name + '\': ' + entry.rule + ',\n';
    }
  }
  output += '};\n';
  return output;
}

/**
 * Generate an ODL plugin mapping that gets used to lookup module variables for
 * runtime instantiation of plugins.
 * @param plugins  {Array<Object>}   object literal with plugin configurations
 * @return {String}
 */
function generateMappings(plugins) {
  // build configuration block
  var output = 'var ODL_MAPPINGS = {\n';
  for (const name in plugins || {}) {
    if (plugins.hasOwnProperty(name)) {
      output += '  \'' + name + '\': ' + normalizePluginName(name) + ',\n';
    }
  }
  output += '};\n';
  return output;
}

/**
 * Generate the ODL initialization block based on given config and rules.
 * @return {String}
 */
function generateODLInitialization() {
  var output = 'odl.initialize({}, ODL_RULES, ODL_CONFIG, {}, ODL_MAPPINGS);';
  return output;
}

/**
 * Generate the complete ODL initscript that contains import statements for all required
 * plugins and the odl.init call.
 * @param config  {Object}  ODL configuration object as passed to odl.init
 * @param targetFilename  {String}  absolute path (incl. filename) to write the init script to
 */
function generateInitScript(config, targetFile) {
  var output = '';

  // generate main code
  output += generateES6ImportString(config) + '\n';
  output += generateConfiguration(config.plugins);
  output += generateRuleset(config.plugins);
  output += generateMappings(config.plugins) + '\n';
  output += generateODLInitialization();

  return fs.writeFileSync(targetFile, output);
}

module.exports.buildPackage = function (config) {
  var baseDir = config.baseDir || '/' + path.resolve(__dirname);
  var entryPoint = './build/__odl-init.js';
  var concatFiles = [];

  generateInitScript(config, baseDir + '/' + entryPoint);

  console.log('Running builder in: ', baseDir);
  console.log('Starting from entry point: ', baseDir + '/' + entryPoint);
  console.log('Writing output to: ', baseDir + '/dist');

  // configure an start webpack
  webpack({
    entry: entryPoint,
    context: baseDir, // string
    output: {
      filename: './dist/opendatalayer.js', // string
      library: 'opendatalayer', // string,
      libraryTarget: 'umd', // enum
    },
    module: {
      loaders: [
        {
          test: /\.js?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          },
        },
      ],
    },
    devtool: 'source-map', // enum
    target: 'web',
  }, function (err, stats) {
    // ...
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
    } else {
      console.log('DONE: ');
      console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true,    // Shows colors in the console
      }));
    }
  });
};
