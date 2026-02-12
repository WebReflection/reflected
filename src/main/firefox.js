import { SAB, handler, post, url, withResolvers } from './shared.js';

class Worker extends globalThis.Worker {
  #ready;
  constructor(scriptURL, options) {
    const channel = crypto.randomUUID();
    const bc = new BroadcastChannel(channel);
    const { promise, resolve } = withResolvers();
    const sab = SAB(options);
    bc.addEventListener('message', handler(sab, options));
    super(url(scriptURL, 'firefox'), { ...options, type: 'module' });
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
    this.#ready = promise;
  }

  get ready() {
    return this.#ready;
  }
};

export default (scriptURL, options) => new Worker(scriptURL, options).ready;
