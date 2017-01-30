/**
 * This module contains helpers to generate spec-compliant stub data for testing ODL features.
 * The general idea is to encapsulate all stub data in one place and reuse it in multiple tests.
 */

/**
 * Seedable random function to aid in generating reproducable, yet randomized, stub data.
 * (Avoid the value 10000 and any multiples of Math.PI as seeds). See
 * http://stackoverflow.com/questions/521295/javascript-random-seeds for details.
 */
function _random(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Returns a mock object for global data (site/page/user/*), based on ODLGlobalData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlglobaldata
 *
 * @method  getODLGlobalDataStub
 * @param   pageType  {String}  (optional) to easily set page type
 * @param   pageName  {String}  (optional) to easily set page name
 * @param   loggedIn  {Boolean}  (optional) set user as logged in (and set user.id), defaults to false
 * @return  {ODLGlobalData}  a global data object
 */
export function getODLGlobalDataStub(pageType, pageName, loggedIn) {
  return {
    site: {
      id: 'jump_dev',
    },
    page: {
      type: typeof pageType === 'undefined' ? 'test' : pageType,
      name: typeof pageName === 'undefined' ? 'Test' : pageName,
    },
    user: null,
  };
}

/**
 * Returns a mock object for brand data, based on ODLBrandData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlbranddata
 *
 * @method  getODLBrandDataStub
 * @return  {ODLBrandData}  a brand data object
 */
export function getODLBrandDataStub() {
  return {
    name: 'Grand Shizzle Shoes',
    brandKey: '8821',
    lineKey: '12345',
  };
}

/**
 * Returns a mock object for search data, based on ODLSearchData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlsearchdata
 *
 * @method  getODLSearchDataStub
 * @return  {ODLSearchData}  a search data object
 */
export function getODLSearchDataStub() {
  return {
    query: 'white socks',
    numHits: 4,
    productIds: [123, 456, 789, 101],
    variantIds: [1123, 1456, 1789, 1012],
    aonrs: [122334400, 122334411, 122334422, 122334433, 122334444, 122334455, 122334466, 122334477, 122334488, 122334499],
    eans: [4123123123, 4456456456, 4789789789, 4012012012, 4123123124, 4456456455, 4789789786, 4012012017, 4123123128, 4456456459],
  };
}

/**
 * Returns a mock object for category data, based on ODLCategoryData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlcategorydata
 *
 * @method  getODLCategoryDataStub
 * @return  {ODLCategoryData}  a category data object
 */
export function getODLCategoryDataStub() {
  return {
    id: '/damen/bekleidung/jeans',
    name: 'Jeans',
    productIds: [123, 456, 789, 101],
    variantIds: [1123, 1456, 1789, 1012],
    aonrs: [122334400, 122334411, 122334422, 122334433, 122334444, 122334455, 122334466, 122334477, 122334488, 122334499],
    eans: [4123123123, 4456456456, 4789789789, 4012012012, 4123123124, 4456456455, 4789789786, 4012012017, 4123123128, 4456456459],
  };
}

/**
 * Returns a mock object for a price data, based on ODLPriceData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlpricedata
 *
 * For a limited amount of dynamization you can pass in a seed for the random generator. That
 * causes all numeric values to be slightly randomized in a reproducable fashion.
 *
 * @method  getODLPriceDataStub
 * @param   seed  {int}    (optional) seed to initialize the random generator
 * @return  {ODLPriceData}  a price data object
 */
export function getODLPriceDataStub(seed) {
  const rnd = typeof seed === 'undefined' ? 1 : _random(seed);
  const total = (19.99 * rnd).toFixed(2);
  return {
    net: (17.77 * rnd).toFixed(2),
    VAT: (2.22 * rnd).toFixed(2),
    discount: 0, // (0 * rnd).toFixed(2),
    base: '29,95€/100ml',
    original: (29.99 * rnd).toFixed(2),
    total,
    totalBeforeDiscount: total,
  };
}

/**
 * Returns a mock object for a customer, based on ODLCustomerData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlcustomerdata
 *
 * @method  getODLCustomerDataStub
 * @return  {ODLCustomerData}  a customer data object
 */
export function getODLCustomerDataStub() {
  return {
    kundennummer: 4711,
    zipTown: '01705',
    loginstatus: 'registeredGuest',
    salutation: 'MR',
    firstName: 'Hans',
    lastName: 'Hinkebein',
    age: 52,
    birthDate: 12,
    birthYear: 1965,
    kundentyp: '1',
    email: 'hans.hinkebein@example.com',
    phone: '0123-4567890',
    billingAddress: {
      zip: '12345',
      town: 'Berlin',
      street: 'Evergreen Terrace',
      houseNr: '742',
    },
    shippingAddress: {
      zip: '50676',
      town: 'Köln',
      street: 'Sesamstr.',
      houseNr: '1',
    },
  };
}

/**
 * Returns a mock object for a shopping cart, based on ODLCartData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlcartdata
 * The cart is returned without products, those need to be added separately.
 *
 * @method  getODLCartDataStub
 * @param   products  {Array<ODLCartProductData>}   (optional) products to be added to cart
 * @return  {ODLCartData}  a cart data object
 */
export function getODLCartDataStub(products) {
  return {
    price: 74.99,
    VAT: 12.34,
    discount: 0,
    priceData: getODLPriceDataStub(),
    shipping: 4.60,
    paymentCosts: 1.99,
    paybackPoints: 0,
    products: typeof products === 'undefined' ? [] : products,
  };
}

/**
 * Returns a mock object for an order, based on ODLOrderData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlorderdata
 * The order is created without products, those need to be added separately or passed in via
 * the 'products' parameter.
 *
 * @method  getODLOrderDataStub
 * @param   products  {Array<ODLCartProductData>}   (optional) products to be added to order
 * @return  {ODLOrderData}  an order data object
 */
export function getODLOrderDataStub(products) {
  const c = getODLCartDataStub(products);
  c.id = 42;
  c.paymentMethod = 'payPal';
  c.giftCardUsed = false;
  c.customer = getODLCustomerDataStub();
  c.couponCode = '';
  c.payback = true;
  c.paybackPoints = 0;
  c.campaignNumbers = ['BLA12345', 'BLUBB543'];
  c.testOrder = false;
  return c;
}

/**
 * Returns a mock object for a product, based on ODLProductData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlproductdata
 *
 * For a limited amount of dynamization you can pass in a seed for the random generator. That
 * causes all numeric values to be slightly randomiized in a reproducable fashion.
 *
 * @method  getODLProductDataStub
 * @param   seed  {int}    (optional) seed to initialize the random generator
 * @return  {ODLProductData}  a product data object
 */
export function getODLProductDataStub(seed) {
  const rnd = typeof seed === 'undefined' ? 1 : _random(seed);
  return {
    ean: Math.floor(413212345678 * rnd),
    aonr: Math.floor(123456789 * rnd),
    productId: Math.floor(123456 * rnd),
    variantId: Math.floor(678901 * rnd),
    name: "The Hitchhiker's Towel",
    brand: "Hitchhiker's Inc.",
    brandData: getODLBrandDataStub(),
    color: '123',
    size: '45678',
    abteilungName: 'Herren',
    abteilungNummer: 111,
    inStock: true,
    priceData: getODLPriceDataStub(seed),
    // not in spec but existing in live data (@TODO: review, add to spec)
    category: 'Survival',
    // legacy
    price: (42.23 * rnd).toFixed(2),
    VAT: (1.23 * rnd).toFixed(2),
    discount: 0,
  };
}

/**
 * Returns a mock object for a product in a cart, based on ODLCartProductData as defined in specification:
 * http://gitlab.gkh-setu.de/specs/jumprfc-024-data-abstraction-layer/blob/master/jumprfc-024-data-abstraction-layer.md#odlcartproductdata
 *
 * For a limited amount of dynamization you can pass in a seed for the random generator. That
 * causes all numeric values to be slightly randomiized in a reproducable fashion.
 *
 * @method  getODLCartProductDataStub
 * @param   seed  {int}    (optional) seed to initialize the random generator
 * @return  {ODLCartProductData}  a cart product data object
 */
export function getODLCartProductDataStub(seed) {
  const product = getODLProductDataStub(seed);
  product.quantity = 1;
  return product;
}

// set public exports
export default {
  getODLGlobalDataStub,
  getODLBrandDataStub,
  getODLSearchDataStub,
  getODLCategoryDataStub,
  getODLCartDataStub,
  getODLCustomerDataStub,
  getODLPriceDataStub,
  getODLOrderDataStub,
  getODLProductDataStub,
  getODLCartProductDataStub,
};
