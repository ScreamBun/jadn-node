// JADN Schema Model
import path from 'path';
import fs from 'fs-extra';
import pluralize from 'pluralize';

import BaseModel, { initModel } from './base';
import { DefinitionBase } from './definitions';
import Meta from './meta';
import Options, { EnumId } from './options';

import { FormatError, SchemaError, ValidationError } from '../exceptions';
import {
  // General Interfaces
  SchemaJADN,
  // Simple Interfaces
  SchemaSimpleJADN,
  // Complex Interfaces
  SchemaObjectJADN
} from './interfaces';
import {
  // Simple Interfaces
  SchemaSimpleEnumField,
  SchemaSimpleGenField,
  SchemaSimpleType,
  SchemaSimpleComplexType,
  // Complex Interfaces
  SchemaObjectGenField,
  SchemaObjectEnumField,
  SchemaObjectType,
  SchemaObjectComplexType
} from './definitions/interfaces';
import {
  cloneObject,
  flattenArray,
  mergeArrayObjects,
  objectValues,
  prettyObject,
  safeGet,
  zip,
  // General
  capitalize
} from '../utils';

// Format valiator
export type GeneralValidator = (inst: any) => Array<Error>;
export type UnsignedValidator = (n: number, inst: any) => Array<Error>;

class Schema extends BaseModel {
  // Fields Variables
  meta: Meta;
  types: Record<string, DefinitionBase>;

  // Helper Variables
  slots: Array<string> = ['meta', 'types'];
  derived: Record<string, DefinitionBase>;
  protected schemaTypes: Set<string>;
  protected validators: Record<string, GeneralValidator|UnsignedValidator> = {} // = ValidationFormats;
  protected definitionOrder: Array<string> = ['OpenC2-Command', 'OpenC2-Response', 'Action', 'Target', 'Actuator', 'Args', 'Status-Code',
    'Results', 'Artifact', 'Device', 'Domain-Name', 'Email-Addr', 'Features', 'File', 'IDN-Domain-Name', 'IDN-Email-Addr',
    'IPv4-Net', 'IPv4-Connection', 'IPv6-Net', 'IPv6-Connection', 'IRI', 'MAC-Addr', 'Process', 'Properties', 'URI',
    'Action-Targets', 'Targets', 'Date-Time', 'Duration', 'Feature', 'Hashes', 'Hostname', 'IDN-Hostname', 'IPv4-Addr',
    'IPv6-Addr', 'L4-Protocol', 'Message-Type', 'Nsid', 'Payload', 'Port', 'Response-Type', 'Versions', 'Version',
    'Profiles', 'Rate-Limit', 'Binary', 'Command-ID'];

  /**
    * Initialize a Schema object
    * @param {SchemaSimpleJADN|Schema} schema - The JADN schema to utilize
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(schema?: SchemaSimpleJADN|Schema, kwargs?: Record<string, any> ) {
    super({}, kwargs);
    // Fields Variables
    this.meta = safeGet(this, 'meta', new Meta()) as Meta;
    this.types = safeGet(this, 'types', {}) as Record<string, DefinitionBase>;

    // Helper Variables
    this.derived = {};
    this.schemaTypes = new Set();

    if (schema) {
      this._setSchema(schema);
    }
  }

  toString(): string {
    const value = {
      meta: this.meta,
      types: this.types
    };
    return `Schema ${prettyObject(value)}`;
  }

  get formats(): Array<string> {
    return Object.keys(this.validators);
  }

  get validationFormats(): Record<string, GeneralValidator|UnsignedValidator> {
    return cloneObject(this.validators) as Record<string, GeneralValidator|UnsignedValidator>;
  }

  /**
    * Analyze the given schema for unreferenced and undefined types
    * @return {Record<string, string|Array<string>>} analysis results
    */
  analyze(): Record<string, string|Array<string>> {
    const typeDeps = this.dependencies();
    const refs = new Set([
      ...objectValues(typeDeps).reduce((acc: Array<string>, val: Set<string>) => [...acc, ...val], []),
      ...this.meta.get('exports', []) as Array<string>
    ]);
    const types = new Set([...Object.keys(typeDeps), ...Object.keys(this.derived)]);

    return {
      module: `${this.meta.get('module', '') as string}${this.meta.get('patch', '') as string}`,
      exports: this.meta.get('exports', []) as Array<string>,
      unreferenced: [...types].filter(d => !refs.has(d)).filter(d => !Object.keys(this.derived).includes(d)),
      undefined: [...refs].filter(d => !types.has(d))
    };
  }

