import { utoopackAdapter } from "@evjs/bundler-utoopack";
import {
  type BuildOptions,
  type BundlerAdapter,
  type Config,
  type DevOptions,
  build as frameworkBuild,
  dev as frameworkDev,
} from "@evjs/ev";

export {
  type BuildOptions,
  type BuildResult,
  type BundlerAdapter,
  type BundlerCtx,
  type ClientManifest,
  CONFIG_DEFAULTS,
  type Config,
  type DevOptions,
  defineConfig,
  type EvBuildResult,
  type EvBundlerCtx,
  type EvConfig,
  type EvDocument,
  type EvPlugin,
  type EvPluginConfigContext,
  type EvPluginContext,
  type EvPluginHooks,
  type Plugin,
  type PluginContext,
  type PluginHooks,
  type ResolvedConfig,
  type ResolvedEvConfig,
  resolveConfig,
  type ServerManifest,
} from "@evjs/ev";
export { loadConfig } from "./load-config.js";

export type DefaultBundlerConfig =
  typeof utoopackAdapter extends BundlerAdapter<infer TBundlerCfg>
    ? TBundlerCfg
    : never;

const defaultBundler: BundlerAdapter<DefaultBundlerConfig> = utoopackAdapter;

export async function dev<TBundlerCfg = DefaultBundlerConfig>(
  userConfig?: Config<TBundlerCfg>,
  options?: DevOptions<TBundlerCfg>,
): Promise<void> {
  const { loadConfig } = await import("./load-config.js");
  const defaultLoadConfig = loadConfig<TBundlerCfg>;
  const bundler =
    options?.bundler ??
    userConfig?.bundler ??
    (defaultBundler as unknown as BundlerAdapter<TBundlerCfg>);
  await frameworkDev<TBundlerCfg>(userConfig, {
    ...options,
    bundler,
    loadConfig: options?.loadConfig ?? defaultLoadConfig,
  });
}

export async function build<TBundlerCfg = DefaultBundlerConfig>(
  userConfig?: Config<TBundlerCfg>,
  options?: BuildOptions<TBundlerCfg>,
): Promise<void> {
  const bundler =
    options?.bundler ??
    userConfig?.bundler ??
    (defaultBundler as unknown as BundlerAdapter<TBundlerCfg>);
  await frameworkBuild<TBundlerCfg>(userConfig, {
    ...options,
    bundler,
  });
}
