import specificCmdTest from './cmd-specific';
import genericCmdTest from './cmd-generic';
import simpleRspTest from './rsp-simple';

function run(schemaObj) {
  describe('Command Specific Validation', () => {
    specificCmdTest(schemaObj);
  });

  describe('Command Generic Validation', () => {
    genericCmdTest(schemaObj);
  });

  // describe('Response Specific Validation', () => {
    simpleRspTest(schemaObj);
  // });
}

export default run;