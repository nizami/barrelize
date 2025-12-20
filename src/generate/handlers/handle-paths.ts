import {
  BarrelConfig,
  ExportPathInfo,
  globPaths,
  handlePathExports,
  handlePathOrder,
  handlePathReplace,
} from '#lib';
import {resolve} from 'node:path';

export async function handlePaths(configDir: string, barrelConfig: BarrelConfig): Promise<ExportPathInfo[]> {
  const rootDir = resolve(configDir, barrelConfig.root);
  const paths = await globPaths(rootDir, barrelConfig);
  const exportPaths: ExportPathInfo[] = paths.map((x) => ({originalPath: x, modifiedPath: x}));

  await handlePathOrder(barrelConfig, exportPaths);
  await handlePathReplace(barrelConfig, exportPaths);
  await handlePathExports(rootDir, barrelConfig, exportPaths);

  return exportPaths;
}
