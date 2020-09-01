// JADN Custom Structure
import DefinitionBase from './base';
import { SchemaObjectType, SchemaSimpleType } from './interfaces';
import { GeneralValidator } from '../schema';
import { ValidationError } from '../../exceptions';
import { safeGet } from '../../utils';


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
    const fmt = (safeGet(this.options, 'format', '') as string).replace('-', '_');
    if (fmt) {
      if (/^u\d+$/.exec(fmt)) {
        errors.push(...config.validationFormats.unsigned(parseInt(fmt.substring(1), 10), inst));
      } else {
        const fun = safeGet(config.validationFormats, fmt) as null|GeneralValidator;
        if (fun) {
          errors.push(...fun(inst));
        }
      }
    } else if (['Binary', 'String'].includes(this.type)) {
      const instLen = (inst as string).length;
      const minLen = safeGet(this.options, 'minv', 0) as number;
      let maxLen = safeGet(this.options, 'maxv', 0) as number;
      maxLen = maxLen <= 0 ? safeGet(config.info.config, `Max${this.type}`) as number : maxLen;

      if (minLen > instLen) {
        errors.push( new ValidationError(`${this.toString()} is invalid, minimum length of ${minLen} bytes/characters not met`));
      } else if (maxLen < instLen) {
        errors.push(new ValidationError(`${this.toString()} is invalid, maximum length of ${maxLen} bytes/characters exceeded`));
      }
    } else if (['Integer', 'Number'].includes(this.type)) {
      inst = inst as number;  // eslint-disable-line no-param-reassign
      const minVal = safeGet(this.options, 'minv', 0) as number;
      const maxVal = safeGet(this.options, 'maxv', 0) as number;

      if (minVal > inst) {
        errors.push(new ValidationError(`${this.toString()} is invalid, minimum of ${minVal} not met`));
      } else if (maxVal !== 0 && maxVal < inst) {
        errors.push(new ValidationError(`${this.toString()} is invalid, maximum of ${maxVal} exceeded`));
      }
    }

    return errors;
  }
}

export default CustomDef;