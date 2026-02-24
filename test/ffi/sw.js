var CHANNEL = 'fc260aad-4404-43b8-ae9d-2c06554bb294';

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

//@ts-check


/**
 * @template V
 * @callback Resolve
 * @param {V?} [value]
 * @returns {void}
 */

/**
 * @callback Reject
 * @param {any?} [error]
 * @returns {void}
 */

/**
 * @template V
 * @typedef {object} Resolvers
 * @prop {Promise<V>} promise
 * @prop {Resolve<V>} resolve
 * @prop {Reject} reject
 */

/**
 * @template K,V
 * @typedef {() => [K, Promise<V>]} Next
 */

/**
 * @template K,V
 * @callback Resolver
 * @param {K} uid
 * @param {V?} [value]
 * @param {any?} [error]
 */

/**
 * @template K,V
 * @typedef {[Next<K,V>, Resolver<K,V>]} NextResolver
 */

/**
 * @template K,V
 * @param {(id: number) => K} [as]
 * @returns
 */
var nextResolver = (as = (id => /** @type {K} */(id))) => {
  /** @type {Map<K,Resolvers<V>>} */
  const map = new Map;
  const next = i32();
  return /** @type {NextResolver<K,V>} */([
    /** @type {Next<K,V>} */
    () => {
      let uid;
      do { uid = as(next()); }
      while (map.has(uid));
      const wr = /** @type {Resolvers<V>} */(/** @type {unknown} */(withResolvers$1()));
      map.set(uid, wr);
      return [uid, wr.promise];
    },
    /** @type {Resolver<K,V>} */
    (uid, value, error) => {
      const wr = map.get(uid);
      map.delete(uid);
      if (error) wr?.reject(error);
      else wr?.resolve(value);
    },
  ]);
};

const [next, resolve] = nextResolver();

const { protocol, host, pathname } = location;
const url = `${protocol}//${host}${pathname}`;

const bc = new BroadcastChannel(CHANNEL);
bc.addEventListener('message', ({ data: [op, details] }) => {
  if (op === 'response') {
    const [uid, payload] = details;
    resolve(uid, `[${payload.join(',')}]`);
  }
});

const response = {
  status: 200,
  statusText: 'OK',
  headers: new Headers({
    'Cache-Control': 'no-cache, must-revalidate',
    'Expires': 'Mon, 26 Jul 1997 05:00:00 GMT',
    'Content-type': 'application/json',
  })
};

const respond = async details => {
  const [uid, promise] = next();
  bc.postMessage(['request', [uid, details]]);
  return new Response(await promise, response);
};

// @ts-ignore
const activate = event => event.waitUntil(clients.claim());

const fetch = async event => {
  const { request: r } = event;
  if (r.method === 'POST' && r.url.startsWith(url)) {
    event.stopImmediatePropagation();
    event.respondWith(r.json().then(respond));
    event.preventDefault();
  }
};

// @ts-ignore
const install = () => skipWaiting();

addEventListener('activate', activate);
addEventListener('fetch', fetch);
addEventListener('install', install);
