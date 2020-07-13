// JADN Definition Structures
import DefinitionBase, { Slots } from './base';
import ArrayDef from './array';
import ArrayOfDef from './arrayOf';
import ChoiceDef from './choice';
import EnumeratedDef from './enumerated';
import MapDef from './map';
import MapOfDef from './mapOf';
import RecordDef from './record';
import CustomDef from './custom';
import { SchemaObjectType, SchemaSimpleType } from './interfaces';
import { zip } from '../../utils';

export type DefinitionData = ArrayDef|ArrayOfDef|ChoiceDef|EnumeratedDef|MapDef|MapOfDef|RecordDef|CustomDef;


/**
 * Create a specific definition based on the given data
 * @param {SchemaObjectType|SchemaSimpleType|DefinitionData} data - data to create a definition
 * @param {Record<string, any>} kwargs - additional fields for the definition
 * @param DefinitionData - created definition
 */
// eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
export function makeDefinition(data: SchemaObjectType|SchemaSimpleType|DefinitionData, kwargs?: Record<string, any>): DefinitionData {
  let d: SchemaObjectType;
  if (typeof data === 'object' && Array.isArray(data)) {
    d = zip(Slots, data) as SchemaObjectType;
  } else if (data instanceof DefinitionBase) {
    d = data.object() as SchemaObjectType;
  } else {
    d = data;
  }

  switch (d.type) {
    case 'Array':
      return new ArrayDef(d, kwargs);
    case 'ArrayOf':
      return new ArrayOfDef(d, kwargs);
    case 'Choice':
      return new ChoiceDef(d, kwargs);
    case 'Enumerated':
      return new EnumeratedDef(d, kwargs);
    case 'Map':
      return new MapDef(d, kwargs);
    case 'MapOf':
      return new MapOfDef(d, kwargs);
    case 'Record':
      return new RecordDef(d, kwargs);
    default:
      return new CustomDef(d, kwargs);
  }
}

export {
  DefinitionBase,
  ArrayDef,
  ArrayOfDef,
  ChoiceDef,
  EnumeratedDef,
  MapDef,
  MapOfDef,
  RecordDef,
  CustomDef
};