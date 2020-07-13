/*
 * JADN General Formats
 */
import validator from 'validator';
import { ValidationError } from '../../exceptions';

/**
  * Check if valid E-Mail address - RFC 5322 Section 3.4.1
  * @param {string} val - E-Mail address to validate
  * @return {Array<Error>}
 */
export function email(val: string): Array<Error> {
  /*
   * Use regex from https://stackoverflow.com/questions/201323/how-to-validate-an-email-address-using-a-regular-expression
   * A more comprehensive email address validator is available at http://isemail.info/about
   */
  if (typeof val !== 'string') {
    return [new TypeError(`E-Mail given is not expected string, given ${typeof val}`)];
  }
  if (!validator.isEmail(val)) {
    return [new ValidationError('E-Mail given is not valid')];
  }
  return [];
}

/**
  * Validate JSON Pointer - RFC 6901 Section 5
  * @param {string} val - JSON Pointer to validate
  * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function json_pointer(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`JSON Pointer given is not expected string, given ${typeof val}`)];
  }

  const errors: Array<Error> = [];
  // TODO: validate JSON Pointer
  return errors;
}

/**
  * Validate Relative JSON Pointer - JSONP
  * @param {string} val - Relative JSON Pointer to validate
  * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function relative_json_pointer(val: string): Array<Error> {
  // Definition taken from: https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01#section-3
  if (typeof val !== 'string') {
    return [new TypeError(`Relative JSON Pointer given is not expected string, given ${typeof val}`)];
  }

  const errors: Array<Error> = [];
  // TODO: validate Relative JSON Pointer
  return errors;
}

/**
  * Validate Regular Expression - ECMA 262
  * @param { string} val - RegEx to validate
  * @return {Array<Error>}
  */
export function regex(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`RegEx given is not expected string, given ${typeof val}`)];
  }

  const errors: Array<Error> = [];
  try {
      RegExp(val);
  } catch (err) {
    errors.push(err);
  }
  return errors;
}

/**
  * Validate 8-bit number - Signed 8 bit integer, value must be between -128 and 127
  * @param {number} val - 8-bit number to validate
  * @return {Array<Error>}
  */
export function i8(val: number): Array<Error> {
  if (typeof val !== 'number') {
    return [new TypeError(`Number given is not expected string, given ${typeof val}`)];
  }
  if (Math.abs(val).toString(2).length > 8) {
    return [new ValidationError('number is not 8-bit, {val}')];
  }
  return [];
}

/**
  * Validate 16-bit number - Signed 16 bit integer, value must be between -32768 and 62767
  * @param {number} val - 16-bit number to validate
  * @return {Array<Error>}
  */
export function i16(val: number): Array<Error> {
  if (typeof val !== 'number') {
    return [new TypeError(`Number given is not expected string, given ${typeof val}`)];
  }
  if (Math.abs(val).toString(2).length > 16) {
    return [new ValidationError('number is not 16-bit, {val}')];
  }
  return [];
}

/**
  * Validate 32-bit number - Signed 32 bit integer, value must be between -2147483648 and 2147483647
  * @param {number} val - 32-bit number to validate
  * @return {Array<Error>}
  */
export function i32(val: number): Array<Error> {
  if (typeof val !== 'number') {
    return [new TypeError(`Number given is not expected string, given ${typeof val}`)];
  }
  if (Math.abs(val).toString(2).length > 32) {
    return [new ValidationError('number is not 32-bit, {val}')];
  }
  return [];
}


// @utils.addKey(d=GeneralFormats, k='unsigned')
/**
  * Validate an Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1
  * @param {number} n - max value of the integer/bytes - 2^<n> - 1
  * @param {number|string} val - integer/bytes to validate
  * @return {Array<Error>}
  */
export function unsigned(n: number, val: number|string): Array<Error> {
  if (!['number', 'string'].includes(typeof val)) {
    return [new TypeError(`Unsigned string/number given is not expected string/number, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];

  // Maximum bytes/number
  const maxVal = (2**n) - 1;

  // Unsigned Bytes
  // TODO: check if actually bytes??
  if (typeof val === 'string') {
    if (val.length < 0) {
      errors.push(new ValidationError('Unsigned integer given is invalid, cannot be negative'));
    } else if (val.length > maxVal) {
      errors.push(new ValidationError(`Unsigned integer given is invalid, cannot be more than ${maxVal} bytes`));
    }
  }

  // Unsigned Integer
  if (typeof val === 'number') {
    if (val < 0) {
      errors.push(new ValidationError('Unsigned integer given is invalid, cannot be negative'));
    } else if (val > maxVal) {
      errors.push(new ValidationError(`Unsigned integer given is invalid, cannot be greater than ${maxVal}`));
    }
  }
   return errors;
}