  /**
    * Determine the dependencies for each type within the schema
    * @return {Record<string, Set<string>>} record of dependencies
    */
  dependencies(): Record<string, Set<string>> {
    const nsids = Object.keys(this.meta.get('imports', {}));
    const typeDeps = mergeArrayObjects(
      ...nsids.map((imp: string) => ({[imp]: new Set<string>() }))
    );

    /**
      * Return namespace if name has a known namespace, otherwise return full name
      * @param {string} name - namespace of the type
      * @returns {string}
     */
    function ns(name: string): string {
      const nsp = name.split(':')[0];
      return nsids.includes(nsp) ? nsp : name.replace(new RegExp(`^${EnumId}`), '');
    }

    Object.keys(this.types).forEach(typeName => {
      const typeDef: DefinitionBase = this.types[typeName];
      typeDeps[typeName] = new Set([...typeDef.dependencies].map(d => ns(d) ));
    });
    return typeDeps;
  }

  /**
    * Format this schema into valid JADN format
    * @param {boolean} strip - strip comments from schema
    * @return {SchemaSimpleJADN} Schema as simple object
    */
  schema(strip?: boolean): SchemaSimpleJADN {
    strip = typeof strip === 'boolean' ? strip : false; // eslint-disable-line no-param-reassign
    const typeKeys = Object.keys(this.types);
    const schemaTypes: Array<SchemaSimpleType|SchemaSimpleComplexType> = [
      ...this.definitionOrder.map(def => {
        return typeKeys.includes(def) ? this.types[def].schema(strip) : [];
      }) as Array<SchemaSimpleType|SchemaSimpleComplexType>,
      ...typeKeys.map(def => {
        return this.definitionOrder.includes(def) ? [] : this.types[def].schema(strip);
      }) as Array<SchemaSimpleType|SchemaSimpleComplexType>
    ].filter(d => d.length > 1);
    return {
      meta: this.meta.schema(),
      types: schemaTypes
    };
  }

  /**
    * Format this schema into valid pretty JADN format
    * @param {boolean} strip - strip comments from schema
    * @param {number} indent - number of spaces to indent
    * @return {string} JADN pretty formatted schema string
    */
  schemaPretty(strip?: boolean, indent?: number): string {
    strip = typeof strip === 'boolean' ? strip : false; // eslint-disable-line no-param-reassign
    return this._dumps(this.schema(strip), indent);
  }

