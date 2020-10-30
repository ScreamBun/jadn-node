// JADN to HTML
import fs from 'fs-extra';
import namedRegExp from 'named-js-regexp';
import path from 'path';

import { baseTemplate, headerTemplate, typeTableTemplate } from './templates';
import WriterBase from '../base';
import {
  DefinitionBase, ArrayDef, ArrayOfDef, ChoiceDef, EnumeratedDef, MapDef, MapOfDef, RecordDef
} from '../../../../schema/definitions';
import { Field, EnumeratedField } from '../../../../schema/fields';
import { Config } from '../../../../schema/info';
import Options from '../../../../schema/options';
import { safeGet, hasProperty } from '../../../../utils';

type StructConvFun = (d: DefinitionBase, i: number) => string;

interface Args {
  styles?: string;
}

interface TypeTable {
  title?: string;
  description?: string;
  caption?: string;
  headers: Array<string>;
  rows: Array<Record<string, string|number>|EnumeratedField|Field>;
  columnClasses?: Array<string>;
}

class JADNtoHTML extends WriterBase {
  format = 'html'

  // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-member-access
  private themeStyles = require('./theme').default as string;  //  Default theme

  /**
    * Produce JSON schema from JADN schema and write to file provided
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
    * Converts the JADN schema to HTML
    * @param {Args} kwargs - extra field values for the function
    * @return {string} - JSON schema
    */
  dumps(kwargs?: Args): string {
    const args = kwargs || {};
    const styles = safeGet(args, 'styles', '') as string;

    const html = baseTemplate({
      package: this.info.get('package', 'JADN Schema Convert') as string,
      version: this.info.get('version', '0.0') as string,
      styles: this._loadStyles(styles),
      info: this.makeHeader(),
      structures: this.makeStructures()
    });

    return this._formatHTML(html);
  }

  /**
    * Create the headers for the schema
    * @return {string} - header for schema
    */
  makeHeader(): string {
    const mkRow = (v?: Array<string>|Record<string, string>|Config): string => {
      if (v instanceof Config) {
        const val = v.schema();
        return Object.keys(val).map(k => `**${k}**: ${val[k]}`).join(', ');
      }
      if (v instanceof Object) {
        if (Array.isArray(v)) {
          return v.length > 0 ? v.join(', ') : 'N/A/';
        }
        return Object.keys(v).map(k => `**${k}**: ${v[k]}`).join(', ');
      }
      return v || '';
    };

    return headerTemplate({
      title: this.info.title || '',
      package: this.info.package,
      version: this.info.version || '',
      description: this.info.description || '',
      comment: this.info.comment || '',
      copyright: this.info.copyright || '',
      license: this.info.license || '',
      exports: (this.info.exports || []).join(', '),
      imports: mkRow(this.info.imports),
      config: mkRow(this.info.config)
    });
  }

  /**
    * Create the type definitions for the schema
    * @return: type definitions for the schema
    */
  makeStructures(): string {
    let structureHTML = '<h2>3.2 Structure Types</h2>';
    const primitives: Array<Record<string, string|number>> = [];

    this.types.forEach((typeDef, idx) => {
      if (typeDef.isStructure()) {
        const convFun = safeGet(this, `_format${typeDef.type}`, () => '<p>Oops...</p>') as StructConvFun;
        structureHTML += convFun.bind(this)(typeDef, idx+1);
      } else {
        const mltiOptsCheck = ['Integer', 'Number'].includes(typeDef.type) ? undefined : (x: number, y: number): boolean => (x > 0 || y > 0);
        let multi = typeDef.options.multiplicity(0, 0, false, mltiOptsCheck);
        multi = multi ? `{${multi}}` : '';

        const fmt = typeDef.options.format ? ` /${typeDef.options.format}` : '';

        primitives.push({
          Name: typeDef.name,
          Definition: `${typeDef.type}${multi}${fmt}`,
          Description: typeDef.description
        });
      }
    });

    const primitiveHTML = this._makeTable({
      title: '3.3 Primitive Types',
      headers: ['Name', 'Definition', 'Description'],
      rows: primitives,
      columnClasses: ['b', 's', 'd']
    });
    return `${structureHTML}${primitiveHTML}`;
  }

