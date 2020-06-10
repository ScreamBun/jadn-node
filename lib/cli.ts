/* eslint lines-between-class-members: 0 */
/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */
// import fs from 'fs';
// import path from 'path';
// import { promisify } from 'util';
import debug from 'debug';
import CLIOptions from './options';
import pkg from '../package.json';

// Init debugger
debug('jadnschema:cli');

// Helpers
//------------------------------------------------------------------------------
// const mkdir = promisify(fs.mkdir);
// const stat = promisify(fs.stat);
// const writeFile = promisify(fs.writeFile);

// Public Interface
//------------------------------------------------------------------------------
class CLI {
  args: Array<string>
  command: string

  constructor(args: Array<string>) {
    this.args = args;
    this.command = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkArgs(): [string, Record<string, any>]|number {
  if (Array.isArray(this.args)) {
      debug(`CLI args: ${this.args}`);
    }

    this.command = this.args.length >= 3 ? this.args[2] : 'N/A';
    const validCmd = Object.keys(CLIOptions).includes(this.command);

    if (validCmd) {
      this.args.splice(2, 1);
      const args = CLIOptions[this.command].parse(this.args);
      // eslint-disable-next-line default-case
      switch (this.command) {
        case 'convert':
          args.schemas = args._;
          break;
        case 'validate':
          args.schema = args._[0];
          args.messages = args._.splice(1);
          break;
      }
      delete args._;
      return [this.command, args];
    }

    if (this.args.includes('-v' ) || this.args.includes('--version' )) {
      console.info(pkg.version);
      return 0;
    }
    if (this.args.includes('-h' ) || this.args.includes('--help' )) {
      this.help();
      return 0;
    }
    console.error(`'${this.command}' is not a valid subcommand`);
    console.error(`Valid subcommands are: ${Object.keys(CLIOptions).filter(i => i !== 'general')}`);
    console.error('');
    this.help();
    return 2;
  }

  // eslint-disable-next-line class-methods-use-this
  help(): void {
    console.info('JADN Schema CLI contains varying options per subcommand');
    console.info('-'.repeat(50));
    Object.keys(CLIOptions).forEach(k => {
      console.info(CLIOptions[k].generateHelp());
      console.info('-'.repeat(50));
    });
  }

  run(): number {
    const rslt = this.checkArgs();
    if (typeof rslt === 'number') {
      return rslt;
    }
    const [command, args] = rslt;

    if (args.help) {
      console.info(CLIOptions[command].generateHelp());
      return 0;
    }
    if (args.version) {
      console.info(pkg.version);
      return 0;
    }

    switch (command) {
      case 'convert':
        console.log('CONVERT', args);
        return 0;
      case 'validate':
        console.log('VALIDATE', args);
        return 0;
      default:
        this.help();
        return 1;
    }
  }
}

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
module.exports = {
  /**
   * Executes the CLI based on an array of arguments that is passed in.
   * @param {Array} args - The arguments to process.
   * @param {string| null} text - The text to lint (used for TTY).
   * @returns {number} The exit code for the operation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  execute(args: Array<string>): number {
    const cli = new CLI(args);
    return cli.run();
  }
};