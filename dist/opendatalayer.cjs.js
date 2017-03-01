/*
 * OpenDataLayer v0.0.4
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// we need this module to enable dependency injection in unit tests

// we need this module to enable dependency injection in unit tests
var console = (function () {
  if (window.console) {
    return window.console;
  }

  return {
    log: function log() {},
    warn: function warn() {},
    error: function error() {},

    isShim: true
  };
})();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * Logging module that uses `console.log` under the hood.
 * Log level can be altered via toggles.
 * TODO: implement remote logging and filtering by module name
 *
 * @module gk.lib
 * @class  Logger
 **/

var Logger = function () {

  /**
   * Constructor to create a Logger instance for the module you want to log in.
   *
   * @example
   *     var logger = new Logger('odl/lib/foo');
   *     logger.log('look at this', $el)
   *     // -> console.log('gk/lib/foo', 'look at this', $el)
   *
   * @constructor
   * @param  {String}  moduleName  AMD module name like 'gk/lib/foo'. This name must contain a slash.
   */
  function Logger(moduleName, logLevel) {
    classCallCheck(this, Logger);

    if (!moduleName) {
      throw new Error('no module name specified');
    }
    this.moduleName = moduleName;
    this.logLevel = logLevel;
    this._setAllowedMethods(logLevel);
  }

  /**
  * @param  {Object, ...} params   things to be logged
  */


  createClass(Logger, [{
    key: 'log',
    value: function log() {
      this._handle('log', arguments);
    }

    /**
    * @param  {Object, ...} params   things to be logged
    */

  }, {
    key: 'warn',
    value: function warn() {
      this._handle('warn', arguments);
    }

    /**
    * @param  {Object, ...} params   things to be logged
    */

  }, {
    key: 'error',
    value: function error() {
      this._handle('error', arguments);
    }
  }, {
    key: '_setAllowedMethods',
    value: function _setAllowedMethods(preference) {
      this.allowedMethods = {};
      var active = false;
      for (var level in ['log', 'warn', 'error']) {
        if (level === preference) {
          active = true;
        }
        this.allowedMethods[level] = active;
      }
    }
  }, {
    key: '_handle',
    value: function _handle(method, args) {
      if (typeof this.allowedMethods[method] === 'undefined') {
        return;
      }
      // convert arguments to array and prepend module name
      var list = Array.prototype.slice.call(args);
      if (this.moduleName) {
        list.splice(0, 0, this.moduleName);
      }
      // see http://tobyho.com/2012/07/27/taking-over-console-log/
      if (console[method].apply) {
        console[method].apply(console, list);
      } else {
        // special IE handling
        console[method](list.join(' '));
      }
    }
  }]);
  return Logger;
}();

/**
 * Very thin cookie-wrapper to ease testing, based on implementation by
 * Christophe Porteneuve (http://github.com/tdd/cookies-js-helper)
 */
/**
 * Set a cookie with the given name and options.
 */
function set$1(name, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var def = [name + '=' + value];
  if (options.path) {
    def.push('path=' + options.path);
  }
  if (options.maxAge) {
    def.push('max-age=' + options.maxAge);
  }
  if (options.domain) {
    def.push('domain=' + options.domain);
  }
  var expires = options.expires && typeof options.expires.getTime !== 'undefined' ? options.expires.toUTCString() : options.expires;
  if (expires) {
    def.push('expires=' + expires);
  }
  window.document.cookie = def.join(';');
  return def;
}

/**
 * Get the value of the cookie with the given name or empty string if
 * cookie is unset.
 */
function get$1(name) {
  var pairs = window.document.cookie.split(';');
  for (var i = 0; i < pairs.length; i += 1) {
    var pair = pairs[i].split('=', 2);
    if (pair[0] === name) {
      return pair[1];
    }
  }
  return '';
}

/**
 * Remove a cookie with given name and specific options (e.g. domain / path)
 */
