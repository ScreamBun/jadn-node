// JADN Map Structure
import DefinitionBase from './base';
import { SchemaObjectType, SchemaSimpleType } from './interfaces';
import { Field } from '../fields';
import { ValidationError } from '../../exceptions';
import { safeGet } from '../../utils';


/**
  * An unordered map from a set of specified keys to values with semantics bound to each key
  * Each key has an id and name or label, and is mapped to a type
  * @extend DefinitionBase
  */
class MapDef extends DefinitionBase {
  fields: Array<Field>

  /**
    * Create a Map Definition
    * @param {SchemaObjectType|SchemaSimpleType|MapDef} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data: SchemaObjectType|SchemaSimpleType|MapDef, kwargs?: Record<string, any>) {
    super(data, kwargs);
    this.fields = safeGet(this, 'fields', []) as Array<Field>;
  }

  /**
    * Validate the given map instance
    * @param {Record<string, ant>} inst - the instance to validate
    * @returns {Array<Error>} Errors resulting from the validation
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: Record<string, any>): Array<Error> {
    // TODO: validate validation...
    const errors: Array<Error> = [];
    const config = this._config();

    const keyCount = Object.keys(inst).length;
    const minKeys = this.options.get('minv', 0) as number;
    let maxKeys = this.options.get('maxv', 0) as number;
    maxKeys = maxKeys <= 0 ? config.info.config.MaxElements : maxKeys;

    const fields = this.fields.map(f => f.name);
    const extraFields = Object.keys(inst).filter(f => !fields.includes(f));

    if (extraFields.length > 0) {
      errors.push(new ValidationError(`${this.toString()} - unknown field(s): ${extraFields.join(', ')}`));
    } else if (minKeys > keyCount) {
      errors.push(new ValidationError(`${this.toString()} - minimum field count not met; min of ${minKeys}, given ${keyCount}`));
    } else if (keyCount > maxKeys) {
        errors.push(new ValidationError(`${this.toString()} - maximum field count exceeded; max of ${maxKeys}, given ${keyCount}`));
    } else {
      Object.keys(inst).forEach(key => {
        const fieldDef = this.getField(key);
        errors.push(...(fieldDef.validate(inst[key]) || []));
      });
    }
    return errors;
  }
}

export default MapDef;