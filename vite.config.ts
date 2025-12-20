import {resolve} from 'node:path';
import {defineConfig} from 'vite';

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
        'fs',
        'fs/promises',
        'events',
        'node:util',
        'node:fs',
        'node:os',
        'path',
        'node:path',
        'node:url',
        'node:events',
        'node:stream',
        'node:string_decoder',
        'node:fs/promises',
        'os',
      ],
    },
  },
});
