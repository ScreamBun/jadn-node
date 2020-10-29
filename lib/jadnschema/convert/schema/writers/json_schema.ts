/* eslint lines-between-class-members: 0, @typescript-eslint/lines-between-class-members: 0 */
// JADN to JADN
import fs from 'fs-extra';

import WriterBase from './base';
import * as InterfaceJSON from './json_interface';
import { CommentLevels } from '../enums';
import { FormatError } from '../../../exceptions';
import {
  DefinitionBase, ArrayDef, ArrayOfDef, ChoiceDef, EnumeratedDef, MapDef, MapOfDef, RecordDef
} from '../../../schema/definitions';
import Options, { EnumId, PointerId } from '../../../schema/options';
import { Field, EnumeratedField } from '../../../schema/fields';
import {
  hasProperty, mergeArrayObjects, objectFromTuple, objectValues, safeGet
} from '../../../utils';

interface Args {
  indent?: number;
  oneOf: boolean;
}

const defaultArgs: Args = {
  oneOf: true
}

const DecOct = '25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9]'; // 0-255
const HexOct = '0-9A-Fa-f'; // 00-FF or 00-ff


class JADNtoJSON extends WriterBase {
  format = 'json';

  // Helper Variables
  private fieldMap: Record<string, string> = {
    Binary: 'string',
    Boolean: 'bool',
    Integer: 'integer',
    Number: 'number',
    Null: 'null',
    String: 'string'
  };
  private ignoreOpts: Array<string> = ['id', 'ktype', 'vtype'];
  private jadnFmt: Record<string, Record<string, number|string>> = {
    eui: {pattern: `^([${HexOct}]{2}[:-]){5}[${HexOct}]{2}(([:-][${HexOct}]){2})?$`},
    'ipv4-addr': {pattern: `^((${DecOct})\\.){3}(${DecOct})$`},
    'ipv4-net': {pattern: `^((${DecOct})\\.){3}(${DecOct})(\\/(3[0-2]|[0-2]?[0-9]))?$`},
    'ipv6-addr': {pattern: `^(([${HexOct}]{1,4}:){7,7}[${HexOct}]{1,4}|([${HexOct}]{1,4}:){1,7}:|([${HexOct}]{1,4}:){1,6}:[${HexOct}]{1,4}|([${HexOct}]{1,4}:){1,5}(:[${HexOct}]{1,4}){1,2}|([${HexOct}]{1,4}:){1,4}(:[${HexOct}]{1,4}){1,3}|([${HexOct}]{1,4}:){1,3}(:[${HexOct}]{1,4}){1,4}|([${HexOct}]{1,4}:){1,2}(:[${HexOct}]{1,4}){1,5}|[${HexOct}]{1,4}:((:[${HexOct}]{1,4}){1,6})|:((:[${HexOct}]{1,4}){1,7}|:)|fe80:(:[${HexOct}]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([${HexOct}]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(%.+)$`},
    'ipv6-net': {pattern: `^(([${HexOct}]{1,4}:){7,7}[${HexOct}]{1,4}|([${HexOct}]{1,4}:){1,7}:|([${HexOct}]{1,4}:){1,6}:[${HexOct}]{1,4}|([${HexOct}]{1,4}:){1,5}(:[${HexOct}]{1,4}){1,2}|([${HexOct}]{1,4}:){1,4}(:[${HexOct}]{1,4}){1,3}|([${HexOct}]{1,4}:){1,3}(:[${HexOct}]{1,4}){1,4}|([${HexOct}]{1,4}:){1,2}(:[${HexOct}]{1,4}){1,5}|[${HexOct}]{1,4}:((:[${HexOct}]{1,4}){1,6})|:((:[${HexOct}]{1,4}){1,7}|:)|fe80:(:[${HexOct}]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([${HexOct}]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(%.+)?s*(\\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$`},
    i8: {minimum: -128, maximum: 127},
    i16: {minimum: -32768, maximum: 32767},
    i32: {minimum: -2147483648, maximum: 2147483647},
    x: {contentEncoding: 'base16'}
  };
  private optKeys: Record<string, Record<string, string>> = {
    'array': {
      minv: 'minItems',
      maxv: 'maxItems',
      unique: 'uniqueItems'
    },
    'integer|number': {
      minc: 'minimum',
      maxc: 'maximum',
      minf: 'minimum',
      maxf: 'maximum',
      minv: 'minimum',
      maxv: 'maximum',
      format: 'format'
    },
    'choice|map|object': {
      minv: 'minProperties',
      maxv: 'maxProperties'
    },
    'binary|enumerated|string': {
      format: 'format',
      minc: 'minLength',
      maxc: 'maxLength',
      minv: 'minLength',
      maxv: 'maxLength',
      pattern: 'pattern'
    }
  };
  private schemaOrder: Array<string> = ['$schema', '$id', 'title', 'type', '$ref', 'const', 'description',
    'additionalProperties', 'minProperties', 'maxProperties', 'minItems', 'maxItems', 'oneOf', 'required', 'uniqueItems',
    'items', 'format', 'contentEncoding', 'properties', 'definitions'
  ];
  // JADN: JSON
  private validationMap: Record<string, string|null> = {
    // JADN
    b: 'binary',
    eui: null,
    i8: null,
    i16: null,
    i32: null,
    'ipv4-addr': 'ipv4',  // ipv4
    'ipv6-addr': 'ipv6',  // ipv6
    'ipv4-net': null,
    'ipv6-net': null,
    x: null,
    // JSON
    'date-time': 'date-time',
    date: 'date',
    email: 'email',
    hostname: 'hostname',
    'idn-email': 'idn-email',
    'idn-hostname': 'idn-hostname',
    ipv4: 'ipv4',
    ipv6: 'ipv6',
    iri: 'iri',
    'iri-reference': 'iri-reference',
    'json-pointer': 'json-pointer',  // Draft 6
    'relative-json-pointer': 'relative-json-pointer',
    regex: 'regex',
    time: 'time',
    uri: 'uri',
    'uri-reference': 'uri-reference',  // Draft 6
    'uri-template': 'uri-template'  // Draft 6
  };

