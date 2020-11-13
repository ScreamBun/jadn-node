/* eslint @typescript-eslint/naming-convention: 0 */
/*
 * JADN Network Formats
 */
import validator from 'validator';
import {
  EUI48, EUI64, HOSTNAME
} from './constants';
import { ValidationError } from '../../exceptions';


// From https://stackoverflow.com/questions/2532053/validate-a-hostname-string
/**
  * Check if valid Hostname - RFC 1034 § 3.1
  * @param {string} val - Hostname to validate
  * @return {void|Error}
  */
export function hostname(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`Hostname given is not expected string, given ${typeof val}`);
  }

  // Copy & strip exactly one dot from the right, if present
  const v = val.endsWith('.') ? val.substring(0, val.length-1) : val;
  if (v.length < 1) {
    return new ValidationError('Hostname is not a valid length, minimum 1 character');
  }

  if (!HOSTNAME.test(v)) {
    return new ValidationError('Hostname given is not valid');
  }
  return undefined;
}

/**
  * IPv4 address as specified in RFC 791 § 3.1
  * @param {string} val - IPv4 Address to validate
  * @return {void|Error}
  */
export function ipv4(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`IPv4 given is not expected string, given ${typeof val}`);
    case /\/\d+$/.test(val):
      return new TypeError('IPv4 given should not contain a network mask');
    case !validator.isIP(val, 4):
      return new ValidationError(`IPv4 of '${val}' is not valid`);
    default:
      return undefined;
  }
}

/**
  * IPv6 address as specified in RFC 8200 § 3
  * @param {string} val - IPv6 Address to validate
  * @return {void|Error}
  */
export function ipv6(val: string): void|Error {
  switch (true) {
    case typeof val !== 'string':
      return new TypeError(`IPv6 given is not expected string, given ${typeof val}`);
    case /\/\d+$/.test(val):
      return new TypeError('IPv6 given should not contain a network mask');
    case !validator.isIP(val, 6):
      return new ValidationError(`IPv6 of '${val}' is not valid`);
    default:
      return undefined;
  }
}

/**
  * IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64
  * @param {string} val - EUI to validate
  * @return {void|Error}
  */
export function eui(val: string): void|Error {
  if (typeof val !== 'string') {
    return new TypeError(`EUI given is not expected string, given ${typeof val}`);
  }
  if (EUI48.test(val) || EUI64.test(val)) {
    return undefined;
  }
  return new ValidationError(`EUI of '${val}' is not valid`);
}

/**
  * Validate an IP Network
  * @param {[string, number]} val - IPv network address to validate
  * @param {'4'|'6'|4|6|undefined} version - IP version - '4','6',4,6,undefined
  * @return {void|Error}
  */
function ip_net(net: [string, string], version?: 4|6): void|Error {
  const [ip, mask] = net;
  const ver = version || (ip.includes('.') ? 4 : 6);
  const maskArgs = ver === 4 ? { min: 1, max: 32 } : { min: 1, max: 128 };

  if (!validator.isIP(ip, ver)) {
    return new ValidationError(`IPv${ver} of ${ip} is not valid`);
  }
  if (mask && !validator.isInt(mask, maskArgs)) {
    return new ValidationError(`Network Mask of ${mask} is not valid, must be between 1-${maskArgs.max}`);
  }
  return undefined;
}

/**
  * Binary IPv4 address and Integer prefix length as specified in RFC 4632 § 3.1
  * @param {string|[string, number]} val - IPv4 network address to validate
  * @return {void|Error}
  */
export function ipv4_net(val: string|[string, number]): void|Error {
  const v = (Array.isArray(val) ? val.map<string>(i => `${i}`) : val.split('/', 2)) as [string, string];
  return ip_net(v, 4);
}

/**
  * Binary IPv6 address and Integer prefix length as specified in RFC 4291 § 2.3
  * @param {string|[string, number]} val - IPv6 network address to validate
  * @return {void|Error}
  */
 export function ipv6_net(val: string|[string, number]): void|Error {
  const v = (Array.isArray(val) ? val.map<string>(i => `${i}`) : val.split('/', 2)) as [string, string];
  return ip_net(v, 6);
}

// Format duplicates
export const ip_address = ipv4;
export const ip4_addr = ipv4;
export const ip6_addr = ipv6;