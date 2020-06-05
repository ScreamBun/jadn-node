/* eslint lines-between-class-members: 0 */
// JADN Schema Writer Base
import { CommentLevels } from '../enums';

import { SchemaError } from '../../../exceptions';
import { Schema } from '../../../schema';
import Meta from '../../../schema/meta';
import Options from '../../../schema/options';
import { DefinitionBase } from '../../../schema/definitions';
import {
  // General
  hasProperty,
  mergeArrayObjects,
  objectValues,
  safeGet,
  // Simple Interfaces
  SchemaSimpleJADN
} from '../../../utils';

/**
  * @class WriterBase
  * Base JADN Converter
  */
class WriterBase {
  format = '';
  escapeChars: Array<string> = [' '];

  // Non Override
  protected definitionOrder: Array<string> = ['OpenC2-Command', 'OpenC2-Response', 'Action', 'Target', 'Actuator', 'Args', 'Status-Code',
  'Results', 'Artifact', 'Device', 'Domain-Name', 'Email-Addr', 'Features', 'File', 'IDN-Domain-Name', 'IDN-Email-Addr',
  'IPv4-Net', 'IPv4-Connection', 'IPv6-Net', 'IPv6-Connection', 'IRI', 'MAC-Addr', 'Process', 'Properties', 'URI',
  'Action-Targets', 'Targets', 'Date-Time', 'Duration', 'Feature', 'Hashes', 'Hostname', 'IDN-Hostname', 'IPv4-Addr',
  'IPv6-Addr', 'L4-Protocol', 'Message-Type', 'Nsid', 'Payload', 'Port', 'Response-Type', 'Versions', 'Version',
  'Profiles', 'Rate-Limit', 'Binary', 'Command-ID'];
  protected indent: string = ' '.repeat(2);
  protected metaOrder: Array<string> = ['title', 'module', 'patch', 'description', 'exports', 'imports', 'config'];
  protected titleOverrides: Record<string, string> = {
    Addr: 'Address',
    IDN: 'Internationalized',
    L4: 'Layer 4',
    Nsid: 'Namespace Identifier'
  }
  protected spaceStart = /^\s+/m;
  protected tableFieldHeaders: Record<string, string|Array<string>> = {
    '#': 'options',
    Description: 'description',
    ID: 'id',
    Name: ['name', 'value'],
    Type: 'type',
    Value: 'value'
  };

  // Helper Vars
  protected comments: CommentLevels = CommentLevels.ALL;
  protected schema: Schema
  protected meta: Meta
  protected imports: Record<string, string>
  protected types: Array<DefinitionBase>
  protected customFields: Record<string, string>

  /**
    * Initialize a Schema Writer
    * @param {string|SchemaSimpleJADN|Schema} jadn - schema to utalise for conversion
    * @param {boolean} comments - include or ignore comments
    */
  constructor(jadn: string|SchemaSimpleJADN|Schema, comments?: CommentLevels) {
    if (typeof jadn === 'string') {
      this.schema = new Schema();
      try {
        this.schema.loads(jadn);
      } catch (err) {
        this.schema.load(jadn);
      }
    } else if (typeof jadn === 'object') {
      this.schema = new Schema(jadn);
    } else {
      throw new SchemaError('Schema is not proper type');
    }
    if (comments !== null && comments !== undefined) {
      this.comments = comments in CommentLevels ? comments : CommentLevels.ALL;
    }

    // Helper Vars
    this.meta = this.schema.meta;
    this.imports = this.meta.get('imports', {});
    this.types = objectValues(this.schema.types);
    this.customFields = mergeArrayObjects( ...this.types.map(t => ({ [t.name]: t.type}) ));
  }

  /**
    * Parse the given schema to a JADN schema
    * @param {string} fname - schema file to write to
    * @param {string} source - source schema file
    * @param {Record<string, any>} kwargs - extra field values for the function
    */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
   dump(fname: string, source?: string, kwargs?: Record<string, any>): void { // eslint-disable-line class-methods-use-this, no-unused-vars
    throw new ReferenceError(`${this} does not implement "dump"`);
  }

  /**
    * Parse the given schema to a JADN schema
    * @param {Record<string, any>} kwargs - extra field values for the function
    */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
   dumps(kwargs?: Record<string, any>): void { // eslint-disable-line class-methods-use-this, no-unused-vars
    throw new ReferenceError(`${this} does not implement "dumps"`);
  }

  // Helper Functions
  /**
    * Create the type definitions for the schema
    * @param {DefinitionBase} def - definition to determin if a structure or not
    * @param {Record<string, any>} kwargs - extra field values for the function
    * @returns {Record<string, any>} - type definitions for the schema
   */
  _makeStructures(def?: any, kwargs?: Record<string, any>): Record<string, any> {
    return mergeArrayObjects(
      ...this.types.map(typeDef => {
        const df = safeGet(this, typeDef.isStructure() ?  `_format${typeDef.type}` : '_formatCustom', null);
        return { [typeDef.name]: df === null ? def : df.bind(this)(typeDef, kwargs) };
      })
    );
  }

  /**
    * Format a given title with the given overrides
    * @param {string} title - title to format
    * @returns {string} - formatted title
    */
  formatTitle(title: string): string {
    const overrides = Object.keys(this.titleOverrides);
    const words = title.split('-').map(w => overrides.includes(w) ? this.titleOverrides[w] : w );
    return words.join(' ');
  }

  /**
    * Formats the string for use in schema
    * @param {string} str - string to format
    * @returns {string} - formatted string
    */
  formatString(str: string): string {
    const escapeChars = this.escapeChars.filter(c => c.length > 0);
    if (str === '*') {
      return 'unknown';
    } else if (escapeChars.length > 0) {
      const reg = new RegExp(`[${escapeChars.join('')}]`);
      return str.replace(reg, '_');
    }
    return str;
  }

  /**
    * Check if the field is optional
    * @param {Record<string, any>|Options} opts - field options
    * @returns {boolean} - is optional
    */
  // eslint-disable-next-line class-methods-use-this
  _isOptional(opts: Record<string, any>|Options): boolean {
    return opts.get('minc', 1) === 0;
  }

  /**
    * Check if the field is an array
    * @param {Record<string, any>|Options} opts - field options
    * @returns {boolean} - is array
    */
  // eslint-disable-next-line class-methods-use-this
  _isArray(opts: Record<string, any>|Options): boolean {
    if (hasProperty(opts, 'ktype') ||  hasProperty(opts, 'vtype')) {
      return false;
    }
    return opts.get('maxc', 1) !== 1;
  }
}

export default WriterBase;