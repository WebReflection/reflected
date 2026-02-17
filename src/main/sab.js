import { SharedArrayBuffer } from '@webreflection/utils/shared-array-buffer';

import { minByteLength } from './shared.js';

export default ({
  initByteLength = 1024,
  maxByteLength = (1024 * 8)
}) =>
  new SharedArrayBuffer(
    minByteLength + initByteLength,
    { maxByteLength: minByteLength + maxByteLength }
  );
