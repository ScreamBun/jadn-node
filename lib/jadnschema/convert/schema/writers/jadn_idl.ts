/* eslint @typescript-eslint/camelcase: 0 */
// JADN to JADN
import fs from 'fs-extra';
import {
  getBorderCharacters,
  table
} from 'table';

import WriterBase from './base';
import { Field, EnumeratedField } from '../../../schema';
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
import { hasProperty, objectValues, safeGet } from '../../../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>


class JADNtoIDL extends WriterBase {
  format = 'jidl';

  /**
    * Produce JADN IDL schema from JADN schema and write to file provided
    * @param {string} fname - Name of file to write
    * @param {string} source - Name of the original schema file
    * @param {Args} kwargs - extra field values for the function
    */
  dump(fname: string, source?: string, kwargs?: Args): void {
    const now = new Date();
    let contents = this.dumps(kwargs);

    if (source !== null && source !== undefined) {
      contents = `<!-- Generated from ${source}, ${now.toLocaleString()} -->\n${contents}`;
    }
    fs.outputFileSync(fname, contents);
   }

   /**
    * Converts the JADN schema to JADN IDL
    * @param {Args} kwargs - extra field values for the function
    * @return {string} - JADN schema
    */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
   dumps(kwargs?: Args): string {  // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
    let schemaJIDL = this.makeHeader();
    const structures = this._makeStructures('');

    this.definitionOrder.forEach((defName: string) => {
      if (hasProperty(structures, defName)) {
        const strDef = structures[defName];
        schemaJIDL += strDef ? `${strDef}\n` : '';
        delete structures[defName];
      }
    });

    schemaJIDL += objectValues(structures).map(strDef => `${strDef}\n`).join('');
    return schemaJIDL.replace('\t', ' '.repeat(4));
   }

   /**
     * Create the headers for the schema
     * @returns {string} - header for schema
    */
  makeHeader(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (v: any): string => {
      v = v || '';  // eslint-disable-line no-param-reassign
      if (typeof v === 'object') {
        if (hasProperty(v, 'schema')) {
          return JSON.stringify(v.schema());
        }
        if (Array.isArray(v)) {
          return `['${v.join('\', \'')}']`;
        }
      }
      return v;
    };
    const meta = this.metaOrder.filter(k => k === 'config' ? safeGet(this.meta, 'configSet', false) : hasProperty(this.meta, k)).map(k => [`${k}:`, val(this.meta.get(k))]);
     return `${this._makeTable(meta, ['r', ''])}\n`;
   }

  // Structure Formats
  // eslint-disable-next-line spaced-comment
  /**
    * Formats array for the given schema type
    * @param {ArrarDef} itm - array to format
    * @returns {string} - formatted array
   `*/
   _formatArray(itm: ArrayDef): string {
    const fmt = hasProperty(itm.options, 'format') ? ` /${itm.options.format}` : '';
    let arrayIDL = `${itm.name} = Array${fmt} {`;

    const fieldCount = itm.fields.length;
    const itmFields: Array<[number, string, string]> = itm.fields.map((f: Field, idx: number) => {
      let fieldType = `${f.type}`;
      if (f.type === 'ArrayOf') {
        fieldType += `(${f.options.get('vtype', 'String')})`;
      } else if (f.type === 'MapOf') {
        fieldType += `(${f.options.get('ktype', 'String')}, ${f.options.get('vtype', 'String')})`;
      }

      const array = this._isArray(f.options) ? `[${f.options.multiplicity()}]` : '';
      const fldFmt = hasProperty(f.options, 'format') ? ` /${f.options.format}` : '';
      const opt = this._isOptional(f.options) ? ' optional' : '';
      const cont = idx+1 !== fieldCount ? ',' : '';

      return [f.id, `${fieldType}${array}${fldFmt}${array ? '' : opt}${cont}`, f.description ? `// ${f.name}:: ${f.description}` : ''];
    });

    const fieldTable = this._makeTable(itmFields);
    if (itm.description) {
      const idx = fieldTable.indexOf('//');
      if (idx > arrayIDL.length) {
        arrayIDL += `${' '.repeat(idx - arrayIDL.length)}// ${itm.description}`;
      } else {
        arrayIDL += `  // ${itm.description}`;
      }
    }

    arrayIDL += `\n${fieldTable}`;
    return `${arrayIDL}}\n`;
  }

