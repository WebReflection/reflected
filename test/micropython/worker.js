import worker from '../../dist/ffi/worker.js';

const base = 'https://cdn.jsdelivr.net/npm/@micropython/micropython-webassembly-pyscript@latest';

const [
  { ffi, proxy },
  { loadMicroPython },
  code
] = await Promise.all([
  worker(),
  import(`${base}/micropython.mjs`),
  fetch('./main.py').then(r => r.text()),
]);

const interpreter = await loadMicroPython({ url: `${base}/micropython.wasm` });
const window = ffi.global;

interpreter.registerJsModule('reflected', {
  window,
  proxy,
  ffi,
  module: {
    main: name => window.import(name),
    worker: name => import(name),
  },
});

interpreter.runPythonAsync(code);
