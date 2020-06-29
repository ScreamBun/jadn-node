// HTML Template functions
import { safeGet } from '../../../../utils';

export interface BaseProps {
  module?: string;
  version?: string;
  styles?: string;
  meta: string;
  structures: string;
}

/**
 * Base HTML Template
 * @param {BaseProps} props - Properties for the template
 * @returns {string} Formatted properties as per the template
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function baseTemplate(props: BaseProps): string {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${ props.module || 'JADN Schema Convert' } v.${ props.version || '0.0' }</title>
      <style type="text/css">${ props.styles || '' }</style>
    </head>
    <body>
      <div id="schema">
        <h1>Schema</h1>
        <div id="meta">${ props.meta }</div>
        <div id="types">${ props.structures }</div>
      </div>
    </body>
  </html>`;
}

export interface HeaderProps {
  title?: string;
  module: string;
  patch?: string;
  description?: string;
  exports?: string;
  imports?: string;
  config?: string;
}

/**
 * JADN Header Template
 * @param {HeaderProps} props - Properties for the template
 * @returns {string} Formatted properties as per the template
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function headerTemplate(props: HeaderProps): string {
  const rows = Object.keys(props).map(k => `<tr><td class="h">${ k }:</td><td class="s">${ safeGet(props, k, '') as string }</td></tr>`).join('\n');
  return `<table>${ rows }</table>`;
}

export interface TypeTableProps {
  title?: string;
  description?: string;
  caption?: string;
  headers?: Array<string>;
  columnClasses?: Array<string>;
  body: Array<Array<number|string>>
}

/**
 * JADN Type Table Template
 * @param {TypeTableProps} props - Properties for the template
 * @returns {string} Formatted properties as per the template
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function typeTableTemplate(props: TypeTableProps): string {
  const columnClasses = props.columnClasses || Array<string>(props.body[0].length).fill('');
  let headers = '';
  if (props.headers) {
    const head = props.headers.map((h, i) => `<th class="${ columnClasses[i] || '' }">${ h }</th>`).join('');
    headers = `<thead><tr>${ head }</tr></thead>`;
  }

  const body = props.body.map(row => {
    const htmlRow = row.map((c, i) => `<td class="${ columnClasses[i] || '' }">${ c }</td>`).join('');
    return `<tr>${htmlRow}</tr>`;
  }).join('');

  return `${ props.title ? `<h3>${ props.title }</h3>` : '' }
  ${ props.description ? `<h4>${ props.description }</h4>` : '' }
  <table>
    ${ props.caption ? `<caption>${ props.caption }</caption>` : '' }
    ${ headers }
    <tbody>${ body }</tbody>
  </table>`;
}
