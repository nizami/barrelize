import {$Config, Config} from '#lib';
import JSON5 from 'json5';
import {statSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import z from 'zod';

export async function parseConfig(configPath: string): Promise<Config> {
  try {
    if (!statSync(configPath).isFile()) {
      throw new Error(`Couldn't find barrelize config file path: '${configPath}'`);
    }

    const config = await loadConfig(configPath);
    return $Config.parse(config);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const referenceMatches = error.message.match(/at (\d+:\d+)/);
      const reasonMatches = error.message.match(/(?<=JSON5: ).*?(?= at \d+:\d+)/);

      if (referenceMatches && reasonMatches) {
        const reference = `${configPath}:${referenceMatches[1]}`;
        const reason = reasonMatches[0];

        throw new Error(`Barrelize json config syntax error: ${reason} at ${reference}:`);
      }
    }

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid barrelize config:\n` + z.prettifyError(error));
    }

    throw error;
  }
}

async function loadConfig(configPath: string): Promise<Config> {
  const extension = extname(configPath);

  switch (extension) {
    case '':
    case '.json':
      const configJson = await readFile(configPath, {encoding: 'utf-8'});
      return JSON5.parse(configJson);

    case '.js':
    case '.mjs':
    case '.cjs': {
      const module = await import(pathToFileURL(configPath).href);
      // checks to ensure the configuration file exports the config as default
      if (!('default' in module)) {
        throw new Error(
          `Invalid barrelize config:\nConfig file "${configPath}" must export a default configuration.`,
        );
      }
      return module.default;
    }

    default:
      throw new Error(`Unsupported config extension: ${extension}`);
  }
}
