import {
  colorize,
  Config,
  DEFAULT_CONFIG,
  formatExportLine,
  handlePaths,
  indexFileExportedPaths,
  logWarning,
  pathsDifferences,
  TerminalColor,
} from '#lib';
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';

export async function generateBarrels(configDir: string, configPath: string, config: Config): Promise<void> {
  for (const barrelConfig of config.barrels) {
    const indexFileBasePath = barrelConfig.name ?? DEFAULT_CONFIG.name;
    const indexFileRelativePath = join(barrelConfig.root ?? DEFAULT_CONFIG.root, indexFileBasePath);
    const indexFileAbsolutePath = resolve(configDir, indexFileRelativePath);
    const indexDirectory = dirname(indexFileAbsolutePath);

    if (!existsSync(indexDirectory)) {
      console.error(logWarning(`Index directory '${indexDirectory}' does not exist - skipping`));
      console.error(logWarning(`  Please verify the directory path in your '${configPath}' configuration`));

      continue;
    }

    const exportPaths = await handlePaths(configDir, barrelConfig);

    const newLineIfNeeded =
      barrelConfig.insertFinalNewline ?? config.insertFinalNewline ?? DEFAULT_CONFIG.insertFinalNewline
        ? '\n'
        : '';

    const newContent =
      exportPaths.map((x) => formatExportLine(x, config, barrelConfig)).join('\n') + newLineIfNeeded;
    const exportedText = `${exportPaths.length} file${plural(exportPaths)} exported`;

    if (existsSync(indexFileAbsolutePath)) {
      const oldContent = (await readFile(indexFileAbsolutePath)).toString();

      if (newContent === oldContent) {
        console.log(
          colorize('IGNORE', TerminalColor.GRAY),
          colorize(indexFileRelativePath, TerminalColor.CYAN),
          colorize(exportedText, TerminalColor.GRAY),
        );

        continue;
      }

      const oldPaths = await indexFileExportedPaths(oldContent);
      await writeFile(indexFileAbsolutePath, newContent);

      const {insertions, deletions} = pathsDifferences(
        oldPaths,
        exportPaths.map((x) => x.modifiedPath),
      );

      const insertionsText =
        insertions.length > 0 ? `, ${insertions.length} insertion${plural(insertions)}` : '';

      const deletionsText = deletions.length > 0 ? `, ${deletions.length} deletion${plural(deletions)}` : '';

      console.log(
        colorize('UPDATE', TerminalColor.GRAY),
        colorize(indexFileRelativePath, TerminalColor.CYAN),
        colorize(`${exportedText}${insertionsText}${deletionsText}`, TerminalColor.GRAY),
      );

      printDifferences(insertions, deletions);

      continue;
    }

    await writeFile(indexFileAbsolutePath, newContent);

    console.log(
      colorize('CREATE', TerminalColor.GRAY),
      colorize(indexFileRelativePath, TerminalColor.CYAN),
      colorize(exportedText, TerminalColor.GRAY),
    );
  }
}

function printDifferences(insertions: string[], deletions: string[]): void {
  for (const path of insertions) {
    console.log(colorize(`  + ${path}`, TerminalColor.GREEN));
  }

  for (const path of deletions) {
    console.log(colorize(`  - ${path}`, TerminalColor.RED));
  }
}

function plural(array: unknown[]): string {
  return array.length > 1 ? 's' : '';
}
