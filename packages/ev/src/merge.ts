type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type Builtin = Primitive | RegExp | ((...args: never[]) => unknown);

export type ConfigPatch<T> = T extends Builtin
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: ConfigPatch<T[K]> }
      : T;

export function merge<T extends object>(target: T, patch: ConfigPatch<T>): T {
  mergeObject(
    target as unknown as Record<string, unknown>,
    patch as Record<string, unknown>,
  );
  return target;
}

function mergeObject(
  target: Record<string, unknown>,
  patch: Record<string, unknown>,
): void {
  for (const [key, value] of Object.entries(patch)) {
    const current = target[key];

    if (isPlainObject(current) && isPlainObject(value)) {
      mergeObject(current, value);
      continue;
    }

    target[key] = value;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
