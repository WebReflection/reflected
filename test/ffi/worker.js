import worker from '../../dist/ffi/worker.js';

const { ffi, proxy } = await worker();

console.log(ffi);
console.log(proxy);

// const body = ffi.global.document.body;
const body = ffi.query(ffi.global, 'document.body');

body.addEventListener('click', event => {
  console.log(event.type);
});

body.append('Hello World');
