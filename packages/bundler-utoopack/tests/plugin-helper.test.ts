import type { ConfigComplete } from "@utoo/pack";
import { describe, expect, it } from "vitest";
import { merge } from "../src/plugin-helper.js";

describe("merge", () => {
  it("merges nested config sections", () => {
    const config: ConfigComplete = {
      entry: [],
      module: {
        rules: {
          ".svg": { type: "asset" },
        },
      },
    };

    merge(config, {
      module: {
        rules: {
          ".mdx": { type: "raw" },
        },
      },
    });

    expect(config.module?.rules).toEqual({
      ".svg": { type: "asset" },
      ".mdx": { type: "raw" },
    });
  });

  it("replaces arrays instead of merging them by index", () => {
    const config: ConfigComplete = {
      entry: [{ import: "./src/main.tsx" }],
      resolve: {
        extensions: [".tsx", ".ts"],
      },
    };

    merge(config, {
      resolve: {
        extensions: [".jsx", ".js"],
      },
    });

    expect(config.resolve?.extensions).toEqual([".jsx", ".js"]);
  });
});
