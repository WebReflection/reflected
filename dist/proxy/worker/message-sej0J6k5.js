import { b as bootstrap, S as Sender, a as SAB, h as handler, u as url, p as post } from './shared-CgOGpfKJ.js';
import './shared-DR7YYduq.js';
import './i32-UV5fM9Tw.js';
import './channel-NcnPEVL4.js';

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
