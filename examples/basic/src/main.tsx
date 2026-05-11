import {
  createApp,
  createHashHistory,
  createMemoryHistory,
} from "@evjs/client";
import { rootRoute } from "./pages/__root";
import {
  aboutRoute,
  searchRoute,
  userDetailRoute,
  usersRoute,
} from "./pages/home";

const routeTree = rootRoute.addChildren([
  usersRoute,
  aboutRoute,
  userDetailRoute,
  searchRoute,
]);

const historyType = localStorage.getItem("router_history") || "browser";
const history =
  historyType === "hash"
    ? createHashHistory()
    : historyType === "memory"
      ? createMemoryHistory()
      : undefined;

const app = createApp({ routeTree, history });

declare module "@evjs/client" {
  interface Register {
    router: typeof app.router;
  }
}

app.render("#app");
