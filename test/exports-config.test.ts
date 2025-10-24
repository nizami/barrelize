import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'exports-config');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

test('should handle wildcard exports', async () => {
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
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exports: {
            '**/*.ts': ['*'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './utils';");
});

test('should handle named exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'utils.ts'),
    `export const foo = 1;
export const bar = 2;
export const baz = 3;`,
  );

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
            '**/*.ts': ['foo', 'bar'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { foo, bar } from './utils';");
  expect(indexContent).not.toContain('baz');
});

test('should handle default exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'component.ts'), 'export default function Component() {}');

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
            '**/*.ts': ['default'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { default } from './component';");
});

test('should handle namespace exports', async () => {
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
  expect(indexContent).toContain("export * as utils from './utils';");
});

test('should handle wildcard exports by default when exports array exists', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'component.ts'),
    `export const ButtonConfig = { size: 'large' };
export const InputConfig = { type: 'text' };
export const helper = () => {};`,
  );

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
  expect(indexContent).toContain("export * from './component';");
});

test('should handle specific named exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'component.ts'),
    `export const ButtonConfig = { size: 'large' };
export const InputConfig = { type: 'text' };`,
  );

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
            '**/*.ts': ['ButtonConfig', 'InputConfig'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('ButtonConfig');
  expect(indexContent).toContain('InputConfig');
});

test('should handle multiple export patterns per file', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'utils.ts'),
    `export const foo = 1;
export const bar = 2;
export default function defaultFn() {}`,
  );

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
            '**/*.ts': ['foo', 'default'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { foo, default } from './utils';");
  expect(indexContent).not.toContain('bar');
});

test('should handle type exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'types.ts'),
    `export type User = { name: string };
export const value = 1;`,
  );

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
            '**/*.ts': ['User'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('type User');
});

test('should mix wildcard and named exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'a.ts'),
    `export const foo = 1;
export const bar = 2;`,
  );

  writeFileSync(join(testDir, 'src', 'b.ts'), `export const baz = 3;`);

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
            'a.ts': ['foo'],
            'b.ts': ['*'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { foo } from './a';");
  expect(indexContent).toContain("export * from './b';");
});

test('should handle renamed exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), `export const foo = 1;`);

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
            '**/*.ts': ['foo as bar'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { foo as bar } from './utils';");
});

test('should handle exports from different file patterns', async () => {
  mkdirSync(join(testDir, 'src', 'components'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'utils'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'components', 'button.ts'), 'export default function Button() {}');

  writeFileSync(join(testDir, 'src', 'utils', 'format.ts'), 'export const format = () => {};');

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
            'components/**/*.ts': ['default'],
            'utils/**/*.ts': ['*'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { default } from './components/button';");
  expect(indexContent).toContain("export * from './utils/format';");
});

test('should handle empty exports array', async () => {
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
            '**/*.ts': [],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './utils';");
});

test('should include non-existent exports as-is', async () => {
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
            '**/*.ts': ['nonExistent'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('nonExistent');
});

test('should handle namespace with rename', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'helpers.ts'),
    `export const a = 1;
export const b = 2;`,
  );

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
            '**/*.ts': ['* as helperLib'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * as helperLib from './helpers';");
});
