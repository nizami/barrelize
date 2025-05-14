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
