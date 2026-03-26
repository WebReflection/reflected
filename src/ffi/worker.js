import { MAIN, WORKER } from './channels.js';

import remote from 'reflected-ffi/remote';

import worker from '../worker/proxy.js';

import { assign } from '../shared.js';

/**
 * @param {import('../index.js').WorkerOptions & import('reflected-ffi/remote').RemoteOptions} options
 */
export default async options => {
  const proxy = await worker(options);

  const ffi = remote({
    timeout: 0,
    buffer: true,
    ...options,
    reflect: (...args) => proxy[MAIN](args),
  });

  proxy[WORKER] = ffi.reflect;

  return { ffi, proxy };
};
