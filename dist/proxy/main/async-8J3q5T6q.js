import { w as withResolvers, b as byteOffset, i as identity } from './shared-CV7CPYuP.js';
import { s as sender, d as decoder } from './sender-Dkjjbv2Y.js';
import { i as i32 } from './i32-UV5fM9Tw.js';
import './channel-NcnPEVL4.js';

const { promise, resolve } = withResolvers();

addEventListener(
  'message',
  ({ data: [_, main, channel] }) => resolve([main, channel]),
  { once: true }
);

const channel = 'async';

const handle = (channel, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const decode = (options.decoder ?? decoder)({ byteOffset });
  const onsync = options.onsync ?? identity;
  const map = new Map;
  bc.addEventListener('message', ({ data: [id, { length, buffer }] }) => {
    map.get(id)(onsync(length ? decode(length, buffer) : void 0));
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

var async = options => promise.then(([main, channel]) => {
  postMessage(1);
  return handle(channel, sender({ ...main, ...options }));
});

export { channel, async as default };
