# basic

The standard starting point for an evjs application. Demonstrates both client-side routing and server functions.

## Run

```bash
npm run dev -w example-basic
```

## Key Files

| File | Purpose |
|------|---------|
| `ev.config.ts` | The central configuration file for evjs |
| `src/main.tsx` | App bootstrap |
| `src/pages/` | Client routes using TanStack Router |
| `src/api/users.server.ts` | `"use server"` CRUD functions |

## What It Demonstrates

- `ev.config.ts` setup
- Client-side routing with `createApp` and `createRoute`
- `"use server"` directive for auto-discovered server functions
- `useQuery(getUsers)` for type-safe data fetching
- `useMutation({ mutationFn: createUser })` for mutations
- `getFnQueryKey(getUsers)` for cache invalidation
