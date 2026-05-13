import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveConfig } from "@evjs/ev";
import type { ConfigComplete } from "@utoo/pack";
import { afterEach, describe, expect, it, vi } from "vitest";
import { utoopackAdapter } from "../src/adapter/index.js";

vi.mock("@utoo/pack", () => ({
  serve: vi.fn(async ({ config }) => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const clientOutDir = config.output.path;

    await fs.promises.mkdir(clientOutDir, { recursive: true });
    await fs.promises.writeFile(path.join(clientOutDir, "main.js"), "");
    await fs.promises.writeFile(path.join(clientOutDir, "main.css"), "");
    await fs.promises.writeFile(
      path.join(clientOutDir, "stats.json"),
      JSON.stringify({
        entrypoints: {
          main: {
            assets: [{ name: "main.js" }, { name: "main.css" }],
          },
        },
      }),
    );

    if (config.server) {
      const serverOutDir = config.server.output.path;
      await fs.promises.mkdir(serverOutDir, { recursive: true });
      await fs.promises.writeFile(path.join(serverOutDir, "index.js"), "");
      await fs.promises.writeFile(
        path.join(serverOutDir, "stats.json"),
        JSON.stringify({
          entrypoints: {
            main: {
              assets: [{ name: "index.js" }],
            },
          },
        }),
      );
    }
  }),
  build: vi.fn(),
}));

const tempDirs: string[] = [];

async function makeProject() {
  const cwd = await fs.promises.mkdtemp(path.join(os.tmpdir(), "evjs-dev-"));
  tempDirs.push(cwd);
  await fs.promises.mkdir(path.join(cwd, "src"), { recursive: true });
  await fs.promises.writeFile(
    path.join(cwd, "index.html"),
    '<!doctype html><html><head></head><body><div id="app"></div></body></html>',
    "utf-8",
  );
  await fs.promises.writeFile(
    path.join(cwd, "src/main.tsx"),
    "console.log('client');",
    "utf-8",
  );
  return cwd;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) =>
      fs.promises.rm(dir, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

describe("utoopackAdapter dev", () => {
  it("emits flat CSR manifest and index.html in server:false mode", async () => {
    const cwd = await makeProject();
    const config = resolveConfig<ConfigComplete>({
      server: false,
      entry: "./src/main.tsx",
      html: "./index.html",
    });

    await utoopackAdapter.dev(config, cwd, { onServerBundleReady: vi.fn() }, [
      {
        transformHtml(doc) {
          const meta = doc.createElement("meta");
          meta.setAttribute("name", "mode");
          meta.setAttribute("content", "dev");
          doc.head?.appendChild(meta);
        },
      },
    ]);

    const manifest = JSON.parse(
      await fs.promises.readFile(path.join(cwd, "dist/manifest.json"), "utf-8"),
    );
    const html = await fs.promises.readFile(
      path.join(cwd, "dist/index.html"),
      "utf-8",
    );

    expect(manifest.assets).toEqual({
      js: ["main.js"],
      css: ["main.css"],
    });
    expect(html).toContain('<link rel="stylesheet" href="/main.css">');
    expect(html).toContain('src="/main.js"');
    expect(html).toContain('<meta name="mode" content="dev">');
    expect(fs.existsSync(path.join(cwd, "dist/client"))).toBe(false);
  });

  it("emits nested client and server manifests plus index.html in fullstack mode", async () => {
    const cwd = await makeProject();
    const onServerBundleReady = vi.fn();
    const config = resolveConfig<ConfigComplete>({
      entry: "./src/main.tsx",
      html: "./index.html",
    });

    await utoopackAdapter.dev(config, cwd, { onServerBundleReady }, [
      {
        transformHtml(doc, result) {
          const meta = doc.createElement("meta");
          meta.setAttribute(
            "name",
            result.serverManifest ? "server-enabled" : "client-only",
          );
          doc.head?.appendChild(meta);
        },
      },
    ]);

    const clientManifest = JSON.parse(
      await fs.promises.readFile(
        path.join(cwd, "dist/client/manifest.json"),
        "utf-8",
      ),
    );
    const serverManifest = JSON.parse(
      await fs.promises.readFile(
        path.join(cwd, "dist/server/manifest.json"),
        "utf-8",
      ),
    );
    const html = await fs.promises.readFile(
      path.join(cwd, "dist/client/index.html"),
      "utf-8",
    );

    expect(clientManifest.assets).toEqual({
      js: ["main.js"],
      css: ["main.css"],
    });
    expect(serverManifest.entry).toBe("index.js");
    expect(html).toContain('<link rel="stylesheet" href="/main.css">');
    expect(html).toContain('src="/main.js"');
    expect(html).toContain('<meta name="server-enabled">');
    expect(onServerBundleReady).toHaveBeenCalledTimes(1);
  });
});
