import remote from 'reflected-ffi/remote';

import worker from '../index.js';

/**
 * @param {import('../index.js').WorkerOptions & import('reflected-ffi/remote').RemoteOptions} options
 */
export default async options => {
  const reflected = await worker({
    ...options,
    onsync: args => args,
    // @ts-ignore
    onsend: args => ffi.reflect(...args),
  });

  const ffi = remote({
    timeout: 0,
    buffer: true,
    ...options,
    reflect: (...args) => reflected(args),
  });

  return ffi;
};
