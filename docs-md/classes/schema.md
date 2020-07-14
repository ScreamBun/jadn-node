[jadnschema - v0.1.7](../globals.md) › [Schema](schema.md)

# Class: Schema

## Hierarchy

* BaseModel

  ↳ **Schema**

## Index

### Constructors

* [constructor](schema.md#constructor)

### Properties

* [definitionOrder](schema.md#protected-definitionorder)
* [derived](schema.md#derived)
* [meta](schema.md#meta)
* [schemaTypes](schema.md#protected-schematypes)
* [slots](schema.md#slots)
* [types](schema.md#types)
* [validators](schema.md#protected-validators)

### Accessors

* [formats](schema.md#formats)
* [validationFormats](schema.md#validationformats)

### Methods

* [_config](schema.md#protected-_config)
* [_convertTypes](schema.md#_converttypes)
* [_dumps](schema.md#_dumps)
* [_getConfig](schema.md#_getconfig)
* [_setSchema](schema.md#_setschema)
* [addFormat](schema.md#addformat)
* [analyze](schema.md#analyze)
* [dependencies](schema.md#dependencies)
* [dump](schema.md#dump)
* [dumps](schema.md#dumps)
* [get](schema.md#get)
* [initData](schema.md#initdata)
* [load](schema.md#load)
* [loads](schema.md#loads)
* [object](schema.md#object)
* [schema](schema.md#schema)
* [schemaPretty](schema.md#schemapretty)
* [setProperties](schema.md#setproperties)
* [simplify](schema.md#simplify)
* [toString](schema.md#tostring)
* [validate](schema.md#validate)
* [validateAs](schema.md#validateas)
* [verifySchema](schema.md#verifyschema)

### Object literals

* [jadnTypes](schema.md#protected-jadntypes)

## Constructors

###  constructor

\+ **new Schema**(`schema?`: SchemaSimpleJADN | [Schema](schema.md), `kwargs?`: Record‹string, any›): *[Schema](schema.md)*

*Overrides void*

Defined in jadnschema/schema/schema.ts:41

Initialize a Schema object

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema?` | SchemaSimpleJADN &#124; [Schema](schema.md) | The JADN schema to utilize |
`kwargs?` | Record‹string, any› | extra field values for the class  |

**Returns:** *[Schema](schema.md)*

## Properties

### `Protected` definitionOrder

• **definitionOrder**: *Array‹string›* = ['OpenC2-Command', 'OpenC2-Response', 'Action', 'Target', 'Actuator', 'Args', 'Status-Code',
    'Results', 'Artifact', 'Device', 'Domain-Name', 'Email-Addr', 'Features', 'File', 'IDN-Domain-Name', 'IDN-Email-Addr',
    'IPv4-Net', 'IPv4-Connection', 'IPv6-Net', 'IPv6-Connection', 'IRI', 'MAC-Addr', 'Process', 'Properties', 'URI',
    'Action-Targets', 'Targets', 'Date-Time', 'Duration', 'Feature', 'Hashes', 'Hostname', 'IDN-Hostname', 'IPv4-Addr',
    'IPv6-Addr', 'L4-Protocol', 'Message-Type', 'Nsid', 'Payload', 'Port', 'Response-Type', 'Versions', 'Version',
    'Profiles', 'Rate-Limit', 'Binary', 'Command-ID']

Defined in jadnschema/schema/schema.ts:36

___

###  derived

• **derived**: *Record‹string, DefinitionBase›*

Defined in jadnschema/schema/schema.ts:33

___

###  meta

• **meta**: *Meta*

Defined in jadnschema/schema/schema.ts:28

___

### `Protected` schemaTypes

• **schemaTypes**: *Set‹string›*

*Overrides void*

Defined in jadnschema/schema/schema.ts:34

___

###  slots

• **slots**: *Array‹string›* = ['meta', 'types']

*Overrides void*

Defined in jadnschema/schema/schema.ts:32

___

###  types

• **types**: *Record‹string, DefinitionBase›*

Defined in jadnschema/schema/schema.ts:29

___

### `Protected` validators

• **validators**: *Record‹string, GeneralValidator | UnsignedValidator›* = ValidationFormats

Defined in jadnschema/schema/schema.ts:35

## Accessors

###  formats

• **get formats**(): *Array‹string›*

Defined in jadnschema/schema/schema.ts:72

**Returns:** *Array‹string›*

___

###  validationFormats

• **get validationFormats**(): *Record‹string, GeneralValidator | UnsignedValidator›*

Defined in jadnschema/schema/schema.ts:76

**Returns:** *Record‹string, GeneralValidator | UnsignedValidator›*

## Methods

### `Protected` _config

▸ **_config**(): *[Schema](schema.md)‹›*

*Inherited from [Schema](schema.md).[_config](schema.md#protected-_config)*

Defined in jadnschema/schema/base.ts:104

**Returns:** *[Schema](schema.md)‹›*

___

###  _convertTypes

▸ **_convertTypes**(`schema`: SchemaJADN): *SchemaJADN*

Defined in jadnschema/schema/schema.ts:596

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaJADN |

**Returns:** *SchemaJADN*

___

###  _dumps

▸ **_dumps**(`obj`: any, `indent?`: undefined | number, `level?`: undefined | number): *string*

Defined in jadnschema/schema/schema.ts:539

Properly format a JADN schema

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | any | Schema to format |
`indent?` | undefined &#124; number | spaces to indent |
`level?` | undefined &#124; number | current indent level |

**Returns:** *string*

Formatted JADN schema

___

###  _getConfig

▸ **_getConfig**(): *[Schema](schema.md)*

Defined in jadnschema/schema/schema.ts:493

**Returns:** *[Schema](schema.md)*

___

###  _setSchema

▸ **_setSchema**(`data`: SchemaSimpleJADN | [Schema](schema.md)): *void*

Defined in jadnschema/schema/schema.ts:502

Set the Schema object with the given data

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data` | SchemaSimpleJADN &#124; [Schema](schema.md) | data to set schema object  |

**Returns:** *void*

___

###  addFormat

▸ **addFormat**(`fmt`: string, `fun`: GeneralValidator | UnsignedValidator, `override?`: undefined | false | true): *void*

Defined in jadnschema/schema/schema.ts:585

Add a format validation function

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`fmt` | string | -format to validate |
`fun` | GeneralValidator &#124; UnsignedValidator | function that performs the validation |
`override?` | undefined &#124; false &#124; true | override the format if it exists  |

**Returns:** *void*

___

###  analyze

▸ **analyze**(): *Record‹string, string | Array‹string››*

Defined in jadnschema/schema/schema.ts:84

Analyze the given schema for unreferenced and undefined types

**Returns:** *Record‹string, string | Array‹string››*

analysis results

___

###  dependencies

▸ **dependencies**(): *Record‹string, Set‹string››*

Defined in jadnschema/schema/schema.ts:104

Determine the dependencies for each type within the schema

**Returns:** *Record‹string, Set‹string››*

record of dependencies

___

###  dump

▸ **dump**(`fname`: string, `indent?`: undefined | number, `strip?`: undefined | false | true): *void*

Defined in jadnschema/schema/schema.ts:382

Write the JADN to a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`fname` | string | file to write to |
`indent?` | undefined &#124; number | spaces to indent |
`strip?` | undefined &#124; false &#124; true | strip comments from schema  |

**Returns:** *void*

___

###  dumps

▸ **dumps**(`indent?`: undefined | number, `strip?`: undefined | false | true): *string*

Defined in jadnschema/schema/schema.ts:394

Properly format a JADN schema to a string

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`indent?` | undefined &#124; number | spaces to indent |
`strip?` | undefined &#124; false &#124; true | strip comments from schema |

**Returns:** *string*

Formatted JADN schema string

___

###  get

▸ **get**(`attr`: string, `def?`: any): *any*

*Inherited from [Schema](schema.md).[get](schema.md#get)*

Defined in jadnschema/schema/base.ts:207

Replicates Python dictionary get method

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`attr` | string | Attribute to get the value |
`def?` | any | Default value if attribute does not exist |

**Returns:** *any*

value of attribute/default - Null

___

###  initData

▸ **initData**(`data?`: SchemaSimpleJADN | SchemaSimpleType | BaseModel | Record‹string, any›): *Record‹string, any›*

*Inherited from [Schema](schema.md).[initData](schema.md#initdata)*

Defined in jadnschema/schema/base.ts:165

Initialize base data

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data?` | SchemaSimpleJADN &#124; SchemaSimpleType &#124; BaseModel &#124; Record‹string, any› | Base data |

**Returns:** *Record‹string, any›*

- initialized data

___

###  load

▸ **load**(`fname`: string): *void*

Defined in jadnschema/schema/schema.ts:350

Load a JADN schema from a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`fname` | string | JADN schema file to load  |

**Returns:** *void*

___

###  loads

▸ **loads**(`schema`: string | SchemaSimpleJADN): *void*

Defined in jadnschema/schema/schema.ts:363

Load a JADN schema from a string or object

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`schema` | string &#124; SchemaSimpleJADN | JADN schema string to load  |

**Returns:** *void*

___

###  object

▸ **object**(): *Record‹string, any›*

*Inherited from [Schema](schema.md).[object](schema.md#object)*

Defined in jadnschema/schema/base.ts:174

Create a dictionary of the current object

**Returns:** *Record‹string, any›*

simple object (key/value) of the object

___

###  schema

▸ **schema**(`strip?`: undefined | false | true): *SchemaSimpleJADN*

Defined in jadnschema/schema/schema.ts:132

Format this schema into valid JADN format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`strip?` | undefined &#124; false &#124; true | strip comments from schema |

**Returns:** *SchemaSimpleJADN*

Schema as simple object

___

###  schemaPretty

▸ **schemaPretty**(`strip?`: undefined | false | true, `indent?`: undefined | number): *string*

Defined in jadnschema/schema/schema.ts:155

Format this schema into valid pretty JADN format

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`strip?` | undefined &#124; false &#124; true | strip comments from schema |
`indent?` | undefined &#124; number | number of spaces to indent |

**Returns:** *string*

JADN pretty formatted schema string

___

###  setProperties

▸ **setProperties**(`props`: Record‹string, any›): *void*

*Inherited from [Schema](schema.md).[setProperties](schema.md#setproperties)*

Defined in jadnschema/schema/base.ts:189

Set the given key/value pairs as properties of the current class

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`props` | Record‹string, any› | key/value pairs to set  |

**Returns:** *void*

___

###  simplify

▸ **simplify**(`simple?`: undefined | false | true, `schema?`: SchemaSimpleJADN, `anon?`: undefined | false | true, `multi?`: undefined | false | true, `derived?`: undefined | false | true, `mapOf?`: undefined | false | true): *SchemaSimpleJADN | [Schema](schema.md)*

Defined in jadnschema/schema/schema.ts:171

Given a schema, return a simplified schema with schema extensions removed

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`simple?` | undefined &#124; false &#124; true | return a simple type (SchemaSimpleJADN) instead of an object (Schema) |
`schema?` | SchemaSimpleJADN | JADN schema to simplify |
`anon?` | undefined &#124; false &#124; true | Replace all anonymous type definitions with explicit |
`multi?` | undefined &#124; false &#124; true | Replace all multiple-value fields with explicit ArrayOf type definitions |
`derived?` | undefined &#124; false &#124; true | Replace all derived enumerations with explicit Enumerated type definitions |
`mapOf?` | undefined &#124; false &#124; true | Replace all MapOf types with listed keys with explicit Map type definitions |

**Returns:** *SchemaSimpleJADN | [Schema](schema.md)*

Simplified schema

___

###  toString

▸ **toString**(): *string*

Defined in jadnschema/schema/schema.ts:64

**Returns:** *string*

___

###  validate

▸ **validate**(`inst`: Record‹string, any›, `silent?`: undefined | false | true): *null | Error*

Defined in jadnschema/schema/schema.ts:443

Verify the given instance against the current schema

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`inst` | Record‹string, any› | instance message to validata |
`silent?` | undefined &#124; false &#124; true | raise or return errors |

**Returns:** *null | Error*

List of errors raises

___

###  validateAs

▸ **validateAs**(`inst`: Record‹string, any›, `type`: string, `silent?`: undefined | false | true): *Array‹Error›*

Defined in jadnschema/schema/schema.ts:470

Verify the given instance against the current schema as a specific exported type

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`inst` | Record‹string, any› | instance message to validata |
`type` | string | exported name to validate as |
`silent?` | undefined &#124; false &#124; true | raise or return errors |

**Returns:** *Array‹Error›*

List of errors raises

___

###  verifySchema

▸ **verifySchema**(`silent?`: undefined | false | true): *void | Array‹Error›*

Defined in jadnschema/schema/schema.ts:406

Verify the schema is proper

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`silent?` | undefined &#124; false &#124; true | raise or return errors |

**Returns:** *void | Array‹Error›*

List of errors raises

## Object literals

### `Protected` jadnTypes

### ▪ **jadnTypes**: *object*

*Inherited from [Schema](schema.md).[jadnTypes](schema.md#protected-jadntypes)*

Defined in jadnschema/schema/base.ts:105

###  Compound

• **Compound**: *string[]* = [
      // Ordered list of labeled fields with positionally - defined semantics.Each field has a position, label, and type
      'Array',
      // Ordered list of fields with the same semantics.Each field has a position and type vtype
      'ArrayOf',
      // Unordered map from a set of specified keys to values with semantics bound to each key.Each key has an id and name or label, and is mapped to a type
      'Map',
      // Unordered map from a set of keys of the same type to values with the same semantics.Each key has key type ktype, and is mapped to value type vtype
      'MapOf',
      // Ordered map from a list of keys with positions to values with positionally - defined semantics.Each key has a position and name, and is mapped to a type.Represents a row in a spreadsheet or database table
      'Record'
    ]

Defined in jadnschema/schema/base.ts:126

###  Selector

• **Selector**: *string[]* = [
      // One key and value selected from a set of named or labeled fields.The key has an id and name or label, and is mapped to a type
      'Choice',
      // One value selected from a set of named or labeled integers
      'Enumerated'
    ]

Defined in jadnschema/schema/base.ts:120

###  Simple

• **Simple**: *string[]* = [
      // Sequence of octets.Length is the number of octets
      'Binary',
      // Element with one of two values: true or false
      'Boolean',
      // Positive or negative whole number
      'Integer',
      // Real number
      'Number',
      // Unspecified or non - existent value
      'Null',
      // Sequence of characters, each of which has a Unicode codepoint.Length is the number of characters
      'String'
      ]

Defined in jadnschema/schema/base.ts:106
