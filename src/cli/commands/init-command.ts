import {colorize, INITIAL_CONFIG, logWarning, TerminalColor} from '#lib';
import {existsSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {dirname, extname, resolve} from 'node:path';
import {inspect} from 'node:util';

export async function runInitCommand(baseConfigFilePath: string) {
  const configFilePath = resolve(process.cwd(), baseConfigFilePath);

  if (existsSync(configFilePath)) {
    logWarning(`Config file '${configFilePath}' already exists`);

    return;
  }

  const configDirectoryPath = dirname(configFilePath);

  if (!existsSync(configDirectoryPath)) {
    logWarning(`Directory '${configDirectoryPath}' does not exist`);

    return;
  }

  let configTemplate: string;
  const extension = extname(configFilePath);
  switch (extension) {
    case '':
    case '.json':
      configTemplate = JSON.stringify(INITIAL_CONFIG, null, 2);
      break;

    case '.js':
    case '.mjs': {
      configTemplate = createMjsTemplate();
      break;
    }

    case '.cjs': {
      configTemplate = createCjsTemplate();
      break;
    }

    default:
      throw new Error(`Unsupported config extension: ${extension}`);
  }

  await writeFile(configFilePath, configTemplate);
  console.log(
    colorize(baseConfigFilePath, TerminalColor.CYAN),
    colorize(`config file created`, TerminalColor.GRAY),
  );
  console.log(colorize(configTemplate, TerminalColor.GREEN));
}

function createCjsTemplate(): string {
  // INITIAL_CONFIG_CJS is equal to INITIAL_CONFIG sans the $schema property
  const {$schema, ...INITIAL_CONFIG_CJS} = INITIAL_CONFIG;

  return `/**
 * @typedef {import('barrelize').Config} Config
 */

/** @type {Config} */
const config = ${inspect(INITIAL_CONFIG_CJS, {
    depth: null,
    compact: false,
    sorted: false,
  })};
module.exports = config;
`;
}

function createMjsTemplate(): string {
  // INITIAL_CONFIG_MJS is equal to INITIAL_CONFIG sans the $schema property
  const {$schema, ...INITIAL_CONFIG_MJS} = INITIAL_CONFIG;

  return `/**
 * @typedef {import('barrelize').Config} Config
 */

/** @type {Config} */
const config = ${inspect(INITIAL_CONFIG_MJS, {
    depth: null,
    compact: false,
    sorted: false,
  })};
export default config;
`;
}
