import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getMyComplaints } from "../services/complaints";
import api from "../services/api";
import CitizenShell from "../components/citizen/CitizenShell";
import AnimatedCard from "../components/citizen/AnimatedCard";
import { StaggerGrid } from "../components/citizen/AnimatedCard";
import AnimatedCounter from "../components/citizen/AnimatedCounter";

const citizenStats = [
  { key: "total", label: "Total Submitted", icon: "📋", accent: "#6b7280" },
  { key: "open", label: "Open", icon: "🔴", accent: "#ef4444" },
  { key: "inProgress", label: "In Progress", icon: "🚛", accent: "#f59e0b" },
  { key: "resolved", label: "Resolved", icon: "✅", accent: "#16a34a" },
];

const workerStats = [
  { key: "total", label: "Active Jobs", icon: "📋", accent: "#6b7280" },
  { key: "assigned", label: "Assigned", icon: "🚛", accent: "#3b82f6" },
  { key: "in_progress", label: "In Progress", icon: "⚙️", accent: "#f59e0b" },
];

const adminStats = [
  { key: "total", label: "Total", icon: "📊", accent: "#6b7280" },
  { key: "reported", label: "Reported", icon: "🔴", accent: "#ef4444" },
  { key: "assigned", label: "Assigned", icon: "🔵", accent: "#3b82f6" },
  { key: "in_progress", label: "In Progress", icon: "🚛", accent: "#f59e0b" },
  { key: "resolved", label: "Resolved", icon: "✅", accent: "#16a34a" },
  { key: "closed", label: "Closed", icon: "🔒", accent: "#374151" },
];

function CitizenDashboard({ user, stats, loading, dispatched }) {
  return (
    <CitizenShell>
      <motion.div
        className="page-header page-header-dashboard"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
        <p>
          <span className="stat-live-dot" />
          Track your reported issues and resolution status in real time.
        </p>
      </motion.div>

      {dispatched.length > 0 && (
        <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
          {dispatched.map((c) => (
            <motion.div
              key={c._id}
              className="dispatch-banner"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="dispatch-truck-icon">🚛</span>
              <div className="dispatch-banner-content">
                <div className="dispatch-banner-title">Truck dispatched for: {c.title}</div>
                <div className="dispatch-banner-sub">{c.dispatchNote}</div>
              </div>
              {c.estimatedArrival && <span className="dispatch-eta">ETA {c.estimatedArrival}</span>}
            </motion.div>
          ))}
        </div>
      )}

      <StaggerGrid className="stats-grid citizen-stat-grid">
        {citizenStats.map((s, i) => (
          <AnimatedCard key={s.key} className="stat-card" delay={i * 0.06} hover>
            <div className="stat-card-accent" style={{ background: s.accent }} />
            <span className="stat-card-icon">{s.icon}</span>
            <div className="stat-card-value">
              {loading ? (
                <div className="skeleton" style={{ width: 48, height: 36, borderRadius: 6 }} />
              ) : (
                <AnimatedCounter value={stats[s.key] ?? 0} />
              )}
            </div>
            <div className="stat-card-label">{s.label}</div>
          </AnimatedCard>
        ))}
      </StaggerGrid>

      <div className="section-header">
        <h3>Quick actions</h3>
      </div>
      <div className="citizen-action-grid">
        <motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
          <Link to="/complaints/new" className="citizen-action-card">
            <span className="citizen-action-card-icon">🚨</span>
            <div>
              <strong>Report Issue</strong>
              <span>Photo + GPS pin</span>
            </div>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
          <Link to="/complaints/my" className="citizen-action-card">
            <span className="citizen-action-card-icon">📋</span>
            <div>
              <strong>My Complaints</strong>
              <span>Track every status</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </CitizenShell>
  );
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dispatched, setDispatched] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadStats() {
      try {
        if (user?.role === "admin") {
          const res = await api.get("/admin/stats");
          if (res.data?.success) setStats(res.data.data);
        } else if (user?.role === "worker") {
          const res = await api.get("/complaints/assigned");
          if (res.data?.success) {
            const items = res.data.data.items || [];
            setStats({
              total: items.length,
              assigned: items.filter((i) => i.status === "assigned").length,
              in_progress: items.filter((i) => i.status === "in_progress").length,
            });
          }
        } else {
          const res = await getMyComplaints();
          if (res?.success) {
            const items = res.data.items || [];
            setStats({
              total: items.length,
              open: items.filter((i) => i.status === "reported").length,
              inProgress: items.filter((i) => i.status === "in_progress").length,
              resolved: items.filter((i) => i.status === "resolved").length,
            });
            setDispatched(items.filter((i) => i.status === "assigned" && i.dispatchNote));
          }
        }
      } catch (_) {}
      finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <section className="hero-landing">
        <div className="hero-landing-inner animate-slide-up">
          <div className="hero-icon-float" aria-hidden>
            🗑️
          </div>
          <p className="hero-eyebrow">Civic waste intelligence</p>
          <h1 className="hero-title">
            Waste complaints,
            <br />
            <span className="text-gradient">handled smartly.</span>
          </h1>
          <p className="hero-subtitle">
            Report garbage issues in your area and track resolution in real time.
          </p>
          <div className="hero-cta-row">
            <Link to="/register" className="btn btn-primary btn-lg btn-glow">
              Get started free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
          <div className="hero-features stagger">
            <span className="hero-feature-pill">📍 GPS pinning</span>
            <span className="hero-feature-pill">🚛 Live dispatch</span>
            <span className="hero-feature-pill">📊 Admin analytics</span>
          </div>
        </div>
      </section>
    );
  }

  if (user?.role === "citizen") {
    return <CitizenDashboard user={user} stats={stats} loading={loading} dispatched={dispatched} />;
  }

  const statDefs = user?.role === "admin" ? adminStats : workerStats;

  return (
    <div className="page-wrapper">
      <div className="page-header page-header-dashboard animate-fade-in">
        <h2 className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
        <p>
          {user?.role === "admin"
            ? "Here's an overview of all complaints across the city."
            : "Your dispatched jobs and field progress at a glance."}
        </p>
      </div>

      <div className="stats-grid stagger">
        {statDefs.map((s) => (
          <div key={s.key} className="stat-card animate-slide-up">
            <div className="stat-card-accent" style={{ background: s.accent }} />
            <span className="stat-card-icon">{s.icon}</span>
            <div className="stat-card-value">{loading ? "—" : stats[s.key] ?? 0}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h3>Quick actions</h3>
      </div>
      <div className="quick-actions-row">
        {user?.role === "worker" ? (
          <Link to="/worker" className="btn btn-primary">
            🚛 Open My Queue
          </Link>
        ) : (
          <>
            <Link to="/admin/complaints" className="btn btn-primary">
              📋 All Complaints
            </Link>
            <Link to="/admin/map" className="btn btn-secondary">
              🗺️ Map View
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
