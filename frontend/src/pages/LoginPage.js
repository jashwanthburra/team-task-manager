import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button, Alert } from "../components/UI";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        const d = err.response.data?.detail;
        setError(typeof d === "string" ? d : JSON.stringify(d));
      } else if (err.request) {
        setError("Cannot reach server. Is the backend running on port 8000?");
      } else { setError(err.message); }
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>⬡ Task Manager</div>
        <h1 style={s.headline}>Manage your team,<br />track every task.</h1>
        <p style={s.sub}>Role-based project management built for modern teams.</p>
        <div style={s.dots}>
          <span style={s.dot} /><span style={{ ...s.dot, opacity: 0.5 }} /><span style={{ ...s.dot, opacity: 0.3 }} />
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardTop}>
            <h2 style={s.title}>Welcome back</h2>
            <p style={s.hint}>Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} style={s.form}>
            <Alert message={error} />
            <Input label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </Button>
          </form>
          <p style={s.footer}>Don't have an account? <Link to="/signup">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:    { display: "flex", minHeight: "100vh" },
  left:    { flex: 1, background: "linear-gradient(160deg, #1a2332 0%, #2a9d8f 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem", color: "#fff" },
  brand:   { fontSize: "1.3rem", fontWeight: "800", color: "#00d4c8", marginBottom: "3rem" },
  headline:{ fontSize: "2.6rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "1rem" },
  sub:     { color: "#b2deda", fontSize: "1rem", maxWidth: "320px", lineHeight: "1.6" },
  dots:    { display: "flex", gap: "0.5rem", marginTop: "3rem" },
  dot:     { width: "10px", height: "10px", borderRadius: "50%", background: "#00d4c8" },
  right:   { width: "460px", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#f4fafa" },
  card:    { background: "#fff", borderRadius: "16px", padding: "2.5rem", width: "100%", boxShadow: "0 4px 24px rgba(26,35,50,0.1)", border: "1px solid #d0ecea" },
  cardTop: { marginBottom: "1.75rem" },
  title:   { fontSize: "1.5rem", fontWeight: "700", color: "#1a2332" },
  hint:    { color: "#5a7a78", fontSize: "0.9rem", marginTop: "0.25rem" },
  form:    { display: "flex", flexDirection: "column", gap: "1rem" },
  footer:  { textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#5a7a78" },
};
