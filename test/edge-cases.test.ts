import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'edge-cases');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

test('should handle files with syntax errors gracefully', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'valid.ts'), 'export const valid = 1;');
  writeFileSync(join(testDir, 'src', 'invalid.ts'), 'export const invalid = ;');

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
  expect(indexContent).toContain("export * from './valid';");
});

test('should handle special characters in filenames', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'file-with-dash.ts'), 'export const foo = 1;');
  writeFileSync(join(testDir, 'src', 'file_with_underscore.ts'), 'export const bar = 2;');
  writeFileSync(join(testDir, 'src', 'file.with.dots.ts'), 'export const baz = 3;');

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
  expect(indexContent).toContain("export * from './file-with-dash';");
  expect(indexContent).toContain("export * from './file_with_underscore';");
  expect(indexContent).toContain("export * from './file.with.dots';");
});

test('should handle unicode characters in filenames', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'файл.ts'), 'export const file = 1;');
  writeFileSync(join(testDir, 'src', '文件.ts'), 'export const file2 = 2;');

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
  expect(indexContent).toContain('файл');
  expect(indexContent).toContain('文件');
});

test('should handle empty files', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'empty.ts'), '');
  writeFileSync(join(testDir, 'src', 'non-empty.ts'), 'export const foo = 1;');

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
  expect(indexContent).toContain("export * from './empty';");
  expect(indexContent).toContain("export * from './non-empty';");
});

test('should handle files with only comments', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(
    join(testDir, 'src', 'comments.ts'),
    `// This is a comment
/* Block comment */`,
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
  expect(indexContent).toContain("export * from './comments';");
});

test('should handle mixed file extensions', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'typescript.ts'), 'export const ts = 1;');
  writeFileSync(join(testDir, 'src', 'tsx.tsx'), 'export const tsx = 2;');
  writeFileSync(join(testDir, 'src', 'javascript.js'), 'export const js = 3;');
  writeFileSync(join(testDir, 'src', 'jsx.jsx'), 'export const jsx = 4;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('typescript');
  expect(indexContent).toContain('tsx.tsx');
  expect(indexContent).toContain('javascript.js');
  expect(indexContent).toContain('jsx.jsx');
});

test('should handle very long file paths', async () => {
  const deepPath = join(testDir, 'src', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h');
  mkdirSync(deepPath, {recursive: true});

  writeFileSync(join(deepPath, 'deep.ts'), 'export const deep = 1;');

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
  expect(indexContent).toContain("export * from './a/b/c/d/e/f/g/h/deep';");
});

test('should handle files with no exports', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'no-exports.ts'), 'const internal = 1;');
  writeFileSync(join(testDir, 'src', 'with-exports.ts'), 'export const foo = 1;');

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
  expect(indexContent).toContain("export * from './no-exports';");
  expect(indexContent).toContain("export * from './with-exports';");
});

test('should handle overlapping glob patterns', async () => {
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
          include: ['**/*.ts', '**/*.tsx'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  const occurrences = (indexContent.match(/component\.tsx/g) || []).length;
  expect(occurrences).toBe(1);
});

test('should handle files that start with numbers', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', '01-first.ts'), 'export const first = 1;');
  writeFileSync(join(testDir, 'src', '02-second.ts'), 'export const second = 2;');

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
  expect(indexContent).toContain("export * from './01-first';");
  expect(indexContent).toContain("export * from './02-second';");
});

test('should handle files with uppercase extensions', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'file.TS'), 'export const foo = 1;');

  await generateBarrels(
    testDir,
    '.barrelize',
    {
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts', '**/*.TS'],
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain('file.TS');
});

test('should handle circular export prevention', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'a.ts'), "export * from './b';");
  writeFileSync(join(testDir, 'src', 'b.ts'), "export * from './a';");

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
  expect(indexContent).toContain("export * from './a';");
  expect(indexContent).toContain("export * from './b';");
});

test('should handle files with BOM', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'bom.ts'), '\uFEFFexport const foo = 1;');

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
  expect(indexContent).toContain("export * from './bom';");
});

test('should handle different line endings', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'crlf.ts'), 'export const a = 1;\r\nexport const b = 2;');
  writeFileSync(join(testDir, 'src', 'lf.ts'), 'export const c = 3;\nexport const d = 4;');

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
  expect(indexContent).toContain("export * from './crlf';");
  expect(indexContent).toContain("export * from './lf';");
});

test('should handle export with same name as file', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'Button.ts'), 'export const Button = () => {};');

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
            '**/*.ts': ['Button'],
          },
        },
      ],
    },
    true,
  );

  const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
  expect(indexContent).toContain("export { Button } from './Button';");
});

test('should handle default export with no name', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'component.ts'), 'export default () => {};');

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

test('should handle re-exports from other modules', async () => {
  mkdirSync(join(testDir, 'src'), {recursive: true});

  writeFileSync(join(testDir, 'src', 'reexport.ts'), "export { foo } from 'external';");

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
  expect(indexContent).toContain("export * from './reexport';");
});
