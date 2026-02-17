import withResolvers from '@webreflection/utils/with-resolvers';

const { notify, store } = Atomics;

export const minByteLength = Int32Array.BYTES_PER_ELEMENT * 2;

export const SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    minByteLength + initByteLength,
    { maxByteLength: minByteLength + maxByteLength }
  );

/**
 * @typedef {Object} ServiceWorkerOptions see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#options
 * @property {string} [url] will use the `serviceWorker` value if that is a `string`, otherwise it refers to where the service worker file is located.
 * @property {'classic' | 'module'} [type]
 * @property {'all' | 'imports' | 'none'} [updateViaCache]
 */

/**
 * @typedef {Object} Options
 * @property {(payload: unknown) => Promise<Int32Array>} ondata invoked when the worker expect a response as `Int32Array` to populate the SharedArrayBuffer with.
 * @property {(payload: unknown) => unknown} [onsend] invoked when the worker replies to a `worker.send(data)` call.
 * @property {number} [initByteLength=1024] defines the initial byte length of the SharedArrayBuffer.
 * @property {number} [maxByteLength=8192] defines the maximum byte length (growth) of the SharedArrayBuffer.
 * @property {string | ServiceWorkerOptions} [serviceWorker] defines the service worker to use as fallback if SharedArrayBuffer is not supported. If not defined, the `async` fallback will be used so that no `sync` operations from the worker will be possible.
 */

/**
 * Initialize the worker channel communication and resolves with the worker instance.
 * @template T
 * @param {T} Worker
 * @returns
 */
export const bootstrap = Worker => {
  /**
   * @param {string} scriptURL
   * @param {Options} options
   * @returns
   */
  return (scriptURL, options) => {
    const { promise, resolve } = withResolvers();
    // @ts-ignore
    new Worker(scriptURL, options, resolve);
    return /** @type {Promise<T>} */(promise);
  };
};

export const handler = (sab, options, useAtomics) => {
  const i32a = new Int32Array(sab);
  return async ({ data }) => {
    const result = await options.ondata(data);
    const length = result.length;
    const requiredByteLength = minByteLength + result.buffer.byteLength;
    if (sab.byteLength < requiredByteLength) sab.grow(requiredByteLength);
    i32a.set(result, 2);
    if (useAtomics) {
      store(i32a, 1, length);
      store(i32a, 0, 1);
      notify(i32a, 0);
    }
    else {
      i32a[1] = length;
      i32a[0] = 1;
    }
  };
};

const isOK = value => {
  switch (typeof value) {
    case 'symbol':
    case 'function':
      return false;
  }
  return true;
};

export const post = (sab, options) => {
  const opts = {};
  for (const key in options) {
    const value = options[key];
    if (isOK(key) && isOK(value)) opts[key] = value;
  }
  return [sab, opts];
};

export const url = (scriptURL, reflected, options) => {
  const url = new URL(scriptURL, location.href);
  url.searchParams.set('reflected', reflected);
  return [url, { ...options, type: 'module' }];
};
