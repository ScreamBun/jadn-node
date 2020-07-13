/* eslint no-control-regex: 0 */
// JADN Validation Constants

// Format Validation constants
export const HOSTNAME_MAX_LENGTH = 255;

// Format RegExps
// Valid Hostname Characters
export const HOSTNAME_CHARS = /(?!-)[A-Z0-9-]{1,63}(?<!-)$/i;

// RFC 3986
export const URL_3986 = /(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
