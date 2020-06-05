/* eslint lines-between-class-members: 0 */
// JADN Array Structure
import DefinitionBase from './base';
import {
  // Simple Interfaces
  SchemaSimpleType,
  // Complex Interfaces
  SchemaObjectType
} from './interfaces';

import { ValidationError } from '../../exceptions';
import { Field } from '../fields';
import {
  hasProperty,
  safeGet
} from '../../utils';


/**
  * An ordered list of labeled fields with positionally-defined semantics
  * Each field has a position, label, and type
  * @extend DefinitionBase
  */
class ArrayDef extends DefinitionBase {
  fields: Array<Field>

  /**
    * Create a Array Definition
    * @param {SchemaObjectType|SchemaSimpleType|ArrayDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
   constructor(data: SchemaObjectType|SchemaSimpleType|ArrayDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = safeGet(this, 'fields', []);
  }

  /**
    * Validate the given array instance
    * @param {Array<any>} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  validate(inst: Array<any>): Array<Error> {
    const errors: Array<Error> = [];
    const config = this._config();

    if (hasProperty(this.options, 'format')) {
      const fmtFun = safeGet(config.validationFormats, this.options.get('format', ''));
      if (fmtFun) {
        errors.push(...fmtFun(inst));
      }
    } else {
      console.log(`Array: ${inst}`);
      const keyCount = inst.length;
      const minKeys = this.options.get('minv', 0);
      let maxKeys = this.options.get('maxv', 0);
      maxKeys = maxKeys <= 0 ? config.meta.config.MaxElements : maxKeys;

      if (minKeys > keyCount) {
        errors.push(new ValidationError(`${this} - minimum field count not met; min of ${minKeys}, given ${keyCount}`));
      } else if (keyCount > maxKeys) {
        errors.push( new ValidationError(`${this} - maximum field count exceeded; max of ${maxKeys}, given ${keyCount}`));
      }

      // TODO: finish validation
    }

    return errors;
  }
}

export default ArrayDef;