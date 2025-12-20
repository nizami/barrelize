import {$BarrelConfig} from '#lib';
import {z} from 'zod';

export const $Config = z.object({
  $schema: z
    .string()
    .optional()
    .default('node_modules/barrelize/schema.json')
    .describe('Path to the JSON schema file that will be used for configuration validation'),

  bracketSpacing: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to add spaces between brackets in export statements'),

  singleQuote: z
    .boolean()
    .default(true)
    .describe('Whether to use single quotes instead of double quotes for exports'),

  semi: z.boolean().optional().default(true).describe('Whether to append semicolons to export statements'),

  insertFinalNewline: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to append a newline character at the end of generated files'),

  barrels: $BarrelConfig
    .array()
    .prefault([
      {
        root: 'src',
        name: 'index.ts',
        include: ['**/*.ts'],
        exclude: ['**/*.test.ts'],
      },
    ])
    .describe('List of barrel configurations'),
});

export type Config = z.infer<typeof $Config>;

export const INITIAL_CONFIG: z.input<typeof $Config> = {
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
