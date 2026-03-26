import { MAIN, WORKER } from './channels.js';

import local from 'reflected-ffi/local';

import main from '../main/proxy.js';

const { assign } = Object;

/**
 * @param {string} url
 * @param {import('../index.js').MainOptions & import('reflected-ffi/local').LocalOptions} options
 */
export default async (url, options) => {
  const worker = await main(url, options);
  const { proxy } = worker;

  const ffi = local({
    timeout: 0,
    buffer: true,
    ...options,
    // @ts-ignore
    reflect: proxy[WORKER],
  });

  // @ts-ignore
  proxy[MAIN] = args => ffi.reflect(...args);

  const { terminate } = worker;
  return assign(worker, {
    ffi,
    terminate() {
      ffi.terminate();
      terminate.call(worker);
    },
  });
};
