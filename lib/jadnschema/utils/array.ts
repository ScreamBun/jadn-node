// Array utility functions
import { objectFromTuple } from './object';

/**
 * Flatten an array of arrays
 * @param {Array<ValType>} arr - Array to flatten
 * @returns {Array<ValType>} Flattened array
 * @public
 */
export function flattenArray<ValType>(arr: Array<Array<ValType>>): Array<ValType> {
  return arr.reduce((acc: Array<ValType>, val: Array<ValType>) => acc.concat(val), []);
}

/**
 * Merge an array of objects into a single object
 * @param {Array<Record<string, ValType>>} objs - Array to flatten
 * @returns {Record<string, ValType>} Flattened Object
 * @public
 */
export function mergeArrayObjects<ValType>(...objs: Array<Record<string, ValType>>): Record<string, ValType> {
  let rtn: Record<string, ValType> = {};
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
 * @param {Array<string>} keys - Array to use as keys
 * @param {Array<any>} values - Array to use as values
 * @returns {Record<string, any>} Object created from the given arrays
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zip(keys: Array<string>, values: Array<any>): Record<string, any> {
  // console.log(keys, values)
  if (keys.length < values.length) {
    throw new RangeError('The keys arrays should have the same or more values than the value array');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return objectFromTuple(
    ...values.map<[string, any]>((v: any, i: number) => [keys[i], v] )
  );
}