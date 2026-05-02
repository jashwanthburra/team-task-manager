export function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 1px 4px rgba(26,35,50,0.08)",
      border: "1px solid #d0ecea",
      padding: "1.5rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", size = "md", style, ...props }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: "0.4rem",
    fontWeight: "600", borderRadius: "8px", border: "none", cursor: "pointer",
    transition: "all 0.15s",
    fontSize: size === "sm" ? "0.8rem" : "0.9rem",
    padding: size === "sm" ? "0.4rem 0.85rem" : "0.65rem 1.25rem",
  };
  const variants = {
    primary:   { background: "#2a9d8f", color: "#fff" },
    secondary: { background: "#e0f5f3", color: "#1a7a6e", border: "1px solid #b2deda" },
    danger:    { background: "#fee2e2", color: "#dc2626" },
    ghost:     { background: "none", color: "#2a9d8f", border: "1px solid #b2deda" },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} {...props}>{children}</button>;
}

export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#5a7a78", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </label>
      )}
      <input style={{
        padding: "0.65rem 0.85rem",
        border: `1px solid ${error ? "#fca5a5" : "#d0ecea"}`,
        borderRadius: "8px", fontSize: "0.9rem", outline: "none",
        background: "#fff", color: "#1a2332", transition: "border 0.15s",
        ...style,
      }} {...props} />
      {error && <span style={{ fontSize: "0.78rem", color: "#dc2626" }}>{error}</span>}
    </div>
  );
}

export function Select({ label, children, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#5a7a78", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </label>
      )}
      <select style={{
        padding: "0.65rem 0.85rem",
        border: "1px solid #d0ecea", borderRadius: "8px",
        fontSize: "0.9rem", background: "#fff", color: "#1a2332", outline: "none",
        ...style,
      }} {...props}>{children}</select>
    </div>
  );
}

export function Badge({ children, color = "gray" }) {
  const colors = {
    gray:   { background: "#f1f5f9",  color: "#64748b" },
    teal:   { background: "#e0f5f3",  color: "#1a7a6e" },
    green:  { background: "#dcfce7",  color: "#16a34a" },
    yellow: { background: "#fef9c3",  color: "#a16207" },
    red:    { background: "#fee2e2",  color: "#dc2626" },
    blue:   { background: "#e0f2fe",  color: "#0369a1" },
    cyan:   { background: "#ccfbf1",  color: "#0f766e" },
  };
  return (
    <span style={{
      ...colors[color],
      padding: "0.2rem 0.65rem", borderRadius: "20px",
      fontSize: "0.75rem", fontWeight: "600", display: "inline-block",
    }}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1a2332" }}>{title}</h1>
        {subtitle && <p style={{ color: "#5a7a78", fontSize: "0.9rem", marginTop: "0.25rem" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Alert({ message, type = "error" }) {
  if (!message) return null;
  const styles = {
    error:   { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" },
    success: { background: "#e0f5f3", border: "1px solid #b2deda", color: "#1a7a6e" },
    info:    { background: "#e0f5f3", border: "1px solid #b2deda", color: "#1a7a6e" },
  };
  return (
    <div style={{ ...styles[type], padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: "500" }}>
      {message}
    </div>
  );
}
