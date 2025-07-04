import {logError, runGenerateCommand, runInitCommand} from '#lib';
import {cac} from 'cac';
import {name, version} from '../../package.json';

export function cliInit(): void {
  const cli = cac(name);

  cli
    .command('[config path]', `Generate barrel files`)
    .option('-w, --watch', 'Watch for changes and regenerate barrel files automatically')
    .action(async (configPath: string, options: {watch: boolean}) => {
      await runGenerateCommand({configPath: configPath || '.barrelize', watch: !!options.watch});
    });

  cli
    .command('init [config path]', 'Create .barrelize config file if does not exist')
    .example('barrelize init')
    .example('barrelize init .barrelize')
    .example('barrelize init root/.barrelize')
    .action(async (path = '.barrelize') => {
      await runInitCommand(path);
    });

  cli.help();
  cli.version(version);

  try {
    cli.parse();
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message);
    } else {
      logError(String(error));
    }
  }
}
