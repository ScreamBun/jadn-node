/* eslint lines-between-class-members: 0, max-classes-per-file: 0 */
// JADN Field Models - Enumerated and General
import BaseModel from './base';
import {
  // Simple Interfaces
  SchemaSimpleEnumField,
  SchemaSimpleGenField,
  // Complex Interfaces
  SchemaObjectEnumField,
  SchemaObjectGenField,
  SchemaObjectType
} from './definitions/interfaces';
import Options from './options';

import { ValidationError } from '../exceptions';
import {
  capitalize,
  safeGet,
  zip
} from '../utils';

interface DefinitionBase {
  type: string;
  validate: Function;
}


const EnumeratedFieldSlots: Array<string> = ['id', 'value', 'description'];
const FieldSlots: Array<string> = ['id', 'name', 'type', 'options', 'description'];


class EnumeratedField extends BaseModel {
  id: number // the integer identifier of the item
  value: number|string // the value of the item
  description: string // a non-normative comment

  // Helper Variables
  slots: Array <string> = EnumeratedFieldSlots;

  /**
    * Initialize a Field object
    * @param {SchemaSimpleEnumField|EnumeratedField} schema - The JADN schema to utilize
    */
  constructor(data: SchemaSimpleEnumField|EnumeratedField) {
    super(data);
    this.id = safeGet(this, 'id', 0);
    this.value = safeGet(this, 'value', 'VALUE');
    this.description = safeGet(this, 'description', '');
  }

  /**
    * Initialize base data
    * @param {SchemaSimpleEnumField|EnumeratedField} data - Base data
    * @return {SchemaObjectEnumField} - initialized data
    */
  initData(data: SchemaSimpleEnumField|EnumeratedField): SchemaObjectEnumField {
    let d: SchemaObjectEnumField;
    if (typeof data === 'object' && Array.isArray(data)) {
      d = zip(EnumeratedFieldSlots, data) as SchemaObjectEnumField;
    } else if (data instanceof Field) {  // eslint-disable-line no-use-before-define, @typescript-eslint/no-use-before-define
      d = data.object() as SchemaObjectEnumField;
    } else {
      d = data;
    }
    d.description = d.description.replace(/\.$/, '');
    return d;
  }

  toString(): string {
    return `Enumerated Field ${this.value}(${this.id})`;
  }

  /**
    * Format this enumerated field into valid JADN format
    * @param {boolean} strip - strip comments from schema
    * @return {SchemaSimpleEnumField} - JADN formatted enumerated field
    */
  schema(strip?: boolean): SchemaSimpleEnumField {
    strip = typeof strip === 'boolean' ? strip : false; // eslint-disable-line no-param-reassign
    try {
        return [this.id, this.value, strip ? '' : this.description];
    } catch (err) {
      console.log(err);
      return [0, 'error', strip ? '' : 'Error has occured'];
    }
  }

  /**
    * Format this enumerated field into valid JADN format
    * @return {SchemaSimpleField} - JADN formatted enumerated field
    */
   schemaStrip(): SchemaSimpleEnumField {
    try {
        return [this.id, this.value, ''];
    } catch (err) {
      console.log(err);
      return [0, 'error', 'Error has occured'];
    }
  }
}


class Field extends BaseModel {
  id: number  // the integer identifier of the field
  _name: string  // the name or label of the field
  type: string  // the type of the field
  options: Options  // array of zero or more FieldOption or TypeOptios applicable to the field
  description: string  // a non-normative comment

  // Helper Variables
  slots: Array <string> = FieldSlots;

