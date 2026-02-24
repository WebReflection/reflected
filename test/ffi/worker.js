import worker from '../../dist/ffi/worker.js';

const ffi = await worker();

console.log(ffi);

const body = ffi.query(ffi.global, 'document.body');

body.addEventListener('click', event => {
  console.log(event.type);
});

body.append('Hello World');
