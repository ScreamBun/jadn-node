[jadnschema - v0.1.9](../globals.md) › [Schema](schema.md)

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
* [info](schema.md#info)
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

## Constructors

###  constructor

\+ **new Schema**(`schema?`: SchemaSimpleJADN | [Schema](schema.md), `kwargs?`: Record‹string, any›): *[Schema](schema.md)*

*Overrides void*

Defined in jadnschema/schema/schema.ts:42

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

Defined in jadnschema/schema/schema.ts:37

___

###  derived

• **derived**: *Record‹string, DefinitionBase›*

Defined in jadnschema/schema/schema.ts:34

___

###  info

• **info**: *Info*

Defined in jadnschema/schema/schema.ts:29

___

### `Protected` schemaTypes

• **schemaTypes**: *Set‹string›*

*Overrides void*

Defined in jadnschema/schema/schema.ts:35

___

###  slots

• **slots**: *Array‹string›* = ['info', 'types']

*Overrides void*

Defined in jadnschema/schema/schema.ts:33

___

###  types

• **types**: *Record‹string, DefinitionBase›*

Defined in jadnschema/schema/schema.ts:30

___

### `Protected` validators

• **validators**: *Record‹string, GeneralValidator | UnsignedValidator›* = ValidationFormats

Defined in jadnschema/schema/schema.ts:36

## Accessors

###  formats

• **get formats**(): *Array‹string›*

Defined in jadnschema/schema/schema.ts:73

**Returns:** *Array‹string›*

___

###  validationFormats

• **get validationFormats**(): *Record‹string, GeneralValidator | UnsignedValidator›*

Defined in jadnschema/schema/schema.ts:77

**Returns:** *Record‹string, GeneralValidator | UnsignedValidator›*

## Methods

### `Protected` _config

▸ **_config**(): *[Schema](schema.md)‹›*

*Inherited from [Schema](schema.md).[_config](schema.md#protected-_config)*

Defined in jadnschema/schema/base.ts:106

**Returns:** *[Schema](schema.md)‹›*

___

###  _convertTypes

▸ **_convertTypes**(`schema`: SchemaJADN): *SchemaJADN*

Defined in jadnschema/schema/schema.ts:607

**Parameters:**

Name | Type |
------ | ------ |
`schema` | SchemaJADN |

**Returns:** *SchemaJADN*

___

###  _dumps

▸ **_dumps**(`obj`: any, `indent?`: undefined | number, `level?`: undefined | number): *string*

Defined in jadnschema/schema/schema.ts:550

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

Defined in jadnschema/schema/schema.ts:504

**Returns:** *[Schema](schema.md)*

___

###  _setSchema

▸ **_setSchema**(`data`: SchemaSimpleJADN | [Schema](schema.md)): *void*

Defined in jadnschema/schema/schema.ts:513

Set the Schema object with the given data

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data` | SchemaSimpleJADN &#124; [Schema](schema.md) | data to set schema object  |

**Returns:** *void*

___

###  addFormat

▸ **addFormat**(`fmt`: string, `fun`: GeneralValidator | UnsignedValidator, `override?`: undefined | false | true): *void*

Defined in jadnschema/schema/schema.ts:596

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

Defined in jadnschema/schema/schema.ts:85

Analyze the given schema for unreferenced and undefined types

**Returns:** *Record‹string, string | Array‹string››*

analysis results

___

###  dependencies

▸ **dependencies**(): *Record‹string, Set‹string››*

Defined in jadnschema/schema/schema.ts:105

Determine the dependencies for each type within the schema

**Returns:** *Record‹string, Set‹string››*

record of dependencies

___

###  dump

▸ **dump**(`fname`: string, `indent?`: undefined | number, `strip?`: undefined | false | true): *void*

Defined in jadnschema/schema/schema.ts:392

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

Defined in jadnschema/schema/schema.ts:404

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

Defined in jadnschema/schema/base.ts:177

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

Defined in jadnschema/schema/base.ts:133

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

Defined in jadnschema/schema/schema.ts:360

Load a JADN schema from a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`fname` | string | JADN schema file to load  |

**Returns:** *void*

___

###  loads

▸ **loads**(`schema`: string | SchemaSimpleJADN): *void*

Defined in jadnschema/schema/schema.ts:373

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

Defined in jadnschema/schema/base.ts:142

Create a dictionary of the current object

**Returns:** *Record‹string, any›*

simple object (key/value) of the object

___

###  schema

▸ **schema**(`strip?`: undefined | false | true): *SchemaSimpleJADN*

Defined in jadnschema/schema/schema.ts:133

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

Defined in jadnschema/schema/schema.ts:156

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

Defined in jadnschema/schema/base.ts:158

Set the given key/value pairs as properties of the current class

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`props` | Record‹string, any› | key/value pairs to set  |

**Returns:** *void*

___

###  simplify

▸ **simplify**(`simple?`: undefined | false | true, `schema?`: SchemaSimpleJADN, `anon?`: undefined | false | true, `multi?`: undefined | false | true, `derived?`: undefined | false | true, `mapOf?`: undefined | false | true): *SchemaSimpleJADN | [Schema](schema.md)*

Defined in jadnschema/schema/schema.ts:172

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

Defined in jadnschema/schema/schema.ts:65

**Returns:** *string*

___

###  validate

▸ **validate**(`inst`: Record‹string, any›, `silent?`: undefined | false | true): *null | Error*

Defined in jadnschema/schema/schema.ts:454

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

Defined in jadnschema/schema/schema.ts:481

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

Defined in jadnschema/schema/schema.ts:416

Verify the schema is proper

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`silent?` | undefined &#124; false &#124; true | raise or return errors |

**Returns:** *void | Array‹Error›*

List of errors raises
