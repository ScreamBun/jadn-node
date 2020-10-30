/**
  * Schema Resolver
  */
import path from 'path';
import fs from 'fs-extra';

import Schema from './schema';
import { safeGet } from '../utils';


class Resolver {
  private resolveDir: string;
  private resolved: Record<string, Schema>;

  constructor(dir?: null|string, resolve?: Record<string, string>) {
    this.resolveDir = path.resolve(dir || '.');
    this.resolved = {};

    // Init
    this.loadLocal();
    if (resolve !== undefined) {
      this.resolve(resolve);
    }
  }

  get resolvedSchemas(): Record<string, Schema> {
    return this.resolved;
  }

  getResolved(uri: string): null|Schema {
    return safeGet(this.resolved, uri, null) as null|Schema;
  }

  loadLocal(): void {
    fs.readdirSync(this.resolveDir).forEach(file => {
      const ext = path.extname(file).slice(1);
      if (['jadn', 'jidl'].includes(ext)) {

        if (ext === 'jadn') {
          const tmpSchema = new Schema(fs.readJSONSync(path.join(this.resolveDir, file)), {
            resolver: this
          });
          if (!(tmpSchema.info.package in this.resolved)) {
            this.resolved[tmpSchema.info.package] = tmpSchema;
          }
        } else if (ext === 'jidl') {
          console.log(`JIDL LOAD - ${file}`);
        }
      }
    });
  }

  resolve(resolve: Record<string, string>): void {
    Object.keys(resolve).forEach(key => {
      const val = resolve[key];
      if (!(val in this.resolved)) {
        console.log(`RESOLVE ${key} - ${val}`);
      }
    });
  }
}

export default Resolver;