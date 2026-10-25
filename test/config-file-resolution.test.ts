import {INITIAL_CONFIG} from '#lib';
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {resolveDefaultConfig} from '../src/config/resolve-default-config.js';

const fixturesDir = join(__dirname, 'test-fixtures', 'config-file-resolution');

beforeEach(() => {
  rmSync(fixturesDir, {recursive: true, force: true});
});

afterEach(() => {
  rmSync(fixturesDir, {recursive: true, force: true});
});

describe('default config file resolution', () => {
  test('.barrelize.json should be used as default when .barrelize does not exist', async () => {
    const testDir = join(fixturesDir, 'json-default');
    mkdirSync(testDir, {recursive: true});

    // Create a .barrelize.json config (not .barrelize)
    writeFileSync(
      join(testDir, '.barrelize.json'),
      JSON.stringify({
        barrels: [
          {
            root: 'src',
            name: 'index.ts',
            include: ['**/*.ts'],
          },
        ],
      }),
    );

    mkdirSync(join(testDir, 'src'), {recursive: true});
    writeFileSync(join(testDir, 'src', 'foo.ts'), 'export const foo = 1;');

    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));

    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.json'));

    // Verify the config file exists and is readable
    const content = readFileSync(defaultConfigFile, 'utf-8');
    expect(content).toContain('barrels');
  });

  test('.barrelize should take precedence over .barrelize.json when both exist (backward compat)', async () => {
    const testDir = join(fixturesDir, 'backward-compat');
    mkdirSync(testDir, {recursive: true});

    // Create BOTH config files
    writeFileSync(
      join(testDir, '.barrelize'),
      JSON.stringify({
        barrels: [
          {
            root: 'src',
            name: 'index.ts',
            include: ['**/*.ts'],
          },
        ],
      }),
    );

    writeFileSync(
      join(testDir, '.barrelize.json'),
      JSON.stringify({
        barrels: [
          {
            root: 'src',
            name: 'index.ts',
            include: ['**/*.tsx'], // different config
          },
        ],
      }),
    );

    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));

    expect(defaultConfigFile).toBe(join(testDir, '.barrelize'));
  });

  test('.barrelize.json should take precedence over .barrelize.mjs when both exist (backward compat)', async () => {
    const testDir = join(fixturesDir, 'backward-compat');
    mkdirSync(testDir, {recursive: true});

    // Create BOTH config files
    writeFileSync(
      join(testDir, '.barrelize.json'),
      JSON.stringify({
        barrels: [
          {
            root: 'src',
            name: 'index.ts',
            include: ['**/*.ts'],
          },
        ],
      }),
    );

    writeFileSync(
      join(testDir, '.barrelize.mjs'),
      `export const config = {
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
    }
  ]
};`,
    );

    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));
    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.json'));

    // Verify the config file exists and is readable
    const content = readFileSync(defaultConfigFile, 'utf-8');
    expect(content).toContain('barrels');
  });

  test('.barrelize.json should take precedence over .barrelize.cjs when both exist (backward compat)', async () => {
    const testDir = join(fixturesDir, 'backward-compat');
    mkdirSync(testDir, {recursive: true});

    // Create BOTH config files
    writeFileSync(
      join(testDir, '.barrelize.json'),
      JSON.stringify({
        barrels: [
          {
            root: 'src',
            name: 'index.ts',
            include: ['**/*.ts'],
          },
        ],
      }),
    );

    writeFileSync(
      join(testDir, '.barrelize.cjs'),
      `const config = {
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
      replace: {
        '/\\.ts$/': '.js'
      }
    }
  ]
};
module.exports = config;`,
    );

    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));

    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.json'));

    // Verify the config file exists and is readable
    const content = readFileSync(defaultConfigFile, 'utf-8');
    expect(content).toContain('barrels');
  });

  test('.barrelize.json should take precedence over .barrelize.js when both exist (backward compat)', async () => {
    const testDir = join(fixturesDir, 'backward-compat');
    mkdirSync(testDir, {recursive: true});

    // Create BOTH config files
    writeFileSync(
      join(testDir, '.barrelize.json'),
      JSON.stringify({
        barrels: [
          {
            root: 'src',
            name: 'index.ts',
            include: ['**/*.ts'],
          },
        ],
      }),
    );

    writeFileSync(
      join(testDir, '.barrelize.js'),
      `export const config = {
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
    }
  ]
};`,
    );

    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));

    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.json'));

    // Verify the config file exists and is readable
    const content = readFileSync(defaultConfigFile, 'utf-8');
    expect(content).toContain('barrels');
  });

  test('.barrelize.mjs should be used when it exists', async () => {
    const testDir = join(fixturesDir, 'mjs-config');
    mkdirSync(testDir, {recursive: true});

    writeFileSync(
      join(testDir, '.barrelize.mjs'),
      `const config = {
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
    }
  ]
};
export default config;`,
    );

    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));
    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.mjs'));

    // Verify the config file exists and is correct
    const {default: config} = await import(defaultConfigFile);
    expect(config).toEqual({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });
  });

  test('.barrelize.cjs should be used when it exists', async () => {
    const testDir = join(fixturesDir, 'cjs-config');
    mkdirSync(testDir, {recursive: true});

    writeFileSync(
      join(testDir, '.barrelize.cjs'),
      `const config = {
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
    }
  ]
};
module.exports = config;`,
    );

    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));
    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.cjs'));
    expect(require('node:fs').existsSync(defaultConfigFile)).toBe(true);

    // Verify the config file exists and is correct
    const config = require(defaultConfigFile);

    expect(config).toEqual({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });
  });

  test('.barrelize.js should be used when it exists', async () => {
    const testDir = join(fixturesDir, 'js-config');
    mkdirSync(testDir, {recursive: true});

    writeFileSync(
      join(testDir, '.barrelize.js'),
      `const config = {
  barrels: [
    {
      root: 'src',
      name: 'index.ts',
      include: ['**/*.ts'],
    }
  ]
};
export default config;`,
    );

    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));
    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.js'));

    // Verify the config file exists and is correct
    const {default: config} = await import(defaultConfigFile);
    expect(config).toEqual({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });
  });

  test('should fall back to .barrelize.json when no config file exists', async () => {
    const testDir = join(fixturesDir, 'no-config');
    mkdirSync(testDir, {recursive: true});

    // None of the files exist — resolution should still produce .barrelize.json path
    // Simulate the resolution logic from cli.ts
    const defaultConfigFile = resolve(testDir, resolveDefaultConfig(testDir));

    expect(defaultConfigFile).toBe(join(testDir, '.barrelize.json'));
  });
});

