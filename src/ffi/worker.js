import { MAIN, WORKER } from './channels.js';

import remote from 'reflected-ffi/remote';

import worker from '../worker/proxy.js';

import { assign } from '../shared.js';

/**
 * @param {import('../index.js').WorkerOptions & import('reflected-ffi/remote').RemoteOptions} options
 */
export default async options => {
  const proxy = await worker(options);

  // @ts-ignore
  proxy[WORKER] = args => ffi.reflect(...args);

  const ffi = remote({
    timeout: 0,
    buffer: true,
    ...options,
    reflect: (...args) => proxy[MAIN](args),
  });

  return { ffi, proxy };
};
