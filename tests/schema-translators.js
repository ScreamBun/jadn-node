import fs from 'fs-extra';
import path from 'path';

import { convert, jadn, CommentLevels } from '../lib/jadnschema';

/*
from datetime import datetime

from jadnschema import (
  convert,
  jadn,
  # Enums
  CommentLevels,
)
*/

// TODO: Add CommentLevels, requires dump.py rewrite
class Conversions {
  constructor(schema) {
    this._test_dir = 'tests/schema_gen';
    this._schema = schema;
    this._base_schema = path.join(__dirname, `schema/${this._schema}.jadn`);

    if (!fs.existsSync(this._test_dir)) {
      fs.mkdirSync(this._test_dir);
    }

    this._schemaObj = jadn.load(this._base_schema)
  }

  CDDL() {
    console.log('Convert: JADN --> CDDL')
    convert.cddl_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.all.cddl'), null, CommentLevels.ALL)
    convert.cddl_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.none.cddl'), null, CommentLevels.NONE)
    // console.log('Convert: CDDL --> JADN')
    // convert.cddl_load(open(path.join(this._test_dir, this._schema + '.all.cddl'), 'rb').read(), path.join(this._test_dir, this._schema + '.cddl.jadn'))
  }

  HTML() {
    console.log('Convert: JADN --> HMTL Tables')
    convert.html_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.html'))
  }

  JADN() {
    console.log('Convert: JADN --> JADN')
    convert.jadn_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.all.jadn'), null, CommentLevels.ALL)
    convert.jadn_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.none.jadn'), null, CommentLevels.NONE)
  }

  JAS() {
    console.log('Convert: JADN --> JAS')
    convert.jas_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.jas'))
    // console.log('Convert: JAS --> JADN ')
    // convert.jas_load(open(path.join(this._test_dir, this._schema + '.jas'), 'rb').read(), path.join(this._test_dir, this._schema + '.jas.jadn'))
  }

  JIDL() {
    console.log('Convert: JADN --> JIDL')
    convert.jidl_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.jidl'))
    // console.log('Convert: JIDL --> JADN')
    // with open(path.join(this._test_dir, this._schema + '.jidl.jadn'), 'w') as f:
    //     convert.jidl_loads(open(path.join(this._test_dir, this._schema + '.jidl'), 'rb').read()).dump(f)
  }

  JSON() {
    console.log('Convert: JADN --> JSON')
    convert.json_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.all.json'), null, CommentLevels.ALL)
    convert.json_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.none.json'), null, CommentLevels.NONE)
    // console.log('Convert: JSON --> JADN')
    // convert.json_load(open(path.join(this._test_dir, this._schema + '.all.json'), 'rb').read(), path.join(this._test_dir, this._schema + '.json.jadn'))
  }

  MarkDown() {
    console.log('Convert: JADN --> MarkDown')
    convert.md_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.md'))
  }

  ProtoBuf() {
    console.log('Convert: JADN --> ProtoBuf')
    convert.proto_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.all.proto'), null, CommentLevels.ALL)
    convert.proto_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.none.proto'), null, CommentLevels.NONE)
    // console.log('Convert: ProtoBuf --> JADN')
    // convert.proto_load(open(path.join(this._test_dir, this._schema + '.all.proto'), 'rb').read(), path.join(this._test_dir, this._schema + '.proto.jadn'))
  }

  Relax_NG() {
    console.log('Convert: JADN --> RelaxNG')
    convert.relax_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.all.rng'), null, CommentLevels.ALL)
    convert.relax_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.none.rng'), null, CommentLevels.NONE)
    // console.log('Convert: RelaxNG --> JADN')
    // convert.relax_load(open(path.join(this._test_dir, this._schema + '.all.rng'), 'rb').read(), path.join(this._test_dir, this._schema + '.rng.jadn'))
  }

  Thrift() {
    console.log('Convert: JADN --> Thrift')
    convert.thrift_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.all.thrift'), null, CommentLevels.ALL)
    convert.thrift_dump(this._schemaObj, path.join(this._test_dir, this._schema + '.none.thrift'), null, CommentLevels.NONE)
    // console.log('Convert: Thrift --> JADN')
    // convert.thrift_load(open(path.join(this._test_dir, this._schema + '.all.thrift'), 'rb').read(), path.join(this._test_dir, this._schema + '.thrift.jadn'))
  }

  // Tester Functions
  Analyze() {
    console.log('JADN --> Schema Analysis');
    Object.entries(this._schemaObj.analyze()).forEach(([k, v]) => {
      console.log(`${k}: ${v}`);
    });
  }

  /*
  Simplify() {
    console.log('JADN --> Simplify JADN')
    with open(path.join(this._test_dir, this._schema + '.init_simple.jadn'), 'w') as f:
      this._schemaObj.dump(f)

    simple_schema = this._schemaObj.simplify(simple = False)
    with open(path.join(this._test_dir, this._schema + '.simple.jadn'), 'w') as f:
      simple_schema.dump(f)
  }
  */

  prettyFormat() {
    console.log('JADN --> Formatted JADN');
    this._schemaObj.dump(`${this._test_dir}/${this._schema}_reorg.jadn`);
  }
}

function duration(t0, t1){
    let d = (new Date(t1)) - (new Date(t0));
    let weekdays = Math.floor(d/1000/60/60/24/7);
    let days     = Math.floor(d/1000/60/60/24 - weekdays*7);
    let hrs      = Math.floor(d/1000/60/60    - weekdays*7*24            - days*24);
    let min      = Math.floor(d/1000/60       - weekdays*7*24*60         - days*24*60         - hrs*60);
    let sec      = Math.floor(d/1000          - weekdays*7*24*60*60      - days*24*60*60      - hrs*60*60      - min*60);
    let ms       = Math.floor(d               - weekdays*7*24*60*60*1000 - days*24*60*60*1000 - hrs*60*60*1000 - min*60*1000 - sec*1000);
    let t = '';
    ['weekdays', 'days', 'hrs', 'min', 'sec', 'ms'].map(q => {
      if (eval(q) > 0) {
        t = `${eval(q)}${q} ${t}`;
      }
    });
    return t || '0ms';
}


// schema = 'oc2ls-v1.0-csprd03-update'
const schema = 'oc2ls-v1.0-csprd03-update_fix';
const conversions = new Conversions(schema);
const validConversions = [
  // 'CDDL',
  'HTML',
  'JADN',
  // 'JAS',
  'JIDL',
  'JSON',
  'MarkDown',
  // 'ProtoBuf',
  // 'Relax_NG',
  // 'Thrift',
  // Extra options
  'Analyze',
  // 'Simplify',
  'prettyFormat'
];

// conversions.Analyze()
console.log('\n' + '-‾-_'.repeat(20) + '\n')

validConversions.forEach(conv => {
  if (conv in conversions) {
    console.log(`Convert To/From: ${conv}`);
    const startTime = new Date();
    try {
      conversions[conv]()
    } catch (err) {
      console.error(`Error: ${err}`)
    }
    console.log(duration(startTime, new Date()));
    console.log('\n');
  } else {
    console.log(`${conv} is not a valid conversion`);
  }
});