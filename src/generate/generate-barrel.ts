import {DEFAULT_CONFIG, DirectoryConfig, handlePathOrder, handlePathReplacement} from '#lib';
import {glob} from 'glob';
import {resolve} from 'node:path';

export async function generateBarrel(rootPath: string, directoryConfig: DirectoryConfig): Promise<string[]> {
  const ignore = [...(directoryConfig.exclude ?? DEFAULT_CONFIG.exclude), '**/index.ts', '**/index.js'];
  const cwd = resolve(rootPath, directoryConfig.path ?? DEFAULT_CONFIG.path);

  let paths = await glob(directoryConfig.include ?? DEFAULT_CONFIG.include, {
    cwd,
    ignore,
    nodir: true,
    includeChildMatches: true,
  });
  paths = paths.map((file) => file.replace(/\\/g, '/'));
  paths = handlePathOrder(directoryConfig, paths);
  paths = handlePathReplacement(directoryConfig, paths);

  return paths;
}
