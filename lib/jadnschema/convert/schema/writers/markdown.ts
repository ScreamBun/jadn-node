/* eslint @typescript-eslint/camelcase: 0 */
// JADN to JADN
import fs from 'fs-extra';
import table from 'markdown-table';

import WriterBase from './base';
import { hasProperty, objectValues, safeGet } from '../../../utils';
import { EnumeratedField, Field } from '../../../schema/fields';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>


class JADNtoJADN extends WriterBase {
  format = 'md';

  /**
    * Produce MarkDown tables from JADN schema and write to file provided
    * @param {string} fname - Name of file to write
    * @param {string} source - Name of the original schema file
    * @param {Args} kwargs - extra field values for the function
    */
  dump(fname: string, source?: string, kwargs?: Args): void {
    let contents = this.dumps(kwargs);

    if (source !== null && source !== undefined) {
      const now = new Date();
      contents = `<!-- Generated from ${source}, ${now.toLocaleString()} -->\n${contents}`;
    }
    fs.outputFileSync(fname, contents);
   }

   /**
    * Converts the JADN schema to MarkDown
    * @param {Args} kwargs - extra field values for the function
    * @return {string} - MarkDown Tables
    */
  dumps(kwargs?: Args): string {
    let schemaMD = this.makeHeader();
    const structures = this._makeStructures('', kwargs);

    schemaMD += this.definitionOrder.map(typeName => {
      const structDef = safeGet(structures, typeName, null);
      if (!['', ' ', null, undefined].includes(structDef)) {
        delete structures[typeName];
        return structDef;
      }
      return '';
    }).filter(d => d.length > 0).join('\n');

    schemaMD += '\n';

    schemaMD += Object.keys(structures).map(typeName => {
      const structDef = safeGet(structures, typeName, null);
      if (!['', ' ', null, undefined].includes(structDef)) {
        delete structures[typeName];
        return structDef;
      }
      return '';
    }).filter(d => d.length > 0).join('\n');

    schemaMD += '\n';
    return schemaMD.replace('\t', ' '.repeat(4));
  }

  /**
    * Create the headers for the schema
    * @returns {string} - header for schema
   */
  makeHeader(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mkRow = (key: string, v: any): Record<string, string> => {
      let val = v || '';
      if (typeof val === 'object') {
        val = hasProperty(val, 'schema') ? val.schema() : val;
        if (Array.isArray(val)) {
          val = val.length > 0 ? val.map(idx => Array.isArray(idx) ? `**${idx[0]}**: ${idx[1]}` : idx).join(', ') : 'N/A/';
        } else {
          val = Object.keys(val).map(k => `**${k}**: ${val[k]}`).join(' ');
        }
      }
      return {'.': `**${key}:**`, '..': val};
    };

    const headers = {
      '.': 'r',
      '..': ''
    };
    let metaTable = this._makeTable(headers, this.metaOrder.map(k => mkRow(k, this.meta.get(k))).filter(idx => idx['..'] !== ''));
    metaTable = metaTable.replace(' .. ', ' .  ');
    return `## Schema\n${metaTable}\n`;
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
    const arrayMD = `**_Type: ${itm.name} (Array${fmt})_**\n\n`;

    const rows = itm.fields.map(f => {
      // eslint-disable-next-line no-param-reassign
      f.description = `**${f.name}**::${f.description}`;
      return f;
    });

    const arrayTable = this._makeTable(
      {
          ID: 'r',
          Type: '',
          '#': 'r',
          Description: ''
      },
      rows
    );
    return `${arrayMD}${arrayTable}`;
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
    const fmt = hasProperty(itm.options, 'format') ? ` /${itm.options.format}` : '';
    const choiceMD = `**_Type: ${itm.name} (Choice${fmt})_**\n\n`;

    const headers = {
      ID: 'r',
      Name: '',
      Type: '',
      '#': 'r',
      Description: ''
    };
    const rows = itm.fields.map(f => this._makeField(f));
    const choiceTable = this._makeTable(headers, rows);

  return `${choiceMD}${choiceTable}`;
  }

  /**
    * Formats enum for the given schema type
    * @param {EnumeratedDef} itm - enum to format
    * @returns {string} - formatted enum
   */
  _formatEnumerated(itm: EnumeratedDef): string {
    const fmt = hasProperty(itm.options, 'id') ? '.ID' : '';
    const enumMD = `**_Type: ${itm.name} (Enumerated${fmt})_**\n\n`;

    let headers: Record<string, string>;
    let rows: Array<Record<string, number|string>|EnumeratedField>;

    if (safeGet(itm.options, 'id', false)) {
      headers = {
        ID: 'r',
        Description: ''
      };
      rows = itm.fields.map(f => ({ID: f.id, Description: `**${f.value}**::${f.description}`}) );
    } else {
      headers = {
        ID: 'r',
        Name: '',
        Description: ''
      };
      rows = itm.fields;
    }
    const enumTable = this._makeTable(headers, rows);
    return `${enumMD}${enumTable}`;
  }

