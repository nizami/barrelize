import {BarrelConfig, DEFAULT_CONFIG, globPaths, handlePathOrder, handlePathReplacement} from '#lib';
import {resolve} from 'node:path';

export async function generateBarrel(rootPath: string, barrelConfig: BarrelConfig): Promise<string[]> {
  const cwd = resolve(rootPath, barrelConfig.path ?? DEFAULT_CONFIG.path);

  let paths = await globPaths(cwd, barrelConfig);
  paths = handlePathOrder(barrelConfig, paths);
  paths = handlePathReplacement(barrelConfig, paths);

  return paths;
}
