import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import System from 'systemjs';
import '../../../systemjs.config';
import mockModule from './../../_mockModule';
import * as odlDataTypes from './../../mocks/odlDataTypes';

describe('odl/plugins/marin', () => {
  let [window, odlApi, odlDataMock, odlConfigMock, Service, domHelperApi, loggerSpy] = [];

  beforeEach((done) => {
    window = { _mTrack: [] };
    window._mTrack.push = sinon.spy();
    odlApi = {};
    odlDataMock = odlDataTypes.getODLGlobalDataStub();
    odlConfigMock = { accountId: 'bla1234' };
    domHelperApi = { addScript: sinon.stub() };
    loggerSpy = { log: sinon.spy(), warn: sinon.spy() };
    // register mocks
    mockModule('odl/lib/globals/window', window);
    mockModule('odl/lib/logger', () => loggerSpy);
    mockModule('odl/lib/domHelper', domHelperApi);
    // clear module first
    System.delete(System.normalizeSync('odl/plugins/marin'));
    System.import('odl/plugins/marin').then(m => {
      Service = m.default;
      done();
    }).catch(err => { console.error(err); });
  });

  it('should define the global _mTrack', () => {
    new Service(odlApi, odlDataMock, odlConfigMock);
    assert.isDefined(window._mTrack);
    return assert.isArray(window._mTrack);
  });

  it('should append the marin pixel to the DOM', () => {
    new Service(odlApi, odlDataMock, odlConfigMock);
    return sinon.assert.calledWith(domHelperApi.addScript, `//tracker.marinsm.com/tracker/async/${odlConfigMock.accountId}.js`);
  });

  it("should add the common 'anonymizeIp' flags for any pagetype", () => {
    new Service(odlApi, odlDataMock, odlConfigMock);
    return sinon.assert.calledWith(window._mTrack.push, ['activateAnonymizeIp']);
  });

  it("should add the common 'trackPage' flags for any pagetype", () => {
    ['homepage', 'category', 'search', 'productdetail', 'checkout-cart'].map((type) => {
      odlDataMock.page.type = type;
      new Service(odlApi, odlDataMock, odlConfigMock);
      sinon.assert.calledWith(window._mTrack.push, ['activateAnonymizeIp']);
    });
  });

  it("should add the 'processOrders' flag for pageType 'checkout-confirmation'", () => {
    odlDataMock.page.type = 'checkout-confirmation';
    odlDataMock.order = odlDataTypes.getODLOrderDataStub();
    new Service(odlApi, odlDataMock, odlConfigMock);
    return sinon.assert.calledWith(window._mTrack.push, ['processOrders']);
  });

  it("should add the 'addTrans' data with convType 'order' for pageType 'checkout-confirmation'", () => {
    odlDataMock.page.type = 'checkout-confirmation';
    odlDataMock.order = odlDataTypes.getODLOrderDataStub();
    new Service(odlApi, odlDataMock, odlConfigMock);
    return sinon.assert.calledWith(window._mTrack.push, ['addTrans', {
      currency: 'EUR',
      items: [{
        convType: 'order',
        price: odlDataMock.order.priceData.total,
        orderId: odlDataMock.order.id,
      }],
    }]);
  });

  return it("should add the 'addTrans' data with convType 'nl_lead' for pageType 'newsletter-confirm'", () => {
    odlDataMock.page.type = 'newsletter-subscribed';
    new Service(odlApi, odlDataMock, odlConfigMock);
    return sinon.assert.calledWith(window._mTrack.push, ['addTrans', {
      currency: 'EUR',
      items: [{
        convType: 'nl_lead',
        price: '',
        orderId: '',
      }],
    }]);
  });
});
