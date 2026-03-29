import { b as bootstrap, S as Sender, a as SAB, h as handler, u as url, p as post } from './shared-B3KmQkGh.js';
import { v as randomUUID } from './shared-CjWXp6-D.js';
import './i32-Cw-Rqr5y.js';
import './views-DBBYng9N.js';
import './global-DzpOeFX2.js';

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
