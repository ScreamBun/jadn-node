import fs from 'fs-extra';
import path from 'path';

import { convert, jadn, CommentLevels } from '../lib/api';
import { Schema } from '../lib/jadnschema/schema';


// TODO: Add CommentLevels, requires dump.py rewrite
class Conversions {
  private testDir: string
  private schema: string
  private baseSchema: string
  private schemaObj: Schema

  constructor(schema: string) {
    this.testDir = 'tests/schema_gen';
    this.schema = schema;
    this.baseSchema = path.join(__dirname, `schema/${this.schema}.jadn`);

    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir);
    }

    this.schemaObj = jadn.load(this.baseSchema)
  }

  HTML() {
    console.log('Convert: JADN --> HMTL')
    convert.schema.html.dump(this.schemaObj, path.join(this.testDir, this.schema + '.html'))
  }

  JADN() {
    console.log('Convert: JADN --> JADN')
    convert.schema.jadn.dump(this.schemaObj, path.join(this.testDir, this.schema + '.all.jadn'), null, CommentLevels.ALL)
    convert.schema.jadn.dump(this.schemaObj, path.join(this.testDir, this.schema + '.none.jadn'), null, CommentLevels.NONE)
  }

  JIDL() {
    console.log('Convert: JADN --> JIDL')
    convert.schema.jidl.dump(this.schemaObj, path.join(this.testDir, this.schema + '.jidl'))
    // console.log('Convert: JIDL --> JADN')
    // with open(path.join(this.testDir, this.schema + '.jidl.jadn'), 'w') as f:
    //     convert.schema.jidl.loads(open(path.join(this.testDir, this.schema + '.jidl'), 'rb').read()).dump(f)
  }

  JSON() {
    console.log('Convert: JADN --> JSON')
    convert.schema.json.dump(this.schemaObj, path.join(this.testDir, this.schema + '.all.json'), null, CommentLevels.ALL)
    convert.schema.json.dump(this.schemaObj, path.join(this.testDir, this.schema + '.none.json'), null, CommentLevels.NONE)
    // console.log('Convert: JSON --> JADN')
    // convert.schema.json.load(open(path.join(this.testDir, this.schema + '.all.json'), 'rb').read(), path.join(this.testDir, this.schema + '.json.jadn'))
  }

  MarkDown() {
    console.log('Convert: JADN --> MarkDown')
    convert.schema.md.dump(this.schemaObj, path.join(this.testDir, this.schema + '.md'))
  }

  // Tester Functions
  Analyze() {
    console.log('JADN --> Schema Analysis');
    Object.entries(this.schemaObj.analyze()).forEach(([k, v]) => {
      console.log(`${k}: ${v}`);
    });
  }

  Simplify() {
    console.log('JADN --> Simplify JADN');
    this.schemaObj.dump(path.join(this.testDir, this.schema + '.init_simple.jadn'));

    const simpleSchema = this.schemaObj.simplify(false) as Schema;
    simpleSchema.dump(path.join(this.testDir, this.schema + '.simple.jadn'));
  }

  prettyFormat() {
    console.log('JADN --> Formatted JADN');
    this.schemaObj.dump(`${this.testDir}/${this.schema}_reorg.jadn`);
  }
}

function duration(t0: Date, t1: Date) {
    const d = (t1.getMilliseconds() - t0.getMilliseconds());
    if (d <= 0) {
      return '0ms';
    }
    let t = '';

    const weekdays = Math.floor(d/1000/60/60/24/7);
    t += weekdays > 0 ? `${weekdays}weekdays` : '';

    const days = Math.floor(d/1000/60/60/24 - weekdays*7);
    t += days > 0 ? `${days}days` : '';

    const hrs = Math.floor(d/1000/60/60 - weekdays*7*24 - days*24);
    t += hrs > 0 ? `${hrs}hrs` : '';
    
    const min  = Math.floor(d/1000/60 - weekdays*7*24*60 - days*24*60 - hrs*60);
    t += min > 0 ? `${min}min` : '';
    
    const sec = Math.floor(d/1000 - weekdays*7*24*60*60 - days*24*60*60 - hrs*60*60 - min*60);
    t += sec > 0 ? `${sec}sec` : '';
    
    const ms = Math.floor(d - weekdays*7*24*60*60*1000 - days*24*60*60*1000 - hrs*60*60*1000 - min*60*1000 - sec*1000);
    t += ms > 0 ? `${ms}ms` : '';

    return t || '0ms';
}


// const schema = 'oc2ls-v1.0-csprd03-update'
// const schema = 'oc2ls-v1.0-csprd03-update_fix';
const schema = 'oc2ls-v1.1-lang_resolved';
const conversions = new Conversions(schema);
const validConversions = [
  conversions.HTML,
  conversions.JADN,
  conversions.JIDL,
  conversions.JSON,
  conversions.MarkDown,
  // Extra options
  conversions.Analyze,
  conversions.Simplify,
  conversions.prettyFormat
];

// conversions.Analyze()
console.log('\n' + '-‾-_'.repeat(20) + '\n')

validConversions.forEach(conv => {
  console.log(`Convert To/From: ${conv.name}`);
  const startTime = new Date();
  try {
    conv.bind(conversions)();
  } catch (err) {
    console.error(`Error: ${err}`);
  }
  console.log(duration(startTime, new Date()));
  console.log('\n');
});