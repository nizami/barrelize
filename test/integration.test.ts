import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'integration');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

test('should handle complete workflow with real-world structure', async () => {
  mkdirSync(join(testDir, 'src', 'components'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'utils'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'types'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'components', 'Button.tsx'),
    'export default function Button() { return null; }',
  );
  writeFileSync(
    join(testDir, 'src', 'components', 'Input.tsx'),
    'export default function Input() { return null; }',
  );
  writeFileSync(join(testDir, 'src', 'utils', 'format.ts'), 'export const format = () => {};');
  writeFileSync(join(testDir, 'src', 'types', 'user.ts'), 'export type User = { name: string };');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts', '**/*.tsx'],
          exclude: ['**/*.test.ts'],
          order: ['types', 'utils', 'components'],
          replace: {
            '/\\.tsx?$/': '',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  const lines = indexContent.split('\n').filter((l) => l.trim());

  expect(lines[0]).toContain('types/user');
  expect(lines[1]).toContain('utils/format');
  expect(lines[2]).toContain('components/Button');
  expect(lines[3]).toContain('components/Input');
});

test('should update existing barrel file without markers', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
  writeFileSync(join(testDir, 'src', 'index.ts'), "export * from './old';\n");

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export * from './a';");
  expect(indexContent).not.toContain('old');
});

test('should handle barrelize-start and barrelize-end markers', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
  writeFileSync(
    join(testDir, 'src', 'index.ts'),
    `// Custom code before
// barrelize-start
export * from './old';
// barrelize-end
// Custom code after`,
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
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('// Custom code before');
  expect(indexContent).toContain('// Custom code after');
  expect(indexContent).toContain("export * from './a';");
  expect(indexContent).not.toContain('old');
});

test('should be idempotent on multiple runs', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const firstRun = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const secondRun = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');

  expect(firstRun).toBe(secondRun);
});

test('should handle complex multi-barrel configuration', async () => {
  mkdirSync(join(testDir, 'src', 'api'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'components'), {recursive: true});
  mkdirSync(join(testDir, 'lib'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'api', 'client.ts'), 'export const client = {};');
  writeFileSync(join(testDir, 'src', 'components', 'Button.tsx'), 'export default function Button() {}');
  writeFileSync(join(testDir, 'lib', 'utils.ts'), 'export const utils = () => {};');

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
          include: ['**/*.ts', '**/*.tsx'],
          replace: {
            '/\\.tsx?$/': '',
          },
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

  const srcIndex = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(srcIndex).toContain("from './api/client';");

  const libIndex = readFileSync(join(testDir, 'lib', 'index.ts'), 'utf-8');
  expect(libIndex).toContain('from "./utils"');
  expect(libIndex).not.toContain(';');
});

test('should handle real-world exports configuration', async () => {
  mkdirSync(join(testDir, 'src', 'services'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'hooks'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'services', 'auth.ts'),
    `export const AuthConfig = {};
export const authService = {};`,
  );

  writeFileSync(
    join(testDir, 'src', 'hooks', 'useAuth.ts'),
    'export default function useAuth() { return null; }',
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
          replace: {
            '/\\.ts$/': '',
          },
          exports: {
            'services/**/*.ts': ['/(.+)Config$/ as $1Settings'],
            'hooks/**/*.ts': ['default as $filename'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('AuthConfig as AuthSettings');
  expect(indexContent).toContain('default as useAuth');
});

test('should handle incremental updates', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
  writeFileSync(join(testDir, 'src', 'b.ts'), 'export const b = 2;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const firstContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(firstContent).toContain("export * from './a';");
  expect(firstContent).toContain("export * from './b';");

  writeFileSync(join(testDir, 'src', 'c.ts'), 'export const c = 3;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const secondContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(secondContent).toContain("export * from './a';");
  expect(secondContent).toContain("export * from './b';");
  expect(secondContent).toContain("export * from './c';");
});

test('should handle file removal updates', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
  writeFileSync(join(testDir, 'src', 'b.ts'), 'export const b = 2;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  rmSync(join(testDir, 'src', 'b.ts'));

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    },
    true,
  );

  const content = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(content).toContain("export * from './a';");
  expect(content).not.toContain("export * from './b';");
});

test('should handle complex project structure', async () => {
  mkdirSync(join(testDir, 'src', 'features', 'auth', 'components'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'features', 'auth', 'services'), {recursive: true});
  mkdirSync(join(testDir, 'src', 'shared', 'utils'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'features', 'auth', 'components', 'LoginForm.tsx'),
    'export default function LoginForm() {}',
  );
  writeFileSync(
    join(testDir, 'src', 'features', 'auth', 'services', 'authService.ts'),
    'export const authService = {};',
  );
  writeFileSync(join(testDir, 'src', 'shared', 'utils', 'format.ts'), 'export const format = () => {};');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts', '**/*.tsx'],
          order: ['shared', 'features'],
          replace: {
            '/\\.tsx?$/': '',
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  const lines = indexContent.split('\n').filter((l) => l.trim());

  expect(lines[0]).toContain('shared/utils/format');
  expect(indexContent).toContain('features/auth/components/LoginForm');
  expect(indexContent).toContain('features/auth/services/authService');
});

test('should handle mixed exports in single barrel', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'mixed.ts'),
    `export const namedExport = 1;
export default function defaultExport() {}
export type TypeExport = string;`,
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
          exclude: ['**/index.ts'],
          exports: {
            '**/*.ts': ['namedExport', 'default', 'TypeExport'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('namedExport');
  expect(indexContent).toContain('default');
  expect(indexContent).toContain('type TypeExport');
});

test('should handle namespace and named exports together', async () => {
  mkdirSync(join(testDir, 'src', 'utils'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'utils', 'helpers.ts'),
    `export const helper1 = 1;
export const helper2 = 2;`,
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
            'utils/**/*.ts': ['* as helpers', 'helper1'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('export * as helpers from');
  expect(indexContent).toContain('export { helper1 } from');
});
