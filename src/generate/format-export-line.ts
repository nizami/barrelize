import {BarrelConfig, Config, DEFAULT_CONFIG, ExportPathInfo} from '#lib';

export function formatExportLine(path: ExportPathInfo, config: Config, barrelConfig: BarrelConfig): string {
  const bracketSpacingIfNeeded =
    barrelConfig.bracketSpacing ?? config.bracketSpacing ?? DEFAULT_CONFIG.bracketSpacing ? ' ' : '';
  const quote = barrelConfig.singleQuote ?? config.singleQuote ?? DEFAULT_CONFIG.singleQuote ? "'" : '"';
  const semiIfNeeded = barrelConfig.semi ?? config.semi ?? DEFAULT_CONFIG.semi ? ';' : '';

  if (!path.exports?.length) {
    return `export * from ${quote}./${path.modifiedPath}${quote}${semiIfNeeded}`;
  }

  const members = path.exports.join(', ');

  if (path.exports.length === 1 && path.exports[0].startsWith('*')) {
    return `export ${members} from ${quote}./${path.modifiedPath}${quote}${semiIfNeeded}`;
  }

  return `export {${bracketSpacingIfNeeded}${members}${bracketSpacingIfNeeded}} from ${quote}./${path.modifiedPath}${quote}${semiIfNeeded}`;
}
