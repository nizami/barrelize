import {
  generateBarrels,
  GenerateCommandOptions,
  logError,
  logValidationError,
  parseConfig,
  validateConfig,
  watchBarrels,
} from '#lib';
import {statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {createValidateEquals} from 'typia';

const validateGenerateOptions = createValidateEquals<GenerateCommandOptions>();

export function runGenerateCommand(options: GenerateCommandOptions) {
  const validatedOptions = validateGenerateOptions(options);

  if (!validatedOptions.success) {
    logValidationError(`Invalid 'generate' command options`, validatedOptions);

    return;
  }

  const configPathStat = statSync(options.configPath);

  if (!configPathStat.isFile()) {
    logError(`Couldn't find barrelize config file with path '${options.configPath}'`);

    return;
  }

  const config = parseConfig(options.configPath);
  const validatedConfig = validateConfig(config);

  if (!validatedConfig.success) {
    logValidationError(`Invalid barrelize config`, validatedConfig);

    return;
  }

  const configDir = resolve(dirname(options.configPath));

  if (options.watch) {
    watchBarrels(configDir, options.configPath, validatedConfig.data);
  } else {
    generateBarrels(configDir, options.configPath, validatedConfig.data);
  }
}
