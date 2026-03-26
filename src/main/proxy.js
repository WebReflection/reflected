import reflected, { channel } from '../index.js';

import { assign, create } from '../shared.js';

export { channel };

/**
 * @param {string | symbol} syncing
 * @param {string | symbol} name
 * @returns
 */
const deadlock = (syncing, name) => `💀🔒 - main.${String(syncing)}() is invoking worker.${String(name)}()`;

export default async (url, options) => {
  let t = 0, syncing = '';
  const debug = options.debug ?? false;
  const target = create(null);
  const worker = await reflected(url, {
    ...options,
    onsync: (
      debug ?
        (async ([name, args]) => {
          syncing = name;
          try { return await target[name]?.(...args) }
          finally { syncing = '' }
        }) :
        (([name, args]) => target[name]?.(...args))
    )
  });
  return assign(worker, {
    proxy: new Proxy(target, {
      get: debug ?
        (target, name) => (
          target[name] ??
          (target[name] = async (...args) => {
            if (syncing) t = setTimeout(console.warn, 3e3, deadlock(syncing, name));
            try { return await worker.send([name, args]) }
            finally {
              syncing = '';
              clearTimeout(t);
            }
          })
        ) :
        ((target, name) => (
          target[name] ?? (target[name] = (...args) => worker.send([name, args]))
        )),
      set: (target, name, value) => {
        const ok = name !== 'then';
        if (ok) target[name] = value;
        return ok;
      },
    }),
  });
};
