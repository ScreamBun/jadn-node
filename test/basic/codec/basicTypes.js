import { _j, basicTypesSchema } from './consts';
import { jadn } from '../../../lib/api';
import binascii from '../../../lib/jadnschema/utils/binascii';

const schemaObj = jadn.loads(basicTypesSchema);
const testValues = {
  primitives: {
    binary: {
      B1b: 'data to be encoded', // origina - b'data...
      B1s: 'ZGF0YSB0byBiZSBlbmNvZGVk',
      B2b: 'data\nto be ëncoded 旅程'.toString('UTF-8'),
      B2s: 'ZGF0YQp0byBiZSDDq25jb2RlZCDml4XnqIs',
      B3b: binascii.a2b_hex('18e0c9987b8f32417ca6744f544b815ad2a6b4adca69d2c310bd033c57d363e3'),
      B3s: 'GODJmHuPMkF8pnRPVEuBWtKmtK3KadLDEL0DPFfTY-M',
      B_bad1b: 'string',
      B_bad2b: 394,
      B_bad3b: true,
      B_bad1s: 'ZgF%&0B++'
    }
  },
  enumeration: {},
  structured: {
    array: {
      Arr1: [null, 3, 2],
      Arr2: [true, 3, 2.71828, 'Red'],
      Arr3: [true, 3, 2, 'Red', [1, 'Blue'], [2, 3]],
      Arr4: [true, 3, 2.71828, null, [1, 'Blue'], [2, 3]],
      Arr5: [true, 3, 2.71828, 'Red', null, []],
      Arr_bad1: [true, 3, null, 'Red'],                   // Third element is required
      Arr_bad2: [true, 3, false, 'Red'],                  // Third element is Number
      Arr_bad3: [true, 3, 2.71828, 'Red', []]             // Optional arrays are omitted, not empty
    },
    arrayOf: {},
    choice: {
      // Choice - API keys are names
      C1a: {'f_str': 'foo'},
      C2a: {'f_bool': false},
      C3a: {'f_int': 42},
      C1m: {1: 'foo'},
      C2m: {4: false},
      C3m: {7: 42},
      C1_bad1a: {'f_str': 15},
      C1_bad2a: {'type5': 'foo'},
      C1_bad3a: {'f_str': 'foo', 'f_bool': false},
      C1_bad1m: {1: 15},
      C1_bad2m: {3: 'foo'},
      C1_bad3m: {1: 'foo', '4': false},
      C1_bad4m: {'one': 'foo'},
      // Choice.ID - API keys are IDs
      Cc1a: {1: 'foo'},
      Cc2a: {4: false},
      Cc3a: {7: 42},
      Cc1m: {1: 'foo'},
      Cc2m: {4: false},
      Cc3m: {7: 42},
      Cc1_bad1a: {1: 15},
      Cc1_bad2a: {8: 'foo'},
      Cc1_bad3a: {1: 'foo', 4: false},
      Cc1_bad1m: {1: 15},
      Cc1_bad2m: {3: 'foo'},
      Cc1_bad3m: {1: 'foo', '4': false},
      Cc1_bad4m: {'one': 'foo'}
    },
    map: {
      // API (decoded) and verbose values Map and Record
      RGB1: {'red': 24, 'green': 120, 'blue': 240},
      RGB2: {'red': 50, 'blue': 100},
      RGB3: {'red': 9, 'green': 80, 'blue': 96, 'alpha': 128},
      RGB_bad1a: {'red': 24, 'green': 120},
      RGB_bad2a: {'red': 9, 'green': 80, 'blue': 96, 'beta': 128},
      RGB_bad3a: {'red': 9, 'green': 80, 'blue': 96, 'alpha': 128, 'beta': 196},
      RGB_bad4a: {'red': 'four', 'green': 120, 'blue': 240},
      RGB_bad5a: {'red': 24, 'green': '120', 'blue': 240},
      RGB_bad6a: {'red': 24, 'green': 120, 'bleu': 240},
      RGB_bad7a: {'1': 24, 'green': 120, 'blue': 240},
      RGB_bad8a: {1: 24, 'green': 120, 'blue': 240},
      // Encoded values Map (minimized and dict/tag mode)
      Map1m: {2: 24, 4: 120, 6: 240},
      Map2m: {2: 50, 6: 100},
      Map3m: {2: 9, 4: 80, 6: 96, 9: 128},
      Map_bad1m: {2: 24, 4: 120},
      Map_bad2m: {2: 9, 4: 80, 6: 96, 9: 128, 12: 42},
      Map_bad3m: {2: 'four', 4: 120, 6: 240},
      Map_bad4m: {'two': 24, 4: 120, 6: 240},
      Map_bad5m: [24, 120, 240]
    },
    mapOf: {},
    record: {
      // Encoded values Record (minimized) and API+encoded Array values
      Rec1m: [24, 120, 240],
      Rec2m: [50, null, 100],
      Rec3m: [9, 80, 96, 128],
      Rec_bad1m: [24, 120],
      Rec_bad2m: [9, 80, 96, 128, 42],
      Rec_bad3m: ['four', 120, 240],
      // Encoded values Record (unused dict/tag mode)
      Rec1n: {1: 24, 2: 120, 3: 240},
      Rec2n: {1: 50, 3: 100},
      Rec3n: {1: 9, 2: 80, 3: 96, 4: 128},
      Rec_bad1n: {1: 24, 2: 120},
      Rec_bad2n: {1: 9, 2: 80, 3: 96, 4: 128, 5: 42},
      Rec_bad3n: {1: 'four', 2: 120, 3: 240},
      Rec_bad4n: {'one': 24, 2: 120, 3: 240},
      // Encoded values Record (concise)
      RGB1c: [24, 120, 240],
      RGB2c: [50, null, 100],
      RGB3c: [9, 80, 96, 128],
      RGB_bad1c: [24, 120],
      RGB_bad2c: [9, 80, 96, 128, 42],
      RGB_bad3c: ['four', 120, 240]
    }
  }
};


