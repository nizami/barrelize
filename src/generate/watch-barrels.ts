import {BarrelConfig, colorize, Config, DEFAULT_CONFIG, generateBarrels, TerminalColor} from '#lib';
import {watch} from 'chokidar';
import {resolve} from 'node:path';

export function watchBarrels(configDir: string, configPath: string, config: Config): void {
  console.log(colorize('Watch mode enabled.', TerminalColor.GREEN));

  const watchDirectories = getWatchDirectories(configDir, config.barrels);

  const events = ['add', 'addDir', 'unlink', 'unlinkDir'] as const;

  for (const eventName of events) {
    watch(watchDirectories).on(eventName, async () => {
      await generateBarrels(configDir, configPath, config, true);
    });
  }
}

function getWatchDirectories(configDir: string, barrels: BarrelConfig[]): string[] {
  return barrels.map((barrelConfig) => resolve(configDir, barrelConfig.root ?? DEFAULT_CONFIG.root));
}
