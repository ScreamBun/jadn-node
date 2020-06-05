/* eslint @typescript-eslint/camelcase: 0, lines-between-class-members: 0 */
// JADN to JADN
import fs from 'fs-extra';

import WriterBase from './base';
import { CommentLevels } from '../enums';
import { FormatError } from '../../../exceptions';
import {
  hasProperty,
  mergeArrayObjects,
  objectValues,
  safeGet
} from '../../../utils';
import {
  // EnumeratedField,
  Field, EnumeratedField
} from '../../../schema/fields';
import Options from '../../../schema/options';
import {
  DefinitionBase,
  ArrayDef,
  ArrayOfDef,
  ChoiceDef,
  EnumeratedDef,
  MapDef,
  MapOfDef,
  RecordDef
} from '../../../schema/definitions';

type Args = {
  indent?: number;
}


class JADNtoJSON extends WriterBase {
  format = 'json';

  // Helper Variables
  private hasBinary = false;
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
    eui: {pattern: '^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}(([:-][0-9a-fA-F]){2})?$'},
    'ipv4-net': {pattern: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])(\\/(3[0-2]|[0-2]?[0-9]))?$'},
    'ipv6-net': {pattern: '^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(%.+)?s*(\\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$'},
    i8: {minimum: -128, maximum: 127},
    i16: {minimum: -32768, maximum: 32767},
    i32: {minimum: -2147483648, maximum: 2147483647}
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
    x: 'binary',
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
  dump(fname: string, source?: string, kwargs?: Args): void {
    const args = kwargs || {}; // eslint-disable-lne no-param-reassign
    const now = new Date();
    const indent = safeGet(args, 'indent', 2);
    let contents = JSON.stringify(this.dumps(), null, indent);

    if (source !== null && source !== undefined) {
      contents = `<!-- Generated from ${source}, ${now.toLocaleString()} -->\n${contents}`;
    }
    fs.outputFileSync(fname, contents);
   }

   /**
    * Converts the JADN schema to JADN
    * @return {string} - JADN schema
    */
   dumps(): Record<string, any> {
    const exports = this.types.map((typeName: DefinitionBase) => {
      if ((this.meta.exports || []).includes(typeName.name)) {
        return {
          '$ref': this.formatString(`#/definitions/${typeName.name}`),
          'description': this._cleanComment(typeName.description || '<Fill Me In>')
        };
      }
      return {};
    }).filter(o => Object.keys(o).length > 0);

     const jsonSchema = {
       ...this.makeHeader(),
       type: 'object',
       oneOf: exports,
       definitions: {}
    };

    const defs = mergeArrayObjects(...objectValues(this._makeStructures({})));

    if (this.hasBinary) {
      defs.Binary = {
        title: 'Binary',
        type: 'string',
        contentEncoding: 'base64'
      };
    }

    jsonSchema.definitions = {
      ...mergeArrayObjects(
        ...this.definitionOrder.map(f => hasProperty(defs, f) ? { [f]: defs[f]} : {} )
      ),
      ...mergeArrayObjects(
        ...Object.keys(defs).map(f => this.definitionOrder.includes(f) ? {} : { [f]: defs[f]} )
      )
    };

    return this._cleanEmpty(jsonSchema);
  }

  /**
    * Create the headers for the schema
    * @returns {Record<string, any>} - header for schema
   */
  makeHeader(): Record<string, any> {
    const module = this.meta.get('module', '');
    const schemaID = `${module.startsWith('http') ? '' : 'http://'}${module}`;
    return this._cleanEmpty({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: schemaID.endsWith('.json') ? schemaID : `${schemaID}.json`,
      title: hasProperty(this.meta, 'title') ? this.meta.title : (module + (hasProperty(this.meta, 'patch') ? ` v.${this.meta.patch}` : '')),
      description: this._cleanComment(this.meta.get('description', ''))
    });
  }

  // Structure Formats
  /**
    * Formats array for the given schema type
    * @param {ArrarDef} itm - array to format
    * @returns {string} - formatted array
   `*/
  _formatArray(itm: ArrayDef): Record<string, any> {
    const opts = this._optReformat('array', itm.options, false);
    let arrayJSON: Record<string, any>;

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

    return {
      [this.formatString(itm.name)]: this._cleanEmpty(arrayJSON)
    };
  }

  /**
    * Formats arrayOf for the given schema type
    * @param {ArrayOfDef|Field} itm - arrayOf to format
    * @returns {string} - formatted arrayOf
    */
  _formatArrayOf(itm: ArrayOfDef|Field): Record<string, any> {
    const vtype = itm.options.get('vtype', 'String');
    const arrayOfJSON = {
      title: this.formatTitle(itm.name),
      type: 'array',
      description: this._cleanComment(itm.description),
      ...this._optReformat('array', itm.options, false),
      items: {}
    };

    if (vtype.startsWith('$')) {
      const valDefs = this.types.filter(d => d.name === vtype.substring(1));
      if (valDefs.length !== 1) {
        throw new FormatError(`${itm.name} has multiple matches for its vtype value, ${valDefs.map(d => d.name)}`);
      }
      const valDef = valDefs[0];
      const idVal = safeGet(valDef.options, 'id', false);
      // eslint-disable-next-line no-nested-ternary
      const enumVal = idVal ? 'id' : (valDef.type === 'Enumerated' ? 'value' : 'name');
      arrayOfJSON.items = {
        type: idVal ? 'integer' : 'string',
        enum: (valDef.fields || []).map(f => safeGet(f, enumVal))
      };
    } else {
      arrayOfJSON.items = this._getFieldType(vtype);
    }

    return {
      [this.formatString(itm.name)]: this._cleanEmpty(arrayOfJSON)
    };
  }

  /**
    * Formats choice for the given schema type
    * @param {ChoiceDef} itm - choice to format
    * @returns {string} - formatted choice
    */
  _formatChoice(itm: ChoiceDef): Record<string, any> {
    return {
      [this.formatString(itm.name)]: this._cleanEmpty({
          title: this.formatTitle(itm.name),
          type: 'object',
          description: this._cleanComment(itm.description),
          additionalProperties: false,
          minProperties: 1,
          maxProperties: 1,
          ...this._optReformat('object', itm.options, false),
          properties: mergeArrayObjects( ...itm.fields.map(f => ({ [f.name]: this._makeField(f) })) )
      })
    };
  }

  /**
    * Formats enum for the given schema type
    * @param {EnumeratedDef} itm - enum to format
    * @returns {string} - formatted enum
    */
  _formatEnumerated(itm: EnumeratedDef): Record<string, any> {
    const useID = safeGet(itm.options, 'id', false);

    return {
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: useID ? 'integer' : 'string',
        description: this._cleanComment(itm.description),
        ...this._optReformat('object', itm.options, false),
        oneOf: itm.fields.map(f => ({
          const: useID ? f.id : f.value,
          description: this._cleanComment(`${useID ? `${f.value} ` : ''}${f.description}`)
        }))
      })
    };
  }

  /**
    * Formats map for the given schema type
    * @param {MapDef} itm - map to format
    * @returns {string} - formatted map
    */
  _formatMap(itm: MapDef): Record<string, any> {
    return {
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: 'object',
        description: this._cleanComment(itm.description),
        additionalProperties: false,
        ...this._optReformat('object', itm.options, false),
        required: itm.fields.filter(f => !this._isOptional(f.options)).map(f => f.name),
        properties: mergeArrayObjects( ...itm.fields.map(f => ({ [f.name]: this._makeField(f) }) ))
      })
    };
  }

  /**
    * Formats mapOf for the given schema type
    * @param {MapDef} itm - mapOf to format
    * @returns {string} - formatted mapOf
    */
  _formatMapOf(itm: MapOfDef|Field): Record<string, any> {
    const keyType = safeGet(this.schema.types, itm.options.get('ktype'));
    let keys =  '^.*$';

    if (['Choice', 'Enumerated', 'Map', 'Record'].includes(keyType.type)) {
      const attr = keyType.type === 'Enumerated' ? 'value' : 'name';
      const keyValues = (keyType.fields || []).map((f: EnumeratedField|Field) => safeGet(f, attr) );
      keys = `^(${keyValues.join('|')})$`;
    } else {
      console.warn(`Invalid MapOf definition for ${itm.name}`);
    }

    return {
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: 'object',
        description: this._cleanComment(itm.description),
        additionalProperties: false,
        minProperties: 1,
        patternProperties: {
          [keys]: this._getFieldType(itm.options.get('vtype', 'String'))
        }
      })
    };
  }

  /**
    * Formats record for the given schema type
    * @param {RecordDef} itm - record to format
    * @returns {string} - formatted record
    */
  _formatRecord(itm: RecordDef): Record<string, any> {
    return {
      [this.formatString(itm.name)]: this._cleanEmpty({
        title: this.formatTitle(itm.name),
        type: 'object',
        description: this._cleanComment(itm.description),
        additionalProperties: false,
        ...this._optReformat('object', itm.options, false),
        required: itm.fields.filter(f => !this._isOptional(f.options)).map(f => f.name),
        properties: mergeArrayObjects( ...itm.fields.map(f => ({ [f.name]: this._makeField(f) }) ))
      })
    };
  }

  /**
    * Formats custom type for the given schema type
    * @param {DefinitionBase} itm - custom type to format
    * @returns {string} - formatted custom type
   */
  _formatCustom(itm: DefinitionBase): Record<string, any> {
    const customJSON: Record<string, any> = {
      title: this.formatTitle(itm.name),
      ...this._getFieldType(itm.type),
      description: this._cleanComment(itm.description)
    };

    const opts = this._optReformat(itm.type, itm.options, true);
    const optKeys = Object.keys(opts);
    const keys = Object.keys(customJSON).filter(k => optKeys.includes(k));

    if (keys.length > 0) {
      console.warn(`${itm.name} has duplicate keys: ${keys}`);
    }

    if (['format', 'pattern'].some(k => hasProperty(opts, k))) {
      delete customJSON.$ref;
      delete customJSON.format;
      customJSON.type = 'string';
    }

    return {
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
  _getType(name: string): string {
    const typeDef = this.types.filter(t => t.name === name);
    return safeGet(typeDef.length === 1 ? typeDef[0] : {}, 'type', 'String');
  }

  /**
    * Reformat options for the given schema
    * @param {string} optType: type to reformat the options for
    * @param {Options} opts: original options to reformat
    * @returns {Record<string, any>} - reformatted options
    */
  _optReformat(optType: string, opts: Options, baseRef?: boolean): Record<string, any> {
    optType = optType.toLowerCase(); // eslint-disable-line no-param-reassign
    const optKeys = this._getOptKeys(optType);
    let formattedOpts: Record<string, any> = {};

    const ignore = (key: string, val: any) => {
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

    const optObj = opts.object();
    Object.keys(optObj).forEach(key => {
      const val = optObj[key];
      if (ignore(key, val) || this.ignoreOpts.includes(key)) {
        return;
      }

      const fmt = safeGet(this.jadnFmt, val, null);
      if (fmt !== null && key === 'format') {
        formattedOpts = {
          ...formattedOpts,
          ...fmt
        };
      } else if (hasProperty(optKeys, key)) {
        formattedOpts[optKeys[key]] = key === 'format' ? safeGet(this.validationMap, val, val) : val;
      } else {
        console.warn(`unknown option for type of ${optType}: ${key} - ${val}`);
      }
    });

    const fmt = safeGet(formattedOpts, 'format', '');
    if (fmt.match(/^u\d+$/)) {
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
    * @param {string|FormFieldtError} field - current type
    * @returns {Record<string, any>} - type mapped to the schema
   */
  _getFieldType(field: string|Field): Record<string, any> {
    let fieldType = typeof field === 'object' ? safeGet(field, 'type', field) : field;
    fieldType = typeof fieldType === 'string' ? fieldType : 'String';

    if (typeof field === 'object' && field instanceof Field) {
      let rtn: Record<string, any>;
      switch (field.type) {
        case 'ArrayOf':
          rtn = this._formatArrayOf(field);
          break;
        case 'MapOf':
          rtn = this._formatMapOf(field);
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
        rtn = {
          type: this.formatString(safeGet(this.fieldMap, field.type, field.type))
        };
        if (field.type.toLowerCase() === 'binary') {
          if (['b', 'x', 'binary', null].includes(safeGet(field.options, 'format', null))) {
            this.hasBinary = !hasProperty(this.customFields, 'Binary');
            rtn = { '$ref' : '#/definitions/Binary' };
          } else {
            rtn.format = field.options.format;
          }
        }
        return rtn;
      }
    }

    if (hasProperty(this.customFields, fieldType)) {
      return {
        '$ref': `#/definitions/${this.formatString(fieldType)}`
      };
    }

    if (hasProperty(this.fieldMap, fieldType)) {
      let rtn: Record<string, any> = {
        type: this.formatString(safeGet(this.fieldMap, fieldType, fieldType))
      };

      if (fieldType.toLowerCase() === 'binary') {
        this.hasBinary = !hasProperty(this.customFields, 'Binary');
        rtn = { '$ref' : '#/definitions/Binary' };
      }
      return rtn;

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

    if (fieldType.match(/^Enum\(.*?\)$/)) {
      const fType: DefinitionBase = safeGet(this.schema.types, fieldType.substring(5, fieldType.length - 1));
      if (['Array', 'Choice', 'Map', 'Record'].includes(fType.type)) {
        return {
          type: 'string',
          description: `Derived enumeration from ${fType.name}`,
          enum: (fType.fields || []).map(f => safeGet(f, 'name'))
        };
      }
      throw new FormatError(`Invalid derived enumeration - ${fType.name} should be a Array, Choice, Map or Record type`);
    }

    if (fieldType.match(/^MapOf\(.*?\)$/)) {
      console.log(`Derived MapOf - ${fieldType}`);
    }

    console.warn(`unknown type: ${fieldType}`);
    return { type: 'string' };
  }

  /**
   * Format a Field as a JSON field
   * @param {Field} field - Field object to format
   * @returns {Record<string, any>} - formatted JSON field
   */
  // eslint-disable-next-line class-methods-use-this
  _makeField(field: Field): Record<string, any> {
    let fieldDef: Record<string, any>;
    if (this._isArray(field.options)) {
      fieldDef = {
        type: 'array',
        items: this._getFieldType(field)
      };
    } else {
      fieldDef = this._getFieldType(field);
      fieldDef = (Object.keys(fieldDef).length === 1 && hasProperty(fieldDef, field.name)) ? safeGet(fieldDef, field.name, {}) : fieldDef;
    }

    const ref = hasProperty(fieldDef, '$ref') && ['Integer', 'Number'].includes(field.type);
    let fieldType = safeGet(fieldDef, 'type', '');
    fieldType = fieldType === '' ? safeGet(fieldDef, '$ref', '') : fieldType;
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

    // console.log(fieldDef)
    return fieldDef;
  }

  /**
    * Format a comment for the given schema
    * @param {string} msg - comment text
    * @param {Record<string, any>} kwargs - key/value comments
    * @returns {string} - formatted comment
    */
  _cleanComment(msg: string, kwargs?: Record<string, any>): string {
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
    * @returns {Record<string, any>} - option keys for translation
   */
  _getOptKeys(type: string): Record<string, any> {
    const opts = Object.keys(this.optKeys).map(key => key.split('|').includes(type) ? this.optKeys[key] : {} ).filter(o => Object.keys(o).length > 0);
    return opts.length === 1 ? opts[0] : {};
  }

  /**
   * Clean and reorder a given value
   * @param {any} itm - item to clean and reorder
   * @returns {any} - cleaned and reoreded item
   */
  _cleanEmpty(itm: any): any {
    if (typeof itm === 'object') {
      if (Array.isArray(itm)) {
        return itm.map(idx => this._cleanEmpty(idx));
      }

      const tmp = mergeArrayObjects(
        ...Object.keys(itm).map(key => {
          const val = itm[key];
          if (['', ' ', null, undefined].includes(val) && ['boolean', 'number'].includes(typeof val)) {
            return {};
          }
          if ((typeof val === 'string' || (typeof val === 'object' && Array.isArray(val))) && val.length === 0) {
            return {};
          }
          return { [key]: this._cleanEmpty(val) };
        })
      );

      return {
        ...mergeArrayObjects(
          ...this.schemaOrder.map(f => hasProperty(tmp, f) ? { [f]: tmp[f]} : {} )
        ),
        ...mergeArrayObjects(
          ...Object.keys(tmp).map(f => this.schemaOrder.includes(f) ? {} : { [f]: tmp[f]} )
        )
      };
    }
    return itm;
  }
}

export default JADNtoJSON;