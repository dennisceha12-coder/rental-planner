export type FieldErrors = Record<string, string[] | undefined>;

export function firstFieldError(errors: FieldErrors | undefined, field: string): string | undefined {
  return errors?.[field]?.[0];
}

export function hasFieldErrors(errors: FieldErrors | undefined): boolean {
  if (!errors) return false;
  return Object.values(errors).some((msgs) => msgs && msgs.length > 0);
}

export function flattenFieldErrors(errors: FieldErrors | undefined): string[] {
  if (!errors) return [];
  return Object.values(errors).flatMap((msgs) => msgs ?? []);
}
