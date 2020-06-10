/* eslint lines-between-class-members: 0 */
// JADN ArrayOf Structure
import DefinitionBase from './base';
import {
  // Simple Interfaces
  SchemaSimpleType,
  // Complex Interfaces
  SchemaObjectType
} from './interfaces';

import { Field } from '../fields';
import {
  SchemaError,
  ValidationError
} from '../../exceptions';
import { safeGet } from '../../utils';


/**
  * An ordered list of fields with the same semantics
  * Each field has a position and type vtype
  * @extend DefinitionBase
  */
class ArrayOfDef extends DefinitionBase {
  fields: Array<Field>

  /**
    * Create a ArrayOfDef Definition
    * @param {SchemaObjectType|SchemaSimpleType|ArrayOfDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: SchemaObjectType|SchemaSimpleType|ArrayOfDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = safeGet(this, 'fields', []);
  }

  /**
    * Validate the given array instance
    * @param {Array<any>} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: Array<any>): Array<Error> {
    const errors: Array<Error> = [];
    const config = this._config();

    const keyCount = Object.keys(inst).length;
    const minKeys = this.options.get('minv', 0);
    let maxKeys = this.options.get('maxv', 0);
    maxKeys = maxKeys <= 0 ? config.meta.config.MaxElements : maxKeys;

    if (minKeys > keyCount) {
      errors.push(new ValidationError(`${this} - minimum field count not met; min of ${minKeys}, given ${keyCount}`));
    } else if (keyCount > maxKeys) {
      errors.push( new ValidationError(`${this} - maximum field count exceeded; max of ${maxKeys}, given ${keyCount}`));
    }

    if (safeGet(this.options, 'unique', false)) {
      if ((keyCount - new Set(inst).size) > 0) {
        const dups = this.duplicates(inst).filter(itm => itm[1] > 1);
        errors.push(new ValidationError(`${this} - fields are not unique, duplicated ${dups.map(itm => itm[0]).join(',')}`));
      }
    }

    const vtype = this.options.get('vtype', null);
    if (vtype) {
        const JavaScriptType = null;
        if (JavaScriptType) {
          // TODO: Type check...
          /*
          if not all([isinstance(idx, python_type) for idx in inst]) {
            errors.append(ValidationError(f"{self} values are not valid as {vtype}"))
          }
          */
        } else {
          const SchemaType = vtype.startsWith('$') ? safeGet(config.derived, vtype) : safeGet(config.types, vtype);
          inst.forEach(idx => {
            const errs = SchemaType.validate(idx);
            errors.push(...errs);
          });
        }
    } else {
        errors.push( new SchemaError(`${this} invalid value type given, ${vtype}`));
    }

    return errors;
  }

  // Helper Functions
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-explicit-any
  duplicates(inst: Array<any>): Array<[any, number]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: Array<[any, number]> = [];

    for (let i = 0; i < inst.length; i++) {
      let flag = true;
      for (let j = 0; j < results.length; j++) {
         if (results[j][0] === inst[i]) {
          results[j][1] += 1;
           flag = false;
          }
      }
      if (flag) {
        results.push([inst[i], 1]);
      }
    }
    return results;
  }
}

export default ArrayOfDef;