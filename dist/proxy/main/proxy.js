import { w as withResolvers, a as assign, c as create } from './shared-CV7CPYuP.js';
import { n as native } from './shared-array-buffer-BQgQXQvC.js';

/** @typedef {import('./main/shared.js').Options} MainOptions */
/** @typedef {import('./worker/shared.js').Options} WorkerOptions */

/** @type {string} */
let channel;

/** @type {Function} */
let module$1;

if ('importScripts' in globalThis) {
  let get;
  const { promise, resolve } = withResolvers();
  // @ts-ignore
  const reflected = new URL(location).searchParams.get('reflected');
  channel = reflected;
  if (reflected === 'message') get = import(/* webpackIgnore: true */'./message-uirwoNUQ.js');
  else if (reflected === 'broadcast') get = import(/* webpackIgnore: true */'./broadcast-LNW6nFVD.js');
  else if (reflected === 'xhr') get = import(/* webpackIgnore: true */'./xhr-WnkM0dVo.js');
  else get = import(/* webpackIgnore: true */'./async-8J3q5T6q.js');
  module$1 = async options => {
    const { data, ports } = await promise;
    const { default: reflect } = await get;
    const event = new Event('message');
    // @ts-ignore
    event.data = data;
    // @ts-ignore
    event.ports = ports;
    dispatchEvent(event);
    return reflect(options);
  };
  addEventListener('message', resolve, { once: true });
}
else if (native) {
  if ('InstallTrigger' in globalThis) {
    channel = 'broadcast';
    module$1 = (await import(/* webpackIgnore: true */'./broadcast-CR8vlkKk.js')).default;
  }
  else {
    channel = 'message';
    module$1 = (await import(/* webpackIgnore: true */'./message-j-4BYSZ4.js')).default;
  }
}
else if (navigator.serviceWorker) {
  channel = 'xhr';
  module$1 = (await import(/* webpackIgnore: true */'./xhr-BUjEbkCh.js')).default;
}
else {
  channel = 'async';
  module$1 = (await import(/* webpackIgnore: true */'./async-Di4MuQWe.js').then(function (n) { return n.a; })).default;
}

var reflected = module$1;

/**
 * @param {string | symbol} syncing
 * @param {string | symbol} name
 * @returns
 */
const deadlock = (syncing, name) => `💀🔒 - main.${String(syncing)}() is invoking worker.${String(name)}()`;

var proxy = async (url, options) => {
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
          finally { syncing = ''; }
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

export { channel, proxy as default };
