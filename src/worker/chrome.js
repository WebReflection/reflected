import { handler, withResolvers } from './shared.js';

const { promise, resolve } = withResolvers();

export default handler(
  promise,
  ({ data: [sab, main], ports: [channel] }) => resolve([sab, main, channel])
);