  /**
    * Formats map for the given schema type
    * @param {MapDef} itm - map to format
    * @returns {string} - formatted map
   */
  _formatMap(itm: MapDef): string {
    let fmt = hasProperty(itm.options, 'id') ? '.ID' : '';
    const multi = itm.options.multiplicity(0, 0, false, (x: number, y: number) => x > 0 || y > 0);
    fmt += multi === '' ? '' : `{${multi}}`;

    const mapMD = `**_Type: ${itm.name} (Map${fmt})_**\n\n`;

    const mapTable = this._makeTable(
      {
          ID: 'r',
          Name: '',
          Type: '',
          '#': 'r',
          Description: ''
      },
      itm.fields.map(f => this._makeField(f))
    );
    return `${mapMD}${mapTable}`;
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
    const multi = itm.options.multiplicity(0, 0, false, (x: number, y: number) => x > 0 || y > 0);
    const fmt = multi === '' ? '' : `{${multi}}`;
    const recordMD = `**_Type: ${itm.name} (Record${fmt})_**\n\n`;

    const headers = {
      ID: 'r',
      Name: '',
      Type: '',
      '#': 'r',
      Description: ''
    };
    const rows = itm.fields.map(f => this._makeField(f));
    const recordTable = this._makeTable(headers, rows);

    return `${recordMD}${recordTable}`;
  }

  /**
    * Formats custom type for the given schema type
    * @param {DefinitionBase} itm - custom type to format
    * @returns {string} - formatted custom type
   */
  _formatCustom(itm: DefinitionBase): string {
    const headers = {
      'Type Name': '',
      'Type Definition': '',
      'Description': ''
    };
    const field = this._makeField(itm);
    const rows = [
      {
        'Type Name': `**${field.name}**`,
        'Type Definition': field.type,
        'Description': field.description
      }
    ];

    const customMD = this._makeTable(headers, rows);
    return `\n${customMD}`;
  }

  // Helper Functions
  /**
    * Convert a field to a formatted row
    * @param {DefinitionBase|EnumeratedField|Field} field - field to format
    * @returns {Record<string, string>} - formatted field
    */
  // eslint-disable-next-line class-methods-use-this
  _makeField(field: DefinitionBase|Field): Record<string, string> {
    const fieldObject = field.object();

    if (field.type === 'MapOf') {
      fieldObject.type += `(${field.options.get('ktype', 'String')}, ${field.options.get('vtype', 'String')})`;
    } else if (field.type === 'ArrayOf') {
      fieldObject.type += `(${field.options.get('vtype', 'String')})`;
    }

    const mltiOptsCheck = ['Integer', 'Number'].includes(field.type) ? undefined : (x: number, y: number): boolean => (x > 0 || y > 0);
    const multi = field.options.multiplicity(0, 0, false, mltiOptsCheck);
    if (multi !== '') {
      fieldObject.type += `{${multi}}`;
    }

    fieldObject.type += hasProperty(field.options, 'pattern') ? `(%${field.options.pattern}%)` : '';
    fieldObject.type += hasProperty(field.options, 'format') ? ` /${field.options.format}` : '';
    fieldObject.type += safeGet(field.options, 'unique', false) ? ' unique' : '';

    return fieldObject;
  }

  /**
    * Create a table using the given header and row values
    * @param {Record<string, Record<string, string>>} headers - table header names and attributes
    * @param rows: row values
    * @return {string} - formatted MarkDown table
   */
  _makeTable(headers: Record<string, string>, rows: Array<Record<string, number|string>|EnumeratedField|Field>): string {
    const alignments = ['l', 'c', 'r'];
    const tableMD = table(
      [
        Object.keys(headers),
        ...rows.map(row => {
          return Object.keys(headers).map(column => {
            const hasColumn = hasProperty(row, column);
            const columnName = hasColumn ? column : safeGet(this.tableFieldHeaders, column, column);
            let cell;

            if (typeof columnName === 'string') {
              cell = safeGet(row, columnName, '');
            } else {
              const cellList = columnName.map((c: string) => safeGet(row, c, '')).filter((c: string) => c.length > 0);
              cell = cellList.length === 1 ? cellList[0] : '';
            }

            if (columnName === 'options' && cell instanceof Options) {
              // TODO: More options
              cell = cell.multiplicity(1, 1, true);
            } else if (columnName === this.tableFieldHeaders.Name) {
              cell = `**${cell}**`;
            }
            return typeof cell === 'string' ? cell.replace('|', '\\|') : cell;
          });
        })
      ],
      {
        align: objectValues(headers).map(a => alignments.includes(a) ? a : 'l')
      }
    );
    return `${tableMD}\n`;
  }
}

export default JADNtoJADN;