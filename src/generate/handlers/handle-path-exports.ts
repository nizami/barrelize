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

  for (const pathInfo of exportPaths) {
    const resolvedPath = resolve(rootDir, pathInfo.originalPath);

    let allExportMembers = await getExportedMembers(resolvedPath);

    if (!allExportMembers.length) {
      continue;
    }

    const exportMemberList = await filterExportMembers(allExportMembers, includeRegexes, excludeRegexes);
    const exportMemberMap = getExportMemberMap(mapRegexes, allExportMembers);

    if (exportMemberMap.has('*')) {
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

    for (const {exportInfo, newName} of exportMemberMap.values()) {
      pathInfo.exports.push(formatExportMember(typePrefixIfPossible, exportInfo, newName));
    }

    for (const exportInfo of exportMemberList) {
      if (!exportMemberMap.has(exportInfo.name)) {
        pathInfo.exports.push(formatExportMember(typePrefixIfPossible, exportInfo));
      }
    }
  }
}

function formatExportMember(typePrefixIfPossible: boolean, exportInfo: ExportInfo, newName?: string): string {
  const typeIfNeeded = typePrefixIfPossible && exportInfo.exportKind === 'type' ? 'type ' : '';

  if (newName) {
    return `${typeIfNeeded}${exportInfo.name} as ${newName}`;
  } else {
    return `${typeIfNeeded}${exportInfo.name}`;
  }
}

function getExportMemberMap(
  mapRegexes: [string | RegExp, string][] | null,
  exportMembers: ExportInfo[],
): Map<string, {exportInfo: ExportInfo; newName: string}> {
  const exportMemberMap = new Map<string, {exportInfo: ExportInfo; newName: string}>();

  if (!mapRegexes?.length) {
    return exportMemberMap;
  }

  for (const [find, replacement] of mapRegexes) {
    if (typeof find === 'string') {
      if (find !== replacement) {
        const exportInfo = exportMembers.find((x) => x.name === find);

        if (exportInfo) {
          exportMemberMap.set(find, {exportInfo, newName: replacement});

          if (find === '*') {
            return exportMemberMap;
          }
        }
      }
    } else {
      exportMembers.forEach((exportInfo) => {
        if (find.test(exportInfo.name)) {
          const newName = exportInfo.name.replace(find, replacement);

          if (exportInfo.name !== newName) {
            exportMemberMap.set(exportInfo.name, {exportInfo, newName});
          }
        }
      });
    }
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
