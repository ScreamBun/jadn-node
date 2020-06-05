/* eslint @typescript-eslint/camelcase: 0 */
import {
  CommentLevels,
  SchemaFormats
} from './enums';
import ReaderBase from './readers/base';
import WriterBase, {
  JADNtoHTML,
  JADNtoJADN,
  // JADNtoIDL,
  JADNtoJSON,
  JADNtoMD
} from './writers';

import { Schema } from '../../schema';
import { safeGet } from '../../utils';
import { FormatError } from '../../exceptions';

// Base Vars
const ValidReaders: Record<string, typeof ReaderBase> = {};
const ValidWriters: Record<string, typeof WriterBase> = {};

// Base Functions
/**
  * Produce formatted schema from JADN schema
  * @param {string|Record<string, any>|Schema} schema - JADN Schema to convert
  * @param {string} fname - file to create and write
  * @param {stirng} source - name of original schema file
  * @param {CommentLevels} comments - include or ignore comments
  * @param {SchemaFormats} format: format of the desired output schema
  * @param {Record<string, any>} kwargs - extra field values for the function
  */
function dump(schema: string|Record<string, any>|Schema, fname: string, source?: string, comment?: CommentLevels, format?: SchemaFormats, kwargs?: Record<string, any>): void {
  const Writer = safeGet(ValidWriters, (format || ''), null);
  if (Writer !== null && Writer.prototype instanceof WriterBase) {
    const writer = new Writer(schema, comment);
    return writer.dump(fname, source, kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}

/**
  * Produce formatted schema from JADN schema
  * @param {string|Record<string, any>|Schema} schema - JADN Schema to convert
  * @param {CommentLevels} comments - include or ignore comments
  * @param {SchemaFormats} fmt: format of the desired output schema
  * @param {Record<string, any>} kwargs - extra field values for the function
  * @return {string|Record<string, any>} - formatted schema
 */
function dumps(schema: string|Record<string, any>|Schema, comment?: CommentLevels, format?: SchemaFormats, kwargs?: Record<string, any>): string|Record<string, any> {
  const Writer = safeGet(ValidWriters, (format || ''), null);
  if (Writer !== null && Writer.prototype instanceof WriterBase) {
    const writer = new Writer(schema, comment);
    return writer.dumps(kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}

/**
  * Produce JADN schema from input schema
  * @param {string} schema - Schema to load
  * @param {string} source - name of original schema file
  * @param {SchemaFormats} fmt: format of the input schema
  * @param {Record<string, any>} kwargs - extra field values for the function
  * @returns {Schema} - loaded schema
  */
function load(schema: string, format: SchemaFormats, kwargs?: Record<string, any>): Schema {
  const Reader = safeGet(ValidReaders, (format || ''), null);
  if (Reader !== null && Reader.prototype instanceof ReaderBase) {
    const reader = new Reader();
    return reader.load(schema, kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}

/**
  * Produce JADN schema from input schema
  * @param {string} schema - Schema to load
  * @param {SchemaFormats} fmt: format of the input schema
  * @param {Record<string, any>} kwargs - extra field values for the function
  * @return: loaded JADN schema
 */
function loads(schema: string, format: SchemaFormats, kwargs: Record<string, any>): Schema {
  const Reader = safeGet(ValidReaders, (format || ''), null);
  if (Reader !== null && Reader.prototype instanceof ReaderBase) {
    const reader = new Reader();
    return reader.loads(schema, kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}


// Add format reader/writers
// CDDL
// ValidReaders[SchemaFormats.CDDL] = CDDLtoJADN;
// ValidWriters[SchemaFormats.CDDL] = JADNtoCDDL;
// cddl_dump = partial(dump, fmt="cddl")
// cddl_dumps = partial(dumps, fmt="cddl")
// cddl_load = partial(load, fmt="cddl")
// cddl_loads = partial(loads, fmt="cddl")

// HTML
ValidWriters[SchemaFormats.HTML] = JADNtoHTML;
const html_dump = (schema: string|Record<string, any>|Schema, fname: string, source?: string, comment?: CommentLevels, kwargs?: Record<string, any>) => dump(schema, fname, source, comment, SchemaFormats.HTML, kwargs);
const html_dumps = (schema: string|Record<string, any>|Schema, comment?: CommentLevels, kwargs?: Record<string, any>) => dumps(schema, comment, SchemaFormats.HTML, kwargs);

// JADN
ValidWriters[SchemaFormats.JADN] = JADNtoJADN;
const jadn_dump = (schema: string|Record<string, any>|Schema, fname: string, source?: string, comment?: CommentLevels, kwargs?: Record<string, any>) => dump(schema, fname, source, comment, SchemaFormats.JADN, kwargs);
const jadn_dumps = (schema: string|Record<string, any>|Schema, comment?: CommentLevels, kwargs?: Record<string, any>) => dumps(schema, comment, SchemaFormats.JADN, kwargs);
// jadn_load = partial(load, fmt="jadn")
// jadn_loads = partial(loads, fmt="jadn")

// JADN IDL
// ValidReaders[SchemaFormats.JIDL] = JADNtoJIDL;
// ValidWriters[SchemaFormats.JIDL] = JIDLtoJADN;
// -jidl_dump = partial(dump, fmt="jidl")
// -jidl_dumps = partial(dumps, fmt="jidl")
// jidl_load = partial(load, fmt="jidl")
// jidl_loads = partial(loads, fmt="jidl")

// JSON
// ValidReaders[SchemaFormats.JSON] = JSONtoJADN;
ValidWriters[SchemaFormats.JSON] = JADNtoJSON;
const json_dump = (schema: string|Record<string, any>|Schema, fname: string, source?: string, comment?: CommentLevels, kwargs?: Record<string, any>) => dump(schema, fname, source, comment, SchemaFormats.JSON, kwargs);
const json_dumps = (schema: string|Record<string, any>|Schema, comment?: CommentLevels, kwargs?: Record<string, any>) => dumps(schema, comment, SchemaFormats.JSON, kwargs);
// json_load = partial(load, fmt="json")
// json_loads = partial(loads, fmt="json")

// Markdown
ValidWriters[SchemaFormats.MarkDown] = JADNtoMD;
const md_dump = (schema: string|Record<string, any>|Schema, fname: string, source?: string, comment?: CommentLevels, kwargs?: Record<string, any>) => dump(schema, fname, source, comment, SchemaFormats.MarkDown, kwargs);
const md_dumps = (schema: string|Record<string, any>|Schema, comment?: CommentLevels, kwargs?: Record<string, any>) => dumps(schema, comment, SchemaFormats.MarkDown, kwargs);

// ProtoBuf
// ValidReaders[SchemaFormats.ProtoBuf] = JADNtoProto;
// ValidWriters[SchemaFormats.ProtoBuf] = PrototoJADN;
// proto_dump = partial(dump, fmt="proto")
// proto_dumps = partial(dumps, fmt="proto")
// proto_load = partial(load, fmt="proto")
// proto_loads = partial(loads, fmt="proto")

// Relax-NG
// ValidReaders[SchemaFormats.RelaxNG] = JADNtoRelaxNG;
// ValidWriters[SchemaFormats.RelaxNG] = RelaxNGtoJADN;
// register_writer(fmt=writers.JADNtoRelax)
// relax_dump = partial(dump, fmt="relax")
// relax_dumps = partial(dumps, fmt="relax")
// relax_load = partial(load, fmt="relax")
// relax_loads = partial(loads, fmt="relax")

// Thrift
// ValidReaders[SchemaFormats.Thrift] = JADNtoThrift;
// ValidWriters[SchemaFormats.Thrift] = ThrifttoJADN;
// register_writer(fmt=writers.JADNtoThrift)
// thrift_dump = partial(dump, fmt="thrift")
// thrift_dumps = partial(dumps, fmt="thrift")
// thrift_load = partial(load, fmt="thrift")
// thrift_loads = partial(loads, fmt="thrift")


export {
  // Enums
  CommentLevels,
  SchemaFormats,
  // Converters
  // Convert to ...
  // cddl_dump,
  // cddl_dumps,
  html_dump,
  html_dumps,
  jadn_dump,
  jadn_dumps,
  // jas_dump,
  // jas_dumps,
  // -jidl_dump,
  // -jidl_dumps,
  json_dump,
  json_dumps,
  md_dump,
  md_dumps,
  // proto_dump,
  // proto_dumps,
  // relax_dump,
  // relax_dumps,
  // thrift_dump,
  // thrift_dumps,
  // Load From ...
  // cddl_load,
  // cddl_loads,
  // jadn_load,
  // jadn_loads,
  // jas_load,
  // jas_loads,
  // jidl_load,
  // jidl_loads,
  // json_load,
  // json_loads,
  // proto_load,
  // proto_loads,
  // relax_load,
  // relax_load,
  // thrift_load,
  // thrift_loads,
  // Dynamic
  dump,
  dumps,
  load,
  loads
};