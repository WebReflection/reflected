import worker from '../../dist/ffi/main.js';

const w = await worker('./worker.js', { serviceWorker: './sw.js' });

console.log(w);

