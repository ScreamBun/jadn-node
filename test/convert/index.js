import htmlTests from './html';
import jidlTests from './jidl';

const quickstart_schema = {
  types: [
    ['Person', 'Record', [], 'JADN equivalent of structure from https://developers.google.com/protocol-buffers', [
      [1, 'name', 'String', [], ''],
      [2, 'id', 'Integer', [], ''],
      [3, 'email', 'String', ['/email', '[0'], '']
    ]]
  ]
};

function run() {
  htmlTests(quickstart_schema);
  jidlTests(quickstart_schema);
}

export default run;