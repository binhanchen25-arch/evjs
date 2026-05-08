import type { EvBundlerCtx } from "@evjs/ev";
import type { ConfigComplete } from "@utoo/pack";

type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type Builtin = Primitive | RegExp | ((...args: never[]) => unknown);

export type ConfigPatch<T> = T extends Builtin
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: ConfigPatch<T[K]> }
      : T;

/**
 * Typed wrapper for utoopack configuration in plugin bundler hooks.
 *
 * Use this in your plugin's `bundlerConfig` hook to get full `ConfigComplete`
 * type safety instead of `unknown`.
 *
 * @example
 * ```ts
 * import { utoopack } from "@evjs/bundler-utoopack";
 *
 * const myPlugin: EvPlugin = {
 *   name: "my-plugin",
 *   setup(ctx) {
 *     return {
 *       bundlerConfig: utoopack((config) => {
 *         // config is typed as ConfigComplete from @utoo/pack
 *       }),
 *     };
 *   },
 * };
 * ```
 */
export function utoopack<T = unknown>(
  fn: (config: ConfigComplete, ctx: EvBundlerCtx<ConfigComplete>) => void,
): (config: T, ctx: EvBundlerCtx<T>) => void {
  return (config, ctx) => {
    if (ctx.config.bundler?.name === "utoopack") {
      fn(
        config as unknown as ConfigComplete,
        ctx as unknown as EvBundlerCtx<ConfigComplete>,
      );
    }
  };
}

export function merge(
  config: ConfigComplete,
  patch: ConfigPatch<ConfigComplete>,
): void {
  mergeObject(
    config as unknown as Record<string, unknown>,
    patch as Record<string, unknown>,
  );
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
