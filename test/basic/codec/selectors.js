import { _j, selectorSchema } from './consts';
import { jadn } from '../../../lib/api';

const schemaObj = jadn.loads(selectorSchema);
const testValues = {
  arr: {
    name1_api: ['count', 17],
    name2_api: ['color', 'green'],
    name3_api: ['animal', {'cat': 'Fluffy'}],
    name4_bad_api: ['name', 17],        // name is type String, not Integer
    name5_bad_api: ['universe', 17],    // universe is not a defined type
    // names1_api: ['count', [13, 17]]    // array of values of the specified type
    name_a1_api: ['rattr', {'length': 4, 'weight': 5.6}],
    names_a1_api: ['rattrs', [{'length': 4, 'weight': 5.6}, {'length': 7, 'weight': 8.9}]],
    names_a2_api: ['rattr', [{'length': 4, 'weight': 5.6}, {'length': 7, 'weight': 8.9}]],
    name_p1_api: ['pair', [1, 'rug']],
    names_p1_api: ['pairs', [[3, 'rug'], [2, 'clock']]],
    names_p2_api: ['pair', [[3, 'rug'], [2, 'clock']]],

    tag1_api: [7, 17],                  // enumerated tag values are integers
    tag2_api: [6, 'green'],
    tag3_api: [5, {'cat': 'Fluffy'}],
    tag4_bad_api: [9, 17],              // name is type String, not Integer
    tag5_bad_api: [2, 17],              // 2 is not a defined type
    tags1_api: [7, [13, 17]],           // array of values of the specified type

    name1_min: [7, 17],                 // Enumerated type with 'id' option always uses min encoding (tag)
    name2_min: [6, 3],
    name3_min: [5, {3: 'Fluffy'}],      // min encoding of map (serialized keys are strings)
    name4_bad_min: [9, 17],
    name5_bad_min: [2, 17]
  },
  rec: {
    name1_api: {'type': 'count', 'value': 17},
    name2_api: {'type': 'color', 'value': 'green'},
    name3_api: {'type': 'animal', 'value': {'cat': 'Fluffy'}},
    name4_bad_api: {'type': 'name', 'value': 17},
    name5_bad_api: {'type': 'universe', 'value': 'Fred'}
  }
};
Object.assign(
  testValues,
  {
    arr: {
      tag1_min: testValues.arr.name1_min,
      tag2_min: testValues.arr.name2_min,
      tag3_min: testValues.arr.name3_min,
      tag4_bad_min: testValues.arr.name4_bad_min,
      tag5_bad_min: testValues.arr.name5_bad_min
    },
    rec: {
      name1_min: testValues.arr.name1_min,
      name2_min: testValues.arr.name2_min,
      name3_min: testValues.arr.name3_min,
      name4_bad_min: testValues.arr.name4_bad_min,
      name5_bad_min: testValues.arr.name5_bad_min
    }
  }
);