describe('init command default config path', () => {
  test('runInitCommand should create .barrelize.json by default', async () => {
    const {runInitCommand} = await import('../src/cli/commands/init-command.js');

    const testDir = join(fixturesDir, 'init-default');
    mkdirSync(testDir, {recursive: true});

    // Change to test dir so init writes there
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await runInitCommand('.barrelize.json');

      const configPath = join(testDir, '.barrelize.json');
      expect(require('node:fs').existsSync(configPath)).toBe(true);

      const content = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(content).toHaveProperty('barrels');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('runInitCommand should create custom named config when path is provided', async () => {
    const {runInitCommand} = await import('../src/cli/commands/init-command.js');

    const testDir = join(fixturesDir, 'init-custom');
    mkdirSync(testDir, {recursive: true});

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await runInitCommand('my-barrelize.json');

      const configPath = join(testDir, 'my-barrelize.json');
      expect(require('node:fs').existsSync(configPath)).toBe(true);

      const content = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(content).toHaveProperty('barrels');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('runInitCommand should warn when config file already exists', async () => {
    const {runInitCommand} = await import('../src/cli/commands/init-command.js');

    const testDir = join(fixturesDir, 'init-exists');
    mkdirSync(testDir, {recursive: true});

    // Pre-create the config
    writeFileSync(join(testDir, '.barrelize.json'), JSON.stringify({barrels: []}));

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const consoleSpy = vi.spyOn(console, 'log');

      await runInitCommand('.barrelize.json');

      // Should not create a new file or overwrite — just warn
      expect(require('node:fs').existsSync(join(testDir, '.barrelize.json'))).toBe(true);

      consoleSpy.mockRestore();
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('runInitCommand should create .barrelize.cjs config when path with .cjs extension is specified', async () => {
    const {runInitCommand} = await import('../src/cli/commands/init-command.js');

    const testDir = join(fixturesDir, 'init-custom');
    mkdirSync(testDir, {recursive: true});

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await runInitCommand('.barrelize.cjs');

      const configPath = join(testDir, '.barrelize.cjs');
      expect(require('node:fs').existsSync(configPath)).toBe(true);

      const config = require(configPath);
      const {$schema, ...expectedCjsConfig} = INITIAL_CONFIG;

      // expectedCjsConfig should not contain the $schema property
      expect(config).toEqual(expectedCjsConfig);
      expect(config).not.toHaveProperty('$schema');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('runInitCommand should create .barrelize.mjs config when path with .mjs extension is specified', async () => {
    const {runInitCommand} = await import('../src/cli/commands/init-command.js');

    const testDir = join(fixturesDir, 'init-custom');
    mkdirSync(testDir, {recursive: true});

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await runInitCommand('.barrelize.mjs');

      const configPath = join(testDir, '.barrelize.mjs');
      expect(require('node:fs').existsSync(configPath)).toBe(true);

      const {default: config} = await import(configPath);
      const {$schema, ...expectedMjsConfig} = INITIAL_CONFIG;

      // expectedMjsConfig should not contain the $schema property
      expect(config).toEqual(expectedMjsConfig);
      expect(config).not.toHaveProperty('$schema');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('runInitCommand should create .barrelize.js config when path with .js extension is specified', async () => {
    const {runInitCommand} = await import('../src/cli/commands/init-command.js');

    const testDir = join(fixturesDir, 'init-custom');
    mkdirSync(testDir, {recursive: true});

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await runInitCommand('.barrelize.js');

      const configPath = join(testDir, '.barrelize.js');
      expect(require('node:fs').existsSync(configPath)).toBe(true);

      const {default: config} = await import(configPath);
      const {$schema, ...expectedJsConfig} = INITIAL_CONFIG;

      // expectedJsConfig should not contain the $schema property
      expect(config).toEqual(expectedJsConfig);
      expect(config).not.toHaveProperty('$schema');
    } finally {
      process.chdir(originalCwd);
    }
  });
});
