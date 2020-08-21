/* eslint lines-between-class-members: 0, @typescript-eslint/lines-between-class-members: 0 */
// JADN Base Model
import { Schema } from '.';
import { SchemaSimpleJADN } from './interfaces';
import { SchemaSimpleType } from './definitions/interfaces';
import {
  flattenArray, hasProperty, objectFromTuple, objectValues, safeGet, zip
} from '../utils';

/**
  * Validate data against a model
  * @param {BaseModel} model - model class the data is being validated against
  * @param {SchemaSimpleType|SchemaSimpleJADN|BaseModel|Record<string, any>} inputData - data to validate
  * @param {Record<string, any>} kwargs - extra field values for the class
  * @param {boolean} silent - raise or return errors
  * @return {[Record<string, any>, Array<Error>]} - validated fields, OPTIONAL(ERRORS)
  */
// eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
export function initModel(model: BaseModel, inputData?: SchemaSimpleType|SchemaSimpleJADN|BaseModel|Record<string, any>, kwargs?: Record<string, any>, silent?: boolean): [Record<string, any>, Array<Error>] {
  silent = silent || true;  // eslint-disable-line no-param-reassign
  const modelClass = model.constructor.name;
  let data: Record<string, any>;  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (typeof inputData === 'object' && Array.isArray(inputData)) {
    data = zip(model.slots, inputData || []);
  } else {
    data = inputData || {};
  }
  const baseType = hasProperty(data, 'type') ? data.type as string : null;
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  const fields: Record<string, any> = kwargs ? objectFromTuple(
    ...Object.keys(kwargs).map<[string, any]|[]>(k => /^_[^_]/.exec(k) ? [k, kwargs[k] ] : [] )
  ) : {};
  const errors: Array<Error> = [];

  switch (modelClass) {
    case 'Schema':
      if ('meta' in data && typeof data.meta === 'object') {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
        const Meta = require('./meta').default;
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        data.meta = new Meta(data.meta);
      }

      if ('types' in data && typeof data.types === 'object' && Array.isArray(data.types)) {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
        const { makeDefinition } = require('./definitions');
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment
        data.types = objectFromTuple(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          ...data.types.map<[string, any]>((t: SchemaSimpleType) => [t[0], makeDefinition(t, kwargs) ])
        );
      }
      break;
    case 'Meta':
      if ('config' in data && typeof data.config === 'object') {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
        const { Config } = require('./meta');
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        data.config = new Config(data.config);
      }
      break;
    case 'Options':
      break;
    default:
      if (hasProperty(data, 'options') && typeof data.options === 'object' && Array.isArray(data.options)) {
        try {
          // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
          const Options = require('./options').default;
          // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          data.options = new Options(data.options);
        } catch (err) {
          if (silent) {
            errors.push(err);
          } else {
            throw err;
          }
        }
      }

      if (hasProperty(data, 'fields') && typeof data.fields === 'object' && Array.isArray(data.fields)) {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
        const DefField = baseType === 'Enumerated' ? require('./fields').EnumeratedField : require('./fields').Field;
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        data.fields = data.fields.map(f => new DefField(f, kwargs) );
      }
      break;
  }

  Object.keys(data).forEach(k => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fields[k] = data[k];
  });
  return [fields, errors];
}

/**
 * @class BaseModel
 */
class BaseModel {
  // Override Variables
  slots: Array<string> = [];

  // Helper Variables
  protected _config = () => new Schema();
  protected readonly jadnTypes = {
    Simple: [
      // Sequence of octets.Length is the number of octets
      'Binary',
      // Element with one of two values: true or false
      'Boolean',
      // Positive or negative whole number
      'Integer',
      // Real number
      'Number',
      // Unspecified or non - existent value
      'Null',
      // Sequence of characters, each of which has a Unicode codepoint.Length is the number of characters
      'String'
      ],
    Selector: [
      // One key and value selected from a set of named or labeled fields.The key has an id and name or label, and is mapped to a type
      'Choice',
      // One value selected from a set of named or labeled integers
      'Enumerated'
    ],
    Compound: [
      // Ordered list of labeled fields with positionally - defined semantics.Each field has a position, label, and type
      'Array',
      // Ordered list of fields with the same semantics.Each field has a position and type vtype
      'ArrayOf',
      // Unordered map from a set of specified keys to values with semantics bound to each key.Each key has an id and name or label, and is mapped to a type
      'Map',
      // Unordered map from a set of keys of the same type to values with the same semantics.Each key has key type ktype, and is mapped to value type vtype
      'MapOf',
      // Ordered map from a list of keys with positions to values with positionally - defined semantics.Each key has a position and name, and is mapped to a type.Represents a row in a spreadsheet or database table
      'Record'
    ]
  };
  protected schemaTypes = new Set(flattenArray(objectValues(this.jadnTypes)));

  /**
    * Create a Base Model
    * @param {SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  constructor(data?: SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>, kwargs?: Record<string, any> ) {
    const d = this.initData(data); // eslint-disable-next-line no-param-reassign

    if (data !== null && d !== undefined) {
      const [values, errs] = initModel(this, d, kwargs);
      if (errs.length > 0) {
        throw errs[0];
      }
      this.setProperties(values);
    }
  }

   /**
    * Initialize base data
    * @param {SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>} data - Base data
    * @return {Record<string, any>} - initialized data
    */
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  initData(data?: SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>): Record<string, any> {
    return data || {};
  }

  /**
    * Create a dictionary of the current object
    * @return {Record<string, any>} simple object (key/value) of the object
    */
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  object(): Record<string, any> {
    return objectFromTuple(
      ...this.slots.map<[string, any]|[]>(key => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const val = this.get(key);
        return val === null || val === undefined ? [] : [key, val];
      })
    );
  }

  /**
   * Set the given key/value pairs as properties of the current class
   * @param {Record<string, any>} props - key/value pairs to set
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setProperties(props: Record<string, any>): void {
    Object.keys(props).forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const val = props[key];
      if (val !== null && val !== undefined) {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: val
        });
      }
    });
  }

  /**
    * Replicates Python dictionary get method
    * @param {string} attr - Attribute to get the value
    * @param {Any} def - Default value if attribute does not exist
    * @return {Any} value of attribute/default - Null
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(attr: string, def?: any): any {
    const nulls = [null, undefined];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let val = nulls.includes(def) ? null : def;
    if (this.slots.includes(attr)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      val = safeGet(this, attr, def);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      val = nulls.includes(val) ? null : val;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return val;
  }
}

export default BaseModel;