import { w as withResolvers } from './shared-5Nhc4gvB.js';
import { h as handler } from './shared-DZdgWBc6.js';
import './sender-B7Xmjz4q.js';
import './views-C3SJnvMr.js';

const { promise, resolve } = withResolvers();

const channel = 'message';

var message = handler(
  promise,
  ({ data: [sab, main], ports: [channel] }) => resolve([sab, main, channel])
);

export { channel, message as default };
