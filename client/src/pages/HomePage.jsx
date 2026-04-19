import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper" style={{ maxWidth: 560, paddingTop: "4rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑</div>
          <h1>BinFlow</h1>
          <p style={{ margin: "0.75rem 0 2rem", fontSize: "1.05rem" }}>
            Report garbage issues and track resolution status in your area.
          </p>
          <div className="flex flex-center gap-md">
            <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
        <p>Signed in as <strong>{user?.email}</strong> · Role: <strong>{user?.role}</strong></p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">—</div>
          <div className="stat-card-label">Total Submitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">—</div>
          <div className="stat-card-label">Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">—</div>
          <div className="stat-card-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">—</div>
          <div className="stat-card-label">Resolved</div>
        </div>
      </div>

      <div className="section-header">
        <h3>Quick actions</h3>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link to="/complaints/new" className="btn btn-primary">📸 Report Issue</Link>
        <Link to="/complaints/my" className="btn btn-secondary">📋 View My Complaints</Link>
      </div>
    </div>
  );
}