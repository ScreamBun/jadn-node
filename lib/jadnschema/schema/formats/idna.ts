/*
 * JADN Internationalised Domain Names in Applications (IDNA) Formats
 */
import { email } from './general';
import { hostname } from './network';
import { ValidationError } from '../../exceptions';

/**
 * Validate an IDN Hostname - RFC 5890 § 2.3.2.3
  * @param {string} val - IDN Hostname to validate
  * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function idn_hostname(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`IDN Hostname given is not expected string, given ${typeof val}`)];
  }

  const v = val.replace(/^https?:\/\//, val);
  try {
    // TODO: actually validate
    // v = idna.encode(v)
  } catch (err) {
    return [err] as Array<Error>;
  }
  return hostname(v);
}

/**
  * Validate an IDN Email - RFC 6531
  * @param {string} val - IDN Email to validate
  * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function idn_email(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`IDN Email given is not expected string, given ${typeof val}`)];
  }

  const v = val.split('@');
  if (v.length !== 2) {
    return [new ValidationError('IDN Email address invalid')];
  }

  try {
    // TODO: actually validate
    // v = b"@".join(map(idna.encode, val)).decode("utf-8")
  } catch (err) {
    return [err] as Array<Error>;
  }
  return email(val);
}
