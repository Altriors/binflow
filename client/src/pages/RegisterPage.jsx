import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", ward: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.ok) navigate("/", { replace: true });
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
          <h1>Create account</h1>
          <p>Join BinFlow and report waste issues</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label required" htmlFor="name">Full Name</label>
            <input id="name" type="text" className="form-input" placeholder="Ravi Kumar"
              value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 6 characters"
              minLength={6} value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input id="phone" type="text" className="form-input" placeholder="Optional"
                value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ward">Ward / Zone</label>
              <input id="ward" type="text" className="form-input" placeholder="Optional"
                value={form.ward} onChange={(e) => setForm(p => ({ ...p, ward: e.target.value }))} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}
            style={{ marginTop: "0.25rem" }}>
            {submitting ? <><span className="btn-spinner" /> Creating account...</> : "Create Account →"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}