import { u as identity, S as SHARED_CHANNEL, w as withResolvers, g as toSymbol, I as ImageData, j as isView, c as isArray$1, y as push, s as byteOffset } from './shared-5Nhc4gvB.js';
import { i as i32 } from './i32-Cw-Rqr5y.js';
import { o as UNDEFINED, d as dv, b as BIGINT, u as u8a8, S as SYMBOL, T as TRUE, g as FALSE, p as encoder$1, k as STRING, B as BLOB, F as FILE, h as REGEXP, i as IMAGE_DATA, E as ERROR, j as SET, M as MAP, D as DATE, m as BUFFER, V as VIEW, N as NULL, U as UI8, n as NUMBER, f as NAN, Z as ZERO, c as N_ZERO, e as N_INFINITY, I as INFINITY, R as RECURSION, a as BIGUINT, O as OBJECT, A as ARRAY } from './views-C3SJnvMr.js';
import { t as toTag } from './global-LTfnrHcF.js';

const { isArray } = Array;

class Sender extends Worker {
  #next;
  #requests;
  constructor(scriptURL, options) {
    const onsend = options.onsend ?? identity;
    super(scriptURL, options);
    this.#next = i32();
    this.#requests = new Map;
    super.addEventListener('message', async event => {
      const { data } = event;
      if (isArray(data) && data.length === 2 && data[0] === SHARED_CHANNEL) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const [id, payload] = data[1];
        const resolve = this.#requests.get(id);
        this.#requests.delete(id);
        resolve(await onsend(payload));
      }
    });
  }

  send(payload, ...rest) {
    const id = this.#next();
    const { promise, resolve } = withResolvers();
    this.#requests.set(id, resolve);
    super.postMessage([SHARED_CHANNEL, [id, payload]], ...rest);
    return promise;
  }
}

// This is an Array facade for the encoder.

class Stack {
  /**
   * @param {Stack} self
   * @param {Uint8Array} value
   */
  static push(self, value) {
    self.sync(false);
    self._(value, value.length);
  }

  /**
   * @param {ArrayBufferLike} buffer
   * @param {number} offset
   */
  constructor(buffer, offset) {
    /** @type {number[]} */
    const output = [];

    /** @private length */
    this.l = 0;

    /** @private output */
    this.o = output;

    /** @private view */
    this.v = new Uint8Array(buffer, offset);

    /** @type {typeof Array.prototype.push} */
    this.push = output.push.bind(output);
  }

  /**
   * @type {number}
   */
  get length() {
    return this.l + this.o.length;
  }

  /**
   * Sync all entries in the output to the buffer.
   * @param {boolean} last `true` if it's the last sync.
   */
  sync(last) {
    const output = this.o;
    const length = output.length;
    if (length) this._(last ? output : output.splice(0), length);
  }

  /**
   * Set a value to the buffer
   * @private
   * @param {Uint8Array|number[]} value
   * @param {number} byteLength
   */
  _(value, byteLength) {
    const { buffer, byteOffset } = this.v;
    const offset = this.l;
    this.l += byteLength;
    byteLength += byteOffset + offset;
    if (buffer.byteLength < byteLength)
      /** @type {SharedArrayBuffer} */(buffer).grow(byteLength);
    this.v.set(value, offset);
  }
}

//@ts-check


/** @typedef {Map<number, number[]>} Cache */

const { isNaN, isFinite, isInteger } = Number;
const { ownKeys } = Reflect;
const { is } = Object;

/**
 * @param {any} input
 * @param {number[]|Stack} output
 * @param {Cache} cache
 * @returns {boolean}
 */
const process = (input, output, cache) => {
  const value = cache.get(input);
  const unknown = !value;
  if (unknown) {
    dv.setUint32(0, output.length, true);
    cache.set(input, [u8a8[0], u8a8[1], u8a8[2], u8a8[3]]);
  }
  else
    output.push(RECURSION, value[0], value[1], value[2], value[3]);
  return unknown;
};

/**
 * @param {number[]|Stack} output
 * @param {number} type
 * @param {number} length
 */
const set = (output, type, length) => {
  dv.setUint32(0, length, true);
  output.push(type, u8a8[0], u8a8[1], u8a8[2], u8a8[3]);
};

