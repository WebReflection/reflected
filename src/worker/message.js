import withResolvers from '@webreflection/utils/with-resolvers';
import { handler } from './shared.js';

const { promise, resolve } = withResolvers();

export const channel = 'message';

export default handler(
  promise,
  ({ data: [sab, main], ports: [channel] }) => resolve([sab, main, channel])
);
