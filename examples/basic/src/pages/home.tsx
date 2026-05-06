import {
  createRoute,
  getFnQueryKey,
  Link,
  useMutation,
  useQuery,
  useQueryClient,
} from "@evjs/client";
import { useState } from "react";
import { createUser, getUser, getUsers } from "../api/users.server";
import { rootRoute } from "./__root";

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};

const linkStyle = { color: "#2563eb", textDecoration: "none" };

function UsersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  // Use the framework's useQuery hook instead of manual useState + useEffect
  const { data: users = [], isLoading } = useQuery(getUsers);

  // Use useMutation for server function calls that modify data
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch users list after successful creation
      queryClient.invalidateQueries({ queryKey: getFnQueryKey(getUsers) });
      setName("");
      setEmail("");
    },
  });

  function handleCreate(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!name || !email) return;
    createUserMutation.mutate({ name, email });
  }

  if (isLoading) return <p>Loading users from server…</p>;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={cardStyle}>
        <h2>Routing Patterns</h2>
        <p style={{ color: "#475569" }}>
          This example includes static, dynamic-param, and search-param routes
          so you can switch between browser, hash, and memory history and verify
          route behavior.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/about" style={linkStyle}>
            Open static route
          </Link>
          <Link to="/users/$userId" params={{ userId: "2" }} style={linkStyle}>
            Open dynamic route
          </Link>
          <Link to="/search" search={{ tab: "favorites" }} style={linkStyle}>
            Open search route
          </Link>
        </div>
      </div>

      <div style={cardStyle}>
      <h2>Users (fetched via direct server function call)</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <Link
              to="/users/$userId"
              params={{ userId: u.id }}
              style={linkStyle}
            >
              {u.name}
            </Link>{" "}
            — {u.email}
          </li>
        ))}
      </ul>

      <h3>Add User</h3>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={cardStyle}>
      <h2>Static Route</h2>
      <p>
        This page uses a plain static path, useful for validating direct
        navigation and route switching across different history implementations.
      </p>
    </div>
  );
}

function UserDetailPage() {
  const { userId } = userDetailRoute.useParams();
  const { data: user, isLoading } = useQuery(getUser, userId);

  if (isLoading) return <p>Loading user…</p>;

  return (
    <div style={cardStyle}>
      <h2>Dynamic Route</h2>
      <p style={{ color: "#64748b" }}>Path param: {userId}</p>
      <p>
        Selected user: <strong>{user?.name}</strong>
      </p>
      <p>{user?.email}</p>
      <Link to="/" style={linkStyle}>
        Back to users
      </Link>
    </div>
  );
}

function SearchPage() {
  const { tab } = searchRoute.useSearch();
  const { data: users = [] } = useQuery(getUsers);

  const visibleUsers =
    tab === "favorites"
      ? users.filter((user) => Number.parseInt(user.id, 10) % 2 === 1)
      : tab === "recent"
        ? users.slice(-2)
        : users;

  return (
    <div style={cardStyle}>
      <h2>Search Route</h2>
      <p style={{ color: "#64748b" }}>Current search tab: {tab}</p>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/search" search={{ tab: "all" }} style={linkStyle}>
          All
        </Link>
        <Link to="/search" search={{ tab: "favorites" }} style={linkStyle}>
          Favorites
        </Link>
        <Link to="/search" search={{ tab: "recent" }} style={linkStyle}>
          Recent
        </Link>
      </div>
      <ul>
        {visibleUsers.map((user) => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: UsersPage,
});

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

export const userDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  component: UserDetailPage,
});

export const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "favorites" || search.tab === "recent"
        ? search.tab
        : "all",
  }),
  component: SearchPage,
});