function run() {
  describe('Array', () => {
    const { arr } = testValues;

    test('Attr Name Verbose', () => {
        // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
        expect(schemaObj.encode('T-attr-arr-name', arr.name1_api)).toMaschemaObjhObject(arr.name1_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.name1_api)).toMaschemaObjhObject(arr.name1_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.name2_api)).toMaschemaObjhObject(arr.name2_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.name2_api)).toMaschemaObjhObject(arr.name2_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.name3_api)).toMaschemaObjhObject(arr.name3_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.name3_api)).toMaschemaObjhObject(arr.name3_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.name_a1_api)).toMaschemaObjhObject(arr.name_a1_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.name_a1_api)).toMaschemaObjhObject(arr.name_a1_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.names_a1_api)).toMaschemaObjhObject(arr.names_a1_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.names_a1_api)).toMaschemaObjhObject(arr.names_a1_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.name_p1_api)).toMaschemaObjhObject(arr.name_p1_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.name_p1_api)).toMaschemaObjhObject(arr.name_p1_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.names_p1_api)).toMaschemaObjhObject(arr.names_p1_api);
        expect(schemaObj.decode('T-attr-arr-name', arr.names_p1_api)).toMaschemaObjhObject(arr.names_p1_api);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-name', arr.name4_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-name', arr.name4_bad_api)
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-name', arr.name5_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-name', arr.name5_bad_api)
        */
    });

    test('Attr Tag Verbose', () => {
        // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
        expect(schemaObj.encode('T-attr-arr-tag', arr.tag1_api)).toMaschemaObjhObject(arr.tag1_api);
        expect(schemaObj.decode('T-attr-arr-tag', arr.tag1_api)).toMaschemaObjhObject(arr.tag1_api);
        expect(schemaObj.encode('T-attr-arr-tag', arr.tag2_api)).toMaschemaObjhObject(arr.tag2_api);
        expect(schemaObj.decode('T-attr-arr-tag', arr.tag2_api)).toMaschemaObjhObject(arr.tag2_api);
        expect(schemaObj.encode('T-attr-arr-tag', arr.tag3_api)).toMaschemaObjhObject(arr.tag3_api);
        expect(schemaObj.decode('T-attr-arr-tag', arr.tag3_api)).toMaschemaObjhObject(arr.tag3_api);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-tag', arr.tag4_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-tag', arr.tag4_bad_api)
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-tag', arr.tag5_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-tag', arr.tag5_bad_api)
        */
    });

    test('Attr Nam Min', () => {
        // schemaObj.set_mode(verbose_rec=False, verbose_str=False)
        expect(schemaObj.encode('T-attr-arr-name', arr.name1_api)).toMaschemaObjhObject(arr.name1_min);
        expect(schemaObj.decode('T-attr-arr-name', arr.name1_min), arr.name1_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.name2_api), arr.name2_min);
        expect(schemaObj.decode('T-attr-arr-name', arr.name2_min), arr.name2_api);
        expect(schemaObj.encode('T-attr-arr-name', arr.name3_api), arr.name3_min);
        expect(schemaObj.decode('T-attr-arr-name', arr.name3_min), arr.name3_api);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-name', arr.name4_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-name', arr.name4_bad_min)
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-name', arr.name5_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-name', arr.name5_bad_min)
        */
    });

    test('Attr Tag Min', () => {
        // schemaObj.set_mode(verbose_rec=False, verbose_str=False)
        expect(schemaObj.encode('T-attr-arr-tag', arr.tag1_api)).toMaschemaObjhObject(arr.tag1_min);
        expect(schemaObj.decode('T-attr-arr-tag', arr.tag1_min)).toMaschemaObjhObject(arr.tag1_api);
        expect(schemaObj.encode('T-attr-arr-tag', arr.tag2_api)).toMaschemaObjhObject(arr.tag2_min);
        expect(schemaObj.decode('T-attr-arr-tag', arr.tag2_min)).toMaschemaObjhObject(arr.tag2_api);
        expect(schemaObj.encode('T-attr-arr-tag', arr.tag3_api)).toMaschemaObjhObject(arr.tag3_min);
        expect(schemaObj.decode('T-attr-arr-tag', arr.tag3_min)).toMaschemaObjhObject(arr.tag3_api);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-tag', arr.tag4_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-tag', arr.tag4_bad_min)
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-arr-tag', arr.tag5_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-arr-tag', arr.tag5_bad_min)
        */
    });
  });

  describe('Record', () => {
    const { rec } = testValues;

    test('Attr Name Verbose', () => {
        // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
        expect(schemaObj.encode('T-attr-rec-name', rec.name1_api)).toMatchObject(rec.name1_api);
        expect(schemaObj.decode('T-attr-rec-name', rec.name1_api)).toMatchObject(rec.name1_api);
        expect(schemaObj.encode('T-attr-rec-name', rec.name2_api)).toMatchObject(rec.name2_api);
        expect(schemaObj.decode('T-attr-rec-name', rec.name2_api)).toMatchObject(rec.name2_api);
        expect(schemaObj.encode('T-attr-rec-name', rec.name3_api)).toMatchObject(rec.name3_api);
        expect(schemaObj.decode('T-attr-rec-name', rec.name3_api)).toMatchObject(rec.name3_api);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-rec-name', rec.name4_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-rec-name', rec.name4_bad_api)
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-rec-name', rec.name5_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-rec-name', rec.name5_bad_api)
        */
    });

    test('Attr Name Min', () => {
        // schemaObj.set_mode(verbose_rec=False, verbose_str=False)
        expect(schemaObj.encode('T-attr-rec-name', rec.name1_api)).toMatchObject(rec.name1_min);
        expect(schemaObj.decode('T-attr-rec-name', rec.name1_min)).toMatchObject(rec.name1_api);
        expect(schemaObj.encode('T-attr-rec-name', rec.name2_api)).toMatchObject(rec.name2_min);
        expect(schemaObj.decode('T-attr-rec-name', rec.name2_min)).toMatchObject(rec.name2_api);
        expect(schemaObj.encode('T-attr-rec-name', rec.name3_api)).toMatchObject(rec.name3_min);
        expect(schemaObj.decode('T-attr-rec-name', rec.name3_min)).toMatchObject(rec.name3_api);
        /*
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-rec-name', rec.name4_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-rec-name', rec.name4_bad_min)
        with assertRaises(ValueError):
          schemaObj.encode('T-attr-rec-name', rec.name5_bad_api)
        with assertRaises(ValueError):
          schemaObj.decode('T-attr-rec-name', rec.name5_bad_min)
        */
    });
  });

  /*
  pep_api = {'foo': 'bar', 'data': {'count': 17}}
    pec_api = {'foo': 'bar', 'data': {'animal': {'rat': {'length': 21, 'weight': .342}}}}
    pep_bad_api = {'foo': 'bar', 'data': {'turnip': ''}}

    def test_property_explicit_verbose(self):
        self.tc.set_mode(verbose_rec=True, verbose_str=True)
        self.assertDictEqual(self.tc.encode('T-property-explicit-primitive', self.pep_api), self.pep_api)
        self.assertDictEqual(self.tc.decode('T-property-explicit-primitive', self.pep_api), self.pep_api)
        self.assertDictEqual(self.tc.encode('T-property-explicit-category', self.pec_api), self.pec_api)
        self.assertDictEqual(self.tc.decode('T-property-explicit-category', self.pec_api), self.pec_api)
        with self.assertRaises(ValueError):
            self.tc.encode('T-property-explicit-primitive', self.pep_bad_api)
        with self.assertRaises(ValueError):
            self.tc.decode('T-property-explicit-primitive', self.pep_bad_api)

    pep_min = ['bar', {7: 17}]
    pec_min = ['bar', {2: {5: [21, 0.342]}}]
    pep_bad_min = ['bar', {'6': 17}]

    def test_property_explicit_min(self):
        self.tc.set_mode(verbose_rec=False, verbose_str=False)
        self.assertListEqual(self.tc.encode('T-property-explicit-primitive', self.pep_api), self.pep_min)
        self.assertDictEqual(self.tc.decode('T-property-explicit-primitive', self.pep_min), self.pep_api)
        self.assertListEqual(self.tc.encode('T-property-explicit-category', self.pec_api), self.pec_min)
        self.assertDictEqual(self.tc.decode('T-property-explicit-category', self.pec_min), self.pec_api)
        with self.assertRaises(ValueError):
            self.tc.encode('T-property-explicit-primitive', self.pep_bad_api)
        with self.assertRaises(ValueError):
            self.tc.decode('T-property-explicit-primitive', self.pep_bad_min)
  */
}

export default run;