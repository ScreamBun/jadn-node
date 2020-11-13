// General utility functions

/**
  * Capitalize the first letter of the given word
  * @param {string} word - word to capitalize
  * @return {string} capitalized word
  */
export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
  * Capitalize the first letter of all given words in the string
  * @param {string} str - str to Sentence Case
  * @return {string} capitalized sentence
  */
export function sentenceCase(str: string): string {
  let rtn = str.split(' ').map(w => capitalize(w.toLowerCase())).join(' ');
  rtn = str.split('-').map(w => capitalize(w.toLowerCase())).join('-');
  rtn = str.split('_').map(w => capitalize(w.toLowerCase())).join('_');
  return rtn;
}