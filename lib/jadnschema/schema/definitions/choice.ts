// JADN Choice Structure
import DefinitionBase from './base';
import {
  // Simple Interfaces
  SchemaSimpleType,
  // Complex Interfaces
  SchemaObjectType
} from './interfaces';

import { Field } from '../fields';
import { ValidationError } from '../../exceptions';
import { safeGet } from '../../utils';


/**
  * One key and value selected from a set of named or labeled fields
  * The key has an id and name or label, and is mapped to a type
  * @extend DefinitionBase
  */
class ChoiceDef extends DefinitionBase {
  fields: Array<Field>

  /**
    * Create a Choice Definition
    * @param {SchemaObjectType|SchemaSimpleType|ChoiceDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data: SchemaObjectType|SchemaSimpleType|ChoiceDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = safeGet(this, 'fields', []) as Array<Field>;
  }

  /**
    * Validate the given choice instance
    * @param {Record<string, ant>} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: Record<string, any>): Array<Error> {
    const errors: Array<Error> = [];
    const config = this._config();

    const keyCount = Object.keys(inst).length;
    const key = keyCount === 1 ? Object.keys(inst)[0] : '';
    const valueKey = safeGet(this.options, 'id', false) ? 'id' : 'name';

    if (keyCount !== 1) {
      errors.push(new ValidationError(`${this.toString()} - invalid, only one key/value allowed, given ${keyCount}`));
    } else if (this.fields.map(f => f[valueKey]).includes(key)) {
      // @ts-ignore
      const typeDef = safeGet(config.types, this.getField(key).type, null) as null|DefinitionBase;
      if (typeDef) {
        errors.push(...typeDef.validate(inst[key]));
      } else {
        errors.push(new ValidationError(`${this.toString()} - invalid value for choice of ${key}`));
      }
    }
    return errors;
  }
}

export default ChoiceDef;