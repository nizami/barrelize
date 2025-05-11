export async function indexFileExportedPaths(indexFileContent: string): Promise<string[]> {
  const matches = indexFileContent.match(/(?<='\.\/).+(?=')/g);

  return matches?.map((x) => x) ?? [];
}
