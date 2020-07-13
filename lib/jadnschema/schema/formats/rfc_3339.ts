/*
 * JADN RFC3339 Formats
 */
import validator from 'validator';
import { ValidationError } from '../../exceptions';

 /*
import strict_rfc3339
from typing import Optional
from ... import utils
*/

/**
 * Validate a datetime - RFC 3339 § 5.6
 * @param {string} val -DateTime instance to validate
 * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function date_time(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`DateTime given is not expected string, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];

  if (!validator.isRFC3339(val)) {
    errors.push(new ValidationError(`DateTime is not properly formatted as RFC3339, given ${val}`));
  }
  return errors;
}

/**
 * Validate a date - RFC 3339 § 5.6
 * @param {string} val - Date instance to validate
 * @return {Array<Error>}
 */
export function date(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`Date given is not expected string, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];

  if (!validator.isRFC3339(`${val}T00:00:00`)) {
    errors.push(new ValidationError(`Date is not properly formatted as RFC3339, given ${val}`));
  }
  return errors;
}

/**
 * Validate a time - RFC 3339 § 5.6
* @param {string} val - Time instance to validate
* @return {Array<Error>}
*/
export function time(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`Time given is not expected string, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];

  if (!validator.isRFC3339(`1970-01-01T${val}`)) {
    errors.push(new ValidationError(`Date is not properly formatted as RFC3339, given ${val}`));
  }
  return errors;
}
