import { describe, expect, it } from "vitest";
import type {
  BuildHost,
  BuildHostDiagnostic,
  BuildHostDirectoryEntry,
  BuildHostParsedModule,
} from "../src/host.js";

function createHost(overrides: Partial<BuildHost> = {}): BuildHost {
  return {
    kind: "node",
    root: "/project",
    capabilities: {
      filesystem: "read-write",
      modules: "native",
      parser: "native",
      watch: "native",
      bundler: "native",
      serverRuntime: "node-process",
    },
    fs: {
      async readFile(file) {
        return `source:${file}`;
      },
      async writeFile() {},
      async exists() {
        return true;
      },
      async stat() {
        return { type: "file", revision: "1" };
      },
      async readDir(): Promise<BuildHostDirectoryEntry[]> {
        return [{ name: "index.tsx", type: "file" }];
      },
      async remove() {},
      async walk() {
        return ["/project/src/pages/index.tsx"];
      },
    },
    path: {
      resolve(...parts) {
        return parts.join("/");
      },
      join(...parts) {
        return parts.join("/");
      },
      relative(_from, to) {
        return to;
      },
      dirname(file) {
        return file.split("/").slice(0, -1).join("/") || "/";
      },
      basename(file) {
        return file.split("/").pop() ?? file;
      },
      extname(file) {
        const name = file.split("/").pop() ?? file;
        const index = name.lastIndexOf(".");
        return index >= 0 ? name.slice(index) : "";
      },
      isAbsolute(file) {
        return file.startsWith("/");
      },
      normalize(file) {
        return file.replaceAll("\\", "/");
      },
      toPosix(file) {
        return file.replaceAll("\\", "/");
      },
      toProjectPath(file) {
        return file.replace(/^\/project\/?/, "./");
      },
      isInsideRoot(file) {
        return file.startsWith("/project");
      },
    },
    parser: {
      parseModule(source): BuildHostParsedModule {
        return { source, ast: { type: "Module" } };
      },
      formatParseError(error) {
        return error instanceof Error ? error.message : String(error);
      },
    },
    modules: {
      async resolve(specifier) {
        return specifier;
      },
      async load<TModule = unknown>(specifier: string) {
        return { default: specifier } as TModule;
      },
      toFileUrl(file) {
        return `file://${file}`;
      },
    },
    diagnostics: {
      report(_diagnostic: BuildHostDiagnostic) {},
    },
    ...overrides,
  };
}

describe("BuildHost contracts", () => {
  it("describe Node and browser hosts without importing host-specific packages", async () => {
    const nodeHost = createHost();
    const browserHost = createHost({
      kind: "browser",
      root: "/",
      capabilities: {
        filesystem: "read-write",
        modules: "sandbox",
        parser: "wasm",
        watch: "hosted",
        bundler: "wasm",
        serverRuntime: "fetch",
      },
    });

    await expect(nodeHost.fs.readFile("/project/src/main.tsx")).resolves.toBe(
      "source:/project/src/main.tsx",
    );
    expect(browserHost.capabilities.serverRuntime).toBe("fetch");
  });
});
