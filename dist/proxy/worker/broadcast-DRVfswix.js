import { b as bootstrap, S as Sender, a as SAB, h as handler, u as url, p as post } from './shared-CgOGpfKJ.js';
import { r as randomUUID } from './shared-DR7YYduq.js';
import './i32-UV5fM9Tw.js';
import './channel-NcnPEVL4.js';

const CHANNEL = 'broadcast';

var broadcast = bootstrap(class Worker extends Sender {
  constructor(scriptURL, options, resolve) {
    const channel = randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    bc.addEventListener('message', handler(sab, options, true));
    super(...url(scriptURL, CHANNEL, options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
  }

  get channel() {
    return CHANNEL;
  }
});

export { broadcast as default };
