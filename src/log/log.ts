import {colorize, TerminalColor} from '#lib';

export function logError(message: string): void {
  console.log(colorize(message, TerminalColor.RED));
}

export function logWarning(message: string): void {
  console.log(colorize(message, TerminalColor.YELLOW));
}

export function logInfo(message: string): void {
  console.log(colorize(message, TerminalColor.BLUE));
}
