import reflected, { channel } from '../index.js';

import { assign } from '../shared.js';

const { create } = Object;

export { channel };

/**
 * @param {string} syncing
 * @param {string} name
 * @returns
 */
const deadlock = (syncing, name) => `☠️ deadlock: main.${syncing}(...args) is calling worker.${name}(...args)`;

export default async (url, options) => {
  let syncing = '';
  const target = create(null);
  const worker = await reflected(url, {
    ...options,
    async onsync([name, args]) {
      syncing = name;
      try { return await target[name]?.(...args) }
      finally { syncing = '' }
    },
  });
  return assign(worker, {
    proxy: new Proxy(target, {
      get: (target, name) => (
        target[name] ??
        (target[name] = async (...args) => {
          if (syncing) throw new Error(deadlock(String(syncing), String(name)));
          try { return await worker.send([name, args]) }
          finally { syncing = '' }
        })
      ),
      set: (target, name, value) => {
        const ok = name !== 'then';
        if (ok) target[name] = value;
        return ok;
      },
    }),
  });
};
