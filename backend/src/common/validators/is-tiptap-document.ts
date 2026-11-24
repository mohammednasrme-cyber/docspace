import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const MAX_CONTENT_BYTES = 1_000_000;

export function isTiptapDocument(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as { type?: unknown; content?: unknown };
  return candidate.type === 'doc' && Array.isArray(candidate.content);
}

export function IsTiptapDocument(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTiptapDocument',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!isTiptapDocument(value)) {
            return false;
          }

          try {
            return Buffer.byteLength(JSON.stringify(value), 'utf8') <= MAX_CONTENT_BYTES;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Tiptap document no larger than 1 MB`;
        },
      },
    });
  };
}
