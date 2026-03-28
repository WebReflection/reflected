import { MAIN, WORKER, SOCKET, DRIVER } from './channels.js';

import local from 'reflected-ffi/local';
import nextResolver from 'next-resolver';

import main from '../main/proxy.js';

import { assign } from '../shared.js';

const encoder = new TextEncoder;
const uid32View = new Int32Array(1);
const uid8View = new Uint8Array(uid32View.buffer);
const BYTES = 4; // Int32Array.BYTES_PER_ELEMENT;

/**
 * 
 * @param {Uint8Array} prefix
 * @param {0 | 1 | 2} type
 * @param {Uint8Array} data
 * @returns
 */
const asUint8View = (prefix, type, data) => {
  const ui8a = new Uint8Array(BYTES + 1 + data.length);
  ui8a.set(prefix, 0);
  ui8a[BYTES] = type;
  ui8a.set(data, BYTES + 1);
  return ui8a;
};

/**
 * @param {string} url
 * @param {import('../index.js').MainOptions & import('reflected-ffi/local').LocalOptions} options
 */
export default async (url, options) => {
  const worker = await main(url, options);
  const { proxy } = worker;

  const { terminate: end } = worker;
  const terminate = () => {
    ws?.close();
    ffi.terminate();
    end.call(worker);
  };

  let ws;
  if (options?.ws) {
    const [next, resolve] = nextResolver(Number);
    const [uid, opened] = next();
    const worker = proxy[DRIVER];
    ws = new WebSocket(options?.ws);
    ws.onerror = console.error;
    ws.onclose = terminate;
    ws.onopen = async () => {
      uid32View[0] = 0;
      ws.send(asUint8View(uid8View, 0, encoder.encode(SOCKET)));
      resolve(uid);
    };
    ws.onmessage = async event => {
      const view = new Uint8Array(await event.data.arrayBuffer());
      // TODO: try subarray instead
      const data = view.slice(BYTES + 1);
      const type = view[BYTES];
      uid8View.set(view, 0);
      if (type === 1)
        resolve(uid32View[0], data);
      else if (type === 2) {
        const result = await worker(data);
        ws.send(asUint8View(view.subarray(0, BYTES), type, result));
      }
    };
    proxy[SOCKET] = async data => {
      await opened;
      const [uid, promise] = next();
      uid32View[0] = uid;
      ws.send(asUint8View(uid8View, 1, data));
      return promise;
    };
  }

  const ffi = local({
    timeout: 0,
    buffer: true,
    ...options,
    // @ts-ignore
    reflect: proxy[WORKER],
  });

  // @ts-ignore
  proxy[MAIN] = args => ffi.reflect(...args);

  return assign(worker, { ffi, terminate });
};
