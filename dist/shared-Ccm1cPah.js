let i = 0;

const FALSE = i++;
const TRUE = i++;

const UNDEFINED = i++;
const NULL = i++;

const NUMBER = i++;
const UI8 = i++;
const NAN = i++;
const INFINITY = i++;
const N_INFINITY = i++;
const ZERO = i++;
const N_ZERO = i++;

const BIGINT = i++;
const BIGUINT = i++;

const STRING = i++;

const SYMBOL = i++;

const ARRAY = i++;
const BUFFER = i++;
const DATE = i++;
const ERROR = i++;
const MAP = i++;
const OBJECT = i++;
const REGEXP = i++;
const SET = i++;
const VIEW = i++;

const IMAGE_DATA = i++;
const BLOB = i++;
const FILE = i++;

const RECURSION = i++;

class Never {}

const ImageData = globalThis.ImageData || /** @type {typeof ImageData} */(Never);

const decoder = new TextDecoder;

const encoder = new TextEncoder;

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

const isArray = Array.isArray;

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

const buffer = new ArrayBuffer(8);
const dv = new DataView(buffer);
const u8a8 = new Uint8Array(buffer);

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

export { ARRAY as A, BLOB as B, isArray as C, DATE as D, ERROR as E, FILE as F, push as G, INFINITY as I, MAP as M, NULL as N, OBJECT as O, RECURSION as R, SYMBOL as S, TRUE as T, UI8 as U, VIEW as V, ZERO as Z, BIGUINT as a, byteOffset as b, BIGINT as c, dv as d, N_ZERO as e, fromSymbol as f, N_INFINITY as g, NAN as h, identity as i, FALSE as j, REGEXP as k, IMAGE_DATA as l, ImageData as m, defineProperty as n, SET as o, STRING as p, decoder as q, BUFFER as r, NUMBER as s, SHARED_CHANNEL as t, u8a8 as u, randomUUID as v, UNDEFINED as w, toSymbol as x, encoder as y, isView as z };
