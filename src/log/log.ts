import {colorize, TerminalColor} from '#lib';

export function logError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(colorize(`✖ ${message}`, TerminalColor.RED));
  process.exitCode = 1;
}

export function logWarning(message: string): void {
  console.log(colorize(message, TerminalColor.YELLOW));
}

export function logInfo(message: string): void {
  console.log(colorize(message, TerminalColor.BLUE));
}

export function logDebug(message: string): void {
  if (process.argv.includes('--verbose')) {
    console.log(colorize(message, TerminalColor.MAGENTA));
  }
}
