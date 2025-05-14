export type ExportsConfig = {
  /**
   * Glob pattern exports file (e.g. "**\/*service.ts")
   */
  [key: string]: {
    /**
     * String or regular expression pattern of export members
     * @default []
     */
    members?: string[];
    /**
     * Whether to skip mapping members if they don't export in the source file
     * @default true
     */
    skipMapMembersIfNotExists?: boolean;
    /**
     * Add 'type' prefix for type-only exports when possible
     * @default true
     */
    typePrefixIfPossible?: boolean;
  };
};
