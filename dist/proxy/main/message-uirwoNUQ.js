import { w as withResolvers } from './shared-CV7CPYuP.js';
import { h as handler } from './shared-C3U1MNPd.js';
import './sender-Dkjjbv2Y.js';
import './channel-NcnPEVL4.js';

const { promise, resolve } = withResolvers();

const channel = 'message';

var message = handler(
  promise,
  ({ data: [sab, main], ports: [channel] }) => resolve([sab, main, channel])
);

export { channel, message as default };
