import { jadn } from '../../lib/api';

// Type Definition in Fields Extension
const schema_anon = {
  anon_extension: {  // id, vtype, ktype, enum, pointer, format, pattern, minv, maxv, unique
    types: [
      ['Color', 'Map', [], '', [
        [1, 'red', 'Integer', [], ''],
        [2, 'green', 'Integer', [], ''],
        [3, 'blue', 'Integer', [], '']
      ]],
      ['Dir', 'Record', [], '', [
        [1, 'a', 'String', [], ''],
        [2, 'b', 'Subdir', ['<'], '']
      ]],
      ['Subdir', 'Map', [], '', [
        [1, 'foo', 'Number', [], ''],
        [2, 'bar', 'String', [], '']
      ]],
      ['T-anon', 'Record', [], '', [
        [1, 'id', 'Enumerated', ['#Color', '='], ''],
        [2, 'enum', 'Enumerated', ['#Color', '[0'], ''],
        [3, 'vtype', 'ArrayOf', ['*#Color'], ''],
        [4, 'kvtype', 'MapOf', ['+#Color', '*String'], ''],
        [5, 'pointer', 'Enumerated', ['>Dir'], ''],
        [6, 'format', 'String', ['/idn-email', '[0'], ''],
        [7, 'pattern', 'String', ['%\\d+'], ''],
        [8, 'mult', 'ArrayOf', ['*Color', '{2', '}5'], ''],
        [9, 'unique', 'ArrayOf', ['*String', 'q'], '']
      ]]
    ]
  },
  anon_simplified: {
    types: [
      ['Color', 'Map', [], '', [
        [1, 'red', 'Integer', [], ''],
        [2, 'green', 'Integer', [], ''],
        [3, 'blue', 'Integer', [], '']
      ]],
      ['Dir', 'Record', [], '', [
        [1, 'a', 'String', [], ''],
        [2, 'b', 'Subdir', ['<'], '']
      ]],
      ['Subdir', 'Map', [], '', [
        [1, 'foo', 'Number', [], ''],
        [2, 'bar', 'String', [], '']
      ]],
      ['T-anon', 'Record', [], '', [
        [1, 'id', 'Color$Enum-Id', [], ''],
        [2, 'enum', 'Color$Enum', ['[0'], ''],
        [3, 'vtype', 'T-anon$vtype', [], ''],
        [4, 'kvtype', 'T-anon$kvtype', [], ''],
        [5, 'pointer', 'Dir$Pointer', [], ''],
        [6, 'format', 'T-anon$format', ['[0'], ''],
        [7, 'pattern', 'T-anon$pattern', [], ''],
        [8, 'mult', 'T-anon$mult', [], ''],
        [9, 'unique', 'T-anon$unique', [], '']
      ]],
      ['Color$Enum-Id', 'Enumerated', ['#Color', '='], ''],
      ['Color$Enum', 'Enumerated', ['#Color'], ''],
      ['T-anon$vtype', 'ArrayOf', ['*#Color'], ''],
      ['T-anon$kvtype', 'MapOf', ['+#Color', '*String'], ''],
      ['Dir$Pointer', 'Enumerated', ['>Dir'], ''],
      ['T-anon$format', 'String', ['/idn-email'], ''],
      ['T-anon$pattern', 'String', ['%\\d+'], ''],
      ['T-anon$mult', 'ArrayOf', ['*Color', '{2', '}5'], ''],
      ['T-anon$unique', 'ArrayOf', ['*String', 'q'], ''],
    ]
  },
  all_simplified: {
    types: [
      ['Color', 'Map', [], '', [
        [1, 'red', 'Integer', [], ''],
        [2, 'green', 'Integer', [], ''],
        [3, 'blue', 'Integer', [], '']
      ]],
      ['Dir', 'Record', [], '', [
        [1, 'a', 'String', [], ''],
        [2, 'b', 'Subdir', ['<'], '']
      ]],
      ['Subdir', 'Map', [], '', [
        [1, 'foo', 'Number', [], ''],
        [2, 'bar', 'String', [], '']
      ]],
      ['T-anon', 'Record', [], '', [
        [1, 'id', 'Color$Enum-Id', [], ''],
        [2, 'enum', 'Color$Enum', ['[0'], ''],
        [3, 'vtype', 'T-anon$vtype', [], ''],
        [4, 'kvtype', 'T-anon$kvtype', [], ''],
        [5, 'pointer', 'Dir$Pointer', [], ''],
        [6, 'format', 'T-anon$format', ['[0'], ''],
        [7, 'pattern', 'T-anon$pattern', [], ''],
        [8, 'mult', 'T-anon$mult', [], ''],
        [9, 'unique', 'T-anon$unique', [], '']
      ]],
      ['Color$Enum-Id', 'Enumerated', ['='], '', [
        [1, 'red', ''],
        [2, 'green', ''],
        [3, 'blue', '']
      ]],
      ['Color$Enum', 'Enumerated', [], '', [
        [1, 'red', ''],
        [2, 'green', ''],
        [3, 'blue', '']
      ]],
      ['T-anon$vtype', 'ArrayOf', ['*Color$Enum'], ''],
      ['T-anon$kvtype', 'Map', [], '', [
        [1, 'red', 'String', [], ''],
        [2, 'green', 'String', [], ''],
        [3, 'blue', 'String', [], '']
      ]],
      ['Dir$Pointer', 'Enumerated', [], '', [
        [1, 'a', ''],
        [2, 'b/foo', ''],
        [3, 'b/bar', '']
      ]],
      ['T-anon$format', 'String', ['/idn-email'], ''],
      ['T-anon$pattern', 'String', ['%\\d+'], ''],
      ['T-anon$mult', 'ArrayOf', ['*Color', '{2', '}5'], ''],
      ['T-anon$unique', 'ArrayOf', ['*String', 'q'], ''],
    ]
  }
};

