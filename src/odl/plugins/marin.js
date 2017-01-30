import window from '../lib/globals/window';
import Logger from '../lib/logger';
import * as pixelHelper from '../lib/pixelHelper';

const logger = new Logger('odl/plugins/marin');

/**
 * Marin Conversion ODL plugin
 *
 * @module      odl.plugins.marin
 * @class       Marin
 * @implements  IODLPlugin
 */
export default class Marin {

  constructor(odl, data, config) {
    logger.log('initialize');

    window._mTrack = window._mTrack || [];
    window._mTrack.push(['activateAnonymizeIp']);
    window._mTrack.push(['trackPage']);

    // handle "conversion"
    if (data.page.type === 'checkout-confirmation' || data.page.type === 'newsletter-subscribed') {
      window._mTrack.push(['addTrans', {
        currency: 'EUR',
        items: [{
          convType: (data.order != null) ? 'order' : 'nl_lead',
          price: data.order ? data.order.priceData.total : '',
          orderId: data.order ? data.order.id : '',
        }],
      }]);
      window._mTrack.push(['processOrders']);
    }

    // send tracking request
    pixelHelper.addScript(`//tracker.marinsm.com/tracker/async/${config.accountId}.js`, false);
  }
}
