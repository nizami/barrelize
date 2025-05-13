export type PathsDifferences = {insertions: string[]; deletions: string[]};

export function pathsDifferences(newPaths: string[], oldPaths: string[]): PathsDifferences {
  const insertions = newPaths.filter((x) => !oldPaths.includes(x));
  const deletions = oldPaths.filter((x) => !newPaths.includes(x));

  return {
    insertions,
    deletions,
  };
}
