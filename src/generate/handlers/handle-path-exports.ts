import {
  BarrelConfig,
  DEFAULT_CONFIG,
  ExportInfo,
  ExportPathInfo,
  ExportsConfig,
  extractExports,
  rsTest,
  tryParseRegex,
} from '#lib';
import {glob} from 'glob';
import {resolve} from 'node:path';

export type MapReplacement = {
  exportKind?: ExportInfo['exportKind'];
  oldName: string;
  newName: string;
};

export async function handlePathExports(
  rootDir: string,
  barrelConfig: BarrelConfig,
  exportPaths: ExportPathInfo[],
): Promise<void> {
  const configExports = barrelConfig.exports ?? DEFAULT_CONFIG.exports;

  for (const [globPattern, mapConfig] of Object.entries(configExports)) {
    if (!mapConfig.map && mapConfig.asteriskIfAllExported) {
      continue;
    }

    const intersectionPaths = await getIntersectionPaths(rootDir, globPattern, exportPaths);
    await fillExports(rootDir, intersectionPaths, mapConfig);
  }
}

async function fillExports(
  rootDir: string,
  exportPaths: ExportPathInfo[],
  config: ExportsConfig[string],
): Promise<void> {
  const includeRegexes = config.includeMembers?.map((x) => tryParseRegex(x) ?? x);
  const excludeRegexes = config.excludeMembers?.map((x) => tryParseRegex(x) ?? x);

  const mapRegexes = config.map
    ? Object.entries(config.map).map<[RegExp | string, string]>(([k, v]) => [tryParseRegex(k) ?? k, v])
    : null;

  const asteriskIfAllExported = config.asteriskIfAllExported ?? true;
  const typePrefixIfPossible = config.typePrefixIfPossible ?? true;
  const skipMapMembersIfNotExists = config.skipMapMembersIfNotExists ?? true;

  for (const pathInfo of exportPaths) {
    const resolvedPath = resolve(rootDir, pathInfo.originalPath);

    let allExportMembers = await getExportedMembers(resolvedPath);

    if (!allExportMembers.length) {
      continue;
    }

    const exportMemberList = await filterExportMembers(allExportMembers, includeRegexes, excludeRegexes);
    const exportMemberMap = getExportMemberMap(allExportMembers, mapRegexes, skipMapMembersIfNotExists);
    const asteriskMapItem = exportMemberMap.get('*');

    if (asteriskMapItem) {
      pathInfo.exports = [
        formatExportMember(
          typePrefixIfPossible,
          asteriskMapItem.exportKind,
          asteriskMapItem.oldName,
          asteriskMapItem.newName,
        ),
      ];

      continue;
    }

    if (
      asteriskIfAllExported &&
      !exportMemberMap.size &&
      exportMemberList.length === allExportMembers.length
    ) {
      continue;
    }

    pathInfo.exports = [];

    for (const {exportKind, oldName, newName} of exportMemberMap.values()) {
      pathInfo.exports.push(formatExportMember(typePrefixIfPossible, exportKind, oldName, newName));
    }

    for (const exportInfo of exportMemberList) {
      if (!exportMemberMap.has(exportInfo.name)) {
        pathInfo.exports.push(
          formatExportMember(typePrefixIfPossible, exportInfo.exportKind, exportInfo.name),
        );
      }
    }
  }
}

function formatExportMember(
  typePrefixIfPossible: boolean,
  exportKind: ExportInfo['exportKind'],
  name: string,
  newName?: string,
): string {
  const typeIfNeeded = typePrefixIfPossible && exportKind === 'type' ? 'type ' : '';

  if (newName) {
    return `${typeIfNeeded}${name} as ${newName}`;
  } else {
    return `${typeIfNeeded}${name}`;
  }
}

function getExportMemberMap(
  exportMembers: ExportInfo[],
  mapRegexes: [string | RegExp, string][] | null,
  skipMapMembersIfNotExists: boolean,
): Map<string, MapReplacement> {
  const exportMemberMap = new Map<string, MapReplacement>();

  if (!mapRegexes?.length) {
    return exportMemberMap;
  }

  for (const [find, replacement] of mapRegexes) {
    if (typeof find === 'string') {
      if (!skipMapMembersIfNotExists || find === '*') {
        exportMemberMap.set(find, {oldName: find, newName: replacement});

        continue;
      }

      if (find !== replacement) {
        const exportInfo = exportMembers.find((x) => x.name === find);

        if (exportInfo) {
          exportMemberMap.set(find, {
            exportKind: exportInfo.exportKind,
            oldName: exportInfo.name,
            newName: replacement,
          });
        }
      }

      continue;
    }

    exportMembers.forEach((exportInfo) => {
      if (find.test(exportInfo.name)) {
        const newName = exportInfo.name.replace(find, replacement);

        if (exportInfo.name !== newName) {
          exportMemberMap.set(exportInfo.name, {
            exportKind: exportInfo.exportKind,
            oldName: exportInfo.name,
            newName,
          });
        }
      }
    });
  }

  return exportMemberMap;
}

async function filterExportMembers(
  exportMembers: ExportInfo[],
  include?: (string | RegExp)[],
  exclude?: (string | RegExp)[],
): Promise<ExportInfo[]> {
  if (include?.length) {
    exportMembers = exportMembers.filter((member) => include.some((rs) => rsTest(rs, member.name)));
  }

  if (exclude?.length) {
    exportMembers = exportMembers.filter((member) => exclude.some((rs) => !rsTest(rs, member.name)));
  }

  return [...exportMembers];
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
