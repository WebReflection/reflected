import local from 'reflected-ffi/local';

import main from '../index.js';

const { assign } = Object;

export default async (url, options) => {
  const ffi = local({
    timeout: 0,
    buffer: true,
    ...options,
    reflect: (...args) => worker.send(args),
  });

  const worker = await main(
    url,
    {
      ...options,
      onsync: args => ffi.reflect(...args),
    }
  );

  const { terminate } = worker;
  return assign(worker, {
    ffi,
    terminate() {
      ffi.terminate();
      terminate.call(worker);
    },
  });
};
