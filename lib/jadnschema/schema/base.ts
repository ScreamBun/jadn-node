/* eslint lines-between-class-members: 0, @typescript-eslint/lines-between-class-members: 0 */
// JADN Base Model
import { Schema } from '.';
import { SchemaSimpleJADN } from './interfaces';
import { SchemaSimpleType } from './definitions/interfaces';
import { JADNTypes } from './definitions/utils';
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
    // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
    ...Object.keys(kwargs).map<[string, any]|[]>(k => /^_[^_]/.exec(k) ? [k, kwargs[k]] : [] )
  ) : {};
  const errors: Array<Error> = [];

  switch (modelClass) {
    case 'Schema':
      if (hasProperty(data, 'info') && typeof data.info === 'object') {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const Info = require('./info').default;
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        data.info = new Info(data.info);
      }

      if (hasProperty(data, 'types') && typeof data.types === 'object' && Array.isArray(data.types)) {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const { makeDefinition } = require('./definitions');
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment
        data.types = objectFromTuple(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
          ...data.types.map<[string, any]>((t: SchemaSimpleType) => [t[0], makeDefinition(t, kwargs) ])
        );
      }
      break;
    case 'Info':
      if (hasProperty(data, 'config') && typeof data.config === 'object') {
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
        const { Config } = require('./info');
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        data.config = new Config(data.config);
      }
      break;
    case 'Options':
      break;
    default:
      if (hasProperty(data, 'options') && typeof data.options === 'object' && Array.isArray(data.options)) {
        try {
          // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
  protected schemaTypes = new Set(flattenArray(objectValues(JADNTypes)));

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
      // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this[key] = val;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
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