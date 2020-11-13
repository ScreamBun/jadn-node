/*
 * JADN Numeric Formats
 */
import validator from 'validator';
import { ValidationError } from '../../exceptions';


/**
  * Validate 8-bit number - Signed 8 bit integer, value must be between -128 and 127
  * @param {number} val - 8-bit number to validate
  * @return {void|Error}
  */
 export function i8(val: number): void|Error {
  if (typeof val !== 'number') {
    return new TypeError(`Number given is not expected string, given ${typeof val}`);
  }
  const rangeArgs = {
    min: -(2**7),
    max: (2**7)-1
  };
  if (!validator.isInt(`${val}`, rangeArgs)) {
    return new ValidationError(`Number is not 8-bit, ${val}`);
  }
  return undefined;
}

/**
  * Validate 16-bit number - Signed 16 bit integer, value must be between -32768 and 62767
  * @param {number} val - 16-bit number to validate
  * @return {void|Error}
  */
export function i16(val: number): void|Error {
  if (typeof val !== 'number') {
    return new TypeError(`Number given is not expected string, given ${typeof val}`);
  }
  const rangeArgs = {
    min: -(2**15),
    max: (2**15)-1
  };
  if (!validator.isInt(`${val}`, rangeArgs)) {
    return new ValidationError(`Number is not 16-bit, ${val}`);
  }
  return undefined;
}

/**
  * Validate 32-bit number - Signed 32 bit integer, value must be between -2147483648 and 2147483647
  * @param {number} val - 32-bit number to validate
  * @return {void|Error}
  */
export function i32(val: number): void|Error {
  if (typeof val !== 'number') {
    return new TypeError(`Number given is not expected string, given ${typeof val}`);
  }
  const rangeArgs = {
    min: -(2**31),
    max: (2**31)-1
  };
  if (!validator.isInt(`${val}`, rangeArgs)) {
    return new ValidationError(`Number is not 32-bit, ${val}`);
  }
  return undefined;
}

/**
  * Validate 64-bit number - Signed 64 bit integer, value must be between -9223372036854776000 and 9223372036854776000
  * @param {number} val - 64-bit number to validate
  * @return {void|Error}
  */
 export function i64(val: number): void|Error {
  if (typeof val !== 'number') {
    return new TypeError(`Number given is not expected string, given ${typeof val}`);
  }
  const rangeArgs = {
    min: -(2**63),
    max: (2**63)-1
  };
  if (!validator.isInt(`${val}`, rangeArgs)) {
    return new ValidationError(`Number is not 64-bit, ${val}`);
  }
  return undefined;
}

/**
  * Validate an Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1
  * @param {number} n - max value of the integer/bytes - 2^<n> - 1
  * @param {number|string} val - integer/bytes to validate
  * @return {void|Error}
  */
export function unsigned(n: number, val: number|string): void|Error {
  if (!['number', 'string'].includes(typeof val)) {
    return new TypeError(`Unsigned string/number given is not expected string/number, given ${typeof val}`);
  }
  // Maximum bytes/number
  const maxVal = (2**n) - 1;

  // Unsigned Bytes
  // TODO: check if actually bytes??
  if (typeof val === 'string') {
    if (val.length < 0) {
      return new ValidationError('Unsigned bytes given is invalid, cannot be negative');
    }
    if (val.length > maxVal) {
      return new ValidationError(`Unsigned bytes given is invalid, cannot be more than ${maxVal} bytes`);
    }
  }

  // Unsigned Integer
  if (typeof val === 'number') {
    if (val < 0) {
      return new ValidationError('Unsigned integer given is invalid, cannot be negative');
    }
    if (val > maxVal) {
      return new ValidationError(`Unsigned integer given is invalid, cannot be greater than ${maxVal}`);
    }
  }
  return undefined;
}