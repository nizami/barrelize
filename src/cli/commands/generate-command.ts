import {
  generateBarrels,
  GenerateCommandOptions,
  logError,
  logValidationError,
  parseConfig,
  validateConfig,
} from '#lib';
import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {createValidateEquals} from 'typia';

const validateGenerateOptions = createValidateEquals<GenerateCommandOptions>();

export async function runGenerateCommand(options: GenerateCommandOptions) {
  const validatedOptions = validateGenerateOptions(options);

  if (!validatedOptions.success) {
    logValidationError(`Invalid 'generate' command options`, validatedOptions);

    return;
  }

  if (!existsSync(options.configPath)) {
    logError(`Couldn't find barrelize config file with path '${options.configPath}'`);

    return;
  }

  const config = await parseConfig(options.configPath);
  const validatedConfig = validateConfig(config);

  if (!validatedConfig.success) {
    logValidationError(`Invalid barrelize config`, validatedConfig);

    return;
  }

  const configDir = resolve(dirname(options.configPath));

  await generateBarrels(configDir, options.configPath, validatedConfig.data);
}
