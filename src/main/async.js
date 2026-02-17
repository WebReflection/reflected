import Sender from './sender.js';
import SAB from './sab.js';
import { bootstrap, handler, post, url } from './shared.js';
import { randomUUID } from '../shared.js';

const CHANNEL = 'async';

export class Worker extends Sender {
  constructor(scriptURL, options, resolve) {
    const channel = randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    const i32a = new Int32Array(sab);
    const handle = handler(sab, options, false);
    bc.addEventListener('message', async ({ data: [id, data] }) => {
      await handle({ data });
      bc.postMessage([id, i32a.slice(0, 2 + i32a[1])]);
    });
    super(...url(scriptURL, CHANNEL, options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
  }

  get channel() {
    return CHANNEL;
  }
};

export default bootstrap(Worker);
