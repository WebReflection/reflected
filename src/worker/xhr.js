import withResolvers from '@webreflection/utils/with-resolvers';
import i32 from 'weak-id/i32';

import sender from './sender.js';

const { parse, stringify } = JSON;

const { promise, resolve } = withResolvers();

addEventListener(
  'message',
  ({ data: [sab, main, channel] }) => resolve([sab, main, channel]),
  { once: true }
);

export const channel = 'xhr';

const handle = (channel, i32a, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const { serviceWorker } = options;
  return (payload, ...rest) => {
    const id = next();
    // @ts-ignore
    bc.postMessage([id, payload], ...rest);
    const xhr = new XMLHttpRequest;
    xhr.open('POST', serviceWorker, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(stringify([id, channel]));
    i32a.set(parse(xhr.responseText), 0);
    return options.ondata(i32a.subarray(2, 2 + i32a[1]));
  };
};

export default options => promise.then(([sab, main, channel]) => {
  postMessage(1);
  return handle(channel, new Int32Array(sab), sender({ ...main, ...options }));
});
