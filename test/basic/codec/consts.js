// Codec Constant values

export function _j(data) {
  return JSON.parse(JSON.stringify(data));
}


export const basicTypesSchema = {  // JADN schema for datatypes used in Basic Types tests
  types: [
    ['T-bool', 'Boolean', [], ''],
    ['T-int', 'Integer', [], ''],
    ['T-num', 'Number', [], ''],
    ['T-str', 'String', [], ''],
    ['T-bin', 'Binary', [], ''],
    ['T-array-of', 'ArrayOf', ['*Integer'], ''],
    ['T-array', 'Array', [], '', [
      [1, 'f_bool', 'Boolean', ['[0'], ''],
      [2, 'f_int', 'Integer', [], ''],
      [3, 'f_num', 'Number', [], ''],
      [4, 'f_str', 'String', ['[0'], ''],
      [5, 'f_arr', 'T-aa', ['[0'], ''],
      [6, 'f_ao', 'T-array-of', ['[0'], '']
    ]],
    ['T-aa', 'Array', [], '', [
      [1, 'a', 'Integer', [], ''],
      [2, 'b', 'String', [], '']
    ]],
    ['T-choice', 'Choice', [], '', [
      [1, 'f_str', 'String', [], ''],
      [4, 'f_bool', 'Boolean', [], ''],
      [7, 'f_int', 'Integer', [], '']
    ]],
    ['T-choice-id', 'Choice', ['='], '', [  //  Choice.ID - API key = tag
      [1, 'f_str', 'String', [], ''],
      [4, 'f_bool', 'Boolean', [], ''],
      [7, 'f_int', 'Integer', [], '']
    ]],
    ['T-enum', 'Enumerated', [], '', [
      [1, 'first', ''],
      [15, 'extra', ''],
      [8, 'Chunk', '']
    ]],
    ['T-enum-c', 'Enumerated', ['='], '', [
      [1, 'first', ''],
      [15, 'extra', ''],
      [8, 'Chunk', '']
    ]],
    ['T-map-rgba', 'Map', [], '', [
      [2, 'red', 'Integer', [], ''],
      [4, 'green', 'Integer', ['[0'], ''],
      [6, 'blue', 'Integer', [], ''],
      [9, 'alpha', 'Integer', ['[0'], '']
    ]],
    ['T-arr-rgba', 'Array', [], '', [
      [1, 'red', 'Integer', [], ''],
      [2, 'green', 'Integer', ['[0'], ''],
      [3, 'blue', 'Integer', [], ''],
      [4, 'alpha', 'Integer', ['[0'], '']
    ]],
    ['T-rec-rgba', 'Record', [], '', [
      [1, 'red', 'Integer', [], ''],
      [2, 'green', 'Integer', ['[0'], ''],
      [3, 'blue', 'Integer', [], ''],
      [4, 'alpha', 'Integer', ['[0'], '']
    ]]
  ]
};

export const compoundSchema = {
  types: [
    ['T-choice', 'Choice', [], '', [
      [10, 'rec', 'T-crec', [], ''],
      [11, 'map', 'T-cmap', [], ''],
      [12, 'array', 'T-carray', [], ''],
      [13, 'choice', 'T-cchoice', [], '']
    ]],
    ['T-crec', 'Record', [], '', [
      [1, 'a', 'Integer', [], ''],
      [2, 'b', 'String', [], '']
    ]],
    ['T-cmap', 'Map', [], '', [
      [4, 'c', 'Integer', [], ''],
      [6, 'd', 'String', [], '']
    ]],
    ['T-carray', 'Array', [], '', [
      [1, 'e', 'Integer', [], ''],
      [2, 'f', 'String', [], '']
    ]],
    ['T-cchoice', 'Choice', [], '', [
      [7, 'g', 'Integer', [], ''],
      [8, 'h', 'String', [], '']
    ]]
  ]
};

