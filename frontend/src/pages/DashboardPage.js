import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Card, PageHeader, Badge, Alert } from "../components/UI";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/")
      .then((res) => setStats(res.data))
      .catch((err) => {
        const d = err.response?.data?.detail;
        setError(d || `Error: ${err.message}`);
      });
  }, []);

  return (
    <Layout>
      <PageHeader title="Dashboard" subtitle="Your task overview at a glance" />
      <Alert message={error} />

      {!stats ? (
        <div style={s.loading}>
          <div style={s.spinner} />
          <span>Loading dashboard…</span>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={s.grid}>
            <StatCard label="Total Tasks"  value={stats.total_tasks}              icon="📋" color="#2a9d8f" />
            <StatCard label="To Do"       value={stats.by_status?.todo ?? 0}        icon="○"  color="#5a7a78" />
            <StatCard label="In Progress" value={stats.by_status?.in_progress ?? 0} icon="◑"  color="#f59e0b" />
            <StatCard label="Completed"   value={stats.by_status?.done ?? 0}        icon="●"  color="#00d4c8" />
            <StatCard label="Overdue"     value={stats.overdue_count}               icon="⚠"  color={stats.overdue_count > 0 ? "#ef4444" : "#2a9d8f"} highlight={stats.overdue_count > 0} />
            <StatCard label="Productivity" value={`${stats.productivity_score}%`}   icon="⚡" color="#1a7a6e" />
          </div>

          {/* Progress section */}
          {stats.total_tasks > 0 && (
            <Card style={{ marginTop: "1.5rem", maxWidth: "600px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <p style={s.progressTitle}>Overall Progress</p>
                  <p style={s.progressSub}>{stats.by_status?.done ?? 0} of {stats.total_tasks} tasks completed</p>
                </div>
                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#6366f1" }}>{stats.productivity_score}%</span>
              </div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${stats.productivity_score}%`, background: stats.productivity_score === 100 ? "#00d4c8" : "#2a9d8f" }} />
              </div>

              {/* Status breakdown */}
              <div style={s.breakdown}>
                {[
                  { label: "To Do",       value: stats.by_status?.todo ?? 0,        color: "#64748b" },
                  { label: "In Progress", value: stats.by_status?.in_progress ?? 0, color: "#f59e0b" },
                  { label: "Done",        value: stats.by_status?.done ?? 0,         color: "#10b981" },
                ].map((item) => (
                  <div key={item.label} style={s.breakdownItem}>
                    <span style={{ ...s.dot, background: item.color }} />
                    <span style={s.breakdownLabel}>{item.label}</span>
                    <span style={s.breakdownVal}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Overdue alert */}
          {stats.overdue_count > 0 && (
            <Card style={{ marginTop: "1rem", maxWidth: "600px", borderLeft: "4px solid #ef4444" }}>
              <p style={{ fontWeight: "600", color: "#dc2626", marginBottom: "0.25rem" }}>
                ⚠ {stats.overdue_count} overdue {stats.overdue_count === 1 ? "task" : "tasks"}
              </p>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Head to the Tasks page to update or reassign them.
              </p>
            </Card>
          )}
        </>
      )}
    </Layout>
  );
}

function StatCard({ label, value, icon, color, highlight }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: `3px solid ${color}` }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ fontSize: "1.6rem", fontWeight: "800", color: highlight ? "#ef4444" : "#0f172a", lineHeight: 1.2 }}>{value}</p>
      </div>
    </Card>
  );
}

const s = {
  grid:          { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" },
  loading:       { display: "flex", alignItems: "center", gap: "0.75rem", color: "#64748b", marginTop: "2rem" },
  spinner:       { width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  progressTitle: { fontWeight: "700", color: "#0f172a", fontSize: "0.95rem" },
  progressSub:   { color: "#64748b", fontSize: "0.8rem", marginTop: "0.15rem" },
  barTrack:      { background: "#f1f5f9", borderRadius: "99px", height: "10px", overflow: "hidden" },
  barFill:       { height: "100%", borderRadius: "99px", transition: "width 0.6s ease" },
  breakdown:     { display: "flex", gap: "1.5rem", marginTop: "1rem" },
  breakdownItem: { display: "flex", alignItems: "center", gap: "0.4rem" },
  dot:           { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  breakdownLabel:{ fontSize: "0.8rem", color: "#64748b" },
  breakdownVal:  { fontSize: "0.8rem", fontWeight: "700", color: "#0f172a" },
};
