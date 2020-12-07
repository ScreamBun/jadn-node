import { jadn } from '../../lib/api';

const schema = {
  'types': [
    ['Person', 'Record', [], 'JADN equivalent of structure from https://developers.google.com/protocol-buffers', [
      [1, 'name', 'String', [], 'The person\'s name.'],
      [2, 'id', 'Integer', [], 'A person\'s unique id'],
      [3, 'email', 'String', ['[0', '/email'], 'An email address for the person.']
    ]
  ]]
};

const stripped_schema = {
  types: [
    ['Person', 'Record', [], '', [
      [1, 'name', 'String', [], ''],
      [2, 'id', 'Integer', [], ''],
      [3, 'email', 'String', ['[0', '/email'], '']
    ]
  ]]
};

const c20_schema = {
  types: [
    ['Person', 'Record', [], 'JADN equivalent of..', [
      [1, 'name', 'String', [], 'The person\'s name.'],
      [2, 'id', 'Integer', [], 'A person\'s unique id'],
      [3, 'email', 'String', ['[0', '/email'], 'An email address f..']
    ]
  ]]
};


function run() {
  test('Strip Comments', () => {
    const schemaObj = jadn.loads(schema);
    const strippedSchema = schemaObj.schema(true)
    expect(strippedSchema.types).toEqual(stripped_schema.types);
  });


  test('Truncate Comments', () => {
    const schemaObj = jadn.loads(schema);
    const strippedSchema = schemaObj.schema(20)
    expect(strippedSchema.types).toEqual(stripped_schema.types);
  });
}

export default run;