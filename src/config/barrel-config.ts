import {ExportsConfig} from '#lib';

export type BarrelConfig = {
  /**
   * Root directory to start from (support glob pattern)
   * @default ''
   */
  root?: string;
  /**
   * Name of the index file (e.g. index.ts or some/path/index.ts)
   * @default 'index.ts'
   */
  name?: string;
  /**
   * Files to include in the barrel (supports glob patterns)
   * @default ['**\/*.ts']
   */
  include?: string[];
  /**
   * Files to exclude from the barrel (supports glob patterns)
   * @default []
   */
  exclude?: string[];
  /**
   * Ordering of exports
   * @default []
   */
  order?: string[];
  /**
   * String or regular expression patterns to find and replace in export paths (e.g. {"\\.ts$": "", "my-custom-export-path.ts": "my-path.ts"})
   * @default {'/\\.ts$/': ''}
   */
  replace?: {
    /**
     * String or regular expression pattern to find in export paths (e.g. "\\.ts$", "my-custom-export-path.ts")
     */
    [key: string]: string;
  };
  /**
   * Configuration for exports in barrel files
   * @default {'**\/*.ts': {}}
   */
  exports?: ExportsConfig;
  /**
   * Use spaces between brackets in exports
   * @default true
   */
  bracketSpacing?: boolean;
  /**
   * Use single quotes for exports
   * @default true
   */
  singleQuote?: boolean;
  /**
   * Add semicolons after exports
   * @default true
   */
  semi?: boolean;
  /**
   * Add newline at end of file
   * @default true
   */
  insertFinalNewline?: boolean;
};
