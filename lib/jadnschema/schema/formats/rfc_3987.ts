/*
 * JADN RFC3987 Formats
 */

 /*
import rfc3987
from typing import Optional
from ... import utils
*/

/**
 * Validate an IRI - RFC 3987
 * @param {string} val - IRI instance to validate
 * @return {Array<Error>}
 */
export function iri(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`IRI given is not expected string, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];
  // TODO: validate IRI
  return errors;
}

/**
 * Validate an IRI-Reference - RFC 3987
 * @param {string} val - IRI-Reference instance to validate
 * @return {Array<Error>}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function iri_reference(val: string): Array<Error> {
  if (typeof val !== 'string') {
    return [new TypeError(`IRI-Reference given is not expected string, given ${typeof val}`)];
  }
  const errors: Array<Error> = [];
  // TODO: validate IRI-Reference
  return errors;
}
