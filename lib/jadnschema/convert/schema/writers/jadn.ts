/* eslint @typescript-eslint/camelcase: 0 */
// JADN to JADN
import fs from 'fs-extra';

import WriterBase from './base';
import { CommentLevels } from '../enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>


class JADNtoJADN extends WriterBase {
  format = 'jadn';

  /**
    * Produce JADN schema from JADN schema and write to file provided
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
    * Converts the JADN schema to JADN
    * @param {Args} kwargs - extra field values for the function
    * @return {string} - JADN schema
    */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
   dumps(kwargs?: Args): string {  // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
    return this.schema.schemaPretty(this.comments === CommentLevels.NONE);
   }
}

export default JADNtoJADN;