export const selectorSchema = {  // JADN schema for selector tests
  types: [
    ['T-attr-arr-tag', 'Array', [], '', [
      [1, 'type', 'Enumerated', ['//MenuId', '='], ''],  // ID not propogated from MenuId
      [2, 'value', 'MenuId', ['&1'], '']
    ]],
    ['T-attr-arr-name', 'Array', [], '', [
      [1, 'type', 'Enumerated', ['//Menu'], ''],
      [2, 'value', 'Menu', ['&1'], '']
    ]],
    ['T-attr-rec-name', 'Record', [], '', [
      [1, 'type', 'Enumerated', ['//Menu'], ''],
      [2, 'value', 'Menu', ['&1'], '']
    ]],
    ['T-property-explicit-primitive', 'Record', [], '', [
      [1, 'foo', 'String', [], ''],
      [2, 'data', 'Primitive', [], '']
    ]],
    ['T-property-explicit-category', 'Record', [], '', [
      [1, 'foo', 'String', [], ''],
      [2, 'data', 'Category', [], '']
    ]],
    ['Menu', 'Choice', [], '', [
      [9, 'name', 'String', [], ''],
      [4, 'flag', 'Boolean', [], ''],
      [7, 'count', 'Integer', [], ''],
      [6, 'color', 'Colors', [], ''],
      [5, 'animal', 'Animals', [], ''],
      [10, 'rattr', 'Rattrs', [], ''],
      [11, 'rattrs', 'Rattrs', [']0'], ''],
      [12, 'pair', 'Pair', [], ''],
      [13, 'pairs', 'Pair', [']0'], '']
    ]],
    ['MenuId', 'Choice', ['='], '', [
      [9, 'name', 'String', [], ''],
      [4, 'flag', 'Boolean', [], ''],
      [7, 'count', 'Integer', [], ''],
      [6, 'color', 'Colors', [], ''],
      [5, 'animal', 'Animals', [], ''],
      [10, 'rattr', 'Rattrs', [], ''],
      [11, 'rattrs', 'Rattrs', [']0'], ''],
      [12, 'pair', 'Pair', [], ''],
      [13, 'pairs', 'Pair', [']0'], '']
    ]],
    ['Primitive', 'Choice', [], '', [
      [1, 'name', 'String', [], ''],
      [4, 'flag', 'Boolean', [], ''],
      [7, 'count', 'Integer', [], '']
    ]],
    ['Category', 'Choice', [], '', [
      [2, 'animal', 'Animals', [], ''],
      [6, 'color', 'Colors', [], '']
    ]],
    ['Animals', 'Map', [], '', [
      [3, 'cat', 'String', ['[0'], ''],
      [4, 'dog', 'Integer', ['[0'], ''],
      [5, 'rat', 'Rattrs', ['[0'], '']
    ]],
    ['Colors', 'Enumerated', [], '', [
      [2, 'red', ''],
      [3, 'green', ''],
      [4, 'blue', '']
    ]],
    ['Rattrs', 'Record', [], '', [
      [1, 'length', 'Integer', [], ''],
      [2, 'weight', 'Number', [], '']
    ]],
    ['Pair', 'Array', [], '', [
      [1, 'count', 'Integer', [], ''],
      [2, 'name', 'String', [], '']
    ]]
  ]
};

// JADN schema for fields with cardinality > 1 (e.g., list of x)
export const listCardinalitySchema = {
  types: [
    ['T-array0', 'ArrayOf', ['*String', '}2'], ''],         // Min array length = 0 (default), Max = 2
    ['T-array1', 'ArrayOf', ['*String', '{1', '}2'], ''],   // Min array length = 1, Max = 2
    ['T-opt-list0', 'Record', [], '', [
      [1, 'string', 'String', [], ''],
      [2, 'list', 'T-array0', ['[0'], '']  // Min = 0, Max default = 1 (Array is optional)
    ]],
    ['T-opt-list1', 'Record', [], '', [
      [1, 'string', 'String', [], ''],
      [2, 'list', 'T-array1', ['[0'], '']  // Min = 0, Max default = 1 (Array is optional)
    ]],
    ['T-list-1-2', 'Record', [], '', [
      [1, 'string', 'String', [], ''],
      [2, 'list', 'String', [']2'], '']  // Min default = 1, Max = 2
    ]],
    ['T-list-0-2', 'Record', [], '', [
      [1, 'string', 'String', [], ''],
      [2, 'list', 'String', ['[0', ']2'], '']  // Min = 0, Max = 2 (Array is optional, empty is invalid)
    ]],
    ['T-list-2-3', 'Record', [], '', [
      [1, 'string', 'String', [], ''],
      [2, 'list', 'String', ['[2', ']3'], '']  // Min = 2, Max = 3
    ]],
    ['T-list-1-n', 'Record', [], '', [
      [1, 'string', 'String', [], ''],
      [2, 'list', 'String', [']0'], '']  // Min default = 1, Max = 0 -> n
    ]]
  ]
};

