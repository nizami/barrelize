const EXPORT_PATH_REGEX = /(?<='\.\/).+(?=')/g;

export async function getExportedPathsFromContent(content: string): Promise<string[]> {
  const matches = content.match(EXPORT_PATH_REGEX);

  return matches?.map((x) => x) ?? [];
}
