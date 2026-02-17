import withResolvers from '@webreflection/utils/with-resolvers';
import { Worker as AsyncWorker } from './async.js';

import SHARED_CHANNEL from '../channel.js';
import SAB from './sab.js';
import Sender from './sender.js';

import { handler, post, url } from './shared.js';
import { randomUUID } from '../shared.js';

const CHANNEL = 'xhr';

const channels = new Map;

const sharedBC = new BroadcastChannel(SHARED_CHANNEL);
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

class Worker extends Sender {
  #channel;
  constructor(scriptURL, options, resolve) {
    if (init) {
      init = false;
      let { serviceWorker } = options;
      if (!serviceWorker) return new AsyncWorker(scriptURL, options, resolve);
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
    bc.addEventListener('message', async ({ data: [id, data] }) => {
      const { promise, resolve } = withResolvers();
      responses.set(id, promise);
      await handle({ data });
      resolve(i32a.slice(0, 2 + i32a[1]));
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
};

export default (scriptURL, options) => {
  const { promise, resolve } = withResolvers();
  const worker = new Worker(scriptURL, options, resolve);
  return worker instanceof AsyncWorker ? promise : sw.then(() => promise);
};
