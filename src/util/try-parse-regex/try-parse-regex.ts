import {logWarning} from '#lib';

export function tryParseRegex(s: string): RegExp | null {
  if (!s.startsWith('/')) {
    return null;
  }

  const lastSlashIndex = s.lastIndexOf('/');

  if (lastSlashIndex <= 0) {
    return null;
  }

  const flags = s.slice(lastSlashIndex + 1);

  if (flags && !/^[dgimsuvy]*$/.test(flags)) {
    return null;
  }

  const pattern = s.slice(1, lastSlashIndex);

  try {
    return new RegExp(pattern, flags);
  } catch (error) {
    if (error instanceof Error) {
      logWarning(error.message);
    } else {
      console.error(error);
    }

    return null;
  }
}
