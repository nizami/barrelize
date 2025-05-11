import {DEFAULT_CONFIG, DirectoryConfig, globPaths, handlePathOrder, handlePathReplacement} from '#lib';
import {resolve} from 'node:path';

export async function generateBarrel(rootPath: string, directoryConfig: DirectoryConfig): Promise<string[]> {
  const cwd = resolve(rootPath, directoryConfig.path ?? DEFAULT_CONFIG.path);

  let paths = await globPaths(cwd, directoryConfig);
  paths = handlePathOrder(directoryConfig, paths);
  paths = handlePathReplacement(directoryConfig, paths);

  return paths;
}
