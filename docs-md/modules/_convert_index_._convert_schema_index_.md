[jadnschema - v0.1.9](../globals.md) › ["convert/index"](_convert_index_.md) › ["convert/schema/index"](_convert_index_._convert_schema_index_.md)

# Module: "convert/schema/index"

## Index

### Enumerations

* [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md)
* [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md)

### Functions

* [dump](_convert_index_._convert_schema_index_.md#dump)
* [dumps](_convert_index_._convert_schema_index_.md#dumps)
* [load](_convert_index_._convert_schema_index_.md#load)
* [loads](_convert_index_._convert_schema_index_.md#loads)

### Object literals

* [html](_convert_index_._convert_schema_index_.md#const-html)
* [jadn](_convert_index_._convert_schema_index_.md#const-jadn)
* [jidl](_convert_index_._convert_schema_index_.md#const-jidl)
* [json](_convert_index_._convert_schema_index_.md#const-json)
* [md](_convert_index_._convert_schema_index_.md#const-md)

## Functions

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `format?`: [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md), `kwargs?`: DumpArgs): *void*

Defined in jadnschema/convert/schema/index.ts:40

Write the schema to a file in the specified format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | SchemaArg | JADN Schema to convert |
`fname` | string | file to create and write |
`source?` | string &#124; null | name of original schema file |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) | - |
`format?` | [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md) | - |
`kwargs?` | DumpArgs | extra field values for the function  |

**Returns:** *void*

___

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `format?`: [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md), `kwargs?`: DumpArgs): *string*

Defined in jadnschema/convert/schema/index.ts:57

Return the schema string in the specified format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | SchemaArg | JADN Schema to convert |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) | - |
`format?` | [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md) | - |
`kwargs?` | DumpArgs | extra field values for the function |

**Returns:** *string*

- formatted schema

___

###  load

▸ **load**(`schema`: string, `format`: [SchemaFormats](../enums/schemaformats.md), `kwargs?`: LoadArgs): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:74

Load the schema file from the specified format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string | Schema to load |
`format` | [SchemaFormats](../enums/schemaformats.md) | - |
`kwargs?` | LoadArgs | extra field values for the function |

**Returns:** *[Schema](../classes/schema.md)*

- loaded schema

___

###  loads

▸ **loads**(`schema`: string, `format`: [SchemaFormats](../enums/schemaformats.md), `kwargs`: LoadArgs): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:90

Load the schema string from the specified format

**`return:`** loaded JADN schema

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string | Schema to load |
`format` | [SchemaFormats](../enums/schemaformats.md) | - |
`kwargs` | LoadArgs | extra field values for the function |

**Returns:** *[Schema](../classes/schema.md)*

## Object literals

### `Const` html

### ▪ **html**: *object*

Defined in jadnschema/convert/schema/index.ts:103

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *void*

Defined in jadnschema/convert/schema/index.ts:106

Converts to HTML tables and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *string*

Defined in jadnschema/convert/schema/index.ts:108

Converts to HTML tables and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *string*

___

### `Const` jadn

### ▪ **jadn**: *object*

Defined in jadnschema/convert/schema/index.ts:114

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *void*

Defined in jadnschema/convert/schema/index.ts:117

Converts to JADN format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *string*

Defined in jadnschema/convert/schema/index.ts:119

Converts to JADN format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *string*

###  load

▸ **load**(`schema`: string, `kwargs?`: LoadArgs): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:121

Loads the JADN formated schema file, see [load](_convert_index_._convert_schema_index_.md#load) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | string |
`kwargs?` | LoadArgs |

**Returns:** *[Schema](../classes/schema.md)*

###  loads

▸ **loads**(`schema`: string, `kwargs?`: LoadArgs): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:123

Loads the JADN formated schema string, see [loads](_convert_index_._convert_schema_index_.md#loads) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | string |
`kwargs?` | LoadArgs |

**Returns:** *[Schema](../classes/schema.md)*

___

### `Const` jidl

### ▪ **jidl**: *object*

Defined in jadnschema/convert/schema/index.ts:129

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *void*

Defined in jadnschema/convert/schema/index.ts:132

Converts to JIDL format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *string*

Defined in jadnschema/convert/schema/index.ts:134

Converts to JADN format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *string*

___

### `Const` json

### ▪ **json**: *object*

Defined in jadnschema/convert/schema/index.ts:140

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *void*

Defined in jadnschema/convert/schema/index.ts:143

Converts to JSON format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *string*

Defined in jadnschema/convert/schema/index.ts:145

Converts to JSON format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *string*

___

### `Const` md

### ▪ **md**: *object*

Defined in jadnschema/convert/schema/index.ts:150

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *void*

Defined in jadnschema/convert/schema/index.ts:153

Converts to JSON format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: DumpArgs): *string*

Defined in jadnschema/convert/schema/index.ts:156

Converts to MarkDown format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | DumpArgs |

**Returns:** *string*
