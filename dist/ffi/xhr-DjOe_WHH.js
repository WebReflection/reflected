import { w as withResolvers, s as identity } from './shared-CjWXp6-D.js';
import { s as sender, d as decoder } from './sender-C0gu9RzR.js';
import { i as i32 } from './i32-Cw-Rqr5y.js';
import './views-DBBYng9N.js';

const { parse, stringify } = JSON;

const { promise, resolve } = withResolvers();

addEventListener(
  'message',
  ({ data: [_, main, channel] }) => resolve([main, channel]),
  { once: true }
);

const channel = 'xhr';

const handle = (channel, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const decode = (options.decoder ?? decoder)({ byteOffset: 0 });
  const { serviceWorker } = options;
  const onsync = options.onsync ?? identity;
  return (payload, ...rest) => {
    const id = next();
    // @ts-ignore
    bc.postMessage([id, payload], ...rest);
    const xhr = new XMLHttpRequest;
    xhr.open('POST', serviceWorker, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(stringify([id, channel]));
    const { length, buffer } = new Uint8Array(parse(xhr.responseText));
    return onsync(length ? decode(length, buffer) : void 0);
  };
};

var xhr = options => promise.then(([main, channel]) => {
  postMessage(1);
  return handle(channel, sender({ ...main, ...options }));
});

export { channel, xhr as default };