  // Structure Formats
  // eslint-disable-next-line spaced-comment
  /**
    * Formats array for the given schema type
    * @param {ArrarDef} itm - array to format
    * @returns {string} - formatted array
   `*/
  _formatArray(itm: ArrayDef, idx: number): string {
    const rows = itm.fields.map(f => {
      // eslint-disable-next-line no-param-reassign
      f.description = `"${f.name}": ${f.description}`;
      return f;
    });

    return this._makeTable({
      title: `3.2.${idx} ${this.formatString(itm.name)}`,
      description: itm.description,
      caption: `${this.formatString(itm.name)} (Array)`,
      headers: ['ID', 'Type', '#', 'Description'],
      rows,
      columnClasses: [ 'n', 's', 'n', 'd']
    });
  }

  /**
    * Formats arrayOf for the given schema type
    * @param {ArrayOfDef} itm - arrayOf to format
    * @returns {string} - formatted arrayOf
    */
  _formatArrayOf(itm: ArrayOfDef, idx: number): string {
    const desc = itm.description === '' ? '' : `<h4>${itm.description}</h4>`;
    const arrayOfHTML = `<h3>3.2.${idx} ${this.formatString(itm.name)}</h3>${desc}`;

    const valueType = this.formatString(itm.options.get('vtype', 'string'));
    let multi = itm.options.multiplicity(0, 0, false, (x: number, y: number) => x > 0 || y > 0);
    multi = multi ? `{${multi}}` : '';
    const options = `<p>${this.formatString(itm.name)} (ArrayOf(${valueType})${multi})</p>`;
    return `${arrayOfHTML}${options}`;
  }

  /**
    * Formats choice for the given schema type
    * @param {ChoiceDef} itm - choice to format
    * @returns {string} - formatted choice
    */
  _formatChoice(itm: ChoiceDef, idx: number): string {
    return this._makeTable({
      title: `3.2.${idx} ${this.formatString(itm.name)}`,
      description: itm.description,
      caption: `${this.formatString(itm.name)} (Choice${Object.keys(itm.options.object()).length > 0 ? ` ${JSON.stringify(itm.options.object())}` : ''})`,
      headers: ['ID', 'Name', 'Type', 'Description'],
      rows: itm.fields,
      columnClasses: [ 'n', 'b', 's', 'd']
    });
  }

  /**
    * Formats enum for the given schema type
    * @param {EnumeratedDef} itm - enum to format
    * @returns {string} - formatted enum
   */
  _formatEnumerated(itm: EnumeratedDef, idx: number): string {
    let headers: Array<string>;
    let rows: Array<Record<string, number|string>|EnumeratedField>;
    let columnClasses: Array<string>;

    if (hasProperty(itm.options, 'id')) {
      headers = ['ID'];
      columnClasses = ['n'];
      rows = itm.fields.map(f => ({ID: f.id, Description: `<span class="b">${f.value}</span>::${f.description}`}) );
    } else {
      headers = ['ID', 'Name'];
      columnClasses = ['n', 'b'];
      rows = itm.fields;
    }

    return this._makeTable({
      title: `3.2.${idx} ${this.formatString(itm.name)}`,
      description: itm.description,
      caption: `${this.formatString(itm.name)} (Enumerated${hasProperty(itm.options, 'id') ? '.ID' : ''})`,
      headers: [ ...headers, 'Description'],
      rows,
      columnClasses: [ ...columnClasses, 'd']
    });
  }

  /**
    * Formats map for the given schema type
    * @param {MapDef} itm - map to format
    * @returns {string} - formatted map
   */
  _formatMap(itm: MapDef, idx: number): string {
    let multi = itm.options.multiplicity(0, 0, false, (x: number, y: number) => x > 0 || y > 0);
    multi = multi ? `{${multi}}` : '';

    return this._makeTable({
      title: `3.2.${idx} ${this.formatString(itm.name)}`,
      description: itm.description,
      caption: `${this.formatString(itm.name)} (Map${multi})`,
      headers: ['ID', 'Name', 'Type', '#', 'Description'],
      rows: itm.fields,
      columnClasses: ['n', 'b', 's', 'n', 'd']
    });
  }

