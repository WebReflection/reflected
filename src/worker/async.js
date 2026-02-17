import withResolvers from '@webreflection/utils/with-resolvers';
import i32 from 'weak-id/i32';

import sender from './sender.js';

const { promise, resolve } = withResolvers();

addEventListener(
  'message',
  ({ data: [sab, main, channel] }) => resolve([sab, main, channel]),
  { once: true }
);

export const channel = 'async';

const handle = (channel, i32a, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const map = new Map;
  bc.addEventListener('message', ({ data: [id, data] }) => {
    const [resolve, rest] = map.get(id);
    i32a.set(data, 0);
    resolve(options.ondata(i32a.subarray(2, 2 + i32a[1])));
  });
  return (data, ...rest) => {
    const { promise, resolve } = withResolvers();
    const id = next();
    map.set(id, [resolve, rest]);
    bc.postMessage([id, data], ...rest);
    return promise;
  };
};

export default options => promise.then(([sab, main, channel]) => {
  postMessage(1);
  return handle(channel, new Int32Array(sab), sender({ ...main, ...options }));
});
