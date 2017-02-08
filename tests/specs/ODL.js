/* eslint max-len: ["warn", 200] */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import System from 'systemjs';
import './../../systemjs.config';
import mockModule from './../_mockModule';
import odlPluginMock from './../mocks/ODLPluginMock';

describe('odl/ODL', () => {
  let [elementSpy, windowSpy, cookieSpy, loggerSpy, utilsSpy, odlDataMock] = [];

  sinon.log = message => console.log(message);

  beforeEach(() => {
    // spies
    cookieSpy = { get: sinon.stub(), set: sinon.stub(), remove: sinon.stub() };
    elementSpy = {
      tagName: 'foo',
      getAttribute: sinon.stub(),
      setAttribute: sinon.spy(),
      hasAttribute: sinon.stub().returns(false),
    };
    windowSpy = {
      location: { search: '' },
      require: sinon.spy(),
      document: {
        querySelector: sinon.stub().returns(elementSpy),
        querySelectorAll: sinon.stub().returns([elementSpy, elementSpy, elementSpy]),
      },
    };
    loggerSpy = { log: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };
    utilsSpy = {
      collectMetadata: sinon.stub(),
      createMethodQueueHandler: sinon.spy(),
    };
    // create mocks
    odlDataMock = {
      page: { type: 'unittest', name: 'Testpage' },
      site: { id: 'jump_dev' },
      user: { id: null },
    };
    // register mocks
    mockModule('odl/lib/globals/window', windowSpy);
    mockModule('odl/lib/cookie', cookieSpy);
    mockModule('odl/lib/logger', () => loggerSpy);
    mockModule('odl/lib/utils', utilsSpy);
    mockModule('odl/plugins/mock', odlPluginMock);
    // clear module first
    System.delete(System.normalizeSync('odl/ODL'));
  });

  describe('loadtime', () => {
    describe('testmode', () => {
      it('should activate testmode if URL contains __odltest__=1', (done) => {
        windowSpy.location.search = '?__odltest__=1';
        System.import('odl/ODL').then((odl) => {
          odl.default.initialize(odlDataMock);
          assert.isTrue(odl.default.inTestMode(), 'odl.inTestMode should return true');
          done();
        }).catch(err => console.error(err));
      });

      it('should set "__odltest__" cookie if URL contains __odltest__=1', (done) => {
        windowSpy.location.search = '?__odltest__=1';
        System.import('odl/ODL').then((odl) => {
          odl.default.initialize(odlDataMock);
          sinon.assert.calledWith(cookieSpy.set, '__odltest__');
          done();
        }).catch(err => console.error(err));
      });

      it('should disable testmode and remove the "__odltest__" cookie if URL contains __odltest__=0', (done) => {
        windowSpy.location.search = '?__odltest__=0';
        cookieSpy.get.returns('1');
        System.import('odl/ODL').then((odl) => {
          odl.default.initialize(odlDataMock);
          sinon.assert.calledWith(cookieSpy.remove, '__odltest__');
          assert.isFalse(odl.default.inTestMode(), 'odl.inTestMode should return false');
          done();
        }).catch(err => console.error(err));
      });

      it('should load a supplied plugin, if: testmode is active, the mode evaluates to "test" and the rule evaluates to "true"', (done) => {
        windowSpy.location.search = '?__odltest__=1';
        System.import('odl/ODL').then((m) => {
          const odl = m.default;
          sinon.stub(odl, 'loadPlugin');
          odl.initialize(odlDataMock, { 'odl/plugins/mock': { test: true, rule: () => true } });
          sinon.assert.calledWith(odl.loadPlugin, 'odl/plugins/mock');
          odl.loadPlugin.restore();
          done();
        }).catch(err => console.error(err));
      });
    }); // testmode
  }); // loadtime

  describe('runtime', () => {
    let odl;

    beforeEach((done) => {
      System.import('odl/ODL').then((m) => {
        odl = m.default;
        done();
      }).catch(err => console.error(err));
    });

    describe('initialize', () => {
      it('should log warning and return false if already initialized', () => {
        odl.initialize(odlDataMock);
        assert.equal(odl.initialize(), false);
        sinon.assert.calledWith(loggerSpy.warn, sinon.match('already initialized'));
      });

      it('should throw error when data is missing', () => {
        const init = () => odl.initialize();
        assert.throw(init, Error, 'No ODLGlobalData supplied');
      });

      it('should throw error when data.page is missing', () => {
        delete odlDataMock.page;
        const init = () => odl.initialize(odlDataMock);
        assert.throw(init, Error, 'Supplied ODLPageData is invalid or missing');
      });

      it('should throw error when data.page is invalid', () => {
        odlDataMock.page = { foo: 'bar' };
        const init = () => odl.initialize(odlDataMock);
        assert.throw(init, Error, 'Supplied ODLPageData is invalid or missing');
      });

      it('should throw error when data.site is missing', () => {
        delete odlDataMock.site;
        const init = () => odl.initialize(odlDataMock);
        assert.throw(init, Error, 'Supplied ODLSiteData is invalid or missing');
      });

      it('should throw error when data.page is invalid', () => {
        odlDataMock.site = { foo: 'bar' };
        const init = () => odl.initialize(odlDataMock);
        assert.throw(init, Error, 'Supplied ODLSiteData is invalid or missing');
      });

      it('should throw error when data.user is missing', () => {
        delete odlDataMock.user;
        const init = () => odl.initialize(odlDataMock);
        assert.throw(init, Error, 'Supplied ODLUserData is invalid or missing');
      });

      it('should allow overriding plugins using config.plugins', () => {
        sinon.stub(odl, 'loadPlugin');
        odl.initialize(odlDataMock, { 'should/be/overridden': true }, { plugins: ['my/override'] });
        sinon.assert.calledWith(odl.loadPlugin, 'my/override');
        odl.loadPlugin.restore();
      });

      it('should accept a list of locally supplied plugins using a fourth parameter', () => {
        sinon.stub(odl, 'loadPlugin');
        odl.initialize(odlDataMock, {}, {}, ['local/plugin']);
        sinon.assert.calledWith(odl.loadPlugin, 'local/plugin');
        odl.loadPlugin.restore();
      });

      it('should create a method queue handler in window during odl.initialize', () => {
        odl.initialize(odlDataMock);
        sinon.assert.calledWith(utilsSpy.createMethodQueueHandler, windowSpy, '_odlq', odl);
      });
    });

    describe('rules', () => {
      beforeEach(() => {
        sinon.stub(odl, 'loadPlugin');
      });

      afterEach(() => {
        odl.loadPlugin.restore();
      });

      it('should load a supplied plugin, if the rule evaluates to "true"', () => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true });
        sinon.assert.calledWith(odl.loadPlugin, 'odl/plugins/mock');
      });

      it('should NOT load a supplied plugin, if the rule evaluates to "false"', () => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': false });
        sinon.assert.notCalled(odl.loadPlugin);
      });

      it('should load a supplied plugin, if the rule supplies a callback function which returns "true"', () => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': () => true });
        sinon.assert.calledWith(odl.loadPlugin, 'odl/plugins/mock');
      });

      it('should NOT load a supplied plugin, if the rule supplies a callback function which returns "false"', () => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': () => false });
        sinon.assert.notCalled(odl.loadPlugin);
      });

      /* XXX: assoc. positive case is in 'loadtime -> testmode' block, because it needs modified document.location before init */

      it('should NOT load a supplied plugin, if: testmode is NOT active, the mode evaluates to "test" and the rule evaluates to "true"', () => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': { test: true, rule: () => false } });
        sinon.assert.notCalled(odl.loadPlugin);
      });

      it('should hand over the current ODL data as first argument, if the rule supplies a callback function', (done) => {
        odl.initialize(odlDataMock, {
          'odl/plugins/mock': (data) => {
            assert.deepEqual(data, odlDataMock);
            done();
            return true;
          },
        });
      });
    });

    describe('getData', () => {
      it('should return the global data', () => {
        odl.initialize(odlDataMock, {}, { plugins: [] });
        const d = odl.getData();
        assert.equal(d, odlDataMock);
      });
    });

    describe('load/get plugins', () => {
      beforeEach(() => {
        // fake require call that always returns our ODLPluginMock
        windowSpy.require = (pluginId, callback) => { callback(odlPluginMock); };
      });

      it('should load a given plugin by its name [odl/plugins/mock]', (done) => {
        // init without plugins, then load plugin manually
        odl.initialize(odlDataMock, {}, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.loadPlugins(['odl/plugins/mock'], () => {
          assert.isObject(odl.getPlugin('odl/plugins/mock'));
          done();
        });
      });

      it('should notify a callback when a single plugin is available using getPlugin', (done) => {
        // init without plugins, load plugin manually
        odl.initialize(odlDataMock, {}, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.getPlugin('odl/plugins/mock', (plugin) => {
          sinon.assert.calledWith(loggerSpy.log, sinon.match('newly loaded'));
          assert.equal(plugin.__type__, 'Mock');
          done();
        });
      });

      it('should notify a callback when an already available plugin is requested using getPlugin', (done) => {
        // init with plugin, then try to load plugin manually
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true }, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.getPlugin('odl/plugins/mock', (plugin) => {
          sinon.assert.calledWith(loggerSpy.log, sinon.match('already available'));
          assert.equal(plugin.__type__, 'Mock');
          done();
        });
      });

      it('should set a ready flag once all plugins have been initialized', (done) => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true }, {}, [], { 'odl/plugins/mock': odlPluginMock });
        // poll until _odl.ready is set or timeout reached
        let tries = 10;
        function isODLReady() {
          if (odl.isReady()) {
            assert.isTrue(true);
            done();
          } else {
            tries -= 1;
            if (tries === 0) {
              assert.isTrue(false);
            } else {
              setTimeout(isODLReady, 250);
            }
          }
        }
        isODLReady();
      });

      it('should immediately set a ready flag if no plugins are set', () => {
        odl.initialize(odlDataMock, {});
        assert.isTrue(odl.isReady());
      });

      it('should pass a self-reference to its plugins', (done) => {
        odl.initialize(odlDataMock, {}, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.getPlugin('odl/plugins/mock', (plugin) => {
          assert.equal(plugin.odl, odl);
          done();
        });
      });
    });

    describe('hasPlugin', () => {
      it('should return true when the requested plugin is queued (i.e. before odl.initialize is called)', () => {
        odl.getPlugin('odl/plugins/mock');
        // sinon.assert.calledWith(loggerSpy.log, sinon.match('queued'));
        assert.isTrue(odl.hasPlugin('odl/plugins/mock'));
      });

      it('should return true when the requested plugin is loaded', () => {
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true }, {}, [], { 'odl/plugins/mock': odlPluginMock });
        assert.isTrue(odl.hasPlugin('odl/plugins/mock'));
      });

      it('should return false when the requested plugin is neither loaded nor queued', () => {
        assert.isFalse(odl.hasPlugin('idunnoknowwhatyamean'));
      });
    });

    describe('broadcast', () => {
      let mockPlugin;

      beforeEach((done) => {
        // init and pass in custom plugin mapping
        odl.initialize(odlDataMock, {}, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.getPlugin('odl/plugins/mock', () => {
          mockPlugin = odl.getPlugin('odl/plugins/mock');
          sinon.stub(mockPlugin, 'handleEvent');
          done();
        });
      });

      it('should broadcast a message when passing one parameter (event object)', () => {
        odl.broadcast({ name: 'testevent', data: { foo: 'bar' } });
        sinon.assert.calledWith(mockPlugin.handleEvent, sinon.match({ name: 'testevent', data: { foo: 'bar' } }));
      });

      it('should broadcast a message when passing two parameters (event name, data)', () => {
        odl.broadcast('testevent', { foo: 'bar' });
        sinon.assert.calledWith(mockPlugin.handleEvent, 'testevent', sinon.match({ foo: 'bar' }));
      });

      /* it('should throw an error when the broadcast data has a wrong format', () => { }); */
    });

    describe('queueing', () => {
      it('should queue a message that is sent BEFORE ODL.initialize and broadcast it later', (done) => {
        odl.broadcast('testevent', { foo: 'bar' });
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true }, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.getPlugin('odl/plugins/mock', (plugin) => {
          assert.deepEqual(plugin.getEvents('testevent'), { foo: 'bar' });
          done();
        });
      });

      it('should queue a message that is sent AFTER initialize and BEFORE plugin load and broadcast it later', (done) => {
        // artificially delay require calls
        windowSpy.require = (pluginId, callback) => setTimeout(() => callback(odlPluginMock), 250);
        // call initialize and broadcast event before plugin is loaded
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true }, {}, [], { 'odl/plugins/mock': odlPluginMock });
        odl.broadcast({ name: 'testevent', data: { foo: 'bar' } });
        odl.getPlugin('odl/plugins/mock', (plugin) => {
          assert.deepEqual(plugin.getEvents('testevent'), { foo: 'bar' });
          done();
        });
      });

      it('should queue a getPlugin call that is sent BEFORE ODL.initialize and process it later', (done) => {
        windowSpy.require = (pluginId, callback) => { callback(odlPluginMock); };
        odl.getPlugin('odl/plugins/mock', (plugin) => {
          assert.equal(plugin.__type__, 'Mock');
          done();
        });
        odl.initialize(odlDataMock, { 'odl/plugins/mock': true }, {}, [], { 'odl/plugins/mock': odlPluginMock });
      });
    });
  });
}); // odl/ODL
