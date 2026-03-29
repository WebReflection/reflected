// shorter: 'fc260aad-4404-43b8-ae9d-2c06554bb294'.split('-').map(s => parseInt(s, 16)).reduce((p, c) => p + c).toString(16)
var SHARED_CHANNEL = 'fc260aad-4404-43b8-ae9d-2c06554bb294';

const DIRECT           = 0;
const REMOTE           = 1 << 0;
const OBJECT           = 1 << 1;
const ARRAY            = 1 << 2;
const FUNCTION         = 1 << 3;
const SYMBOL           = 1 << 4;
const BIGINT           = 1 << 5;
const BUFFER           = 1 << 6;

const VIEW             = BUFFER | ARRAY;
const REMOTE_OBJECT    = REMOTE | OBJECT;
const REMOTE_FUNCTION  = REMOTE | FUNCTION;

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

const assign = Object.assign;

const isArray = Array.isArray;

const isView = ArrayBuffer.isView;

/**
 * A type/value pair.
 * @typedef {[number, any]} TypeValue
 */

/**
 * Create a type/value pair.
 * @param {number} type
 * @param {any} value
 * @returns {TypeValue}
 */
const tv = (type, value) => [type, value];

const identity$1 = value => value;

const array = [];
const object = {};

/* c8 ignore start */
const callback = function () {};
/* c8 ignore stop */

/**
 * Create a function that loops through an array and applies a function to each value.
 * @param {(value:any, cache?:Map<any, any>) => any} asValue
 * @returns
 */
const loopValues = asValue => (
  /**
   * Loop through an array and apply a function to each value.
   * @param {any[]} arr
   * @param {Map} [cache]
   * @returns
   */
  (arr, cache = new Map) => {
    for (let i = 0, length = arr.length; i < length; i++)
      arr[i] = asValue(arr[i], cache);
    return arr;
  }
);

/**
 * Extract the value from a pair of type and value.
 * @param {TypeValue} pair
 * @returns {string|symbol}
 */
const fromKey = ([type, value]) => type === DIRECT ? value : fromSymbol(value);

/**
 * Associate a key with an optionally transformed value.
 * @param {string|symbol} value
 * @returns {TypeValue}
 */
const toKey = value => typeof value === 'string' ?
  tv(DIRECT, value) : tv(SYMBOL, toSymbol(value))
;

const MAX_ARGS = 0x7FFF;

/**
 * @param {number[]} output
 * @param {Uint8Array} value 
 */
const push = (output, value) => {
  for (let $ = output.push, i = 0, length = value.length; i < length; i += MAX_ARGS)
    $.apply(output, value.subarray(i, i + MAX_ARGS));
};

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

const create = Object.create;

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

export { ARRAY as A, BUFFER as B, DIRECT as D, FUNCTION as F, OBJECT as O, REMOTE as R, SHARED_CHANNEL as S, VIEW as V, assign as a, isArray as b, BIGINT as c, SYMBOL as d, toSymbol as e, fromSymbol as f, isView as g, REMOTE_FUNCTION as h, identity$1 as i, callback as j, array as k, loopValues as l, REMOTE_OBJECT as m, toKey as n, object as o, fromKey as p, create as q, byteOffset as r, identity as s, tv as t, defineProperty as u, randomUUID as v, withResolvers$1 as w, push as x };
