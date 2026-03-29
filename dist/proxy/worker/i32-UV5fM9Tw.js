// @ts-check

/**
 * @param {number} [start]
 * @returns {() => number}
 */
var i32 = start => {
  const i32 = new Int32Array(1);
  return () => i32[0]++;
};

export { i32 as i };
