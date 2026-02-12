import { SAB, handler, post, url, withResolvers } from './shared.js';

class Worker extends globalThis.Worker {
  #ready;
  constructor(scriptURL, options) {
    const { port1, port2 } = new MessageChannel;
    const { promise, resolve } = withResolvers();
    const sab = SAB(options);
    port1.addEventListener('message', handler(sab, options));
    port1.start();
    super(url(scriptURL, 'chrome'), { ...options, type: 'module' });
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options), [port2]);
    this.#ready = promise;
  }

  get ready() {
    return this.#ready;
  }
}

export default (scriptURL, options) => new Worker(scriptURL, options).ready;
