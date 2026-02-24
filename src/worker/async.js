import withResolvers from '@webreflection/utils/with-resolvers';
import { decoder } from 'reflected-ffi/decoder';
import i32 from 'weak-id/i32';

import sender from './sender.js';
import { byteOffset } from '../shared.js';

const { promise, resolve } = withResolvers();

addEventListener(
  'message',
  ({ data: [_, main, channel] }) => resolve([main, channel]),
  { once: true }
);

export const channel = 'async';

const handle = (channel, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const decode = (options.decoder ?? decoder)({ byteOffset });
  const map = new Map;
  bc.addEventListener('message', ({ data: [id, { length, buffer }] }) => {
    map.get(id)(options.onsync(length ? decode(length, buffer) : void 0));
    map.delete(id);
  });
  return (payload, ...rest) => {
    const { promise, resolve } = withResolvers();
    const id = next();
    map.set(id, resolve);
    // @ts-ignore
    bc.postMessage([id, payload], ...rest);
    return promise;
  };
};

export default options => promise.then(([main, channel]) => {
  postMessage(1);
  return handle(channel, sender({ ...main, ...options }));
});
