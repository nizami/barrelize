import {BarrelConfig, DEFAULT_CONFIG, ExportPathInfo} from '#lib';

export async function handlePathOrder(config: BarrelConfig, paths: ExportPathInfo[]): Promise<void> {
  const orders = config.order ?? DEFAULT_CONFIG.order;

  if (orders.length) {
    paths.sort((a, b) => pathCompare(config.order!, a.originalPath, b.originalPath));

    return;
  }

  paths.sort((a, b) => a.originalPath.localeCompare(b.originalPath));
}

function pathCompare(order: string[], a: string, b: string): number {
  const normalizeWeight = (index: number) => (index < 0 ? order.length : index);

  const orderWeightA = normalizeWeight(order.findIndex((x) => a.startsWith(x)));
  const orderWeightB = normalizeWeight(order.findIndex((x) => b.startsWith(x)));

  if (orderWeightA !== orderWeightB) {
    return orderWeightA - orderWeightB;
  }

  const pathPortionsA = a.split('/').length;
  const pathPortionsB = b.split('/').length;

  if (pathPortionsA !== pathPortionsB) {
    return pathPortionsA - pathPortionsB;
  }

  return a.localeCompare(b);
}
