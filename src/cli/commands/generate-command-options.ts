import z from 'zod';

export const GenerateCommandOptionsSchema = z.object({
  configPath: z.string(),
  watch: z.boolean(),
}).strict();

export type GenerateCommandOptions = z.infer<typeof GenerateCommandOptionsSchema>;
