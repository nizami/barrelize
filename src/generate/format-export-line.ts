import {BarrelConfig, Config, DEFAULT_CONFIG, ExportPathInfo} from '#lib';

export function formatExportLine(path: ExportPathInfo, config: Config, barrelConfig: BarrelConfig): string {
  const bracketSpacingIfNeeded =
    barrelConfig.bracketSpacing ?? config.bracketSpacing ?? DEFAULT_CONFIG.bracketSpacing ? ' ' : '';
  const quote = barrelConfig.singleQuote ?? config.singleQuote ?? DEFAULT_CONFIG.singleQuote ? "'" : '"';
  const semiIfNeeded = barrelConfig.semi ?? config.semi ?? DEFAULT_CONFIG.semi ? ';' : '';
  const fromPartText = `from ${quote}./${path.modifiedPath}${quote}${semiIfNeeded}`;

  if (!path.exports?.length) {
    return `export * ${fromPartText}`;
  }

  const asteriskMembers = path.exports
    .filter((x) => x.startsWith('*'))
    .map((x) => `export ${x} ${fromPartText}`)
    .join('\n');

  const asteriskMembersText = asteriskMembers.length ? asteriskMembers + '\n' : '';

  const members = path.exports.filter((x) => !x.startsWith('*')).join(', ');

  return `${asteriskMembersText}export {${bracketSpacingIfNeeded}${members}${bracketSpacingIfNeeded}} ${fromPartText}`;
}
