import { S as SHARED_CHANNEL, o as object, O as OBJECT, i as identity, a as assign, l as loopValues, b as isArray, R as REMOTE, B as BUFFER, V as VIEW, c as BIGINT, d as SYMBOL, f as fromSymbol, D as DIRECT, t as tv, e as toSymbol, F as FUNCTION, g as isView, h as REMOTE_FUNCTION, j as callback, k as array, m as REMOTE_OBJECT, n as toKey, p as fromKey, A as ARRAY, w as withResolvers, q as create } from './shared-CjWXp6-D.js';
import { t as toName } from './global-DzpOeFX2.js';
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

/** @typedef {[ArrayBufferLike|number[], number]} BufferDetails */
/** @typedef {[string, BufferDetails, number, number]} ViewDetails */

/**
 * @param {number} length
 * @param {number} maxByteLength
 * @returns {ArrayBufferLike}
 */
const resizable = (length, maxByteLength) => new ArrayBuffer(length, { maxByteLength });

/**
 * @param {BufferDetails} details 
 * @param {boolean} direct
 * @returns {ArrayBufferLike}
 */
const fromBuffer = ([value, maxByteLength], direct) => {
  const length = direct ? /** @type {ArrayBufferLike} */ (value).byteLength : /** @type {number[]} */ (value).length;
  if (direct) {
    if (maxByteLength) {
      const buffer = resizable(length, maxByteLength);
      new Uint8Array(buffer).set(new Uint8Array(/** @type {ArrayBufferLike} */ (value)));
      value = buffer;
    }
  }
  else {
    const buffer = maxByteLength ? resizable(length, maxByteLength) : new ArrayBuffer(length);
    new Uint8Array(buffer).set(/** @type {number[]} */ (value));
    value = buffer;
  }
  return /** @type {ArrayBufferLike} */ (value);
};

/**
 * @param {ViewDetails} details
 * @param {boolean} direct
 */
const fromView = ([name, args, byteOffset, length], direct) => {
  const buffer = fromBuffer(args, direct);
  const Class = globalThis[name];
  return length ? new Class(buffer, byteOffset, length) : new Class(buffer, byteOffset);
};

// (c) https://github.com/WebReflection/to-json-callback
// brought in here to avoid a dependency for quick testing

/**
 * @param {Function} [callback=this]
 * @returns {string}
 */
