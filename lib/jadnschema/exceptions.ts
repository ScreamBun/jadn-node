/* eslint max-classes-per-file: 0 */
// JADN Exceptions


/**
  * Base JADN Schema Exception
  * @param {string} message - A human-readable description of the error
  * @param {string} fileName - The value for the fileName property on the created Error object. Defaults to the name of the file containing the code that called the Error() constructor
  * @param {int} lineNumber - The value for the lineNumber property on the created Error object. Defaults to the line number containing the Error() constructor invocation
  * @extends Error
  */
class SchemaError extends Error {
  name = 'SchemaException';
}

/**
  * JADN field/type duplicated in id/name
  * @extends SchemaError
  */
class DuplicateError extends SchemaError {
  name = 'DuplicateError';
}

/**
  * JADN Syntax Error
  * @extends SchemaError
  */
class FormatError extends SchemaError {
  name = 'FormatError';
}

/**
  * JADN Field/Type option Error
  * @extends SchemaError
  */
class OptionError extends SchemaError {
  name = 'OptionError';
}

/**
  * JADN message validation Error
  * @extends SchemaError
  */
class ValidationError extends SchemaError {
  name = 'ValidationError';
}

export {
  SchemaError,
  DuplicateError,
  FormatError,
  OptionError,
  ValidationError
};