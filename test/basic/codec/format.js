import { formatSchema } from './consts';
import { jadn } from '../../../lib/api';
import { binascii } from '../../../lib/jadnschema/utils';

const schemaObj = jadn.loads(formatSchema);
const testValues = {
  ipv4_b: binascii.a2b_hex('c6020304'),         // IPv4 address
  ipv4_s64: 'xgIDBA',                           // Base64url encoded
  ipv4_sx: 'C6020304',                          // Hex encoded
  ipv4_str: '198.2.3.4',                        // IPv4-string encoded
  ipv4_b1_bad: binascii.a2b_hex('c60203'),      // Too short
  ipv4_b2_bad: binascii.a2b_hex('c602030456'),  // Too long
  ipv4_s64_bad: 'xgIDBFY',                      // Too long
  ipv4_sx_bad: 'C602030456',                    // Too long
  ipv4_str_bad: '198.2.3.4.56'                  // Too long
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