  /**
    * Given a schema, return a simplified schema with schema extensions removed
    * @param {boolean} simple - return a simple type (SchemaSimpleJADN) instead of an object (Schema)
    * @param {SchemaSimpleJADN} schema - JADN schema to simplify
    * @param {boolean} anon - Replace all anonymous type definitions with explicit
    * @param {boolean} multi -  Replace all multiple-value fields with explicit ArrayOf type definitions
    * @param {boolean} derived - Replace all derived enumerations with explicit Enumerated type definitions
    * @param {boolean} mapOf - Replace all MapOf types with listed keys with explicit Map type definitions
    * @return {SchemaSimpleJADN|Schema} Simplified schema
    */
  // eslint-disable-next-line max-len
  simplify(simple?: boolean, schema?: SchemaSimpleJADN, anon?: boolean, multi?: boolean, derived?: boolean, mapOf?: boolean): SchemaSimpleJADN|Schema {
    simple = typeof simple === 'boolean' ? simple : true; // eslint-disable-line no-param-reassign
    schema = schema === undefined ? this.schema() : schema; // eslint-disable-line no-param-reassign
    anon = typeof anon === 'boolean' ? anon : true; // eslint-disable-line no-param-reassign
    multi = typeof multi === 'boolean' ? multi : true; // eslint-disable-line no-param-reassign
    derived = typeof derived === 'boolean' ? derived : true; // eslint-disable-line no-param-reassign
    mapOf = typeof mapOf === 'boolean' ? mapOf : true; // eslint-disable-line no-param-reassign

    const removeAnonymousType = (sch: SchemaObjectJADN): SchemaObjectJADN => {
      const newTypes: Array<SchemaObjectType|SchemaObjectComplexType> = [];
      // eslint-disable-next-line no-param-reassign
      sch.types = (sch.types || []).map((td: SchemaObjectType|SchemaObjectComplexType) => {
        const typeDef: SchemaObjectType|SchemaObjectComplexType = { ...td };
        if ('fields' in typeDef) {
          typeDef.fields = (typeDef.fields || []).map((fd: SchemaObjectGenField|SchemaObjectEnumField) => {
            const fieldDef: SchemaObjectGenField|SchemaObjectEnumField = { ...fd };
            if ('options' in fieldDef) {
              const [fieldOpts, typeOpts] = fieldDef.options.split();
              if (Object.keys(typeOpts.object()).length > 0) {
                const newName = `${fieldDef.type}${this.meta.config.Sys}${fieldDef.name}`.replace('_', '-');
                newTypes.push({
                  name: newName,
                  type: fieldDef.type,
                  options: typeOpts,
                  description: fieldDef.description
                });
                fieldDef.type = newName;
                fieldDef.options = fieldOpts;
              }
            }
            return fieldDef;
          });
        }
        return typeDef;
      });
      sch.types.push(...newTypes);
      return sch;
    };

    const removeMultiplicity = (sch: SchemaObjectJADN): SchemaObjectJADN => {
      const newTypes: Array<SchemaObjectType> = [];
      // eslint-disable-next-line no-param-reassign
      sch.types = (sch.types || []).map((td: SchemaObjectType|SchemaObjectComplexType) => {
        const typeDef: SchemaObjectType|SchemaObjectComplexType = { ...td };
        if ('fields' in typeDef) {
          typeDef.fields = (typeDef.fields || []).map((fd: SchemaObjectGenField|SchemaObjectEnumField) => {
            const fieldDef: SchemaObjectGenField|SchemaObjectEnumField = { ...fd };
            if ('options' in fieldDef) {
              const [fieldOpts, typeOpts] = fieldDef.options.split();
              const minc = fieldOpts.get('minc', 0) as number;
              const maxc = fieldOpts.get('maxc', null) as null|number;
              if ((maxc !== null && maxc !== 1) || (minc !== null && minc > 1)) {
                delete fieldOpts.maxc;

                typeOpts.vtype = fieldDef.type;
                typeOpts.minv = Math.max(minc, 1);
                if (maxc !== null && maxc > 1) {
                  typeOpts.maxv = maxc;
                }

                const nameArr = fieldDef.name.split('_');
                const endIdx = nameArr.length - 1;
                nameArr[endIdx] = pluralize.isSingular(nameArr[endIdx]) ? pluralize.plural(nameArr[endIdx]) : nameArr[endIdx];
                const newName = nameArr.map(w => capitalize(w)).join('-');

                if (sch.types.filter(t => t.name === newName).length === 0) {
                  newTypes.push({
                    name: newName,
                    type: 'ArrayOf',
                    options: typeOpts,
                    description: fieldDef.description
                  });
                  fieldDef.type = newName;
                  fieldDef.options = fieldOpts;
                }
              }
            }
            return fieldDef;
          });
        }
        return typeDef;
      });
      sch.types.push(...newTypes);
      return sch;
    };

    const removeDerivedEnum = (sch: SchemaObjectJADN): SchemaObjectJADN => {
      const newTypes: Array<SchemaObjectType|SchemaObjectComplexType> = [];
      const derivable = ['ArrayOf', 'Enumerated', 'MapOf'];
      const optChecks: Record<string, (v: string) => boolean> = {
        enum: () => true,
        ktype: (v: string) => v.startsWith(EnumId),
        vtype: (v: string) => v.startsWith(EnumId)
      };

      // eslint-disable-next-line no-param-reassign
      sch.types = (sch.types || []).map((td: SchemaObjectType|SchemaObjectComplexType) => {
        const typeDef: SchemaObjectType|SchemaObjectComplexType = { ...td };
        if (derivable.includes(typeDef.type)) {
          Object.keys(optChecks).forEach((optName: string) => {
            const optCheck = optChecks[optName];
            let opt = typeDef.options.get(optName, null) as null|string;

            if (opt && optCheck(opt)) {
              opt = opt.startsWith(EnumId) ? opt.substring(1) : opt;
              const origTypes: Array<SchemaObjectType|SchemaObjectComplexType> = sch.types.filter(t => t.name === opt);
              if (origTypes.length !== 1) {
                throw new TypeError(`Type of ${opt} does not exist within the schema`);
              }
              const origType = origTypes[0] as SchemaObjectComplexType;
              const newName = `${opt}${this.meta.config.Sys}Enum`.replace('_', '-');
              if (sch.types.filter(t => t.name === newName).length === 0 && newTypes.filter(t => t.name === newName).length) {
                newTypes.push({
                  name: newName,
                  type: 'Enumerated',
                  options: new Options(),
                  description: `Derived enumeration of ${opt}`,
                  fields: (origType.fields || []).map(f => {
                    f = f as SchemaObjectGenField;  // eslint-disable-line no-param-reassign
                    return {id: f.id, value: f.name, description: f.description} as SchemaObjectEnumField;
                  })
                });
              }
              // @ts-ignore
              typeDef.options[optName] = newName;
            }
          });
        }
        return typeDef;
      });
      sch.types.push(...newTypes);
      return sch;
    };

    const removeMapOfEnum = (sch: SchemaObjectJADN): SchemaObjectJADN => {
      sch.types = (sch.types || []).map((typeDef: SchemaObjectType|SchemaObjectComplexType) => {  // eslint-disable-line no-param-reassign
        if (typeDef.type === 'MapOf') {
          const td = {...typeDef, fields: []} as SchemaObjectComplexType;
          const keyType = (sch.types || []).filter(t => t.name === td.options.ktype);
          const valueType = td.options.vtype;
          if (keyType.length !== 1) {
            throw new TypeError(`Type of ${td.options.ktype || 'KTYPE'} does not exist within the schema`);
          }

          if (keyType[0].type === 'Enumerated') {
            td.type = 'Map';
            delete td.options.ktype;
            delete td.options.vtype;
            td.fields = (keyType[0] as SchemaObjectComplexType).fields.map(f => {
              return {id: f.id, name: safeGet(f, 'value', 'NAME') as string, type: valueType, options: new Options(), description: f.description} as SchemaObjectGenField;
            });
          }
          return td;
        }
        return typeDef;
      });
      return sch;
    };

    let complexSchema: SchemaObjectJADN;
    if (schema) {
      complexSchema = this._convertTypes(schema instanceof Schema ? schema.schema() : schema) as SchemaObjectJADN;
    } else {
      complexSchema = this._convertTypes(schema) as SchemaObjectJADN;
    }

    complexSchema = multi ? removeMultiplicity(complexSchema) : complexSchema;
    complexSchema = anon ? removeAnonymousType(complexSchema) : complexSchema;
    complexSchema = derived ? removeDerivedEnum(complexSchema) : complexSchema;
    complexSchema = mapOf ? removeMapOfEnum(complexSchema) : complexSchema;
    const simpleSchema = this._convertTypes(complexSchema) as SchemaSimpleJADN;

    return simple ? simpleSchema : new Schema(simpleSchema);
  }

