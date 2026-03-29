import { w as withResolvers } from './with-resolvers-DsO_nhbc.js';
import { h as handler } from './shared-DVDPRDN_.js';
import './sender-BSx3lj4w.js';
import './shared-Ccm1cPah.js';

const { promise, resolve } = withResolvers();

const channel = 'message';

var message = handler(
  promise,
  ({ data: [sab, main], ports: [channel] }) => resolve([sab, main, channel])
);

export { channel, message as default };
