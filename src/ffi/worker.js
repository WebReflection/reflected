import remote from 'reflected-ffi/remote';

import worker from '../index.js';

export default async options => {
  const reflected = await worker({
    ...options,
    onsync: args => args,
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
