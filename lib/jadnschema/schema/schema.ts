// JADN Schema Model
import path from 'path';
import fs from 'fs-extra';
import pluralize from 'pluralize';

import BaseModel, { initModel } from './base';
import { DefinitionBase } from './definitions';
import ValidationFormats from './formats';
import Info from './info';
import Options, { EnumId, PointerId } from './options';
import { SchemaJADN, SchemaSimpleJADN, SchemaObjectJADN } from './interfaces';
import {
  SchemaSimpleType,
  SchemaObjectGenField, SchemaObjectEnumField, SchemaObjectType, SchemaObjectField, SchemaSimpleField
} from './definitions/interfaces';
import { JADNTypes } from './definitions/utils';
import { FormatError, SchemaError, ValidationError } from '../exceptions';
import {
  capitalize, cloneObject, flattenArray, mergeArrayObjects, objectFromTuple, objectValues, prettyObject, safeGet, zip
} from '../utils';

// Format valiator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeneralValidator = (val: any) => Array<Error>;
export type UnsignedValidator = (n: number, val: number|string) => Array<Error>;

class Schema extends BaseModel {
  // Fields Variables
  info: Info;
  types: Record<string, DefinitionBase>;

  // Helper Variables
  slots: Array<string> = ['info', 'types'];
  derived: Record<string, DefinitionBase>;
  protected schemaTypes: Set<string>;
  protected validators: Record<string, GeneralValidator|UnsignedValidator> = ValidationFormats;
  readonly definitionOrder: Array<string> = ['OpenC2-Command', 'OpenC2-Response', 'Action', 'Target', 'Actuator', 'Args', 'Status-Code',
    'Results', 'Artifact', 'Device', 'Domain-Name', 'Email-Addr', 'Features', 'File', 'IDN-Domain-Name', 'IDN-Email-Addr', 'IPv4-Net',
    'IPv4-Connection', 'IPv6-Net', 'IPv6-Connection', 'IRI', 'MAC-Addr', 'Process', 'Properties', 'URI', 'Action-Targets', 'Date-Time',
    'Duration', 'Feature', 'Hashes', 'Hostname', 'IDN-Hostname', 'IPv4-Addr', 'IPv6-Addr', 'L4-Protocol', 'Message-Type', 'Nsid',
    'Payload', 'Port', 'Response-Type', 'Version',
    // Undefined types
    'Command-ID','Versions', 'Namespace', 'Profiles', 'Targets'];

  /**
    * Initialize a Schema object
    * @param {SchemaSimpleJADN|Schema} schema - The JADN schema to utilize
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(schema?: SchemaSimpleJADN|Schema, kwargs?: Record<string, any> ) {
    super({}, kwargs);
    // Fields Variables
    this.info = safeGet(this, 'info', new Info()) as Info;
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
      info: this.info,
      types: this.types
    };
    return `Schema ${prettyObject(value)}`;
  }

  get formats(): Array<string> {
    return Object.keys(this.validators);
  }

  get validationFormats(): Record<string, GeneralValidator|UnsignedValidator> {
    return { ...this.validators } as Record<string, GeneralValidator|UnsignedValidator>;
  }

  /**
    * Analyze the given schema for unreferenced and undefined types
    * @return {Record<string, string|Array<string>>} analysis results
    */
  analyze(): Record<string, string|Array<string>> {
    const typeDeps = this.dependencies();
    const refs = new Set([
      ...objectValues(typeDeps).reduce((acc: Array<string>, val: Set<string>) => [...acc, ...val], []),
      ...this.info.get('exports', []) as Array<string>
    ]);
    const types = new Set([...Object.keys(typeDeps), ...Object.keys(this.derived)]);

    return {
      package: `${this.info.get('package', '') as string}${this.info.get('version', '') as string}`,
      exports: this.info.get('exports', []) as Array<string>,
      unreferenced: [...types].filter(d => !refs.has(d)).filter(d => !Object.keys(this.derived).includes(d)),
      undefined: [...refs].filter(d => !types.has(d))
    };
  }

