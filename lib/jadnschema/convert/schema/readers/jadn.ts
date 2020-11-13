// JADN to JADN
import ReaderBase from './base';
import Schema from '../../../schema';


class JADNtoJADN extends ReaderBase {
  format = 'jadn';

  /**
    * Parse the given schema to a JADN schema
    * @param {string} schema - schema to parse and load
    * @returns {Schema} JADN schema
    */
  // eslint-disable-next-line class-methods-use-this
  parse(schema: string): Schema {
    const schemaObj = new Schema();
    schemaObj.loads(schema);
    return schemaObj;
  }
}

export default JADNtoJADN;