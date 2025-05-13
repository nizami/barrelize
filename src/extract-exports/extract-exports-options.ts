/**
 * Options for extracting exports from source files
 */
export type ExtractExportsOptions = {
  /**
   * Whether the source file is a TypeScript file
   */
  isTypeScriptSource: boolean;
  /**
   * Whether to recursively process imports
   */
  recursive: boolean;
};
