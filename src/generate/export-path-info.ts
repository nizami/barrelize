export type ExportPathInfo = {
  originalPath: string;
  modifiedPath: string;

  // (e.g. util, util as u, * as services, ...)
  exports?: string[];
};
