import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyComplaints } from "../services/complaints";
import api from "../services/api";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

const citizenStats = [
  { key: "total", label: "Total Submitted", icon: "📋", accent: "#6b7280" },
  { key: "open",  label: "Open",            icon: "🔴", accent: "#ef4444" },
  { key: "inProgress", label: "In Progress", icon: "🚛", accent: "#f59e0b" },
  { key: "resolved",   label: "Resolved",    icon: "✅", accent: "#16a34a" },
];

const adminStats = [
  { key: "total",       label: "Total",       icon: "📊", accent: "#6b7280" },
  { key: "reported",    label: "Reported",    icon: "🔴", accent: "#ef4444" },
  { key: "assigned",    label: "Assigned",    icon: "🔵", accent: "#3b82f6" },
  { key: "in_progress", label: "In Progress", icon: "🚛", accent: "#f59e0b" },
  { key: "resolved",    label: "Resolved",    icon: "✅", accent: "#16a34a" },
  { key: "closed",      label: "Closed",      icon: "🔒", accent: "#374151" },
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dispatched, setDispatched] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }

    async function loadStats() {
      try {
        if (user?.role === "admin") {
          const res = await api.get("/admin/stats");
          if (res.data?.success) setStats(res.data.data);
        } else {
          const res = await getMyComplaints();
          if (res?.success) {
            const items = res.data.items || [];
            const counts = {
              total: items.length,
              open: items.filter(i => i.status === "reported").length,
              inProgress: items.filter(i => i.status === "in_progress").length,
              resolved: items.filter(i => i.status === "resolved").length,
            };
            setStats(counts);
            // find dispatched complaints for the truck banner
            const active = items.filter(i => i.status === "assigned" && i.dispatchNote);
            setDispatched(active);
          }
        }
      } catch (_) {}
      finally { setLoading(false); }
    }
    loadStats();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 520, animation: "slideUp 0.5s ease both" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🗑️</div>
          <h1 style={{ marginBottom: "0.75rem" }}>
            Waste complaints,<br />handled smartly.
          </h1>
          <p style={{ fontSize: "1.05rem", marginBottom: "2rem", maxWidth: 380, margin: "0 auto 2rem" }}>
            Report garbage issues in your area and track resolution in real time.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn btn-primary btn-lg">Get started free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const statDefs = user?.role === "admin" ? adminStats : citizenStats;

  return (
    <div className="page-wrapper">
      <div className="page-header animate-fade-in">
        <h2>Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
        <p>
          {user?.role === "admin"
            ? "Here's an overview of all complaints across the city."
            : "Track your reported issues and their resolution status."}
        </p>
      </div>

      {/* Dispatch truck banner for citizens with assigned complaints */}
      {dispatched.length > 0 && (
        <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
          {dispatched.map(c => (
            <div key={c._id} className="dispatch-banner animate-fade-in">
              <span className="dispatch-truck-icon">🚛</span>
              <div className="dispatch-banner-content">
                <div className="dispatch-banner-title">Truck dispatched for: {c.title}</div>
                <div className="dispatch-banner-sub">{c.dispatchNote}</div>
              </div>
              {c.estimatedArrival && (
                <span className="dispatch-eta">ETA {c.estimatedArrival}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid stagger">
        {statDefs.map((s) => (
          <div key={s.key} className="stat-card animate-slide-up">
            <div className="stat-card-accent" style={{ background: s.accent }} />
            <span className="stat-card-icon">{s.icon}</span>
            <div className="stat-card-value">
              {loading ? (
                <div className="skeleton" style={{ width: 48, height: 36, borderRadius: 6 }} />
              ) : (
                <AnimatedNumber value={stats[s.key] ?? 0} />
              )}
            </div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="section-header">
        <h3>Quick actions</h3>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {user?.role === "citizen" ? (
          <>
            <Link to="/complaints/new" className="btn btn-primary">🚨 Report Issue</Link>
            <Link to="/complaints/my" className="btn btn-secondary">📋 My Complaints</Link>
          </>
        ) : (
          <>
            <Link to="/admin/complaints" className="btn btn-primary">📋 All Complaints</Link>
            <Link to="/admin/map" className="btn btn-secondary">🗺️ Map View</Link>
          </>
        )}
      </div>
    </div>
  );
}