  /**
    * Formats mapOf for the given schema type
    * @param {MapDef} itm - mapOf to format
    * @returns {string} - formatted mapOf
   */
  _formatMapOf(itm: MapOfDef, idx: number): string {
    const desc = itm.description === '' ? '' : `<h4>${itm.description}</h4>`;
    const mapOfHTML = `<h3>3.2.${idx} ${this.formatString(itm.name)}</h3>${desc}`;
    // Options
    const keyType = this.formatString(itm.options.get('ktype', 'string'));
    const valueType = this.formatString(itm.options.get('vtype', 'string'));
    const valueCount = itm.options.multiplicity(0, 0, false);
    const options =  `<p>${this.formatString(itm.name)} (MapOf(${keyType}, ${valueType})[${valueCount}])</p>`;
    return `${mapOfHTML}${options}`;
  }

  /**
    * Formats record for the given schema type
    * @param {RecordDef} itm - record to format
    * @returns {string} - formatted record
   */
  _formatRecord(itm: RecordDef, idx: number): string {
    let multi = itm.options.multiplicity(0, 0, false, (x: number, y: number) => x > 0 || y > 0);
    multi = multi ? `{${multi}}` : '';

    return this._makeTable({
      title: `3.2.${idx} ${this.formatString(itm.name)}`,
      description: itm.description,
      caption: `${this.formatString(itm.name)} (Record${multi})`,
      headers: ['ID', 'Name', 'Type', '#', 'Description'],
      rows: itm.fields,
      columnClasses: ['n', 'b', 's', 'n', 'd']
    });
  }

  // Helper Functions
  /**
    * Format the HTML to a predefined standard
    * @param {string} html - HTML string to format
    * @returns {string} - formatted HTML
   */
  _formatHTML(html: string): string {
    html = html.split('\n').map(l => l.trim()).join(''); // eslint-disable-line no-param-reassign
    let formattedHTML = '';
    const nestedTags: Array<string> = [];

    const tmpFormat = html.split('><').map(e => {
      const elm = e.startsWith('<') ? e : `<${e}`;
      return elm.endsWith('>') ? elm : `${elm}>`;
    });

    const tagRegEx = namedRegExp(/\s*?<\/?(?<tag>[\w]+)(\s|>).*$/);
    tmpFormat.forEach(ln => {
      const line = ln.trim();
      const tag = safeGet((tagRegEx.execGroups(line) || {}), 'tag', '') as string;
      let indent = '\t'.repeat(nestedTags.length);

      switch (true) {
        case tag === 'style':
          let styles = line.substring(line.indexOf('>')+1, line.lastIndexOf('<'));
          const formattedStyles = this._formatCSS(styles);
          if (formattedStyles === '') {
            formattedHTML += `${indent}${line}</style>\n`;
          } else {
            const stylesIndent = '\t'.repeat(nestedTags.length + 1);
            const beginRegEx = namedRegExp(/^(?<start>.)/, 'gm');
            styles = formattedStyles.split('\n').map(l => beginRegEx.replace(l, `${stylesIndent}\${start}`)).join('\n');
            formattedHTML += `${indent}${line.substring(0, line.indexOf('>')+1)}\n${styles}\n${indent}${line.substring(line.lastIndexOf('<'))}\n`;
          }
          break;
        case new RegExp(`^<${tag}.*?> +</${tag}>$`).test(line):
          formattedHTML += `${line}\n`;
          break;
        case new RegExp(`^<${tag}.*?</${tag}>$`).test(line):
        case line.startsWith('<!') || line.endsWith('/>'):
          formattedHTML += `${indent}${line}\n`;
          break;
        case line.endsWith(`</${nestedTags.length > 0 ? nestedTags[nestedTags.length - 1] : ''}>`):
          nestedTags.pop();
          indent = '\t'.repeat(nestedTags.length);
          formattedHTML += `${indent}${line}\n`;
          break;
        default:
          formattedHTML += `${indent}${line}\n`;
          if (!line.endsWith(`${tag}/>`)) {
            nestedTags.push(tag);
          }
          break;
      }
    });

    // Cleanup
    const cleanup: Array<[RegExp, string]> = [
      [/\n\t+<span/g, '<span'],
      [/(<(\w+)[^>]+?>)\n\t+<\/\2>/g, '$1</$2>'],
      [/\t/g, '  ']
    ];
    cleanup.forEach(([reg, rep]) => {
      formattedHTML = formattedHTML.replace(reg, rep);
    });

    return formattedHTML;
  }

