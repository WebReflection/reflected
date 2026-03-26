import reflected, { channel } from '../dist/proxy/main/proxy.js';
log.append(`bootstrapping: ${channel}\n`);

const debug = location.search === '?debug';

const worker = await reflected('./worker.js', {
  debug,
  serviceWorker: location.search === '?async' ? undefined : './sw.js',
  onsend(payload) {
    console.log('worker.send(payload) returned', payload);
    return payload;
  }
});

const { proxy } = worker;
proxy.test = async (...args) => {
  // ☠️ test deadlock - a worker waiting synchroonusly main cannot respond !
  if (debug) await proxy.compute('a', 1);
  return args.reduce((a, b) => a + b, 0);
};

log.append(`consuming: ${worker.channel}\n`);

console.log(await proxy.compute('a', 1));
