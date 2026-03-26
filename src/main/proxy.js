import main, { channel } from '../index.js';

const { create } = Object;

export { channel };

const { assign } = Object;

/**
 * @param {string} syncing
 * @param {string} name
 * @returns
 */
const deadlock = (syncing, name) => `☠️ deadlock: main.${syncing}(...args) is calling worker.${name}(...args)`;

export default async (url, options) => {
  let syncing = '';
  const target = create(null);
  const worker = await main(url, {
    ...options,
    onsync([name, args]) {
      syncing = name;
      return target[name]?.(...args);
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
