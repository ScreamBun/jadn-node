

function run(schemaObj) {
  test('Schema Analysis', () => {
    const analysis = schemaObj.analyze();
    expect(analysis).toEqual({
      module: schemaObj.info.module,
      exports: schemaObj.info.exports,
      unreferenced: [],
      undefined: []
    });
  });

  // ... Add more basic tests once we need them in different files ...
}

export default run;