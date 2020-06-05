/* eslint lines-between-class-members: 0 */
// JADN Custom Structure
import DefinitionBase from './base';

import { ValidationError } from '../../exceptions';
import {
  safeGet,
  // Simple Interfaces
  SchemaSimpleType,
  // Complex Interfaces
  SchemaObjectType
} from '../../utils';


/**
  * One value selected from a set of named or labeled integers
  * @extend DefinitionBase
  */
class CustomDef extends DefinitionBase {
  fields: undefined

  /**
    * Create a Enumerated Definition
    * @param {SchemaObjectType|SchemaSimpleType|CustomDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
   constructor(data: SchemaObjectType|SchemaSimpleType|CustomDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = undefined;
  }

  toString(): string {
    return `${this.name}(${this.type})`;
  }

  /**
    * Validate the given value is valid under the defined enumeration
    * @param {any} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  validate(inst: any): Array<Error> {
    const errors: Array<Error> = [];
    const config = this._config();

    if (this.type === 'None' && inst !== null) {
      errors.push(new ValidationError(`${this} is not valid as ${this.type}`));
      return errors;
    }

    if (this.type === 'Binary') {
      // TODO: Validate is binary...
      // inst = bytes(inst, "utf-8") if isinstance(inst, str) else inst
    }

    // TODO: Validate is proper type
    /*
    python_type = _Python_Types.get(self.type, None)
    if python_type and not isinstance(inst, python_type):
      errors.append(ValidationError(f"{self} is not valid as {self.type}"))
    */
    const fmt = safeGet(this.options, 'format');
    if (fmt) {
      if (/^u\d+$/.exec(fmt)) {
        errors.push(...config.validationFormats.unsigned(parseInt(fmt.subString(1), 10), inst));
      } else {
        const fun = safeGet(config.validationFormats, fmt);
        if (fun) {
          errors.push(fun(inst));
        }
      }
    } else if (['Binary', 'String'].includes(this.type)) {
      inst = inst as string;
      const instLen = inst.length;
      const minLen = safeGet(this.options, 'minv');
      let maxLen = safeGet(this.options, 'maxv');
      maxLen = maxLen <= 0 ? config.meta.config[`Max${this.type}`] : maxLen;

      if (minLen > instLen) {
        errors.push( new ValidationError(`${this} is invalid, minimum length of ${minLen} bytes/characters not met`));
      } else if (maxLen < instLen) {
        errors.push(new ValidationError(`${this} is invalid, maximum length of ${maxLen} bytes/characters exceeded`));
      }
    } else if (['Integer', 'Number'].includes(this.type)) {
      inst = inst as number;
      const minVal = safeGet(this.options, 'minv');
      const maxVal = safeGet(this.options, 'maxv');

      if (minVal > inst) {
        errors.push(new ValidationError(`${this} is invalid, minimum of ${minVal} not met`));
      } else if (maxVal !== 0 && maxVal < inst) {
        errors.push(new ValidationError(`${this} is invalid, maximum of ${maxVal} exceeded`));
      }
    }

    return errors;
  }
}

export default CustomDef;