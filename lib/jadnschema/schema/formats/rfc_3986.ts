/*
 * JADN RFC3987 Formats
 */
import { URL_3986 } from './constants';
import { ValidationError } from '../../exceptions';

/**
  * Check if valid URI - RFC 3986
  * @param {string} val - URI to validate
  * @return {Array<Error>}
  */
 export function uri(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`URI given is not expected string, given ${typeof val}`)];
  }
  const urlMatch = URL_3986.exec(val);

  const errors: Array<Error> = [];
  try {
    const result = new URL(val);
    if (![result.protocol, result.href, result.pathname].every(p => p !== null) || urlMatch) {
        errors.push(new TypeError('URI given is not expected valid'));
    }
  } catch (err) {
    // TODO: change to better exception
    errors.push(new ValidationError('URI given is not expected valid'));
  }
  return errors;
}

/**
 * Validate an URI-Reference - RFC 3987
 * @param {string} val - URI-Reference instance to validate
 * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function uri_reference(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`URI-Reference given is not expected string, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];
  // TODO: validate URI-Referenc
  return errors;
}
