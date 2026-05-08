# Project Structure

evjs is zero-config, so the required structure is intentionally small. Start
with `src/main.tsx`, `src/pages/`, and `src/api/`; add feature folders only when
the app grows.

## Minimal App

This is the smallest useful shape for a fullstack evjs app:

```text
my-evjs-app/
├── ev.config.ts              # optional framework config
├── index.html                # HTML template with <div id="app">
├── package.json
├── tsconfig.json
└── src/
    ├── main.tsx              # client entry: build route tree and render app
    ├── pages/
    │   ├── __root.tsx        # root layout with <Outlet />
    │   └── home.tsx          # route component for /
    └── api/
        └── users.server.ts   # "use server" functions
```

`ev dev` and `ev build` use convention-based defaults for `entry` and `html`:

```ts
// ev.config.ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  entry: "./src/main.tsx",
  html: "./index.html",
});
```

## Fullstack App

As the app grows, keep client assembly, server code, and shared UI separate:

```text
src/
├── main.tsx
├── global.ts                 # optional router type registration / transport setup
├── pages/                    # route declarations and page-level composition
│   ├── __root.tsx
│   ├── home.tsx
│   └── users/
│       ├── index.tsx
│       └── detail.tsx
├── api/                      # server boundary
│   ├── users.server.ts       # server functions: "use server"
│   ├── posts.server.ts
│   ├── health.routes.ts      # optional HTTP route handlers
│   └── posts.routes.ts
├── server.ts                 # optional custom server entry for routes
├── components/               # app-wide reusable UI
├── features/                 # domain modules for medium/large apps
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── model.ts
│       └── types.ts
├── lib/                      # shared clients, adapters, helpers
├── hooks/                    # app-wide React hooks
└── styles.css                # global styles / Tailwind entry
```

## Routing Files

`src/pages/` is for route declarations and page assembly. evjs uses TanStack
Router APIs directly; it does not require file-based route generation.

Keep route files thin:

- Define the route with `createRoute()`.
- Read route params/search params.
- Call loaders or server functions when needed.
- Compose UI from `features/` or `components/`.

Business logic should usually live outside route files.

## Server Boundary

Put server-only code under `src/api/` by default.

Use `*.server.ts` for server functions:

```ts
// src/api/users.server.ts
"use server";

export async function getUsers() {
  return [{ id: 1, name: "Ada" }];
}
```

Use `*.routes.ts` for standard Request/Response endpoints:

```ts
// src/api/health.routes.ts
import { createRoute } from "@evjs/server";

export const healthRoute = createRoute("/api/health", {
  GET: async () => Response.json({ ok: true }),
});
```

Mount route handlers in a custom server entry:

```ts
// src/server.ts
import { createApp } from "@evjs/server";
import { healthRoute } from "./api/health.routes";

const app = createApp({
  routes: [healthRoute],
});

export default { fetch: app.fetch };
```

Then point evjs at that entry:

```ts
// ev.config.ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  server: {
    entry: "./src/server.ts",
  },
});
```

## MPA Apps

For multi-page applications, use the top-level `pages` config. Each page has an
independent entry and may share the default HTML template:

```text
src/
├── home/
│   └── main.tsx
└── about/
    └── main.tsx
```

```ts
// ev.config.ts
import { defineConfig } from "@evjs/ev";

export default defineConfig({
  pages: {
    home: { entry: "./src/home/main.tsx" },
    about: { entry: "./src/about/main.tsx" },
  },
});
```

When `pages` is set, it takes precedence over the single-app `entry` / `html`
fields.

## Generated Folders

These folders are build artifacts and should not be edited by hand:

```text
.evjs/          # dev-time generated route metadata
dist/           # production output
.turbo/         # Turborepo cache/log output
```

## Scaling Guidance

- Small apps can stay flat: `pages/`, `api/`, `components/`.
- Medium apps should introduce `features/` for domain-specific UI, hooks, and model code.
- Keep server secrets and Node-only APIs inside `src/api/` or modules imported only by `src/api/`.
- Keep shared browser-safe helpers in `lib/`.
- Use `public/` for static files copied as-is, and import app styles from the client entry.
