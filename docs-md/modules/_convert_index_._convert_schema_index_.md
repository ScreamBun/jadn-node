[jadnschema - v0.1.7](../globals.md) › ["convert/index"](_convert_index_.md) › ["convert/schema/index"](_convert_index_._convert_schema_index_.md)

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

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `format?`: [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md), `kwargs?`: Record‹string, any›): *void*

Defined in jadnschema/convert/schema/index.ts:36

Write the schema to a file in the specified format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | SchemaArg | JADN Schema to convert |
`fname` | string | file to create and write |
`source?` | string &#124; null | name of original schema file |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) | - |
`format?` | [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md) | - |
`kwargs?` | Record‹string, any› | extra field values for the function  |

**Returns:** *void*

___

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `format?`: [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md), `kwargs?`: Record‹string, any›): *string*

Defined in jadnschema/convert/schema/index.ts:55

Return the schema string in the specified format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | SchemaArg | JADN Schema to convert |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) | - |
`format?` | [SchemaFormats](../enums/_convert_index_._convert_schema_index_.schemaformats.md) | - |
`kwargs?` | Record‹string, any› | extra field values for the function |

**Returns:** *string*

- formatted schema

___

###  load

▸ **load**(`schema`: string, `format`: [SchemaFormats](../enums/schemaformats.md), `kwargs?`: Record‹string, any›): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:74

Load the schema file from the specified format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string | Schema to load |
`format` | [SchemaFormats](../enums/schemaformats.md) | - |
`kwargs?` | Record‹string, any› | extra field values for the function |

**Returns:** *[Schema](../classes/schema.md)*

- loaded schema

___

###  loads

▸ **loads**(`schema`: string, `format`: [SchemaFormats](../enums/schemaformats.md), `kwargs`: Record‹string, any›): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:91

Load the schema string from the specified format

**`return:`** loaded JADN schema

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string | Schema to load |
`format` | [SchemaFormats](../enums/schemaformats.md) | - |
`kwargs` | Record‹string, any› | extra field values for the function |

**Returns:** *[Schema](../classes/schema.md)*

## Object literals

### `Const` html

### ▪ **html**: *object*

Defined in jadnschema/convert/schema/index.ts:104

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *void*

Defined in jadnschema/convert/schema/index.ts:107

Converts to HTML tables and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *string*

Defined in jadnschema/convert/schema/index.ts:110

Converts to HTML tables and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *string*

___

### `Const` jadn

### ▪ **jadn**: *object*

Defined in jadnschema/convert/schema/index.ts:116

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *void*

Defined in jadnschema/convert/schema/index.ts:119

Converts to JADN format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *string*

Defined in jadnschema/convert/schema/index.ts:122

Converts to JADN format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *string*

###  load

▸ **load**(`schema`: string, `kwargs?`: Record‹string, any›): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:125

Loads the JADN formated schema file, see [load](_convert_index_._convert_schema_index_.md#load) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | string |
`kwargs?` | Record‹string, any› |

**Returns:** *[Schema](../classes/schema.md)*

###  loads

▸ **loads**(`schema`: string, `kwargs?`: Record‹string, any›): *[Schema](../classes/schema.md)*

Defined in jadnschema/convert/schema/index.ts:128

Loads the JADN formated schema string, see [loads](_convert_index_._convert_schema_index_.md#loads) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | string |
`kwargs?` | Record‹string, any› |

**Returns:** *[Schema](../classes/schema.md)*

___

### `Const` jidl

### ▪ **jidl**: *object*

Defined in jadnschema/convert/schema/index.ts:134

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *void*

Defined in jadnschema/convert/schema/index.ts:137

Converts to JIDL format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *string*

Defined in jadnschema/convert/schema/index.ts:140

Converts to JADN format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *string*

___

### `Const` json

### ▪ **json**: *object*

Defined in jadnschema/convert/schema/index.ts:146

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *void*

Defined in jadnschema/convert/schema/index.ts:149

Converts to JSON format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *string*

Defined in jadnschema/convert/schema/index.ts:152

Converts to JSON format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *string*

___

### `Const` md

### ▪ **md**: *object*

Defined in jadnschema/convert/schema/index.ts:157

###  dump

▸ **dump**(`schema`: SchemaArg, `fname`: string, `source?`: string | null, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *void*

Defined in jadnschema/convert/schema/index.ts:160

Converts to JSON format and writes to the given file, see [dump](_convert_index_._convert_schema_index_.md#dump) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`fname` | string |
`source?` | string &#124; null |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *void*

###  dumps

▸ **dumps**(`schema`: SchemaArg, `comment?`: [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md), `kwargs?`: Record‹string, any›): *string*

Defined in jadnschema/convert/schema/index.ts:163

Converts to MarkDown format and returns the string value, see [dumps](_convert_index_._convert_schema_index_.md#dumps) for param specifics

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaArg |
`comment?` | [CommentLevels](../enums/_convert_index_._convert_schema_index_.commentlevels.md) |
`kwargs?` | Record‹string, any› |

**Returns:** *string*
