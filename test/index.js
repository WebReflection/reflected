import reflected, { channel } from '../dist/index.js';
log.append(`bootstrapping: ${channel}\n`);

try {
  const worker = await reflected('./worker.js', {
    serviceWorker: location.search === '?sw' ? './mini-coi.js' : './sw.js',
    ondata: async (data, ...rest) => {
      // console.log('main', data, rest);
      // await new Promise(resolve => setTimeout(resolve, 1000));
      return new Int32Array([6, 7, 8, 9, 10]);
    }
  });

  worker.addEventListener(
    'message',
    (event) => {
      log.append(`reflected channel: ${event.data}\n`);
    },
    { once: true }
  );
} catch (error) {
  log.append(`error: ${error.message}\n`);
}
