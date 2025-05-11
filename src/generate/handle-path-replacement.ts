import {DEFAULT_CONFIG, DirectoryConfig, logError, logWarning} from '#lib';

export function handlePathReplacement(config: DirectoryConfig, files: string[]): string[] {
  const replaces = config.replace ?? DEFAULT_CONFIG.replace;

  for (let i = 0; i < replaces.length; i++) {
    const {find, replacement} = replaces[i];

    try {
      const regexp = new RegExp(find);
      files = files.map((file) => file.replace(regexp, replacement));
    } catch (error) {
      if (error instanceof SyntaxError) {
        logError(
          error.message.replace(
            'Invalid regular expression:',
            `Invalid regular expression number ${i + 1} in config.`,
          ),
        );
      } else {
        logWarning(`Invalid regular expression number ${i + 1}`);
      }
    }
  }

  return files;
}
