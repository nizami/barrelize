import {BarrelConfig, Config, ExportPathInfo} from '#lib';

export function formatExportLine(path: ExportPathInfo, config: Config, barrelConfig: BarrelConfig): string {
  const bracketSpacing = barrelConfig.bracketSpacing ?? config.bracketSpacing ? ' ' : '';
  const quote = barrelConfig.singleQuote ?? config.singleQuote ? "'" : '"';
  const semi = barrelConfig.semi ?? config.semi ? ';' : '';
  const fromPartText = `from ${quote}./${path.modifiedPath}${quote}${semi}`;

  if (!path.exports?.length) {
    return `export * ${fromPartText}`;
  }

  const asteriskMembers = path.exports
    .filter((x) => x.startsWith('*'))
    .map((x) => `export ${x} ${fromPartText}`)
    .join('\n');

  const asteriskMembersText = asteriskMembers.length ? asteriskMembers + '\n' : '';

  const members = path.exports.filter((x) => !x.startsWith('*')).join(', ');

  return `${asteriskMembersText}export {${bracketSpacing}${members}${bracketSpacing}} ${fromPartText}`;
}
