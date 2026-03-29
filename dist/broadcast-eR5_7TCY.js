import { w as withResolvers } from './with-resolvers-DsO_nhbc.js';
import { h as handler } from './shared-DVDPRDN_.js';
import './sender-BSx3lj4w.js';
import './shared-Ccm1cPah.js';

const { promise, resolve } = withResolvers();

const channel = 'broadcast';

var broadcast = handler(
  promise,
  ({ data: [sab, main, channel] }) => resolve([sab, main, new BroadcastChannel(channel)]),
);

export { channel, broadcast as default };