function remove(name, options) {
  var opt2 = {};
  for (var key in options || {}) {
    opt2[key] = options[key];
  }opt2.expires = new Date(0).toUTCString();
  opt2.maxAge = -1;
  return set$1(name, null, opt2);
}

var cookie = {
  set: set$1,
  get: get$1,
  remove: remove
};

var logger$1 = new Logger('odl/lib/utils');

// extend object with other object
function extend(obj1, obj2) {
  var keys = Object.keys(obj2);
  for (var i = 0; i < keys.length; i += 1) {
    var val = obj2[keys[i]];
    obj1[keys[i]] = ['string', 'number', 'boolean'].indexOf(typeof val === 'undefined' ? 'undefined' : _typeof(val)) === -1 && typeof val.length === 'undefined' ? extend(obj1[keys[i]] || {}, val) : val;
  }
  return obj1;
}

/**
 * Scan a given node (or the entire DOM) for metatags containing stringified JSON
 * and return the parsed and aggregated object. Returns false and logs an error message, if
 * any error occured (@TODO: use Promise return instead).
 *
 * @param {Object}  name  name value of the metatag to be collected
 * @param {Function}  callback  function to be called for each metadata item (gets passed (optional) error message, element and parsed data object as arguments)
 * @param {String|HTMLElement}  context  (optional) any CSS selector or HTMLElement, if defined it limits the lookup context to the given element
 * @param {Object}  data  initial data, gets extended with the collected data
 */
function collectMetadata(name, callback) {
  var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  // get parent element to be queried (or use entire document as default)
  var parent = window.document;
  if (context) {
    parent = typeof context === 'string' ? window.document.querySelector(context) : context;
    if (!parent) {
      logger$1.error('collectMetadata: context with selector "' + context + '" not found');
      return false;
    }
  }
  // collect metatags and build up data
  var metatags = parent.querySelectorAll('meta[name="' + name + '"]');
  if (metatags) {
    for (var i = 0; i < metatags.length; i += 1) {
      var el = metatags[i];
      var o = null;
      try {
        o = JSON.parse(el.getAttribute('content'));
      } catch (e) {
        callback('collectMetadata: parse error ' + e.message + ': ' + e);
        break;
      }
      extend(data, o);
      callback(null, el, o);
    }
  }
  return data;
}

/**
 * Create a method queue handler within the provided target object. It can be used to
 * communicate with the provided API without the need to directly access the module.
 *
 * @param context     {Object}  object scope in which to create handler (e.g. window)
 * @param queueName   {String}  identifier to use as method queue name (e.g. "_odlq")
 * @param apiObj      {Object}  object scope to use for calling the provided methods on
 */
function createMethodQueueHandler(context, queueName) {
  var api = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  function _mqExec(_api, _arr) {
    if (typeof _api[_arr[0]] === 'function') {
      _api[_arr[0]].apply(_api, _arr.splice(1));
    } else {
      throw new Error('method "' + _arr[0] + '" not found in ' + _api);
    }
  }
  // define or get the method queue array
  var mq = typeof context[queueName] !== 'undefined' ? context[queueName] : [];
  // execute pending calls
  while (mq.length) {
    _mqExec(api, mq.shift());
  }
  // override push method
  mq.push = function (arr) {
    _mqExec(api, arr);
  };
}

// public API
var utils = {
  extend: extend,
  collectMetadata: collectMetadata,
  createMethodQueueHandler: createMethodQueueHandler
};

var logger = new Logger('odl/ODL');

/**
 * The global ODL (open data layer) class, gets instantiated as singleton.
 * The open data layer is responsible for aggregating and providing data.
 * The data is passed to available plugins which can feed it to external and/or
 * third-party plugins.
 */

