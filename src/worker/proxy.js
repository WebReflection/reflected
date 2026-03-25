import worker, { channel } from '../index.js';

const { create } = Object;

export { channel };

export default async options => {
  const sync = await worker(options);
  return new Proxy(create(null), {
    get(target, name) {
      // the curse of potentially awaiting proxies in the wild
      // requires this ugly guard around `then`
      if (name === 'then') return;
      return target[name] ?? (target[name] = (...args) => sync([name, args]));
    },
    // @ts-ignore
    set(map, name, value) {
      // TODO: implement remote calls from the worker
    },
  });
};
