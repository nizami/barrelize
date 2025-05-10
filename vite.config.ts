import typia from '@ryoppippi/unplugin-typia/vite';
import {resolve} from 'node:path';
import dts from 'vite-plugin-dts';
import {defineConfig} from 'vitest/config';

const WORKSPACE_ROOT = resolve(import.meta.dirname);

export default defineConfig({
  root: WORKSPACE_ROOT,
  envDir: WORKSPACE_ROOT,
  resolve: {
    alias: {
      '#lib': resolve(WORKSPACE_ROOT, 'src/index.ts'),
    },
  },
  build: {
    target: 'node18',
    outDir: resolve(WORKSPACE_ROOT, 'lib'),
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    lib: {
      name: 'barrelize',
      formats: ['es'],
      entry: resolve(WORKSPACE_ROOT, 'src/index.ts'),
      fileName: () => `index.js`,
    },
    rollupOptions: {
      cache: false,
      external: [
        'vite',
        'vitest',
        'typia',
        'fs',
        'events',
        'node:util',
        'node:fs',
        'node:path',
        'node:url',
        'node:events',
        'node:stream',
        'node:string_decoder',
        'node:fs/promises',
      ],
    },
  },
  test: {
    cache: false,
  },
  plugins: [typia({log: false}), dts()],
});
