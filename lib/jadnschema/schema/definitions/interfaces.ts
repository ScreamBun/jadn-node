/**
  * JADN Interfaces
  */
import Options from '../options';

// Fields Types
// Simple Fields
// id, value, description
export type SchemaSimpleEnumField = [number, number|string, string];

// id, name, type, options, description
export type SchemaSimpleGenField = [number, string, string, string[], string];

export type SchemaSimpleField = SchemaSimpleEnumField|SchemaSimpleGenField;

// Object Fields
export interface SchemaObjectEnumField {
  id: number;
  value: number|string;
  description: string;
}

export interface SchemaObjectGenField {
  id: number;
  name: string;
  type: string;
  options: Options;
  description: string;
}

export type SchemaObjectField = SchemaObjectEnumField|SchemaObjectGenField;

// Type Definitions
/*
  Simple Type Definition
  Name, Type, Options, Description
  ["Domain-Name", "String", ["/hostname"], "[RFC1034], Section 3.5"]
  ["Features", "ArrayOf", ["*Feature", "{0", "}10", "q"], "An array of zero to ten names used to query an Actuator for its supported capabilities."]
  ["OpenC2-Command", "Record", [], "The Command defines an Action to be performed on a Target", [
    [1, "action", "Action", [], "The task or activity to be performed (i.e., the 'verb')."],
    [2, "target", "Target", [], "The object of the Action. The Action is performed on the Target."],
    [3, "args", "Args", ["[0"], "Additional information that applies to the Command."],
    [4, "actuator", "Actuator", ["[0"], "The subject of the Action. The Actuator executes the Action on the Target."],
    [5, "command_id", "Command-ID", ["[0"], "An identifier of this Command."]
  ]]
 */
export type SchemaSimpleType = [string, string, string[], string, Array<SchemaSimpleField>];

/*
  Object Type Definition
  {
    name: "Domain-Name",
    type: "String",
    options: ["/hostname"],
    comment: "[RFC1034], Section 3.5"
  }
  {
    name: "Features",
    type: "ArrayOf",
    options: ["*Feature", "{0", "}10", "q"],
    description: "An array of zero to ten names used to query an Actuator for its supported capabilities"
  }
  {
    name: "OpenC2-Command",
    type: "Record",
    options: [],
    comment: "The Command defines an Action to be performed on a Target",
    fields: ...
  }
*/
export interface SchemaObjectType {
  name: string;
  type: string;
  options: Options;
  description: string;
  fields: Array<SchemaObjectField>;
}
