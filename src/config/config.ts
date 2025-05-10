import {createValidateEquals} from 'typia';

export type Config = {
  $schema?: string;
  directories: {
    path?: string;
    include?: string[];
    exclude?: string[];
    order?: string[];
    indexFilePath?: string;
    replace?: {find: string; replacement: string}[];
  }[];
};

export const DEFAULT_CONFIG: Required<Config['directories'][0]> = {
  path: '',
  include: ['**/*.ts'],
  exclude: [],
  order: [],
  indexFilePath: 'index.ts',
  replace: [{find: '\\.ts$', replacement: ''}],
};

export const validateConfig = createValidateEquals<Config>();
