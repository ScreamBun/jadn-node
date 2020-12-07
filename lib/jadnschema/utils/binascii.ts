export const hexlify = (str: string) => {
  let result = '';
  const padding = '00';
  for (let i=0, l=str.length; i<l; i++) {
    const digit = str.charCodeAt(i).toString(16);
    const padded = (padding + digit).slice(-2);
    result += padded;
  }
  return result;
};

export const unhexlify = (str: string) => {
  let result = '';
  for (let i=0, l=str.length; i<l; i+=2) {
    result += String.fromCharCode(parseInt(str.substr(i, 2), 16));
  }
  return result;
};

export const b2a_hex = hexlify;
export const a2b_hex = unhexlify;

export default {
  b2a_hex,
  hexlify,
  a2b_hex,
  unhexlify
};