/*
 * JADN Internationalised Domain Names in Applications (IDNA) Formats
 */
import validator from 'validator';
import { hostname } from './network';
import { ValidationError } from '../../exceptions';

/**
 * Validate an IDN Hostname - RFC 5890 § 2.3.2.3
  * @param {string} val - IDN Hostname to validate
  * @return {void|Error}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function idn_hostname(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`IDN Hostname given is not expected string, given ${typeof val}`);
  }

  const v = val.replace(/^https?:\/\//, val);
  try {
    // TODO: actually validate
    // v = idna.encode(v)
  } catch (err) {
    return err as Error;
  }
  return hostname(v);
}

/**
  * Validate an IDN Email - RFC 6531
  * @param {string} val - IDN Email to validate
  * @return {void|Error}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function idn_email(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`IDN E-Mail given is not expected string, given ${typeof val}`);
    case !validator.isEmail(val):
      return new ValidationError('IDN E-Mail given is not valid');
    default:
      return undefined;
  }
}
