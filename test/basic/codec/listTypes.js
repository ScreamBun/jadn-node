import { listTypesSchema } from './consts';
import { jadn } from '../../../lib/api';

const schemaObj = jadn.loads(listTypesSchema);
const testValues = {
  prims: [
    {
      'bools': [true],
      'ints': [1, 2]
    },
    {'strs': ['cat', 'dog']}
  ],
  enums: [
    {'enums': ['heads', 'tails']},
    {'enums': ['heads']},
    {'enums': ['heads']},
    {'enums': ['tails']},
    {'enums': ['heads']},
    {'enums': ['tails']}
  ]
};

function run() {
  test('List Primitives', () => {
    const { enums, prims } = testValues;
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.encode('T-list', prims)).toMatchObject(prims);
    expect(schemaObj.decode('T-list', prims)).toMatchObject(prims);
    expect(schemaObj.encode('T-list', enums)).toMatchObject(enums);
    expect(schemaObj.decode('T-list', enums)).toMatchObject(enums);
  });
}

export default run;