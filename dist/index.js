import { w as withResolvers } from './with-resolvers-DsO_nhbc.js';
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
  if (reflected === 'message') get = import(/* webpackIgnore: true */'./message-vCWcUEmt.js');
  else if (reflected === 'broadcast') get = import(/* webpackIgnore: true */'./broadcast-eR5_7TCY.js');
  else if (reflected === 'xhr') get = import(/* webpackIgnore: true */'./xhr-D5doTN7D.js');
  else get = import(/* webpackIgnore: true */'./async-OLiknCrf.js');
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
    module$1 = (await import(/* webpackIgnore: true */'./broadcast-B4sl9DBp.js')).default;
  }
  else {
    channel = 'message';
    module$1 = (await import(/* webpackIgnore: true */'./message-D_SM4ST4.js')).default;
  }
}
else if (navigator.serviceWorker) {
  channel = 'xhr';
  module$1 = (await import(/* webpackIgnore: true */'./xhr-BZOjL92j.js')).default;
}
else {
  channel = 'async';
  module$1 = (await import(/* webpackIgnore: true */'./async-CM1iXZPW.js').then(function (n) { return n.a; })).default;
}

var module_default = module$1;

export { channel, module_default as default };
