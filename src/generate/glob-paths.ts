import {BarrelConfig, DEFAULT_CONFIG} from '#lib';
import {glob} from 'glob';

export async function globPaths(cwd: string, barrelConfig: BarrelConfig): Promise<string[]> {
  const ignore = [...(barrelConfig.exclude ?? DEFAULT_CONFIG.exclude), '**/index.ts', '**/index.js'];

  let paths = await glob(barrelConfig.include ?? DEFAULT_CONFIG.include, {
    cwd,
    ignore,
    nodir: true,
    includeChildMatches: true,
  });

  paths = paths.map((file) => file.replace(/\\/g, '/'));

  return paths;
}
