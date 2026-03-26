import main, { channel } from '../index.js';

const { create } = Object;

export { channel };

const { assign } = Object;

export default async (url, options) => {
  const target = create(null);
  const worker = await main(url, {
    ...options,
    onsync: ([name, args]) => target[name]?.(...args),
  });
  return assign(worker, {
    proxy: new Proxy(target, {
      get: (target, name) => (
        target[name] ??
        (target[name] = (...args) => worker.send([name, args]))
      ),
      set: (target, name, value) => {
        const ok = name !== 'then';
        if (ok) target[name] = value;
        return ok;
      },
    }),
  });
};
