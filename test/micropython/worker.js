import worker from '../../dist/ffi/worker.js';

const base = 'https://cdn.jsdelivr.net/npm/@micropython/micropython-webassembly-pyscript@latest';

const { loadMicroPython } = await import(`${base}/micropython.mjs`);

const interpreter = await loadMicroPython({ url: `${base}/micropython.wasm` });

// TODO: provide the MicroPython function that will be used to handle server data
const { ffi, proxy } = await worker({
  ws(ondata, send) {
    ondata(console.log);
    console.log(send);
  },
});
const window = ffi.global;
delete ffi.global;

interpreter.registerJsModule('reflected', {
  window,
  proxy,
  ffi,
  module: {
    main: name => window.import(name),
    worker: name => import(name),
    server: name => { /* TODO */ },
  },
});

interpreter.runPythonAsync(await fetch('./main.py').then(r => r.text()));
