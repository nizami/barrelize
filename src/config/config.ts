import {createValidateEquals} from 'typia';

export type BarrelConfig = {
  path?: string;
  include?: string[];
  exclude?: string[];
  order?: string[];
  indexFilePath?: string;
  replace?: {find: string; replacement: string}[];
  singleQuote?: boolean;
  semi?: boolean;
  insertFinalNewline?: boolean;
};

export type Config = {
  $schema?: string;
  singleQuote?: boolean;
  semi?: boolean;
  insertFinalNewline?: boolean;
  barrels: BarrelConfig[];
};

export const DEFAULT_CONFIG: Required<BarrelConfig> = {
  path: '',
  include: ['**/*.ts'],
  exclude: [],
  order: [],
  indexFilePath: 'index.ts',
  replace: [{find: '\\.ts$', replacement: ''}],
  singleQuote: true,
  semi: true,
  insertFinalNewline: true,
};

export const validateConfig = createValidateEquals<Config>();
