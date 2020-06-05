/*
 * Basic JADN functions
 * load, dump, format, validate
 */
/*
from io import BufferedIOBase, TextIOBase
from typing import ( Dict, Set, Union )
from . import schema as jadn_schema
*/
import { SchemaSimpleJADN } from './schema/interfaces';
import { Schema } from './schema';

/**
 * Validate JADN structure against JSON schema,
 * Validate JADN structure against JADN schema, then
 * Perform additional checks on type definitions
 * @param {string|SchemaSimpleJADN} schema - Schema to check
 * @returns {Schema} validated schema object
 * @public
 */
export function checkSchema(schema: string|SchemaSimpleJADN): Schema {
  const schemaObj = new Schema();

  if (typeof schema === 'object') {
    schemaObj.loads(schema);
  } else if (typeof schema === 'string') {
    // TODO: Check if file of schema as string
  }
  /*
    elif isinstance(schema, str):
        if schema.endswith('.jadn'):
            schemaObj.load(schema)
        else:
            schemaObj.loads(schema)

    errors = schemaObj.verify_schema(silent=True)
    if errors:
        raise Exception(errors)

    for k, v in schemaObj.analyze().items():
        print(f'{k}: {v}')

    return schemaObj
    */
  return schemaObj;
}

/**
 * Strip comments from schema
 * @param {Schema} schema - Schema to strip comments
 * @returns {Schema} comment stripped JADN schema
 * @public
 */
export function strip(schema: Schema): Schema {
  const schemaObj = new Schema(schema);
  return schemaObj;  // .schema(strip=true);
}

/**
 * Analyze the given schema for unreferenced and undefined types
 * @param {SchemaSimpleJADN|Schema} schema - Schema to analyse
 * @returns {Record<string, string|Array<string>>} analysis results
 * @public
 */
export function analyze(schema: SchemaSimpleJADN|Schema): Record<string, string|Array<string>> {
  const schemaObj = new Schema(schema);
  return schemaObj.analyze();
}

/**
 * Load a JADN schema from a file
 * @param {string} fname - JADN schema file to load
 * @returns {Schema} Loaded schema
 * @public
 */
export function load(fname: string): Schema {
  const schemaObj = new Schema();
  schemaObj.load(fname);
  return schemaObj;
}

/**
 * load a JADN schema from a string
 * @param {string} schema - JADN schema to load
 * @returns {Schema} Loaded schema
 * @public
 */
export function loads(schema: string): Schema {
  const schemaObj = new Schema();
  schemaObj.loads(schema);
  return schemaObj;
}

/**
 * Write the JADN to a file
 * @param {Schema} schema - Schema to write
 * @param {string} fname - File to write to
 * @param {number} indent - Spaces to indent
 * @param {bool} comments - Strip comments from schema
 * @public
 */
export function dump(schema: Schema, fname: string, indent: number, comments: boolean): void {
  // eslint-disable-next-line no-param-reassign
  indent = indent || 2;
  // eslint-disable-next-line no-param-reassign
  comments = comments || false;
  const schemaObj = new Schema(schema);
  schemaObj.dump(fname, indent, comments);
}

/**
 * Properly stringify a JADN schema
 * @param {Schema} schema - Schema to format
 * @param {number} indent - Spaces to indent
 * @param {bool} comments - Strip comments from schema
 * @returns {string} Formatted JADN schema as string
 * @public
 */
export function dumps(schema: Schema, indent: number, comments: boolean): string {
  // eslint-disable-next-line no-param-reassign
  indent = indent || 2;
  // eslint-disable-next-line no-param-reassign
  comments = comments || false;
  const schemaObj = new Schema(schema);
  return schemaObj.dumps(indent, comments);
}
