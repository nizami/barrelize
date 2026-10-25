import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

const DEFAULT_CONFIG_FILES = [
  '.barrelize',
  '.barrelize.json',
  '.barrelize.mjs',
  '.barrelize.cjs',
  '.barrelize.js',
];

export function resolveDefaultConfig(directory = process.cwd()): string {
  return (
    DEFAULT_CONFIG_FILES.find((file) => {
      return existsSync(resolve(directory, file));
    }) ?? '.barrelize.json'
  );
}
