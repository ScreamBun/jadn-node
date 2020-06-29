// General utility functions

/**
 * Check is object has property
 * @param {Record<string, any>} obj - object to check against
 * @param {string} prop - property to check for
 * @returns {boolean} object contains property or not
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasProperty(obj: Record<string, any>, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop) || prop in obj;
}

/**
 * Object.values alternative for compatibility
 * @param {Record<string, ValType>} obj - Object to return the values of
 * @returns {Array<ValType>} values of the given object
 * @public
 */
export function objectValues<ValType>(obj: Record<string, ValType>): Array<ValType> {
  return Object.keys(obj).map(k => obj[k]);
}

/**
 * Pretty format an object
 * @param {any} obj - Object to pretty print
 * @param {number} indent - number of spaces to indent
 * @returns {string} Pretty formatted object
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prettyObject(obj: any, indent?: number): string {
  indent = indent || 2;  // eslint-disable-line no-param-reassign
  let pretty = '';
  switch (true) {
    case (obj instanceof String):
      pretty += `"${obj as string}"`;
      break;
    case (obj instanceof Number):
      pretty += obj;
      break;
    case (obj === undefined):
      break;
    case (obj instanceof Array):
        pretty += (obj as Array<any>).join(', ');
        break;
    case (obj instanceof Object):
      if (obj.toString !== Object.prototype.toString) {
        pretty += obj.toString();
      } else {
        let prettyObj = '';
        Object.keys(obj).forEach(key => {
          prettyObj += `${key}: ${prettyObject(obj[key])}\n`;
        });
        pretty += `{\n${prettyObj.replace(/^(.*)/gm, `${' '.repeat(indent)}$1`).replace(/\n.*$/, '')}\n}`;
      }
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`-- ${typeof obj}: ${obj}`);
      pretty += prettyObject(obj);
      break;
  }
  return pretty;
}

/**
 * SafeGet a property from an object
 * @param {Record<string, any>} obj - Object to attempt to get a property from
 * @param {string} key - property name to get value of
 * @param {any} def - default value of not value for the property exists - default of null
 * @return {any} value of the property or default value given/null
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeGet(obj: Record<string, any>, key: string, def?: any): any {
  def = def === null ? null : def; // eslint-disable-line no-param-reassign
  const val = obj[key];
  if (hasProperty(obj, key)) {
    return val === null || val === undefined ? def : val;
  }
  if (key in obj) {
    return val === null || val === undefined ? def : val;
  }
  return def;
}

type KeyFun = (val: any) => string;
/**
 * Invert an objects key/values
 * @param {Record<string, ValType>} obj - object to invert
 * @param {KeyFun} fun - function to execute on the vlue prior to being used as a key
 * @returns {Record<string, any>} inverted object
 * @public
 */
export function invertObject<ValType>(obj: Record<string, ValType>, fun?: KeyFun): Record<string, string> {
  const inverted: Record<string, string> = {};
  Object.keys(obj).forEach(key => {
    const val = fun ? fun(obj[key]) : String(obj[key]);
    inverted[val] = key;
  });

  return inverted;
}

/**
 * Deep clone an object
 * @param {any} obj - object to clone
 * @returns {any} cloned object
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cloneObject(obj: any, hash: WeakMap<Record<string, any>, string> = new WeakMap()): any {
  // https://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript
  if (Object(obj) !== obj) {
    // primitives
    return obj;
  }
  if (hash.has(obj)) {
    // cyclic reference
    return hash.get(obj);
  }

  let result;

  switch (true) {
    case (obj instanceof Set):
      // See note about this!
      result = new Set(obj);
      break;
    case (obj instanceof Map):
      result = new Map(Array.from(obj, ([key, val]) => [key, cloneObject(val, hash)] ));
      break;
    case (obj instanceof Date):
      result = new Date(obj);
      break;
    case (obj instanceof RegExp):
      result = new RegExp(obj.source, obj.flags);
      break;
    // ... add here any specific treatment for other classes ...
    default:
      // finally a catch-all:
      result = obj.constructor ? new obj.constructor() : Object.create(null);
  }

  hash.set(obj, result);
  return Object.assign(
    result,
    ...Object.keys(obj).map(key => ({ [key]: cloneObject(obj[key], hash) }))
  );
}

/**
 * Create an object from the given array of tuples
 * @param {Array<[number|string, ValType]|[]>} tuples - tuples to create an object from
 * @returns {Record<number|string, ValType>} creted object
 * @public
 */
export function objectFromTuple<ValType>(...tuples: Array<[number|string, ValType]|[]>): Record<number|string, ValType> {
  const tuplesFiltered: Array<[number|string, ValType]> = tuples.filter(t => t.length === 2) as Array<[number|string, ValType]>;

  return tuplesFiltered.reduce((acc: Record<string|number, ValType>, [key, value]) =>{
    acc[key] = value;
    return acc;
  }, {});
}