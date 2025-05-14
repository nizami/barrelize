import {BarrelConfig} from '#lib';
import {createValidateEquals} from 'typia';

export type Config = {
  /**
   * Path to the JSON schema file that will be used for configuration validation
   * @default undefined
   */
  $schema?: string;
  /**
   * Whether to add spaces between brackets in export statements
   * @default true
   */
  bracketSpacing?: boolean;
  /**
   * Whether to use single quotes instead of double quotes for exports
   * @default true
   */
  singleQuote?: boolean;
  /**
   * Whether to append semicolons to export statements
   * @default true
   */
  semi?: boolean;
  /**
   * Whether to append a newline character at the end of generated files
   * @default true
   */
  insertFinalNewline?: boolean;
  /**
   * List of barrel configurations
   * @default [{
   *   root: 'src',
   *   name: 'index.ts',
   *   include: ['**\/*.ts'],
   *   exclude: ['**\/*.test.ts'],
   * }]
   */
  barrels: BarrelConfig[];
};

export const INITIAL_CONFIG: Config = {
  $schema: 'node_modules/barrelize/schema.json',
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
      exclude: ['**/*.test.ts'],
    },
  ],
};

export const DEFAULT_CONFIG: Required<BarrelConfig> = {
  root: '',
  include: ['**/*.ts'],
  exclude: [],
  order: [],
  name: 'index.ts',
  replace: {'/\\.ts$/': ''},
  exports: {},
  bracketSpacing: true,
  singleQuote: true,
  semi: true,
  insertFinalNewline: true,
};

export const validateConfig = createValidateEquals<Config>();