function toJSONCallback (callback = this) {
  return String(callback).replace(
    /^(async\s*)?(\bfunction\b)?(.*?)\(/,
    (_, isAsync, fn, name) => (
      name && !fn ?
        `${isAsync || ""}function ${name}(` :
        _
    ),
  );
}

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

/**
 * @param {number} timeout
 * @returns {typeof import('../ts/memo.js').Memo}
 */
var memo = timeout => {
  const entries = [];

  const drop = i => {
    const cached = entries.splice(i);
    while (i < cached.length)
      cached[i++].delete(cached[i++]);
  };

  const set = (self, key) => {
    if (entries.push(self, key) < 3)
      setTimeout(drop, timeout, 0);
  };

  return class Memo extends Map {
    static keys = Symbol();
    static proto = Symbol();

    drop(key, value) {
      if (key !== Memo.proto) super.delete(Memo.keys);
      super.delete(key);
      return value;
    }

    set(key, value) {
      set(super.set(key, value), key);
      return value;
    }
  }
};

/**
 * @typedef {Object} RemoteOptions Optional utilities used to orchestrate local <-> remote communication.
 * @property {Function} [reflect=identity] The function used to reflect operations via the remote receiver. All `Reflect` methods + `unref` are supported.
 * @property {Function} [transform=identity] The function used to transform local values into simpler references that the remote side can understand.
 * @property {Function} [released=identity] The function invoked when a reference is released.
 * @property {boolean} [buffer=false] Optionally allows direct buffer deserialization breaking JSON compatibility.
 * @property {number} [timeout=-1] Optionally allows remote values to be cached when possible for a `timeout` milliseconds value. `-1` means no timeout.
 */

/**
 * @param {RemoteOptions} options
 * @returns
 */
var remote = ({
  reflect = identity,
  transform = identity,
  released = identity,
  buffer = false,
  timeout = -1,
} = object) => {
  const fromKeys = loopValues(fromKey);
  const toKeys = loopValues(toKey);

  // OBJECT, DIRECT, VIEW, REMOTE_ARRAY, REMOTE_OBJECT, REMOTE_FUNCTION, SYMBOL, BIGINT
  const fromValue = value => {
    if (!isArray(value)) return value;
    const [t, v] = value;
    if (t & REMOTE) return asProxy(t, v);
    switch (t) {
      case OBJECT: return global;
      case DIRECT: return v;
      case SYMBOL: return fromSymbol(v);
      case BIGINT: return BigInt(v);
      case VIEW: return fromView(v, buffer);
      case BUFFER: return fromBuffer(v, buffer);
      // there is no other case
    }
  };

  const toValue = (value, cache = new Map) => {
    switch (typeof value) {
      case 'object': {
        if (value === null) break;
        if (value === globalThis) return globalTarget;
        if (reflected in value) return reference;
        let cached = cache.get(value);
        if (!cached) {
          const $ = transform(value);
          if (indirect || !direct.has($)) {
            if (isArray($)) {
              const a = [];
              cached = tv(ARRAY, a);
              cache.set(value, cached);
              for (let i = 0, length = $.length; i < length; i++)
                a[i] = toValue($[i], cache);
              return cached;
            }
            if (!isView($) && !($ instanceof ArrayBuffer) && toName($) === 'Object') {
              const o = {};
              cached = tv(OBJECT, o);
              cache.set(value, cached);
              // // the try/catch guards against WebAssembly opaque objects:
              // // https://github.com/pyodide/pyodide/issues/5929#issuecomment-3377201964
              // try { for (const _ in $) break; } catch { return cached }
              for (const k in $) o[k] = toValue($[k], cache);
              return cached;
            }
          }
          cached = tv(DIRECT, $);
          cache.set(value, cached);
        }
        return cached;
      }
      case 'function': {
        if (reflected in value) return reference;
        let cached = cache.get(value);
        if (!cached) {
          const $ = transform(value);
          cached = tv(FUNCTION, id($));
          cache.set(value, cached);
        }
        return cached;
      }
      case 'symbol': return tv(SYMBOL, toSymbol(value));
    }
    return value;
  };

  const toValues = loopValues(toValue);

  const asProxy = (t, v) => {
    let wr = weakRefs.get(v), proxy = wr?.deref();
    if (!proxy) {
      /* c8 ignore start */
      if (wr) fr.unregister(wr);
      /* c8 ignore stop */
      if (t === REMOTE_FUNCTION)
        proxy = new Proxy(callback, new FunctionHandler(t, v));
      else
        proxy = new Proxy(t === REMOTE_OBJECT ? object : array, new Handler(t, v));
      wr = new WeakRef(proxy);
      weakRefs.set(v, wr);
      fr.register(proxy, v, wr);
    }
    return proxy;
  };

  /**
   * Checks if the given value is a proxy created in the remote side.
   * @param {any} value
   * @returns {boolean}
   */
  const isProxy = value => {
    switch (typeof value) {
      case 'object': if (value === null) break;
      case 'function': return reflected in value;
    }
    return false;
  };

  const memoize = -1 < timeout;
  const Memo = /** @type {typeof import('./ts/memo.js').Memo} */(
    memoize ? memo(timeout) : Map
  );

  class Handler {
    constructor(t, v) {
      this.t = t;
      this.v = v;
      if (memoize) this.$ = new Memo;
    }

    get(_, key) {
      if (memoize && this.$.has(key)) return this.$.get(key);
      const value = reflect(GET, this.v, toKey(key));
      return memoize ?
        (value[0] ?
          this.$.set(key, fromValue(value[1])) :
          fromValue(value[1])) :
        fromValue(value)
      ;
    }

    set(_, key, value) {
      const result = reflect(SET, this.v, toKey(key), toValue(value));
      return memoize ? this.$.drop(key, result) : result;
    }

    // TODO: should `in` operations be cached too?
    has(_, prop) {
      if (prop === reflected) {
        reference = [this.t, this.v];
        return true;
      }
      return reflect(HAS, this.v, toKey(prop));
    }

    _oK() { return fromKeys(reflect(OWN_KEYS, this.v), weakRefs) }
    ownKeys(_) {
      return memoize ?
        (this.$.has(Memo.keys) ?
          this.$.get(Memo.keys) :
          this.$.set(Memo.keys, this._oK())) :
        this._oK()
      ;
    }

    // this would require a cache a part per each key or make
    // the Cache code more complex for probably little gain
    getOwnPropertyDescriptor(_, key) {
      const descriptor = fromValue(reflect(GET_OWN_PROPERTY_DESCRIPTOR, this.v, toKey(key)));
      if (descriptor) {
        for (const k in descriptor)
          descriptor[k] = fromValue(descriptor[k]);
      }
      return descriptor;
    }

    defineProperty(_, key, descriptor) {
      const result = reflect(DEFINE_PROPERTY, this.v, toKey(key), toValue(descriptor));
      return memoize ? this.$.drop(key, result) : result;
    }

    deleteProperty(_, key) {
      const result = reflect(DELETE_PROPERTY, this.v, toKey(key));
      return memoize ? this.$.drop(key, result) : result;
    }

    _gPO() { return fromValue(reflect(GET_PROTOTYPE_OF, this.v)) }
    getPrototypeOf(_) {
      /* c8 ignore start */
      return memoize ?
        (this.$.has(Memo.proto) ?
          this.$.get(Memo.proto) :
          this.$.set(Memo.proto, this._gPO())) :
        this._gPO()
      ;
      /* c8 ignore stop */
    }

    setPrototypeOf(_, value) {
      const result = reflect(SET_PROTOTYPE_OF, this.v, toValue(value));
      return memoize ? this.$.drop(Memo.proto, result) : result;
    }
    // way less common than others to be cached
    isExtensible(_) { return reflect(IS_EXTENSIBLE, this.v) }

    // ⚠️ due shared proxies' targets this cannot be reflected
    preventExtensions(_) { return false }
  }

  class FunctionHandler extends Handler {
    construct(_, args) { return fromValue(reflect(CONSTRUCT, this.v, toValues(args))) }

    apply(_, self, args) {
      const map = new Map;
      return fromValue(reflect(APPLY, this.v, toValue(self, map), toValues(args, map)));
    }

    get(_, key) {
      switch (key) {
        // skip obvious roundtrip cases
        case 'apply': return (self, args) => this.apply(_, self, args);
        case 'call': return (self, ...args) => this.apply(_, self, args);
        default: return super.get(_, key);
      }
    }
  }

  let indirect = true, direct, reference;

  const { apply } = Reflect;
  const { id, ref, unref } = heap();
  const weakRefs = new Map;
  const reflected = Symbol('reflected-ffi');
  const globalTarget = tv(OBJECT, null);
  const global = new Proxy(object, new Handler(OBJECT, null));
  const fr = new FinalizationRegistry(v => {
    weakRefs.delete(v);
    reflect(UNREF, v);
  });

  return {
    /**
     * The local global proxy reference.
     * @type {unknown}
     */
    global,

    isProxy,

    /** @type {typeof assign} */
    assign(target, ...sources) {
      const asProxy = isProxy(target);
      const assignment = assign(asProxy ? {} : target, ...sources);
      if (asProxy) reflect(ASSIGN, reference[1], toValue(assignment));
      return target;
    },

    /**
     * Alows local references to be passed directly to the remote receiver,
     * either as copy or serliazied values (it depends on the implementation).
     * @template {WeakKey} T
     * @param {T} value
     * @returns {T}
     */
    direct(value) {
      if (indirect) {
        indirect = false;
        direct = new WeakSet;
      }
      direct.add(value);
      return value;
    },

    /**
     * Evaluates elsewhere the given callback with the given arguments.
     * This utility is similar to puppeteer's `page.evaluate` where the function
     * content is evaluated in the local side and its result is returned.
     * @param {Function} callback
     * @param  {...any} args
     * @returns {any}
     */
    evaluate: (callback, ...args) => fromValue(
      reflect(EVALUATE, null, toJSONCallback(callback), toValues(args))
    ),

    /**
     * @param {object} target
     * @param  {...(string|symbol)} keys
     * @returns {any[]}
     */
    gather(target, ...keys) {
      const asProxy = isProxy(target);
      const asValue = asProxy ? fromValue : (key => target[key]);
      if (asProxy) keys = reflect(GATHER, reference[1], toKeys(keys, weakRefs));
      for (let i = 0; i < keys.length; i++) keys[i] = asValue(keys[i]);
      return keys;
    },

    /**
     * Queries the given target for the given path.
     * @param {any} target
     * @param {string} path
     * @returns {any}
     */
    query: (target, path) => (
      isProxy(target) ?
        fromValue(reflect(QUERY, reference[1], path)) :
        query(target, path)
    ),

    /**
     * The callback needed to resolve any local call. Currently only `apply` and `unref` are supported.
     * Its returned value will be understood by the remote implementation
     * and it is compatible with the structured clone algorithm.
     * @param {number} method
     * @param {number?} uid
     * @param  {...any} args
     * @returns
     */
    reflect: async (method, uid, ...args) => {
      switch (method) {
        case APPLY: {
          const [context, params] = args;
          for (let i = 0, length = params.length; i < length; i++)
            params[i] = fromValue(params[i]);
          return toValue(await apply(ref(uid), fromValue(context), params));
        }
        case UNREF: {
          released(ref(uid));
          return unref(uid);
        }
      }
    },
  };
};

/** @type {Function} */
let module$1;

if ('importScripts' in globalThis) {
  let get;
  const { promise, resolve } = withResolvers();
  // @ts-ignore
  const reflected = new URL(location).searchParams.get('reflected');
  if (reflected === 'message') get = import(/* webpackIgnore: true */'./message-mK0eTb54.js');
  else if (reflected === 'broadcast') get = import(/* webpackIgnore: true */'./broadcast-CKNplfox.js');
  else if (reflected === 'xhr') get = import(/* webpackIgnore: true */'./xhr-CRJGE1xP.js');
  else get = import(/* webpackIgnore: true */'./async-0Q0H4a_N.js');
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
    module$1 = (await import(/* webpackIgnore: true */'./broadcast-CbbtYobq.js')).default;
  }
  else {
    module$1 = (await import(/* webpackIgnore: true */'./message-Cxjrx_su.js')).default;
  }
}
else if (navigator.serviceWorker) {
  module$1 = (await import(/* webpackIgnore: true */'./xhr-DSsSGsb-.js')).default;
}
else {
  module$1 = (await import(/* webpackIgnore: true */'./async-DLrN8K6M.js').then(function (n) { return n.a; })).default;
}

var reflected = module$1;

var worker$1 = async options => {
  const target = create(null);
  const send = await reflected({
    ...options,
    onsend: ([name, args]) => target[name](...args),
  });
  return new Proxy(target, {
    get(target, name) {
      // the curse of potentially awaiting proxies in the wild
      // requires this ugly guard around `then`
      if (name === 'then') return;
      return target[name] ?? (target[name] = (...args) => send([name, args]));
    },
    // @ts-ignore
    set(target, name, value) {
      const ok = name !== 'then';
      if (ok) target[name] = value;
      return ok;
    },
  });
};

/**
 * @param {import('../index.js').WorkerOptions & import('reflected-ffi/remote').RemoteOptions} options
 */
var worker = async options => {
  const proxy = await worker$1(options);

  const ffi = remote({
    timeout: 0,
    buffer: true,
    ...options,
    reflect: (...args) => proxy[MAIN](args),
  });

  proxy[WORKER] = ffi.reflect;

  // @ts-ignore
  ffi.ws = options?.ws?.(
    // ondata
    fn => {
      proxy[DRIVER] = fn;
    },
    // send data
    proxy[SOCKET]
  );

  return { ffi, proxy };
};

export { worker as default };
