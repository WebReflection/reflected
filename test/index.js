import reflected, { channel } from '../dist/index.js';
log.append(`bootstrapping: ${channel}\n`);

try {
  const worker = await reflected('./worker.js', {
    serviceWorker: location.search === '?async' ? undefined : './sw.js',
    onsend: async (data, ...rest) => {
      // console.log('onsend', data, rest);
      return data;
    },
    onsync: async (data, ...rest) => {
      // console.log('main', data, rest);
      // await new Promise(resolve => setTimeout(resolve, 1000));
      return [6, 7, 8, 9, 10];
    },
    onerror: console.error,
  });

  log.append(`consuming: ${worker.channel}\n`);

  worker.addEventListener(
    'message',
    (event) => {
      log.append(`reflected channel: ${event.data}\n`);
    },
    { once: true }
  );

  worker.send([1, 2, 3, 4, 5]).then(data => {
    log.append(`send: [${data}]\n`);
  });
} catch (error) {
  log.append(`error: ${error.message}\n`);
}

