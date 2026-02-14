import CHANNEL from './shared-id.js';
import { handler, post, url, withResolvers } from './shared.js';
import { SharedArrayBuffer } from '@webreflection/utils/shared-array-buffer';

const SAB = ({ minByteLength = 1032, maxByteLength = 8200 }) =>
  new SharedArrayBuffer(minByteLength, { maxByteLength });

const sharedBC = new BroadcastChannel(CHANNEL);
sharedBC.addEventListener('message', event => {
  console.log(event.data);
});

class Worker extends globalThis.Worker {
  constructor(scriptURL, options) {
    const channel = crypto.randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    bc.addEventListener('message', handler(sab, options, false));
    super(url(scriptURL, 'service'), { ...options, type: 'module' });
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
  }

  get channel() {
    return 'service';
  }
};

export default (scriptURL, options) => {
  const { promise, resolve } = withResolvers();
  new Worker(scriptURL, options, resolve);
  return promise;
};