  /**
    * Formats arrayOf for the given schema type
    * @param {ArrayOfDef} itm - arrayOf to format
    * @returns {string} - formatted arrayOf
    */
  _formatArrayOf(itm: ArrayOfDef): string {
    return this._formatCustom(itm);
  }

  /**
    * Formats choice for the given schema type
    * @param {ChoiceDef} itm - choice to format
    * @returns {string} - formatted choice
    */
  _formatChoice(itm: ChoiceDef): string {
    let choiceIDL = `${itm.name} = Choice {`;
    const itmFields = this._makeFields(itm.fields);

    if (itm.description) {
      const idx = itmFields.indexOf('//');
      if (idx > choiceIDL.length) {
        choiceIDL += `${' '.repeat(idx - choiceIDL.length)}// ${itm.description}`;
      } else {
        choiceIDL += `  // ${itm.description}`;
      }
    }

    choiceIDL += `\n${itmFields}`;
    return `${choiceIDL}}\n`;
  }

  /**
    * Formats enum for the given schema type
    * @param {EnumeratedDef} itm - enum to format
    * @returns {string} - formatted enum
   */
  _formatEnumerated(itm: EnumeratedDef): string {
    const useID = hasProperty(itm.options, 'id');
    let enumIDL = `${itm.name} = Enumerated${useID ? '.ID' : ''} {`;

    const fieldCount = itm.fields.length;
    const itmFields: Array<[number, string]|[number, string, string]> = itm.fields.map((f: EnumeratedField, idx: number) => {
      if (useID) {
        return [f.id, `// ${f.value}:: ${f.description}`];
      }
      return [f.id, `${f.value}${idx+1 !== fieldCount ? ',' : ''}`, `// ${f.description}`];
    });

    const fieldTable = this._makeTable(itmFields, ['r']);
    if (itm.description) {
      const idx = fieldTable.indexOf('//');
      if (idx > enumIDL.length) {
        enumIDL += `${' '.repeat(idx - enumIDL.length)}// ${itm.description}`;
      } else {
        enumIDL += `  // ${itm.description}`;
      }
    }

    enumIDL += `\n${fieldTable}`;
    return `${enumIDL}}\n`;
  }

  /**
    * Formats map for the given schema type
    * @param {MapDef} itm - map to format
    * @returns {string} - formatted map
   */
  _formatMap(itm: MapDef): string {
    const check = (x: number, y: number): boolean => (x > 0 || y > 0);
    const multi = itm.options.multiplicity(0, 0, false, check);
    let mapIDL = `${itm.name} = Map${multi ? `{${multi}}` : ''} {`;

    const itmFields = this._makeFields(itm.fields);

    if (itm.description) {
      const idx = itmFields.indexOf('//');
      if (idx > mapIDL.length) {
        mapIDL += `${' '.repeat(idx - mapIDL.length)}// ${itm.description}`;
      } else {
        mapIDL += `  // ${itm.description}`;
      }
    }

    mapIDL += `\n${itmFields}`;
    return `${mapIDL}}\n`;
  }

  /**
    * Formats mapOf for the given schema type
    * @param {MapDef} itm - mapOf to format
    * @returns {string} - formatted mapOf
   */
  _formatMapOf(itm: MapOfDef): string {
    return this._formatCustom(itm);
  }

  /**
    * Formats record for the given schema type
    * @param {RecordDef} itm - record to format
    * @returns {string} - formatted record
   */
  _formatRecord(itm: RecordDef): string {
    const check = (x: number, y: number): boolean => (x > 0 || y > 0);
    const multi = itm.options.multiplicity(0, 0, false, check);
    let recordIDL = `${itm.name} = Record${multi ? `{${multi}}` : ''} {`;

    const itmFields = this._makeFields(itm.fields);

    if (itm.description) {
      const idx = itmFields.indexOf('//');
      if (idx > recordIDL.length) {
        recordIDL += `${' '.repeat(idx - recordIDL.length)}// ${itm.description}`;
      } else {
        recordIDL += `  // ${itm.description}`;
      }
    }

    recordIDL += `\n${itmFields}`;
    return `${recordIDL}}\n`;
  }

