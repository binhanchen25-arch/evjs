/**
 * Map ResolvedEvConfig to a utoopack configuration object.
 *
 * Utoopack uses a JSON-based config with `build()` / `dev()` programmatic API.
 * It handles "use server" directives natively via the
 * `server.functions.callServerModule` config field.
 */

import fs from "node:fs";
import path from "node:path";
import { detectUseServer } from "@evjs/build-tools";
import {
  type EvBundlerCtx,
  type EvPluginHooks,
  isMpa,
  type ResolvedEvConfig,
} from "@evjs/ev";
import type { ConfigComplete, DevServerProxy, ProxyRule } from "@utoo/pack";
import fastGlob from "fast-glob";

async function ensureGeneratedServerEntry(cwd: string): Promise<string> {
  const files = await fastGlob("src/**/*.{ts,tsx,js,jsx}", {
    cwd,
    absolute: true,
  });

  const serverModules: string[] = [];
  for (const file of files) {
    const source = await fs.promises.readFile(file, "utf-8");
    if (detectUseServer(source)) {
      serverModules.push(file);
    }
  }

  const outputDir = path.resolve(cwd, "node_modules/.cache/evjs");
  const outputPath = path.join(outputDir, "server-entry.ts");
  const source = [
    'import { createApp } from "@evjs/server";',
    "const app = createApp();",
    "export default app.fetch;",
  ].join("\n");

  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.writeFile(outputPath, `${source}\n`);

  return outputPath;
}

function createSpaHistoryFallbackRule(
  config: ResolvedEvConfig<ConfigComplete>,
): ProxyRule {
  const protocol = config.dev.https ? "https" : "http";

  return {
    context: ["^/(?!api(?:/|$))(?!turbopack-hmr$)(?!.*\\.[^/]+$).+"],
    target: `${protocol}://localhost:${config.dev.port}`,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/.*$": "/",
    },
  };
}

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
  const devProxy: DevServerProxy = [
    ...config.dev.proxy,
    ...(!isMpa(config) ? [createSpaHistoryFallbackRule(config)] : []),
  ];

  let finalServerEntry: string | undefined;

  if (serverEnabled) {
    finalServerEntry =
      config.server.entry || (await ensureGeneratedServerEntry(cwd));
  }

  if (serverEnabled && !finalServerEntry) {
    throw new Error("Failed to resolve a server entry for the server bundle.");
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
            entry: finalServerEntry,
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
      proxy: devProxy,
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
