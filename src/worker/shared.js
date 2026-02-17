import sender from './sender.js';

const { load, store, wait } = Atomics;

/**
 * @typedef {Object} Options
 * @property {(data: Int32Array) => unknown} ondata transforms the resulting `Int32Array` from *main* thread into a value usable within the worker.
 * @property {(data: unknown) => unknown} onsend invoked to define what to return to the *main* thread when it calls `worker.send(data)`.
 */

/**
 * @param {MessageChannel | BroadcastChannel} channel
 * @param {Int32Array} i32a
 * @param {Options} options 
 * @returns {(data: unknown, ...rest: unknown[]) => unknown}
 */
const handle = (channel, i32a, options) => (data, ...rest) => {
  // @ts-ignore
  channel.postMessage(data, ...rest);
  wait(i32a, 0, 0);
  store(i32a, 0, 0);
  return options.ondata(i32a.subarray(2, 2 + load(i32a, 1)));
};

/**
 * 
 * @param {Promise<[SharedArrayBuffer, Options, MessageChannel | BroadcastChannel]>} promise
 * @param {(event:MessageEvent) => void} listener
 * @returns
 */
export const handler = (promise, listener) => {
  addEventListener('message', listener, { once: true });
  /**
   * @param {Options} options
   * @returns
   */
  return options => promise.then(
    ([sab, main, channel]) => {
      postMessage(1);
      return handle(channel, new Int32Array(sab), sender({ ...main, ...options }));
    }
  );
};
