// JADN Interfaces
import Resolver from './resolver';
 import {
  SchemaSimpleType, SchemaObjectType
 } from './definitions/interfaces';

// Schema Definitions
export interface SchemaInfoJADN {
  package: string;
  version?: string;
  title?: string;
  description?: string;
  comment?: string;
  copyright?: string;
  license?: string;
  imports?: Record<string, string>;
  exports?: Array<string>;
  config?: Record<string, number|string>;
}

export interface SchemaJADN {
  info?: SchemaInfoJADN;
  types: Array<SchemaSimpleType|SchemaObjectType>;
}

export interface SchemaSimpleJADN extends SchemaJADN {
  types: Array<SchemaSimpleType>;
}

export interface SchemaObjectJADN extends SchemaJADN {
  types: Array<SchemaObjectType>;
}

export interface SchemaKwargs {
  resolveDir?: string;
  resolver?: Resolver;
}