  /**
    * Load a JADN schema from a file
    * @param {string::Path} fname - JADN schema file to load
    */
  load(fname: string): void {
    fname = path.resolve(fname); // eslint-disable-line no-param-reassign
    if (fs.pathExistsSync(fname)) {
      this._setSchema(fs.readJsonSync(fname));
    } else {
      throw new SchemaError(`Schema does not exist at ${fname}`);
    }
  }

  /**
    * Load a JADN schema from a string or object
    * @param {string|SchemaSimpleJADN} schema - JADN schema string to load
    */
  loads(schema: string|SchemaSimpleJADN): void {
    if (typeof schema === 'object') {
      this._setSchema(schema);
      return;
    }

    try {
      this._setSchema(JSON.parse(schema));
    } catch (err) {
      throw new SchemaError(`Schema improperly formatted - ${String(err)}`);
    }
  }

  /**
    * Write the JADN to a file
    * @param {string} fname - file to write to
    * @param {number} indent - spaces to indent
    * @param {bool} strip - strip comments from schema
    */
  dump(fname: string, indent?: number, strip?: boolean): void {
    indent = indent || 2; // eslint-disable-line no-param-reassign
    strip = strip || false; // eslint-disable-line no-param-reassign
    fs.outputFileSync(fname, `${this._dumps(this.schema(strip), indent)}\n`);
  }

