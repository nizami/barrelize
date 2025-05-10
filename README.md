# Barrelize

🚀 A modern, lightweight and efficient tool for automatically generating index (barrel) files in your JavaScript and TypeScript projects.

Barrelize simplifies module exports by creating clean, centralized `index.js` or `index.ts` files, reducing boilerplate and improving project organization.

[![NPM Version](https://img.shields.io/npm/v/barrelize)](https://www.npmjs.com/package/barrelize)
[![GitHub License](https://img.shields.io/github/license/nizami/barrelize)](https://opensource.org/licenses/MIT)

## Features

- **Automatic Barrel Generation**: Scans directories and creates index files with exports for all modules.
- **TypeScript Support**: Seamlessly works with TypeScript projects, preserving type safety.
- **Customizable**: Configure file patterns, ignore specific files, or customize export styles (named, default, or both).
- **Recursive**: Optionally generate barrels for nested directories.
- **CLI & API**: Use via command line for quick setups or integrate programmatically in your build scripts.

### Why Use Barrelize?

- **Save Time**: Eliminate manual creation and maintenance of barrel files.
- **Cleaner Imports**: Simplify import statements with a single entry point for each directory.
- **Scalable**: Ideal for large projects with complex folder structures.

## Installation

```bash
npm install --save-dev barrelize
```

## Quick Start

1. Initialize configuration (optional):

```bash
npx barrelize init
```

2. Generate barrel files:

```bash
npx barrelize
```

## CLI Commands

### `barrelize init [config path]`

Creates a `.barrelize` configuration file in your project.

```bash
npx barrelize init                # Creates .barrelize in current directory
npx barrelize init barrelize.json # Creates config at specified path
```

### `barrelize [config path]`

Generates barrel (index) files based on your configuration.

```bash
npx barrelize                   # Uses default .barrelize config
npx barrelize -c barrelize.json # Uses custom config file
```

## Configuration

Create a `.barrelize` file in your project root. The configuration file uses JSON5 format, which supports comments and is more flexible than standard JSON:

```jsonc
{
  // Configure multiple directories to generate barrels for
  "directories": [
    {
      // Root directory to start from
      "path": "src",
      // Files to include in the barrel
      "include": ["**/*.ts", "**/*.tsx"],
      // Files to exclude from the barrel
      "exclude": ["**/*.test.ts", "**/*.spec.ts"],
      // Optional ordering of exports
      "order": ["types", "constants", "utils"],
      // Whether to keep file extensions in exports
      "keepFileExtension": true,
      // Optional string replacements in export paths
      "replace": [
        {
          "find": ".ts$",
          "replacement": ""
        }
      ]
    }
  ]
}
```

## Example

Before:

```
src/
  ├── types.ts
  ├── constants.ts
  ├── utils.ts
  └── components/
      ├── Button.tsx
      └── Input.tsx
```

After running `barrelize`:

```
src/
  ├── types.ts
  ├── constants.ts
  ├── utils.ts
  ├── index.ts           # New!
  └── components/
      ├── Button.tsx
      └── Input.tsx
```

Generated `src/index.ts`:

```typescript
export * from './types';
export * from './constants';
export * from './utils';
export * from './components/Button.tsx';
export * from './components/Input.tsx';
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Nizami
