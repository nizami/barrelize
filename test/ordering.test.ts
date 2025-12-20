import {$Config} from '#lib';
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'ordering');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

describe('ordering', () => {
  test('should order exports alphabetically by default', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'zebra.ts'), 'export const zebra = 1;');
    writeFileSync(join(testDir, 'src', 'alpha.ts'), 'export const alpha = 1;');
    writeFileSync(join(testDir, 'src', 'beta.ts'), 'export const beta = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('alpha');
    expect(lines[1]).toContain('beta');
    expect(lines[2]).toContain('zebra');
  });

  test('should order exports based on custom order', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'types.ts'), 'export type User = {};');
    writeFileSync(join(testDir, 'src', 'constants.ts'), 'export const MAX = 100;');
    writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const util = () => {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['types', 'constants', 'utils'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('types');
    expect(lines[1]).toContain('constants');
    expect(lines[2]).toContain('utils');
  });

  test('should place ordered files first, then alphabetically', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'types.ts'), 'export type User = {};');
    writeFileSync(join(testDir, 'src', 'zebra.ts'), 'export const zebra = 1;');
    writeFileSync(join(testDir, 'src', 'alpha.ts'), 'export const alpha = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['types'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('types');
    expect(lines[1]).toContain('alpha');
    expect(lines[2]).toContain('zebra');
  });

  test('should handle nested path ordering', async () => {
    mkdirSync(join(testDir, 'src', 'components'), {recursive: true});
    mkdirSync(join(testDir, 'src', 'utils'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'components', 'button.ts'), 'export const Button = () => {};');
    writeFileSync(join(testDir, 'src', 'utils', 'format.ts'), 'export const format = () => {};');
    writeFileSync(join(testDir, 'src', 'types.ts'), 'export type User = {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['types', 'components', 'utils'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('types');
    expect(lines[1]).toContain('components/button');
    expect(lines[2]).toContain('utils/format');
  });

  test('should order alphabetically by default', async () => {
    mkdirSync(join(testDir, 'src', 'components', 'forms'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'components', 'forms', 'input.ts'), 'export const Input = () => {};');
    writeFileSync(join(testDir, 'src', 'components', 'button.ts'), 'export const Button = () => {};');
    writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const utils = () => {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('components/button');
    expect(lines[1]).toContain('components/forms/input');
    expect(lines[2]).toContain('utils');
  });

  test('should handle partial order matches', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'types.core.ts'), 'export type Core = {};');
    writeFileSync(join(testDir, 'src', 'types.user.ts'), 'export type User = {};');
    writeFileSync(join(testDir, 'src', 'constants.ts'), 'export const MAX = 100;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['types'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('types.core');
    expect(lines[1]).toContain('types.user');
    expect(lines[2]).toContain('constants');
  });

  test('should maintain alphabetical order within same order group', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'types.zebra.ts'), 'export type Zebra = {};');
    writeFileSync(join(testDir, 'src', 'types.alpha.ts'), 'export type Alpha = {};');
    writeFileSync(join(testDir, 'src', 'types.beta.ts'), 'export type Beta = {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['types'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('types.alpha');
    expect(lines[1]).toContain('types.beta');
    expect(lines[2]).toContain('types.zebra');
  });

  test('should handle order with nested directories', async () => {
    mkdirSync(join(testDir, 'src', 'components', 'ui'), {recursive: true});
    mkdirSync(join(testDir, 'src', 'utils'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'components', 'ui', 'button.ts'), 'export const Button = () => {};');
    writeFileSync(join(testDir, 'src', 'utils', 'format.ts'), 'export const format = () => {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['utils', 'components'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('utils/format');
    expect(lines[1]).toContain('components/ui/button');
  });

  test('should handle empty order array', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'zebra.ts'), 'export const zebra = 1;');
    writeFileSync(join(testDir, 'src', 'alpha.ts'), 'export const alpha = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: [],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('alpha');
    expect(lines[1]).toContain('zebra');
  });

  test('should handle order with file extensions', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'index.css'), '.class {}');
    writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => {};');
    writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const utils = () => {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts', '**/*.tsx'],
          order: ['component', 'utils'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('component.tsx');
    expect(lines[1]).toContain('utils');
  });

  test('should handle complex ordering scenario', async () => {
    mkdirSync(join(testDir, 'src', 'api'), {recursive: true});
    mkdirSync(join(testDir, 'src', 'components'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'types.ts'), 'export type T = {};');
    writeFileSync(join(testDir, 'src', 'constants.ts'), 'export const C = 1;');
    writeFileSync(join(testDir, 'src', 'api', 'client.ts'), 'export const client = {};');
    writeFileSync(join(testDir, 'src', 'components', 'button.ts'), 'export const Button = () => {};');
    writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const utils = () => {};');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          order: ['types', 'constants', 'api'],
        },
      ],
    });

    await generateBarrels(testDir, '.barrelize', config, true);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    const lines = indexContent.split('\n').filter((l) => l.trim());

    expect(lines[0]).toContain('types');
    expect(lines[1]).toContain('constants');
    expect(lines[2]).toContain('api/client');
    const hasComponents = indexContent.includes('components/button');
    const hasUtils = indexContent.includes('utils');
    expect(hasComponents).toBe(true);
    expect(hasUtils).toBe(true);
  });
});
