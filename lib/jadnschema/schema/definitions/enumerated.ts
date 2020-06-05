/* eslint lines-between-class-members: 0 */
// JADN Enumerated Structure
import DefinitionBase from './base';

import { EnumeratedField } from '../fields';

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
class EnumeratedDef extends DefinitionBase {
  fields: Array<EnumeratedField>

  /**
    * Create a Enumerated Definition
    * @param {SchemaObjectType|SchemaSimpleType|EnumeratedDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
   constructor(data: SchemaObjectType|SchemaSimpleType|EnumeratedDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = safeGet(this, 'fields', []);
  }

  toString(): string {
    return `${this.name}(Enumerated${safeGet(this.options, 'id', false) ? '.ID' : ''})`;
  }

  /**
    * Validate the given value is valid under the defined enumeration
    * @param {number|string} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  validate(inst: number|string): Array<Error> {
    const errors: Array<Error> = [];
    const valueKey = safeGet(this.options, 'id', false) ? 'id' : 'value';

    if (!this.fields.map(f => f[valueKey]).includes(inst)) {
      errors.push(new ValidationError(`${this} - invalid value, ${inst}`));
    }

    return errors;
  }
}

export default EnumeratedDef;