  /**
    * Initialize a Field object
    * @param {SchemaSimpleGenField|Field} schema - The JADN schema to utilize
    * @param {Record<string, any>} kwargs - extra field values for the class
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: SchemaSimpleGenField|Field, kwargs?: Record<string, any> ) {
    super(data, kwargs);
    // Field Vars
    this.id = safeGet(this, 'id', 0);
    this._name = safeGet(this, 'name', 'NAME');
    this.type = safeGet(this, 'type', 'FIELD');
    this.options = safeGet(this, 'options', new Options());
    this.description = safeGet(this, 'description', '');
  }

  /**
    * Initialize base data
    * @param {SchemaSimpleGenField|Field} data - Base data
    * @return {SchemaObjectGenField} - initialized data
    */
  initData(data: SchemaSimpleGenField|Field): SchemaObjectGenField {
    let d: SchemaObjectGenField;
    if (typeof data === 'object' && Array.isArray(data)) {
      d = zip(FieldSlots, data) as SchemaObjectGenField;
      // d.options = new Options(d.options);
    } else if (data instanceof Field) {
      d = data.object() as SchemaObjectGenField;
    } else {
      d = data;
    }
    d.description = d.description.replace(/\.$/, '');
    return d;
  }

  toString(): string {
    return `Field ${this.name}(${this.type})`;
  }

  /**
    * Check is the field is a required field
    * @return {boolean} - required/optional
    */
  get required(): boolean {
    return this.options.get('minc', 0) !== 0;
  }

  /**
    * Validate the name of the definition
    * @param {string} val - name to validate
    */
  set name(val: string) {
    const config = this._config();
    const FieldName = new RegExp(config.meta.config.FieldName);
    if (!FieldName.exec(val)) {
      throw new ValidationError(`Name invalid - ${val}`);
    }
    this._name = val;
  }

  get name(): string {
    return this._name;
  }

  /**
    * Format this field into valid JADN format
    * @param {boolean} strip - strip comments from schema
    * @return {SchemaSimpleGenField} JADN formatted field
    */
  schema(strip?: boolean): SchemaSimpleGenField {
    strip = typeof strip === 'boolean' ? strip : false; // eslint-disable-line no-param-reassign
    try {
      return [this.id, this.name, this.type, this.options.schema(this.type, this.name, true), strip ? '' : this.description];
    } catch (err) {
      console.log(err);
      return [0, 'error', 'string', [], strip ? '' : 'Error has occured'];
    }
  }

  /**
    *  Validate the field value against the defined type
    * @param {any} inst
    * @param {boolean} cardEnforce
    * @return {void|Array<Error>}
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(inst: any, cardEnforce?: boolean): void|Array<Error> {
    cardEnforce = cardEnforce || true;  // eslint-disable-line no-param-reassign
    const config = this._config();
    const errors: Array<Error> = [];
    const minCard = this.options.get('minc', 1);
    const maxCard = this.options.get('maxc', Math.max(minCard, 1));

    if (cardEnforce && minCard === maxCard && minCard === 1) {
      if (inst === null) {
        errors.push(new ValidationError(`field is required, ${this}`));
      }
    }

    let typeDef: DefinitionBase;
    if (['Binary', 'Boolean', 'Integer', 'Number', 'Null', 'String'].includes(this.type)) {
      if (!(`_${this.name}` in config.types)) {
        const tmpDef = this.object();
        delete tmpDef.id;
        tmpDef.name = capitalize(tmpDef.name.replace('_', '-'));
        const CustomDef = require('./definitions').CustomDef; // eslint-disable-line global-require
        config.types[`_${this.name}`] = new CustomDef(tmpDef as SchemaObjectType, {_config: this._config});
      }
      typeDef = safeGet(config.types, `_${this.name}`);
    } else {
      typeDef = safeGet(config.types, this.type);
    }

    const errs = typeDef ? typeDef.validate(inst) : new ValidationError(`invalid type for field, ${this}`);
    errors.push(...(Array.isArray(errs) ? errs : [errs]));
    return errors.filter(e => e);
  }

  // Helper functions
  enumField(): EnumeratedField {
    return new EnumeratedField([this.id, this.name, this.description]);
  }
}

export {
  EnumeratedField,
  Field
};