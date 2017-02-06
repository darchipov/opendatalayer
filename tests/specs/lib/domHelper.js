import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import System from 'systemjs';
import './../../../systemjs.config';
import mockModule from './../../_mockModule';

describe('odl/lib/domHelper', () => {
  let [domHelper, windowSpy, elementSpy] = [];

  beforeEach(() => {
    elementSpy = {
      appendChild: sinon.stub(),
    };
    windowSpy = {
      document: {
        createElement: (tagName) => {
          elementSpy.tagName = tagName;
          return elementSpy;
        },
        getElementsByTagName: sinon.stub().returns([elementSpy]),
        querySelector: sinon.stub().returns({ insertAdjacentHTML: () => '' }),
      },
    };
    // wrap spies around DOM mock
    sinon.spy(windowSpy.document, 'createElement');
    // register mocks
    mockModule('odl/lib/globals/window', windowSpy);
    // clear domHelper first, then import
    System.delete(System.normalizeSync('odl/lib/domHelper'));
    return System.import('odl/lib/domHelper').then((m) => {
      domHelper = m.default;
    });
  });

  describe('addScript', () => {
    it('should create a script tag with a given source and return the script element', () => {
      const el = domHelper.addScript('myTestURL.js');
      sinon.assert.calledWith(windowSpy.document.createElement, 'script');
      assert.equal(elementSpy.src, 'myTestURL.js');
      assert.equal(elementSpy.tagName, 'script');
    });

    it('should append a script tag with a given source', () => {
      domHelper.addScript('myTestURL.js');
      assert.equal(elementSpy.src, 'myTestURL.js');
      // assert.equal(domMock.createdEl, domMock.appendedEl);
    });

    it('should set the appended script tag as async if called without second argument', () => {
      domHelper.addScript('myTestURL.js');
      assert.isTrue(elementSpy.async);
    });

    it('should NOT set the appended script tag as async if called with false as second argument', () => {
      domHelper.addScript('myTestURL.js', false);
      assert.isUndefined(elementSpy.async);
    });
  });

  describe('addHTML', () => {
    it('should call insertAdjacentHTML on a given element, pass the supplied HTML and the correct position and return the element', () => {
      const myEl = { insertAdjacentHTML: sinon.stub() };
      const el = domHelper.addHTML(myEl, '<foo>bar</foo>');
      sinon.assert.calledWith(myEl.insertAdjacentHTML, 'beforeend', '<foo>bar</foo>');
      assert.equal(el, myEl);
    });

    it('should accept a string as first parameter and perform a querySelector call on it', () => {
      domHelper.addHTML('BODY', 'test');
      sinon.assert.calledWith(windowSpy.document.querySelector, 'BODY');
    });

    it('should return false if first element is falsy', () => {
      assert.isFalse(domHelper.addHTML(null, 'test'));
    });
  });

  describe('addImage', () => {
    // @FIXME: spying on internal methods not working :/
    /*
    it('should call addHTML with body, img[width=1,height=1], url if only URL is supplied', () => {
      sinon.spy(domHelper, 'addHTML');
      domHelper.addImage('someurl/foo/bar');
      sinon.assert.calledWith(domHelper.addHTML, 'body', '<img src="someurl/foo/bar" width="1" height="1" />');
      domHelper.addHTML.restore();
    });

    it('should call addHTML with body, img[width=42,height=42], url if URL and images sizes are supplied', () => {
      sinon.spy(domHelper, 'addHTML');
      domHelper.addImage('someurl/foo/bar');
      sinon.assert.calledWith(domHelper.addHTML, 'body', '<img src="someurl/foo/bar" width="42" height="42" />');
      domHelper.addHTML.restore();
    });
    */
  });
});
