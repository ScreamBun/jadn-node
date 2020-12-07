import { boundsSchema } from './consts';
import { jadn } from '../../../lib/api';

const schemaObj = jadn.loads(boundsSchema);
const testValues = {
  i1: 1,
  i5: 5,
  i9: 9,
  f1: 1.0,
  f5: 5.5,
  f9: 9.8,
};

function run() {
  test('Integer', () => {
    schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.encode('Int', testValues.i1)).toEqual(testValues.i1);
    expect(schemaObj.decode('Int', testValues.i1)).toEqual(testValues.i1);
    expect(schemaObj.encode('Int', testValues.i5)).toEqual(testValues.i5);
    expect(schemaObj.decode('Int', testValues.i5)).toEqual(testValues.i5);
    expect(schemaObj.encode('Int', testValues.i9)).toEqual(testValues.i9);
    expect(schemaObj.decode('Int', testValues.i9)).toEqual(testValues.i9);
    expect(schemaObj.encode('Int-3-6', testValues.i5)).toEqual(testValues.i5);
    expect(schemaObj.decode('Int-3-6', testValues.i5)).toEqual(testValues.i5);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('Int-3-6', testValues.i1)
    with assertRaises(ValueError):
      schemaObj.encode('Int-3-6', testValues.i9)
    */
  });

  test('Number', () => {
    schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.encode('Num', testValues.f1)).toEqual(testValues.f1);
    expect(schemaObj.decode('Num', testValues.f1)).toEqual(testValues.f1);
    expect(schemaObj.encode('Num', testValues.f5)).toEqual(testValues.f5);
    expect(schemaObj.decode('Num', testValues.f5)).toEqual(testValues.f5);
    expect(schemaObj.encode('Num', testValues.f9)).toEqual(testValues.f9);
    expect(schemaObj.decode('Num', testValues.f9)).toEqual(testValues.f9);
    expect(schemaObj.encode('Num-3-6', testValues.f5)).toEqual(testValues.f5);
    expect(schemaObj.decode('Num-3-6', testValues.f5)).toEqual(testValues.f5);
    /*
    with assertRaises(ValueError):
      schemaObj.encode('Num-3-6', f1)
    with assertRaises(ValueError):
      schemaObj.encode('Num-3-6', f9)
    */
  });
}

export default run;