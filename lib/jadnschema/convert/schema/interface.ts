// Conversion interfaces
import { CommentLevels } from './enums';
import { Schema } from '../../schema';

export interface ConversionDumpLib {
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  dump: (schema: string|Record<string, any>|Schema, fname: string, source?: string|null, comment?: CommentLevels, kwargs?: Record<string, any>) => void;
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  dumps: (schema: string|Record<string, any>|Schema, comment?: CommentLevels, kwargs?: Record<string, any>) => string|Record<string, any>;
}

export interface ConversionLoadLib {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: (schema: string, kwargs?: Record<string, any>) => Schema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loads: (schema: string, kwargs: Record<string, any>) => Schema;
}

export interface ConversionLib extends ConversionDumpLib, ConversionLoadLib  {}