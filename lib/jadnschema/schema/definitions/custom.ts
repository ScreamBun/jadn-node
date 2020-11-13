// JADN Custom Structure
import validator from 'validator';
import DefinitionBase from './base';
import { SchemaObjectType, SchemaSimpleType } from './interfaces';
import { GeneralValidator } from '../formats';
import { ValidationError } from '../../exceptions';
import { hasProperty, safeGet } from '../../utils';


/**
  * One value selected from a set of named or labeled integers
  * @extend DefinitionBase
  */
class CustomDef extends DefinitionBase {
  /**
    * Create a Enumerated Definition
    * @param {SchemaObjectType|SchemaSimpleType|CustomDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data: SchemaObjectType|SchemaSimpleType|CustomDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = [];
  }

  toString(): string {
    return `${this.name}(${this.type})`;
  }

  /**
    * Validate the given value is valid under the defined enumeration
    * @param {any} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: any): Array<Error> {
    const errors: Array<Error> = [];
    const config = this._config();

    if (this.type === 'None' && inst !== null) {
      errors.push(new ValidationError(`${this.toString()} is not valid as ${this.type}`));
      return errors;
    }

    const fmt = (safeGet(this.options, 'format', '') as string).replace('-', '_');
    if (fmt) {
      let fmtFun: undefined|GeneralValidator;
      if (/^u\d+$/.test(fmt)) {
        fmtFun = (v: string): void|Error => config.validationFormats.unsigned(parseInt(fmt.substring(1), 10), v);
      } else if (fmt in config.validationFormats) {
        fmtFun = safeGet(config.validationFormats, fmt) as GeneralValidator;
      }

      if (fmtFun) {
        const fmtVal = fmtFun(inst);
        if (fmtVal) {
          errors.push(fmtVal);
        }
      }
    } else {
      const optMin = safeGet(this.options, 'minv', 0) as number;
      const optMax = safeGet(this.options, 'maxv', 0) as number;
      const rangeArgs: Record<string, number> = {
        min: optMin
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valFun: undefined|((itm: string, args?: Record<string, any>) => boolean);
      let msg = 'ERROR MESSAGE';

      switch (this.type) {
        case 'Binary':
          valFun = validator.isByteLength;
        case 'String':
          valFun = valFun || validator.isLength;
          rangeArgs.max = hasProperty(this.options, 'maxv') ? optMax : safeGet(config.info.config, `Max${this.type}`) as number;
          msg = `byte/character count not within the range of [${rangeArgs.min}:${rangeArgs.max || '∞'}]`;
          break;
        case 'Integer':
          valFun = validator.isInt;
        case 'Number':
          valFun = valFun || validator.isFloat;
          rangeArgs.min = hasProperty(this.options, 'minv') ? optMin : Number.MIN_VALUE;
          if (hasProperty(this.options, 'maxv')) {
            rangeArgs.max = optMax;
          }
          const min = rangeArgs.min === Number.MIN_VALUE ? 'MIN' : rangeArgs.min;
          msg = `not within the range of [${min}:${rangeArgs.max || '∞'}]`;
          break;
        // no default
      }

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      if (valFun && !valFun(`${inst}`, rangeArgs)) {
        errors.push(new ValidationError(`${this.toString()} is invalid, ${msg}`));
      }
    }

    return errors;
  }
}

export default CustomDef;