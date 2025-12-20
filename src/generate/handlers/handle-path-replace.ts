import {BarrelConfig, ExportPathInfo, tryParseRegex} from '#lib';

export async function handlePathReplace(config: BarrelConfig, paths: ExportPathInfo[]): Promise<void> {
  const replace = replacePathFn(config.replace);
  paths.forEach((x) => (x.modifiedPath = replace(x.originalPath)));
}

function replacePathFn(replaces: Record<string, string>): (path: string) => string {
  const entries = Object.entries(replaces).map(([find, replacement]) => {
    const rs = tryParseRegex(find);
    const isString = typeof rs === 'string';

    return {
      rs,
      test: (path: string) => (isString ? rs === path : rs?.test(path) ?? false),
      replace: (path: string) => {
        return isString ? replacement : rs ? path.replace(rs, replacement) : path;
      },
    };
  });

  return (path) => entries.find((x) => x.test(path))?.replace(path) ?? path;
}
