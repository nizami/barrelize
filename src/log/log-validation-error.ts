import {logError} from '#lib';
import {IValidation} from 'typia';

export function logValidationError(message: string, validation: IValidation.IFailure): void {
  const formatError = (e: IValidation.IError) => {
    const property = e.path.replace('$input.', '');

    if (e.expected === 'undefined') {
      return `Property '${property}' is not allowed in configuration`;
    }

    if (e.value === undefined) {
      return `Missing required property '${property}' in configuration`;
    }

    return `Invalid type for property '${property}'`;
  };

  const errors = validation.errors.map((x) => `  ` + formatError(x)).join('\n');
  const text = `${message}:\n${errors}`;

  logError(text);
}