  /**
    * Produce JADN schema from JADN schema and write to file provided
    * @param {string} fname - Name of file to write
    * @param {string} source - Name of the original schema file
    * @param {Args} kwargs - extra field values for the function
    */
  dump(fname: string, source?: string, kwargs: Args = defaultArgs): void {
    let contents = this.dumps(kwargs);

    if (source !== null && source !== undefined) {
      const now = new Date();
      contents = `<!-- Generated from ${source}, ${now.toLocaleString()} -->\n${contents}`;
    }
    fs.outputFileSync(fname, contents);
   }

   /**
    * Converts the JADN schema to JADN
    * @param {Args} kwargs - extra field values for the function
    * @return {string} - JADN schema
    */
  dumps(kwargs: Args = defaultArgs): string {
    const args = kwargs || {}; // eslint-disable-lne no-param-reassign
    const indent = safeGet(args, 'indent', 2) as number;
    
    const root: Record<string, any> = {};
    if (args.oneOf) {
      root.oneOf = (this.info.exports || []).map((exp: string) => {
        const expDefs = this.types.filter((t: DefinitionBase) => t.name === exp);
        if (expDefs.length === 1) {
          return {
            '$ref': this.formatString(`#/definitions/${exp}`),
            'description': this._cleanComment(expDefs[0].description || '')
          };
        }
        return {};
      }).filter(o => Object.keys(o).length > 0) as Array<InterfaceJSON.Export>;
    } else {
      root.additionalProperties = false;
      root.properties = {};
      (this.info.exports || []).forEach((exp: string) => {
        const expDefs = this.types.filter((t: DefinitionBase) => t.name === exp);
        if (expDefs.length === 1) {
          root.properties[exp.toLowerCase()] = {
            '$ref': this.formatString(`#/definitions/${exp}`),
            'description': this._cleanComment(expDefs[0].description || '')
          };
        }
      });
    }

     const jsonSchema: InterfaceJSON.Schema = {
       ...this.makeHeader(),
       type: 'object',
       ...root,
       definitions: {}
    };

    const defs = mergeArrayObjects(...objectValues(this._makeStructures({})));

    jsonSchema.definitions = objectFromTuple(
      ...this.definitionOrder.filter(d => hasProperty(defs, d)).map<[string, any]>(f => [f, defs[f] ] ),
      ...Object.keys(defs).filter(d => !this.definitionOrder.includes(d)).map<[string, any]>(f =>  [f, defs[f] ] )
    );

    return JSON.stringify(this._cleanEmpty(jsonSchema), null, indent);
  }

