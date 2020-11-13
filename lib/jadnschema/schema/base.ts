/* eslint lines-between-class-members: 0, @typescript-eslint/lines-between-class-members: 0 */
// JADN Base Model
import { SchemaSimpleType } from './definitions/interfaces';
import { SchemaConfig, SchemaSimpleJADN } from './interfaces';
import {
  flattenArray, objectFromTuple, objectValues, safeGet
} from '../utils';

/**
 * @class BaseModel
 */
class BaseModel {
  // Read Only Variables
  readonly JADNTypes = {
    Primitive: [
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
    Enumeration: [
      // One value selected from a set of named or labeled integers
      'Enumerated'
    ],
    Structured: [
      // Ordered list of labeled fields with positionally - defined semantics.Each field has a position, label, and type
      'Array',
      // Ordered list of fields with the same semantics.Each field has a position and type vtype
      'ArrayOf',
      // One key and value selected from a set of named or labeled fields.The key has an id and name or label, and is mapped to a type
      'Choice',
      // Unordered map from a set of specified keys to values with semantics bound to each key.Each key has an id and name or label, and is mapped to a type
      'Map',
      // Unordered map from a set of keys of the same type to values with the same semantics.Each key has key type ktype, and is mapped to value type vtype
      'MapOf',
      // Ordered map from a list of keys with positions to values with positionally - defined semantics.Each key has a position and name, and is mapped to a type.Represents a row in a spreadsheet or database table
      'Record'
    ]
  };
  // Override Variables
  slots: Array<string> = [];

  // Helper Variables
  protected _config: () => SchemaConfig;
  protected schemaTypes = new Set(flattenArray(objectValues(this.JADNTypes)));

  /**
    * Create a Base Model
    * @param {SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data?: SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>, kwargs?: Record<string, any>) {
    const args = kwargs || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: Record<string, any> = {
      ...objectFromTuple(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...Object.keys(args).map<[string, any]|[]>(k => /^_[^_]/.test(k) ? [k, args[k]] : [] )
      ),
      ...this.initData(data, kwargs)
    };
    this.setProperties(fields);
    this._config = safeGet(this, '_config', {}) as () => SchemaConfig;
  }

  /**
    * Initialize base data
    * @param {SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>} data - Base data
    * @return {Record<string, any>} - initialized data
    */
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  initData(data?: SchemaSimpleJADN|SchemaSimpleType|BaseModel|Record<string, any>, kwargs?: Record<string, any>): Record<string, any> {
    return {
      ...data,
      ...kwargs
    };
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