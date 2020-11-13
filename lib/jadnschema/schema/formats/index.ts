/*
 * JADN Validation Format Functions
 */
import * as Constants from './constants';
import * as DateTimeDurationFormats from './date_time_duration';
import * as GeneralFormats from './general';
import * as IDNA_Formats from './idna';
import * as JsonFormats from './json';
import * as NetworkFormats from './network';
import * as NumericFormats from './numeric';
import * as ResourceIdentifiersFormats from './resource_identifiers';
import { ValidationError } from '../../exceptions';
import { safeGet, objectFromTuple, sentenceCase } from '../../utils';

// Format valiator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeneralValidator = (val: any) => void|Error;
export type RegexValidator = (val: string) => void|Error;
export type UnsignedValidator = (n: number, val: number|string) => void|Error;

// Validate a format by regex, overridden by a validation function if available
const RegexFormats: Record<string, RegexValidator> = objectFromTuple(
  ...Object.keys(Constants).map<[string, RegexValidator]>(key => {
    const regexVal = safeGet(Constants, key) as RegExp;
    return [key.toLowerCase(), (val: string): void|Error => {
      switch (true) {
        case typeof val !== 'string':
          return new TypeError(`${sentenceCase(key)} given is not expected string, given ${typeof val}`);
        case !regexVal.test(val):
          return new ValidationError('Duration given is not expected valid');
        default:
          return undefined;
      }
    }];
  })
);

export default {
  ...RegexFormats,
  // Regex validation overrides, other validations
  ...DateTimeDurationFormats,
  ...GeneralFormats,
  ...IDNA_Formats,
  ...JsonFormats,
  ...NetworkFormats,
  ...NumericFormats,
  ...ResourceIdentifiersFormats
};