  /**
    * Create the headers for the schema
    * @returns {InterfaceJSON.Meta} - header for schema
   */
  makeHeader(): InterfaceJSON.Meta {
    const pkg = this.info.get('package', '') as string;
    const schemaID = `${pkg.startsWith('http') ? '' : 'http://'}${pkg}`;
    return this._cleanEmpty({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: schemaID,  // .endsWith('.json') ? schemaID : `${schemaID}.json`,
      title: this.info.title ? this.info.title : (module + (this.info.version ? ` v.${this.info.version}` : '')),
      description: this._cleanComment(this.info.get('description', ''))
    }) as InterfaceJSON.Meta;
  }

  // Structure Formats
  // eslint-disable-next-line spaced-comment
  /**
    * Formats array for the given schema type
    * @param {ArrarDef} itm - array to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted array
   `*/
  _formatArray(itm: ArrayDef): Record<string, InterfaceJSON.TypeDefinition> {
    const opts = this._optReformat('array', itm.options, false);
    let arrayJSON: InterfaceJSON.TypeDefinition;

    if (hasProperty(opts, 'pattern')) {
      arrayJSON = {
        title: this.formatTitle(itm.name),
        type: 'string',
        description: this._cleanComment(itm.description),
        ...opts
      };
    } else {
      arrayJSON = {
        title: this.formatTitle(itm.name),
        type: 'array',
        description: this._cleanComment(itm.description),
        items: [
          'TODO: make items'
        ]
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { [this.formatString(itm.name)]: this._cleanEmpty(arrayJSON) };
  }

  /**
    * Formats arrayOf for the given schema type
    * @param {ArrayOfDef|Field} itm - arrayOf to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted arrayOf
    */
  _formatArrayOf(itm: ArrayOfDef|Field): Record<string, InterfaceJSON.TypeDefinition> {
    const vtype = itm.options.get('vtype', 'String') as string;
    const maxv = safeGet(itm.options, 'maxv', 0) as number;
    // eslint-disable-next-line no-param-reassign
    itm.options.maxv = maxv === 0 ? this.schema.info.config.MaxElements : maxv;

    const arrayOfJSON: InterfaceJSON.TypeDefinition = {
      title: this.formatTitle(itm.name),
      type: 'array',
      description: this._cleanComment(itm.description),
      ...this._optReformat('array', itm.options, false),
      items: {}
    };

    if (vtype.startsWith('$')) {
      const valDefs = this.types.filter(d => d.name === vtype.substring(1));
      if (valDefs.length !== 1) {
        throw new FormatError(`${itm.name} has multiple matches for its vtype value, [${valDefs.map(d => d.name).join(', ')}]`);
      }
      const valDef = valDefs[0];
      const idVal = safeGet(valDef.options, 'id', false) as boolean;
      // eslint-disable-next-line no-nested-ternary
      const enumVal = idVal ? 'id' : (valDef.type === 'Enumerated' ? 'value' : 'name');
      arrayOfJSON.items = {
        type: idVal ? 'integer' : 'string',
        enum: (valDef.fields || []).map<string>(f => safeGet(f, enumVal) as string)
      };
    } else {
      arrayOfJSON.items = this._getFieldType(vtype);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { [this.formatString(itm.name)]: this._cleanEmpty(arrayOfJSON) };
  }

  /**
    * Formats choice for the given schema type
    * @param {ChoiceDef} itm - choice to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted choice
    */
  _formatChoice(itm: ChoiceDef): Record<string, InterfaceJSON.TypeDefinition> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [this.formatString(itm.name)]: this._cleanEmpty({
          title: this.formatTitle(itm.name),
          type: 'object',
          description: this._cleanComment(itm.description),
          additionalProperties: false,
          minProperties: 1,
          maxProperties: 1,
          ...this._optReformat('object', itm.options, false),
          properties: objectFromTuple( ...itm.fields.map<[string, any]>(f => [f.name, this._makeField(f) ]))
      })
    };
  }

  /**
    * Formats enum for the given schema type
    * @param {EnumeratedDef} itm - enum to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted enum
    */
  _formatEnumerated(itm: EnumeratedDef): Record<string, InterfaceJSON.TypeDefinition> {
    const useID = safeGet(itm.options, 'id', false) as boolean;

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: useID ? 'integer' : 'string',
        description: this._cleanComment(itm.description),
        ...this._optReformat('object', itm.options, false),
        oneOf: itm.fields.map(f => ({
          const: useID ? f.id : f.value,
          description: this._cleanComment(`${useID ? `${f.value} - ` : ''}${f.description}`)
        }))
      })
    };
  }

  /**
    * Formats map for the given schema type
    * @param {MapDef} itm - map to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted map
    */
  _formatMap(itm: MapDef): Record<string, InterfaceJSON.TypeDefinition> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: 'object',
        description: this._cleanComment(itm.description),
        additionalProperties: false,
        ...this._optReformat('object', itm.options, false),
        required: itm.fields.filter(f => !f.options.isOptional()).map(f => f.name),
        properties: objectFromTuple( ...itm.fields.map<[string, any]>(f => [f.name, this._makeField(f) ]))
      })
    };
  }

  /**
    * Formats mapOf for the given schema type
    * @param {MapDef} itm - mapOf to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted mapOf
    */
  _formatMapOf(itm: MapOfDef|Field): Record<string, InterfaceJSON.TypeDefinition> {
    const keyType = safeGet(this.schema.types, itm.options.get('ktype')) as DefinitionBase;
    let keys: Array<number|string> = [];

    if (['Choice', 'Enumerated', 'Map', 'Record'].includes(keyType.type)) {
      const attr = keyType.type === 'Enumerated' ? 'value' : 'name';
      keys = (keyType.fields || []).map<number|string>((f: EnumeratedField|Field) => safeGet(f, attr) as number|string );
    } else {
      console.warn(`Invalid MapOf definition for ${itm.name}`);
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: 'object',
        description: this._cleanComment(itm.description),
        additionalProperties: false,
        minProperties: 1,
        properties: objectFromTuple(
          ...keys.map<[number|string, any]>(k => [k, this._getFieldType(itm.options.get('vtype', 'String')) ])
        )
      })
    };
  }

  /**
    * Formats record for the given schema type
    * @param {RecordDef} itm - record to format
    * @returns {Record<string, InterfaceJSON.TypeDefinition>} - formatted record
    */
  _formatRecord(itm: RecordDef): Record<string, InterfaceJSON.TypeDefinition> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: 'object',
        description: this._cleanComment(itm.description),
        additionalProperties: false,
        ...this._optReformat('object', itm.options, false),
        required: itm.fields.filter(f => !this._isOptional(f.options)).map(f => f.name),
        properties: objectFromTuple(
          ...itm.fields.map<[string, any]>(f => [f.name, this._makeField(f) ])
        )
      })
    };
  }

  /**
    * Formats custom type for the given schema type
    * @param {DefinitionBase} itm - custom type to format
    * @returns {Record<string, InterfaceJSON.PrimitiveDefinition>} - formatted custom type
   */
  _formatCustom(itm: DefinitionBase): Record<string, InterfaceJSON.PrimitiveDefinition> {
    const customJSON: InterfaceJSON.PrimitiveDefinition = {
      title: this.formatTitle(itm.name),
      ...this._getFieldType(itm.type),
      description: this._cleanComment(itm.description)
    };

    const opts = this._optReformat(itm.type, itm.options, true);
    const optKeys = Object.keys(opts);
    const keys = Object.keys(customJSON).filter(k => optKeys.includes(k));

    if (keys.length > 0) {
      console.warn(`${itm.name} has duplicate keys: [${keys.join(', ')}]`);
    }

    if (['format', 'pattern'].some(k => hasProperty(opts, k))) {
      delete customJSON.$ref;
      delete customJSON.format;
      customJSON.type = 'string';
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [this.formatString(itm.name)]: this._cleanEmpty({
        ...customJSON,
        ...opts
      })
    };
  }

  // Helper Functions
  /**
    * Get the JSON type of the field based of the type defined in JADN
    * @param {string} name - type of field as defined in JADN
    * @returns {string} - type of the field as defined in JSON
   */
  _getType(name?: string): string {
    const typeDef = this.types.filter(t => t.name === name);
    return safeGet(typeDef.length === 1 ? typeDef[0] : {}, 'type', 'String') as string;
  }

  /**
    * Reformat options for the given schema
    * @param {string} optType: type to reformat the options for
    * @param {Options} opts: original options to reformat
    * @returns {Record<string, number|string>} - reformatted options
    */
  _optReformat(optType: string, opts: Options, baseRef?: boolean): Record<string, number|string> {
    optType = optType.toLowerCase(); // eslint-disable-line no-param-reassign
    const optKeys = this._getOptKeys(optType);
    let formattedOpts: Record<string, number|string> = {};

    const ignore = (key: string, val: number|string): boolean => {
      if (['array', 'object'].includes(key)) {
        return false;
      }
      if (baseRef) {
        return false;
      }
      if (['minc', 'maxc', 'minv', 'maxv'].includes(key)) {
        return val === 0;
      }
      return false;
    };

    const optObj = opts.object() as Record<string, number|string>;
    Object.keys(optObj).forEach(key => {
      const val = optObj[key];
      if (ignore(key, val) || this.ignoreOpts.includes(key)) {
        return;
      }

      if (key === 'format') {
        const fmt = safeGet(this.jadnFmt, val as string, null) as null|Record<string, number|string>;
        if (fmt !== null) {
          formattedOpts = {
            ...formattedOpts,
            ...fmt
          };
        } else {
          if (val in this.validationMap && this.validationMap[val]) {
            formattedOpts.format = this.validationMap[val] as string;
          }
        }
      } else if (hasProperty(optKeys, key)) {
        formattedOpts[optKeys[key]] = key === 'format' ? safeGet(this.validationMap, val as string, val) as string : val;
      } else {
        console.warn(`unknown option for type of ${optType}: ${key} - ${val}`);
      }
    });

    const fmt = safeGet(formattedOpts, 'format', '') as string;
    if (/^u\d+$/.exec(fmt)) {
      delete formattedOpts.format;
      formattedOpts = {
        ...formattedOpts,
        [['Binary', 'String'].includes(optType) ? 'minLength' : 'minimum']: 0,
        [['Binary', 'String'].includes(optType) ? 'maxLength' : 'maximum']: (parseInt(fmt.substring(1), 10) ** 2) - 1
      };
    }
    return formattedOpts;
  }

  /**
    * Determines the field type for the schema
    * @param {string|Field} field - current type
    * @returns {Record<string, string|number|Array<string|Record<string, number|string>>>} - type mapped to the schema
   */
  _getFieldType(field: string|Field): Record<string, string|number|Array<string|Record<string, number|string>>> {
    let fieldType = field instanceof Field ? safeGet(field, 'type', field) as string : field;
    fieldType = typeof fieldType === 'string' ? fieldType : 'String';

    if (typeof field === 'object' && field instanceof Field) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rtn: Record<string, any>;
      switch (field.type) {
        case 'ArrayOf':
          rtn = this._formatArrayOf(field);
          break;
        case 'MapOf':
          rtn = this._formatMapOf(field);
          break;
        case 'Binary':
          rtn = {
            type: 'string',
            contentEncoding: 'base64url'
          };
          break;
        default:
          rtn = {};
          break;
      }

      if (Object.keys(rtn).length > 0) {
        delete rtn.title;
        return rtn;
      }

      if (hasProperty(this.fieldMap, field.type)) {
        return {
          type: this.formatString(safeGet(this.fieldMap, field.type, field.type))
        };
      }
    }

    if (hasProperty(this.customFields, fieldType)) {
      return {
        '$ref': `#/definitions/${this.formatString(fieldType)}`
      };
    }

    if (hasProperty(this.fieldMap, fieldType)) {
      return {
        type: this.formatString(safeGet(this.fieldMap, fieldType, fieldType))
      };
    }

    if (fieldType.includes(':')) {
      const [src, attr] = fieldType.split(':', 2);
      if (hasProperty(this.imports, src)) {
        const fmt = this.imports[src].endsWith('.json') ? '' : '.json';
        return {
          '$ref': `${this.imports[src]}${fmt}#/definitions/${attr}`
        };
      }
    }

    const enumRegEx = new RegExp(`^${EnumId}`);
    if (enumRegEx.exec(fieldType)) {
      // TODO: Verify this is proper
      const fType = safeGet(this.schema.types, fieldType.substring(1)) as DefinitionBase;
      if (['Array', 'Choice', 'Map', 'Record'].includes(fType.type)) {
        return {
          type: safeGet(fType.options, 'id', false) ? 'number' : 'string',
          description: this._cleanComment(`Derived enumeration from ${fType.name}`),
          oneOf: (fType.fields || []).map(f => ({
            const: safeGet(f, 'name', '') as string,
            description: this._cleanComment(safeGet(f, 'description', '') as string)
          }))
        };
      }
      throw new FormatError(`Invalid derived enumeration - ${fType.name} should be a Array, Choice, Map or Record type`);
    }

    const pointerRegEx = new RegExp(`^${PointerId}`);
    if (pointerRegEx.exec(fieldType)) {
      const fType = safeGet(this.schema.types, fieldType.substring(1)) as DefinitionBase;
      if (['Array', 'Choice', 'Map', 'Record'].includes(fType.type)) {
        return {
          type: safeGet(fType.options, 'id', false) ? 'number' : 'string',
          description: this._cleanComment(`Derived enumeration from ${fType.name}`),
          oneOf: (fType.fields || []).map(f => ({
            const: safeGet(f, 'name', '') as string,
            description: this._cleanComment(safeGet(f, 'description', '') as string)
          }))
        };
      }
      throw new FormatError(`Invalid pointer - ${fType.name} should be a Array, Choice, Map or Record type`);
    }

    if (/^MapOf\(.*?\)$/.exec(fieldType)) {
      console.warn(`Derived MapOf - ${fieldType}`);
    }

    console.warn(`unknown type: ${fieldType}`);
    return { type: 'string' };
  }

  /**
   * Format a Field as a JSON field
   * @param {Field} field - Field object to format
   * @returns {Record<string, string|number|Array<string>>} - formatted JSON field
   */
  // eslint-disable-next-line class-methods-use-this
  _makeField(field: Field): Record<string, string|number|Array<string>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fieldDef: Record<string, any> = this._getFieldType(field);
    if (this._isArray(field.options)) {
      fieldDef = {
        type: 'array',
        items: fieldDef
      };
    } else if (Object.keys(fieldDef).length === 1 && hasProperty(fieldDef, field.name)) {
      fieldDef = safeGet(fieldDef, field.name, {}) as Record<string, any>;
    }

    const ref = hasProperty(fieldDef, '$ref') && ['Integer', 'Number'].includes(field.type);
    let fieldType = safeGet(fieldDef, 'type', '') as string;
    fieldType = fieldType === '' ? safeGet(fieldDef, '$ref', '') as string : fieldType;
    fieldType = fieldType.startsWith('#') ? this._getType(fieldType.split('/').pop()) : fieldType;
    const fieldOpts = this._optReformat(fieldType, field.options, ref);

    if (safeGet(fieldDef, 'type', '') === 'array' &&  hasProperty(fieldOpts, 'minItems')) {
      fieldOpts.minItems = 1;
    }

    fieldDef = {
      ...fieldDef,
      description: this._cleanComment(field.description),
      ...fieldOpts
    };

    delete fieldDef.title;
    if (safeGet(fieldDef, 'type', '') !== 'string') {
      delete fieldDef.format;
    }

    return fieldDef;
  }

  /**
    * Format a comment for the given schema
    * @param {string} msg - comment text
    * @param {Record<string, number|string>} kwargs - key/value comments
    * @returns {string} - formatted comment
    */
  _cleanComment(msg: string, kwargs?: Record<string, number|string>): string {
    if (this.comments === CommentLevels.NONE) {
      return '';
    }
    let comment = ['', ' ', null, undefined].includes(msg) ? '' : msg;
    comment += kwargs === undefined ? '' : Object.keys(kwargs).map(key => ` #${key}:${JSON.stringify(kwargs[key])}`).join('');
    return comment;
  }

  /**
    * Get the option keys for conversion
    * @param {string} type - the type to get the keys of
    * @returns {Record<string, string>} - option keys for translation
   */
  _getOptKeys(type: string): Record<string, string> {
    const opts = Object.keys(this.optKeys).map(key => key.split('|').includes(type) ? this.optKeys[key] : {} ).filter(o => Object.keys(o).length > 0);
    return opts.length === 1 ? opts[0] : {};
  }

  /**
   * Clean and reorder a given value
   * @param {any} itm - item to clean and reorder
   * @returns {any} - cleaned and reoreded item
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _cleanEmpty(itm: any): any {
    switch (true) {
      case (itm instanceof Array):
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (itm as Array<any>).map(idx => this._cleanEmpty(idx));

        case (itm instanceof Object):
          const tmp = objectFromTuple(
            ...Object.keys(itm).map<[string, any]|[]>(key => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              const val = itm[key];
              if (['', ' ', null, undefined].includes(val) && ['boolean', 'number'].includes(typeof val)) {
                return [];
              }
              if ((typeof val === 'string' || (typeof val === 'object' && Array.isArray(val))) && val.length === 0) {
                return [];
              }
              return [key, this._cleanEmpty(val) ];
            })
          );
          return objectFromTuple(
            ...this.schemaOrder.map<[string, any]|[]>(f => hasProperty(tmp, f) ? [f, tmp[f] ] : [] ),
            ...Object.keys(tmp).map<[string, any]|[]>(f => this.schemaOrder.includes(f) ? [] : [f, tmp[f] ] )
          );

      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return itm;
    }
  }
}

export default JADNtoJSON;