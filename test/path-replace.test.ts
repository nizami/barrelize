import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'path-replace');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

test('should replace file extension with regex', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.jsx'), 'export const util = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.jsx'],
          replace: {
            '/\\.jsx$/': '',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './utils';");
  expect(indexContent).not.toContain('.jsx');
});

test('should replace with regex pattern', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.tsx'],
          replace: {
            '/\\.tsx$/': '',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './component';");
  expect(indexContent).not.toContain('.tsx');
});

test('should apply only first matching replacement rule', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'MyComponent.tsx'), 'export const MyComponent = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.tsx'],
          replace: {
            '/^My(.+)\\.tsx$/': '$1',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './Component';");
});

test('should use regex capture groups', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'button.component.ts'), 'export const ButtonComponent = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/(.+)\\.component\\.ts$/': '$1',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './button';");
  expect(indexContent).not.toContain('component');
});

test('should apply default replace when no custom replace specified', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const util = 1;');

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
  expect(indexContent).toContain("export * from './utils';");
});

test('should handle empty replacement', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'prefix-utils.ts'), 'export const util = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/^prefix-(.+)\\.ts$/': '$1',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './utils';");
  expect(indexContent).not.toContain('prefix');
});

test('should replace in nested paths', async () => {
  mkdirSync(join(testDir, 'src', 'components'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'components', 'button.component.ts'), 'export const Button = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/\\.component\\.ts$/': '',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './components/button';");
});

test('should handle complex regex patterns', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'use-auth-hook.ts'), 'export const useAuth = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/^use-(.+)-hook\\.ts$/': '$1',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './auth';");
});

test('should handle multiple files with same replacement', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.spec.ts'), 'export const a = 1;');
  writeFileSync(join(testDir, 'src', 'b.spec.ts'), 'export const b = 2;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/\\.spec\\.ts$/': '',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './a';");
  expect(indexContent).toContain("export * from './b';");
  expect(indexContent).not.toContain('spec');
});

test('should replace directory names in path', async () => {
  mkdirSync(join(testDir, 'src', '__tests__'), {recursive: true});

  writeFileSync(join(testDir, 'src', '__tests__', 'utils.ts'), 'export const util = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/__tests__\\/(.+)\\.ts$/': 'tests/$1',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './tests/utils';");
  expect(indexContent).not.toContain('__tests__');
});

test('should handle case-sensitive replacement', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'Component.ts'), 'export const Component = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/Component\\.ts$/': 'component',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './component';");
});

test('should handle case-insensitive replacement with flag', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'MyComponent.ts'), 'export const MyComponent = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/component\\.ts$/i': 'comp',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './Mycomp';");
});

test('should handle regex path replacement with substitution', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'special.ts'), 'export const special = 1;');
  writeFileSync(join(testDir, 'src', 'regular.ts'), 'export const regular = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          replace: {
            '/^(special)\\.ts$/': 'custom-name',
            '/^(regular)\\.ts$/': '$1',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './custom-name';");
  expect(indexContent).toContain("export * from './regular';");
});
