# basic-fns-ecma

Server functions with the ECMA/Fetch adapter — works on Deno, Bun, and edge runtimes.

## Run

```bash
npm run dev -w example-basic-fns-ecma

# Production
npm run build -w example-basic-fns-ecma
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | App bootstrap |
| `src/routes.tsx` | Routes + components |
| `src/api/messages.server.ts` | Server functions |
| `src/server.ts` | Service Worker style bootstrap entry |

## What It Demonstrates

- How to write a Service Worker style entry point (`self.addEventListener("fetch")`)
- Portable server bundle (no Node.js-specific APIs)
- Co-locating Web Standard export alongside Service Worker listeners for maximum compatibility
