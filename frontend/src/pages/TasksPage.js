import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Card, Button, Input, Select, PageHeader, Badge, Alert } from "../components/UI";

const STATUS_OPTIONS = ["todo", "in_progress", "done"];

const STATUS_BADGE = { todo: "gray", in_progress: "yellow", done: "green" };
const STATUS_LABEL = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const PRIORITY_BADGE = { low: "blue", medium: "yellow", high: "red" };

export default function TasksPage() {
  const [tasks, setTasks]               = useState([]);
  const [projects, setProjects]         = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [userMap, setUserMap]           = useState({});
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm]         = useState(false);
  const [error, setError]               = useState("");
  const [form, setForm] = useState({
    title: "", description: "", project_id: "",
    priority: "medium", due_date: "", assigned_to: "",
  });

  const fetchTasks = () =>
    api.get("/tasks/me").then((r) => setTasks(r.data)).catch(() => {});

  useEffect(() => {
    fetchTasks();
    api.get("/projects/").then((r) => setProjects(r.data)).catch(() => {});
    api.get("/admin/users").then((r) => {
      const map = {};
      r.data.forEach((u) => { map[u.id] = u; });
      setUserMap(map);
    }).catch(() => {});
  }, []);

  const handleProjectChange = (projectId) => {
    setForm({ ...form, project_id: projectId, assigned_to: "" });
    if (projectId) {
      api.get(`/projects/${projectId}/members`)
        .then((r) => setProjectMembers(r.data))
        .catch(() => setProjectMembers([]));
    } else {
      setProjectMembers([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError("");
    try {
      const payload = { ...form };
      if (!payload.due_date) delete payload.due_date;
      if (!payload.assigned_to) delete payload.assigned_to;
      await api.post("/tasks/", payload);
      setForm({ title: "", description: "", project_id: "", priority: "medium", due_date: "", assigned_to: "" });
      setProjectMembers([]);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : err.request ? "Cannot reach server" : err.message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch { alert("Failed to update status"); }
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === "done") return false;
    return new Date(task.due_date) < new Date();
  };

  const filtered = tasks.filter((t) => {
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const projectName = (id) => projects.find((p) => p.id === id)?.name || "—";
  const assigneeName = (id) => id ? (userMap[id] ? `${userMap[id].name}` : id) : "Unassigned";

  return (
    <Layout>
      <PageHeader
        title="Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={() => { setShowForm(!showForm); setError(""); }}>
            {showForm ? "✕ Cancel" : "+ New Task"}
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <Card style={{ marginBottom: "1.5rem", maxWidth: "520px" }}>
          <p style={s.formTitle}>New Task</p>
          <Alert message={error} />
          <form onSubmit={handleCreate} style={s.form}>
            <Input label="Title" placeholder="What needs to be done?"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Description" placeholder="Optional details…"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select label="Project" value={form.project_id}
              onChange={(e) => handleProjectChange(e.target.value)} required>
              <option value="">Select a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select label="Assign To" value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Assign to (defaults to you)</option>
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.email}</option>
              ))}
            </Select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Select label="Priority" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <Input label="Due Date" type="date"
                value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <Button type="submit" style={{ alignSelf: "flex-start" }}>Create Task</Button>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div style={s.filters}>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Priority</span>
          {["all", "low", "medium", "high"].map((p) => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              style={{ ...s.chip, ...(priorityFilter === p ? s.chipActive : {}) }}>
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Status</span>
          {["all", "todo", "in_progress", "done"].map((st) => (
            <button key={st} onClick={() => setStatusFilter(st)}
              style={{ ...s.chip, ...(statusFilter === st ? s.chipActive : {}) }}>
              {st === "all" ? "All" : STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <p style={{ fontSize: "2rem" }}>✓</p>
          <p style={{ fontWeight: "600", marginTop: "0.5rem" }}>No tasks found</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Try adjusting your filters or create a new task</p>
        </Card>
      ) : (
        <div style={s.list}>
          {filtered.map((task) => (
            <Card key={task.id} style={{
              borderLeft: isOverdue(task) ? "4px solid #ef4444" : "4px solid transparent",
              padding: "1.25rem 1.5rem",
            }}>
              <div style={s.taskHead}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <p style={s.taskTitle}>{task.title}</p>
                    {isOverdue(task) && <Badge color="red">⚠ Overdue</Badge>}
                  </div>
                  {task.description && <p style={s.taskDesc}>{task.description}</p>}
                </div>
                {/* Status selector */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  style={{ ...s.statusSelect, ...STATUS_SELECT_COLORS[task.status] }}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{STATUS_LABEL[st]}</option>
                  ))}
                </select>
              </div>

              <div style={s.taskMeta}>
                <MetaItem icon="◫" label={projectName(task.project_id)} />
                <MetaItem icon="👤" label={assigneeName(task.assigned_to)} />
                <Badge color={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                <Badge color={STATUS_BADGE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                {task.due_date && (
                  <MetaItem icon="📅" label={new Date(task.due_date).toLocaleDateString()} color={isOverdue(task) ? "#ef4444" : "#64748b"} />
                )}
                {task.updated_at && (
                  <MetaItem icon="🕐" label={`Updated ${new Date(task.updated_at).toLocaleString()}`} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

function MetaItem({ icon, label, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: color || "#64748b" }}>
      <span>{icon}</span>{label}
    </span>
  );
}

const STATUS_SELECT_COLORS = {
  todo:        { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
  in_progress: { background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a" },
  done:        { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
};

const s = {
  form:        { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  formTitle:   { fontWeight: "700", fontSize: "1rem", color: "#0f172a", marginBottom: "0.25rem" },
  filters:     { display: "flex", flexWrap: "wrap", gap: "1.25rem", marginBottom: "1.25rem", alignItems: "center" },
  filterGroup: { display: "flex", alignItems: "center", gap: "0.4rem" },
  filterLabel: { fontSize: "0.78rem", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.25rem" },
  chip:        { padding: "0.3rem 0.75rem", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "0.8rem", cursor: "pointer", fontWeight: "500", transition: "all 0.15s" },
  chipActive:  { background: "#2a9d8f", color: "#fff", border: "1px solid #2a9d8f" },
  list:        { display: "flex", flexDirection: "column", gap: "0.75rem" },
  taskHead:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  taskTitle:   { fontWeight: "700", fontSize: "0.95rem", color: "#0f172a" },
  taskDesc:    { fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" },
  taskMeta:    { display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.75rem", alignItems: "center" },
  statusSelect:{ padding: "0.4rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", outline: "none", flexShrink: 0 },
};