/**
 * @param {any} input
 * @param {number[]|Stack} output
 * @param {Cache} cache
 */
const inflate = (input, output, cache) => {
  switch (typeof input) {
    case 'number': {
      if (input && isFinite(input)) {
        if (isInteger(input) && input < 256 && -1 < input)
          output.push(UI8, input);
        else {
          dv.setFloat64(0, input, true);
          output.push(NUMBER, u8a8[0], u8a8[1], u8a8[2], u8a8[3], u8a8[4], u8a8[5], u8a8[6], u8a8[7]);
        }
      }
      else if (isNaN(input)) output.push(NAN);
      else if (!input) output.push(is(input, 0) ? ZERO : N_ZERO);
      else output.push(input < 0 ? N_INFINITY : INFINITY);
      break;
    }
    case 'object': {
      switch (true) {
        case input === null:
          output.push(NULL);
          break;
        case !process(input, output, cache): break;
        case isArray$1(input): {
          const length = input.length;
          set(output, ARRAY, length);
          for (let i = 0; i < length; i++)
            inflate(input[i], output, cache);
          break;
        }
        case isView(input): {
          output.push(VIEW);
          inflate(toTag(input), output, cache);
          input = input.buffer;
          if (!process(input, output, cache)) break;
          // fallthrough
        }
        case input instanceof ArrayBuffer: {
          const ui8a = new Uint8Array(input);
          set(output, BUFFER, ui8a.length);
          //@ts-ignore
          pushView(output, ui8a);
          break;
        }
        case input instanceof Date:
          output.push(DATE);
          inflate(input.getTime(), output, cache);
          break;
        case input instanceof Map: {
          set(output, MAP, input.size);
          for (const [key, value] of input) {
            inflate(key, output, cache);
            inflate(value, output, cache);
          }
          break;
        }
        case input instanceof Set: {
          set(output, SET, input.size);
          for (const value of input)
            inflate(value, output, cache);
          break;
        }
        case input instanceof Error:
          output.push(ERROR);
          inflate(input.name, output, cache);
          inflate(input.message, output, cache);
          inflate(input.stack, output, cache);
          break;
        /* c8 ignore start */
        case input instanceof ImageData:
          output.push(IMAGE_DATA);
          inflate(input.data, output, cache);
          inflate(input.width, output, cache);
          inflate(input.height, output, cache);
          inflate(input.colorSpace, output, cache);
          //@ts-ignore
          inflate(input.pixelFormat, output, cache);
          break;
        /* c8 ignore stop */
        case input instanceof RegExp:
          output.push(REGEXP);
          inflate(input.source, output, cache);
          inflate(input.flags, output, cache);
          break;
        case input instanceof File: {
          output.push(FILE);
          inflate(input.name, output, cache);
          inflate(input.lastModified, output, cache);
          // fallthrough
        }
        case input instanceof Blob: {
          const size = input.size;
          output.push(BLOB);
          inflate(input.type, output, cache);
          inflate(size, output, cache);
          const length = output.length;
          //@ts-ignore
          pushView(output, new Uint8Array(size));
          blobs.push(input.arrayBuffer().then(buffer => [length, buffer]));
          break;
        }
        default: {
          if ('toJSON' in input) {
            const json = input.toJSON();
            inflate(json === input ? null : json, output, cache);
          }
          else {
            const keys = ownKeys(input);
            const length = keys.length;
            set(output, OBJECT, length);
            for (let i = 0; i < length; i++) {
              const key = keys[i];
              inflate(key, output, cache);
              inflate(input[key], output, cache);
            }
          }
          break;
        }
      }
      break;
    }
    case 'string': {
      if (process(input, output, cache)) {
        const encoded = encoder$1.encode(input);
        set(output, STRING, encoded.length);
        //@ts-ignore
        pushView(output, encoded);
      }
      break;
    }
    case 'boolean': {
      output.push(input ? TRUE : FALSE);
      break;
    }
    case 'symbol': {
      output.push(SYMBOL);
      inflate(toSymbol(input), output, cache);
      break;
    }
    case 'bigint': {
      let type = BIGINT;
      if (9223372036854775807n < input) {
        dv.setBigUint64(0, input, true);
        type = BIGUINT;
      }
      else dv.setBigInt64(0, input, true);
      output.push(type, u8a8[0], u8a8[1], u8a8[2], u8a8[3], u8a8[4], u8a8[5], u8a8[6], u8a8[7]);
      break;
    }
    // this covers functions too
    default: {
      output.push(UNDEFINED);
      break;
    }
  }
};

