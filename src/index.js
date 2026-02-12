import withResolvers from '/node_modules/@webreflection/utils/src/with-resolvers.js';

let module;

if ('importScripts' in globalThis) {
  let get;
  const { promise, resolve } = withResolvers();
  const reflected = new URL(location).searchParams.get('reflected');
  if (reflected === 'chrome') get = import('./worker/chrome.js');
  else if (reflected === 'firefox') get = import('./worker/firefox.js');
  module = async options => {
    const { data, ports } = await promise;
    const { default: reflect } = await get;
    const event = new Event('message');
    event.data = data;
    event.ports = ports;
    dispatchEvent(event);
    return reflect(options);
  };
  addEventListener('message', resolve, { once: true });
}
else if ('InstallTrigger' in globalThis) {
  module = (await import('./main/firefox.js')).default;
}
else {
  module = (await import('./main/chrome.js')).default;
}

export default module;
