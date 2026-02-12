import { handler, withResolvers } from './shared.js';

const { promise, resolve } = withResolvers();

export default handler(
  promise,
  ({ data: [sab, main, channel] }) => resolve([sab, main, new BroadcastChannel(channel)]),
);
