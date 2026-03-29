import { w as withResolvers } from './shared-CjWXp6-D.js';
import { h as handler } from './shared-Czh3AlGt.js';
import './sender-C0gu9RzR.js';
import './views-DBBYng9N.js';

const { promise, resolve } = withResolvers();

const channel = 'broadcast';

var broadcast = handler(
  promise,
  ({ data: [sab, main, channel] }) => resolve([sab, main, new BroadcastChannel(channel)]),
);

export { channel, broadcast as default };