var ODL = function () {
  function ODL() {
    classCallCheck(this, ODL);

    // module globals
    this.metaPrefix = 'odl:'; // prefix for metatags attributes
    this.broadcastQueue = []; // queue with things that happen before initialize is called
    this.pluginQueue = []; // queue with plugins that are requested before initialize is called
    this.plugins = {}; // map with loaded plugin plugins
    this.modules = {}; // map with module handles
    this.globalData = {}; // data storage
    this.globalConfig = {}; // configuration object (passed via odl:config)
    this.initialized = false; // initialized flag (true, if core initialization is done)
    this.ready = false; // ready flag (true, if all plugins are loaded)
    this.testModeActive = this.isTestModeActive();
    logger.log('testmode', this.testModeActive);
  }

  /**
   * Handle and (un-/)persist test mode for plugin delivery.
   */


  createClass(ODL, [{
    key: 'isTestModeActive',
    value: function isTestModeActive() {
      if (cookie.get('__odltest__')) {
        if (window.location.search.match(/__odltest__=0/gi)) {
          cookie.remove('__odltest__', { path: '/' });
          return false;
        }
        return true;
      } else if (window.location.search.match(/__odltest__=1/gi)) {
        cookie.set('__odltest__', '1', { path: '/', maxAge: 3600 * 24 * 7 });
        return true;
      }
      return false;
    }

    /**
     * Send event to the given plugin.
     * @param  {String|Object}  name  the event name/type to be fired
     *          (e.g. 'load', addtocart', 'click', 'view') OR an object with all three parameters
     * @param  {Object}  data  the event data to pass along with the event,
     *          may be any type of data (not necessarily an object literal)
     * @param  {String}  domain  name of the domain broadcasting the event
     */

  }, {
    key: 'sendEventToPlugin',
    value: function sendEventToPlugin(plugin, name, data) {
      var payload = data || {};
      if (plugin && typeof plugin.handleEvent === 'function') {
        // @FIXME: it is bad practice to keep these two ways of event definition. Should be refactored.
        if (arguments.length === 2 && typeof name !== 'string') {
          logger.log('broadcasting \'' + name.name + '\' from \'' + name.domain + '\' to plugin \'' + plugin + '\'', plugin, payload);
          plugin.handleEvent(name.name, name.data || {}, name.domain || '');
        } else {
          logger.log('broadcasting \'' + name + '\' to plugin \'' + plugin + '\'', plugin, payload);
          plugin.handleEvent(name, payload);
        }
      }
      // FIXME: throw error
    }

    /**
     * Collect identity data (session, browser) from platform cookies and return
     * true or false depending on success reading cookies.
     */

  }, {
    key: 'collectIdentityDataFromCookies',
    value: function collectIdentityDataFromCookies() {
      if (!cookie.get('bid')) {
        logger.warn('unable to read identity cookies');
      }
      this.globalData.identity = {
        bid: cookie.get('bid')
      };
      return true;
    }

    /**
     * Validate the given load rule and return either true or false.
     * @param  {Object|boolean}  rule  rule object to validate or a boolean value
     */

  }, {
    key: 'validateRule',
    value: function validateRule(rule) {
      if (typeof rule === 'boolean') {
        return rule;
      } else if (typeof rule === 'function') {
        var r = rule(this.globalData);
        return r; // rule(globalData);
      } else if (!rule.test || rule.test === true && this.testModeActive) {
        return rule.rule(this.globalData);
      }
      return false;
    }

    /**
     * Returns the global data that was collected and aggregated from the entire page.
     */

  }, {
    key: 'getData',
    value: function getData() {
      return this.globalData;
    }

    /**
     * Wrapper for the previous AMD-based loader. Simply imitates an asynchronous process
     * here. @TODO: plugin "loading" needs a general rewrite.
     * @param  {String}  id     the id of the requested plugin
     * @param  {Function}  callback   a function to execute when the plugin is loaded (gets plugin object as only parameter)
     */

  }, {
    key: 'loadPlugin',
    value: function loadPlugin(id, callback) {
      callback(this.mappings[id]);
    }

    /**
     * Returns a reference to a specific plugin or null if the plugin doesn't exist.
     * @param  {String}  pluginId     the id of the requested plugin
     * @param  {Function}  callback   (optional) a function to call when the plugin is loaded (gets plugin object as only parameter)
     */

  }, {
    key: 'getPlugin',
    value: function getPlugin(pluginId, callback) {
      var _this = this;

      if (this.initialized === false) {
        logger.log('plugin \'' + pluginId + '\' queued, ODL not initialized yet');
        // if ODL not ready yet, store request
        this.pluginQueue.push({ id: pluginId, callback: callback });
      } else if (this.plugins[pluginId]) {
        logger.log('plugin \'' + pluginId + '\' already available');
        // if already loaded simply fire callback
        if (typeof callback === 'function') {
          callback(this.plugins[pluginId]);
        }
        return this.plugins[pluginId];
      } else {
        // initialize plugin to null so we know it's loading (@FIXME: use object with status property in plugins)
        this.plugins[pluginId] = null;
        this.loadPlugin(pluginId, function (Plugin) {
          logger.log('plugin \'' + pluginId + '\' newly loaded');
          // if not loaded in the meantime: construct plugin, pass data/config, store reference
          if (!_this.plugins[pluginId]) {
            _this.plugins[pluginId] = new Plugin(_this, _this.globalData, _this.globalConfig[pluginId] || {});
            // broadcast any events that happened until now
            /* @ TODO: for (const msg of broadcastQueue) { */
            var keys = Object.keys(_this.broadcastQueue);
            for (var i = 0; i < keys.length; i += 1) {
              var msg = _this.broadcastQueue[keys[i]];
              logger.log('re-broadcasting event \'' + msg + '\' to plugin \'' + pluginId + '\'');
              if (msg instanceof Array) {
                _this.sendEventToPlugin(_this.plugins[pluginId], msg[0], msg[1], msg[2]);
              } else {
                _this.sendEventToPlugin(_this.plugins[pluginId], msg);
              }
            }
          }
          // notify load handler if defined
          if (typeof callback === 'function') {
            callback(_this.plugins[pluginId]);
          }
        });
      }
      return false;
    }

    /**
     * Checks whether the plugin with the given id is either loaded or queued.
     * @param  {String} id  plugin name (e.g. 'gk/lib/odl/econda') to check for
     */

  }, {
    key: 'hasPlugin',
    value: function hasPlugin(id) {
      if (typeof this.plugins[id] !== 'undefined') {
        return true;
      }
      /* @TODO: for (const s of pluginQueue) { */
      var keys = Object.keys(this.pluginQueue);
      for (var i = 0; i < keys.length; i += 1) {
        var s = this.pluginQueue[keys[i]];
        if (s.id === id) {
          return true;
        }
      }
      return false;
    }

    /**
     * Load a given list with plugins. Includes the plugins using require calls and
     * initializes them, passing in the global ODL data to the constructor.
     * @param  {Array<String>} ids  list with plugin/plugin names (e.g. 'gk/lib/odl/econda')
     * @param  {Function}  callback  a callback to be fired when ALL requested plugins have loaded
     */

  }, {
    key: 'loadPlugins',
    value: function loadPlugins(ids, callback) {
      var pending = ids.length;
      // count down and notify callback if all plugins are loaded
      var onPluginLoaded = function onPluginLoaded() {
        pending -= 1;
        if (pending === 0 && typeof callback === 'function') {
          callback();
        }
      };
      /* @TODO: for (const id of ids) { */
      var keys = Object.keys(ids);
      for (var i = 0; i < keys.length; i += 1) {
        var id = ids[keys[i]];
        logger.log('loading \'' + id + '\'');
        this.getPlugin(id, onPluginLoaded);
      }
    }

    /**
     * Broadcast a public event to all loaded plugins. You can either pass name,
     * data and domain as individual arguments or you can pass a single object (e.g.
     * {name: 'event', data: {foo: 'bar'}, domain: 'fint'}) as the only argument. Both will
     * have the same result.
     * @param  {String|Object}  name  the event name/type to be fired (e.g. 'load',
     *          addtocart', 'click', 'view') OR an object with all three parameters
     * @param  {Object}  data  the event data to pass along with the event, may be any type
     *          of data (not necessarily an object literal)
     */

  }, {
    key: 'broadcast',
    value: function broadcast(name, data) {
      var keys = Object.keys(this.plugins);
      for (var i = 0; i < keys.length; i += 1) {
        this.sendEventToPlugin(this.plugins[keys[i]], name, data);
      }
      logger.log('queuing broadcast', name, data);
      this.broadcastQueue.push([name, data]);
    }

    /**
     * Scan a given HTMLElement for odl:data-Metatags and update global data accordingly.
     *
     * @param {String|HTMLElement}  node  DOM node or CSS selector to scan for data
     */

  }, {
    key: 'scanForDataMarkup',
    value: function scanForDataMarkup() {
      var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.document;

      return utils.collectMetadata(this.metaPrefix + 'data', function () {}, node, this.globalData);
    }

    /**
     * Scan a given HTMLElement for odl:event-Metatags and broadcast any events that
     * were found.
     *
     * @param {String|HTMLElement}  node  DOM node or CSS selector to scan for events
     */

  }, {
    key: 'scanForEventMarkup',
    value: function scanForEventMarkup(node) {
      var _this2 = this;

      return utils.collectMetadata(this.metaPrefix + 'event', function (err, element, obj) {
        if (err) {
          logger.error(err);
          return;
        }
        if (!element.hasAttribute('data-odl-handled-event')) {
          element.setAttribute('data-odl-handled-event', 1);
          _this2.broadcast(obj.name, obj.data);
        }
      }, node);
    }

    /**
     * Main initialization code. Loads global and local plugins.
     *
     * The function takes a second parameter that allows paasing in a custom
     * configuration, as demonstrated in the following example:
     *
     * 1) supply custom plugin list (used for unit testing)
     * ODL.initialize({}, {gk/lib/odl/econda':true})
     *
     * 2) supply configuration for specific plugins
     * ODL.initialize({}, {}, {'gk/lib/odl/richrelevance': {'baseUrl':'/some/foo/bar'}})
     * @param  {Object}  data  the global data as aggregated from all odl:data tags
     * @param  {Object}  ruleset   ruleset declaration supplying decision logic when to load which plugins
     * @param  {Object}  config  (optional) configuration object containing per-plugin config
     *          that gets passed to the initialize call of the corresponding plugin. See header docs for more info.
     * @param  {Array<String>} localPlugins (optional) list with plugins to be loaded (including path)
     * @param  {Object} mappings (optional) object literal with name->instance mappings for plugin modules
     */

  }, {
    key: 'initialize',
    value: function initialize(data, ruleset, config) {
      var _this3 = this;

      var localPlugins = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var mappings = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      var pluginsToLoad = [];
      if (this.initialized) {
        logger.warn('already initialized');
        return false;
      }
      this.mappings = mappings;
      // this.globalData = data || null;
      this.globalConfig = config || {};
      // collect global data from document
      this.globalData = data;
      this.scanForDataMarkup(window.document);
      // validate mandatory data
      if (data === null || typeof data === 'undefined') {
        throw new Error('No ODLGlobalData supplied');
      }
      if (!data.page || !data.page.type || !data.page.name) {
        throw new Error('Supplied ODLPageData is invalid or missing');
      }
      if (!data.site || !data.site.id) {
        throw new Error('Supplied ODLSiteData is invalid or missing');
      }
      if (!data.user) {
        throw new Error('Supplied ODLUserData is invalid or missing');
      }
      // read identity data
      this.collectIdentityDataFromCookies();
      logger.log('collected data', this.globalData);
      // core initialization is ready
      this.initialized = true;
      // broadcast 'initialize' event
      logger.log('broadcasting initialize event', this.broadcast('initialize', this.globalData));
      // check which plugins to load based on supplied ruleset
      if (ruleset) {
        // @TODO: for (const [name, rule] of ruleset) {
        var keys = Object.keys(ruleset);
        for (var i = 0; i < keys.length; i += 1) {
          if (this.validateRule(ruleset[keys[i]])) {
            pluginsToLoad.push(keys[i]);
          }
        }
      }
      // override plugins with config.plugins, if defined
      logger.log('init global plugins', pluginsToLoad);
      if (config && typeof config.plugins !== 'undefined') {
        logger.log('overriding global plugins with config.plugins', config.plugins);
        pluginsToLoad = config.plugins;
      }
      // load plugins
      this.loadPlugins(pluginsToLoad, function () {
        // answer all pending getPlugin calls
        /* @TODO for (const plugin of pluginQueue) { */
        var keys = Object.keys(_this3.pluginQueue);
        for (var _i = 0; _i < keys.length; _i += 1) {
          var plugin = _this3.pluginQueue[keys[_i]];
          _this3.getPlugin(plugin.id, plugin.callback);
        }
        // set global ODL-is-ready flag (used in tests)
        _this3.ready = true;
      });
      if (this.pluginQueue.length === 0) {
        this.ready = true;
      }
      // load locally defined plugins
      logger.log('init local plugins', localPlugins);
      this.loadPlugins(localPlugins || []);
      // collect event data from document and send events to plugins
      logger.log('scanning for ' + this.metaPrefix + 'event markup');
      this.scanForEventMarkup();
      // install method queue
      utils.createMethodQueueHandler(window, '_odlq', this);
      return true;
    }
  }, {
    key: 'inTestMode',
    value: function inTestMode() {
      return this.testModeActive === true;
    }
  }, {
    key: 'isReady',
    value: function isReady() {
      return this.ready === true;
    }
  }, {
    key: 'isInitialized',
    value: function isInitialized() {
      return this.initialized === true;
    }
  }]);
  return ODL;
}();

