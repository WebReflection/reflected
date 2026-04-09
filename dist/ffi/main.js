import { S as SHARED_CHANNEL, f as fromArray, o as object, i as identity, a as assign, b as fromKey, c as isArray, R as REMOTE, d as SYMBOL, e as fromSymbol, F as FUNCTION, A as ARRAY, O as OBJECT, t as tv, B as BIGINT, g as toSymbol, h as REMOTE_FUNCTION, I as ImageData, j as isView, V as VIEW, k as BUFFER, l as REMOTE_ARRAY, m as REMOTE_OBJECT, n as loopValues, D as DIRECT, p as toKey, w as withResolvers, q as assign$1, r as create } from './shared-5Nhc4gvB.js';
import { t as toTag } from './global-LTfnrHcF.js';
import { i as i32 } from './i32-Cw-Rqr5y.js';
import { n as native } from './shared-array-buffer-BQgQXQvC.js';

// Main thread <-> Worker thread
const MAIN = 'M:' + SHARED_CHANNEL;
const WORKER = 'W:' + SHARED_CHANNEL;

// Worker thread <-> Server thread
const SOCKET = 'S:' + SHARED_CHANNEL;
const DRIVER = 'D:' + SHARED_CHANNEL;

let i = 0;

// extras
const UNREF = i++;
const ASSIGN = i++;
const EVALUATE = i++;
const GATHER = i++;
const QUERY = i++;

// traps
const APPLY = i++;
const CONSTRUCT = i++;
const DEFINE_PROPERTY = i++;
const DELETE_PROPERTY = i++;
const GET = i++;
const GET_OWN_PROPERTY_DESCRIPTOR = i++;
const GET_PROTOTYPE_OF = i++;
const HAS = i++;
const IS_EXTENSIBLE = i++;
const OWN_KEYS = i++;
i++;
const SET = i++;
const SET_PROTOTYPE_OF = i++;

/**
 * @param {ArrayBufferLike} value
 * @param {boolean} direct
 * @returns {BufferDetails}
 */
const toBuffer = (value, direct) => [
  direct ? value : fromArray(new Uint8Array(value)),
  //@ts-ignore
  value.resizable ? value.maxByteLength : 0
];

/**
 * @param {ArrayBufferView} value
 * @param {boolean} direct
 * @returns {ViewDetails}
 */
const toView = (value, direct) => {
  //@ts-ignore
  const { BYTES_PER_ELEMENT, byteOffset, buffer, length } = value;
  return [
    toTag(value),
    toBuffer(buffer, direct),
    byteOffset,
    length !== ((buffer.byteLength - byteOffset) / BYTES_PER_ELEMENT) ? length : 0,
  ];
};

