// JADN Type Interfaces
import Options from '../options';

// Fields Types
// Simple Fields
// id, value, description
export type SchemaSimpleEnumField = [number, number|string, string];

// id, name, type, options, description
export type SchemaSimpleGenField = [number, string, string, string[], string];

export type SchemaSimpleField = SchemaSimpleEnumField|SchemaSimpleGenField;

// Object Fields
export interface SchemaObjectEnumField {
  id: number;
  value: number|string;
  description: string;
}

export interface SchemaObjectGenField {
  id: number;
  name: string;
  type: string;
  options: Options;
  description: string;
}

export type SchemaObjectField = SchemaObjectEnumField|SchemaObjectGenField;

// Type Definitions
export type SchemaSimpleType = [string, string, string[], string, Array<SchemaSimpleField>];
export interface SchemaObjectType {
  name: string;
  type: string;
  options: Options;
  description: string;
  fields: Array<SchemaObjectField>;
}
