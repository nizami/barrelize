import {readFile} from 'node:fs/promises';

export async function indexFileExportedPaths(indexFilePath: string): Promise<string[]> {
  const indexFileContent = await readFile(indexFilePath);
  const matches = indexFileContent.toString().match(/(?<='\.\/).+(?=')/g);

  return matches?.map((x) => x) ?? [];
}
