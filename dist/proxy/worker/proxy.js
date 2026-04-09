import { w as withResolvers, c as create } from './shared-DR7YYduq.js';
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
  if (reflected === 'message') get = import(/* webpackIgnore: true */'./message-Bots8UXM.js');
  else if (reflected === 'broadcast') get = import(/* webpackIgnore: true */'./broadcast-fWsZlH8v.js');
  else if (reflected === 'xhr') get = import(/* webpackIgnore: true */'./xhr-PD-LRKFf.js');
  else get = import(/* webpackIgnore: true */'./async-CZJaURwO.js');
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
    module$1 = (await import(/* webpackIgnore: true */'./broadcast-DRVfswix.js')).default;
  }
  else {
    channel = 'message';
    module$1 = (await import(/* webpackIgnore: true */'./message-sej0J6k5.js')).default;
  }
}
else if (navigator.serviceWorker) {
  channel = 'xhr';
  module$1 = (await import(/* webpackIgnore: true */'./xhr-CQDzS28h.js')).default;
}
else {
  channel = 'async';
  module$1 = (await import(/* webpackIgnore: true */'./async-DaSAye0a.js').then(function (n) { return n.a; })).default;
}

var reflected = module$1;

var proxy = async options => {
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

export { channel, proxy as default };
