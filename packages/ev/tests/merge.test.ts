import { describe, expect, it } from "vitest";
import type { EvConfig } from "../src/config.js";
import { merge } from "../src/merge.js";

describe("merge", () => {
  it("merges nested config sections", () => {
    const config: EvConfig = {
      server: {
        endpoint: "/api/fn",
        dev: { port: 3001 },
      },
    };

    merge(config, {
      server: {
        dev: { https: false },
      },
    });

    expect(config).toEqual({
      server: {
        endpoint: "/api/fn",
        dev: { port: 3001, https: false },
      },
    });
  });

  it("replaces arrays instead of merging them by index", () => {
    const config: EvConfig = {
      dev: {
        proxy: [{ context: ["/api"], target: "http://localhost:3001" }],
      },
    };

    merge(config, {
      dev: {
        proxy: [{ context: ["/rpc"], target: "http://localhost:4001" }],
      },
    });

    expect(config.dev?.proxy).toEqual([
      { context: ["/rpc"], target: "http://localhost:4001" },
    ]);
  });

  it("returns the target object", () => {
    const config: EvConfig = {};

    const result = merge(config, {
      entry: "./src/main.tsx",
    });

    expect(result).toBe(config);
    expect(config.entry).toBe("./src/main.tsx");
  });

  it("type-checks EvConfig patches", () => {
    const config: EvConfig = {};

    merge(config, {
      server: {
        endpoint: "/api/rpc",
      },
    });

    merge(config, {
      dev: {
        https: { key: "key.pem", cert: "cert.pem" },
      },
    });

    merge(config, {
      pages: {
        home: { entry: "./src/home/main.tsx" },
      },
    });

    merge(config, {
      // @ts-expect-error unknown framework config property
      unknown: true,
    });

    merge(config, {
      dev: {
        // @ts-expect-error dev.port must be a number
        port: "3000",
      },
    });
  });
});
