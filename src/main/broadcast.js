import { SAB, handler, post, url, withResolvers } from './shared.js';

class Worker extends globalThis.Worker {
  constructor(scriptURL, options, resolve) {
    const channel = crypto.randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    bc.addEventListener('message', handler(sab, options, true));
    super(url(scriptURL, 'broadcast'), { ...options, type: 'module' });
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
  }

  get channel() {
    return 'broadcast';
  }
};

export default (scriptURL, options) => {
  const { promise, resolve } = withResolvers();
  new Worker(scriptURL, options, resolve);
  return promise;
};
