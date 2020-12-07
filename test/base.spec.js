/**
  * Jest JADN Test Suite Init
  */
 import fs from 'fs-extra';
 import path from 'path';
 import { jadn } from '../lib/api';
 
 // Load tests
 import basicTest from './basic';
 import conversionTest from './convert';
 import transformationTest from './transform';
 import translationTest from './translation';
 import validationTest from './validation';
 
 // Load Base OpenC2 Lang Schema
 const schemaFile = path.join(__dirname, 'oc2ls-v1.1-lang.jadn')
 const schema = fs.readJSONSync(schemaFile);
 const schemaObj = jadn.loads(schema);
 
describe('JADN Test Suite', () => {
  describe('Basic Schema', () => {
    // basicTest();
  });

  describe('Schema Conversion', () => {
    // conversionTest();
  });

  describe('Transformation', () => {
    // transformationTest();
  });

  describe('Translation', () => {
    translationTest(schemaObj);
  });

  describe('Validataion', () => {
    validationTest(schemaObj);
  });
});