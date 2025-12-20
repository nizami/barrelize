import {
  colorize,
  Config,
  formatExportLine,
  getExportedPathsFromContent,
  handlePaths,
  logWarning,
  pathsDifferences,
  TerminalColor,
} from '#lib';
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';

const BARRELIZE_CONTENT_REGEX = /(?<=\/\/ *barrelize-start *\n)[\s\S]*(?= *\/\/ *barrelize-end)/;

export async function generateBarrels(configDir: string, config: Config): Promise<void> {
  for (const barrelConfig of config.barrels) {
    const indexFileBasePath = barrelConfig.name;
    const indexFileRelativePath = join(barrelConfig.root, indexFileBasePath);
    const indexFileAbsolutePath = resolve(configDir, indexFileRelativePath);
    const indexDirectory = dirname(indexFileAbsolutePath);

    if (!existsSync(indexDirectory)) {
      logWarning(`Index directory '${indexDirectory}' does not exist - skipping`);
      logWarning(`  Please verify the 'root' path in your barrelize configuration`);

      continue;
    }

    const newExportPaths = await handlePaths(configDir, barrelConfig);
    const insertFinalNewline = barrelConfig.insertFinalNewline ?? config.insertFinalNewline;

    let newContent = newExportPaths.map((x) => formatExportLine(x, config, barrelConfig)).join('\n');

    const exportedText = `${newExportPaths.length} file${plural(newExportPaths)} exported`;

    if (existsSync(indexFileAbsolutePath)) {
      const oldFileContent = (await readFile(indexFileAbsolutePath)).toString();
      const barrelizeMatch = oldFileContent.match(BARRELIZE_CONTENT_REGEX);
      const barrelizeContent = barrelizeMatch?.at(0);
      newContent += insertFinalNewline || barrelizeMatch ? '\n' : '';

      if ((barrelizeContent ?? oldFileContent) === newContent) {
        console.log(
          colorize('IGNORE', TerminalColor.GRAY),
          colorize(indexFileRelativePath, TerminalColor.CYAN),
          colorize(exportedText, TerminalColor.GRAY),
        );

        continue;
      }

      if (barrelizeMatch) {
        await writeFile(indexFileAbsolutePath, oldFileContent.replace(BARRELIZE_CONTENT_REGEX, newContent));
      } else {
        await writeFile(indexFileAbsolutePath, newContent);
      }

      const oldExportPaths = await getExportedPathsFromContent(barrelizeContent ?? oldFileContent);
      const {insertions, deletions} = pathsDifferences(
        newExportPaths.map((x) => x.modifiedPath),
        oldExportPaths,
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

    newContent += insertFinalNewline ? '\n' : '';

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
