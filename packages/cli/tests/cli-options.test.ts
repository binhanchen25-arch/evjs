import { describe, expect, it } from "vitest";
import { parseCliContext } from "../src/cli-options.js";

describe("CLI options", () => {
  it("collects multiple plugin flags from command arguments", () => {
    expect(parseCliContext(["--mock", "--coverage"])).toEqual({
      flags: {
        mock: true,
        coverage: true,
      },
    });
  });
});
