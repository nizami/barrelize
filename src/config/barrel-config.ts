import {z} from 'zod';

export const $BarrelConfig = z.object({
  root: z.string().optional().default('src').describe('Root directory to start from (support glob pattern)'),

  name: z
    .string()
    .optional()
    .default('index.ts')
    .describe('Name of the index file (e.g. index.ts or some/path/index.ts)'),

  include: z
    .array(z.string())
    .optional()
    .default(['**/*.ts'])
    .describe('Files to include in the barrel (supports glob patterns)'),

  exclude: z
    .array(z.string())
    .optional()
    .default(['**/*.test.ts'])
    .describe('Files to exclude from the barrel (supports glob patterns)'),

  order: z.string().array().optional().default([]).describe('Ordering of exports'),

  replace: z
    .record(
      z.string(),
      z
        .string()
        .describe(
          'String or regular expression pattern to find in export paths (e.g. "\\.ts$", "my-custom-export-path.ts")',
        ),
    )
    .optional()
    .default({'/\\.ts$/': ''})
    .describe(
      'String or regular expression patterns to find and replace in export paths (e.g. {"\\.ts$": "", "my-custom-export-path.ts": "my-path.ts"})',
    ),

  exports: z
    .record(
      z.string(),
      z
        .string()
        .array()
        .describe(
          'Glob pattern exports file with string or regular expression patterns (e.g. "**/*service.ts": ["* as lib", "/(.+)Config$/ as $1LibConfig", "util"])',
        ),
    )
    .optional()
    .default({'**/*.ts': []})
    .describe('Configuration for exports in barrel files'),

  bracketSpacing: z.boolean().optional().default(true).describe('Use spaces between brackets in exports'),

  singleQuote: z.boolean().optional().default(true).describe('Use single quotes for exports'),

  semi: z.boolean().optional().default(true).describe('Add semicolons after exports'),

  insertFinalNewline: z.boolean().optional().default(true).describe('Add newline at end of file'),
});

export type BarrelConfig = z.infer<typeof $BarrelConfig>;
