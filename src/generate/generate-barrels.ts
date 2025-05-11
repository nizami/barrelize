import {
  colorize,
  Config,
  DEFAULT_CONFIG,
  generateBarrel,
  indexFileExportedPaths,
  logWarning,
  pathsDifferences,
  TerminalColor,
} from '#lib';
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';

export async function generateBarrels(rootPath: string, configPath: string, config: Config): Promise<void> {
  for (const directoryConfig of config.directories) {
    const indexFileBasePath = directoryConfig.indexFilePath ?? DEFAULT_CONFIG.indexFilePath;
    const indexFileRelativePath = join(directoryConfig.path ?? DEFAULT_CONFIG.path, indexFileBasePath);
    const indexFileAbsolutePath = resolve(rootPath, indexFileRelativePath);
    const indexDirectory = dirname(indexFileAbsolutePath);

    if (!existsSync(indexDirectory)) {
      console.error(logWarning(`Index directory '${indexDirectory}' does not exist - skipping`));
      console.error(logWarning(`  Please verify the directory path in your '${configPath}' configuration`));

      continue;
    }

    const paths = await generateBarrel(rootPath, directoryConfig);
    const quote = directoryConfig.singleQuote ?? config.singleQuote ?? DEFAULT_CONFIG.singleQuote ? "'" : '"';
    const semiIfNeeded = directoryConfig.semi ?? config.semi ?? DEFAULT_CONFIG.semi ? ';' : '';
    const newLineIfNeeded =
      directoryConfig.insertFinalNewline ?? config.insertFinalNewline ?? DEFAULT_CONFIG.insertFinalNewline
        ? '\n'
        : '';

    const formatExportLine = (path: string) => `export * from ${quote}./${path}${quote}${semiIfNeeded}`;
    const content = paths.map(formatExportLine).join('\n') + newLineIfNeeded;
    const exportedText = `${paths.length} file${plural(paths)} exported`;

    if (existsSync(indexFileAbsolutePath)) {
      const oldContent = (await readFile(indexFileAbsolutePath)).toString();
      const oldPaths = await indexFileExportedPaths(oldContent);

      if (content === oldContent) {
        console.log(
          colorize('IGNORE', TerminalColor.GREEN),
          colorize(indexFileRelativePath, TerminalColor.CYAN),
          colorize(exportedText, TerminalColor.GRAY),
        );

        return;
      }

      await writeFile(indexFileAbsolutePath, content);
      const {insertions, deletions} = pathsDifferences(oldPaths, paths);

      const insertionsText =
        insertions.length > 0 ? `, ${insertions.length} insertion${plural(insertions)}` : '';

      const deletionsText = deletions.length > 0 ? `, ${deletions.length} deletion${plural(deletions)}` : '';

      console.log(
        colorize('UPDATE', TerminalColor.GREEN),
        colorize(indexFileRelativePath, TerminalColor.CYAN),
        colorize(`${exportedText}${insertionsText}${deletionsText}`, TerminalColor.GRAY),
      );

      printDifferences(insertions, deletions);

      return;
    }

    await writeFile(indexFileAbsolutePath, content);

    console.log(
      colorize('CREATE', TerminalColor.GREEN),
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
