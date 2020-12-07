// import { jadn } from '../../lib/api';

function run(quickstart_schema) {
  test('Convert JIDL ??', () => {
  });
  /*
  def _jidl_convert(self, schema):
    jidl_doc = jadn.convert.jidl_dumps(schema)
    schema_new = jadn.convert.jidl_loads(jidl_doc)
    self.maxDiff = None
    self.assertEqual(jadn.canonicalize(schema), jadn.canonicalize(schema_new))

  def test_0_quickstart(self):
    self._jidl_convert(jadn.check(quickstart_schema))

  def test_1_types(self):
    self._jidl_convert(jadn.load('convert_types.jadn'))

  def test_2_jadn(self):
    self._jidl_convert(jadn.load(os.path.join(jadn.data_dir(), 'jadn_v1.0_schema.jadn')))

  def test_3_examples(self):
    self._jidl_convert(jadn.load('jadn-v1.0-examples.jadn'))
  */
}

export default run;