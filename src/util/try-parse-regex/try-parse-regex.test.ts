import {tryParseRegex} from '#lib';
import {expect, test} from 'vitest';

test('try parse regex ', async () => {
  expect(tryParseRegex('/abc/gm')).instanceOf(RegExp);
  expect(tryParseRegex('/abc/')).instanceOf(RegExp);
  expect(tryParseRegex('/^abc$/m')).instanceOf(RegExp);

  expect(tryParseRegex('/abcgm')).toBe(null);
  expect(tryParseRegex('abc/gm')).toBe(null);
  expect(tryParseRegex('/')).toBe(null);
  expect(tryParseRegex('')).toBe(null);
});
