// General utility functions

/**
  * Capitalize the first letter of the given word
  * @param {string} word - work to capitalize
  * @return {string} capitalized word
  */
// eslint-disable-next-line import/prefer-default-export
export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}