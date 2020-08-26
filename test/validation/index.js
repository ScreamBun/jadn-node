import simpleCmdTest from './cmd-simple';
import simpleRspTest from './rsp-simple';

function run(schemaObj) {
  simpleCmdTest(schemaObj);
  simpleRspTest(schemaObj);
}

export default run;