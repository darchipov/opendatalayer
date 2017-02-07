import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import System from 'systemjs';
import './../../../systemjs.config';
import mockModule from './../../_mockModule';

describe('odl/lib/cookie', () => {
  let [cookieHelper, windowSpy] = [];

  beforeEach(() => {
    windowSpy = {
      bla: 'blubb',
      document: {
        cookie: 'foo=bar;test=3598235',
      },
    };
    // register mocks
    mockModule('odl/lib/globals/window', windowSpy);
    // clear domHelper first, then import
    System.delete(System.normalizeSync('odl/lib/cookie'));
    return System.import('odl/lib/cookie').then((m) => {
      cookieHelper = m.default;
    });
  });

  describe('get', () => {
    it('should get a cookie with a given name and return its value', () => {
      assert.equal(cookieHelper.get('foo'), 'bar');
      assert.equal(cookieHelper.get('test'), '3598235');
    });
  });

  describe('set', () => {
    it('should set a cookie with a given name to a given value', () => {
      windowSpy.document.cookie = '';
      cookieHelper.set('xyz', 'foofoofoo');
      assert.include(windowSpy.document.cookie, 'xyz=foofoofoo');
    });
  });

  describe('remove', () => {
    it('should remove a cookie with a given name', () => {
      cookieHelper.remove('foo');
      assert.include(windowSpy.document.cookie, 'foo=;');
    });
  });
});
