import { createRootRoute, Link, Outlet } from "@evjs/client";

const navLinkStyle = { textDecoration: "none", color: "#0f172a" };

function Root() {
  const currentHistory = localStorage.getItem("router_history") || "browser";

  const setHistory = (type: string) => {
    localStorage.setItem("router_history", type);
    window.location.reload();
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
      <h1>Server Functions Example</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="history-select" style={{ marginRight: "1rem" }}>
          History Type:
        </label>
        <select
          id="history-select"
          value={currentHistory}
          onChange={(e) => setHistory(e.target.value)}
        >
          <option value="browser">Browser</option>
          <option value="hash">Hash</option>
          <option value="memory">Memory</option>
        </select>
      </div>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/" style={navLinkStyle}>
          Users
        </Link>
        <Link to="/about" style={navLinkStyle}>
          Static Route
        </Link>
        <Link to="/users/$userId" params={{ userId: "1" }} style={navLinkStyle}>
          Dynamic Route
        </Link>
        <Link to="/search" search={{ tab: "all" }} style={navLinkStyle}>
          Search Route
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}

export const rootRoute = createRootRoute({ component: Root });