  /**
    * Determine the dependencies for each type within the schema
    * @return {Record<string, Set<string>>} record of dependencies
    */
  dependencies(): Record<string, Set<string>> {
    const nsids = Object.keys(this.info.get('imports', {}));
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
      return nsids.includes(nsp) ? nsp : name.replace(new RegExp(`^(${EnumId}|${PointerId})`), '');
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
    const schemaTypes: Array<SchemaSimpleType> = [
      ...this.definitionOrder.map(def => {
        return typeKeys.includes(def) ? this.types[def].schema(strip) : [];
      }) as Array<SchemaSimpleType>,
      ...typeKeys.map(def => {
        return this.definitionOrder.includes(def) ? [] : this.types[def].schema(strip);
      }) as Array<SchemaSimpleType>
    ].filter(d => d.length > 1);
    return {
      info: this.info.schema(),
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
    return this.dumps(indent, strip);
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
      const newTypes: Array<SchemaObjectType> = [];
      // eslint-disable-next-line no-param-reassign
      sch.types = sch.types.map(td => {
        const typeDef: SchemaObjectType = { ...td };
        if ('fields' in typeDef) {
          typeDef.fields = (typeDef.fields || []).map((fd: SchemaObjectGenField|SchemaObjectEnumField) => {
            const fieldDef: SchemaObjectGenField|SchemaObjectEnumField = { ...fd };
            if ('options' in fieldDef) {
              const [fieldOpts, typeOpts] = fieldDef.options.split();
              if (Object.keys(typeOpts.object()).length > 0) {
                // console.log(`Anon Type ${fieldDef.name} - ${JSON.stringify(fieldDef.options.object())}`);
                const newName = `${typeDef.name}${this.info.config.Sys}${fieldDef.name}`.replace('_', '-');
                newTypes.push({
                  name: newName,
                  type: fieldDef.type,
                  options: typeOpts,
                  description: fieldDef.description,
                  fields: []
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
      sch.types = sch.types.map(td => {
        const typeDef: SchemaObjectType = { ...td };
        if ('fields' in typeDef) {
          typeDef.fields = (typeDef.fields || []).map((fd: SchemaObjectGenField|SchemaObjectEnumField) => {
            const fieldDef: SchemaObjectGenField|SchemaObjectEnumField = { ...fd };
            if ('options' in fieldDef) {
              const [fieldOpts, typeOpts] = fieldDef.options.split();
              if (fieldOpts.isArray()) {
                typeOpts.vtype = fieldDef.type;
                if (fieldDef.type === 'Enumerated') {
                  typeOpts.vtype = `${PointerId}${typeOpts.enum}`;
                  delete typeOpts.enum;
                }

                const min = fieldOpts.get('minc', 0) as number;
                const max = fieldOpts.get('maxc', 0) as number;
                delete fieldOpts.maxc;
                typeOpts.minv = Math.max(min, 0);
                typeOpts.maxv = max;

                const nameArr = fieldDef.name.split('_');
                const endIdx = nameArr.length - 1;
                nameArr[endIdx] = pluralize.isSingular(nameArr[endIdx]) ? pluralize.plural(nameArr[endIdx]) : nameArr[endIdx];
                let newName = nameArr.map(w => capitalize(w)).join('-');

                if (sch.types.filter(t => t.name === newName).length >= 1) {
                  newName = `${typeDef.name}${this.info.config.Sys}${newName}`.replace('_', '-');
                }
                newTypes.push({
                  name: newName,
                  type: 'ArrayOf',
                  options: typeOpts,
                  description: fieldDef.description,
                  fields: []
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

    const removeDerivedEnum = (sch: SchemaObjectJADN): SchemaObjectJADN => {
      const newTypes: Array<SchemaObjectType> = [];
      const derivable = ['ArrayOf', 'Enumerated', 'MapOf'];
      const optChecks: Record<string, (v: string) => boolean> = {
        enum: () => true,
        ktype: (v: string) => v.startsWith(EnumId),
        vtype: (v: string) => v.startsWith(EnumId)
      };

      // eslint-disable-next-line no-param-reassign
      sch.types = sch.types.map((td: SchemaObjectType) => {
        const typeDef: SchemaObjectType = { ...td };
        if (derivable.includes(typeDef.type)) {
          Object.keys(optChecks).forEach((optName: string) => {
            const optCheck = optChecks[optName];
            let opt = typeDef.options.get(optName, null) as null|string;

            if (opt && optCheck(opt)) {
              opt = opt.startsWith(EnumId) ? opt.substring(1) : opt;
              const origTypes: Array<SchemaObjectType> = sch.types.filter(t => t.name === opt);
              if (origTypes.length !== 1) {
                throw new TypeError(`Type of ${opt} does not exist within the schema`);
              }
              const origType = origTypes[0];
              const newName = `${opt}${this.info.config.Sys}Enum`.replace('_', '-');
              if (sch.types.filter(t => t.name === newName).length === 0 && newTypes.filter(t => t.name === newName).length) {
                newTypes.push({
                  name: newName,
                  type: 'Enumerated',
                  options: new Options(),
                  description: `Derived enumeration of ${opt}`,
                  fields: origType.fields.map(f => {
                    f = f as SchemaObjectGenField;  // eslint-disable-line no-param-reassign
                    return {id: f.id, value: f.name, description: f.description} as SchemaObjectEnumField;
                  })
                });
              }
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      sch.types = sch.types.map(typeDef => {  // eslint-disable-line no-param-reassign
        if (typeDef.type === 'MapOf') {
          const td = {...typeDef, fields: []} as SchemaObjectType;
          const keyType = (sch.types || []).filter(t => t.name === td.options.ktype);
          const valueType = td.options.vtype;
          if (keyType.length !== 1) {
            throw new TypeError(`Type of ${td.options.ktype || 'KTYPE'} does not exist within the schema`);
          }

          if (keyType[0].type === 'Enumerated') {
            td.type = 'Map';
            delete td.options.ktype;
            delete td.options.vtype;
            td.fields = keyType[0].fields.map(f => {
              return {
                id: f.id,
                name: safeGet(f, 'value', 'NAME') as string,
                type: valueType,
                options: new Options(),
                description: f.description
              } as SchemaObjectGenField;
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
    const resolved = path.resolve(fname);
    if (fs.pathExistsSync(resolved)) {
      this._setSchema(fs.readJsonSync(resolved));
    } else {
      throw new SchemaError(`Schema does not exist at ${resolved}`);
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
    fs.outputFileSync(fname, `${this.dumps(indent, strip)}\n`);
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
    return `${this._dumps(this._orderDefs(this.schema(strip)), indent)}\n`;
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

    if (Object.keys(this.info).length < 2 || Object.keys(this.types).length === 0) {
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
    return undefined;
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

    const exports: Array<string> = this.info.exports || [];
    // eslint-disable-next-line guard-for-in, no-restricted-syntax, @typescript-eslint/no-for-in-array
    for (const exp of exports) {
      const rtn = this.validateAs(inst, exp);
      if (rtn.length === 0) {
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
  validateAs(inst: Record<string, any>, type: string, silent? : boolean): Array<Error> {  // eslint-disable-line @typescript-eslint/no-explicit-any
    silent = silent || true; // eslint-disable-line no-param-reassign
    const exports: Array<string> = this.info.exports || [];
    const errors: Array<Error> = [];

    if (exports.includes(type)) {
      const rtn = this.types[type].validate(inst);
      if (rtn && rtn.length !== 0) {
        errors.push(...rtn);
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
    * Reorder schema definitions to predefined order
    * @param {SchemaSimpleJADN} schema - Schema to reorganize the types
    * @returns {SchemaSimpleJADN} Schema with reorganized types
    */
  _orderDefs(schema: SchemaSimpleJADN): SchemaSimpleJADN {;
    const defs: Record<string, SchemaSimpleType> = objectFromTuple(
      ...schema.types.map<[string, SchemaSimpleType]>(def => [def[0], def])
    );
    const defNames = Object.keys(defs);

    schema.types = [
      ...this.definitionOrder.filter(n => defNames.includes(n)).map<SchemaSimpleType>(n => defs[n] ),
      ...defNames.filter(n => !this.definitionOrder.includes(n)).map<SchemaSimpleType>(n => defs[n] )
    ];
    return schema;
  }

  /**
    * Set the Schema object with the given data
    * @param {SchemaSimpleJADN|Schema} data - data to set schema object
    */
  // eslint-disable-next-line no-underscore-dangle
  _setSchema(data: SchemaSimpleJADN|Schema): void {
    if ( typeof data !== 'object') {
      throw new SchemaError('Cannot load schema, incorrect type');
    }
    const schema: SchemaSimpleJADN = data instanceof Schema ? data.schema() : data;
    this.info = new Info(safeGet(schema, 'info', {}));

    // eslint-disable-next-line no-param-reassign
    const simpleSchema = this.simplify(true, schema, true, true, false, false);

    const [values, errs] = initModel(this, simpleSchema, {_config: this._getConfig.bind(this)});
    if (errs.length > 0) {
      throw errs[0];
    }

    // update class vars
    this.setProperties(values);

    // update Schema Types
    this.schemaTypes = new Set(flattenArray(objectValues(JADNTypes)));

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

        // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
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
        info: complexSchema.info,
        types: complexSchema.types.map(td => {
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
            }) as Array<SchemaSimpleField>;
            return [...simpleDef, fields] as SchemaSimpleType;
          }
          return simpleDef as SchemaSimpleType;
        })
      } as SchemaSimpleJADN;
    }

    function toComplex(simpleSchema: SchemaSimpleJADN): SchemaObjectJADN {
      // Convert Array types to Record
      return {
        info: simpleSchema.info,
        types: simpleSchema.types.map(td => {
          const zipType = zip(typeKeys, td);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const objType: Record<string, any> = {
            name: zipType.name as string,
            type: zipType.type as string,
            options: new Options(zipType.options as Array<string>),
            description: zipType.description as string
          };

          // Convert fields if exists
          if ('fields' in zipType) {
            const fieldKeys = objType.type === 'Enumerated' ? enumFieldKeys : genFieldKeys;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            objType.fields = zipType.fields.map((f: SchemaSimpleField) => {
              const zipField = zip(fieldKeys, f);
              if ('options' in zipField) {
                zipField.options = new Options(zipField.options);
              }
              return zipField as SchemaObjectField;
            });
            return objType as SchemaObjectType;
          }
          return objType as SchemaObjectType;
        })
      } as SchemaObjectJADN;
    }

    if (schema.types.every(t => typeof t === 'object' && !Array.isArray(t))) {
      return toSimple(schema as SchemaObjectJADN);
    }
    if (schema.types.every(t => typeof t === 'object' && Array.isArray(t))) {
      return toComplex(schema as SchemaSimpleJADN);
    }
    return schema;
  }
}

export default Schema;