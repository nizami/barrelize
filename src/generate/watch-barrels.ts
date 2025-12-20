import {BarrelConfig, colorize, Config, generateBarrels, TerminalColor} from '#lib';
import {watch} from 'chokidar';
import {resolve} from 'node:path';

export async function watchBarrels(configDir: string, config: Config): Promise<void> {
  console.log(colorize('Watch mode enabled.', TerminalColor.GREEN));
  await generateBarrels(configDir, config, true);

  const watchDirectories = getWatchDirectories(configDir, config.barrels);
  const watchEvents = ['add', 'unlink', 'addDir', 'unlinkDir'] as const;

  for (const eventName of watchEvents) {
    watch(watchDirectories, {ignoreInitial: true}).on(eventName, async () => {
      await generateBarrels(configDir, config, true);
    });
  }
}

function getWatchDirectories(configDir: string, barrels: BarrelConfig[]): string[] {
  return barrels.map((barrelConfig) => resolve(configDir, barrelConfig.root));
}
