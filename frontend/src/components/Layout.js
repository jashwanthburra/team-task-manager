import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/projects",  label: "Projects",  icon: "◫" },
  { to: "/tasks",     label: "Tasks",     icon: "✓" },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={s.brandIcon}>⬡</span>
          <span style={s.brandName}>Task Manager</span>
        </div>

        <nav style={s.nav}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}
            >
              <span style={s.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => { logout(); navigate("/login"); }} style={s.logoutBtn}>
          ↩ Logout
        </button>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  );
}

const s = {
  shell:    { display: "flex", minHeight: "100vh", background: "#f4fafa" },
  sidebar:  {
    width: "220px", flexShrink: 0,
    background: "#1a2332",
    display: "flex", flexDirection: "column",
    padding: "1.5rem 1rem",
    position: "sticky", top: 0, height: "100vh",
  },
  brand:    { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2.5rem", paddingLeft: "0.5rem" },
  brandIcon:{ fontSize: "1.4rem", color: "#00d4c8" },
  brandName:{ fontSize: "1rem", fontWeight: "700", color: "#fff", letterSpacing: "0.02em" },
  nav:      { display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 },
  navItem:  {
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.65rem 0.75rem", borderRadius: "8px",
    color: "#7fb8b3", fontSize: "0.9rem", fontWeight: "500",
    transition: "all 0.15s",
  },
  navActive:{ background: "#2a9d8f", color: "#fff" },
  navIcon:  { fontSize: "1rem", width: "20px", textAlign: "center" },
  logoutBtn:{
    display: "flex", alignItems: "center", gap: "0.5rem",
    background: "none", border: "1px solid #243447",
    color: "#7fb8b3", padding: "0.6rem 0.75rem",
    borderRadius: "8px", fontSize: "0.85rem", marginTop: "auto",
  },
  main:     { flex: 1, padding: "2rem 2.5rem", overflowY: "auto" },
};
