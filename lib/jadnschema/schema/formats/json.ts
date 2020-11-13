/*
 * json-pointer:  A string instance is valid against this attribute if it is a valid JSON string representation of a JSON Pointer, according to RFC 6901, section 5 [RFC6901].
 * relative-json-pointer:  A string instance is valid against this attribute if it is a valid Relative JSON Pointer [relative-json-pointer].
 */

/**
  * Validate JSON Pointer - RFC 6901 Section 5
  * @param {string} val - JSON Pointer to validate
  * @return {void|Error}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function json_pointer(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`JSON Pointer given is not expected string, given ${typeof val}`);
  }
  // TODO: validate JSON Pointer
  return undefined;
}

/**
  * Validate Relative JSON Pointer - JSONP
  * @param {string} val - Relative JSON Pointer to validate
  * @return {void|Error}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function relative_json_pointer(val: string): void|Error {
  // Definition taken from: https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01#section-3
  if (typeof val !== 'string') {
    return new TypeError(`Relative JSON Pointer given is not expected string, given ${typeof val}`);
  }
  // TODO: validate Relative JSON Pointer
  return undefined;
}