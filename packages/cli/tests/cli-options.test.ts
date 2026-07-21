import { describe, expect, it } from "vitest";
import { parseCliFlags } from "../src/cli-options.js";

describe("CLI options", () => {
  it("collects multiple plugin flags from command arguments", () => {
    expect(parseCliFlags(["--mock", "--coverage"])).toEqual({
      mock: true,
      coverage: true,
    });
  });
});
