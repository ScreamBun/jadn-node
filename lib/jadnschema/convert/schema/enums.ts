// Valid Schema Formats for conversion
enum SchemaFormats {
  // CDDL: 'cddl',
  HTML = 'html',
  JDIL = 'jidl',
  JADN = 'jadn',
  // JAS = 'jas',
  JSON = 'json',
  MarkDown = 'md'
  // PDF = 'pdf',
  // Proto = 'proto',
  // Relax = 'rng',
  // Thrift = 'thrift',
}

// Conversion Comment Level
enum CommentLevels {
  ALL = 'all',
  NONE = 'none'
}

export {
  CommentLevels,
  SchemaFormats
};
