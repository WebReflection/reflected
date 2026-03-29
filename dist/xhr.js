//@ts-check

/**
 * @template T
 * @typedef {{promise: Promise<T>, resolve: (value: T) => void, reject: (reason?: any) => void}} Resolvers
 */

// fallback for Android WebView
//@ts-ignore
const withResolvers = Promise.withResolvers || function withResolvers() {
  var a, b, c = new this((resolve, reject) => {
    a = resolve;
    b = reject;
  });
  return {resolve: a, reject: b, promise: c};
};

/**
 * @template T
 * @type {() => Resolvers<T>}
 */
var withResolvers$1 = withResolvers.bind(Promise);

// @ts-check

/**
 * @param {number} [start]
 * @returns {() => number}
 */
var i32 = start => {
  const i32 = new Int32Array(1);
  return () => i32[0]++;
};

// shorter: 'fc260aad-4404-43b8-ae9d-2c06554bb294'.split('-').map(s => parseInt(s, 16)).reduce((p, c) => p + c).toString(16)
var SHARED_CHANNEL = 'fc260aad-4404-43b8-ae9d-2c06554bb294';

const byteOffset = Int32Array.BYTES_PER_ELEMENT * 2;

let hasRandomUUID = true;
try {
  crypto.randomUUID();
} catch (_) {
  hasRandomUUID = false;
}

const identity = value => value;

const randomUUID = hasRandomUUID ?
  (() => crypto.randomUUID() ):
  (() => (Date.now() + Math.random()).toString(36));

const { isArray: isArray$2 } = Array;

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
      if (isArray$2(data) && data.length === 2 && data[0] === SHARED_CHANNEL) {
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
    const { promise, resolve } = withResolvers$1();
    this.#requests.set(id, resolve);
    super.postMessage([SHARED_CHANNEL, [id, payload]], ...rest);
    return promise;
  }
}

//@ts-check

let { SharedArrayBuffer: SAB$1 } = globalThis;

try {
  //@ts-ignore due valid options not recognized
  new SAB$1(4, { maxByteLength: 8 });
}
catch (_) {
  SAB$1 = /** @type {SharedArrayBufferConstructor} */(
    /** @type {unknown} */(
      class SharedArrayBuffer extends ArrayBuffer {
        get growable() {
          //@ts-ignore due valid property not recognized
          return super.resizable;
        }
        /** @param {number} newLength */
        grow(newLength) {
          //@ts-ignore due valid method not recognized
          super.resize(newLength);
        }
      }
    )
  );
}

var SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SAB$1(
    byteOffset + initByteLength,
    { maxByteLength: byteOffset + maxByteLength }
  );

let i$1 = 0;

const FALSE = i$1++;
const TRUE = i$1++;

const UNDEFINED = i$1++;
const NULL = i$1++;

const NUMBER = i$1++;
const UI8 = i$1++;
const NAN = i$1++;
const INFINITY = i$1++;
const N_INFINITY = i$1++;
const ZERO = i$1++;
const N_ZERO = i$1++;

const BIGINT = i$1++;
const BIGUINT = i$1++;

const STRING = i$1++;

const SYMBOL = i$1++;

const ARRAY = i$1++;
const BUFFER = i$1++;
const DATE = i$1++;
const ERROR = i$1++;
const MAP = i$1++;
const OBJECT = i$1++;
const REGEXP = i$1++;
const SET = i$1++;
const VIEW = i$1++;

const IMAGE_DATA = i$1++;
const BLOB = i$1++;
const FILE = i$1++;

const RECURSION = i$1++;

class Never {}

const ImageData = globalThis.ImageData || /** @type {typeof ImageData} */(Never);

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

/** @type {Map<symbol, string>} */
const symbols = new Map(
  Reflect.ownKeys(Symbol).map(
    key => [Symbol[key], `@${String(key)}`]
  )
);

/**
 * @param {symbol} value
 * @param {string} description
 * @returns {string}
 */
