import {createValidateEquals} from 'typia';

export type Config = {
  directories: {
    path?: string;
    include?: string[];
    exclude?: string[];
    order?: string[];
    indexFilePath?: string;
    keepFileExtension?: boolean;
    replace?: {find: string; replacement: string}[];
  }[];
};

export const validateConfig = createValidateEquals<Config>();