const brackets = /\[('|")?(.+?)\1\]/g;

const keys = (target, key) => target?.[key];

/**
 * Parses the given path and returns the value at the given target.
 * @param {any} target
 * @param {string} path
 * @returns {any}
 */
var query = (target, path) => path.replace(brackets, '.$2').split('.').reduce(keys, target);

/**
 * Parses each given path and returns each value at the given target.
 * @param {any} target
 * @param  {...(string|symbol)[]} keys
 * @returns {any[]}
 */
var gather = (target, ...keys) => keys.map(asResult, target);

function asResult(key) {
  return typeof key === 'string' ? query(this, key) : this[key];
}

/**
 * @template T
 * @typedef {Object} Heap
 * @property {() => void} clear
 * @property {(ref:T) => number} id
 * @property {(id:number) => T} ref
 * @property {(id:number) => boolean} unref
 */

/**
 * Create a heap-like utility to hold references in memory.
 * @param {number} [id=0] The initial `id` which is `0` by default.
 * @param {Map<number, any>} [ids=new Map] The used map of ids to references.
 * @param {Map<any, number>} [refs=new Map] The used map of references to ids.
 * @returns {Heap<any>}
 */
var heap = (id = 0, ids = new Map, refs = new Map) => {
  const next = i32(id);
  return {
    clear: () => {
      ids.clear();
      refs.clear();
    },
    id: ref => {
      let uid = refs.get(ref);
      if (uid === void 0) {
        /* c8 ignore next */
        while (ids.has(uid = next()));
        ids.set(uid, ref);
        refs.set(ref, uid);
      }
      return uid;
    },
    ref: id => ids.get(id),
    unref: id => {
      refs.delete(ids.get(id));
      return ids.delete(id);
    },
  };
};

// import DEBUG from './utils/debug.js';


const Node = globalThis.Node || class Node {};

const {
  apply,
  construct,
  defineProperty,
  deleteProperty,
  get,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  has,
  isExtensible,
  ownKeys,
  set,
  setPrototypeOf,
} = Reflect;

/**
 * @typedef {Object} LocalOptions Optional utilities used to orchestrate local <-> remote communication.
 * @property {Function} [reflect=identity] The function used to reflect operations via the remote receiver. Currently only `apply` and `unref` are supported.
 * @property {Function} [transform=identity] The function used to transform local values into simpler references that the remote side can understand.
 * @property {Function} [remote=identity] The function used to intercept remote invokes *before* these happen. Usable to sync `events` or do other tasks.
 * @property {Function} [module] The function used to import modules when remote asks to `import(...)` something.
 * @property {boolean} [buffer=false] Optionally allows direct buffer serialization breaking JSON compatibility.
 * @property {number} [timeout=-1] Optionally allows remote values to be cached when possible for a `timeout` milliseconds value. `-1` means no timeout.
 */

/**
 * @param {LocalOptions} options
 * @returns
 */
var local = ({
  reflect = identity,
  transform = identity,
  remote = identity,
  module = name => import(name),
  buffer = false,
  timeout = -1,
} = object) => {
  // received values arrive via postMessage so are compatible
  // with the structured clone algorithm
  const fromValue = (value, cache = new Map) => {
    if (!isArray(value)) return value;
    const [t, v] = value;
    switch (t) {
      case OBJECT: {
        if (v === null) return globalThis;
        let cached = cache.get(value);
        if (!cached) {
          cached = v;
          cache.set(value, v);
          for (const k in v) v[k] = fromValue(v[k], cache);
        }
        return cached;
      }
      case ARRAY: {
        return cache.get(value) || (
          cache.set(value, v),
          fromValues(v, cache)
        );
      }
      case FUNCTION: {
        let wr = weakRefs.get(v), fn = wr?.deref();
        if (!fn) {
          /* c8 ignore start */
          if (wr) fr.unregister(wr);
          /* c8 ignore stop */
          fn = function (...args) {
            remote.apply(this, args);

            // values reflected asynchronously are not passed stringified
            // because it makes no sense to use Atomics and SharedArrayBuffer
            // to transfer these ... yet these must reflect the current state
            // on this local side of affairs.
            for (let i = 0, length = args.length; i < length; i++)
              args[i] = toValue(args[i]);

            const result = reflect(APPLY, v, toValue(this), args);
            return result.then(fromValue);
          };
          wr = new WeakRef(fn);
          weakRefs.set(v, wr);
          fr.register(fn, v, wr);
        }
        return fn;
      }
      case SYMBOL: return fromSymbol(v);
      default: return (t & REMOTE) ? ref(v) : v;
    }
  };

  // OBJECT, DIRECT, VIEW, BUFFER, REMOTE_ARRAY, REMOTE_OBJECT, REMOTE_FUNCTION, SYMBOL, BIGINT
  /**
   * Converts values into TypeValue pairs when these
   * are not JSON compatible (symbol, bigint) or
   * local (functions, arrays, objects, globalThis).
   * @param {any} value the current value
   * @returns {any} the value as is or its TypeValue counterpart
   */
  const toValue = value => {
    switch (typeof value) {
      case 'object': {
        if (value === null) break;
        if (value === globalThis) return globalTarget;
        const $ = transform(value);
        return ((hasDirect && direct.has($)) || $ instanceof ImageData) ?
          tv(DIRECT, $) : (
          isView($) ?
            tv(VIEW, toView($, buffer)) : (
              $ instanceof ArrayBuffer ?
                tv(BUFFER, toBuffer($, buffer)) :
                tv(isArray($) ? REMOTE_ARRAY : REMOTE_OBJECT, id($))
            )
        );
      }
      case 'function': return tv(REMOTE_FUNCTION, id(transform(value)));
      case 'symbol': return tv(SYMBOL, toSymbol(value));
      case 'bigint': return tv(BIGINT, value.toString());
    }
    return value;
  };

  const fromValues = loopValues(fromValue);
  const fromKeys = loopValues(fromKey);
  const toKeys = loopValues(toKey);

  const { clear, id, ref, unref } = heap();

  const arrayKey = /^(?:[0-9]+|length)$/;
  const memoize = -1 < timeout;
  const weakRefs = new Map;
  const globalTarget = tv(OBJECT, null);
  const fr = new FinalizationRegistry(v => {
    weakRefs.delete(v);
    reflect(UNREF, v);
  });

  let hasDirect = false, direct;

  return {
    assign,
    gather,
    query,

    /**
     * Alows local references to be passed directly to the remote receiver,
     * either as copy or serliazied values (it depends on the implementation).
     * @template {WeakKey} T
     * @param {T} value
     * @returns {T}
     */
    direct(value) {
      if (!hasDirect) {
        // if (DEBUG) console.debug('DIRECT');
        hasDirect = true;
        direct = new WeakSet;
      }
      direct.add(value);
      return value;
    },

    /**
     * Provide a portable API that just invokes the given callback with the given arguments.
     * @param {Function} callback
     * @param  {...any} args
     * @returns {any}
     */
    evaluate: (callback, ...args) => apply(callback, null, args),

    /**
     * This callback reflects locally every remote call.
     * It accepts TypeValue pairs but it always returns a string
     * to make it possible to use Atomics and SharedArrayBuffer.
     * @param {number} method
     * @param {number?} uid
     * @param  {...any} args
     * @returns
     */
    reflect(method, uid, ...args) {
      // if (DEBUG) console.debug(method === UNREF ? 'GC' : 'ROUNDTRIP');
      const isGlobal = uid === null;
      const target = isGlobal ? globalThis : ref(uid);
      // the order is by most common use cases
      switch (method) {
        case GET: {
          const key = fromKey(args[0]);
          const asModule = isGlobal && key === 'import';
          const value = asModule ? module : get(target, key);
          const result = toValue(value);
          if (!memoize) return result;
          let cache = asModule, t = target, d;
          if (!asModule && !(
            // avoid caching DOM related stuff (all accessors)
            (t instanceof Node) ||
            // avoid also caching Array length or index accessors
            (isArray(t) && typeof key === 'string' && arrayKey.test(key))
          )) {
            // cache unknown properties but ...
            if (key in target) {
              // ... avoid caching accessors!
              while (!(d = getOwnPropertyDescriptor(t, key))) {
                t = getPrototypeOf(t);
                /* c8 ignore start */
                // this is an emergency case for "unknown" values
                if (!t) break;
                /* c8 ignore stop */
              }
              cache = !!d && 'value' in d;
            }
            // accessing non existent properties could be repeated
            // for no reason whatsoever and it gets removed once
            // the property is eventually set so ...
            else cache = true;
          }
          return [cache, result];
        }
        case APPLY: {
          const map = new Map;
          return toValue(apply(target, fromValue(args[0], map), fromValues(args[1], map)));
        }
        case SET: return set(target, fromKey(args[0]), fromValue(args[1]));
        case HAS: return has(target, fromKey(args[0]));
        case OWN_KEYS: return toKeys(ownKeys(target), weakRefs);
        case CONSTRUCT: return toValue(construct(target, fromValues(args[0])));
        case GET_OWN_PROPERTY_DESCRIPTOR: {
          const descriptor = getOwnPropertyDescriptor(target, fromKey(args[0]));
          if (descriptor) {
            for (const k in descriptor)
              descriptor[k] = toValue(descriptor[k]);
          }
          return descriptor;
        }
        case DEFINE_PROPERTY: return defineProperty(target, fromKey(args[0]), fromValue(args[1]));
        case DELETE_PROPERTY: return deleteProperty(target, fromKey(args[0]));
        case GET_PROTOTYPE_OF: return toValue(getPrototypeOf(target));
        case SET_PROTOTYPE_OF: return setPrototypeOf(target, fromValue(args[0]));
        case ASSIGN: {
          assign(target, fromValue(args[0]));
          return;
        }
        case EVALUATE: {
          const body = fromValue(args[0]);
          const fn = Function(`return(${body}).apply(null,arguments)`);
          return toValue(apply(fn, null, fromValues(args[1])));
        }
        case GATHER: {
          args = fromKeys(args[0], weakRefs);
          for (let k, i = 0, length = args.length; i < length; i++) {
            k = args[i];
            args[i] = toValue(typeof k === 'string' ? query(target, k) : target[k]);
          }
          return args;
        }
        case QUERY: return toValue(query(target, args[0]));
        case UNREF: return unref(uid);
        case IS_EXTENSIBLE: return isExtensible(target);
      }
    },

    /**
     * Terminates the local side of the communication,
     * erasing and unregistering all the cached references.
     */
    terminate() {
      for (const wr of weakRefs.values()) fr.unregister(wr);
      weakRefs.clear();
      clear();
    },
  };
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
      const wr = /** @type {Resolvers<V>} */(/** @type {unknown} */(withResolvers()));
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

/** @type {Function} */
let module$1;

if ('importScripts' in globalThis) {
  let get;
  const { promise, resolve } = withResolvers();
  // @ts-ignore
  const reflected = new URL(location).searchParams.get('reflected');
  if (reflected === 'message') get = import(/* webpackIgnore: true */'./message-2Dqj3uZ3.js');
  else if (reflected === 'broadcast') get = import(/* webpackIgnore: true */'./broadcast-uydYnG6E.js');
  else if (reflected === 'xhr') get = import(/* webpackIgnore: true */'./xhr-jR69__mg.js');
  else get = import(/* webpackIgnore: true */'./async-CbwemiL2.js');
  module$1 = async options => {
    const { data, ports } = await promise;
    const { default: reflect } = await get;
    const event = new Event('message');
    // @ts-ignore
    event.data = data;
    // @ts-ignore
    event.ports = ports;
    dispatchEvent(event);
    return reflect(options);
  };
  addEventListener('message', resolve, { once: true });
}
else if (native) {
  if ('InstallTrigger' in globalThis) {
    module$1 = (await import(/* webpackIgnore: true */'./broadcast-DIucqhL0.js')).default;
  }
  else {
    module$1 = (await import(/* webpackIgnore: true */'./message-Co0Oew7f.js')).default;
  }
}
else if (navigator.serviceWorker) {
  module$1 = (await import(/* webpackIgnore: true */'./xhr-Be-3qHQb.js')).default;
}
else {
  module$1 = (await import(/* webpackIgnore: true */'./async-D6Zj6i_Q.js').then(function (n) { return n.a; })).default;
}

var reflected = module$1;

/**
 * @param {string | symbol} syncing
 * @param {string | symbol} name
 * @returns
 */
const deadlock = (syncing, name) => `💀🔒 - main.${String(syncing)}() is invoking worker.${String(name)}()`;

var main$1 = async (url, options) => {
  let t = 0, syncing = '';
  const debug = options.debug ?? false;
  const target = create(null);
  const worker = await reflected(url, {
    ...options,
    onsync: (
      debug ?
        (async ([name, args]) => {
          syncing = name;
          try { return await target[name]?.(...args) }
          finally { syncing = ''; }
        }) :
        (([name, args]) => target[name]?.(...args))
    )
  });
  return assign$1(worker, {
    proxy: new Proxy(target, {
      get: debug ?
        (target, name) => (
          target[name] ??
          (target[name] = async (...args) => {
            if (syncing) t = setTimeout(console.warn, 3e3, deadlock(syncing, name));
            try { return await worker.send([name, args]) }
            finally {
              syncing = '';
              clearTimeout(t);
            }
          })
        ) :
        ((target, name) => (
          target[name] ?? (target[name] = (...args) => worker.send([name, args]))
        )),
      set: (target, name, value) => {
        const ok = name !== 'then';
        if (ok) target[name] = value;
        return ok;
      },
    }),
  });
};

const BYTES = 4; // Int32Array.BYTES_PER_ELEMENT;
const encoder = new TextEncoder;
const uid8View = new Uint8Array(BYTES);
const uid32Data = new DataView(uid8View.buffer);

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
var main = async (url, options) => {
  const worker = await main$1(url, options);
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
      uid32Data.setInt32(0, 0, true);
      ws.send(asUint8View(uid8View, 0, encoder.encode(SOCKET)));
      resolve(uid);
    };
    ws.onmessage = async event => {
      const view = new Uint8Array(await event.data.arrayBuffer());
      // TODO: try subarray instead
      const data = view.slice(BYTES + 1);
      const type = view[BYTES];
      uid8View.set(view.subarray(0, BYTES), 0);
      if (type === 1)
        resolve(uid32Data.getInt32(0, true), data);
      else if (type === 2) {
        const result = await worker(data);
        ws.send(asUint8View(view.subarray(0, BYTES), 2, result));
      }
    };
    proxy[SOCKET] = async data => {
      await opened;
      const [uid, promise] = next();
      uid32Data.setInt32(0, uid, true);
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

  return assign$1(worker, { ffi, terminate });
};

export { main as default };
