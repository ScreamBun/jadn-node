import { ValidationError } from '../../lib/jadnschema/exceptions'

const response = {
    "status": 200,
    "status_text": "string",
    "results": {
        // "x-command": {"ref": "INTERNALREFERENCEVALUEABC123"}
        "pairs": {"scan": ["file"], "query": ["features"]}
    }
}

function run(schemaObj) {
  test('Validate Response Specific', () => {
    const rsp = schemaObj.validateAs(response, 'OpenC2-Response');
    expect(rsp).toEqual([]);
  });

  test('Validate Response Generic', () => {
    const rsp = schemaObj.validate(response);
    expect(rsp).toEqual(undefined);
  });

}

export default run;