function run() {
  describe('Primitives', () => {
    test('Binary', () => {
      const { binary } = testValues.primitives;
      expect(schemaObj.decode('T-bin', binary.B1s)).toEqual(binary.B1b);
      expect(schemaObj.decode('T-bin', binary.B2s)).toEqual(binary.B2b);
      expect(schemaObj.decode('T-bin', binary.B3s)).toEqual(binary.B3b);
      expect(schemaObj.encode('T-bin', binary.B1b)).toEqual(binary.B1s);
      expect(schemaObj.encode('T-bin', binary.B2b)).toEqual(binary.B2s);
      expect(schemaObj.encode('T-bin', binary.B3b)).toEqual(binary.B3s);
      /*
      with assertRaises((TypeError, binascii.Error)):
        schemaObj.decode('T-bin', binary.B_bad1s)
      with assertRaises(ValueError):
        schemaObj.encode('T-bin', binary.B_bad1b)
      with assertRaises(ValueError):
        schemaObj.encode('T-bin', binary.B_bad2b)
      with assertRaises(ValueError):
        schemaObj.encode('T-bin', binary.B_bad3b)
        */
    });

    test('Boolean', () => {
        expect(schemaObj.decode('T-bool', true)).toEqual(true);
        expect(schemaObj.decode('T-bool', false)).toEqual(false);
        expect(schemaObj.encode('T-bool', true)).toEqual(true);
        expect(schemaObj.encode('T-bool', false)).toEqual(false);
        /*
        with assertRaises(ValueError):
          schemaObj.decode('T-bool', 'true')
        with assertRaises(ValueError):
          schemaObj.decode('T-bool', 1)
        with assertRaises(ValueError):
          schemaObj.encode('T-bool', 'true')
        with assertRaises(ValueError):
          schemaObj.encode('T-bool', 1)
        */
    });

    test('Integer', () => {
        expect(schemaObj.decode('T-int', 35)).toEqual(35);
        expect(schemaObj.encode('T-int', 35)).toEqual(35);
        /*
        with assertRaises(ValueError):
          schemaObj.decode('T-int', 35.4)
        with assertRaises(ValueError):
          schemaObj.decode('T-int', true)
        with assertRaises(ValueError):
          schemaObj.decode('T-int', 'hello')
        with assertRaises(ValueError):
          schemaObj.encode('T-int', 35.4)
        with assertRaises(ValueError):
          schemaObj.encode('T-int', true)
        with assertRaises(ValueError):
          schemaObj.encode('T-int', 'hello')
        */
    });

    test('Number', () => {
        expect(schemaObj.decode('T-num', 25.96)).toEqual(25.96);
        expect(schemaObj.decode('T-num', 25)).toEqual(25);
        expect(schemaObj.encode('T-num', 25.96)).toEqual(25.96);
        expect(schemaObj.encode('T-num', 25)).toEqual(25);
        /*
        with assertRaises(ValueError):
          schemaObj.decode('T-num', true)
        with assertRaises(ValueError):
          schemaObj.decode('T-num', 'hello')
        with assertRaises(ValueError):
          schemaObj.encode('T-num', true)
        with assertRaises(ValueError):
          schemaObj.encode('T-num', 'hello')
        */
    });

    test('String', () => {
        expect(schemaObj.decode('T-str', 'parrot')).toEqual('parrot');
        expect(schemaObj.encode('T-str', 'parrot')).toEqual('parrot');
        /*
        with assertRaises(ValueError):
          schemaObj.decode('T-str', true)
        with assertRaises(ValueError):
          schemaObj.decode('T-str', 1)
        with assertRaises(ValueError):
          schemaObj.encode('T-str', true)
        with assertRaises(ValueError):
          schemaObj.encode('T-str', 1)
          */
    });
  });

  describe('Enumeration', () => {
    describe('Enumerated', () => {
      test('Min', () => {
        expect(schemaObj.encode('T-enum', 'extra')).toEqual(15);
        expect(schemaObj.decode('T-enum', 15)).toEqual('extra');
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-enum', 'foo')
        with assertRaises(ValueError):
          schemaObj.encode('T-enum', 15)
        with assertRaises(ValueError):
          schemaObj.encode('T-enum', [1])
        with assertRaises(ValueError):
          schemaObj.decode('T-enum', 13)
        with assertRaises(ValueError):
          schemaObj.decode('T-enum', 'extra')
        with assertRaises(ValueError):
          schemaObj.decode('T-enum', ['first'])
        */
      });

      test('Verbose', () => {
        // schemaObj.set_mode(verbose_rec=true, verbose_str=true)
        expect(schemaObj.encode('T-enum', 'extra')).toEqual('extra');
        expect(schemaObj.decode('T-enum', 'extra')).toEqual('extra');
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-enum', 'foo')
        with assertRaises(ValueError):
          schemaObj.encode('T-enum', 42)
        with assertRaises(ValueError):
          schemaObj.encode('T-enum', ['first'])
        with assertRaises(ValueError):
          schemaObj.decode('T-enum', 'foo')
        with assertRaises(ValueError):
          schemaObj.decode('T-enum', 42)
        with assertRaises(ValueError):
          schemaObj.decode('T-enum', ['first'])
        */
      });

      test('ID Min', () => {
        expect(schemaObj.encode('T-enum-c', 15)).toEqual(15);
        expect(schemaObj.decode('T-enum-c', 15)).toEqual(15);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-enum-c', 'extra')
        with assertRaises(ValueError):
          schemaObj.decode('T-enum-c', 'extra')
        */
      });

      test('ID Verbose', () => {
        // schemaObj.set_mode(verbose_rec=true, verbose_str=true)
        expect(schemaObj.encode('T-enum-c', 15)).toEqual(15);
        expect(schemaObj.decode('T-enum-c', 15)).toEqual(15);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-enum-c', 'extra')
        with assertRaises(ValueError):
          schemaObj.decode('T-enum-c', 'extra')
        */
      });
    });
  });

  describe('Structured', () => {
    describe('Array', () => {
      const { array, record } = testValues.structured;
      
      const test_array = () => {
        expect(schemaObj.encode('T-array', array.Arr1)).toMatchObject(array.Arr1);
        expect(schemaObj.decode('T-array', array.Arr1)).toMatchObject(array.Arr1);
        expect(schemaObj.encode('T-array', array.Arr2)).toMatchObject(array.Arr2);
        expect(schemaObj.decode('T-array', array.Arr2)).toMatchObject(array.Arr2);
        expect(schemaObj.encode('T-array', array.Arr3)).toMatchObject(array.Arr3);
        expect(schemaObj.decode('T-array', array.Arr3)).toMatchObject(array.Arr3);
        expect(schemaObj.encode('T-array', array.Arr4)).toMatchObject(array.Arr4);
        expect(schemaObj.decode('T-array', array.Arr4)).toMatchObject(array.Arr4);
        expect(schemaObj.encode('T-array', array.Arr5)).toMatchObject(array.Arr5);
        expect(schemaObj.decode('T-array', array.Arr5)).toMatchObject(array.Arr5);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-array', array.Arr_bad1)
        with assertRaises(ValueError):
          schemaObj.decode('T-array', array.Arr_bad1)
        with assertRaises(ValueError):
          schemaObj.encode('T-array', array.Arr_bad2)
        with assertRaises(ValueError):
          schemaObj.decode('T-array', array.Arr_bad2)
        with assertRaises(ValueError):
          schemaObj.encode('T-array', array.Arr_bad3)
        with assertRaises(ValueError):
          schemaObj.decode('T-array', array.Arr_bad3)
        */

        expect(schemaObj.encode('T-arr-rgba', record.Rec1m)).toMatchObject(record.Rec1m);
        expect(schemaObj.decode('T-arr-rgba', record.Rec1m)).toMatchObject(record.Rec1m);
        expect(schemaObj.encode('T-arr-rgba', record.Rec2m)).toMatchObject(record.Rec2m);
        expect(schemaObj.decode('T-arr-rgba', record.Rec2m)).toMatchObject(record.Rec2m);
        expect(schemaObj.encode('T-arr-rgba', record.Rec3m)).toMatchObject(record.Rec3m);
        expect(schemaObj.decode('T-arr-rgba', record.Rec3m)).toMatchObject(record.Rec3m);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-arr-rgba', record.Rec_bad1m)
        with assertRaises(ValueError):
          schemaObj.decode('T-arr-rgba', record.Rec_bad1m)
        with assertRaises(ValueError):
          schemaObj.encode('T-arr-rgba', record.Rec_bad2m)
        with assertRaises(ValueError):
          schemaObj.decode('T-arr-rgba', record.Rec_bad2m)
        with assertRaises(ValueError):
          schemaObj.encode('T-arr-rgba', record.Rec_bad3m)
        with assertRaises(ValueError):
          schemaObj.decode('T-arr-rgba', record.Rec_bad3m)
        */
      };

      // Ensure that mode has no effect on array serialization
      /*
      schemaObj.set_mode(verbose_rec=false, verbose_str=false)
      test_array();
      schemaObj.set_mode(verbose_rec=false, verbose_str=true)
      test_array();
      schemaObj.set_mode(verbose_rec=true, verbose_str=false)
      test_array();
      schemaObj.set_mode(verbose_rec=true, verbose_str=true)
      */
      test_array();
    });

    describe('ArrayOf', () => {
      test('Basic', () => {
        expect(schemaObj.decode('T-array-of', [1, 4, 9, 16])).toMatchObject([1, 4, 9, 16]);
        expect(schemaObj.encode('T-array-of', [1, 4, 9, 16])).toMatchObject([1, 4, 9, 16]);
        /*
        with assertRaises(ValueError):
          schemaObj.decode('T-array-of', [1, '4', 9, 16])
        with assertRaises(ValueError):
          schemaObj.decode('T-array-of', 9)
        with assertRaises(ValueError):
          schemaObj.encode('T-array-of', [1, '4', 9, 16])
        with assertRaises(ValueError):
          schemaObj.decode('T-array-of', 9)
        */
      });
    });

    describe('Choice', () => {
      const { choice } = testValues.structured;
      test('Min', () => {
        expect(schemaObj.encode('T-choice', choice.C1a), choice.C1m);
        expect(schemaObj.decode('T-choice', choice.C1m), choice.C1a);
        expect(schemaObj.decode('T-choice', _j(choice.C1m)), choice.C1a);
        expect(schemaObj.encode('T-choice', choice.C2a), choice.C2m);
        expect(schemaObj.decode('T-choice', choice.C2m), choice.C2a);
        expect(schemaObj.decode('T-choice', _j(choice.C2m)), choice.C2a);
        expect(schemaObj.encode('T-choice', choice.C3a), choice.C3m);
        expect(schemaObj.decode('T-choice', choice.C3m), choice.C3a);
        expect(schemaObj.decode('T-choice', _j(choice.C3m)), choice.C3a);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-choice', choice.C1_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-choice', choice.C1_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-choice', choice.C1_bad3a)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad1m)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad2m)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad3m)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad4m)
        */
      });

      test('Verbose', () => {
        // schemaObj.set_mode(verbose_rec=true, verbose_str=true)
        expect(schemaObj.encode('T-choice', choice.C1a)).toEqual(choice.C1a);
        expect(schemaObj.decode('T-choice', choice.C1a)).toEqual(choice.C1a);
        expect(schemaObj.encode('T-choice', choice.C2a)).toEqual(choice.C2a);
        expect(schemaObj.decode('T-choice', choice.C2a)).toEqual(choice.C2a);
        expect(schemaObj.encode('T-choice', choice.C3a)).toEqual(choice.C3a);
        expect(schemaObj.decode('T-choice', choice.C3a)).toEqual(choice.C3a);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-choice', choice.C1_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-choice', choice.C1_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-choice', choice.C1_bad3a)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad1a)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad2a)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice', choice.C1_bad3a)
        */
      });

      test('ID Min', () => {
        expect(schemaObj.encode('T-choice-id', choice.Cc1a)).toEqual(choice.Cc1m);
        expect(schemaObj.decode('T-choice-id', choice.Cc1m)).toEqual(choice.Cc1a);
        expect(schemaObj.decode('T-choice-id', _j(choice.Cc1m))).toEqual(choice.Cc1a);
        expect(schemaObj.encode('T-choice-id', choice.Cc2a)).toEqual(choice.Cc2m);
        expect(schemaObj.decode('T-choice-id', choice.Cc2m)).toEqual(choice.Cc2a);
        expect(schemaObj.decode('T-choice-id', _j(choice.Cc2m))).toEqual(choice.Cc2a);
        expect(schemaObj.encode('T-choice-id', choice.Cc3a)).toEqual(choice.Cc3m);
        expect(schemaObj.decode('T-choice-id', choice.Cc3m)).toEqual(choice.Cc3a);
        expect(schemaObj.decode('T-choice-id', _j(choice.Cc3m))).toEqual(choice.Cc3a);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-choice-id', choice.Cc1_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-choice-id', choice.Cc1_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-choice-id', choice.Cc1_bad3a)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice-id', choice.Cc1_bad1m)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice-id', choice.Cc1_bad2m)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice-id', choice.Cc1_bad3m)
        with assertRaises(ValueError):
          schemaObj.decode('T-choice-id', choice.Cc1_bad4m)
        */
      });
      
      test('ID Verbose', () => {
        // schemaObj.set_mode(verbose_rec=true, verbose_str=true)
        expect(schemaObj.encode('T-choice-id', choice.Cc1a)).toEqual(choice.Cc1a);
        expect(schemaObj.decode('T-choice-id', choice.Cc1a)).toEqual(choice.Cc1a);
        expect(schemaObj.encode('T-choice-id', choice.Cc2a)).toEqual(choice.Cc2a);
        expect(schemaObj.decode('T-choice-id', choice.Cc2a)).toEqual(choice.Cc2a);
        expect(schemaObj.encode('T-choice-id', choice.Cc3a)).toEqual(choice.Cc3a);
        expect(schemaObj.decode('T-choice-id', choice.Cc3a)).toEqual(choice.Cc3a);
        /*
        with assertRaises(ValueError):
            schemaObj.encode('T-choice-id', choice.Cc1_bad1a)
        with assertRaises(ValueError):
            schemaObj.encode('T-choice-id', choice.Cc1_bad2a)
        with assertRaises(ValueError):
            schemaObj.encode('T-choice-id', choice.Cc1_bad3a)
        with assertRaises(ValueError):
            schemaObj.decode('T-choice-id', choice.Cc1_bad1a)
        with assertRaises(ValueError):
            schemaObj.decode('T-choice-id', choice.Cc1_bad2a)
        with assertRaises(ValueError):
            schemaObj.decode('T-choice-id', choice.Cc1_bad3a)
        */        
      });
    });

    describe('Map', () => {
      const { map } = testValues.structured;
  
      test('Min', () => {
        // dict structure, identifier tag
        expect(schemaObj.encode('T-map-rgba', map.RGB1)).toMatchObject(map.Map1m);
        expect(schemaObj.decode('T-map-rgba', map.Map1m)).toMatchObject(map.RGB1);
        expect(schemaObj.decode('T-map-rgba', _j(map.Map1m))).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-map-rgba', map.RGB2)).toMatchObject(map.Map2m);
        expect(schemaObj.decode('T-map-rgba', map.Map2m)).toMatchObject(map.RGB2);
        expect(schemaObj.decode('T-map-rgba', _j(map.Map2m))).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-map-rgba', map.RGB3)).toMatchObject(map.Map3m);
        expect(schemaObj.decode('T-map-rgba', map.Map3m)).toMatchObject(map.RGB3);
        expect(schemaObj.decode('T-map-rgba', _j(map.Map3m))).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad1m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad2m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad3m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad4m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad5m)
        */
      });
  
      test('Unused', () => {
        // dict structure, identifier tag
        // schemaObj.set_mode(verbose_rec=true, verbose_str=false)
        expect(schemaObj.encode('T-map-rgba', map.RGB1)).toMatchObject(map.Map1m);
        expect(schemaObj.decode('T-map-rgba', map.Map1m)).toMatchObject(map.RGB1);
        expect(schemaObj.decode('T-map-rgba', _j(map.Map1m))).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-map-rgba', map.RGB2)).toMatchObject(map.Map2m);
        expect(schemaObj.decode('T-map-rgba', map.Map2m)).toMatchObject(map.RGB2);
        expect(schemaObj.decode('T-map-rgba', _j(map.Map2m))).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-map-rgba', map.RGB3)).toMatchObject(map.Map3m);
        expect(schemaObj.decode('T-map-rgba', map.Map3m)).toMatchObject(map.RGB3);
        expect(schemaObj.decode('T-map-rgba', _j(map.Map3m))).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad1m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad2m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad3m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.Map_bad4m)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', _j(map.Map_bad4m))
        */
      });
  
      test('Concise', () => {
        // dict structure, identifier name
        // schemaObj.set_mode(verbose_rec=false, verbose_str=true)
        expect(schemaObj.encode('T-map-rgba', map.RGB1)).toMatchObject(map.RGB1);
        expect(schemaObj.decode('T-map-rgba', map.RGB1)).toMatchObject(map.GB1);
        expect(schemaObj.encode('T-map-rgba', map.RGB2)).toMatchObject(map.RGB2);
        expect(schemaObj.decode('T-map-rgba', map.RGB2)).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-map-rgba', map.RGB3)).toMatchObject(map.RGB3);
        expect(schemaObj.decode('T-map-rgba', map.RGB3)).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad7a)
          */
      });
  
      test('Verbose', () => {
        // dict structure, identifier name
        // schemaObj.set_mode(verbose_rec=true, verbose_str=true)
        expect(schemaObj.encode('T-map-rgba', map.RGB1)).toMatchObject(map.RGB1);
        expect(schemaObj.decode('T-map-rgba', map.RGB1)).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-map-rgba', map.RGB2)).toMatchObject(map.RGB2);
        expect(schemaObj.decode('T-map-rgba', map.RGB2)).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-map-rgba', map.RGB3)).toMatchObject(map.RGB3);
        expect(schemaObj.decode('T-map-rgba', map.RGB3)).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.encode('T-map-rgba', map.RGB_bad8a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', Rmap.GB_bad4a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.decode('T-map-rgba', map.RGB_bad8a)
        */
      });
    });

    describe('MapOf', () => {});

    describe('Record', () => {
      const { map, record } = testValues.structured;

      test('Min', () => {
        expect(schemaObj.encode('T-rec-rgba', map.RGB1)).toMatchObject(record.Rec1m);
        expect(schemaObj.decode('T-rec-rgba', record.Rec1m)).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-rec-rgba', map.RGB2)).toMatchObject(record.Rec2m);
        expect(schemaObj.decode('T-rec-rgba', record.Rec2m)).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-rec-rgba', map.RGB3)).toMatchObject(record.Rec3m);
        expect(schemaObj.decode('T-rec-rgba', record.Rec3m)).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
            schemaObj.encode('T-rec-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
            schemaObj.decode('T-rec-rgba', map.Rec_bad1m)
        with assertRaises(ValueError):
            schemaObj.decode('T-rec-rgba', map.Rec_bad2m)
        with assertRaises(ValueError):
            schemaObj.decode('T-rec-rgba', map.Rec_bad3m)
        */
      });

      test('Unused', () => {
        // schemaObj.set_mode(verbose_rec=true, verbose_str=false)
        expect(schemaObj.encode('T-rec-rgba', map.RGB1)).toMatchObject(record.Rec1n);
        expect(schemaObj.decode('T-rec-rgba', record.Rec1n)).toMatchObject(map.RGB1);
        expect(schemaObj.decode('T-rec-rgba', _j(record.Rec1n))).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-rec-rgba', map.RGB2)).toMatchObject(record.Rec2n);
        expect(schemaObj.decode('T-rec-rgba', record.Rec2n)).toMatchObject(map.RGB2);
        expect(schemaObj.decode('T-rec-rgba', _j(record.Rec2n))).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-rec-rgba', map.RGB3)).toMatchObject(record.Rec3n);
        expect(schemaObj.decode('T-rec-rgba', record.Rec3n)).toMatchObject(map.RGB3);
        expect(schemaObj.decode('T-rec-rgba', _j(record.Rec3n))).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', record.Rec_bad1n)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', record.Rec_bad2n)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', record.Rec_bad3n)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', record.Rec_bad4n)
        */
      });

      test('Concise', () => {
        // schemaObj.set_mode(verbose_rec=false, verbose_str=true)
        expect(schemaObj.encode('T-rec-rgba', map.RGB1)).toMatchObject(map.RGB1c);
        expect(schemaObj.decode('T-rec-rgba', map.RGB1c)).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-rec-rgba', map.RGB2)).toMatchObject(map.RGB2c);
        expect(schemaObj.decode('T-rec-rgba', map.RGB2c)).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-rec-rgba', map.RGB3)).toMatchObject(map.RGB3c);
        expect(schemaObj.decode('T-rec-rgba', map.RGB3c)).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad1c)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad2c)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad3c)
        */
      });

      test('Verbose', () => {
        // schemaObj.set_mode(verbose_rec=true, verbose_str=true)
        expect(schemaObj.encode('T-rec-rgba', map.RGB1)).toMatchObject(map.RGB1);
        expect(schemaObj.decode('T-rec-rgba', map.RGB1)).toMatchObject(map.RGB1);
        expect(schemaObj.encode('T-rec-rgba', map.RGB2)).toMatchObject(map.RGB2);
        expect(schemaObj.decode('T-rec-rgba', map.RGB2)).toMatchObject(map.RGB2);
        expect(schemaObj.encode('T-rec-rgba', map.RGB3)).toMatchObject(map.RGB3);
        expect(schemaObj.decode('T-rec-rgba', map.RGB3)).toMatchObject(map.RGB3);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.encode('T-rec-rgba', map.RGB_bad8a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad1a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad2a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad3a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad4a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad5a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad6a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad7a)
        with assertRaises(ValueError):
          schemaObj.decode('T-rec-rgba', map.RGB_bad8a)
        */
      });
    });
  });
}

export default run;