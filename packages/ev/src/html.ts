import type { ClientManifest, ServerManifest } from "@evjs/manifest";
import type { EvDocument, EvPluginHooks } from "./config.js";

export interface BuildHtmlOptions {
  /** Pre-parsed HTML document (from `generateHtml()`). */
  doc: EvDocument;
  // biome-ignore lint/suspicious/noExplicitAny: HTML hooks are bundler agnostic
  hooks: EvPluginHooks<any>[];
  /** Client manifest (passed to transformHtml hooks). */
  clientManifest: ClientManifest;
  /** Server manifest, if server is enabled. */
  serverManifest?: ServerManifest;
}

/**
 * Apply framework-level HTML transforms to a pre-parsed document.
 *
 * This is bundler-agnostic — callers parse the initial HTML with
 * `generateHtml()` (from `@evjs/build-tools`) and pass the resulting
 * doc here for:
 *
 * 1. `transformHtml` plugin hooks (applied in sequence).
 * 2. Serialization to the final HTML string.
 */
export async function buildHtml(options: BuildHtmlOptions): Promise<string> {
  const { doc, hooks, clientManifest, serverManifest } = options;

  // Run transformHtml plugin hooks in sequence (mutate doc in place)
  const buildResult = {
    clientManifest,
    serverManifest,
    isRebuild: false,
  };
  for (const h of hooks) {
    if (h.transformHtml) {
      await h.transformHtml(doc, buildResult);
    }
  }

  return (doc as unknown as { toString(): string }).toString();
}