  /**
    * Properly format a JADN schema to a string
    * @param {number} indent - spaces to indent
    * @param {bool} strip - strip comments from schema
    * @return {string} Formatted JADN schema string
    */
  dumps(indent?: number, strip?: boolean): string {
    indent = indent || 2; // eslint-disable-line no-param-reassign
    strip = strip || false; // eslint-disable-line no-param-reassign
    return `${this._dumps(this.schema(strip), indent)}\n`;
  }

  // Validation
  /**
   * Verify the schema is proper
   * @param {boolean} silent - raise or return errors
   * @return {Array<Error>} List of errors raises
   */
  verifySchema(silent?: boolean): void|Array<Error> {
    silent = silent || false; // eslint-disable-line no-param-reassign
    const errors: Array<Error> = [];
    // const schemaTypes: ReadonlySet<string> = this.schemaTypes;

    if (Object.keys(this.meta).length < 2 || Object.keys(this.types).length === 0) {
      const err = new SchemaError('Schema not properly defined');
      if (silent) {
        return [err];
      }
      throw err;
    }

    Object.keys(this.types).forEach((typeName: string) => {
      const typeDef: DefinitionBase = this.types[typeName];
      if (!this.schemaTypes.has(typeDef.type)) {
        errors.push(new TypeError(`Type of ${typeName} not defined: ${typeDef.type}`));
      }
      // errors.push(...(typeDef.verify(schemaTypes, silent) || []));
    });

    const errs = errors.filter(e => e);
    if (errs.length > 0) {
      if (silent) {
           return errs;
      }
      throw errs[0];
    }
  }