export const listTypesSchema = {
  types: [
    ['T-list', 'ArrayOf', ['*T-list-types'], ''],
    ['T-list-types', 'Record', [], '', [
      [1, 'bins', 'Binary', ['[0', ']2'], ''],
      [2, 'bools', 'Boolean', ['[0', ']2'], ''],
      [3, 'ints', 'Integer', ['[0', ']2'], ''],
      [4, 'strs', 'String', ['[0', ']2'], ''],
      [5, 'arrs', 'T-arr', ['[0', ']2'], ''],
      [6, 'aro_s', 'T-aro-s', ['[0', ']2'], ''],
      [7, 'aro_ch', 'T-aro-ch', ['[0', ']2'], ''],
      [8, 'choices', 'T-ch', ['[0', ']2'], ''],
      [9, 'enums', 'T-enum', ['[0', ']2'], ''],
      [10, 'maps', 'T-map', ['[0', ']2'], ''],
      [11, 'recs', 'T-rec', ['[0', ']2'], '']
    ]],
    ['T-arr', 'Array', [], '', [
      [1, 'x', 'Integer', [], ''],
      [2, 'y', 'Number', [], '']
    ]],
    ['T-aro-s', 'ArrayOf', ['*String'], ''],
    ['T-aro-ch', 'ArrayOf', ['*t_ch'], ''],
    ['T-ch', 'Choice', [], '', [
      [1, 'red', 'Integer', [], ''],
      [2, 'blue', 'Integer', [], '']
    ]],
    ['T-enum', 'Enumerated', [], '', [
      [1, 'heads', ''],
      [2, 'tails', '']
    ]],
    ['T-map', 'Map', [], '', [
      [1, 'red', 'Integer', [], ''],
      [2, 'blue', 'Integer', [], '']
    ]],
    ['T-rec', 'Record', [], '', [
      [1, 'red', 'Integer', [], ''],
      [2, 'blue', 'Integer', [], '']
    ]]
  ]
};

export const boundsSchema = {
  types: [
    ['Int', 'Integer', [], ''],
    ['Num', 'Number', [], ''],
    ['Int-3-6', 'Integer', ['{3', '}6'], ''],
    ['Num-3-6', 'Number', ['y3.0', 'z6.0'], '']
  ]
};

// JADN schema for value constraint tests
export const formatSchema = {
  types: [
    ['IPv4-Bin', 'Binary', ['{4', '}4'], ''],  // Check length = 32 bits with format function
    ['IPv4-Hex', 'Binary', ['{4', '}4', '/x'], ''],  // Check length = 32 bits with min/max size
    ['IPv4-String', 'Binary', ['{4', '}4', '/ipv4-addr'], ''],
    ['IPv6-Base64url', 'Binary', ['{16', '}16'], ''],
    ['IPv6-Hex', 'Binary', ['{16', '}16', '/x'], ''],
    ['IPv6-String', 'Binary', ['{16', '}16', '/ipv6-addr'], ''],
    ['IPv4-Net', 'Array', ['/ipv4-net'], '', [
      [1, 'addr', 'Binary', [], ''],
      [2, 'prefix', 'Integer', [], '']
    ]],
    ['IPv6-Net', 'Array', ['/ipv6-net'], '', [
      [1, 'addr', 'Binary', [], ''],
      [2, 'prefix', 'Integer', [], '']
    ]],
    ['T-ipaddrs', 'ArrayOf', ['*IPv4-Bin'], ''],
    ['MAC-Addr', 'Binary', ['/eui'], ''],
    ['Email-Addr', 'String', ['/email'], ''],
    ['Hostname', 'String', ['/hostname'], ''],
    ['URI', 'String', ['/uri'], ''],
    ['Int8', 'Integer', ['/i8'], ''],
    ['Int16', 'Integer', ['/i16'], ''],
    ['Int32', 'Integer', ['/i32'], ''],
    ['Int64', 'Integer', ['/i64'], '']
  ]
};