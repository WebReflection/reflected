import sender from './sender.js';

const { load, store, wait } = Atomics;

const handle = (channel, i32a, options) => (data, ...rest) => {
  channel.postMessage(data, ...rest);
  wait(i32a, 0, 0);
  store(i32a, 0, 0);
  return options.ondata(i32a.subarray(2, 2 + load(i32a, 1)));
};

export const handler = (promise, listener) => {
  addEventListener('message', listener, { once: true });
  return options => promise.then(
    ([sab, main, channel]) => {
      postMessage(1);
      return handle(channel, new Int32Array(sab), sender({ ...main, ...options }));
    }
  );
};