const asSymbol = (value, description) => (
  description === void 0 ? '?' :
  (Symbol.keyFor(value) === void 0 ? `!${description}` : `#${description}`)
);

/**
 * Extract the value from a pair of type and value.
 * @param {string} name
 * @returns {symbol}
 */
const fromSymbol = name => {
  switch (name[0]) {
    case '@': return Symbol[name.slice(1)];
    case '#': return Symbol.for(name.slice(1));
    case '!': return Symbol(name.slice(1));
    default: return Symbol();
  }
};

/**
 * Create the name of a symbol.
 * @param {symbol} value
 * @returns {string}
 */
const toSymbol = value => symbols.get(value) || asSymbol(value, value.description);

const defineProperty = Object.defineProperty;

const isArray$1 = Array.isArray;

const isView = ArrayBuffer.isView;

const MAX_ARGS = 0x7FFF;

/**
 * @param {number[]} output
 * @param {Uint8Array} value 
 */
const push = (output, value) => {
  for (let $ = output.push, i = 0, length = value.length; i < length; i += MAX_ARGS)
    $.apply(output, value.subarray(i, i + MAX_ARGS));
};

const decoder$1 = new TextDecoder;

const encoder$1 = new TextEncoder;

const buffer = new ArrayBuffer(8);
const dv = new DataView(buffer);
const u8a8 = new Uint8Array(buffer);

const { getPrototypeOf } = Object;
const { construct } = Reflect;
const { toStringTag } = Symbol;

const toTag = (ref, name = ref[toStringTag]) =>
  name in globalThis ? name : toTag(construct(getPrototypeOf(ref.constructor),[0]));

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

