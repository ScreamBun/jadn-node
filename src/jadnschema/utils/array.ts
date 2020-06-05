// Array utility functions

/**
 * Flatten an array of arrays
 * @param {Array<any>} arr - Array to flatten
 * @returns {Array<any>} Flattened array
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flattenArray(arr: Array<any>): Array<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.reduce((acc: any, val: Array<any>) => acc.concat(val), []);
}

/**
 * Merge an array of objects into a single object
 * @param {Array<Record<string, any>>} objs - Array to flatten
 * @returns {Record<string, any>} Flattened Object
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeArrayObjects(...objs: Array<Record<string, any>>): Record<string, any> {
  let rtn = {};
  objs.forEach(o => {
    rtn = {
      ...rtn,
      ...o
    };
  });
  return rtn;
}

/**
 * Create an object using the given arrays
 * @param {Array} keys - Array to use as keys
 * @param {Array} values - Array to use as values
 * @returns {Record} Object created from the given arrays
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zip(keys: Array<string>, values: Array<any>): Record<string, any> {
  // console.log(keys, values)
  if (keys.length < values.length) {
    throw new RangeError('The keys arrays should have the same or more values than the value array');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mergeArrayObjects(...values.map((v: any, i: number) => ({
    [keys[i]]: v
  })));
}