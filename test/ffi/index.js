import worker from '../../dist/ffi/main.js';

const w = await worker('./worker.js', { serviceWorker: './sw.js' });

document.body.append('channel: ', w.channel, ' - ');

console.log(w);

