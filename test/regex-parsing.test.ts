import {expect, test} from 'vitest';
import {tryParseRegex} from '../src/regex/try-parse-regex';

test('should parse valid regex pattern', () => {
  const result = tryParseRegex('/test/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.source).toBe('test');
});

test('should parse regex with flags', () => {
  const result = tryParseRegex('/test/gi');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toBe('gi');
});

test('should parse complex regex pattern', () => {
  const result = tryParseRegex('/(.+)Config$/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.source).toBe('(.+)Config$');
});

test('should return null for non-regex string', () => {
  const result = tryParseRegex('test');
  expect(result).toBeNull();
});

test('should return null for string not starting with slash', () => {
  const result = tryParseRegex('test/gi');
  expect(result).toBeNull();
});

test('should return null for string with no ending slash', () => {
  const result = tryParseRegex('/test');
  expect(result).toBeNull();
});

test('should handle empty pattern', () => {
  const result = tryParseRegex('//');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.source).toBe('(?:)');
});

test('should handle common valid flags', () => {
  const result = tryParseRegex('/test/gim');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toBe('gim');
});

test('should return null for invalid flags', () => {
  const result = tryParseRegex('/test/x');
  expect(result).toBeNull();
});

test('should handle case-insensitive flag', () => {
  const result = tryParseRegex('/test/i');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('TEST')).toBe(true);
});

test('should handle global flag', () => {
  const result = tryParseRegex('/test/g');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toContain('g');
});

test('should handle multiline flag', () => {
  const result = tryParseRegex('/test/m');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toContain('m');
});

test('should handle special characters in pattern', () => {
  const result = tryParseRegex('/\\d+/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('123')).toBe(true);
});

test('should handle escape sequences', () => {
  const result = tryParseRegex('/\\./');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('.')).toBe(true);
  expect(result?.test('a')).toBe(false);
});

test('should handle character classes', () => {
  const result = tryParseRegex('/[abc]/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('a')).toBe(true);
  expect(result?.test('d')).toBe(false);
});

test('should handle quantifiers', () => {
  const result = tryParseRegex('/a+/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('aaa')).toBe(true);
});

test('should handle capture groups', () => {
  const result = tryParseRegex('/(.+)Config$/');
  expect(result).toBeInstanceOf(RegExp);
  const match = 'ButtonConfig'.match(result!);
  expect(match?.[1]).toBe('Button');
});

test('should handle non-capturing groups', () => {
  const result = tryParseRegex('/(?:test)/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('test')).toBe(true);
});

test('should handle lookaheads', () => {
  const result = tryParseRegex('/test(?=ing)/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('testing')).toBe(true);
  expect(result?.test('test')).toBe(false);
});

test('should handle lookbehinds', () => {
  const result = tryParseRegex('/(?<=pre)test/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('pretest')).toBe(true);
});

test('should handle alternation', () => {
  const result = tryParseRegex('/foo|bar/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('foo')).toBe(true);
  expect(result?.test('bar')).toBe(true);
});

test('should handle anchors', () => {
  const result = tryParseRegex('/^test$/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('test')).toBe(true);
  expect(result?.test('testing')).toBe(false);
});

test('should handle word boundaries', () => {
  const result = tryParseRegex('/\\btest\\b/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('test')).toBe(true);
  expect(result?.test('testing')).toBe(false);
});

test('should return null for invalid regex pattern', () => {
  const result = tryParseRegex('/(/');
  expect(result).toBeNull();
});

test('should handle slash in pattern', () => {
  const result = tryParseRegex('/\\/path\\/to\\/file/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('/path/to/file')).toBe(true);
});

test('should handle multiple slashes in pattern', () => {
  const result = tryParseRegex('/a\\/b\\/c/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.source).toBe('a\\/b\\/c');
});

test('should use last slash as delimiter', () => {
  const result = tryParseRegex('/test\\/pattern/i');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.source).toBe('test\\/pattern');
  expect(result?.flags).toBe('i');
});

test('should handle unicode flag', () => {
  const result = tryParseRegex('/test/u');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toContain('u');
});

test('should handle sticky flag', () => {
  const result = tryParseRegex('/test/y');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toContain('y');
});

test('should handle dotall flag', () => {
  const result = tryParseRegex('/test/s');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toContain('s');
});

test('should handle combined flags in any order', () => {
  const result = tryParseRegex('/test/igm');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.flags).toContain('i');
  expect(result?.flags).toContain('g');
  expect(result?.flags).toContain('m');
});

test('should handle regex for file extensions', () => {
  const result = tryParseRegex('/\\.tsx?$/');
  expect(result).toBeInstanceOf(RegExp);
  expect(result?.test('file.ts')).toBe(true);
  expect(result?.test('file.tsx')).toBe(true);
  expect(result?.test('file.js')).toBe(false);
});

test('should handle regex for path replacement', () => {
  const result = tryParseRegex('/(.+)\\.component\\.ts$/');
  expect(result).toBeInstanceOf(RegExp);
  const match = 'button.component.ts'.match(result!);
  expect(match?.[1]).toBe('button');
});
