import withResolvers from '@webreflection/utils/with-resolvers';
import { native } from '@webreflection/utils/shared-array-buffer';

/** @typedef {import('./main/shared.js').Options} MainOptions */
/** @typedef {import('./worker/shared.js').Options} WorkerOptions */

/** @type {string} */
let channel;

/** @type {Function} */
let module;

if ('importScripts' in globalThis) {
  let get;
  const { promise, resolve } = withResolvers();
  // @ts-ignore
  const reflected = new URL(location).searchParams.get('reflected');
  channel = reflected;
  if (reflected === 'message') get = import(/* webpackIgnore: true */'./worker/message.js');
  else if (reflected === 'broadcast') get = import(/* webpackIgnore: true */'./worker/broadcast.js');
  else if (reflected === 'xhr') get = import(/* webpackIgnore: true */'./worker/xhr.js');
  else get = import(/* webpackIgnore: true */'./worker/async.js');
  module = async options => {
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
    module = (await import(/* webpackIgnore: true */'./main/broadcast.js')).default;
  }
  else {
    channel = 'message';
    module = (await import(/* webpackIgnore: true */'./main/message.js')).default;
  }
}
else if (navigator.serviceWorker) {
  channel = 'xhr';
  module = (await import(/* webpackIgnore: true */'./main/xhr.js')).default;
}
else {
  channel = 'fallback';
  module = () => {};
}

export { channel };

export default module;
