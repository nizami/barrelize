import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'formatting');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

test('should use bracket spacing by default', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['foo'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('export { foo } from');
});

test('should disable bracket spacing', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      bracketSpacing: false,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['foo'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('export {foo} from');
});

test('should use single quotes by default', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("from './utils'");
});

test('should use double quotes', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      singleQuote: false,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('from "./utils"');
});

test('should use semicolons by default', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("from './utils';");
});

test('should disable semicolons', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      semi: false,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).not.toContain(';');
  expect(indexContent).toContain("from './utils'");
});

test('should add final newline by default', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent.endsWith('\n')).toBe(true);
});

test('should disable final newline', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      insertFinalNewline: false,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent.endsWith('\n')).toBe(false);
});

test('should override global formatting per barrel', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});
  mkdirSync(join(testDir, 'lib'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');
  writeFileSync(join(testDir, 'lib', 'helper.ts'), 'export const bar = 2;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      singleQuote: true,
      semi: true,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
        {
          root: 'lib',
          name: 'index.ts',
          include: ['**/*.ts'],
          singleQuote: false,
          semi: false,
        },
      ],
    },
    true,
  );

  const srcContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(srcContent).toContain("from './utils';");

  const libContent = readFileSync(join(testDir, 'lib', 'index.ts'), 'utf-8');
  expect(libContent).toContain('from "./helper"');
  expect(libContent).not.toContain(';');
});

test('should combine all formatting options', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      bracketSpacing: false,
      singleQuote: false,
      semi: false,
      insertFinalNewline: false,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['foo'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toBe('export {foo} from "./utils"');
});

test('should apply formatting to named exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'utils.ts'),
    `export const foo = 1;
export const bar = 2;`,
  );

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      bracketSpacing: true,
      singleQuote: true,
      semi: true,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['foo', 'bar'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { foo, bar } from './utils';");
});

test('should apply formatting to wildcard exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      singleQuote: false,
      semi: false,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('export * from "./utils"');
});

test('should apply formatting to namespace exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      singleQuote: false,
      semi: true,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['* as utils'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('export * as utils from "./utils";');
});

test('should handle barrel-specific bracket spacing', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          bracketSpacing: false,
          exports: {
            '**/*.ts': ['foo'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('export {foo} from');
});

test('should handle multiple exports with formatting', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'utils.ts'),
    `export const a = 1;
export const b = 2;
export const c = 3;`,
  );

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      bracketSpacing: true,
      singleQuote: true,
      semi: true,
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['a', 'b', 'c'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { a, b, c } from './utils';");
});
