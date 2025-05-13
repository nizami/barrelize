import {colorize, INITIAL_CONFIG, logWarning, TerminalColor} from '#lib';
import {existsSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

export async function runInitCommand(baseConfigFilePath: string) {
  const configFilePath = resolve(process.cwd(), baseConfigFilePath);

  if (existsSync(configFilePath)) {
    logWarning(`Config file '${configFilePath}' already exists`);

    return;
  }

  const configDirectoryPath = dirname(configFilePath);

  if (!existsSync(configDirectoryPath)) {
    logWarning(`Directory '${configDirectoryPath}' does not exist`);

    return;
  }

  const configTemplateJson = JSON.stringify(INITIAL_CONFIG, null, 2);

  await writeFile(configFilePath, configTemplateJson);

  console.log(
    colorize(baseConfigFilePath, TerminalColor.CYAN),
    colorize(`config file created`, TerminalColor.GRAY),
  );
  console.log(colorize(configTemplateJson, TerminalColor.GREEN));
}
