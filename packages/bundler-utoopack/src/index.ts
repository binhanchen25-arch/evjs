/**
 * Utoopack bundler adapter for the evjs framework.
 *
 * Leverages @utoo/pack's native "use server" directive support
 * for zero-config server function handling.
 */

export { utoopackAdapter } from "./adapter/index.js";
export type { UtoopackConfigPatch } from "./plugin-helper.js";
export { mergeUtoopackConfig, utoopack } from "./plugin-helper.js";
