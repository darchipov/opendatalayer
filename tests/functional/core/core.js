import { Selector, ClientFunction } from 'testcafe';
import { assert } from 'chai';

const getODLData = ClientFunction(() => {
  return new Promise((resolve, reject) => {
    let retries = 100;
    const checkODL = () => {
      if (typeof window._odl !== 'undefined' && window._odl.isReady()) {
        resolve(window._odl.getData());
      } else if (retries === 0) {
        reject('maximum number of retries reached, but ODL still not available');
      } else {
        setTimeout(checkODL, 100);
        retries -= 1;
      }
    };
    checkODL();
  });
});

fixture `Core functionality`
    .page('http://localhost:17771/core/core.html');

test('check data in ODL', async t => {
  const odlData = await getODLData();
  assert.deepEqual(odlData.site, { id: "test" });
});