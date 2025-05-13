import {ExtractExportsOptions, logDebug} from '#lib';
import {parse, ParseResult} from '@babel/parser';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';

export type ExportInfo = {
  name: string;
  exportKind?: 'type' | 'value' | null | undefined;
};

export async function extractExports(sourcePath: string): Promise<ExportInfo[]> {
  if (!existsSync(sourcePath)) {
    logDebug(`Source path '${sourcePath}' does not exist`);

    return [];
  }

  const options: ExtractExportsOptions = {
    isTypeScriptSource: extname(sourcePath).toLowerCase() === 'ts',
    recursive: true,
  };
  return extractExportsFromFile(sourcePath, options);
}

export async function extractExportsFromFile(
  sourcePath: string,
  options: ExtractExportsOptions,
): Promise<ExportInfo[]> {
  try {
    const content = await readFile(sourcePath, 'utf-8');
    const ast = parseFileContent(content);

    return extractExportsFromAst(ast, options);
  } catch (error) {
    if (error instanceof Error) {
      logDebug(`Failed to process file '${sourcePath}': ${error.message}`);
    }
    return [];
  }
}

async function extractExportsFromAst(ast: ParseResult, options: ExtractExportsOptions) {
  const exports: ExportInfo[] = [];

  for (const node of ast.program.body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        const declaration: any = node.declaration;

        if (declaration.declarations) {
          declaration.declarations.forEach((x: any) => {
            if (x.id.name) {
              exports.push({name: x.id.name, exportKind: node.exportKind});
            }
          });
        } else if (declaration.id) {
          exports.push({name: declaration.id.name, exportKind: node.exportKind});
        }
      } else if (node.specifiers) {
        node.specifiers.forEach((spec) => {
          if (spec.exported.type === 'Identifier') {
            exports.push({name: spec.exported.name, exportKind: node.exportKind});
          }
        });
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      exports.push({name: 'default', exportKind: node.exportKind});
    } else if (node.type === 'ExportAllDeclaration') {
      if (options.recursive) {
        const normalizedPath = normalizeSourcePath(node.source.value, options);

        if (!normalizedPath) {
          logDebug(`Exported module path '${normalizedPath}' does not exist`);
        } else {
          const innerExports = await extractExportsFromFile(normalizedPath, options);
          exports.push(...innerExports);
        }
      }
    }
  }

  return exports;
}

function parseFileContent(fileContent: string): ParseResult {
  return parse(fileContent, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

function normalizeSourcePath(path: string, options: ExtractExportsOptions): string | null {
  if (existsSync(path)) {
    return path;
  }

  if (options.isTypeScriptSource) {
    const tsPath = `${path}.ts`;

    if (existsSync(tsPath)) {
      return tsPath;
    }
  }

  const jsPath = `${path}.js`;

  if (existsSync(jsPath)) {
    return jsPath;
  }

  return null;
}
