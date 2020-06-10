/* eslint lines-between-class-members: 0 */
// JADN Base Model

// Simple Interfaces
import { SchemaSimpleJADN } from './interfaces';
import { SchemaSimpleType } from './definitions/interfaces';

import {
  flattenArray,
  hasProperty,
  mergeArrayObjects,
  objectValues,
  safeGet,
  zip
} from '../utils';


/**
  * Validate data against a model
  * @param {Class} model - model class the data is being validated against
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
  const baseType = hasProperty(data, 'type') ? data.type : null;
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  const fields: Record<string, any> = kwargs ? mergeArrayObjects( ...Object.keys(kwargs).map(k => /^_[^_]/.exec(k) ? { [k]: kwargs[k] } : {} )) : {};
  const errors: Array<Error> = [];

  switch (modelClass) {
    case 'Schema':
      if ('meta' in data && typeof data.meta === 'object') {
        const Meta = require('./meta').default;  // eslint-disable-line global-require
        data.meta = new Meta(data.meta);  // eslint-disable-line no-param-reassign
      }

      if ('types' in data && typeof data.types === 'object' && Array.isArray(data.types)) {
        const makeDefinition = require('./definitions').makeDefinition;  // eslint-disable-line global-require
        data.types = mergeArrayObjects(  // eslint-disable-line no-param-reassign
          ...data.types.map((t: SchemaSimpleType) => ({ [t[0]]: makeDefinition(t, kwargs) }))
        );
      }
      break;
    case 'Meta':
      if ('config' in data && typeof data.config === 'object') {
        const Config = require('./meta').Config;  // eslint-disable-line global-require
        data.config = new Config(data.config);  // eslint-disable-line no-param-reassign
      }
      break;
    case 'Options':
      break;
    default:
      if (hasProperty(data, 'options') && typeof data.options === 'object' && Array.isArray(data.options)) {
        try {
          const Options = require('./options').default;  // eslint-disable-line global-require
          data.options = new Options(data.options);  // eslint-disable-line no-param-reassign
        } catch (err) {
          if (silent) {
            errors.push(err);
          } else {
            throw err;
          }
        }
      }

      if (hasProperty(data, 'fields') && typeof data.fields === 'object' && Array.isArray(data.fields)) {
        // eslint-disable-next-line global-require
        const DefField = baseType === 'Enumerated' ? require('./fields').EnumeratedField : require('./fields').Field;
        data.fields = data.fields.map(f => new DefField(f, kwargs) );// eslint-disable-line no-param-reassign
      }
      break;
  }

  Object.keys(data).forEach(k => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
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
  protected _config: Function = () => null;
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
  initData(data: any): any {
    return data;
  }

  /**
    * Create a dictionary of the current object
    * @return {Record<string, any>} simple object (key/value) of the object
    */
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  object(): Record<string, any> {
    return mergeArrayObjects(
      ...this.slots.map((key: string) => {
        const val = this.get(key);
        return val === null || val === undefined ? {} : { [key]: val };
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setProperties(props: Record<string, any>): void {
    Object.keys(props).forEach((key: string) => {
      const val = props[key];
      if (val !== null && val !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this[key] = val;
      }
    });
  }

  /**
    * Emulate a dictionary get method
    * @param {string} attr - Attribute to get the value
    * @param {Any} def -  Default value if attribute does not exist
    * @return {Any} value of attribute/default - Null
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(attr: string, def?: any): any {
    let val = def === null || def === undefined ? null : def;
    if (this.slots.includes(attr)) {
      val = safeGet(this, attr, def);
      val = val === null || val === undefined ? null : val;
    }
    return val;
  }
}

export default BaseModel;