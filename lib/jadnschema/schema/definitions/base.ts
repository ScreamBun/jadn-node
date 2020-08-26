// JADN Base Definition Structures
import { DefinitionData } from '.';
import {
  SchemaSimpleType, SchemaObjectType
} from './interfaces';
import {
  isBuiltin, isCompound, isPrimitive, isStructure, JADNTypes
} from './utils';
import BaseModel from '../base';
import { Field, EnumeratedField } from '../fields';
import Options from '../options';
import { DuplicateError, FormatError, ValidationError } from '../../exceptions';
import {
  flattenArray, hasProperty, objectValues, safeGet, zip
} from '../../utils';

export const Slots: Array<string> = ['name', 'type', 'options', 'description', 'fields'];


class DefinitionBase extends BaseModel {
  _name: string
  type: string
  options: Options
  description: string
  fields: Array<Field|EnumeratedField>

  // Helper Variables
  slots: Array<string> = Slots;

  /**
    * Create a DefinitionBase
    * @param {SchemaObjectType|SchemaSimpleType|DefinitionData} data - Base data
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: SchemaObjectType|SchemaSimpleType|DefinitionData, kwargs?: Record<string, any>) {
    super(data, kwargs);
    // Field Vars
    this._name = safeGet(this, 'name', '') as string;
    this.type = safeGet(this, 'type', 'Definition') as string;
    this.options = safeGet(this, 'options', new Options()) as Options;
    this.description = safeGet(this, 'description', '') as string;
    this.fields = safeGet(this, 'fields', []) as Array<Field|EnumeratedField>;

    // Definition Config
    const hasFields = hasProperty(this, 'fields') && !(this.fields === null || this.fields === undefined);

    if (flattenArray(objectValues(JADNTypes)).includes(safeGet(this, 'name'))) {
      throw new FormatError(`${this.name}(${this.type}) cannot be the name of a JADN type`);
    }

    if (this.isCompound() && !hasFields) {
      throw new FormatError(`${this.name}(${this.type}) must have defined fields`);
    }

    if (!this.isCompound() && this.fields.length > 0) {
      throw new FormatError(`${this.name}(${this.type}) improperly formatted`);
    }

    if (hasFields) {
      const field = this.baseType === 'Enumerated' ? EnumeratedField : Field;
      if (!this.fields?.every(f => f instanceof field)) {
        throw new FormatError(`${this.name}(${this.type}) has improperly formatted field(s)`);
      }
    }
  }

  /**
    * Initialize base data
    * @param {SchemaObjectType|SchemaSimpleType|DefinitionData} data - Base data
    * @return {SchemaObjectType} - initialized data
    */
  initData(data: SchemaObjectType|SchemaSimpleType|DefinitionData): SchemaObjectType {
    let d: SchemaObjectType;
    if (typeof data === 'object' && Array.isArray(data)) {
      d = zip(Slots, data) as SchemaObjectType;
    } else if (data instanceof DefinitionBase) {
      d = data.object() as SchemaObjectType;
    } else {
      d = data;
    }
    d.description = d.description.replace(/\.$/, '');
    return d;
  }

  toString(): string {
    const defType = this.constructor.name === 'Definition' ? this.type : this.constructor.name;
    return `${this.name}(${defType})`;
  }

  /**
    * Return base type of derived subtypes
    * @return {string} basetype of the defintion
    */
  get baseType(): string {
    const idx: number = this.type.lastIndexOf('.');
    return this.type.substring(0, idx < 0 ? this.type.length : idx);
  }

  /**
    * Determine the dependencies of the definition
    * @return {Set<string>} dependency names of the current definition
    */
  get dependencies(): Set<string> {
    const optionDeps = (typeDef: DefinitionBase|Field): Set<string> => {
      const d: Set<string> = new Set();
      const type = safeGet(typeDef, 'baseType', typeDef.type) as string;
      if (['ArrayOf', 'MapOf'].includes(type)) {
        [typeDef.options.get('ktype'), typeDef.options.get('vtype')].forEach((k: string) => {
          if (k && !isBuiltin(k)) {
            d.add(k);
          }
        });
      }
      return d;
    };

    let deps: Set<string> = optionDeps(this);

    if (this.isCompound() && this.baseType !== 'Enumerated') {
      (this.fields || []).forEach(f => {
        const field = f as Field;
        deps = new Set([ ...deps, ...optionDeps(field)]);
        if (!isBuiltin(field.type)) {
          if (field.type !== this.name) {
            deps.add(field.type);
          }
        }
      });
    }

    return deps;
  }

  /**
    * Determine the types of the field for the definition
    * @return {Set<string>} field types
    */
  get fieldTypes(): Set<string> {
    const types: Set<string> = new Set();
    if (this.isCompound() && this.baseType !== 'Enumerated') {
      (this.fields || []).forEach(f => {
        const field = f as Field;
        if (!isBuiltin(field.type)) {
          types.add(field.type);
        }
      });
    }
    return types;
  }

  /**
    * Validate the name of the definition
    * @param {string} val - name to validate
    */
  set name(val: string) {
    const config = this._config();
    // TODO: Read TypeName regex from schema.info.config
    const TypeName = new RegExp(config.info.config.TypeName);
    if (!TypeName.exec(val)) {
      throw new ValidationError(`Name invalid - ${val}`);
    }
    this._name = val;
  }

  get name(): string {
    return this._name;
  }

