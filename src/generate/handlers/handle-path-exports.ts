import {BarrelConfig, DEFAULT_CONFIG, ExportInfo, ExportPathInfo, extractExports, tryParseRegex} from '#lib';
import {glob} from 'glob';
import {resolve} from 'node:path';

export async function handlePathExports(
  rootDir: string,
  barrelConfig: BarrelConfig,
  exportPaths: ExportPathInfo[],
): Promise<void> {
  const configExports = barrelConfig.exports ?? DEFAULT_CONFIG.exports;

  for (const [globPattern, exportMembers] of Object.entries(configExports)) {
    if (!exportMembers.length) {
      continue;
    }

    const intersectionPaths = await getIntersectionPaths(rootDir, globPattern, exportPaths);
    await fillExports(rootDir, intersectionPaths, exportMembers);
  }
}

async function fillExports(
  rootDir: string,
  exportPaths: ExportPathInfo[],
  exportMembers: string[],
): Promise<void> {
  const parsedMembers =
    exportMembers.map((x) => {
      const [find, replacement] = x.split(/\s+as\s+/) as [string, string | undefined];

      return {
        member: tryParseRegex(find) ?? find,
        toMember: replacement,
      };
    }) ?? [];

  for (const pathInfo of exportPaths) {
    pathInfo.exports = [];
    const resolvedPath = resolve(rootDir, pathInfo.originalPath);
    const allExportInfos = await getExportedMembers(resolvedPath);
    const map = new Map<string, ExportInfo>();

    const setMap = (fromMember: string, toMember: string, exportKind?: ExportInfo['exportKind']) => {
      fromMember = fromMember.trim();
      toMember = toMember.trim();

      if (map.has(toMember) && fromMember === toMember) {
        return;
      }

      map.set(toMember, {name: fromMember, exportKind});
    };

    for (const {member, toMember} of parsedMembers) {
      if (typeof member === 'string') {
        const exportInfo = allExportInfos.find((x) => x.name === member);

        setMap(member, toMember ?? member, exportInfo?.exportKind);

        continue;
      }

      const foundExportInfos = allExportInfos.filter((x) => member.test(x.name));

      for (const exportInfo of foundExportInfos) {
        setMap(exportInfo.name, exportInfo.name.replace(member, toMember ?? exportInfo.name));
      }
    }

    for (const [newName, info] of map) {
      pathInfo.exports.push(formatExportMember(info.exportKind, info.name, newName));
    }
  }
}

function formatExportMember(exportKind: ExportInfo['exportKind'], name: string, newName: string): string {
  const typeIfNeeded = exportKind === 'type' ? 'type ' : '';

  if (name !== newName) {
    return `${typeIfNeeded}${name} as ${newName}`;
  } else {
    return `${typeIfNeeded}${name}`;
  }
}

async function getIntersectionPaths(
  rootDir: string,
  globPattern: string,
  exportPaths: ExportPathInfo[],
): Promise<ExportPathInfo[]> {
  let paths = await glob(globPattern, {
    cwd: rootDir,
    nodir: true,
    includeChildMatches: true,
  });

  paths = paths.map((file) => file.replace(/\\/g, '/'));

  return exportPaths.filter((x) => paths.includes(x.originalPath));
}

const fileExportsCache = new Map();

async function getExportedMembers(resolvedPath: string): Promise<ExportInfo[]> {
  if (fileExportsCache.has(resolvedPath)) {
    return fileExportsCache.get(resolvedPath);
  }

  const exports = await extractExports(resolvedPath);
  fileExportsCache.set(resolvedPath, exports);

  return exports;
}
