/* eslint max-classes-per-file: 0 */
// JADN Config
import BaseModel from './base';
import { SchemaInfoJADN } from './interfaces';
import { ValidationError } from '../exceptions';
import {
  hasProperty, objectFromTuple, prettyObject, safeGet
} from '../utils';

/**
 * Class representing JADN Schema's Info-Config
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
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
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
      d = {
        ...data
      };
    }
    return objectFromTuple(
      ...Object.keys(d).map<[string, any]>(k => [k.replace(/^\$/, ''), safeGet(d, k) ])
    );
  }

  /**
    * Format this config into valid JADN format
    * @returns {Record<string, string>} JADN formatted config
    */
  schema(): Record<string, string> {
    return objectFromTuple(
      ...(this.slots || []).map<[string, any]|[]>(k => {
        return hasProperty(this, `_${k}`) ? [`$${k}`, safeGet(this, k) ] : [];
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
    return safeGet(this, '_MaxBinary', 255) as number;
  }

  set MaxString(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxString invalid, must be greater than 1 - ${val}`);
    }
    this._MaxString = val;
  }

  get MaxString(): number {
    return safeGet(this, '_MaxString', 255) as number;
  }

  set MaxElements(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxElements invalid, must be greater than 1 - ${val}`);
    }
    this._MaxElements = val;
  }

  get MaxElements(): number {
    return safeGet(this, '_MaxElements', 100) as number;
  }

  set FS(val: string) {
    if (typeof val !== 'string' || val.length !== 1) {
      throw new ValidationError(`FS invalid, must be 1 character - given ${val.length}`);
    }
    this._FS = val;
  }

  get FS(): string {
    return safeGet(this, '_FS', '/') as string;
  }

  set Sys(val: string) {
    if (typeof val !== 'string' || val.length !== 1) {
      throw new ValidationError(`Sys invalid, must be 1 character - given ${val.length}`);
    }
    this._Sys = val;
  }

  get Sys(): string {
    return safeGet(this, '_Sys', '$') as string;
  }

  set TypeName(val: string) {
    if (typeof val !== 'string' ||  val.length < 1 || val.length > 127) {
      throw new ValidationError(`TypeName invalid, must be between 1 and 127 characters - given ${val.length}`);
    }
    RegExp(val);
    this._TypeName = val;
  }

  get TypeName(): string {
    return safeGet(this, '_TypeName', '^[A-Z][-$A-Za-z0-9]{0,31}$') as string;
  }

  set FieldName(val: string) {
    if (typeof val !== 'string' ||  val.length < 1 || val.length > 127) {
      throw new ValidationError(`FieldName invalid, must be between 1 and 127 characters - given ${val.length}`);
    }
    RegExp(val);
    this._FieldName = val;
  }

  get FieldName(): string {
    return safeGet(this, '_FieldName', '^[a-z][_A-Za-z0-9]{0,31}$') as string;
  }

  set NSID(val: string) {
    if (typeof val !== 'string' ||  val.length < 1 || val.length > 127) {
      throw new ValidationError(`NSID invalid, must be between 1 and 127 characters - given ${val.length}`);
    }
    RegExp(val);
    this._NSID = val;
  }

  get NSID(): string {
    return safeGet(this, '_NSID', '^[A-Za-z][A-Za-z0-9]{0,7}$') as string;
  }
}

/**
 * Class representing JADN Schema's Info
 * @extends BaseModel
 */
class Info extends BaseModel {
  // Info Values
  module: string;
  version?: string;
  title?: string;
  description?: string;
  comment?: string;
  copyright?: string;
  license?: string;
  imports?: Record<string, string>;
  exports?: Array<string>;
  config: Config;

  // Helper Variables
  slots: Array<string> = ['module', 'version', 'title', 'description', 'comment', 'copyright', 'license', 'imports', 'exports', 'config'];
  private configSet: boolean;

  /**
    * Initialize an Info object
    * @param {SchemaInfoJADN|Info} schema - The JADN info to utilize
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data?: SchemaInfoJADN|Info, kwargs?: Record<string, any> ) {
    super(data, kwargs);
    const keys = Object.keys(data || {});

    // Field Vars
    this.module = safeGet(this, 'module', 'MODULE') as string;
    this.config = safeGet(this, 'config', new Config()) as Config;

    // Helper Vars
    this.configSet = keys.includes('config');
  }

  toString(): string {
    const value = objectFromTuple(
      ...this.slots.map<[string, any]|[]>(k => {
        return hasProperty(this, k) ? [k, safeGet(this, k) ] : [];
      })
    );
    return `Info ${prettyObject(value)}`;
  }

  /**
    * Initialize the date for the class
    * @param {SchemaInfoJADN|Info} data - The info data to validate
    * @return {SchemaInfoJADN} - validated data
    */
  initData(data?: SchemaInfoJADN|Info): SchemaInfoJADN {
    let d: SchemaInfoJADN;
    if (typeof data === 'object' && data instanceof Info) {
      d = data.schema(); // eslint-disable-line no-param-reassign
    } else {
      d = {
        module: '',
        ...data
      };
    }
    if (!('module' in d)) {
      throw new ValidationError('Info property \'module\' is required');
    }
    // TODO: Validation
    return d;
  }

   /**
    * Format this info into valid JADN format
    * @returns {SchemaInfoJADN} JADN formatted info
    */
  schema(): SchemaInfoJADN {
    const tmp = objectFromTuple(
      ...this.slots.map<[string, any]|[]>(k => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const v = safeGet(this, k);
        return v ? [k, v] : [];
      })
    ) as SchemaInfoJADN;

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

export default Info;
export {
  Config
};