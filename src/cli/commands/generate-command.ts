import {generateBarrels, GenerateCommandOptions, parseConfig, watchBarrels} from '#lib';
import {dirname, resolve} from 'node:path';

export async function runGenerateCommand(options: GenerateCommandOptions): Promise<void> {
  const config = parseConfig(options.configPath);
  const configDir = resolve(dirname(options.configPath));

  if (options.watch) {
    await watchBarrels(configDir, options.configPath, config);
  } else {
    await generateBarrels(configDir, options.configPath, config);
  }
}
