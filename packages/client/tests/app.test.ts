import { describe, expect, it } from "vitest";
import { createApp, createAppRootRoute } from "../src/index";

function createRouteTree() {
  return createAppRootRoute({
    component: () => null,
  });
}

describe("createApp", () => {
  it("uses TanStack Router default error boundary by default", () => {
    const app = createApp({ routeTree: createRouteTree() });

    expect(app.router.options.defaultErrorComponent).toBeUndefined();
  });

  it("can disable TanStack Router default error boundary from app options", () => {
    const app = createApp({
      routeTree: createRouteTree(),
      router: { disableDefaultErrorBoundary: true },
    });

    expect(app.router.options.defaultErrorComponent).toBe(false);
  });
});
