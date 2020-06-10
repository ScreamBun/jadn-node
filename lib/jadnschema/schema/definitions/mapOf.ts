/* eslint lines-between-class-members: 0 */
// JADN MapOf Structure
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
  * An unordered map from a set of keys of the same type to values with the same semantics
  * Each key has key type ktype, and is mapped to value type vtype
  * @extend DefinitionBase
  */
class MapOfDef extends DefinitionBase {
  fields: Array<Field>

  /**
    * Create a MapOf Definition
    * @param {SchemaObjectType|SchemaSimpleType|MapOfDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data: SchemaObjectType|SchemaSimpleType|MapOfDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = safeGet(this, 'fields', []);
  }

  /**
    * Validate the given mapOf instance
    * @param {Record<string, ant>} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: Record<string, any>): Array<Error> {
    // TODO: validate validation...
    const errors: Array<Error> = [];
    const config = this._config();

    const keyCount = Object.keys(inst).length;
    const minKeys = this.options.get('minv', 0);
    let maxKeys = this.options.get('maxv', 0);
    maxKeys = maxKeys <= 0 ? config.meta.config.MaxElements : maxKeys;

    const keyName = safeGet(this.options, 'ktype');
    const keyCls: DefinitionBase = safeGet(config.types, keyName);

    const valueName = safeGet(this.options, 'vtype');
    const valueCls: DefinitionBase = safeGet(config.types, valueName);

    if (minKeys > keyCount) {
      errors.push(new ValidationError(`${this} - minimum field count not met; min of ${minKeys}, given ${keyCount}`));
    } else if (keyCount > maxKeys) {
        errors.push(new ValidationError(`${this} - maximum field count exceeded; max of ${maxKeys}, given ${keyCount}`));
    }

    Object.keys(inst).forEach(key => {
      errors.push(...keyCls.validate(key));
      errors.push(...valueCls.validate(inst[key]));
    });
    return errors;
  }
}

export default MapOfDef;