const blobs = [];

/** @type {typeof push|typeof Stack.push} */
let pushView = push;

/**
 * @param {{ byteOffset?: number, Array?: typeof Stack }} [options]
 * @returns {(value: any, buffer: ArrayBufferLike) => number | Promise<number>}
 */
const encoder = ({ byteOffset = 0, Array = Stack } = {}) => (value, buffer) => {
  const output = new Array(buffer, byteOffset);
  pushView = Array.push;
  inflate(value, output, new Map);
  const length = output.length;
  output.sync(true);
  return blobs.length ?
    Promise.all(blobs.splice(0)).then(entries => {
      const ui8a = new Uint8Array(buffer, byteOffset);
      for (const [len, buff] of entries)
        ui8a.set(new Uint8Array(buff), len);
      return length;
    }) :
    length;
};

const { notify, store } = Atomics;

const SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    byteOffset + initByteLength,
    { maxByteLength: byteOffset + maxByteLength }
  );

/**
 * @typedef {Object} ServiceWorkerOptions see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#options
 * @property {string} [url] will use the `serviceWorker` value if that is a `string`, otherwise it refers to where the service worker file is located.
 * @property {'classic' | 'module'} [type]
 * @property {'all' | 'imports' | 'none'} [updateViaCache]
 */

/**
 * @typedef {Object} Options
 * @property {(payload: unknown) => Int32Array | Promise<Int32Array>} [onsync] invoked when the worker expect a response as `Int32Array` to populate the SharedArrayBuffer with.
 * @property {(payload: unknown) => unknown | Promise<unknown>} [onsend] invoked when the worker replies to a `worker.send(data)` call.
 * @property {string} [ws] the WebSocket URL to use for worker <-> server communication.
 * @property {number} [initByteLength=1024] defines the initial byte length of the SharedArrayBuffer.
 * @property {number} [maxByteLength=8192] defines the maximum byte length (growth) of the SharedArrayBuffer.
 * @property {string | ServiceWorkerOptions} [serviceWorker] defines the service worker to use as fallback if SharedArrayBuffer is not supported. If not defined, the `async` fallback will be used so that no `sync` operations from the worker will be possible.
 * @property {import('reflected-ffi/encoder').encoder} [encoder] defines the encoder function to use to encode the result into the SharedArrayBuffer.
 */

/**
 * Initialize the worker channel communication and resolves with the worker instance.
 * @template T
 * @param {T} Worker
 * @returns
 */
const bootstrap = Worker => {
  /**
   * @param {string} scriptURL
   * @param {Options} options
   * @returns
   */
  return (scriptURL, options) => {
    const { promise, resolve } = withResolvers();
    // @ts-ignore
    new Worker(scriptURL, options, resolve);
    return /** @type {Promise<T>} */(promise);
  };
};

const handler = (sab, options, useAtomics) => {
  const i32a = new Int32Array(sab);
  const encode = (options.encoder ?? encoder)({ byteOffset });
  const onsync = options.onsync ?? identity;

  const resolve = useAtomics ?
    (length => {
      store(i32a, 1, length);
      store(i32a, 0, 1);
      notify(i32a, 0);
    }) :
    (length => {
      i32a[1] = length;
      i32a[0] = 1;
    });

  const process = result => {
    const length = encode(result, sab);
    return typeof length === 'number' ? resolve(length) : length.then(resolve);
  };

  return async ({ data }) => process(await onsync(data));
};

const isOK = value => {
  switch (typeof value) {
    case 'symbol':
    case 'function':
      return false;
  }
  return true;
};

const post = (sab, options) => {
  const opts = {};
  for (const key in options) {
    const value = options[key];
    if (isOK(key) && isOK(value)) opts[key] = value;
  }
  return [sab, opts];
};

const url = (scriptURL, reflected, options) => {
  const url = new URL(scriptURL, location.href);
  url.searchParams.set('reflected', reflected);
  return [url, { ...options, type: 'module' }];
};

export { Sender as S, SAB as a, bootstrap as b, handler as h, post as p, url as u };
