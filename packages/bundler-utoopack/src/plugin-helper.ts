import { type EvBundlerCtx, merge } from "@evjs/ev";
import type { ConfigComplete } from "@utoo/pack";

export type { ConfigPatch } from "@evjs/ev";

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
  fn: (
    config: ConfigComplete,
    ctx: EvBundlerCtx<ConfigComplete>,
  ) => void | Promise<void>,
): (config: T, ctx: EvBundlerCtx<T>) => void | Promise<void> {
  return async (config, ctx) => {
    if (ctx.config.bundler?.name === "utoopack") {
      await fn(
        config as unknown as ConfigComplete,
        ctx as unknown as EvBundlerCtx<ConfigComplete>,
      );
    }
  };
}
export { merge };
