import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import System from 'systemjs';
import './../../../systemjs.config';
import mockModule from './../../_mockModule';

describe('odl/lib/utils', () => {
  let [utils, elementSpy, windowSpy, loggerSpy] = [];

  sinon.log = message => console.log(message);

  beforeEach(() => {
    // spies
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
    // register mocks
    mockModule('odl/lib/globals/window', windowSpy);
    mockModule('odl/lib/logger', () => loggerSpy);
    // clear module first
    System.delete(System.normalizeSync('odl/lib/utils'));
    return System.import('odl/lib/utils').then((m) => {
      utils = m.default;
    });
  });

  describe('collectMetadata', () => {
    it('should query the global context for metatags with the given name', () => {
      utils.collectMetadata('odl:data', () => {});
      sinon.assert.calledWith(windowSpy.document.querySelectorAll, 'meta[name="odl:data"]');
    });

    it('should accept a different parent context as argument and collect metatags only within that element', () => {
      const contextSpy = { querySelectorAll: sinon.stub().returns([elementSpy]) };
      windowSpy.document.querySelector.returns(contextSpy);
      utils.collectMetadata('odl:data', () => {}, contextSpy);
      sinon.assert.calledWith(contextSpy.querySelectorAll, 'meta[name="odl:data"]');
    });

    it('should log an error and return false if context cannot be found', () => {
      windowSpy.document.querySelector.returns(null);
      assert.isFalse(utils.collectMetadata('odl:data', () => {}, 'notfound'));
      sinon.assert.calledWith(loggerSpy.error, sinon.match('collectMetadata: context with selector "notfound" not found'));
    });

    it('should fire a callback for each collected metatag and pass element and JSON.parse\'d content', () => {
      const data = [];
      elementSpy.getAttribute.returns('{"foo":"bar"}');
      utils.collectMetadata('odl:data', (err, element, content) => data.push(content));
      assert.deepEqual(data, [{ foo: 'bar' }, { foo: 'bar' }, { foo: 'bar' }]);
    });

    it('should fire a callback for each collected metatag and pass an error if JSON.parse failed', () => {
      elementSpy.getAttribute.returns('$this_is_no_json!!');
      utils.collectMetadata('odl:data', (err) => {
        assert.include(err, 'collectMetadata: parse error');
      });
    });

    it('should return an object with an aggregation of all provided metatags\' data', () => {
      const makeElement = (data) => {
        return {
          getAttribute: sinon.stub().returns(data),
          hasAttribute: sinon.stub().returns(true),
          setAttribute: sinon.spy(),
        };
      };
      const element1 = makeElement('{"string1":"hello","number1":42}');
      const element2 = makeElement('{"string2":"foo","number2":76}');
      const element3 = makeElement('{"string3":"bar","number3":777}');
      windowSpy.document.querySelectorAll.returns([element1, element2, element3]);
      assert.deepEqual(utils.collectMetadata('odl:data', () => {}), {
        string1: 'hello',
        string2: 'foo',
        string3: 'bar',
        number1: 42,
        number2: 76,
        number3: 777,
      });
    });
  });
  // TODO:
  // extend
  // parent context
});
