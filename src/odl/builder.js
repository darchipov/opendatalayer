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
  var output = '';
  for (const name in config.plugins || {}) {
    if (!config.hasOwnProperty(name)) {
      output += 'import ' + normalizePluginName(name) + ' from \'' + name + '\';\n';
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
  var output = 'var odl = odl.initialize({}, ODL_RULES, ODL_CONFIG, {}, ODL_MAPPINGS);';
  return output;
}

module.exports.buildPackage = function (config) {
  console.log('// TODO: concat and transpile ODL and plugins\n');
  console.log(generateES6ImportString(config));
  console.log(generateConfiguration(config.plugins));
  console.log(generateRuleset(config.plugins));
  console.log(generateMappings(config.plugins));
  console.log(generateODLInitialization());
  console.log('\n// TODO: write resulting file to output');
};
