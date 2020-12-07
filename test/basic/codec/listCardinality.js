import { listCardinalitySchema } from './consts';
import { jadn } from '../../../lib/api';

const schemaObj = jadn.loads(listCardinalitySchema);
const testValues = {
  Lna: {'string': 'cat'},                     // Cardinality 0..n field omits empty list.  Use ArrayOf type to send empty list.
  Lsa: {'string': 'cat', 'list': 'red'},      // Always invalid, value is a string, not a list of one string.
  L0a: {'string': 'cat', 'list': []},         // Arrays SHOULD have minimum cardinality 1 to prevent ambiguity.
  L1a: {'string': 'cat', 'list': ['red']},
  L2a: {'string': 'cat', 'list': ['red', 'green']},
  L3a: {'string': 'cat', 'list': ['red', 'green', 'blue']}
};

function run() {
  test('Opt List0 Verbose', () => {        // n-P, s-F, 0-P, 1-P, 2-P, 3-F
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.encode('T-opt-list0', testValues.Lna)).toMatchObject(testValues.Lna);
    expect(schemaObj.decode('T-opt-list0', testValues.Lna)).toMatchObject(testValues.Lna);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-opt-list0', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.decode('T-opt-list0', testValues.Lsa)
    */
    expect(schemaObj.encode('T-opt-list0', testValues.L0a)).toMatchObject(testValues.L0a);
    expect(schemaObj.decode('T-opt-list0', testValues.L0a)).toMatchObject(testValues.L0a);
    expect(schemaObj.encode('T-opt-list0', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.decode('T-opt-list0', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.encode('T-opt-list0', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.decode('T-opt-list0', testValues.L2a)).toMatchObject(testValues.L2a);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-opt-list0', testValues.L3a)
    with assertRaises(ValueError):
      schemaObj.decode('T-opt-list0', testValues.L3a)
    */
  });

  test('Opt List1 Verbose', () => {        // n-P, s-F, 0-F, 1-P, 2-P, 3-F
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.encode('T-opt-list1', testValues.Lna)).toMatchObject(testValues.Lna);
    expect(schemaObj.decode('T-opt-list1', testValues.Lna)).toMatchObject(testValues.Lna);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-opt-list1', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.decode('T-opt-list1', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.encode('T-opt-list1', testValues.L0a)
    with assertRaises(ValueError):
      schemaObj.decode('T-opt-list1', testValues.L0a)
    */
    expect(schemaObj.encode('T-opt-list1', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.decode('T-opt-list1', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.encode('T-opt-list1', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.decode('T-opt-list1', testValues.L2a)).toMatchObject(testValues.L2a);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-opt-list1', testValues.L3a)
    with assertRaises(ValueError):
      schemaObj.decode('T-opt-list1', testValues.L3a)
    */
  });

  test('List 1_2 Verbose', () => {        // n-F, s-F, 0-F, 1-P, 2-P, 3-F
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-list-1-2', testValues.Lna)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-1-2', testValues.Lna)
    with assertRaises(ValueError):
      schemaObj.encode('T-list-1-2', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-1-2', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.encode('T-list-1-2', testValues.L0a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-1-2', testValues.L0a)
    */
    expect(schemaObj.encode('T-list-1-2', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.decode('T-list-1-2', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.encode('T-list-1-2', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.decode('T-list-1-2', testValues.L2a)).toMatchObject(testValues.L2a);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-list-1-2', testValues.L3a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-1-2', testValues.L3a)
    */
  });

  test('List 0_2 Verbose', () => {        // n-P, s-F, 0-F, 1-P, 2-P, 3-F
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.encode('T-list-0-2', testValues.Lna)).toMatchObject(testValues.Lna);
    expect(schemaObj.decode('T-list-0-2', testValues.Lna)).toMatchObject(testValues.Lna);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-list-0-2', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-0-2', testValues.Lsa)
    with assertRaises(ValueError):
      schemaObj.encode('T-list-0-2', testValues.L0a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-0-2', testValues.L0a)
    */
    expect(schemaObj.encode('T-list-0-2', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.decode('T-list-0-2', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.encode('T-list-0-2', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.decode('T-list-0-2', testValues.L2a)).toMatchObject(testValues.L2a);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-list-0-2', testValues.L3a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-0-2', testValues.L3a)
    */
  });

  test('List 2_3 Verbose', () => {        // n-F, 0-F, 1-F, 2-P, 3-P
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-list-2-3', testValues.Lna)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-2-3', testValues.Lna)
    with assertRaises(ValueError):
      schemaObj.encode('T-list-2-3', testValues.L0a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-2-3', testValues.L0a)
    with assertRaises(ValueError):
      schemaObj.encode('T-list-2-3', testValues.L1a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-2-3', testValues.L1a)
    */
    expect(schemaObj.encode('T-list-2-3', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.decode('T-list-2-3', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.encode('T-list-2-3', testValues.L3a)).toMatchObject(testValues.L3a);
    expect(schemaObj.decode('T-list-2-3', testValues.L3a)).toMatchObject(testValues.L3a);
  });

  test('List 1_n Verbose', () => {        // n-F, 0-F, 1-P, 2-P, 3-P
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    /*
    with assertRaises(ValueError):
      schemaObj.encode('T-list-1-n', testValues.Lna)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-1-n', testValues.Lna)
    with assertRaises(ValueError):
      schemaObj.encode('T-list-1-n', testValues.L0a)
    with assertRaises(ValueError):
      schemaObj.decode('T-list-1-n', testValues.L0a)
    */
    expect(schemaObj.encode('T-list-1-n', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.decode('T-list-1-n', testValues.L1a)).toMatchObject(testValues.L1a);
    expect(schemaObj.encode('T-list-1-n', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.decode('T-list-1-n', testValues.L2a)).toMatchObject(testValues.L2a);
    expect(schemaObj.encode('T-list-1-n', testValues.L3a)).toMatchObject(testValues.L3a);
    expect(schemaObj.decode('T-list-1-n', testValues.L3a)).toMatchObject(testValues.L3a);
  });
}

export default run;