// Field Multiplicity Extension
const schema_mult = {
  extension: {  // JADN schema for fields with cardinality > 1 (e.g., list of x)
    types: [
      ['T-opt-list1', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'T-array1', ['[0'], '']  // Min = 0, Max default = 1 (Undefined type OK for Extension tests)
      ]],
      ['T-list-1-2', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'String', [']2'], '']  //  Min default = 1, Max = 2
      ]],
      ['T-list-0-2', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'String', ['[0', ']2'], '']  //  Min = 0, Max = 2 (Array is optional, empty is invalid)
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
  },
  simplified: {  // JADN schema for fields with cardinality > 1 (e.g., list of x)
    types: [
      ['T-opt-list1', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'T-array1', ['[0'], '']  // Min = 0, Max default = 1 (Undefined type OK for Extension tests)
      ]],
      ['T-list-1-2', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'T-list-1-2$list', [], '']  // Min default = 1 required
      ]],
      ['T-list-0-2', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'T-list-0-2$list', ['[0'], '']  // Min = 0 optional
      ]],
      ['T-list-2-3', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'T-list-2-3$list', [], '']  // Min default = 1 required
      ]],
      ['T-list-1-n', 'Record', [], '', [
        [1, 'string', 'String', [], ''],
        [2, 'list', 'T-list-1-n$list', [], '']
      ]],
      ['T-list-1-2$list', 'ArrayOf', ['*String', '{1', '}2'], ''],  // Min = 1, Max = 2 (options are unordered)
      ['T-list-0-2$list', 'ArrayOf', ['*String', '{1', '}2'], ''],  // Min = 1, Max = 2
      ['T-list-2-3$list', 'ArrayOf', ['*String', '{2', '}3'], ''],  // Min = 2, Max = 3
      ['T-list-1-n$list', 'ArrayOf', ['*String', '{1'], '']         // Min = 1, Max default *
    ]
  }
};

// Derived Enumeration Extension
const schema_enum = {
  extension: {
    types: [
      ['Pixel', 'Record', [], '', [
        [1, 'red', 'Integer', [], 'rojo'],
        [2, 'green', 'Integer', [], 'verde'],
        [3, 'blue', 'Integer', [], '']
      ]],
      ['Channel', 'Enumerated', ['#Pixel'], '', []],         // Derived enumeration (explicitly named)
      ['ChannelId', 'Enumerated', ['#Pixel', '='], '', []],  // Derived enumeration with ID option
      ['ChannelMask', 'ArrayOf', ['*#Pixel'], '', []],       // Array of items from named derived enum
      ['Pixel2', 'Map', ['='], '', [
        [1, 'yellow', 'Integer', [], ''],
        [2, 'orange', 'Integer', [], ''],
        [3, 'purple', 'Integer', [], '']
      ]],
      ['ChannelMask2', 'ArrayOf', ['*#Pixel2'], '', []],  // Array of items from generated derived enum
    ]
  },
  simplified: {
    types: [
      ['Pixel', 'Record', [], '', [
        [1, 'red', 'Integer', [], 'rojo'],
        [2, 'green', 'Integer', [], 'verde'],
        [3, 'blue', 'Integer', [], '']
      ]],
      ['Channel', 'Enumerated', [], '', [
        [1, 'red', 'rojo'],
        [2, 'green', 'verde'],
        [3, 'blue', '']
      ]],
      ['ChannelId', 'Enumerated', ['='], '', [
        [1, 'red', 'rojo'],
        [2, 'green', 'verde'],
        [3, 'blue', '']
      ]],
      ['ChannelMask', 'ArrayOf', ['*Channel'], '', []],
      ['Pixel2', 'Map', ['='], '', [
        [1, 'yellow', 'Integer', [], ''],
        [2, 'orange', 'Integer', [], ''],
        [3, 'purple', 'Integer', [], '']
      ]],
      ['ChannelMask2', 'ArrayOf', ['*Pixel2$Enum'], '', []],  // Array of items from generated derived enum
      ['Pixel2$Enum', 'Enumerated', [], '', [                 // Generated derived enum - Id not propogated
        [1, 'yellow', ''],
        [2, 'orange', ''],
        [3, 'purple', '']
      ]]
    ]
  }
};

