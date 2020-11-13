// JADN Schema Reader Base
import path from 'path';
import fs from 'fs-extra';

import { SchemaError } from '../../../exceptions';
import Schema from '../../../schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoadArgs = Record<string, any>;

/**
  * @class ReaderBase
  * Base Schema Loader
  */
class ReaderBase {
  format = '';

  /**
    * Load the schema file as a JADN schema
    * @param {string} fname -file to load schema from
    * @param {LoadArgs} kwargs - extra field values for the function
    * @returns {Schema} JADN Schema
    */
  load(fname: string, kwargs?: LoadArgs): Schema {
    fname = path.resolve(fname); // eslint-disable-line no-param-reassign
    if (fs.pathExistsSync(fname)) {
      return this.parse(fs.readJsonSync(fname), kwargs);
    }
    throw new SchemaError(`Schema does not exist at ${fname}`);
  }

  /**
    * Loads the schema string to a JADN schema
    * @param {string} schema - schema string to load
    * @param {LoadArgs} kwargs - extra field values for the function
    * @returns {Schema} JADN schema
    */
  loads(schema: string, kwargs?: LoadArgs): Schema {
    return this.parse(schema, kwargs);
  }

  /**
    * Parse the given schema to a JADN schema
    * @param {string} schema - schema to parse and load
    * @param {LoadArgs} kwargs - extra field values for the function
    * @returns {Schema} JADN schema
    */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  parse(schema: string, kwargs?: LoadArgs): Schema { // eslint-disable-line class-methods-use-this, no-unused-vars, @typescript-eslint/no-unused-vars
    throw new ReferenceError(`${ this.constructor.name } does not implement "parse"`);
  }
}

export default ReaderBase;