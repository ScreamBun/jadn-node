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
export function email(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`E-Mail given is not expected string, given ${typeof val}`);
    case !validator.isEmail(val, {allow_utf8_local_part: false}):
      return new ValidationError('E-Mail given is not valid');
    default:
      return undefined;
  }
}

function getFuncName() {
  return getFuncName.caller.name;
}

/**
  * Validate Regular Expression - ECMA 262
  * @param { string} val - RegEx to validate
  * @return {Array<Error>}
  */
export function regex(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`${getFuncName()} given is not expected string, given ${typeof val}`);
  }
  try {
      RegExp(val);
  } catch (err) {
    return err as Error;
  }
  return undefined;
}

// Format duplicates
export const regexp = regex;
export const pattern = regex;