// MapOf Enumerated Key Extension
const schema_mapof = {
  extension: {
    types: [
      ['Colors-Enum', 'Enumerated', [], '', [
        [1, 'red', 'rojo'],
        [2, 'green', 'verde'],
        [3, 'blue', '']
      ]],
      ['Colors-Map', 'MapOf', ['+Colors-Enum', '*Number'], '']
    ]
  },
  simplified: {
    types: [
      ['Colors-Enum', 'Enumerated', [], '', [
        [1, 'red', 'rojo'],
        [2, 'green', 'verde'],
        [3, 'blue', '']
      ]],
      ['Colors-Map', 'Map', [], '', [
        [1, 'red', 'Number', [], 'rojo'],
        [2, 'green', 'Number', [], 'verde'],
        [3, 'blue', 'Number', [], '']
      ]]
    ]
  }
};

// Pointers Extention
const schema_pointer = {
  extension: {
    types: [
      ['Catalog', 'Record', [], '', [
        [1, 'a', 'TypeA', [], 'Leaf field (e.g., file)'],
        [2, 'b', 'TypeB', ['<'], 'Collection field (e.g., dir)']
      ]],
      ['TypeA', 'Record', [], '', [
        [1, 'x', 'Number', [], ''],
        [2, 'y', 'Number', [], '']
      ]],
      ['TypeB', 'Record', [], '', [
        [1, 'foo', 'String', [], 'Type'],
        [2, 'bar', 'Integer', [], 'Size']
      ]],
      ['Fields', 'Enumerated', ['#Catalog'], 'Enumerated type with list of fields'],
      ['Paths', 'Enumerated', ['>Catalog'], 'Enumerated type with list of JSON Pointers'],
      ['Simple', 'String', [], 'A type without fields'],
      ['Empty-Fields', 'Enumerated', ['#Simple'], ''],
      ['Empty-Paths', 'Enumerated', ['>Simple'], '']
    ]
  },
  simplified: {
    types: [
      ['Catalog', 'Record', [], '', [
        [1, 'a', 'TypeA', [], 'Leaf field (e.g., file)'],
        [2, 'b', 'TypeB', ['<'], 'Collection field (e.g., dir)']
      ]],
      ['TypeA', 'Record', [], '', [
        [1, 'x', 'Number', [], ''],
        [2, 'y', 'Number', [], '']
      ]],
      ['TypeB', 'Record', [], '', [
        [1, 'foo', 'String', [], 'Type'],
        [2, 'bar', 'Integer', [], 'Size']
      ]],
      ['Fields', 'Enumerated', [], 'Enumerated type with list of fields', [
        [1, 'a', 'Leaf field (e.g., file)'],
        [2, 'b', 'Collection field (e.g., dir)']
      ]],
      ['Paths', 'Enumerated', [], 'Enumerated type with list of JSON Pointers', [
        [1, 'a', 'Leaf field (e.g., file)'],
        [2, 'b/foo', 'Type'],
        [3, 'b/bar', 'Size']
      ]],
      ['Simple', 'String', [], 'A type without fields'],
      ['Empty-Fields', 'Enumerated', [], '', []],
      ['Empty-Paths', 'Enumerated', [], '', []]
    ]
  }
};

function run() {
  test('Anonymous Type Definitions', () => {
    const schemaObj = jadn.loads(schema_anon.extension);
    const simpleSchema = schemaObj.simplify(true, true, false, false, false)
    expect(simpleSchema).toEqual(schema_anon.simplified);
  });

  test('All Extentions', () => {
    const schemaObj = jadn.loads(schema_anon.extension);
    const simpleSchema = schemaObj.simplify(true, true, true, true, true)
    expect(simpleSchema).toEqual(schema_anon.all_simplified);
  });

  test('Field Multiplicity', () => {
    const schemaObj = jadn.loads(schema_mult.extension);
    const simpleSchema = schemaObj.simplify(true, false, true, false, false)
    expect(simpleSchema).toEqual(schema_mult.simplified);
  });

  test('Derived Enumeration', () => {
    const schemaObj = jadn.loads(schema_enum.extension);
    const simpleSchema = schemaObj.simplify(true, false, false, true, false)
    expect(simpleSchema).toEqual(schema_enum.simplified);
  });

  test('Derived MapOf', () => {
    const schemaObj = jadn.loads(schema_mapof.extension);
    const simpleSchema = schemaObj.simplify(true, false, false, true, false)
    expect(simpleSchema).toEqual(schema_mapof.simplified);
  });

  test('Pointer Extention', () => {
    const schemaObj = jadn.loads(schema_pointer.extension);
    const simpleSchema = schemaObj.simplify(true, false, false, true, false)
    expect(simpleSchema).toEqual(schema_pointer.simplified);
  });
}

export default run;