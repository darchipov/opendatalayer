import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import System from 'systemjs';
import './../../../systemjs.config';
import mockModule from './../../_mockModule';
import * as odlDataTypes from './../../mocks/odlDataTypes';

describe('odl/plugins/facebookWCA', () => {
  let [injector, window, odlApi, odlDataMock, odlConfigMock, Service, loggerSpy] = [];

  beforeEach((done) => {
    // mock data
    window = {
      document: {
        createElement() { return (() => ({ src: '' })); },
        getElementsByTagName() {
          return [{
            parentNode: {
              insertBefore() {},
            },
          }];
        },
      },
      _fbq: {
        push: sinon.spy(),
      },
    };
    odlApi = {};
    odlDataMock = odlDataTypes.getODLGlobalDataStub();
    odlConfigMock = {
      pixelId: '1234567890',
      currency: 'MY$',
    };
    // spies
    loggerSpy = { log: sinon.spy(), warn: sinon.spy() };
    // register mocks
    mockModule('odl/lib/globals/window', window);
    mockModule('odl/lib/logger', () => loggerSpy);
    // clear module first
    System.delete(System.normalizeSync('odl/plugins/facebookWCA'));
    System.import('odl/plugins/facebookWCA').then(m => {
      Service = m.default;
      done();
    }).catch(err => { console.error(err); });
  });

  it('should append the facebook pixel to the DOM', () => {
    new Service(odlApi, odlDataMock, odlConfigMock);
    assert.isDefined(window._fbq);
    assert.isTrue(window._fbq.loaded);
  }
  );
    // TODO: pixel is in the DOM?
    // ...

  it('should pass the correct account to FB', () => {
    new Service(odlApi, odlDataMock, odlConfigMock);
    sinon.assert.calledWith(window._fbq.push, ['addPixelId', odlConfigMock.pixelId]);
  }
  );

  it('should set the FB pixel as initialized', () => {
    new Service(odlApi, odlDataMock, odlConfigMock);
    sinon.assert.calledWith(window._fbq.push, ['track', 'PixelInitialized', {}]);
  }
  );

  it("should not send any product data when the pagetype isnt in ['productdetail','checkout-complete']", () => {
    odlDataMock.page.type = 'homepage';
    new Service(odlApi, odlDataMock, odlConfigMock);
    sinon.assert.calledWith(loggerSpy.log, sinon.match('not sending any product data'));
  }
  );

  it("should pass the product id when the pagetype is 'productdetail'", () => {
    odlDataMock.page.type = 'productdetail';
    odlDataMock.product = odlDataTypes.getODLProductDataStub();
    new Service(odlApi, odlDataMock, odlConfigMock);
    sinon.assert.calledWith(window._fbq.push, ['track', 'ViewContent', {
      content_type: 'product',
      content_ids: [odlDataMock.product.ean],
    }]);
  }
  );

  it("should pass all products' EANs and the total price when the pagetype is 'checkout-confirmation'", () => {
    odlDataMock.page.type = 'checkout-confirmation';
    let [p1, p2, p3] = [odlDataTypes.getODLProductDataStub(123), odlDataTypes.getODLProductDataStub(456), odlDataTypes.getODLProductDataStub(789)];
    odlDataMock.order = odlDataTypes.getODLOrderDataStub([p1, p2, p3]);
    new Service(odlApi, odlDataMock, odlConfigMock);
    sinon.assert.calledWith(window._fbq.push, ['track', 'Purchase', {
      content_type: 'product',
      content_ids: [p1.ean, p2.ean, p3.ean],
      currency: odlConfigMock.currency,
      value: odlDataMock.order.priceData.total,
    }]);
  }
  );

  it("should pass the product's EAN when an event 'addtocart' is broadcasted", () => {
    const p = odlDataTypes.getODLProductDataStub();
    const fb = new Service(odlApi, odlDataMock, odlConfigMock);
    fb.handleEvent('addtocart', { product: p });
    sinon.assert.calledWith(window._fbq.push, ['track', 'AddToCart', {
      content_type: 'product',
      content_ids: [p.ean],
    }]);
  });
});
