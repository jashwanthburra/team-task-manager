import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Card, Button, Input, Select, PageHeader, Badge, Alert } from "../components/UI";

const PRIORITY_BADGE = { low: "green", medium: "yellow", high: "red" };

export default function ProjectsPage() {
  const [projects, setProjects]       = useState([]);
  const [allUsers, setAllUsers]       = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [expandedId, setExpandedId]   = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [memberMsg, setMemberMsg]     = useState({ id: null, text: "", ok: false });
  const [error, setError]             = useState("");
  const [form, setForm]               = useState({ name: "", description: "", priority_level: "medium" });

  const fetchProjects = () =>
    api.get("/projects/").then((r) => setProjects(r.data)).catch(() => {});

  useEffect(() => {
    fetchProjects();
    api.get("/admin/users").then((r) => {
      setAllUsers(r.data);
    }).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError("");
    try {
      await api.post("/projects/", form);
      setForm({ name: "", description: "", priority_level: "medium" });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : JSON.stringify(d) || "Failed to create project");
    }
  };

  const handleAddMember = async (projectId) => {
    if (!selectedUser) return;
    try {
      await api.post(`/projects/${projectId}/members`, { member_ids: [selectedUser] });
      setMemberMsg({ id: projectId, text: "Member added successfully", ok: true });
      setSelectedUser("");
      fetchProjects();
    } catch (err) {
      const d = err.response?.data?.detail;
      setMemberMsg({ id: projectId, text: typeof d === "string" ? d : "Failed to add member", ok: false });
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={() => { setShowForm(!showForm); setError(""); }}>
            {showForm ? "✕ Cancel" : "+ New Project"}
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <Card style={{ marginBottom: "1.5rem", maxWidth: "480px" }}>
          <p style={s.formTitle}>New Project</p>
          <Alert message={error} />
          <form onSubmit={handleCreate} style={s.form}>
            <Input label="Project Name" placeholder="e.g. Website Redesign"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Description" placeholder="What is this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select label="Priority" value={form.priority_level}
              onChange={(e) => setForm({ ...form, priority_level: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Button type="submit" style={{ alignSelf: "flex-start" }}>Create Project</Button>
          </form>
        </Card>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <p style={{ fontSize: "2rem" }}>◫</p>
          <p style={{ fontWeight: "600", marginTop: "0.5rem" }}>No projects yet</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Create your first project to get started</p>
        </Card>
      ) : (
        <div style={s.grid}>
          {projects.map((p) => (
            <Card key={p.id} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Header */}
              <div style={s.cardHead}>
                <div style={s.projectIcon}>{p.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={s.projectName}>{p.name}</p>
                  <Badge color={PRIORITY_BADGE[p.priority_level]}>{p.priority_level} priority</Badge>
                </div>
              </div>

              {p.description && <p style={s.desc}>{p.description}</p>}

              <div style={s.meta}>
                <span style={s.metaItem}>👥 {p.member_ids?.length ?? 0} member{p.member_ids?.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Add member (admin only) */}
              {allUsers.length > 0 && (
                <>
                  <div style={s.divider} />
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => {
                      setExpandedId(expandedId === p.id ? null : p.id);
                      setMemberMsg({ id: null, text: "", ok: false });
                      setSelectedUser("");
                    }}
                  >
                    {expandedId === p.id ? "✕ Close" : "+ Add Member"}
                  </Button>

                  {expandedId === p.id && (
                    <div style={s.memberPanel}>
                      <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        <option value="">Select a team member…</option>
                        {allUsers
                          .filter((u) => u.id !== p.owner_id && !p.member_ids?.includes(u.id))
                          .map((u) => (
                            <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                          ))}
                      </Select>
                      <Button size="sm" onClick={() => handleAddMember(p.id)} disabled={!selectedUser}>
                        Add to Project
                      </Button>
                      {memberMsg.id === p.id && memberMsg.text && (
                        <Alert message={memberMsg.text} type={memberMsg.ok ? "success" : "error"} />
                      )}
                    </div>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

const s = {
  form:        { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  formTitle:   { fontWeight: "700", fontSize: "1rem", color: "#0f172a", marginBottom: "0.25rem" },
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" },
  cardHead:    { display: "flex", alignItems: "flex-start", gap: "0.75rem" },
  projectIcon: { width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#2a9d8f,#00d4c8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "1.1rem", flexShrink: 0 },
  projectName: { fontWeight: "700", fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  desc:        { fontSize: "0.85rem", color: "#64748b", lineHeight: "1.5" },
  meta:        { display: "flex", gap: "1rem" },
  metaItem:    { fontSize: "0.8rem", color: "#94a3b8" },
  divider:     { height: "1px", background: "#f1f5f9" },
  memberPanel: { display: "flex", flexDirection: "column", gap: "0.75rem" },
};
