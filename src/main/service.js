import CHANNEL from '../channel.js';
import { handler, minByteLength, post, url, withResolvers } from './shared.js';
import { SharedArrayBuffer } from '@webreflection/utils/shared-array-buffer';

const SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    minByteLength + initByteLength,
    { maxByteLength: minByteLength + maxByteLength }
  );

const channels = new Map;

const sharedBC = new BroadcastChannel(CHANNEL);
sharedBC.addEventListener('message', async ({ data: [op, details] }) => {
  if (op === 'request') {
    const [uid, [id, channel]] = details;
    const responses = channels.get(channel);
    if (responses) {
      const promise = responses.get(id);
      if (promise) {
        responses.delete(id);
        sharedBC.postMessage(['response', [uid, await promise]]);
      }
    }
  }
});

const { promise: sw, resolve } = withResolvers();
let init = true;

const activate = (swc, options) => {
  let w, c = true, { url } = options;
  swc.getRegistration(url)
    .then(r => (r ?? swc.register(url, options)))
    .then(function ready(r) {
      const { controller } = swc;
      c = c && !!controller;
      w = (r.installing || r.waiting || r.active);
      if (w.state === 'activated') {
        if (c) {
          // allow ServiceWorker swap on different URL
          if (controller.scriptURL === url)
            return resolve();
          r.unregister();
        }
        location.reload();
      }
      else {
        w.addEventListener('statechange', () => ready(r), { once: true });
      }
    });
};

class Worker extends globalThis.Worker {
  #channel = crypto.randomUUID();
  constructor(scriptURL, options, resolve) {
    if (init) {
      init = false;
      let { serviceWorker } = options;
      if (typeof serviceWorker === 'string') serviceWorker = { url: serviceWorker };
      serviceWorker.url = new URL(serviceWorker.url, location.href).href;
      activate(navigator.serviceWorker, serviceWorker);
    }
    const channel = crypto.randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    const responses = new Map;
    const i32a = new Int32Array(sab);
    const handle = handler(sab, options, false);
    channels.set(channel, responses);
    bc.addEventListener('message', async ({ data: [id, data] }) => {
      const { promise, resolve } = withResolvers();
      responses.set(id, promise);
      await handle({ data });
      resolve(i32a.slice(0, 2 + i32a[1]));
    });
    super(...url(scriptURL, 'service', options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
    this.#channel = channel;
  }

  terminate() {
    channels.delete(this.#channel);
    super.terminate();
  }

  get channel() {
    return 'service';
  }
};

export default (scriptURL, options) => {
  const { promise, resolve } = withResolvers();
  new Worker(scriptURL, options, resolve);
  return sw.then(() => promise);
};
