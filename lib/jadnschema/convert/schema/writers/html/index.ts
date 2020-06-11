/* eslint lines-between-class-members: 0 */
// JADN to HTML
import fs from 'fs-extra';
import less from 'less';
import namedRegExp from 'named-js-regexp';
import path from 'path';
import Twig from 'twig';

import WriterBase from '../base';
import { safeGet, hasProperty } from '../../../../utils';
import { Field, EnumeratedField } from '../../../../schema/fields';
import Options from '../../../../schema/options';
import {
  ArrayDef,
  ArrayOfDef,
  ChoiceDef,
  EnumeratedDef,
  MapDef,
  MapOfDef,
  RecordDef
} from '../../../../schema/definitions';

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

const templatesDir = path.join(__dirname, 'templates');

class JADNtoHTML extends WriterBase {
  format = 'html'
  typeTableTemplate = Twig.twig({ data: fs.readFileSync(path.join(templatesDir, 'typeTable.twig')).toString() })

  // eslint-disable-next-line global-require
  private themeStyles = require('./theme').default;  //  Default theme

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
    const styles = safeGet(args, 'styles');

    const html = Twig.twig({
      data: fs.readFileSync(path.join(templatesDir, 'base.twig')).toString()
    }).render({
      module: this.meta.get('module', 'JADN Schema Convert'),
      version: this.meta.get('version', '0.0'),
      styles: this._loadStyles(styles),
      meta: this.makeHeader(),
      structures: this.makeStructures()
    });

    return this._formatHTML(html);
  }

  /**
    * Create the headers for the schema
    * @return {string} - header for schema
    */
  makeHeader(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mkRow = (key: string, v: any): Record<string, string> => {
      let val = v || '';  // eslint-disable-line no-param-reassign
      if (typeof val === 'object') {
        val = hasProperty(val, 'schema') ? val.schema() : val;
        if (Array.isArray(val)) {
          val = val.length > 0 ? val.map(idx => Array.isArray(idx) ? `**${idx[0]}**: ${idx[1]}` : idx).join(', ') : 'N/A/';
        } else {
          val = Object.keys(val).map(k => `**${k}**: ${val[k]}`).join(', ');
        }
      }
      return { key, val };
    };

    return Twig.twig({
      data: fs.readFileSync(path.join(templatesDir, 'header.twig')).toString()
    }).render({
      rows: this.metaOrder.map(k => mkRow(k, this.meta.get(k)))
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
        structureHTML += safeGet(this, `_format${typeDef.type}`, () => '<p>Oops...</p>').bind(this)(typeDef, idx+1);
      } else {
        const mltiOptsCheck = ['Integer', 'Number'].includes(typeDef.type) ? undefined : (x: number, y: number): boolean => (x > 0 || y > 0);
        let multi = typeDef.options.multiplicity(0, 0, false, mltiOptsCheck);
        multi = multi ? `{${multi}}` : '';

        const fmt = hasProperty(typeDef.options, 'format') ? ` /${typeDef.options.format}` : '';

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
      let elm = e.startsWith('<') ? e : `<${e}`;
      elm = elm.endsWith('>') ? elm : `${elm}>`;
      return elm;
    });

    const tagRegEx = namedRegExp(/\s*?<\/?(?<tag>[\w]+)(\s|>).*$/);
    tmpFormat.forEach(ln => {
      const line = ln.trim();
      const tag = safeGet((tagRegEx.execGroups(line) || {}), 'tag', null);
      let indent = '\t'.repeat(nestedTags.length);

      if (tag === 'style') {
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
      } else if (new RegExp(`^<${tag}.*?</${tag}>$`).exec(line)) {
        formattedHTML += `${indent}${line}\n`;
      } else if (line.startsWith('<!') || line.endsWith('/>')) {
        formattedHTML += `${indent}${line}\n`;
      } else if (line.endsWith(`</${nestedTags.length > 0 ? nestedTags[nestedTags.length - 1] : ''}>`)) {
        nestedTags.pop();
        indent = '\t'.repeat(nestedTags.length);
        formattedHTML += `${indent}${line}\n`;
      }
      else {
        formattedHTML += `${indent}${line}\n`;
        if (!line.endsWith(`${tag}/>`)) {
            nestedTags.push(tag);
        }
      }

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
    let theme = styles;
    if (['', ' ', null, undefined].includes(theme)) {
      return this.themeStyles;
    }

    const ext = path.extname(theme);
    if (!['.css', '.less'].includes(ext)) {
      throw new TypeError('Styles are not in css or less format');
    }

    if (fs.pathExistsSync(theme)) {
      theme = fs.readFileSync(theme).toString();
      if (ext === '.less') {
        less.render(theme).then(out => {
          theme = out.css;
          return theme;
        }).catch(err => console.warn(err));
      }
      return theme;
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
    const fieldRow: Array<number| string> = [];
    options.headers.forEach(column => {
      const hasColumn = hasProperty(row, column);
      const columnName = hasColumn ? column : safeGet(this.tableFieldHeaders, column, column);
      let cell;

      if (typeof columnName === 'string') {
        cell = safeGet(row, columnName, '');
      } else {
        const cellList = columnName.map((c: string) => safeGet(row, c, '')).filter((c: string) => c.length > 0);
        cell = cellList.length === 1 ? cellList[0] : '';
      }

      if (columnName === 'type' && row instanceof Field) {
        cell = `${row.type}`;
        switch (row.type) {
          case 'ArrayOf':
            cell += `(${row.options.get('vtype', 'String')})`;
            break;
          case 'MapOf':
            cell += `(${row.options.get('ktype', 'String')}, ${row.options.get('vtype', 'String')})`;
            break;
          case 'String':
            cell += hasProperty(row.options, 'pattern') ? `(%${row.options.pattern}%)` : '';
            break;
          default:
            cell += '';
        }
        cell += hasProperty(row.options, 'format') ?  ` /${row.options.format}` : '';
      } else if (columnName === 'options' && cell instanceof Options) {
        cell = cell.multiplicity(1, 1, true);
      }
      fieldRow.push(cell);
    });
    return fieldRow;
  });

   return this.typeTableTemplate.render({
     ...options,
     body: tableBody
   });
 }
}

export default JADNtoHTML;