// we need this module to enable dependency injection in unit tests
import window from './window';

export default (function () {
  if (window.console) {
    return window.console;
  }

  return {
    log() {},
    warn() {},
    error() {},
    isShim: true,
  };
}());
