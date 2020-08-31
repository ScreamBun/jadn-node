import fs from 'fs-extra';
import path from 'path';
import { jadn } from '../lib/api';

import translationTest from './translation';

// Schema
const schemaFile = path.join(__dirname, 'oc2ls-v1.0-lang.jadn')
const schema = fs.readJSONSync(schemaFile);

// Test Setup
const schemaObj = jadn.loads(schema);
console.log(`SCHEMA - ${JSON.stringify(schemaObj.info.config)}`);

describe('Translation Tests', () => {
  translationTest(schemaObj);
});