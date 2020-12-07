import fs from 'fs-extra';
import path from 'path';

import { convert, CommentLevels } from '../../lib/api';

const TRANSLATIONS_DIR = path.join(__dirname, 'translations');
const TRANSLATIONS = {};


function run(schemaObj) {
  beforeAll(() => {
    fs.readdirSync(TRANSLATIONS_DIR).forEach(valTrans => {
      TRANSLATIONS[valTrans] = fs.readFileSync(path.join(TRANSLATIONS_DIR, valTrans), 'utf8');
    });
  });

  describe('HTML', () => {
    test('JADN -> HTML', () => {
      const html = convert.schema.html.dumps(schemaObj);
      expect(html).toEqual(TRANSLATIONS['schema.html'] || '');
    });
  });

  describe('JADN', () => {
    test('JADN -> JADN, All Comments', () => {
      const jadn = convert.schema.jadn.dumps(schemaObj, CommentLevels.ALL);
      expect(jadn).toEqual(TRANSLATIONS['schema.all.jadn'] || '');
    });

    test('JADN -> JADN, No Comments', () => {
      const jadn = convert.schema.jadn.dumps(schemaObj, CommentLevels.NONE);
      expect(jadn).toEqual(TRANSLATIONS['schema.none.jadn'] || '');
    });
    
    test('JADN -> Simplify', () => {
      const simple = schemaObj.simplify(false, true, true, true, true).dumps();
      expect(simple).toEqual(TRANSLATIONS['schema.simple.jadn'] || '');
    });
  
    test('JADN -> Pretty Format', () => {
      const html = schemaObj.dumps();
      expect(html).toEqual(TRANSLATIONS['schema.reorg.jadn'] || '');
    });
  });

  describe('JIDL', () => {
    test('JIDL -> JIDL, All Comments', () => {
      const jidl = convert.schema.jidl.dumps(schemaObj, CommentLevels.ALL);
      expect(jidl).toEqual(TRANSLATIONS['schema.all.jidl'] || '');
    });

    test('JIDL -> JIDL, No Comments', () => {
      const jidl = convert.schema.jidl.dumps(schemaObj, CommentLevels.NONE);
      expect(jidl).toEqual(TRANSLATIONS['schema.none.jidl'] || '');
    });
  });

  describe('JSON', () => {
    test('JADN -> JSON, All Comments', () => {
      const json = convert.schema.json.dumps(schemaObj, CommentLevels.ALL);
      expect(json).toEqual(TRANSLATIONS['schema.all.json'] || '');
    });

    test('JADN -> JSON, No Comments', () => {
      const json = convert.schema.json.dumps(schemaObj, CommentLevels.NONE);
      expect(json).toEqual(TRANSLATIONS['schema.none.json'] || '');
    });
  });

  describe('MarkDown', () => {
    test('JADN -> MarkDown', () => {
      const md = convert.schema.md.dumps(schemaObj);
      expect(md).toEqual(TRANSLATIONS['schema.md'] || '');
    });
  });
}

export default run;