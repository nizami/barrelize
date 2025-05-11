import {DEFAULT_CONFIG, DirectoryConfig} from '#lib';
import {glob} from 'glob';

export async function globPaths(cwd: string, directoryConfig: DirectoryConfig): Promise<string[]> {
  const ignore = [...(directoryConfig.exclude ?? DEFAULT_CONFIG.exclude), '**/index.ts', '**/index.js'];

  let paths = await glob(directoryConfig.include ?? DEFAULT_CONFIG.include, {
    cwd,
    ignore,
    nodir: true,
    includeChildMatches: true,
  });

  paths = paths.map((file) => file.replace(/\\/g, '/'));

  return paths;
}
