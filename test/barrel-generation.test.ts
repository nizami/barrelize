import {$Config} from '#lib';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'barrel-generation');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

describe('barrel generation', () => {
  test('should create a basic barrel file', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
    writeFileSync(join(testDir, 'src', 'b.ts'), 'export const b = 2;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexPath = join(testDir, 'src', 'index.ts');
    expect(existsSync(indexPath)).toBe(true);

    const indexContent = readFileSync(indexPath, 'utf-8');
    expect(indexContent).toContain("export * from './a';");
    expect(indexContent).toContain("export * from './b';");
  });

  test('should update existing barrel file', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
    writeFileSync(join(testDir, 'src', 'index.ts'), "export * from './old';");

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/index.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './a';");
    expect(indexContent).not.toContain("export * from './old';");
  });

  test('should handle include patterns', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => {};');
    writeFileSync(join(testDir, 'src', 'util.ts'), 'export const util = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.tsx'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './component.tsx';");
    expect(indexContent).not.toContain('util');
  });

  test('should handle exclude patterns', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'component.ts'), 'export const component = 1;');
    writeFileSync(join(testDir, 'src', 'component.test.ts'), 'test("something", () => {});');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
          exclude: ['**/*.test.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './component';");
    expect(indexContent).not.toContain('test');
  });

  test('should handle multiple barrels', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});
    mkdirSync(join(testDir, 'lib'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
    writeFileSync(join(testDir, 'lib', 'b.ts'), 'export const b = 2;');

    const config = $Config.decode({
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
        },
      ],
    });

    await generateBarrels(testDir, config);

    const srcIndex = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(srcIndex).toContain("export * from './a';");

    const libIndex = readFileSync(join(testDir, 'lib', 'index.ts'), 'utf-8');
    expect(libIndex).toContain("export * from './b';");
  });

  test('should handle custom index file name', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'exports.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexPath = join(testDir, 'src', 'exports.ts');
    expect(existsSync(indexPath)).toBe(true);

    const indexContent = readFileSync(indexPath, 'utf-8');
    expect(indexContent).toContain("export * from './a';");
  });

  test('should handle nested directory structure', async () => {
    mkdirSync(join(testDir, 'src', 'components', 'forms'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'components', 'forms', 'input.ts'), 'export const Input = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './components/forms/input';");
  });

  test('should handle empty directory', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexPath = join(testDir, 'src', 'index.ts');
    expect(existsSync(indexPath)).toBe(true);

    const indexContent = readFileSync(indexPath, 'utf-8');
    expect(indexContent.trim()).toBe('');
  });

  test('should handle no matching files', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'a.js'), 'export const a = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent.trim()).toBe('');
  });

  test('should exclude index file from exports', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'a.ts'), 'export const a = 1;');
    writeFileSync(join(testDir, 'src', 'index.ts'), '');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './a';");
    expect(indexContent).not.toContain("export * from './index';");
  });

  test('should handle multiple include patterns', async () => {
    mkdirSync(join(testDir, 'src'), {recursive: true});

    writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => {};');
    writeFileSync(join(testDir, 'src', 'util.ts'), 'export const util = 1;');
    writeFileSync(join(testDir, 'src', 'styles.css'), '.class {}');

    const config = $Config.decode({
      barrels: [
        {
          root: 'src',
          name: 'index.ts',
          include: ['**/*.ts', '**/*.tsx'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './component.tsx';");
    expect(indexContent).toContain("export * from './util';");
    expect(indexContent).not.toContain('styles');
  });

  test('should handle root at project level', async () => {
    writeFileSync(join(testDir, 'a.ts'), 'export const a = 1;');

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['*.ts'],
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("export * from './a';");
  });
});
