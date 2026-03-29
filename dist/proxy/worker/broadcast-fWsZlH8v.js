import { w as withResolvers } from './shared-DR7YYduq.js';
import { h as handler } from './shared-Cn1K0k8G.js';
import './sender-D5Lm-DmC.js';
import './channel-NcnPEVL4.js';

const { promise, resolve } = withResolvers();

const channel = 'broadcast';

var broadcast = handler(
  promise,
  ({ data: [sab, main, channel] }) => resolve([sab, main, new BroadcastChannel(channel)]),
);

export { channel, broadcast as default };
