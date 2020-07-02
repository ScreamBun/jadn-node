// JADN Field/Type Options
import BaseModel from './base';

import { OptionError, ValidationError } from '../exceptions';
import {
  flattenArray,
  hasProperty,
  invertObject,
  objectFromTuple,
  objectValues,
  safeGet
} from '../utils';

// Helper Vars
export const OptionTypes: Record<string, Array<string>> = {
  field: [
    'default',
    'dir',
    'minc',
    'maxc',
    'tfield'
  ],
  type: [
    // Structural
    'enum',
    'id',
    'ktype',
    'vtype',
    'pointer',
    // Validation
    'format',
    'minv',
    'maxv',
    'pattern',
    'unique'
  ]
};
export const BoolOpts: Array<string> = ['id', 'dir', 'unique'];
export const OptionIds: Record<string, string> = {
  // Field Structural
  '!': 'default',     // Reserved for default value § 3.2.2.4
  '<': 'dir',         // Use FieldName as a qualifier for fields in FieldType
  '[': 'minc',        // Minimum cardinality
  ']': 'maxc',        // Maximum cardinality
  '&': 'tfield',      // Field that specifies the type of this field, value is Enumerated
  // Type Structural
  '#': 'enum',        // Enumerated type derived from the specified Array, Choice, Map or Record type
  '=': 'id',          // Optional-Enumerated values and fields of compound types denoted by FieldID rather than FieldName
  '+': 'ktype',       // Key type for MapOf
  '*': 'vtype',       // Value type for ArrayOf and MapOf
  '>': 'pointer',     // Extension: Enumerated type containing pointers derived from the specified Array, Choice, Map or Record type
  // Type Validation
  '/': 'format',      // Semantic validation keyword
  '{': 'minv',        // Minimum numeric value, octet or character count, or element count
  '}': 'maxv',        // Maximum numeric value, octet or character count, or element count
  '%': 'pattern',     // Regular expression used to validate a String type
  'q': 'unique'      // If present, an ArrayOf instance must not contain duplicate values
};
export const EnumId = invertObject(OptionIds).enum;
export const ValidFormats: Array<string> = [
  // JSON Formats
  'date-time',              // RFC 3339 § 5.6
  'date',                   // RFC 3339 § 5.6
  'time',                   // RFC 3339 § 5.6
  'email',                  // RFC 5322 § 3.4.1
  'idn-email',              // RFC 6531, or email
  'hostname',               // RFC 1034 § 3.1
  'idn-hostname',           // RFC 5890 § 2.3.2.3, or hostname
  'ipv4',                   // RFC 2673 § 3.2 "dotted-quad"
  'ipv6',                   // RFC 4291 § 2.2 "IPv6 address"
  'uri',                    // RFC 3986
  'uri-reference',          // RFC 3986, or uri
  'iri',                    // RFC 3987
  'iri-reference',          // RFC 3987
  'uri-template',           // RFC 6570
  'json-pointer',           // RFC 6901 § 5
  'relative-json-pointer',  // JSONP
  'regex',                  // ECMA 262
  // JADN Formats
  'eui',        // IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI
  'ipv4-addr',  // IPv4 address as specified in RFC 791 § 3.1
  'ipv6-addr',  // IPv6 address as specified in RFC 8200 § 3
  'ipv4-net',   // Binary IPv4 address and Integer prefix length as specified in RFC 4632 §3.1
  'ipv6-net',   // Binary IPv6 address and Integer prefix length as specified in RFC 4291 §2.3
  'i8',         // Signed 8 bit integer, value must be between -128 and 127
  'i16',        // Signed 16 bit integer, value must be between -32768 and 32767.
  'i32',        // Signed 32 bit integer, value must be between ... and ...
  'u\\d+',       // Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1
  // Serialization
  'x',          // Binary-JSON string containing Base16 (hex) encoding of a binary value as defined in RFC 4648 § 8
  'ipv4-addr',  // Binary-JSON string containing a "dotted-quad" as specified in RFC 2673 § 3.2.
  'ipv6-addr',  // Binary-JSON string containing text representation of IPv6 address specified in RFC 4291 § 2.2
  'ipv4-net',   // Array-JSON string containing text representation of IPv4 address range specified in RFC 4632 § 3.1
  'ipv6-net'    // Array-JSON string containing text representation of IPv6 address range specified in RFC 4291 § 2.3
];
export const ValidOptions: Record<string, Array<string>> = {
  // Primitives
  Binary: ['format', 'maxv', 'minv'],
  Boolean: [],
  Integer: ['format', 'maxv', 'minv'],
  Number: ['format', 'maxv', 'minv'],
  Null: [],
  String: ['format', 'maxv', 'minv', 'pattern'],
  // Structures
  Array: ['format', 'maxv', 'minv'],
  ArrayOf: ['maxv', 'minv', 'vtype', 'unique'],
  Choice: ['id'],
  Enumerated: ['id', 'enum', 'pointer'],
  Map: ['id', 'maxv', 'minv'],
  MapOf: ['ktype', 'maxv', 'minv', 'vtype'],
  Record: ['minv', 'maxv', 'path']
};

