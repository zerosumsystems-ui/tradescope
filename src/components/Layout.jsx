import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { to: "/journal", label: "Journal", icon: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" },
  { to: "/heatmap", label: "Heatmap", icon: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" },
  { to: "/calculator", label: "Sizing", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  { to: "/risk-of-ruin", label: "Risk", icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
  { to: "/insights", label: "Insights", icon: "M12 2a10 10 0 1 0 10 10H12V2zM20 12a8 8 0 0 1-8 8" },
];

export default function Layout({ user, onSignOut }) {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", background: "#000000",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#f5f5f7",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top bar: logo + user ── */}
      <div style={{
        background: "#000",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", maxWidth: 1320, margin: "0 auto",
        }}>
          {/* Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
            onClick={() => navigate("/dashboard")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5f5f7" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>TradeScope</span>
          </div>

          {/* User */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {user && <span className="hide-mobile" style={{ fontSize: 12, color: "#6e6e73", fontWeight: 500 }}>{user.email}</span>}
            {onSignOut && (
              <button onClick={onSignOut} style={{
                padding: "5px 14px", border: "none", borderRadius: 980,
                background: "rgba(255,255,255,0.06)", color: "#a1a1a6",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              >Sign Out</button>
            )}
          </div>
        </div>

        {/* ── Nav tabs: horizontally scrollable ── */}
        <div className="nav-scroll" style={{
          overflowX: "auto", overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none", scrollbarWidth: "none",
          borderTop: "0.5px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{
            display: "flex", gap: 2, padding: "6px 16px",
            maxWidth: 1320, margin: "0 auto",
            width: "max-content", minWidth: "100%",
            justifyContent: "center",
          }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 980, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  color: isActive ? "#f5f5f7" : "#a1a1a6",
                  transition: "all 0.2s ease", flexShrink: 0,
                })}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <Outlet />
    </div>
  );
}
