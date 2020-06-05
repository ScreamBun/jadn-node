/** @ignore *//** */
import path from 'path';
import optionator, { Optionator } from 'optionator';

import { SchemaFormats } from './jadnschema/convert/schema/enums';
import { objectValues } from './jadnschema/utils';

const CLIOptions: Record<string, Optionator> = {
  convert: optionator({
    defaults: {
      concatRepeatedArrays: true,
      mergeRepeatedObjects: true
    },
    prepend: 'jadnschema convert [options] schema.jadn [schema.jadn]',
    options: [
      {
        heading: 'Specifying conversion rules'
      },
      {
        option: 'rulesdir',
        type: '[path::String]',
        description: 'Use additional rules from this directory'
      },
      {
        option: 'plugin',
        type: '[String]',
        description: 'Specify plugins'
      },
      {
        option: 'rule',
        type: 'Object',
        description: 'Specify rules'
      },
      {
        heading: 'Handling warnings'
      },
      {
        option: 'quiet',
        type: 'Boolean',
        default: 'false',
        description: 'Report errors only'
      },
      {
        option: 'max-warnings',
        type: 'Int',
        default: '0',
        description: 'Number of warnings to trigger nonzero exit code'
      },
      {
        heading: 'Output'
      },
      {
        option: 'output',
        alias: 'o',
        type: 'path::String',
        default: path.join(process.cwd(), 'converted'),
        description: 'Specify directory to write converted schema(s) to'
      },
      {
        option: 'format',
        alias: 'f',
        type: '[String]',
        concatRepeatedArrays: [true, {
          oneValuePerFlag: false
        }],
        default: 'jadn',
        enum: objectValues(SchemaFormats),
        description: 'Format(s) to convert the schema(s) into'
      },
      {
        heading: 'Miscellaneous'
      },
      {
        option: 'debug',
        type: 'Boolean',
        default: false,
        description: 'Output debugging information'
      },
      {
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'Show help'
      },
      {
        option: 'version',
        alias: 'v',
        type: 'Boolean',
        description: 'Output the version number'
      }
    ]
  }),
  validate: optionator({
    defaults: {
      concatRepeatedArrays: true,
      mergeRepeatedObjects: true
    },
    prepend: 'jadnschema validate [options] schema.jadn [message.json]',
    options: [
      {
        heading: 'Validation Basics'
      },
      {
        option: 'schema',
        alias: 's',
        type: 'path::string',
        required: true,
        description: 'Schema to validate or validate messages against'
      },
      {
        option: 'message',
        alias: 'm',
        type: '[path::String]',
        concatRepeatedArrays: [true, {
          oneValuePerFlag: false
        }],
        description: 'Message to validate'
      },

      {
        heading: 'Miscellaneous'
      },
      {
        option: 'debug',
        type: 'Boolean',
        default: false,
        description: 'Output debugging information'
      },
      {
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'Show help'
      },
      {
        option: 'version',
        alias: 'v',
        type: 'Boolean',
        description: 'Output the version number'
      }
    ]
  })
};

export default CLIOptions;