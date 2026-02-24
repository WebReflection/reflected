import withResolvers from '@webreflection/utils/with-resolvers';
import { decoder } from 'reflected-ffi/decoder';
import i32 from 'weak-id/i32';

import sender from './sender.js';

const { parse, stringify } = JSON;

const { promise, resolve } = withResolvers();

addEventListener(
  'message',
  ({ data: [_, main, channel] }) => resolve([main, channel]),
  { once: true }
);

export const channel = 'xhr';

const handle = (channel, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const decode = (options.decoder ?? decoder)({ byteOffset: 0 });
  const { serviceWorker } = options;
  return (payload, ...rest) => {
    const id = next();
    // @ts-ignore
    bc.postMessage([id, payload], ...rest);
    const xhr = new XMLHttpRequest;
    xhr.open('POST', serviceWorker, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(stringify([id, channel]));
    const { length, buffer } = new Uint8Array(parse(xhr.responseText));
    return options.onsync(length ? decode(length, buffer) : void 0);
  };
};

export default options => promise.then(([main, channel]) => {
  postMessage(1);
  return handle(channel, sender({ ...main, ...options }));
});
