import {createValidateEquals} from 'typia';

export type OutputConfig = {
  cwd: string;
  directories: {
    files: string[];
    order?: string[];
  }[];
};

export const validateOutputConfig = createValidateEquals<OutputConfig>();
