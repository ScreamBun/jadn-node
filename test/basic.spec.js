import fs from 'fs-extra';
import path from 'path';
import { jadn } from '../lib/api';

import basicTest from './basic';

// Schema
const schemaFile = path.join(__dirname, 'schema.json')
const schema = fs.readJSONSync(schemaFile);

// Test Setup
const schemaObj = jadn.loads(schema);

describe('Basic Schema Tests', () => {
  basicTest(schemaObj);
});