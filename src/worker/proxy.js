import reflected, { channel } from '../index.js';

import { create } from '../shared.js';

export { channel };

export default async options => {
  const target = create(null);
  const send = await reflected({
    ...options,
    onsend: ([name, args]) => target[name](...args),
  });
  return new Proxy(target, {
    get(target, name) {
      // the curse of potentially awaiting proxies in the wild
      // requires this ugly guard around `then`
      if (name === 'then') return;
      return target[name] ?? (target[name] = (...args) => send([name, args]));
    },
    // @ts-ignore
    set(target, name, value) {
      const ok = name !== 'then';
      if (ok) target[name] = value;
      return ok;
    },
  });
};
