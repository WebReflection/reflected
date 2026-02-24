import withResolvers from '@webreflection/utils/with-resolvers';
import { encoder } from 'reflected-ffi/encoder';

import { byteOffset } from '../shared.js';

const { notify, store } = Atomics;

export const SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    byteOffset + initByteLength,
    { maxByteLength: byteOffset + maxByteLength }
  );

/**
 * @typedef {Object} ServiceWorkerOptions see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#options
 * @property {string} [url] will use the `serviceWorker` value if that is a `string`, otherwise it refers to where the service worker file is located.
 * @property {'classic' | 'module'} [type]
 * @property {'all' | 'imports' | 'none'} [updateViaCache]
 */

/**
 * @typedef {Object} Options
 * @property {(payload: unknown) => Int32Array | Promise<Int32Array>} onsync invoked when the worker expect a response as `Int32Array` to populate the SharedArrayBuffer with.
 * @property {(payload: unknown) => unknown | Promise<unknown>} [onsend] invoked when the worker replies to a `worker.send(data)` call.
 * @property {number} [initByteLength=1024] defines the initial byte length of the SharedArrayBuffer.
 * @property {number} [maxByteLength=8192] defines the maximum byte length (growth) of the SharedArrayBuffer.
 * @property {string | ServiceWorkerOptions} [serviceWorker] defines the service worker to use as fallback if SharedArrayBuffer is not supported. If not defined, the `async` fallback will be used so that no `sync` operations from the worker will be possible.
 * @property {import('reflected-ffi/encoder').encoder} [encoder] defines the encoder function to use to encode the result into the SharedArrayBuffer.
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
  const encode = (options.encoder ?? encoder)({ byteOffset });

  const resolve = useAtomics ?
    (length => {
      store(i32a, 1, length);
      store(i32a, 0, 1);
      notify(i32a, 0);
    }) :
    (length => {
      i32a[1] = length;
      i32a[0] = 1;
    });

  const process = result => {
    const length = encode(result, sab);
    return typeof length === 'number' ? resolve(length) : length.then(resolve);
  };

  return async ({ data }) => process(await options.onsync(data));
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
