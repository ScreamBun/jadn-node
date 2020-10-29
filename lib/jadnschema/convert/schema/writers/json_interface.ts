// JADN Conversion Interfaces

type PrimitiveTypes = 'array'|'boolean'|'number'|'null'|'object'|'string';

export interface PrimitiveDefinition {
  title: string;
  type?: PrimitiveTypes;
  $ref?: string;
  description?: string;
  format?: string;
}

export interface TypeDefinition {
  title: string;
  type: PrimitiveTypes;
  description?: string;
  additionalProperties?: boolean;

  // Array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: Array<string>|Record<string, any>;

  // Enumerated
  enum?: Array<number|string>;

  // Fields
  minProperties?: number;
  maxProperties?: number;
  required?: Array<string>;
  properties?: Record<string, PrimitiveDefinition>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patternProperty?: Record<string, any>;
}

export interface Meta {
  $schema: string;
  $id: string;
  title: string;
  description?: string;
}

export interface Export {
  $ref: string;
  description?: string;
}

export interface RootProperties {
  [key: string]: Export
}

export interface Schema extends Meta {
  type: 'object';
  oneOf?: Array<Export>;
  properties?: RootProperties;
  definitions: Record<string, TypeDefinition>;
}