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

export { byteOffset as b, create as c, identity as i, randomUUID as r, withResolvers$1 as w };
