import { SharedArrayBuffer } from '@webreflection/utils/shared-array-buffer';

import { byteOffset } from '../shared.js';

export default ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    byteOffset + initByteLength,
    { maxByteLength: byteOffset + maxByteLength }
  );
