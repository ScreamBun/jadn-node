/* eslint lines-between-class-members: 0, max-classes-per-file: 0 */
// JADN Config
import BaseModel from './base';
import { ValidationError } from '../exceptions';
import {
  // Simple Interfaces
  SchemaMetaJADN
} from './interfaces';
import {
  hasProperty,
  mergeArrayObjects,
  prettyObject,
  safeGet
} from '../utils';

/**
 * Class representing JADN Schema's Meta-Config
 * @extends BaseModel
 */
class Config extends BaseModel {
  // Config Values
  _MaxBinary?: number    // Default maximum number of octets
  _MaxString?: number    // Default maximum number of characters
  _MaxElements?: number  // Default maximum number of items/properties
  _FS?: string           // Field Separator character used in pathnames
  _Sys?: string          // System character for TypeName
  _TypeName?: string     // TypeName regex
  _FieldName?: string    // FieldName regex
  _NSID?: string         // Namespace Identifier regex

  // Helper Variables
  slots: Array<string> = ['MaxBinary', 'MaxString', 'MaxElements', 'FS', 'Sys', 'TypeName', 'FieldName', 'NSID'];

  /**
    * Initialize a Config object
    * @param {Record<string, number|string>|Config} data - The config data to utilize
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  constructor(data?: Record<string, number|string>|Config, kwargs?: Record<string, any> ) {
    super(data, kwargs);
  }

  toString(): string {
    return `Config ${prettyObject(this.schema())}`;
  }

  /**
    * initialize the date for the class
    * @param {Record<string, number|string>|Config} data - The config data to validate
    * @return {Record<string, number|string>} - validated data
    */
  initData(data?: Record<string, number|string>|Config): Record<string, number|string> {
    let d: Record<string, number|string>;
    if (typeof data === 'object' && data instanceof Config) {
      d = data.schema();
    } else {
      d = data || {};
    }
    return mergeArrayObjects(...Object.keys(d).map(k => ({ [k.replace(/^\$/, '')]: safeGet(d, k) }) ));
  }

  /**
    * Format this config into valid JADN format
    * @returns {Record<string, string>} JADN formatted meta
    */
  schema(): Record<string, string> {
    return mergeArrayObjects(
      ...(this.slots || []).map(k => {
        return hasProperty(this, `_${k}`) ? { [`$${k}`]: safeGet(this, k) } : {};
      })
    );
  }

  // Setter/Getter
  set MaxBinary(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxBinary invalid, must be greater than 1 - ${val}`);
    }
    this._MaxBinary = val;
  }

  get MaxBinary(): number {
    return safeGet(this, '_MaxBinary', 255);
  }

  set MaxString(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxString invalid, must be greater than 1 - ${val}`);
    }
    this._MaxString = val;
  }

  get MaxString(): number {
    return safeGet(this, '_MaxString', 255);
  }

  set MaxElements(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxElements invalid, must be greater than 1 - ${val}`);
    }
    this._MaxElements = val;
  }

  get MaxElements(): number {
    return safeGet(this, '_MaxElements', 100);
  }

  set FS(val: string) {
    if (typeof val !== 'string' || val.length !== 1) {
      throw new ValidationError(`FS invalid, must be 1 character - given ${val.length}`);
    }
    this._FS = val;
  }

  get FS(): string {
    return safeGet(this, '_FS', '/');
  }

  set Sys(val: string) {
    if (typeof val !== 'string' || val.length !== 1) {
      throw new ValidationError(`Sys invalid, must be 1 character - given ${val.length}`);
    }
    this._Sys = val;
  }

  get Sys(): string {
    return safeGet(this, '_Sys', '$');
  }

  set TypeName(val: string) {
    if (typeof val !== 'string' ||  val.length < 1 || val.length > 127) {
      throw new ValidationError(`TypeName invalid, must be between 1 and 127 characters - given ${val.length}`);
    }
    RegExp(val);
    this._TypeName = val;
  }

  get TypeName(): string {
    return safeGet(this, '_TypeName', '^[A-Z][-$A-Za-z0-9]{0,31}$');
  }

  set FieldName(val: string) {
    if (typeof val !== 'string' ||  val.length < 1 || val.length > 127) {
      throw new ValidationError(`FieldName invalid, must be between 1 and 127 characters - given ${val.length}`);
    }
    RegExp(val);
    this._FieldName = val;
  }

  get FieldName(): string {
    return safeGet(this, '_FieldName', '^[a-z][_A-Za-z0-9]{0,31}$');
  }

  set NSID(val: string) {
    if (typeof val !== 'string' ||  val.length < 1 || val.length > 127) {
      throw new ValidationError(`NSID invalid, must be between 1 and 127 characters - given ${val.length}`);
    }
    RegExp(val);
    this._NSID = val;
  }

  get NSID(): string {
    return safeGet(this, '_NSID', '^[A-Za-z][A-Za-z0-9]{0,7}$');
  }
}

/**
 * Class representing JADN Schema's Meta information
 * @extends BaseModel
 */
class Meta extends BaseModel {
  // Meta Values
  module: string;
  patch?: string;
  title?: string;
  description?: string;
  imports?: Record<string, string>;
  exports?: Array<string>;
  config: Config;

  // Helper Variables
  slots: Array<string> = ['module', 'patch', 'title', 'description', 'imports', 'exports', 'config'];
  private configSet: boolean;

  /**
    * Initialize a Meta object
    * @param {SchemaMetaJADN|Meta} schema - The JADN meta to utilize
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  constructor(data?: SchemaMetaJADN|Meta, kwargs?: Record<string, any> ) {
    super(data, kwargs);
    const keys = Object.keys(data || {});

    // Field Vars
    this.module = safeGet(this, 'module', 'MODULE');
    this.config = safeGet(this, 'config', new Config());

    // Helper Vars
    this.configSet = keys.includes('config');
  }

  toString(): string {
    // console.log(`META - ${JSON.stringify(this)}`);
    const value = mergeArrayObjects(
      ...this.slots.map(k => {
        return hasProperty(this, k) ? { [k]: safeGet(this, k) } : {};
      })
    );
    return `Meta ${prettyObject(value)}`;
  }

  /**
    * Initialize the date for the class
    * @param {SchemaMetaJADN|Meta} data - The meta data to validate
    * @return {SchemaMetaJADN} - validated data
    */
  initData(data?: SchemaMetaJADN|Meta): SchemaMetaJADN {
    let d: SchemaMetaJADN;
    if (typeof data === 'object' && data instanceof Meta) {
      d = data.schema(); // eslint-disable-line no-param-reassign
    } else {
      d = data || {module: ''};
    }
    if (!('module' in d)) {
      throw new ValidationError('Meta property \'module\' is required');
    }
    Object.keys(d).forEach(key => {
      // const val = d[key];
      switch (key) {
        case 'module':
        // TODO: URL Validation
        case 'patch':
        case 'title':
        case 'description':
        case 'imports':
        case 'exports':
        case 'config':
        default:
          break;
      }
    });
    return d;
  }

   /**
    * Format this meta into valid JADN format
    * @returns {SchemaMetaJADN} JADN formatted meta
    */
  schema(): SchemaMetaJADN {
    const tmp = mergeArrayObjects(...this.slots.map(f => ({ [f]: safeGet(this, f) }))) as SchemaMetaJADN;
    if (this.configSet) {
      if ('config' in tmp) {
        tmp.config = this.config.schema();
      }
    } else if ('config' in tmp) {
      delete tmp.config;
    }
    return tmp;
  }
}

export default Meta;
export {
  Config
};