  /**
    * Formats custom type for the given schema type
    * @param {DefinitionBase} itm - custom type to format
    * @returns {string} - formatted custom type
   */
  // eslint-disable-next-line class-methods-use-this
  _formatCustom(itm: DefinitionBase): string {
    let itmType = `${itm.type}`;

    if (itm.type === 'ArrayOf') {
      itmType += `(${itm.options.get('vtype', 'String')})`;
    } else if (itm.type === 'MapOf') {
      itmType += `(${itm.options.get('ktype', 'String')}, ${itm.options.get('vtype', 'String')})`;
    }

    const multi = itm.options.multiplicity();
    if (['Integer', 'Number'].includes(itm.type)) {
      itmType += multi ? `{${multi}}` : '';
    } else {
      itmType += multi !== '0..*' ? `{${multi}}` : '';
    }

    itmType += hasProperty(itm.options, 'pattern') ? `(%${itm.options.pattern}%)` : '';
    itmType += hasProperty(itm.options, 'format') ? ` /${itm.options.format}` : '';
    itmType += safeGet(itm.options, 'unique', false) ? ' unique' : '';
    return `${itm.name} = ${itmType}${itm.description ? `  // ${itm.description}` : ''}\n`;
  }

  // Helper Functions
  /**
    * Convert a field arrat to a formatted row array
    * @param {Array<Field>} field - fields to format
    * @returns {string} - formatted fields
    */
  _makeFields(fields: Array<Field>): string {
    const fieldCount = fields.length;
    if (fieldCount === 0) {
      return '';
    }

    const tmpFields: Array<[number, string, string, string]> = fields.map((f: Field, idx: number) => {
      let fieldType = `${f.type}`;

      if (f.type === 'ArrayOf') {
        fieldType += `(${f.options.get('vtype', 'String')})`;
        fieldType += `{${f.options.multiplicity()}}`;
      } else if (f.type === 'MapOf') {
        fieldType += `(${f.options.get('ktype', 'String')}, ${f.options.get('vtype', 'String')})`;
        fieldType += `{${f.options.multiplicity()}}`;
      } else {
        let multi = '';
        if (this._isArray(f.options)) {
          multi = f.options.multiplicity();
          multi = multi ? `[${multi}]` : '';
        } else {
          /*
          TODO: FIX ME!!
          const check = ['Integer', 'Number'].includes(f.type) ? (x: number, y: number) => (x > 0 || y > 0) : undefined;
          console.log(f.name)
          multi = f.options.multiplicity(0, 0, true, check);
          multi = multi ? `{${multi}}` : '';
          */
        }
        fieldType += multi || '';
      }

      const fmt = hasProperty(f.options, 'format') ? ` /${f.options.format}` : '';
      const pattern = hasProperty(f.options, 'pattern') ? `(%${f.options.pattern}%)` : '';
      const unq = safeGet(f.options, 'unique', false) ? ' unique' : '';
      const opt = this._isOptional(f.options) ? ' optional' : '';
      const cont = idx+1 !== fieldCount ? ',' : '';

      return [f.id, f.name, `${fieldType}${fmt}${pattern}${unq}${opt}${cont}`, f.description ? `// ${f.description}` : ''];
    });
    return this._makeTable(tmpFields, ['r']);
  }

  /**
    * Create a table using the given values
    * @param {Array<Array<any>>} rows - row values
    * @param {Array<string>} alignment - alignment of the columns
    * @return {string} - formatted MarkDown table
   */
  // eslint-disable-next-line class-methods-use-this
  _makeTable(rows: Array<Array<number|string>>, alignment?: Array<string>): string {
    const alignments = {
      l: 'left',
      c: 'center',
      r: 'right'
    };
    const columns: Record<string, Record<string, number|string>> = {};
    if (alignment !== null || alignment !== undefined) {
      (alignment || []).forEach((a: string, i: number) => {
        columns[`${i}`] = {
          alignment: safeGet(alignments, a, 'left')
        };
      });
    }

    const config = {
      border: getBorderCharacters(`void`),
      columns,
      drawHorizontalLine: (): boolean => false
    };
    const tableRows = table(rows, config).split('\n');
    return tableRows.map(r => r.trimRight()).join('\n');
  }
}

export default JADNtoIDL;