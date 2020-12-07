import compoundTests from './compound';
import basicTypesTests from './basicTypes';
import listCardinalityTests from './listCardinality';
import listTypesTests from './listTypes';
import selectorTests from './selectors';


function run() {
  describe('Basic Types Tests', () => {
    basicTypesTests();
  });

  describe('Compound Tests', () => {
    compoundTests();
  });

  describe('Selector Tests', () => {
    selectorTests();
  });

  describe('List Cardinaity Tests', () => {
    listCardinalityTests();
  });

  describe('List Types Tests', () => {
    listTypesTests();
  });

  describe('Bounds Tests', () => {});

  describe('Format Tests', () => {});

  describe('JADN Tests', () => {});

  describe('Simplify Tests', () => {});
}

export default run;