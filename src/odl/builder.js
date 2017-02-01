/**
 * Normalize a module name to an identifier that can be used as variable name.
 * Example: "foo/bar/example" would become "foo_bar_example"
 */
function normalizePluginName (moduleName) {
  return moduleName.replace(/\//g, '_');
}

/**
 * Generate a string with ES6 import statements based on the given configuration
 * @return {String}
 */
function generateES6ImportString(config) {
  let output = '';
  for (const name in config.plugins || {}) {
    if (!config.hasOwnProperty(name)) {
      output += `import ${normalizePluginName(name)} from '${name}';\n`;
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
  let output = 'var ODL_CONFIG = {\n';
  for (const name in plugins || {}) {
    if (plugins.hasOwnProperty(name)) {
      const entry = plugins[name];
      output += `  '${name}': ${JSON.stringify(entry.config)},\n`;
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
  let output = 'var ODL_RULES = {\n';
  for (const name in plugins || {}) {
    if (plugins.hasOwnProperty(name)) {
      const entry = plugins[name];
      output += `  '${name}': ${entry.rule},\n`;
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
  let output = 'var ODL_MAPPINGS = {\n';
  for (const name in plugins || {}) {
    if (plugins.hasOwnProperty(name)) {
      output += `  '${name}': ${normalizePluginName(name)},\n`;
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
  let output = 'var odl = odl.initialize({}, ODL_RULES, ODL_CONFIG, {}, ODL_MAPPINGS);';
  return output;
}

function buildPackage(config) {
  // create configuration module for ODL
  // ...
  // fire up systemjs and build package
  /*console.log('Building modules: ', modules);
  const builder = new SystemJSBuilder();
  builder.loadConfigSync('./systemjs.config.js');
  return builder.buildStatic(
    modules.join(' '),
    `${config.outputPath}/odl.js`,
    systemjsBuilderConf);*/
}

// buildPackage(demoConfig);

// MAIN APPLICATION LOGIC

// TEST: example ODL builder configuration for testing
const demoConfig = {
  outputPath: 'build',
  plugins: {
    'odl/plugins/ga': {
      config: {
        gaProdId: 'UA-123456',
      },
      rule: true,
    },
    'odl/plugins/marin': {
      config: {
        accountId: 'abc-1234abcd',
      },
      rule: '(data) => data.page.type === \'homepage\'',
    },
  },
};

console.log(generateES6ImportString(demoConfig));
console.log(generateConfiguration(demoConfig.plugins));
console.log(generateRuleset(demoConfig.plugins));
console.log(generateMappings(demoConfig.plugins));
console.log(generateODLInitialization());
