/**
 * Map ResolvedEvConfig to a utoopack configuration object.
 *
 * Utoopack uses a JSON-based config with `build()` / `dev()` programmatic API.
 * It handles "use server" directives natively via the
 * `server.functions.callServerModule` config field.
 */

import path from "node:path";
import {
  type EvBundlerCtx,
  type EvPluginHooks,
  isMpa,
  type ResolvedEvConfig,
} from "@evjs/ev";
import type { ConfigComplete } from "@utoo/pack";

/**
 * Create a utoopack configuration object from EvConfig.
 *
 * @param config - Resolved evjs config
 * @param cwd - Project root directory
 * @param hooks - Plugin lifecycle hooks
 * @returns A config object suitable for `@utoo/pack`'s `build()` / `dev()` API
 */
export async function createUtoopackConfig(
  config: ResolvedEvConfig<ConfigComplete>,
  cwd: string,
  hooks: EvPluginHooks<ConfigComplete>[],
): Promise<ConfigComplete> {
  const isProduction = process.env.NODE_ENV === "production";
  const serverEnabled = config.serverEnabled;

  let finalServerEntry: string | undefined;

  if (serverEnabled) {
    finalServerEntry = config.server.entry || "@evjs/server/app";
  }

  const utoopackConfig: ConfigComplete = {
    mode: isProduction ? "production" : "development",
    // MPA mode: one entry per page; SPA mode: single entry
    entry: isMpa(config)
      ? Object.entries(config.pages ?? {}).map(([name, page]) => ({
          import: page.entry,
          name,
        }))
      : [
          {
            import: config.entry,
          },
        ],
    output: {
      path: path.resolve(cwd, serverEnabled ? "dist/client" : "dist"),
      filename: isProduction ? "[name].[contenthash:8].js" : "[name].js",
      chunkFilename: isProduction ? "[name].[contenthash:8].js" : "[name].js",
      publicPath: isProduction ? config.assetPrefix : "/",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"],
    },
    sourceMaps: !isProduction,
    stats: true,
    react: {
      runtime: "automatic",
    },
    // Server functions config — utoopack handles "use server" natively
    ...(serverEnabled
      ? {
          server: {
            entry: finalServerEntry!,
            output: {
              path: path.resolve(cwd, "dist/server"),
              filename: isProduction
                ? "[name].[contenthash:8].js"
                : "[name].js",
              chunkFilename: isProduction
                ? "[name].[contenthash:8].js"
                : "[name].js",
            },
            function: {
              clientProxy: config.server.functions.clientProxy,
              serverRegister: config.server.functions.serverRegister,
            },
          },
        }
      : {}),

    // Dev server configuration
    devServer: {
      hot: true,
      proxy: config.dev.proxy,
    },
  };

  // Run plugin bundler hooks
  const ctx: EvBundlerCtx<ConfigComplete> = {
    mode: isProduction ? "production" : "development",
    cwd,
    config,
  };

  for (const h of hooks) {
    if (h.bundlerConfig) {
      h.bundlerConfig(utoopackConfig, ctx);
    }
  }

  return utoopackConfig;
}
