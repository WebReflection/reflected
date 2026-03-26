import reflected, { channel } from '../dist/proxy/main/proxy.js';
log.append(`bootstrapping: ${channel}\n`);

const worker = await reflected('./worker.js', {
  serviceWorker: location.search === '?async' ? undefined : './sw.js',
});

const { proxy } = worker;
proxy.test = async (...args) => args.reduce((a, b) => a + b, 0);

log.append(`consuming: ${worker.channel}\n`);

console.log(await proxy.compute('a', 1));
