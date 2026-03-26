import worker, { channel } from '../index.js';

const { create } = Object;

export { channel };

export default async options => {
  const target = create(null);
  const sync = await worker({
    ...options,
    onsend: ([name, args]) => target[name](...args),
  });
  return new Proxy(target, {
    get(target, name) {
      // the curse of potentially awaiting proxies in the wild
      // requires this ugly guard around `then`
      if (name === 'then') return;
      return target[name] ?? (target[name] = (...args) => sync([name, args]));
    },
    // @ts-ignore
    set(target, name, value) {
      const ok = name !== 'then';
      if (ok) target[name] = value;
      return ok;
    },
  });
};
