// JADN Interfaces
// import Resolver from './resolver';
import { SchemaSimpleType, SchemaObjectType } from './definitions/interfaces';
import { GeneralValidator, UnsignedValidator } from './formats';

// Schema Definitions
export interface SchemaConfigJADN {
  MaxBinary?: number;
  MaxString?: number;
  MaxElements?: number;
  FS?: string;
  Sys?: string;
  TypeName?: string;
  FieldName?: string;
  NSID?: string;
}

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
  config?: SchemaConfigJADN;
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

/*
// Resolver options
export interface SchemaKwargs {
  resolveDir?: string;
  resolver?: Resolver;
}
*/

// Config Object
export interface SchemaConfig {
  // Base JADN
  info: {
    package: string;
    version?: string;
    title?: string;
    description?: string;
    comment?: string;
    copyright?: string;
    license?: string;
    imports?: Record<string, string>;
    exports?: Array<string>;
    config: {
      MaxBinary: number;
      MaxString: number;
      MaxElements: number;
      FS: string;
      Sys: string;
      TypeName: RegExp;
      FieldName: RegExp;
      NSID: RegExp;
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  types: Record<string, any>; // Record<string, DefinitionBase>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  derived: Record<string, any>; // Record<string, DefinitionBase>;
  validationFormats: Record<string, GeneralValidator|UnsignedValidator>
}
