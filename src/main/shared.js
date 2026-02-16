import withResolvers from '@webreflection/utils/with-resolvers';

const { notify, store } = Atomics;

export const minByteLength = Int32Array.BYTES_PER_ELEMENT * 2;

export const SAB = ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    minByteLength + initByteLength,
    { maxByteLength: minByteLength + maxByteLength }
  );

export const handler = (sab, options, useAtomics) => {
  const i32a = new Int32Array(sab);
  return async ({ data }) => {
    const result = await options.ondata(data);
    const length = result.length;
    const requiredByteLength = minByteLength + result.buffer.byteLength;
    if (sab.byteLength < requiredByteLength) sab.grow(requiredByteLength);
    i32a.set(result, 2);
    if (useAtomics) {
      store(i32a, 1, length);
      store(i32a, 0, 1);
      notify(i32a, 0);
    }
    else {
      i32a[1] = length;
      i32a[0] = 1;
    }
  };
};

const isOK = value => {
  switch (typeof value) {
    case 'symbol':
    case 'function':
      return false;
  }
  return true;
};

export const post = (sab, options) => {
  const opts = {};
  for (const key in options) {
    const value = options[key];
    if (isOK(key) && isOK(value)) opts[key] = value;
  }
  return [sab, opts];
};

export const url = (scriptURL, reflected, options) => {
  const url = new URL(scriptURL, location.href);
  url.searchParams.set('reflected', reflected);
  return [url, { ...options, type: 'module' }];
};

export { withResolvers };
