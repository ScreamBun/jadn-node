[jadnschema - v0.1.8](../globals.md) › ["jadn"](_jadn_.md)

# Module: "jadn"

## Index

### Functions

* [analyze](_jadn_.md#analyze)
* [checkSchema](_jadn_.md#checkschema)
* [dump](_jadn_.md#dump)
* [dumps](_jadn_.md#dumps)
* [load](_jadn_.md#load)
* [loads](_jadn_.md#loads)
* [strip](_jadn_.md#strip)

## Functions

###  analyze

▸ **analyze**(`schema`: SchemaSimpleJADN | [Schema](../classes/schema.md)): *Record‹string, string | Array‹string››*

Defined in jadnschema/jadn.ts:65

Analyze the given schema for unreferenced and undefined types

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | SchemaSimpleJADN &#124; [Schema](../classes/schema.md) | Schema to analyse |

**Returns:** *Record‹string, string | Array‹string››*

analysis results

___

###  checkSchema

▸ **checkSchema**(`schema`: string | SchemaSimpleJADN): *[Schema](../classes/schema.md)*

Defined in jadnschema/jadn.ts:21

Validate JADN structure against JSON schema,
Validate JADN structure against JADN schema, then
Perform additional checks on type definitions

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string &#124; SchemaSimpleJADN | Schema to check |

**Returns:** *[Schema](../classes/schema.md)*

validated schema object

___

###  dump

▸ **dump**(`schema`: [Schema](../classes/schema.md), `fname`: string, `indent`: number, `comments`: boolean): *void*

Defined in jadnschema/jadn.ts:102

Write the JADN to a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | [Schema](../classes/schema.md) | Schema to write |
`fname` | string | File to write to |
`indent` | number | Spaces to indent |
`comments` | boolean | Strip comments from schema |

**Returns:** *void*

___

###  dumps

▸ **dumps**(`schema`: [Schema](../classes/schema.md), `indent`: number, `comments`: boolean): *string*

Defined in jadnschema/jadn.ts:119

Properly stringify a JADN schema

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | [Schema](../classes/schema.md) | Schema to format |
`indent` | number | Spaces to indent |
`comments` | boolean | Strip comments from schema |

**Returns:** *string*

Formatted JADN schema as string

___

###  load

▸ **load**(`fname`: string): *[Schema](../classes/schema.md)*

Defined in jadnschema/jadn.ts:76

Load a JADN schema from a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`fname` | string | JADN schema file to load |

**Returns:** *[Schema](../classes/schema.md)*

Loaded schema

___

###  loads

▸ **loads**(`schema`: string): *[Schema](../classes/schema.md)*

Defined in jadnschema/jadn.ts:88

load a JADN schema from a string

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string | JADN schema to load |

**Returns:** *[Schema](../classes/schema.md)*

Loaded schema

___

###  strip

▸ **strip**(`schema`: [Schema](../classes/schema.md)): *[Schema](../classes/schema.md)*

Defined in jadnschema/jadn.ts:54

Strip comments from schema

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | [Schema](../classes/schema.md) | Schema to strip comments |

**Returns:** *[Schema](../classes/schema.md)*

comment stripped JADN schema
