import local from 'reflected-ffi/local';

import main from '../index.js';

const { assign } = Object;

/**
 * @param {string} url
 * @param {import('../index.js').MainOptions & import('reflected-ffi/local').LocalOptions} options
 */
export default async (url, options) => {
  const ffi = local({
    timeout: 0,
    buffer: true,
    ...options,
    // @ts-ignore
    reflect: (...args) => worker.send(args),
  });

  const worker = /** @type {Worker} */(await main(
    url,
    {
      ...options,
      // @ts-ignore
      onsync: args => ffi.reflect(...args),
    }
  ));

  const { terminate } = worker;
  return assign(worker, {
    ffi,
    terminate() {
      ffi.terminate();
      terminate.call(worker);
    },
  });
};
