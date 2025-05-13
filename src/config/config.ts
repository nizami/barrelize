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

export type ExportsConfig = {
  /**
   * Glob pattern exports file (e.g. "**\/*service.ts")
   */
  [key: string]: {
    /**
     * String or regular expression pattern of members to include in exports
     * @default []
     */
    includeMembers?: string[];
    /**
     * String or regular expression pattern of members to exclude from exports
     * @default []
     */
    excludeMembers?: string[];
    /** Map of member name patterns to export names using string or regular expressions (e.g. {"/^.+Util$/": "util"}, {"default": "lib", "*": "services"})
     * @default {'*': 'lib'}
     */
    map?: {
      /**
       * String or regular expression pattern to find in member name (e.g. "/^.+Util$/", "default", "*")
       */
      [key: string]: string;
    };
    /**
     * Whether to skip mapping members if they don't export in the source file
     * @default true
     */
    skipMapMembersIfNotExists?: boolean;
    /**
     * Use asterisk (*) export when all members from the file are exported
     * @default true
     */
    asteriskIfAllExported?: boolean;
    /**
     * Add 'type' prefix for type-only exports when possible
     * @default true
     */
    typePrefixIfPossible?: boolean;
  };
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
