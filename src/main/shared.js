import withResolvers from '/node_modules/@webreflection/utils/src/with-resolvers.js';

const { notify, store } = Atomics;
const { isView } = ArrayBuffer;

const minByteLength = Int32Array.BYTES_PER_ELEMENT * 2;

export const SAB = ({ minByteLength = 1032, maxByteLength = 8200 }) =>
  new SharedArrayBuffer(minByteLength, { maxByteLength });

export const handler = (sab, options) => {
  const i32a = new Int32Array(sab);
  return async ({ data }, ...rest) => {
    let result = await options.ondata(data, ...rest);
    if (!isView(result)) result = new Int32Array(result);
    const { byteLength } = result.buffer;
    const requiredByteLength = byteLength + minByteLength;
    if (sab.byteLength < requiredByteLength) sab.grow(requiredByteLength);
    i32a.set(result, 2);
    store(i32a, 1, result.length);
    store(i32a, 0, 1);
    notify(i32a, 0);
  };
};

export const post = (sab, options) => [sab, { ...options, ondata: void 0 }];

export const url = (scriptURL, reflected) => {
  const url = new URL(scriptURL, location.href);
  url.searchParams.set('reflected', reflected);
  return url;
};

export { withResolvers };
