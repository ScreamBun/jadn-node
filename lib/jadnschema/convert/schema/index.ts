import {
  CommentLevels,
  SchemaFormats
} from './enums';
import { ConversionLib, ConversionDumpLib } from './interface';
import ReaderBase, * as Readers from './readers';
import WriterBase, * as Writers from './writers';

import { FormatError } from '../../exceptions';
import { Schema } from '../../schema';
import { SchemaSimpleJADN } from '../../schema/interfaces';
import { safeGet } from '../../utils';

// Types
type SchemaArg = string|SchemaSimpleJADN|Schema;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DumpArgs = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoadArgs = Record<string, any>;

// Conversion Vars
type BaseReader = typeof ReaderBase;
type BaseWriter = typeof WriterBase;

const ValidReaders: Record<string, BaseReader> = {};
const ValidWriters: Record<string, BaseWriter> = {};


// Base Functions
/**
  * Write the schema to a file in the specified format
  * @param {SchemaArg} schema - JADN Schema to convert
  * @param {string} fname - file to create and write
  * @param {stirng} source - name of original schema file
  * @param {CommentLevels} comments - include or ignore comments
  * @param {SchemaFormats} format: format of the desired output schema
  * @param {DumpArgs} kwargs - extra field values for the function
  */
// eslint-disable-next-line max-len
function dump(schema: SchemaArg, fname: string, source?: string|null, comment?: CommentLevels, format?: SchemaFormats, kwargs?: DumpArgs): void {
  const Writer = safeGet(ValidWriters, (format || ''), null) as BaseWriter|null;
  if (Writer !== null && Writer.prototype instanceof WriterBase) {
    const writer = new Writer(schema, comment);
    return writer.dump(fname, source, kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}

/**
  * Return the schema string in the specified format
  * @param {SchemaArg} schema - JADN Schema to convert
  * @param {CommentLevels} comments - include or ignore comments
  * @param {SchemaFormats} fmt: format of the desired output schema
  * @param {DumpArgs} kwargs - extra field values for the function
  * @return {string} - formatted schema
 */
function dumps(schema: SchemaArg, comment?: CommentLevels, format?: SchemaFormats, kwargs?: DumpArgs): string {
  const Writer = safeGet(ValidWriters, (format || ''), null) as BaseWriter|null;
  if (Writer !== null && Writer.prototype instanceof WriterBase) {
    const writer = new Writer(schema, comment);
    return writer.dumps(kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}

/**
  * Load the schema file from the specified format
  * @param {string} schema - Schema to load
  * @param {string} source - name of original schema file
  * @param {SchemaFormats} fmt: format of the input schema
  * @param {LoadArgs} kwargs - extra field values for the function
  * @returns {Schema} - loaded schema
  */
function load(schema: string, format: SchemaFormats, kwargs?: LoadArgs): Schema {
  const Reader = safeGet(ValidReaders, (format || ''), null) as BaseReader|null;
  if (Reader !== null && Reader.prototype instanceof ReaderBase) {
    const reader = new Reader();
    return reader.load(schema, kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}

/**
  * Load the schema string from the specified format
  * @param {string} schema - Schema to load
  * @param {SchemaFormats} fmt: format of the input schema
  * @param {LoadArgs} kwargs - extra field values for the function
  * @return: loaded JADN schema
 */
function loads(schema: string, format: SchemaFormats, kwargs: LoadArgs): Schema {
  const Reader = safeGet(ValidReaders, (format || ''), null) as BaseReader|null;
  if (Reader !== null && Reader.prototype instanceof ReaderBase) {
    const reader = new Reader();
    return reader.loads(schema, kwargs);
  }
  throw new FormatError(`The format specified is not a known format - '${format || ''}'`);
}


// Add format reader/writers
// HTML
ValidWriters[SchemaFormats.HTML] = Writers.JADNtoHTML;
const html: ConversionDumpLib = {
  /** Converts to HTML tables and writes to the given file, see {@link dump} for param specifics */
  // eslint-disable-next-line max-len
  dump: (schema: SchemaArg, fname: string, source?: string|null, comment?: CommentLevels, kwargs?: DumpArgs): void => dump(schema, fname, source, comment, SchemaFormats.HTML, kwargs),
  /** Converts to HTML tables and returns the string value, see {@link dumps} for param specifics */
  dumps: (schema: SchemaArg, comment?: CommentLevels, kwargs?: DumpArgs) => dumps(schema, comment, SchemaFormats.HTML, kwargs)
};

// JADN
ValidReaders[SchemaFormats.JADN] = Readers.JADNtoJADN;
ValidWriters[SchemaFormats.JADN] = Writers.JADNtoJADN;
const jadn: ConversionLib = {
  /** Converts to JADN format and writes to the given file, see {@link dump} for param specifics */
  // eslint-disable-next-line max-len
  dump: (schema: SchemaArg, fname: string, source?: string|null, comment?: CommentLevels, kwargs?: DumpArgs): void => dump(schema, fname, source, comment, SchemaFormats.JADN, kwargs),
  /** Converts to JADN format and returns the string value, see {@link dumps} for param specifics */
  dumps: (schema: SchemaArg, comment?: CommentLevels, kwargs?: DumpArgs) => dumps(schema, comment, SchemaFormats.JADN, kwargs),
  /** Loads the JADN formated schema file, see {@link load} for param specifics */
  load: (schema: string, kwargs?: LoadArgs): Schema => load(schema, SchemaFormats.JADN, kwargs),
  /** Loads the JADN formated schema string, see {@link loads} for param specifics */
  loads: (schema: string, kwargs?: LoadArgs): Schema => load(schema, SchemaFormats.JADN, kwargs)
};

// JADN IDL
// ValidReaders[SchemaFormats.JIDL] = JADNtoJIDL;
ValidWriters[SchemaFormats.JIDL] = Writers.JADNtoIDL;
const jidl: ConversionDumpLib = {
  /** Converts to JIDL format and writes to the given file, see {@link dump} for param specifics */
  // eslint-disable-next-line max-len
  dump: (schema: SchemaArg, fname: string, source?: string|null, comment?: CommentLevels, kwargs?: DumpArgs): void => dump(schema, fname, source, comment, SchemaFormats.JIDL, kwargs),
  /** Converts to JADN format and returns the string value, see {@link dumps} for param specifics */
  dumps: (schema: SchemaArg, comment?: CommentLevels, kwargs?: DumpArgs) => dumps(schema, comment, SchemaFormats.JIDL, kwargs)
};

// JSON
// ValidReaders[SchemaFormats.JSON] = JSONtoJADN;
ValidWriters[SchemaFormats.JSON] = Writers.JADNtoJSON;
const json: ConversionDumpLib = {
  /** Converts to JSON format and writes to the given file, see {@link dump} for param specifics */
  // eslint-disable-next-line max-len
  dump: (schema: SchemaArg, fname: string, source?: string|null, comment?: CommentLevels, kwargs?: DumpArgs): void => dump(schema, fname, source, comment, SchemaFormats.JSON, kwargs),
  /** Converts to JSON format and returns the string value, see {@link dumps} for param specifics */
  dumps: (schema: SchemaArg, comment?: CommentLevels, kwargs?: DumpArgs) => dumps(schema, comment, SchemaFormats.JSON, kwargs)
};

// Markdown
ValidWriters[SchemaFormats.MarkDown] = Writers.JADNtoMD;
const md: ConversionDumpLib = {
  /** Converts to JSON format and writes to the given file, see {@link dump} for param specifics */
  // eslint-disable-next-line max-len
  dump: (schema: SchemaArg, fname: string, source?: string|null, comment?: CommentLevels, kwargs?: DumpArgs): void => dump(schema, fname, source, comment, SchemaFormats.MarkDown, kwargs),
  /** Converts to MarkDown format and returns the string value, see {@link dumps} for param specifics */
  // eslint-disable-next-line max-len
  dumps: (schema: SchemaArg, comment?: CommentLevels, kwargs?: DumpArgs) => dumps(schema, comment, SchemaFormats.MarkDown, kwargs)
};

export {
  // Enums
  CommentLevels,
  SchemaFormats,
  // Converters
  html,
  jadn,
  jidl,
  json,
  md,
  // Dynamic
  dump,
  dumps,
  load,
  loads
};