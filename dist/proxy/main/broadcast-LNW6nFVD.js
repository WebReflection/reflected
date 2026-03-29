import { w as withResolvers } from './shared-CV7CPYuP.js';
import { h as handler } from './shared-C3U1MNPd.js';
import './sender-Dkjjbv2Y.js';
import './channel-NcnPEVL4.js';

const { promise, resolve } = withResolvers();

const channel = 'broadcast';

var broadcast = handler(
  promise,
  ({ data: [sab, main, channel] }) => resolve([sab, main, new BroadcastChannel(channel)]),
);

export { channel, broadcast as default };
