import { NavLink, Outlet, useNavigate } from "react-router-dom";

const C = {
  bg: "#06090f", surface: "#0f1520", border: "#1a2438", borderLight: "#243352",
  text: "#dfe6f0", textDim: "#6b7d9a", textMuted: "#3d4f6a",
  accent: "#00e5c7", cyan: "#00c2ff", purple: "#9b7dff",
  red: "#ff4d6a", green: "#00e5a0",
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { to: "/journal", label: "Journal", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg> },
  { to: "/calculator", label: "Position Sizing", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> },
  { to: "/insights", label: "AI Insights", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg> },
];

export default function Layout({ user, onSignOut }) {
  const navigate = useNavigate();

  return (
    <div style={{
      "--mono": "'IBM Plex Mono', monospace",
      "--heading": "'DM Sans', sans-serif",
      minHeight: "100vh", background: C.bg,
      fontFamily: "var(--heading)", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Nav ── */}
      <nav style={{
        borderBottom: `1px solid ${C.border}`, padding: "10px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `${C.bg}dd`, backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }} onClick={() => navigate("/dashboard")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>TradeScope</span>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--heading)", textDecoration: "none",
                background: isActive ? `${C.accent}18` : "transparent",
                color: isActive ? C.accent : C.textDim,
                transition: "all 0.15s",
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user && <span style={{ fontSize: 10, color: C.textDim, fontFamily: "var(--mono)" }}>{user.email}</span>}
          {onSignOut && (
            <button onClick={onSignOut} style={{
              padding: "5px 12px", border: `1px solid ${C.border}`, borderRadius: 5,
              background: "transparent", color: C.textDim, fontSize: 10,
              cursor: "pointer", fontFamily: "var(--mono)", transition: "border-color 0.2s",
            }}>Sign Out</button>
          )}
        </div>
      </nav>

      {/* ── Page Content ── */}
      <Outlet />
    </div>
  );
}