  /**
    * Format this definition into valid JADN format
    * @param {boolean} strip - strip comments from schema
    * @return {SchemaSimpleType} JADN formatted definition
    */
  schema(strip?: boolean): SchemaSimpleType {
    strip = typeof strip === 'boolean' ? strip : false; // eslint-disable-line no-param-reassign
    const rtn: SchemaSimpleType = [this.name, this.type, this.options.schema(this.type, this.name), strip ? '' : this.description, []];
    if (this.isCompound()) {
      rtn[4] = (this.fields || []).map(f => f.schema(strip));
    }
    return rtn;
  }

  /**
    * Verify the definition is proper
    * @param {Set<string>} schemaTypes - types within the schema
    * @param {boolean} silent - raise or return errors
    * @return {Array<Error>} list of errors
    */
  verify(schemaTypes: Set<string>, silent?: boolean): Array<Error> {
    silent = silent || false; // eslint-disable-line no-param-reassign
    let errors: Array<Error> = this.options.verify(this.baseType, this.name, silent) || [];

    if (this.fields) {
      if (['Array', 'Choice', 'Enumerated', 'Map', 'Record'].includes(this.baseType)) {
        if (this.baseType !== 'Enumerated') {
          const ordinal = ['Array', 'Record'].includes(this.baseType);
          const tags: Set<number> = new Set();
          const names: Set<string> = new Set();

          this.fields.forEach((f, idx) => {
            const field = f as Field;
            tags.add(field.id);
            names.add(field.name);

            if (ordinal && field.id !== (idx + 1)) {
              errors.push(new FormatError(`Item ID - ${this.name}(${this.baseType}).${field.name} -- ${field.id} should be ${idx + 1}`));
            }

            if (!schemaTypes.has(field.type)) {
              errors.push(new TypeError(`Type of ${this.name}.${field.name} not defined: ${field.type}`));
            }

            errors.push( ...field.options.verify(field.type, `${this.name}.${field.name}`, true, silent));
          });

          if (this.fields.length !== tags.size) {
            errors.push(new DuplicateError(`Tag count mismatch in ${this.name} - ${this.fields.length} items, ${tags.size} unique tags`));
          }

          if (this.fields.length !== names.size && this.baseType !== 'Array') {
            errors.push(new DuplicateError(`Name/Value count mismatch in ${this.name} - ${this.fields.length} items, ${names.size} unique names`));
          }
        }
      } else {
        errors.push(new FormatError(`Type of ${this.name}(${this.type}) should have defined fields`));
      }
    }

    errors = errors.filter(e => e);
    if (errors.length > 0 && !silent) {
      throw errors[0];
    }
    return errors;
  }

  /**
   * Validate a given instange against the definition
   * Function should be overriden by the subclass
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  validate(inst: any): Array<Error> {  // eslint-disable-line class-methods-use-this, no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    throw new ReferenceError(`${this.constructor.name} does not implement "validate"`);
  }

  // Helper Functions
  /**
    * Determine if the type is a JADN builtin type
    * @return {boolean} is builtin type
    */
  isBuiltin(): boolean {
    return isBuiltin(this.baseType);
  }

  /**
    * Determine if the given type is a JADN builtin primitive
    * @return {boolean} is builtin primitive
    */
  isPrimitive(): boolean {
    return isPrimitive(this.baseType);
  }

  /**
    * Determine if the given type is a JADN builtin structure
    * @return {boolean} is builtin structure
    */
   isStructure(): boolean {
    return isStructure(this.baseType);
  }

  /**
    * Determine if the given type is a JADN builtin compound (has definied fields)
    * @param {string} vtype - Type to check as a compound
    * @return {boolean} is builtin cpmpound
    */
   isCompound(): boolean {
    return isCompound(this.baseType);
  }

  /**
    * Get a field by name
    * @param {string} name - field name to get the definition of
    * @returns {Field} field definition
   */
  getField(name: string): Field {
    if (this.isCompound()) {
      const field = (this.fields || []).filter(f => {
        return (f as Field).name === name;
      }) as Array<Field>;
      if (field.length === 1) {
        return field[0];
      }
      throw new FormatError(`${this.constructor.name} does not have a field by the name of ${name}`);
    }
    throw new FormatError(`${this.constructor.name} does not have fields`);
  }

  // Extended Helper functions
  processOptions(): void {
    // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment
    const EnumeratedDef = require('./enumerated').default;
    const config = this._config();

    function enumerated(def: DefinitionBase): typeof EnumeratedDef {
      if (['Binary', 'Boolean', 'Integer', 'Number', 'Null', 'String'].includes(def.type)) {
        throw new TypeError(`${def.toString()} cannot be extended as an enumerated type`);
      }

      if (def.type === 'Enumerated') {
        return def;
      }

      const data: SchemaObjectType = {
        name: `Enum-${def.name}`,
        type: 'Enumerated',
        options: new Options(),
        description: `Derived Enumerated from ${def.name}`,
        fields: def.fields.map(f => (f as Field).enumField() )
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return new EnumeratedDef(data, {_config: def._config});
    }

    const key = safeGet(this.options, 'ktype', '') as string;
    if (key.startsWith('$')) {
      const ktype = this.options.ktype || '';
      if (!(ktype in config.derived)) {
        const typeDef = safeGet(config.types, ktype.substring(1), null) as null|DefinitionBase;
        if (typeDef) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          config.derived[ktype] = enumerated(typeDef);
        }
      }
    }

    const value = safeGet(this.options, 'vtype', '') as string;
    if (value.startsWith('$')) {
      const vtype = this.options.vtype || '';
      if (!(vtype in config.derived)) {
        const typeDef = safeGet(config.types, vtype.substring(1), null) as null|DefinitionBase;
        if (typeDef) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          config.derived[vtype] = enumerated(typeDef);
        }
      }
    }
  }
}

export default DefinitionBase;