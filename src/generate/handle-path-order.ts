import {BarrelConfig, DEFAULT_CONFIG} from '#lib';

export function handlePathOrder(config: BarrelConfig, paths: string[]): string[] {
  paths = paths.sort((a, b) => a.localeCompare(b));
  const orders = config.order ?? DEFAULT_CONFIG.order;

  if (!orders.length) {
    return paths;
  }

  return paths.sort((a, b) => pathCompare(config.order!, a, b));
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

  return a.length - b.length;
}
