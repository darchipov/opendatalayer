import { Selector, ClientFunction } from 'testcafe';
import { assert } from 'chai';

const getODLData = ClientFunction(() => {
  return new Promise((resolve, reject) => {
    let retries = 100;  // 100 x 100 ms = 10 seconds
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

const getPluginListFromODL = ClientFunction(() => {
  return Object.keys(window._odl.plugins);
});

fixture `Core functionality`
    .page('http://localhost:17771/core/core.html');

test('it should provide the expected data in ODL.data', async t => {
  const odlData = await getODLData();
  assert.deepEqual(odlData.site, { id: "test" });
});

test('it should load the expected plugins for the pagetype "homepage" (as defined in gulpfile)', async t => {
  // wait for DAL init first
  const odlData = await getODLData();
  const plugins = await getPluginListFromODL();

  assert.deepEqual(plugins, [
    'odl/plugins/ga',
    'odl/plugins/marin',
  ])
});

test('it should NOT load the plugins that are disabled for the pagetype "homepage" (as defined in gulpfile)', async t => {
  // wait for DAL init first
  const odlData = await getODLData();
  const plugins = await getPluginListFromODL();

  assert.notInclude(plugins, 'odl/plugins/facebookWCA');
});
