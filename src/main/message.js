import { SAB, handler, post, url, withResolvers } from './shared.js';

class Worker extends globalThis.Worker {
  constructor(scriptURL, options, resolve) {
    const { port1, port2 } = new MessageChannel;
    const sab = SAB(options);
    port1.addEventListener('message', handler(sab, options, true));
    port1.start();
    super(...url(scriptURL, 'message', options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options), [port2]);
  }

  get channel() {
    return 'message';
  }
}

export default (scriptURL, options) => {
  const { promise, resolve } = withResolvers();
  new Worker(scriptURL, options, resolve);
  return promise;
};