const handler = (sab, options, useAtomics) => {
  const i32a = new Int32Array(sab);
  const encode = (options.encoder ?? encoder)({ byteOffset });
  const onsync = options.onsync ?? identity;

  const resolve = (length => {
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

const CHANNEL$1 = 'async';

let Worker$2 = class Worker extends Sender {
  constructor(scriptURL, options, resolve) {
    const channel = randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    const i32a = new Int32Array(sab);
    const handle = handler(sab, options);
    bc.addEventListener('message', async ({ data: [id, payload] }) => {
      await handle({ data: payload });
      bc.postMessage([id, new Uint8Array(sab, byteOffset, i32a[1])]);
    });
    super(...url(scriptURL, CHANNEL$1, options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
  }

  get channel() {
    return CHANNEL$1;
  }
};

const CHANNEL = 'xhr';

const channels = new Map;

const sharedBC = new BroadcastChannel(SHARED_CHANNEL);
sharedBC.addEventListener('message', async ({ data: [op, details] }) => {
  if (op === 'request') {
    const [uid, [id, channel]] = details;
    const responses = channels.get(channel);
    if (responses) {
      const promise = responses.get(id);
      responses.delete(id);
      sharedBC.postMessage(['response', [uid, await promise]]);
    }
  }
});

const { promise: sw, resolve: resolve$1 } = withResolvers$1();
let init = true;

const activate = (swc, options) => {
  let w, c = true, { url } = options;
  swc.getRegistration(url)
    .then(r => (r ?? swc.register(url, options)))
    .then(function ready(r) {
      const { controller } = swc;
      c = c && !!controller;
      w = (r.installing || r.waiting || r.active);
      if (!w) return activate(swc, options);
      if (w.state === 'activated') {
        if (c) {
          // allow ServiceWorker swap on different URL
          if (controller.scriptURL === url)
            return resolve$1();
          r.unregister();
        }
        location.reload();
      }
      else {
        w.addEventListener('statechange', () => ready(r), { once: true });
      }
    });
};

let Worker$1 = class Worker extends Sender {
  #channel;
  constructor(scriptURL, options, resolve) {
    if (init) {
      init = false;
      let { serviceWorker } = options;
      if (!serviceWorker) {
        // @ts-ignore
        return new Worker$2(scriptURL, options, resolve);
      }
      if (typeof serviceWorker === 'string') serviceWorker = { url: serviceWorker };
      serviceWorker.url = new URL(serviceWorker.url, location.href).href;
      activate(navigator.serviceWorker, serviceWorker);
    }
    const channel = randomUUID();
    const bc = new BroadcastChannel(channel);
    const sab = SAB(options);
    const responses = new Map;
    const i32a = new Int32Array(sab);
    const handle = handler(sab, options);
    channels.set(channel, responses);
    bc.addEventListener('message', async ({ data: [id, payload] }) => {
      const { promise, resolve } = withResolvers$1();
      responses.set(id, promise);
      await handle({ data: payload });
      resolve(new Uint8Array(sab, byteOffset, i32a[1]));
    });
    super(...url(scriptURL, CHANNEL, options));
    super.addEventListener('message', () => resolve(this), { once: true });
    super.postMessage(post(sab, options).concat(channel));
    this.#channel = channel;
  }

  terminate() {
    channels.delete(this.#channel);
    super.terminate();
  }

  get channel() {
    return CHANNEL;
  }
};
var main = (scriptURL, options) => {
  const { promise, resolve } = withResolvers$1();
  const worker = new Worker$1(scriptURL, options, resolve);
  return worker instanceof Worker$2 ? promise : sw.then(() => promise);
};

//@ts-check


/** @typedef {Map<number, any>} Cache */

/**
 * @param {Cache} cache
 * @param {number} index
 * @param {any} value
 * @returns {any}
 */
const $ = (cache, index, value) => {
  cache.set(index, value);
  return value;
};

/**
 * @param {Uint8Array} input
 */
const number = input => {
  u8a8[0] = input[i++];
  u8a8[1] = input[i++];
  u8a8[2] = input[i++];
  u8a8[3] = input[i++];
  u8a8[4] = input[i++];
  u8a8[5] = input[i++];
  u8a8[6] = input[i++];
  u8a8[7] = input[i++];
};

/**
 * @param {Uint8Array} input
 * @returns {number}
 */
const size = input => {
  u8a8[0] = input[i++];
  u8a8[1] = input[i++];
  u8a8[2] = input[i++];
  u8a8[3] = input[i++];
  return dv.getUint32(0, true);
};

/**
 * @param {Uint8Array} input
 * @param {Cache} cache
 * @returns {any}
 */
const deflate = (input, cache) => {
  switch (input[i++]) {
    case NUMBER: {
      number(input);
      return dv.getFloat64(0, true);
    }
    case UI8: return input[i++];
    case OBJECT: {
      const object = $(cache, i - 1, {});
      for (let j = 0, length = size(input); j < length; j++)
        object[deflate(input, cache)] = deflate(input, cache);
      return object;
    }
    case ARRAY: {
      const array = $(cache, i - 1, []);
      for (let j = 0, length = size(input); j < length; j++)
        array.push(deflate(input, cache));
      return array;
    }
    case VIEW: {
      const index = i - 1;
      const name = deflate(input, cache);
      return $(cache, index, new globalThis[name](deflate(input, cache)));
    }
    case BUFFER: {
      const index = i - 1;
      const length = size(input);
      return $(cache, index, input.slice(i, i += length).buffer);
    }
    case STRING: {
      const index = i - 1;
      const length = size(input);
      // this could be a subarray but it's not supported on the Web and
      // it wouldn't work with arrays instead of typed arrays.
      return $(cache, index, decoder$1.decode(input.slice(i, i += length)));
    }
    case DATE: {
      return $(cache, i - 1, new Date(deflate(input, cache)));
    }
    case MAP: {
      const map = $(cache, i - 1, new Map);
      for (let j = 0, length = size(input); j < length; j++)
        map.set(deflate(input, cache), deflate(input, cache));
      return map;
    }
    case SET: {
      const set = $(cache, i - 1, new Set);
      for (let j = 0, length = size(input); j < length; j++)
        set.add(deflate(input, cache));
      return set;
    }
    case ERROR: {
      const index = i - 1;
      const name = deflate(input, cache);
      const message = deflate(input, cache);
      const stack = deflate(input, cache);
      const Class = globalThis[name] || Error;
      const error = new Class(message);
      return $(cache, index, defineProperty(error, 'stack', { value: stack }));
    }
    /* c8 ignore start */
    case IMAGE_DATA: {
      const index = i - 1;
      const data = deflate(input, cache);
      const width = deflate(input, cache);
      const height = deflate(input, cache);
      const colorSpace = deflate(input, cache);
      const pixelFormat = deflate(input, cache);
      const settings = { colorSpace, pixelFormat };
      return $(cache, index, new ImageData(data, width, height, settings));
    }
    /* c8 ignore stop */
    case REGEXP: {
      const index = i - 1;
      const source = deflate(input, cache);
      const flags = deflate(input, cache);
      return $(cache, index, new RegExp(source, flags));
    }
    case FALSE: return false;
    case TRUE: return true;
    case NAN: return NaN;
    case INFINITY: return Infinity;
    case N_INFINITY: return -Infinity;
    case ZERO: return 0;
    case N_ZERO: return -0;
    case NULL: return null;
    case BIGINT: return (number(input), dv.getBigInt64(0, true));
    case BIGUINT: return (number(input), dv.getBigUint64(0, true));
    case SYMBOL: return fromSymbol(deflate(input, cache));
    case RECURSION: return cache.get(size(input));
    case BLOB: {
      const index = i - 1;
      const type = deflate(input, cache);
      const size = deflate(input, cache);
      return $(cache, index, new Blob([input.slice(i, i += size)], { type }));
    }
    case FILE: {
      const index = i - 1;
      const name = deflate(input, cache);
      const lastModified = deflate(input, cache);
      const blob = deflate(input, cache);
      return $(cache, index, new File([blob], name, { type: blob.type, lastModified }));
    }
    // this covers functions too
    default: return undefined;
  }
};

let i = 0;

/**
 * @param {Uint8Array} value
 * @returns {any}
 */
const decode = value => {
  i = 0;
  return deflate(value, new Map);
};

/**
 * @param {{ byteOffset?: number }} [options]
 * @returns {(length: number, buffer: ArrayBufferLike) => any}
 */
const decoder = ({ byteOffset = 0 } = {}) => (length, buffer) => decode(
  new Uint8Array(buffer, byteOffset, length)
);

const { isArray } = Array;

var sender = options => {
  const onsend = options.onsend ?? identity;
  addEventListener('message', async event => {
    const { data } = event;
    if (isArray(data) && data[0] === SHARED_CHANNEL) {
      event.stopImmediatePropagation();
      event.preventDefault();
      const [id, payload] = data[1];
      postMessage([SHARED_CHANNEL, [id, await onsend(payload)]]);
    }
  });
  return options;
};

const { parse, stringify } = JSON;

const { promise, resolve } = withResolvers$1();

addEventListener(
  'message',
  ({ data: [_, main, channel] }) => resolve([main, channel]),
  { once: true }
);

const channel = 'xhr';

const handle = (channel, options) => {
  const bc = new BroadcastChannel(channel);
  const next = i32();
  const decode = (options.decoder ?? decoder)({ byteOffset: 0 });
  const { serviceWorker } = options;
  return (payload, ...rest) => {
    const id = next();
    // @ts-ignore
    bc.postMessage([id, payload], ...rest);
    const xhr = new XMLHttpRequest;
    xhr.open('POST', serviceWorker, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(stringify([id, channel]));
    const { length, buffer } = new Uint8Array(parse(xhr.responseText));
    return options.onsync(length ? decode(length, buffer) : void 0);
  };
};

var worker = options => promise.then(([main, channel]) => {
  postMessage(1);
  return handle(channel, sender({ ...main, ...options }));
});

var xhr = (
  'importScripts' in globalThis ? worker : main
);

export { channel, xhr as default };
