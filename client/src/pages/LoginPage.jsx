import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (!result.ok) return;
    navigate(location.state?.from?.pathname || "/", { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your BinFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label required" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              required autoComplete="current-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}
            style={{ marginTop: "0.25rem" }}>
            {submitting ? <><span className="btn-spinner" /> Signing in...</> : "Sign In →"}
          </button>
        </form>

        <p className="auth-footer">
          New to BinFlow? <Link to="/register">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}