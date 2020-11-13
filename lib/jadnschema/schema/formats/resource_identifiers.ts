/*
 * uuid:  A string instance is valid against this attribute if it is a valid string representation of a UUID, according to [RFC4122].
 * - Note that all valid URIs are valid IRIs, and all valid URI References are also valid IRI References.
 */
import Url from 'url-parse';
import validator from 'validator';
import { URI, URI_REFERENCE } from './constants';
import { ValidationError } from '../../exceptions';

/**
  * Check if valid URI - RFC 3986
  * @param {string} val - URI to validate
  * @return {void|Error}
  */
 export function uri(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`URI given is not expected string, given ${typeof val}`);
  }
  if (!URI.test(val)) {
    return new ValidationError('URI given is not expected valid');
  }
  try {
    const result = new Url(val);
    if (![result.protocol, result.href, result.pathname].every(p => p !== null)) {
        return new ValidationError('URI given is not expected valid');
    }
  } catch (err) {
    // TODO: change to better exception
    return new ValidationError('URI given is not expected valid');
  }
  return undefined;
}

/**
 * Validate an URI-Reference - RFC 3987
 * @param {string} val - URI-Reference instance to validate
 * @return {void|Error}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function uri_reference(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`URI-Reference given is not expected string, given ${typeof val}`);
  }
  if (!URI_REFERENCE.test(val)) {
    return new ValidationError('URI given is not expected valid');
  }
  return undefined;
}

/**
 * Validate an IRI - RFC 3987
 * @param {string} val - IRI instance to validate
 * @return {void|Error}
 */
export function iri(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`IRI given is not expected string, given ${typeof val}`);
  }
  // TODO: validate IRI
  return undefined;
}

/**
 * Validate an IRI-Reference - RFC 3987
 * @param {string} val - IRI-Reference instance to validate
 * @return {void|Error}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function iri_reference(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`IRI-Reference given is not expected string, given ${typeof val}`);
  }
  // TODO: validate IRI-Reference
  return undefined;
}

/**
 * Validate a UUID
 * @param {string} val - UUID instance to validate
 * @return {void|Error}
 */
export function uuid(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`UUID given is not expected string, given ${typeof val}`);
  }
  if (!validator.isUUID(val)) {
    return new ValidationError('UUID given is not expected valid');
  }
  return undefined;
}