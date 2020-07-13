// JADN Interfaces
 import {
  SchemaSimpleType, SchemaSimpleComplexType, SchemaObjectType, SchemaObjectComplexType
 } from './definitions/interfaces';

// Schema Definitions
export interface SchemaMetaJADN {
  module: string;
  patch?: string;
  title?: string;
  description?: string;
  imports?: Record<string, string>;
  exports?: Array<string>;
  config?: Record<string, number|string>;
}

export interface SchemaJADN {
  meta: SchemaMetaJADN;
  types: Array<SchemaSimpleType|SchemaSimpleComplexType|SchemaObjectType|SchemaObjectComplexType>;
}

export interface SchemaSimpleJADN extends SchemaJADN {
  types: Array<SchemaSimpleType|SchemaSimpleComplexType>;
}

export interface SchemaObjectJADN extends SchemaJADN {
  types: Array<SchemaObjectType|SchemaObjectComplexType>;
}