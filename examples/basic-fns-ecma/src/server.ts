/**
 * Service Worker style bootstrap
 * Demonstrates how to run the server entirely within a Service Worker (or Edge Worker) environment.
 */

import { createApp } from "@evjs/server";

const app = createApp();

// Web Standard Export for environments that support module workers (Cloudflare, Deno)
export default app.fetch;

// Service Worker event listener for traditional SW environments
if (typeof self !== "undefined") {
  self.addEventListener("fetch", (event: any) => {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(app.fetch(event.request));
    }
  });
}
