import console from './globals/console';

/**
 * Logging module that uses `console.log` under the hood.
 * Log level can be altered via toggles.
 * TODO: implement remote logging and filtering by module name
 *
 * @module gk.lib
 * @class  Logger
 **/
export default class Logger {

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
  constructor(moduleName, logLevel) {
    if (!moduleName) {
      throw new Error('no module name specified');
    }
    if (moduleName.indexOf('/') === -1) {
      throw new Error('module name must contain a slash, e.g. [odl/foo/bar]');
    }
    this.moduleName = moduleName;
    this.logLevel = logLevel;
    this._setAllowedMethods(logLevel);
  }

  /**
  * @param  {Object, ...} params   things to be logged
  */
  log() {
    this._handle('log', arguments);
  }

  /**
  * @param  {Object, ...} params   things to be logged
  */
  warn() {
    this._handle('warn', arguments);
  }

  /**
  * @param  {Object, ...} params   things to be logged
  */
  error() {
    this._handle('error', arguments);
  }

  _setAllowedMethods(preference) {
    this.allowedMethods = {};
    let active = false;
    for (let level in ['log', 'warn', 'error']) {
      if (level === preference) {
        active = true;
      }
      this.allowedMethods[level] = active;
    }
  }

  _handle(method, args) {
    if (typeof this.allowedMethods[method] === 'undefined') {
      return;
    }
    // convert arguments to array and prepend module name
    const list = Array.prototype.slice.call(args);
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
}