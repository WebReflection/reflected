import { b as bootstrap, S as Sender, h as handler, u as url, p as post } from './shared-L0wiAfqu.js';
import { S as SAB$1 } from './shared-array-buffer-BQgQXQvC.js';
import { b as byteOffset, v as randomUUID } from './shared-Ccm1cPah.js';

var SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SAB$1(
    byteOffset + initByteLength,
    { maxByteLength: byteOffset + maxByteLength }
  );

const CHANNEL = 'async';

let Worker$1 = class Worker extends Sender {
  constructor(scriptURL, options, resolve) {
    const channel = randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    const i32a = new Int32Array(sab);
    const handle = handler(sab, options, false);
    bc.addEventListener('message', async ({ data: [id, payload] }) => {
      await handle({ data: payload });
      bc.postMessage([id, new Uint8Array(sab, byteOffset, i32a[1])]);
    });
    super(...url(scriptURL, CHANNEL, options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
  }

  get channel() {
    return CHANNEL;
  }
};
var async = bootstrap(Worker$1);

var async$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Worker: Worker$1,
  default: async
});

export { SAB as S, Worker$1 as W, async$1 as a };