  /**
    * Format the CSS to a predefined standard
    * @param {string} styles - CSS string to format
    * @returns {string} formatted CSS
    */
  // eslint-disable-next-line class-methods-use-this
  _formatCSS(css: string): string {
    const lineBreaks = ['\\*/', '{', '}', ';'];
    // eslint-disable-next-line no-template-curly-in-string
    let formattedCSS = namedRegExp(`(?<term>${lineBreaks.join('|')})`, 'g').replace(css, '${term}\n');
    formattedCSS = formattedCSS.substring(0, formattedCSS.length - 1);

    return formattedCSS.split('\n').map(l => l.replace(/\s{4}/, '\t')).join('\n');
  }

  /**
    * Load the given styles
    * @param {string} styles - the CSS or Less file location
    * @returns {string} loaded styles
    */
  _loadStyles(styles: string): string {
    if (['', ' ', null, undefined].includes(styles)) {
      return this.themeStyles;
    }

    const ext = path.extname(styles);
    if (ext !== '.css') {
      throw new TypeError('Styles are not in css format');
    }

    if (fs.pathExistsSync(styles)) {
      return fs.readFileSync(styles).toString();
    }
    throw new ReferenceError(`The style file specified does not exist: ${styles}`);
  }

  /**
    * Create a table using the given header and row values
    * @param {Record<string, Record<string, string>>} headers - table header names and attributes
    * @param {Array<Record<string, string|number>|EnumeratedField|Field>} rows - row values
    * @param {string} caption - caption for the table
    * @return {string} formatted HTML table
    */
  // eslint-disable-next-line max-len
 _makeTable(options: TypeTable = { headers: [], rows: [], columnClasses: [] }): string {
  const tableBody = options.rows.map(row => {
    const fieldRow: Array<number|string> = [];
    options.headers.forEach(column => {
      const hasColumn = hasProperty(row, column);
      const columnName = hasColumn ? column : safeGet(this.tableFieldHeaders, column, column) as string|Array<string>;
      let cell: number|string|Options;

      if (typeof columnName === 'string') {
        cell = safeGet(row, columnName, '') as number|string|Options;
      } else {
        const cellList = columnName.map(c => safeGet(row, c, '') as string).filter(c => c.length > 0);
        cell = cellList.length === 1 ? cellList[0] : '';
      }

      if (columnName === 'type' && row instanceof Field) {
        cell = `${row.type}`;
        switch (row.type) {
          case 'ArrayOf':
            cell += `(${row.options.get('vtype', 'String') as string})`;
            break;
          case 'MapOf':
            cell += `(${row.options.get('ktype', 'String') as string}, ${row.options.get('vtype', 'String') as string})`;
            break;
          case 'String':
            cell += row.options.pattern ? `(%${row.options.pattern}%)` : '';
            break;
          default:
            cell += '';
        }
        cell += row.options.format ?  ` /${row.options.format}` : '';
        fieldRow.push(cell);
      } else if (columnName === 'options' && cell instanceof Options) {
        fieldRow.push(cell.multiplicity(1, 1, true));
      } else {
        fieldRow.push(`${cell as number|string}`);
      }
    });
    return fieldRow;
  });

   return typeTableTemplate({
     ...options,
     body: tableBody
   });
 }
}

export default JADNtoHTML;