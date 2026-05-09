/**
 * Type-safety tests for @evjs/client routing.
 *
 * These tests are validated at compile time — `tsc --noEmit` on this file
 * verifies that the type system correctly enforces:
 * - Route params are typed (`$postId` → `{ postId: string }`)
 * - Search params are typed with validateSearch
 * - Link `to` prop only accepts registered route paths
 * - `useParams()` / `useSearch()` return correct types
 *
 * Lines with `@ts-expect-error` MUST fail type-checking.
 * If any `@ts-expect-error` becomes unused, tsc will report it as an error,
 * meaning the type guard is broken.
 */

import {
  Await,
  Block,
  ClientOnly,
  composeRewrites,
  createApp,
  createAppRootRoute,
  createBrowserHistory,
  createRoute,
  createRouteMask,
  defaultParseSearch,
  defaultStringifySearch,
  Link,
  type LocationRewrite,
  linkOptions,
  MatchRoute,
  type RouteMask,
  type RouterEvents,
  retainSearchParams,
  ScrollRestoration,
  stripSearchParams,
  type ToOptions,
  useChildMatches,
  useLinkProps,
  useMatches,
  useParentMatches,
} from "@evjs/client";

// ── Setup route tree ──

const rootRoute = createAppRootRoute({
  component: () => null,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => null,
});

const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts/$postId",
  component: () => null,
});

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$username",
  component: () => null,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    page: Number(search.page) || 1,
  }),
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  postRoute,
  userRoute,
  searchRoute,
]);

const app = createApp({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof app.router;
  }
}

// ── Type assertions: transparent TanStack Router exports ──

export const componentRefs = {
  Await,
  Block,
  ClientOnly,
  MatchRoute,
  ScrollRestoration,
};

const localeRewrite: LocationRewrite = {
  input: ({ url }) => {
    url.pathname = url.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    return url;
  },
};

export const utilityRefs = {
  composeRewrites,
  createBrowserHistory,
  createRouteMask,
  defaultParseSearch,
  defaultStringifySearch,
  retainSearchParams,
  stripSearchParams,
};

export const composedRewrite = composeRewrites([localeRewrite]);

export const retainedSearch = retainSearchParams(["q"]);
export const strippedSearch = stripSearchParams(["debug"]);

export const postLinkOptions = linkOptions({
  to: "/posts/$postId",
  params: { postId: "123" },
});

export const postRouteMask: RouteMask<typeof routeTree> = createRouteMask({
  routeTree,
  from: "/",
  to: "/posts/$postId",
  params: { postId: "123" },
});

export const postToOptions: ToOptions<
  typeof app.router,
  "/",
  "/posts/$postId"
> = {
  to: "/posts/$postId",
  params: { postId: "123" },
};

export const routerEventName: keyof RouterEvents = "onResolved";

// ── Type assertions: useParams ──

export function PostComponent() {
  // ✅ Correct: postId is typed as string
  const { postId } = postRoute.useParams();
  const _check: string = postId;

  // @ts-expect-error — postId does not exist on home route params
  homeRoute.useParams().postId;

  // @ts-expect-error — username does not exist on post route params
  postRoute.useParams().username;
}

export function UserComponent() {
  // ✅ Correct: username is typed as string
  const { username } = userRoute.useParams();
  const _check: string = username;

  // @ts-expect-error — postId does not exist on user route params
  userRoute.useParams().postId;
}

// ── Type assertions: useSearch ──

export function SearchComponent() {
  // ✅ Correct: q and page are typed
  const { q, page } = searchRoute.useSearch();
  const _q: string = q;
  const _page: number = page;

  // @ts-expect-error — nonExistent does not exist on search params
  searchRoute.useSearch().nonExistent;
}

// ── Type assertions: Link params ──

export function LinkTests() {
  // ✅ Correct: Link with required params
  <Link to="/posts/$postId" params={{ postId: "123" }} />;

  // ✅ Correct: Link to home (no params needed)
  <Link to="/" />;

  // ✅ Correct: Link with search params
  <Link to="/search" search={{ q: "test", page: 1 }} />;

  // @ts-expect-error — missing required postId param
  <Link to="/posts/$postId" />;

  // @ts-expect-error — wrong param name
  <Link to="/posts/$postId" params={{ wrongParam: "123" }} />;

  // @ts-expect-error — invalid route path
  <Link to="/not-a-real-route" />;
}

export function HookExportTests() {
  const props = useLinkProps({
    to: "/posts/$postId",
    params: { postId: "123" },
  });
  const matches = useMatches();
  const parentMatches = useParentMatches();
  const childMatches = useChildMatches();

  return (
    <a {...props}>
      {matches.length + parentMatches.length + childMatches.length}
    </a>
  );
}
