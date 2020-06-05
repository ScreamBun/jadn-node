// JADN Schema Reader Base
import path from 'path';
import fs from 'fs-extra';

import { SchemaError } from '../../../exceptions';
import { Schema } from '../../../schema';

/**
  * @class ReaderBase
  * Base Schema Loader
  */
class ReaderBase {
  format: string

  constructor() {
    this.format = '';
  }

  /**
    * Load the schema file as a JADN schema
    * @param {string} fname -file to load schema from
    * @returns {Schema} JADN Schema
    */
  load(fname: string): Schema {
    fname = path.resolve(fname); // eslint-disable-line no-param-reassign
    if (fs.pathExistsSync(fname)) {
      return this.parse(fs.readJsonSync(fname));
    }
    throw new SchemaError(`Schema does not exist at ${fname}`);
  }

  /**
   * Loads the schema string to a JADN schema
   * @param {string} schema - schema string to load
   * @returns {Schema} JADN schema
   */
  loads(schema: string): Schema {
    return this.parse(schema);
  }

  /**
    * Parse the given schema to a JADN schema
    * @param {string} schema - schema to parse and load
    * @returns {Schema} JADN schema
    */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  parse(schema: string): Schema { // eslint-disable-line class-methods-use-this, no-unused-vars
    throw new ReferenceError(`${this} does not implement "parse"`);
  }
}

export default ReaderBase;