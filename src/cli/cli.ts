import {logError, runGenerateCommand, runInitCommand} from '#lib';
import {cac} from 'cac';
import {name, version} from '../../package.json';

export function cliInit(): void {
  const cli = cac(name);

  cli
    .command('[config path]', 'Generate barrel files')
    .option('-w, --watch', 'Watch for changes and regenerate barrel files automatically')
    .action((configPath: string, options: {watch: boolean}) =>
      runGenerateCommand({configPath: configPath || '.barrelize', watch: !!options.watch}).catch(logError),
    );

  cli
    .command('init [config path]', 'Create .barrelize config file if does not exist')
    .example('barrelize init')
    .example('barrelize init .barrelize')
    .example('barrelize init root/.barrelize')
    .action((path = '.barrelize') => runInitCommand(path).catch(logError));

  cli.help();
  cli.version(version);

  try {
    cli.parse();
  } catch (error) {
    logError(String(error));
  }
}