  /**
   * Verify the given instance against the current schema
   * @param {Record<string, any>} inst - instance message to validata
   * @param {boolean} silent - raise or return errors
   * @return {Array<Error>} List of errors raises
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: Record<string, any>, silent?: boolean): null|Error {
    silent = silent || true; // eslint-disable-line no-param-reassign
    const errors: Array<Error> = [];

    const exports: Array<string> = this.meta.exports || [];
    // eslint-disable-next-line guard-for-in, no-restricted-syntax, @typescript-eslint/no-for-in-array
    for (const exp in exports) {
      const rtn = this.validateAs(inst, exp);
      if ( rtn.length === 0) {
        return null;
      }
      errors.push(...rtn);
    }
    const errs = errors.filter(e => e);
    if (errs.length > 0 && !silent) {
      throw errs[0];
    }
    return errs.length > 1 ? errs[0] : null;
  }

  /**
   * Verify the given instance against the current schema as a specific exported type
   * @param {Record<string, any>} inst - instance message to validata
   * @param {string} type - exported name to validate as
   * @param {boolean} silent - raise or return errors
   * @return {Array<Error>} List of errors raises
   */
  // @ts-ignore
  validateAs(inst: Record<string, any>, type: string, silent? : boolean): Array<Error> {  // eslint-disable-line @typescript-eslint/no-explicit-any
    silent = silent || true; // eslint-disable-line no-param-reassign
    const errors: Array<Error> = [];

    if (this.meta.exports?.includes(type)) {
      const rtn: Array<Error> = this.types[type].validate(inst);
      if (rtn && rtn.length !== 0) {
        errors.push(...(rtn || []));
      }
    } else {
      errors.push(new ValidationError(`invalid export type, ${type}`));
    }

    const errs = errors.filter(e => e);
    if (errs.length > 0 && !silent) {
      throw errs[0];
    }
    return errs;
  }

  // Helper Functions
  // eslint-disable-next-line no-underscore-dangle
  _getConfig(): Schema {
    return this;
  }

  /**
    * Set the Schema object with the given data
    * @param {Object|'Schema'} data - data to set schema object
    */
  // eslint-disable-next-line no-underscore-dangle
  _setSchema(data: SchemaSimpleJADN|Schema): void {
    if ( typeof data !== 'object' || typeof data !== typeof this) {
      throw new SchemaError('Cannot load schema, incorrect type');
    }
    this.meta = new Meta(safeGet(data, 'meta', {}));

    const simpleSchema: SchemaSimpleJADN = data instanceof Schema ? data.schema() : data;
    // eslint-disable-next-line no-param-reassign
    data = this.simplify(true, simpleSchema, true, true, false, false);

    const [values, errs] = initModel(this, data, {_config: this._getConfig.bind(this)});
    if (errs.length > 0) {
      throw errs[0];
    }

    // update class vars
    this.setProperties(values);

    // update Schema Types
    this.schemaTypes = new Set(flattenArray(objectValues(this.jadnTypes)));

    Object.keys(this.types).forEach((typeName: string) => {
      const typeDef: DefinitionBase = this.types[typeName];
      typeDef.processOptions();
      typeDef.fieldTypes.forEach(t => this.schemaTypes.add(t));
    });
    this.verifySchema();
  }

  /**
    * Properly format a JADN schema
    * @param {any} obj - Schema to format
    * @param {number} indent - spaces to indent
    * @param {number} level -  current indent level
    * @return {string} Formatted JADN schema
    */
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any
  _dumps(obj: any, indent?: number, level?: number): string {
    const indSpace = indent ||  2; // eslint-disable-line no-param-reassign
    const indLvl = level || 0;// eslint-disable-line no-param-reassign

    // eslint-disable-next-line no-underscore-dangle
    let tmpInd = (indSpace % 2 === 1) ? indSpace - 1 : indSpace;
    tmpInd += (indLvl * 2);
    const ind = ' '.repeat(tmpInd);
    const indE = ' '.repeat(tmpInd - 2);

    if (obj === null || obj === undefined) {
      return '';
    }

    switch (typeof obj) {
      case 'object':
        if (Array.isArray(obj)) {
          const lastIdx = obj.length - 1;
          const nested = obj && (typeof obj[0] === 'object' && Array.isArray(obj[0]));
          const lvl = (nested && (typeof obj[lastIdx] === 'object' && Array.isArray(obj[lastIdx]))) ? indLvl+1 : indLvl;
          const lines = obj.map(val => this._dumps(val, indSpace, lvl));
          if (nested) {
            return `[\n${ind}${lines.join(`,\n${ind}`)}\n${indE}]`;
          }
          return `[${lines.join(', ')}]`;
        }
        const lines = Object.keys(obj).map(k => `${ind}"${k}": ${this._dumps(obj[k], indSpace, indLvl+1)}`).join(',\n');
        return `{\n${lines}\n${indE}}`;

      case 'number':
      case 'string':
        return JSON.stringify(obj);

      default:
        return '???';
    }
  }

