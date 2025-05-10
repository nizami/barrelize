import {Config, logError} from '#lib';
import JSON5 from 'json5';
import {readFile} from 'node:fs/promises';

export async function parseConfig(configPath: string): Promise<Config | null> {
  const configJson = (await readFile(configPath)).toString();
  //
  try {
    return JSON5.parse(configJson);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const referenceMatches = error.message.match(/at (\d+:\d+)/);
      const reasonMatches = error.message.match(/(?<=JSON5: ).*?(?= at \d+:\d+)/);

      if (referenceMatches && reasonMatches) {
        const reference = `${configPath}:${referenceMatches[1]}`;
        const reason = reasonMatches[0];
        logError(`Barrelize json config syntax error: ${reason} at ${reference}:`);

        return null;
      }
    }

    console.error(error);

    return null;
  }
}
