import {logError, runGenerateCommand, runInitCommand} from '#lib';
import {cac} from 'cac';
import pkg from '../../package.json' with {type: 'json'};
import {resolveDefaultConfig} from '../config/resolve-default-config.js';

export function cliInit(): void {
  const cli = cac(pkg.name);

  cli
    .command('[config path]', 'Generate barrel files')
    .option('-w, --watch', 'Watch for changes and regenerate barrel files automatically')
    .action(async (configPath: string, options: {watch: boolean}) => {
      const defaultConfigFile = resolveDefaultConfig();

      await runGenerateCommand({configPath: configPath || defaultConfigFile, watch: !!options.watch}).catch(
        logError,
      );
    });

  cli
    .command('init [config path]', 'Create .barrelize.json config file if does not exist')
    .example('barrelize init')
    .example('barrelize init .barrelize.json')
    .example('barrelize init root/.barrelize.json')
    .example('barrelize init .barrelize.mjs')
    .example('barrelize init .barrelize.cjs')
    .example('barrelize init .barrelize.js')
    .action((path = '.barrelize.json') => runInitCommand(path).catch(logError));

  cli.help();
  cli.version(pkg.version);

  try {
    cli.parse();
  } catch (error) {
    logError(String(error));
  }
}
