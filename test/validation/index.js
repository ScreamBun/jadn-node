import specificCmdTest from './cmd-specific';
import genericCmdTest from './cmd-generic';
import simpleRspTest from './rsp-simple';

function run(schemaObj) {
  specificCmdTest(schemaObj);
  genericCmdTest(schemaObj);
  simpleRspTest(schemaObj);
}

export default run;