  /**
    * Add a format validation function
    * @param {string} fmt -format to validate
    * @param {GeneralValidator|UnsignedValidator} fun - function that performs the validation
    * @param {boolean} override - override the format if it exists
    */
  addFormat(fmt: string, fun: GeneralValidator|UnsignedValidator, override?: boolean): void {
    // eslint-disable-next-line no-param-reassign
    override = override || false;

    if (fmt in this.formats && !override) {
      throw new FormatError(`format ${fmt} is already defined, user arg 'override' as true to override format validation`);
    }
    this.validators[fmt] = fun;
  }

  // eslint-disable-next-line class-methods-use-this, no-underscore-dangle
  _convertTypes(schema: SchemaJADN): SchemaJADN {
    const typeKeys = ['name', 'type', 'options', 'description', 'fields'];
    const genFieldKeys = ['id', 'name', 'type', 'options', 'description'];
    const enumFieldKeys = ['id', 'value', 'description'];
    schema = cloneObject(schema) as SchemaJADN; // eslint-disable-line no-param-reassign

    if (!('types' in schema)) {
      throw new SchemaError('Schema types improperly formatted');
    }

    function toSimple(complexSchema: SchemaObjectJADN): SchemaSimpleJADN {
      // Convert Record types to Array
      return {
        meta: complexSchema.meta,
        types: complexSchema.types.map((td: SchemaObjectType|SchemaObjectComplexType) => {
          const simpleDef = [td.name, td.type, td.options.schema(td.type, td.name, false), td.description];
          // Convert fields if exists
          if ('fields' in td) {
            const fields = (td.fields || []).map((field: SchemaObjectGenField|SchemaObjectEnumField) => {
              let opts = {};
              if ('options' in field) {
                opts = {
                  options: field.options.schema(field.type, td.name, true)
                };
              }
              return objectValues({
                ...field,
                ...opts
              });
            }) as (SchemaSimpleGenField|SchemaSimpleEnumField)[];
            return [...simpleDef, fields] as SchemaSimpleComplexType;
          }
          return simpleDef as SchemaSimpleType;
        })
      } as SchemaSimpleJADN;
    }

    function toComplex(simpleSchema: SchemaSimpleJADN): SchemaObjectJADN {
      // Convert Array types to Record
      return {
        meta: simpleSchema.meta,
        types: simpleSchema.types.map((td: SchemaSimpleType|SchemaSimpleComplexType) => {
          const zipType = zip(typeKeys, td);
          const objType: Record<string, any> = {
            name: zipType.name as string,
            type: zipType.type as string,
            options: new Options(zipType.options as Array<string>),
            description: zipType.description as string
          };

          // Convert fields if exists
          if ('fields' in zipType) {
            const fieldKeys = objType.type === 'Enumerated' ? enumFieldKeys : genFieldKeys;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            objType.fields = zipType.fields.map((f: SchemaSimpleEnumField|SchemaSimpleGenField) => {
              const zipField = zip(fieldKeys, f);
              if ('options' in zipField) {
                zipField.options = new Options(zipField.options);
              }
              return zipField as SchemaObjectGenField|SchemaObjectEnumField;
            });
            return objType as SchemaObjectComplexType;
          }
          return objType as SchemaObjectType;
        })
      } as SchemaObjectJADN;
    }

    if (schema.types.every(t => typeof t === 'object' && !Array.isArray(t))) {
      return toSimple(schema as SchemaObjectJADN);
    } else if (schema.types.every(t => typeof t === 'object' && Array.isArray(t))) {
      return toComplex(schema as SchemaSimpleJADN);
    }
    return schema;
  }
}

export default Schema;