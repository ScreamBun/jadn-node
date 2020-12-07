import path from 'path';
import { jadn } from '../../lib/api';
import { a2b_hex } from '../../lib/jadnschema/utils/binascii';

const schema_bad_item_fields = {
  info: {
    module: 'https://jadn.org/unittests-BadSchema'
  },
  types: [
    ['Color', 'Map', [], '', [  // Enumerated items not applicable to Container types
      [1, 'red', ''],
      [2, 'green', ''],
      [3, 'blue', '']
    ]]
  ]
};

const md5 = 'B64CF5EAF07E86D1697D4EEE96A670B6';
const sha256 = 'C9004978CF5ADA526622ACD4EFED005A980058B7B9972B12F9B3A5D0DA46B7D9';
const schemaObj = jadn.load(path.join(__dirname, 'jadn-v1.0-examples.jadn'));

function run() {
  test('Bad Schema', () => {
    expect(() => jadn.checkSchema(schema_bad_item_fields)).toThrow();
  });

  // Test Example messages contained in JADN spec
  test('Choice Explicit', () => {
    const msg_explicit = {
      'dept': 'software',
      'quantity': 395,
      'product': 'https://www.example.com/B902D1P0W37'
    };
    expect(schemaObj.encode('Stock2', msg_explicit)).toEqual(msg_explicit);
  });

  test('Choice Intrinsic', () => {
    const msg_intrinsic = {
      'quantity': 395,
      'product': {
        'software': 'https://www.example.com/B902D1P0W37'
      }
    };
    expect(schemaObj.encode('Stock1', msg_intrinsic)).toEqual(msg_intrinsic);
  });

  test('Pointer', () => {
    const msg_pointer = {
      'a': {
        'x': 57.9,
        'y': 4.841
      },
      'b': {
        'foo': 'Elephant',
        'bar': 762
      }
    };
    expect(schemaObj.encode('Catalog', msg_pointer)).toEqual(msg_pointer);
  });

  test('Discriminated Union, Bad Algorithm', () => {
    const msg_explicit_bad_alg = [
      {
        'algorithm': 'foo',
        'value': md5
      },
      {
        'algorithm': 'sha256',
        'value': sha256
      }
    ];
    
    expect(schemaObj.decode('Hashes2', msg_explicit_bad_alg)).toThrow();
  });

  test('Discriminated Union, Bad Value', () => {
    const msg_explicit_bad_val = [
      {
        'algorithm': 'md5',
        'value': sha256
      },
      {
        'algorithm': 'sha256',
        'value': sha256
      }
    ];
    
    expect(schemaObj.decode('Hashes2', msg_explicit_bad_val)).toThrow();
  });
  
  test('Discriminated Union, Explicit', () => {
    const md5b = a2b_hex(md5);
    const sha256b = a2b_hex(sha256);
    const msg_explicit = [
      {
        'algorithm': 'md5',
        'value': md5
      },
      {
        'algorithm': 'sha256',
        'value': sha256
      }
    ];
    const api_explicit = [
      {
        'algorithm': 'md5',
        'value': md5b
      },
      {
        'algorithm': 'sha256',
        'value': sha256b
      }
    ];
    
    expect(schemaObj.decode('Hashes2', msg_explicit)).toEqual(api_explicit);
  });

  test('Discriminated Union, Intrinsic', () => {
    const md5b = a2b_hex(md5);
    const sha256b = a2b_hex(sha256)
    const msg_intrinsic = {
      'sha256': sha256,
      'md5': md5
    };
    const api_intrinsic = {
      'sha256': sha256b,
      'md5': md5b
    };
    
    expect(schemaObj.decode('Hashes', msg_intrinsic)).toEqual(api_intrinsic);
  });
};

export default run;