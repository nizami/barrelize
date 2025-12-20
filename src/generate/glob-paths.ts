import {BarrelConfig} from '#lib';
import {glob} from 'glob';

export async function globPaths(rootDir: string, barrelConfig: BarrelConfig): Promise<string[]> {
  const ignore = [...barrelConfig.exclude, '**/index.ts', '**/index.js'];

  let paths = await glob(barrelConfig.include, {
    cwd: rootDir,
    ignore,
    nodir: true,
    includeChildMatches: true,
  });

  paths = paths.map((file) => file.replace(/\\/g, '/'));

  return paths;
}
