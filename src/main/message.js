import Sender from './sender.js';
import { SAB, bootstrap, handler, post, url } from './shared.js';

const CHANNEL = 'message';

export default bootstrap(class Worker extends Sender {
  constructor(scriptURL, options, resolve) {
    const { port1, port2 } = new MessageChannel;
    const sab = SAB(options);
    port1.addEventListener(CHANNEL, handler(sab, options, true));
    port1.start();
    super(...url(scriptURL, CHANNEL, options));
    super.addEventListener(CHANNEL, () => resolve(this), { once: true });
    super.postMessage(post(sab, options), [port2]);
  }

  get channel() {
    return CHANNEL;
  }
});
