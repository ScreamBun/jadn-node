/// <reference types="node" />

declare module 'optionator' {
  interface HelpOptions {
    showHidden?: boolean;
    interpolate?: Record<string, any>;
  }

  interface OptionsHeader {
    heading: string;
  }

  interface OptionsFull {
    option: string;
    alias?: Array<string>|string;
    type: string;
    enum?: Array<string>;
    default?: boolean|string;
    restPositional?: boolean;
    required?: boolean;
    overrideRequired?: boolean;
    dependsOn?: Array<string>|string;
    concatRepeatedArrays?: boolean|[boolean, Record<string, any>];
    mergeRepeatedObjects?: boolean;
    description?: string;
    longDescription?: string;
    example?: Array<string>|string;
  }

  interface HelpStyles {
    aliasSeparator?: string;
    typeSeparator?: string;
    descriptionSeparator?: string;
    initialIndent?: number;
    secondaryIndent?: number;
    maxPadFactor?: number;
  }

  interface LibOptions {
    prepend?: string;
    append?: string;
    options: Array<OptionsHeader|OptionsFull>;
    helpStyle?: HelpStyles;
    mutuallyExclusive?: Array<Array<string|Array<string>>>;
    concatRepeatedArrays?: boolean|[boolean, Record<string, any>]; // deprecated, set in defaults object
    mergeRepeatedObjects?: boolean; // deprecated, set in defaults object
    positionalAnywhere?: boolean;
    typeAliases?: Record<string, any>;
    defaults?: Record<string, any>;
  }

  interface Optionator {
    parse: (input: Array<string>|Record<string, any>|string, parseOptions?: { slice: number }) => Record<string, any>;
    parseArgv: (it: Array<string>) => string;
    generateHelp: (libOptions?: HelpOptions) => string;
    generateHelpForOption: (getOption: string) => string;
  }

  export default function main(libOptions: LibOptions): Optionator;
}