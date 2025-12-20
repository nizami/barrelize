import {$Config, Config} from '#lib';
import JSON5 from 'json5';
import {readFileSync, statSync} from 'node:fs';
import z from 'zod';

export function parseConfig(configPath: string): Config {
  try {
    if (!statSync(configPath).isFile()) {
      throw new Error(`Couldn't find barrelize config file path: '${configPath}'`);
    }

    const configJson = readFileSync(configPath).toString();

    return $Config.parse(JSON5.parse(configJson));
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
