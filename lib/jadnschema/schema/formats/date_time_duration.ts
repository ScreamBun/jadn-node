/*
 * duration:  A string instance is valid against this attribute if it is a valid representation according to the "duration" production.
 */
import validator from 'validator';
import { ValidationError } from '../../exceptions';

/**
  * Validate a datetime - RFC 3339 § 5.6
  * @param {string} val - DateTime instance to validate
  * @return {void|Error}
  */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function date_time(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`DateTime given is not expected string, given ${typeof val}`);
    case !validator.isRFC3339(val):
      return new ValidationError(`DateTime is not properly formatted as RFC3339, given ${val}`);
    default:
      return undefined;
  }
}

/**
  * Validate a date - RFC 3339 § 5.6
  * @param {string} val - Date instance to validate
  * @return {void|Error}
  */
export function date(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`Date given is not expected string, given ${typeof val}`);
    case !validator.isRFC3339(`${val}T00:00:00`):
      return new ValidationError(`Date is not properly formatted as RFC3339, given ${val}`);
    default:
      return undefined;
  }
}

/**
  * Validate a time - RFC 3339 § 5.6
  * @param {string} val - Time instance to validate
  * @return {void|Error}
  */
export function time(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`Time given is not expected string, given ${typeof val}`);
    case !validator.isRFC3339(`1970-01-01T${val}`):
      return new ValidationError(`Date is not properly formatted as RFC3339, given ${val}`);
    default:
      return undefined;
  }
}

/**
  * Validate a time in UTC millisec
  * @param {string} val - UTC millisec to validate
  * @return {void|Error}
  */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function utc_millisec(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`UTC Millisec given is not expected string, given ${typeof val}`);
  }
  if (parseFloat(val) !== parseInt(val, 10)) {
    return new ValidationError(`UTC Millisec is not properly formatted as a number`);
  }

  const dateMili = parseInt(val, 10);
  let utcDate: undefined|Date;
  try {
    utcDate = new Date(dateMili);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new ValidationError(`UTC Millisec is not properly formatted as a date - ${err}`);
  }

  if (utcDate && utcDate.getTime() !== dateMili) {
    return new ValidationError(`UTC Millisec is not properly formatted as a number`);
  }
  return undefined;
}