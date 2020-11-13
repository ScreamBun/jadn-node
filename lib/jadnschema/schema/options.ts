// JADN Field/Type Options
import BaseModel from './base';
import { OptionError, ValidationError } from '../exceptions';
import {
  flattenArray, hasProperty, invertObject, objectFromTuple, objectValues, safeGet
} from '../utils';

// Helper Vars
export const OptionTypes: Record<string, Array<string>> = {
  field: [
    'minc',
    'maxc',
    'tagid',
    'dir',
    'key',
    'link'
  ],
  type: [
    'id',
    'ktype',
    'vtype',
    'enum',
    'pointer',
    'format',
    'pattern',
    'minv',
    'maxv',
    'minf',
    'maxf',
    'unique',
    'set',
    'unordered',
    'extend',
    'default'
  ]
};
export const OptionIds: Record<string, string> = {
  // Field Structural
  '[': 'minc',        // Minimum cardinality
  ']': 'maxc',        // Maximum cardinality
  '&': 'tagid',       // Field containing an explicit tag for this Choice type
  '<': 'dir',         // Use FieldName as a qualifier for fields in FieldType
  'K': 'key',         // Field is a primary key for this type
  'L': 'link',        // Field is a relationship or link to a type instance (Extension: Section 3.3.6)
  // Type
  '=': 'id',          // Optional-Enumerated values and fields of compound types denoted by FieldID rather than FieldName
  '+': 'ktype',       // Key type for MapOf
  '*': 'vtype',       // Value type for ArrayOf and MapOf
  '#': 'enum',        // Extension: Enumerated type derived from a specified type
  '>': 'pointer',     // Extension: Enumerated type containing pointers derived from a specified type
  '/': 'format',      // Semantic validation keyword
  '%': 'pattern',     // Regular expression used to validate a String type
  '{': 'minv',        // Minimum numeric value, octet or character count, or element count
  '}': 'maxv',        // Maximum numeric value, octet or character count, or element count
  'y': 'minf',        // Minimum real number value
  'z': 'maxf',        // Maximum real number value
  'q': 'unique',      // If present, an ArrayOf instance must not contain duplicate values
  's': 'set',         // ArrayOf instance is unordered and unique
  'b': 'unordered',   // ArrayOf instance is unordered
  'X': 'extend',      // Type has an extension point where fields may be added in the future
  '!': 'default'      // Default value
};
const BoolOpts: Array<string> = ['dir', 'extend', 'id', 'key', 'link', 'set', 'unique', 'unordered'];
const IntegerOpts: Array<string> = ['minc', 'maxc', 'minv', 'maxv'];
const FloatOpts: Array<string> = ['minf', 'maxf'];
const StringOpts: Array<string> = ['default', 'enum', 'format', 'ktype', 'pattern', 'pointer', 'tagid', 'vtype'];
const InvertedOptions = invertObject(OptionIds);
export const EnumId = InvertedOptions.enum;
export const PointerId = InvertedOptions.pointer;
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
  Binary: ['format', 'minv', 'maxv'],
  Boolean: [],
  Integer: ['format', 'minv', 'maxv'],
  Number: ['format', 'minf', 'maxf'],
  Null: [],
  String: ['format', 'pattern', 'maxv', 'minv'],
  // Structures
  Array: ['format', 'minv', 'maxv', 'extend'],
  ArrayOf: ['vtype', 'minv', 'maxv', 'set', 'unique', 'unordered'],
  Choice: ['id', 'extend'],
  Enumerated: ['id', 'enum', 'pointer', 'extend'],
  Map: ['id', 'minv', 'maxv', 'extend'],
  MapOf: ['ktype', 'vtype', 'minv', 'maxv'],
  Record: ['minv', 'maxv', 'extend']
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
  // Field Options
  minc?: number
  maxc?: number
  tagid?: string
  dir?: boolean
  key?: boolean
  link?: boolean
  // Type Options
  id?: boolean
  ktype?: string
  vtype?: string
  enum?: string
  pointer?: string
  format?: string
  pattern?: string
  minv?: number
  maxv?: number
  minf?: number
  maxf?: number
  unique?: boolean
  set?: boolean
  unordered?: boolean
  extend?: boolean
  default?: string

  // Helper Vars
  readonly slots = flattenArray(objectValues(OptionTypes));

  /**
    * Initialize an Options object
    * @param {Record<string, boolean|number|string>|Array<string>|Options} data - options data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor
  constructor(data?: Record<string, boolean|number|string>|Array<string>|Options, kwargs?: Record<string, any> ) {
    super(data, kwargs);
  }

  /**
    * initialize the date for the class
    * @param {Record<string, boolean|number|string>|Array<string>|Options} data - The Options data to validate
    * @return {Record<string, boolean|number|string>} - validated data
    */
  initData(data?: Record<string, boolean|number|string>|Array<string>|Options): Record<string, boolean|number|string>|Options {
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
      switch (true) {
        // Boolean values
        case BoolOpts.includes(key):
          break;
        // Float values
        case FloatOpts.includes(key):
          if (typeof val === 'string') {
            d[key] = parseFloat(val);
          }
          break;
        // Integer values
        case IntegerOpts.includes(key):
          if (typeof val === 'string') {
            d[key] = parseInt(val, 10);
          }
          break;
        // String values
        case StringOpts.includes(key):
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
    *  0	    1	    0..1	        No instances or one instance	              optional
    *  1	    1	    1	            Exactly one instance	                      required
    *  0	    0	    0..*	        Zero or more instances	                    optional, repeated
    *  1	    0	    1..*	        At least one instance	                      required, repeated
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    * Determine if the give field options define an ArrayOf
    * @returns {boolean} Determination if ArrayOf
    */
  isArray(): boolean {
    const min = safeGet(this, 'minc', 0) as number;
    const max = safeGet(this, 'maxc', null) as null|number;
    return (max !== null && max !== 1) || (min !== null && min > 1);
  }

  /**
    * Determine if the give field is optional
    * @returns {boolean} Determination if optional
    */
  isOptional(): boolean {
    const min = safeGet(this, 'minc', 0) as number;
    return min === 0;
  }

  /**
    * Split the current options object into Type and Field
    * @return {[Options, Options]} Split option - [Field, Type]
    */
  split(): [Options, Options] {
    const fieldOpts = objectFromTuple(
      ...OptionTypes.field.map<[string, boolean|number|string]|[]>(o => hasProperty(this, o) ? [o, safeGet(this, o) ] : [] )
    );
    const typeOpts = objectFromTuple(
      ...OptionTypes.type.map<[string, boolean|number|string]|[]>(o => hasProperty(this, o) ? [o, safeGet(this, o) ] : [] )
    );
    return [new Options(fieldOpts), new Options(typeOpts)];
  }
}

export default Options;