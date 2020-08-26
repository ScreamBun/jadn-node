export const JADNTypes = {
  Simple: [
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
  ],
  Selector: [
    // One key and value selected from a set of named or labeled fields.The key has an id and name or label, and is mapped to a type
    'Choice',
    // One value selected from a set of named or labeled integers
    'Enumerated'
  ],
  Compound: [
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
};

/**
  * Determine if the given type is a JADN builtin compound (has definied fields)
  * @param {string} vtype - Type to check as a compound
  * @return {boolean} is builtin cpmpound
  */
 export function isCompound(vtype: string): boolean {
  return ['Array', 'Choice', 'Enumerated', 'Map', 'Record'].includes(vtype);
}
/**
  * Determine if the given type is a JADN builtin primitive
  * @param {string} vtype - Type to check as a primitive
  * @return {boolean} is builtin primitive
  */
 export function isPrimitive(vtype: string): boolean {
  return JADNTypes.Simple.includes(vtype);
}

/**
  * Determine if the given type is a JADN builtin structure
  * @param {string} vtype - Type to check as a structure
  * @return {boolean} is builtin structure
  */
export function isStructure(vtype: string): boolean {
  return JADNTypes.Compound.includes(vtype) || JADNTypes.Selector.includes(vtype);
}

/**
  * Determine if the type is a JADN builtin type
  * @param {string} vtype - Type to check as a built in
  * @return {boolean} is builtin type
  */
export function isBuiltin(vtype: string): boolean {
  return isPrimitive(vtype) || isStructure(vtype);
}
