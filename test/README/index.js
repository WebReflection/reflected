import reflect, { channel } from '../../dist/index.js';

function test_sum(...args) {
  let i = 0;
  while (args.length)
    i += args.pop();
  return i;
}

// ℹ️ must await the initialization
const worker = await reflect(
  // Worker scriptURL
  './worker.js',
  // Worker options + required utilities / helpers
  // ℹ️ type is enforced to be 'module' due top-level await
  {
    // invoked when the worker asks to synchronize a call
    // and it mmust return an Int32Array reference to populate
    // the SharedArrayBuffer and notify/unlock the worker
    // ℹ️ works even if synchronous but it's resolved asynchronously
    // ⚠️ the worker is not responsive until this returns so
    //     be sure you handle errors gracefully to still provide
    //     a result the worker can consume out of the shared buffer!
    async onsync(payload) {
      const { invoke, args } = payload;

      if (invoke === 'test_sum') {
        // just demoing this can be async too
        const value = await test_sum(...args);
        return new Int32Array([value]);
      }

      // errors should still be Int32Array but
      // it is trivial to return no result
      return new Int32Array(0);
    },

    // optional: the initial SharedArrayBuffer length
    initByteLength: 1024,

    // optional: the max possible SharedArrayBuffer growth
    maxByteLength: 8192,

    // optional: the service worker as fallback
    //   * if it's a string, it's used to register it
    //   * if it's an object, it's used to initialize it
    //     but it must contain a `url` field to register it
    // ℹ️ if already registered it will not try to register it
    serviceWorker: undefined,
  }
);

document.body.append(channel, ' ');
document.body.append(JSON.stringify(await worker.send({ any: 'payload' })));