// Helper Functions
export const opts2obj = (opts: Array<string>): Record<string, boolean|number|string> => {
  return objectFromTuple(...opts.map<[string, boolean|number|string]|[]>(o => {
    const opt = o.slice(0, 1);
    const val = o.slice(1);
    if (opt in OptionIds) {
      const optKey = OptionIds[opt];
      return [optKey, BoolOpts.includes(optKey) ? true : val];
    }
    return [opt, val];
  }));
};

// Helper Functions
export const opts2arr = (opts: Record<string, boolean|number|string>): Array<string> => {
  const ids = invertObject(OptionIds);
  // eslint-disable-next-line array-callback-return
  return Object.keys(opts).map(opt => {
    let val = safeGet(opts, opt) as boolean|number|string;
    if (val !== null && val !== undefined) {
      if (opt === 'vtype') {
        val = val as string;
        val = val.startsWith('_Enum') ? val.replace('_Enum-', EnumId) : val;
        val = val.endsWith('$Enum') ? `${EnumId}${val.replace('$Enum', '')}` : val;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${ids[opt]}${BoolOpts.includes(opt) ? '' : val}`;
    }
    return '';
  }).filter(t => t.length > 0);
};

class Options extends BaseModel {
  // Type Structural
  enum?: string
  id?: boolean
  vtype?: string
  ktype?: string
  // Type Validation
  format?: string
  minv?: number
  maxv?: number
  pattern?: string
  unique?: boolean
  // Field
  default?: string
  path?: boolean
  minc?: number
  maxc?: number
  tfield?: string  // Enumerated

  // Helper Vars
  slots = flattenArray(objectValues(OptionTypes));

  /**
    * Initialize an Options object
    * @param {Record<string, number|string>|Array<string>|Options} data - options data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data?: Record<string, number|string>|Array<string>|Options, kwargs?: Record<string, any> ) {
    super(data, kwargs);
  }

  /**
    * initialize the date for the class
    * @param {Record<string, number|string>|Array<string>|Options} data - The Options data to validate
    * @return {Record<string, boolean|number|string>} - validated data
    */
  initData(data?: Record<string, number|string>|Array<string>|Options): Record<string, boolean|number|string>|Options {
    let d: Record<string, boolean|number|string>;
    if (typeof data === 'object' && data instanceof Options) {
      d = data.object();
    } else if (typeof data === 'object' && Array.isArray(data)) {
      d = opts2obj(data);
    } else {
      d = data || {};
    }

    Object.keys(d).forEach(key => {
      const val = d[key];
      switch (key) {
        case 'dir':  // boolean
        case 'id':  // boolean
        case 'unique':  // boolean
          break;
        case 'minv':  // number
        case 'maxv':  // number
        case 'minc':  // number
        case 'maxc':  // number
          if (typeof val === 'string') {
            d[key] = parseInt(val, 10);
          }
          break;
        case 'enum':  // string
        case 'vtype':  // string
        case 'ktype':  // string
        case 'format':  // string
        case 'pattern':  // string
        case 'default':  // string
        case 'tfield':  // string  // Enumerated
          break;
        default:
          throw new ValidationError(`'${key}' invalid, Options has no property by this name`);
      }
    });
    return d;
  }

  /**
    * Format the options into valid JADN format
    * @param {string} baseType
    * @param {string} defName
    * @param {boolean} field
    * @return {Array<string>} JADN formatted options
    */
  schema(baseType: string, defName?: string, field?: boolean): Array<string> {
    this.verify(baseType, defName, field);
    return opts2arr(this.object());
  }

  /**
    * Verify the definitions are proper based on the basetype and field status
    * @param {string} baseType - base type to validate options against
    * @param {string} defName - name of definition/field to use in error message
    * @param {boolean} field - options are field/type options
    * @param {boolean} silent - raise or return errors
    * @return {Array<Error>} array of errors
    */
  verify(baseType: string, defName?: string, field?: boolean, silent?: boolean): Array<Error> {
    silent = silent || false; // eslint-disable-line no-param-reassign
    let errors = [];
    const validOpts = [ ...(ValidOptions[baseType] || []), ...(field ? OptionTypes.field : [])];
    const opts = this.object();
    const keys = Object.keys(opts).filter(x => !validOpts.includes(x) );
    const loc = defName ? `${defName}(${baseType})` : baseType;

    if (keys.length > 0) {
      errors.push(new OptionError(`Extra options given for ${loc} - ${keys.join(', ')}`));
    } else if (baseType === 'ArrayOf') {
      if (!Object.keys(opts).includes('vtype')) {
        errors.push(new OptionError(`ArrayOf ${loc} requires options: vtype`));
      }
    } else if (baseType === 'MapOf') {
      if (!Object.keys(opts).includes('ktype') || !Object.keys(opts).includes('vtype')) {
        errors.push(new OptionError(`MapOf ${loc} requires options: ktype and vtype`));
      }
    }

    const values = field ? ['minc', 'maxc'] : ['minv', 'maxv'];
    const minimum = safeGet(this, values[0], 1) as number;
    const maximum = safeGet(this, values[1], Math.max(1, minimum)) as number;

    if (maximum && maximum !== 0 && maximum < minimum) {
      errors.push(new OptionError(`${values[1]} cannot be less than ${values[0]}`));
    }

    const fmt = safeGet(opts, 'format') as null|string;
    if (fmt && !ValidFormats.some(f => fmt ? RegExp(`^${f}$`).exec(fmt) : false)) {
      errors.push(new OptionError(`${baseType} ${loc} specified unknown format ${fmt}`));
    }

    errors = errors.filter(e => e);
    if (errors.length > 0 && !silent) {
      throw errors[0];
    }
    return errors;
  }

  /**
    * Determine the multiplicity of the min/max options
    * minc    maxc	Multiplicity	Description	                                Keywords
    *  0	    1	    0..1	        No instances or one instance	            optional
    *  1	    1	    1	            Exactly one instance	                    required
    *  0	    0	    0..*	        Zero or more instances	                    optional, repeated
    *  1	    0	    1..*	        At least one instance	                    required, repeated
    *  m	    n	    m..n	        At least m but no more than n instances     required, repeated if m > 1
    *
    * @param {number} minDefault - default value of minc/minv
    * @param {number} maxDefault -  default value of maxc/maxv
    * @param {boolean} field - if option for field or type
    * @param {Function} check - function for ignoring multiplicity - Fun(minimum, maximum) -> boolean
    * @return {string} options multiplicity or empty string
  */
  multiplicity(minDefault?: number, maxDefault?: number, field?: boolean, check?: (x: number, y: number) => boolean): string {
    field = typeof field === 'boolean' ? field : false; // eslint-disable-line no-param-reassign
    // @ts-ignore
    const checkFun: (x: number, y: number) => boolean = ['null', 'undefined'].includes(typeof check) ? (x: number, y: number): boolean => true : check;  // eslint-disable-line no-param-reassign, no-unused-vars, @typescript-eslint/no-unused-vars
    const values = field ? ['minc', 'maxc'] : ['minv', 'maxv'];
    const minimum = safeGet(this, values[0], minDefault || 0) as number;
    const maximum = safeGet(this, values[1], maxDefault || 0) as number;
    if (checkFun(minimum, maximum)) {
      if (minimum === 1 && maximum === 1) {
        return '1';
      }
      return `${minimum}..${maximum === 0 ? '*' : maximum}`;
    }
    return '';
  }

  /**
    * Split the current options object into Type and Field
    * @return {[Options, Options]} Split option - [Field, Type]
    */
  split(): [Options, Options] {
    const fieldOpts = objectFromTuple(
      ...OptionTypes.field.map<[string, any]|[]>(o => hasProperty(this, o) ? [o, safeGet(this, o) ] : [] )
    );
    const typeOpts = objectFromTuple(
      ...OptionTypes.type.map<[string, any]|[]>(o => hasProperty(this, o) ? [o, safeGet(this, o) ] : [] )
    );
    return [new Options(fieldOpts), new Options(typeOpts)];
  }
}

export default Options;