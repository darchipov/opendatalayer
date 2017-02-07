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
        cookie: '',
      },
    };
    // register mocks
    mockModule('odl/lib/globals/window', windowSpy);
    System.delete(System.normalizeSync('odl/lib/cookie'));
    return System.import('odl/lib/cookie').then((m) => {
      cookieHelper = m.default;
    });
  });

  describe('get', () => {
    it('should get a cookie with a given name and return its value', () => {
      windowSpy.document.cookie = 'foo=bar;test=3598235';
      assert.equal(cookieHelper.get('foo'), 'bar');
      assert.equal(cookieHelper.get('test'), '3598235');
    });
  });

  describe('set', () => {
    it('should set a cookie with a given name to a given value', () => {
      cookieHelper.set('xyz', 'foofoofoo');
      assert.include(windowSpy.document.cookie, 'xyz=foofoofoo');
    });

    it('should restrict a cookie to a given path using options.path', () => {
      cookieHelper.set('xyz', 'foofoofoo', { path: '/' });
      assert.include(windowSpy.document.cookie, 'xyz=foofoofoo;path=/');
    });

    it('should restrict a cookie to a given domain using options.domain', () => {
      cookieHelper.set('xyz', 'foofoofoo', { domain: 'foo.bar.com' });
      assert.include(windowSpy.document.cookie, 'xyz=foofoofoo;domain=foo.bar.com');
    });

    it('should set the max-age of a cookie using options.maxAge', () => {
      cookieHelper.set('xyz', 'foofoofoo', { maxAge: 123456 });
      assert.include(windowSpy.document.cookie, 'xyz=foofoofoo;max-age=123456');
    });

    it('should set the expiry date of a cookie using options.expires', () => {
      cookieHelper.set('xyz', 'foofoofoo', { expires: '2016-12-22T00:00:00' });
      assert.include(windowSpy.document.cookie, 'xyz=foofoofoo;expires=2016-12-22T00:00:00');
    });
  });

  describe('remove', () => {
    it('should remove a cookie with a given name', () => {
      windowSpy.document.cookie = 'foo=bar;';
      cookieHelper.remove('foo');
      assert.include(windowSpy.document.cookie, 'foo=null;');
    });
  });
});
