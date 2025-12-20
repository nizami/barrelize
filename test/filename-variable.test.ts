import {$Config} from '#lib';
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {generateBarrels} from '../src/generate/generate-barrels';

const testDir = join(__dirname, 'test-fixtures', 'filename-var');

beforeEach(() => {
  mkdirSync(testDir, {recursive: true});
});

afterEach(() => {
  rmSync(testDir, {recursive: true, force: true});
});

describe('ordering', () => {
  test('should substitute @fileName in export aliases for default exports', async () => {
    mkdirSync(join(testDir, 'services'), {recursive: true});

    writeFileSync(
      join(testDir, 'services', 'auth.ts'),
      'export default function authenticate() { return true; }',
    );

    writeFileSync(
      join(testDir, 'services', 'database.ts'),
      'export default function connect() { return true; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['services/**/*.ts'],
          exports: {
            'services/**/*.ts': ['default as @fileName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as auth } from './services/auth';");
    expect(indexContent).toContain("export { default as database } from './services/database';");
  });

  test('should work with nested directory structures', async () => {
    mkdirSync(join(testDir, 'utils', 'parsers'), {recursive: true});

    writeFileSync(
      join(testDir, 'utils', 'parsers', 'json.ts'),
      'export default function parseJson() { return {}; }',
    );

    writeFileSync(
      join(testDir, 'utils', 'parsers', 'xml.ts'),
      'export default function parseXml() { return {}; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['utils/**/*.ts'],
          exports: {
            'utils/**/*.ts': ['default as @fileName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as json } from './utils/parsers/json';");
    expect(indexContent).toContain("export { default as xml } from './utils/parsers/xml';");
  });

  test('should handle files with dots in filename', async () => {
    mkdirSync(join(testDir, 'helpers'), {recursive: true});

    writeFileSync(
      join(testDir, 'helpers', 'my.helper.ts'),
      'export default function myHelper() { return true; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['helpers/**/*.ts'],
          exports: {
            'helpers/**/*.ts': ['default as @fileName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as my.helper } from './helpers/my.helper';");
  });

  test('should support multiple @fileName substitutions in one alias', async () => {
    mkdirSync(join(testDir, 'validators'), {recursive: true});

    writeFileSync(
      join(testDir, 'validators', 'email.ts'),
      'export default function validateEmail() { return true; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['validators/**/*.ts'],
          exports: {
            'validators/**/*.ts': ['default as @fileName@fileName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as emailemail } from './validators/email';");
  });

  test('should work alongside other export patterns', async () => {
    mkdirSync(join(testDir, 'utils'), {recursive: true});

    writeFileSync(
      join(testDir, 'utils', 'format.ts'),
      `export default function formatDefault() { return 'default'; }
export const formatDate = () => 'date';
export const formatTime = () => 'time';`,
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['utils/**/*.ts'],
          exports: {
            'utils/**/*.ts': ['default as @fileName', 'formatDate'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as format, formatDate } from './utils/format';");
  });

  test('should preserve filename casing', async () => {
    mkdirSync(join(testDir, 'services'), {recursive: true});

    writeFileSync(
      join(testDir, 'services', 'CacheManager.ts'),
      'export default function cacheManager() { return {}; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['services/**/*.ts'],
          exports: {
            'services/**/*.ts': ['default as @fileName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as CacheManager } from './services/CacheManager';");
  });

  test('should work with replace config option', async () => {
    mkdirSync(join(testDir, 'handlers'), {recursive: true});

    writeFileSync(
      join(testDir, 'handlers', 'request.handler.ts'),
      'export default function handleRequest() { return true; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['handlers/**/*.ts'],
          replace: {
            '/\\.handler\\.ts$/': '',
          },
          exports: {
            'handlers/**/*.ts': ['default as @fileName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as request.handler } from './handlers/request';");
  });

  test('should substitute @exportName with actual export name', async () => {
    mkdirSync(join(testDir, 'services'), {recursive: true});

    writeFileSync(
      join(testDir, 'services', 'login.ts'),
      'export default function LoginService() { return true; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['services/**/*.ts'],
          exports: {
            'services/**/*.ts': ['default as @exportName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as LoginService } from './services/login';");
  });

  test('should handle @exportName when export name differs from filename', async () => {
    mkdirSync(join(testDir, 'parsers'), {recursive: true});

    writeFileSync(join(testDir, 'parsers', 'data.ts'), 'export default function JsonParser() { return {}; }');

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['parsers/**/*.ts'],
          exports: {
            'parsers/**/*.ts': ['default as @exportName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as JsonParser } from './parsers/data';");
  });

  test('should fallback to member name for anonymous default exports with @exportName', async () => {
    mkdirSync(join(testDir, 'utils'), {recursive: true});

    writeFileSync(join(testDir, 'utils', 'helper.ts'), 'export default () => { return null; }');

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['utils/**/*.ts'],
          exports: {
            'utils/**/*.ts': ['default as @exportName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default } from './utils/helper';");
  });

  test('should support both @fileName and @exportName in same config', async () => {
    mkdirSync(join(testDir, 'services'), {recursive: true});

    writeFileSync(
      join(testDir, 'services', 'storage.ts'),
      'export default function StorageService() { return true; }',
    );

    writeFileSync(
      join(testDir, 'services', 'state.ts'),
      'export default function StateManager() { return {}; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['services/**/*.ts'],
          exports: {
            'services/**/*.ts': ['default as @exportName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as StorageService } from './services/storage';");
    expect(indexContent).toContain("export { default as StateManager } from './services/state';");
  });

  test('should use both variables in same alias pattern', async () => {
    mkdirSync(join(testDir, 'handlers'), {recursive: true});

    writeFileSync(
      join(testDir, 'handlers', 'request.ts'),
      'export default function RequestHandler() { return true; }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['handlers/**/*.ts'],
          exports: {
            'handlers/**/*.ts': ['default as @fileName@exportName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as requestRequestHandler } from './handlers/request';");
  });

  test('should work with class default exports using @exportName', async () => {
    mkdirSync(join(testDir, 'services'), {recursive: true});

    writeFileSync(
      join(testDir, 'services', 'api.ts'),
      'export default class ApiService { constructor() {} }',
    );

    const config = $Config.decode({
      barrels: [
        {
          root: '.',
          name: 'index.ts',
          include: ['services/**/*.ts'],
          exports: {
            'services/**/*.ts': ['default as @exportName'],
          },
        },
      ],
    });

    await generateBarrels(testDir, config);

    const indexContent = readFileSync(join(testDir, 'index.ts'), 'utf-8');

    expect(indexContent).toContain("export { default as ApiService } from './services/api';");
  });
});
