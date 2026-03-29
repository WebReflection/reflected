import { w as withResolvers, r as randomUUID, b as byteOffset } from './shared-CV7CPYuP.js';
import { W as Worker$1, S as SAB } from './async-Di4MuQWe.js';
import { r as SHARED_CHANNEL } from './channel-NcnPEVL4.js';
import { S as Sender, h as handler, u as url, p as post } from './shared-DdPca9Ke.js';
import './shared-array-buffer-BQgQXQvC.js';
import './i32-UV5fM9Tw.js';

const CHANNEL = 'xhr';

const channels = new Map;

const sharedBC = new BroadcastChannel(SHARED_CHANNEL);
sharedBC.addEventListener('message', async ({ data: [op, details] }) => {
  if (op === 'request') {
    const [uid, [id, channel]] = details;
    const responses = channels.get(channel);
    if (responses) {
      const promise = responses.get(id);
      responses.delete(id);
      sharedBC.postMessage(['response', [uid, await promise]]);
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
      if (!w) return activate(swc, options);
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

class Worker extends Sender {
  #channel;
  constructor(scriptURL, options, resolve) {
    if (init) {
      init = false;
      let { serviceWorker } = options;
      if (!serviceWorker) {
        // @ts-ignore
        return new Worker$1(scriptURL, options, resolve);
      }
      if (typeof serviceWorker === 'string') serviceWorker = { url: serviceWorker };
      serviceWorker.url = new URL(serviceWorker.url, location.href).href;
      activate(navigator.serviceWorker, serviceWorker);
    }
    const channel = randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    const responses = new Map;
    const i32a = new Int32Array(sab);
    const handle = handler(sab, options, false);
    channels.set(channel, responses);
    bc.addEventListener('message', async ({ data: [id, payload] }) => {
      const { promise, resolve } = withResolvers();
      responses.set(id, promise);
      await handle({ data: payload });
      resolve(new Uint8Array(sab, byteOffset, i32a[1]));
    });
    super(...url(scriptURL, CHANNEL, options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
    this.#channel = channel;
  }

  terminate() {
    channels.delete(this.#channel);
    super.terminate();
  }

  get channel() {
    return CHANNEL;
  }
}
var xhr = (scriptURL, options) => {
  const { promise, resolve } = withResolvers();
  const worker = new Worker(scriptURL, options, resolve);
  return worker instanceof Worker$1 ? promise : sw.then(() => promise);
};

export { xhr as default };
