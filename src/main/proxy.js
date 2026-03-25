import main, { channel } from '../index.js';

const { create } = Object;

export { channel };

const { assign } = Object;

const handler = {
  get() {
    // TODO: implement remote calls from the worker
  },
  set: (target, name, value) => {
    target[name] = value;
    return true;
  },
};

export default async (url, options) => {
  const target = create(null);
  return assign(
    await main(
      url,
      {
          ...options,
          onsync: ([name, args]) => target[name]?.(...args),
      }
    ),
    {
      proxy: new Proxy(target, handler),
    }
  );
};
