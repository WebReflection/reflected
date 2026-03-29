import { b as bootstrap, S as Sender, a as SAB, h as handler, u as url, p as post } from './shared-ddawRQD0.js';
import './shared-5Nhc4gvB.js';
import './i32-Cw-Rqr5y.js';
import './views-C3SJnvMr.js';
import './global-LTfnrHcF.js';

const CHANNEL = 'message';

var message = bootstrap(class Worker extends Sender {
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

export { message as default };