// create new ODL singleton instance


var odl = new ODL();

// XXX: store ODL reference in window (currently needed for functionally testing ODL plugins)
window._odl = odl;

/**
 * Append a given URL as new script tag to the document's HEAD
 *
 * @method addScript
 * @param  src   {String} URL of script to be added
 * @param  async {Boolean} set async attribute (yes/no)
 */
function addScript(src) {
  var async = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var scriptEl = window.document.createElement('script');
  scriptEl.type = 'text/javascript';
  if (async) {
    scriptEl.async = true;
  }
  scriptEl.src = src;
  var headEl = window.document.getElementsByTagName('HEAD')[0];
  headEl.appendChild(scriptEl);
  return scriptEl;
}

/**
 * Add a given HTML string to a given element.
 *
 * @method addHTML
 * @param  element   {HTMLElement|String} element to add HTML to or CSS selector of element
 * @param  html      {String}      HTML string to add
 * @param  position  {String}      position to add to, defaults to "beforeend"
 *          (see https://developer.mozilla.org/de/docs/Web/API/Element/insertAdjacentHTML)
 */
function addHTML(element, html) {
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'beforeend';

  var el = element;
  if (typeof el === 'string') {
    el = window.document.querySelector(element);
  }
  if (el) {
    el.insertAdjacentHTML(position, html);
    return el;
  }
  return false;
}

/**
 * Add a given HTML string to a given element.
 *
 * @method addHTML
 * @param   src     {String}  URL of image
 * @param   width   {int}     width of image (defaults to 1)
 * @param   height  {int}     height of image (defaults to 1)
 */
function addImage(src) {
  var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  return addHTML('body', '<img src="' + src + '" width="' + width + '" height="' + height + '" />');
}

var domHelper = { addScript: addScript, addHTML: addHTML, addImage: addImage };

exports.odl = odl;
exports.window = window;
exports.helpers = domHelper;
exports.utils = utils;
exports.Logger = Logger;
