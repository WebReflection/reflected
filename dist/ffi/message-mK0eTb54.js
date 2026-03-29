import { w as withResolvers } from './shared-CjWXp6-D.js';
import { h as handler } from './shared-Czh3AlGt.js';
import './sender-C0gu9RzR.js';
import './views-DBBYng9N.js';

const { promise, resolve } = withResolvers();

const channel = 'message';

var message = handler(
  promise,
  ({ data: [sab, main], ports: [channel] }) => resolve([sab, main, channel])
);

export { channel, message as default };
