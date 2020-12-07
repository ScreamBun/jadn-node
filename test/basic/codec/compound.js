import { compoundSchema } from './consts';
import { jadn } from '../../../lib/api';

const schemaObj = jadn.loads(compoundSchema);
const testValues = {
  C4a: {'rec': {'a': 1, 'b': 'c'}},
  C4m: {10: [1, 'c']}
};

function run() {
  test('Choice Rec Verbose', () => {
    // schemaObj.set_mode(verbose_rec=True, verbose_str=True)
    expect(schemaObj.decode('T-choice', testValues.C4a)).toMatchObject(testValues.C4a);
    expect(schemaObj.encode('T-choice', testValues.C4a)).toMatchObject(testValues.C4a);
  });

  test('Choice Rec Min', () => {
    // schemaObj.set_mode(verbose_rec=False, verbose_str=False)
    expect(schemaObj.decode('T-choice', testValues.C4m)).toMatchObject(testValues.C4a);
    expect(schemaObj.encode('T-choice', testValues.C4a)).toMatchObject(testValues.C4m);
  });
}

export default run;