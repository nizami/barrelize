export type PathsDifferences = {insertions: string[]; deletions: string[]};

export function pathsDifferences(oldPaths: string[], newPaths: string[]): PathsDifferences {
  const insertions = newPaths.filter((x) => !oldPaths.includes(x));
  const deletions = oldPaths.filter((x) => !newPaths.includes(x));

  return {
    insertions,
    deletions,
  };
}
