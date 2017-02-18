import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import System from 'systemjs';
import mockModule from 'systemjs-mock-module';
import './../../../systemjs.config';

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
    mockModule(System, 'odl/lib/globals/window', windowSpy);
    mockModule(System, 'odl/lib/logger', () => loggerSpy);
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

  describe('method queue', () => {
    let [contextObj, apiObj] = [];

    beforeEach(() => {
      contextObj = { _testq: [] };
      apiObj = {
        method1: sinon.spy(),
        method2: sinon.spy(),
      };
    });

    it('should recognize and execute methods that have been added BEFORE initialization', () => {
      contextObj._testq.push(['method1', 123, 'foo']);
      contextObj._testq.push(['method2', { data: 'test' }]);
      utils.createMethodQueueHandler(contextObj, '_testq', apiObj);
      sinon.assert.calledWith(apiObj.method1, 123, 'foo');
      sinon.assert.calledWith(apiObj.method2, { data: 'test' });
    });

    it('should recognize and execute methods that have been added AFTER initialization', () => {
      utils.createMethodQueueHandler(contextObj, '_testq', apiObj);
      contextObj._testq.push(['method1', 123, 'foo']);
      contextObj._testq.push(['method2', { data: 'test' }]);
      sinon.assert.calledWith(apiObj.method1, 123, 'foo');
      sinon.assert.calledWith(apiObj.method2, { data: 'test' });
    });

    it('should throw an error on methods that are not available in API object', () => {
      utils.createMethodQueueHandler(contextObj, '_testq', apiObj);
      assert.throw(() => {
        contextObj._testq.push(['kaboom', 'bazinga!']);
      }, 'method "kaboom" not found');
    });
  });

  describe('extend', () => {
    it('should extend a given flat object with another flat object', () => {
      const obj1 = {
        prop1: 'val1',
        prop2: 42,
        prop3: true,
        prop4: 20.16,
      };
      const obj2 = {
        prop4: 77.123,
        propNew1: 'newVal1',
        propNew2: 71,
      };
      assert.deepEqual(utils.extend(obj1, obj2), {
        prop1: 'val1',
        prop2: 42,
        prop3: true,
        prop4: 77.123,
        propNew1: 'newVal1',
        propNew2: 71,
      });
    });

    it('should deep-extend a given flat object with a nested object', () => {
      const obj1 = {
        prop1: 'val1',
        prop2: 'val2',
      };
      const obj2 = {
        propNew1: 'newVal1',
        propNew2: {
          propNewDeep1: 'newDeepVal1',
          propNewDeep2: 42,
          propNewDeep3: true,
          propNewDeep4: 20.16,
        },
        propArray: [
          1, 2, 3, 4,
        ],
      };
      assert.deepEqual(utils.extend(obj1, obj2), {
        prop1: 'val1',
        prop2: 'val2',
        propNew1: 'newVal1',
        propNew2: {
          propNewDeep1: 'newDeepVal1',
          propNewDeep2: 42,
          propNewDeep3: true,
          propNewDeep4: 20.16,
        },
        propArray: [
          1, 2, 3, 4,
        ],
      });
    });

    it('should deep-extend a given nested object with another nested object and deep-overwrite members', () => {
      const obj1 = {
        prop1: 'val1',
        prop2: {
          propDeep1: 'deepVal1',
          propDeep2: 42,
          propDeep3: true,
          propDeep4: {
            propDeeper1: 'deeperVal1',
            propDeeper2: 777,
            propDeeper3: 'I will survive',
            propDeepArray: [],
            propDeepArrayWithObjectMembers: [
              { foo: 'bar' },
            ],
          },
        },
        prop3: 'lone survivor',
      };
      const obj2 = {
        prop1: 'newVal1',
        prop2: {
          propDeep1: 'newDeepVal1',
          propDeep2: 84,
          propDeep3: false,
          propDeep4: {
            propDeeper1: 'newDeeperVal1',
            propDeeper2: 888,
            propDeepArrayWithObjectMembers: [
              { foo2: 'bar2' },
            ],
          },
        },
      };
      assert.deepEqual(utils.extend(obj1, obj2), {
        prop1: 'newVal1',
        prop2: {
          propDeep1: 'newDeepVal1',
          propDeep2: 84,
          propDeep3: false,
          propDeep4: {
            propDeeper1: 'newDeeperVal1',
            propDeeper2: 888,
            propDeeper3: 'I will survive',
            propDeepArray: [],
            propDeepArrayWithObjectMembers: [
              { foo2: 'bar2' },
            ],
          },
        },
        prop3: 'lone survivor',
      });
    });
  });

  // parent context
});
