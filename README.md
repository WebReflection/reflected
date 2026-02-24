# reflected

<sup>**Social Media Photo by [Marc-Olivier Jodoin](https://unsplash.com/@marcojodoin) on [Unsplash](https://unsplash.com/)**</sup>

A primitive to allow workers to call **synchronously** any functionality exposed on the main thread, without blocking it.

## Strategies

This module uses 3 synchronous strategies + 1 asynchronous fallback:

  * **message** based on *SharedArrayBuffer* and *MessageChannel*, the fastest and most reliable "*channel strategy*" that requires headers to enable [Cross Origin Isolation](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated) on the page.
  * **broadcast** also based on *SharedArrayBuffer* but with *BroadcastChannel* instead to satisfy a long standing [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1752287). This also requires headers to enable [Cross Origin Isolation](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated) on the page.
  * **xhr** based on synchronous *XMLHttpRequest* and a dedicated *ServiceWorker* able to intercept such *POST* requests, broadcast to all listening channels the request and resolve as response for the worker.
  * **async** which will always return a *Promise* and will not need special headers or *ServiceWorker*. This is also a fallback for the *xhr* case if the `serviceWorker` option field has not been provided.

All strategies are automatically detected through the default/main `import` but all dedicated strategies can be retrieved directly, for example:

  * `import reflect from 'reflected'` will decide automatically which strategy should be used.
  * `import reflect from 'reflected/message'` will return the right *message* based module on the main thread and the worker mode within the worker.
  * `import reflect from 'reflected/main/message'` will return the *message* strategy for the main thread only. This requires the least amount of bandwidth when you are sure that *message* strategy will work on main.
  * `import reflect from 'reflected/worker/message'` will return the *message* strategy for the worker thread only. This requires the least amount of bandwidth when you are sure that *message* strategy will work within the worker.

Swap `message` with `broadcast`, `xhr` or `async`, and all exports will work equally well according to the chosen "*channel strategy*".

| Import | Use case |
|--------|----------|
| `reflected` | Auto-pick strategy (main + worker) |
| `reflected/message` \| `broadcast` \| `xhr` \| `async` | Specific strategy, context-aware |
| `reflected/main/<strategy>` | Main thread only (smaller bundle) |
| `reflected/worker/<strategy>` | Worker only (smaller bundle) |

**Requirements:** Synchronous strategies except for `xhr` need [Cross-Origin Isolation](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated) (e.g. `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`). The `async` strategy works without those headers and always returns a Promise.

### Worker Thread API

```js
// file: worker.js (always loaded as module)
import reflect from 'https://esm.run/reflected';

// ℹ️ must await the initialization
const reflected = await reflect({
  // receives the returned data from the main thread.
  // use this helper to transform such data into something
  // that the worker can use/understand after invoke
  // ⚠️ must be synchronous and it's invoked synchronously
  onsync(response:unknown) {
    return response;
  },

  // receives the data from the main thread when
  // `worker.send(payload, ...rest)` is invoked.
  // use this helper to transform the main thread request
  // into something compatible with structuredClone algorithm
  // ℹ️ works even if synchronous but it's resolved asynchronously
  async onsend(payload) {
    const data = await fetch('./data.json').then(r => r.json());
    return process(payload, data);
  },
});

// retrieve the result of `test_sum(1, 2, 3)`
// directly from the main thread.
// only the async channel variant would need to await
const value = reflected({
  invoke: 'test_sum',
  args: [1, 2, 3]
});

console.log(value); // 6
```

### Main Thread API

```js
// file: index.js as module
import reflect from 'https://esm.run/reflected';

function test_sum(...args:number[]) {
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
  // ℹ️ type is enforced to be 'module' due to top-level await
  {
    // invoked when the worker asks to synchronize a call
    // ℹ️ works even if synchronous but it's resolved asynchronously
    // ⚠️ the worker is not responsive until this returns so
    //     be sure you handle errors gracefully to still provide
    //     a result the worker can consume out of the shared buffer!
    async onsync(payload:unknown) {
      const { invoke, args } = payload;

      if (invoke === 'test_sum') {
        // just demoing this can be async too
        return await test_sum(...args);
      }

      // it is trivial to return no result or even errors
      return new Error('unknown ' + invoke);
    },

    // *optional* helper to process data returned from the worker when
    // the main thread `await worker.send(payload, ...rest)` operation
    // is invoked. If not present, whatever payload the worker returned
    // will be directly returned as invoke result, just like in here.
    // ℹ️ works even if synchronous but it's resolved asynchronously
    onsend(payload:unknown) {
       return payload;
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

const value = await worker.send({ any: 'payload' });
```

Test [live](https://webreflection.github.io/reflected/test/README/) or read the [main thread](./test/README/index.js) and [worker thread](./test/README/worker.js) code.

Latest [ffi](https://webreflection.github.io/reflected/test/ffi/) should allow workers to drive the main thread without even needing SharedArrayBuffer but of course, if *SharedArrayBuffer* is available, these will be much faster.

### reflected/ffi

This module also exports a bare-minimum way to directly drive, whenever the *channel* is **not async**, the main thread from a worker.

```js
// main.js module
import reflect from 'reflected/ffi/main';

// returns a worker with a special `ffi` field/namespace
// directly from reflected-ffi project
const worker = await reflect('./worker.js', { serviceWorker: './sw.js' });


// worker.js module
import reflect from 'reflected/ffi/worker';

// retrieve the reflected-ffi namespace as it is
const ffi = await worker();

// will directly append a text node to the main thread body
ffi.global.document.body.append('it worked 🥳');
```

To know more about *reflected-ffi* module and features, please visit [the related project](https://github.com/WebReflection/reflected-ffi/#readme).


### Extras

- **Named export `channel`:** After initialization, `import reflect, { channel } from 'reflected'` gives the active strategy name (`'message'`, `'broadcast'`, `'xhr'`, or `'async'`).
- **Errors:** From main-thread `onsync`, return `new Int32Array(0)` (or a convention of your choice) so the worker always gets a result; handle that in the worker’s `onsync` to avoid hanging.
- **Types:** you can import `MainOptions` and `WorkerOptions` from the root of the porject because *main* `reflect(string, MainOptions)` and *worker* `reflect(WorkerOptions)` are different in a subtle way you probably don't want to mess around with (in particular, the `onsync` which must be sync on the *worker* side of affairs or it cannnot work)
