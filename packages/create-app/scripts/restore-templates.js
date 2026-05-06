/**
 * Restore symlinked templates after npm publishing.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, "../templates");

const symlinkTargets = {
  "api-routes": "../../../examples/api-routes",
  basic: "../../../examples/basic",
  "complex-routing": "../../../examples/complex-routing",
  "custom-ws-transport": "../../../examples/custom-ws-transport",
  mpa: "../../../examples/mpa",
  "plugin-authoring": "../../../examples/plugin-authoring",
  "with-sqlite": "../../../examples/with-sqlite",
  "with-tailwind": "../../../examples/with-tailwind",
  "with-trpc": "../../../examples/with-trpc",
};

for (const [name, target] of Object.entries(symlinkTargets)) {
  const entryPath = path.join(templatesDir, name);
  const stat = fs.lstatSync(entryPath, { throwIfNoEntry: false });

  if (stat && !stat.isSymbolicLink()) {
    fs.rmSync(entryPath, { recursive: true, force: true });
    fs.symlinkSync(target, entryPath);
  }
}
