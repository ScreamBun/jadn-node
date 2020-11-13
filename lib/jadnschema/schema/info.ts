/* eslint max-classes-per-file: 0 */
// JADN Info & Config
import BaseModel from './base';
import { SchemaConfigJADN, SchemaInfoJADN } from './interfaces';
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
  _TypeName?: RegExp     // TypeName regex
  _FieldName?: RegExp    // FieldName regex
  _NSID?: RegExp         // Namespace Identifier regex

  // Helper Variables
  readonly slots: Array<string> = ['MaxBinary', 'MaxString', 'MaxElements', 'FS', 'Sys', 'TypeName', 'FieldName', 'NSID'];
  readonly defaultConfig = {
    MaxBinary: 255,                           // Default maximum number of octets
    MaxString: 255,                           // Default maximum number of characters
    MaxElements: 100,                         // Default maximum number of items/properties
    FS: '/',                                  // Field Separator character used in pathnames
    Sys: '$',                                 // System character for TypeName
    TypeName: /^[A-Z][-$A-Za-z0-9]{0,31}$/,   // TypeName regex
    FieldName: /^[a-z][_A-Za-z0-9]{0,31}$/,   // FieldName regex
    NSID: /^[A-Za-z][A-Za-z0-9]{0,7}$/        // Namespace Identifier regex
  };


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
    * @return {SchemaConfigJADN} - validated data
    */
  initData(data?: Record<string, number|string>|Config): SchemaConfigJADN {
    let d: Record<string, number|string|RegExp>;
    if (typeof data === 'object' && data instanceof Config) {
      d = data.schema();
    } else {
      d = {
        ...data
      };
    }
    d = objectFromTuple(
      ...Object.keys(d).map<[string, number|string|RegExp]>(k => [k.replace(/^\$/, ''), safeGet(d, k) as number|string|RegExp])
    );

    const RegExpKeys = ['TypeName', 'FieldName', 'NSID'];
    Object.keys(d).forEach(key => {
      if (RegExpKeys.includes(key)) {
        const val = d[key];
        if (!(val instanceof RegExp)) {
          d[key] = new RegExp(val as string);
        }
      }
    });

    return d as SchemaConfigJADN;
  }

  /**
    * Format this config into valid JADN format
    * @returns {Record<string, string>} JADN formatted config
    */
  schema(): Record<string, number|string> {
    return objectFromTuple(
      ...this.slots.map<[string, number|string]|[]>(k => {
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
    return safeGet(this, '_MaxBinary', this.defaultConfig.MaxBinary) as number;
  }

  set MaxString(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxString invalid, must be greater than 1 - ${val}`);
    }
    this._MaxString = val;
  }

  get MaxString(): number {
    return safeGet(this, '_MaxString', this.defaultConfig.MaxString) as number;
  }

  set MaxElements(val: number) {
    if (typeof val !== 'number' || val < 1) {
      throw new ValidationError(`MaxElements invalid, must be greater than 1 - ${val}`);
    }
    this._MaxElements = val;
  }

  get MaxElements(): number {
    return safeGet(this, '_MaxElements', this.defaultConfig.MaxElements) as number;
  }

  set FS(val: string) {
    if (typeof val !== 'string' || val.length !== 1) {
      throw new ValidationError(`FS invalid, must be 1 character - given ${val.length}`);
    }
    this._FS = val;
  }

  get FS(): string {
    return safeGet(this, '_FS', this.defaultConfig.FS) as string;
  }

  set Sys(val: string) {
    if (typeof val !== 'string' || val.length !== 1) {
      throw new ValidationError(`Sys invalid, must be 1 character - given ${val.length}`);
    }
    this._Sys = val;
  }

  get Sys(): string {
    return safeGet(this, '_Sys', this.defaultConfig.Sys) as string;
  }

  set TypeName(val: RegExp) {
    const valStr = val.source;
    if (!(val instanceof RegExp)) {
      throw new ValidationError(`TypeName invalid, must be a valid RegExp`);
    } else if (valStr.length < 1 || valStr.length > 127) {
      throw new ValidationError(`TypeName invalid, must be between 1 and 127 characters - given ${valStr.length}`);
    }
    this._TypeName = RegExp(val);
  }

  get TypeName(): RegExp {
    return safeGet(this, '_TypeName', this.defaultConfig.TypeName) as RegExp;
  }

  set FieldName(val: RegExp) {
    const valStr = val.source;
    if (!(val instanceof RegExp)) {
      throw new ValidationError(`FieldName invalid, must be a valid RegExp`);
    } else if (valStr.length < 1 || valStr.length > 127) {
      throw new ValidationError(`FieldName invalid, must be between 1 and 127 characters - given ${valStr.length}`);
    }
    this._FieldName = RegExp(val);
  }

  get FieldName(): RegExp {
    return safeGet(this, '_FieldName', this.defaultConfig.FieldName) as RegExp;
  }

  set NSID(val: RegExp) {
    const valStr = val.source;
    if (!(val instanceof RegExp)) {
      throw new ValidationError(`NSID invalid, must be a valid RegExp`);
    } else if (valStr.length < 1 || valStr.length > 127) {
      throw new ValidationError(`NSID invalid, must be between 1 and 127 characters - given ${valStr.length}`);
    }
    this._NSID = RegExp(val);
  }

  get NSID(): RegExp {
    return safeGet(this, '_NSID', this.defaultConfig.NSID) as RegExp;
  }
}

/**
 * Class representing JADN Schema's Info
 * @extends BaseModel
 */
class Info extends BaseModel {
  // Info Values
  package: string;
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
  readonly slots: Array<string> = ['package', 'version', 'title', 'description', 'comment', 'copyright', 'license', 'imports', 'exports', 'config'];
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
    this.package = safeGet(this, 'package', 'PACKAGE') as string;
    this.config = safeGet(this, 'config', new Config()) as Config;

    // Helper Vars
    this.configSet = keys.includes('config');
  }

  toString(): string {
    const value = objectFromTuple(
      ...this.slots.map<[string, string|Array<string>|Record<string, number|string>]|[]>(k => {
        if (hasProperty(this, k)) {
          const v = k === 'config' ? this[k].schema() : safeGet(this, k) as string|Array<string>|Record<string, string>;
          return [k, v];
        }
        return [];
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
        package: '',
        ...data
      };
    }
    if (!('package' in d)) {
      throw new ValidationError('Info property \'package\' is required');
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...this.slots.map<[string, any]|[]>(k => {
        const v = k === 'config' ? this[k].schema() : safeGet(this, k) as string|Array<string>|Record<string, string>;
        return v ? [k, v] : [];
      })
    ) as SchemaInfoJADN;

    if (!this.configSet && 'config' in tmp) {
      delete tmp.config;
    }
    return tmp;
  }
}

export default Info;
export {
  Config
};