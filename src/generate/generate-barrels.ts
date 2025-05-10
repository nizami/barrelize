import {colorize, Config, DEFAULT_CONFIG, logError, logWarning, TerminalColor} from '#lib';
import {glob} from 'glob';
import {existsSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';

export async function generateBarrels(rootPath: string, config: Config): Promise<void> {
  for (const directoryConfig of config.directories) {
    const indexFileBasePath = directoryConfig.indexFilePath ?? DEFAULT_CONFIG.indexFilePath;
    const indexFileRelativePath = join(directoryConfig.path ?? DEFAULT_CONFIG.path, indexFileBasePath);
    const indexFileAbsolutePath = resolve(rootPath, indexFileRelativePath);
    const indexDirectory = dirname(indexFileAbsolutePath);

    if (!existsSync(indexDirectory)) {
      console.error(logWarning(`Index directory '${indexDirectory}' does not exist - skipping`));
      console.error(logWarning(`  Please verify the directory path in your configuration`));

      continue;
    }

    const files = await generateBarrel(rootPath, directoryConfig);
    const content = files.map((x) => `export * from './${x}';`).join('\n');

    await writeFile(indexFileAbsolutePath, content);

    console.log(
      colorize(indexFileRelativePath, TerminalColor.CYAN),
      colorize(`exports ${files.length} file${files.length > 1 ? 's' : ''}`, TerminalColor.GRAY),
    );
  }
}

async function generateBarrel(
  rootPath: string,
  directoryConfig: Config['directories'][0],
): Promise<string[]> {
  const ignore = [...(directoryConfig.exclude ?? DEFAULT_CONFIG.exclude), '**/index.ts', '**/index.js'];
  const cwd = resolve(rootPath, directoryConfig.path ?? DEFAULT_CONFIG.path);

  let files = await glob(directoryConfig.include ?? DEFAULT_CONFIG.include, {
    cwd,
    ignore,
    nodir: true,
    includeChildMatches: true,
  });
  files = files.map((file) => file.replace(/\\/g, '/'));
  files = handleOrder(directoryConfig, files);
  files = handlePathReplacement(directoryConfig, files);

  return files;
}

function handlePathReplacement(config: Config['directories'][0], files: string[]): string[] {
  const replaces = config.replace ?? DEFAULT_CONFIG.replace;

  for (let i = 0; i < replaces.length; i++) {
    const {find, replacement} = replaces[i];

    try {
      const regexp = new RegExp(find);
      files = files.map((file) => file.replace(regexp, replacement));
    } catch (error) {
      if (error instanceof SyntaxError) {
        logError(
          error.message.replace(
            'Invalid regular expression:',
            `Invalid regular expression number ${i + 1} in config.`,
          ),
        );
      } else {
        logWarning(`Invalid regular expression number ${i + 1}`);
      }
    }
  }

  return files;
}

function handleOrder(config: Config['directories'][0], files: string[]): string[] {
  files = files.sort((a, b) => a.localeCompare(b));
  const orders = config.order ?? DEFAULT_CONFIG.order;

  if (!orders.length) {
    return files;
  }

  return files.sort((a, b) => sortPathWeight(config.order!, b) - sortPathWeight(config.order!, a));
}

function sortPathWeight(order: string[], path: string): number {
  const orderIndex = order.findIndex((x) => path.startsWith(x));

  if (orderIndex >= 0) {
    return (order.length - orderIndex) * 100 - path.split('/').length;
  }

  return -path.split('/').length;
}

// async function main() {
//   await Promise.all(directories.map((directory) => createBarrel(directory)));
//   console.log('\x1b[32m%s\x1b[0m', 'Barrels Done!');
// }

// main().catch(console.error);
