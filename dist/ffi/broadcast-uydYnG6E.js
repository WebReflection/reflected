import { w as withResolvers } from './shared-5Nhc4gvB.js';
import { h as handler } from './shared-DZdgWBc6.js';
import './sender-B7Xmjz4q.js';
import './views-C3SJnvMr.js';

const { promise, resolve } = withResolvers();

const channel = 'broadcast';

var broadcast = handler(
  promise,
  ({ data: [sab, main, channel] }) => resolve([sab, main, new BroadcastChannel(channel)]),
);

export { channel, broadcast as default };
