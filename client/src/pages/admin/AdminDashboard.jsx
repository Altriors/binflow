import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../services/api";
import toast from "react-hot-toast";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 25));
    const t = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <>{display}</>;
}

const STAT_DEFS = [
  { key: "total",       label: "Total",       icon: "📊", accent: "#6b7280" },
  { key: "reported",    label: "Reported",    icon: "🔴", accent: "#ef4444" },
  { key: "assigned",    label: "Assigned",    icon: "🚛", accent: "#3b82f6" },
  { key: "in_progress", label: "In Progress", icon: "⚙️", accent: "#f59e0b" },
  { key: "resolved",    label: "Resolved",    icon: "✅", accent: "#16a34a" },
  { key: "closed",      label: "Closed",      icon: "🔒", accent: "#374151" },
];

const PIE_COLORS = ["#ef4444","#f59e0b","#16a34a","#3b82f6","#6b7280"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, t, c] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/trends"),
          api.get("/admin/categories"),
        ]);
        if (s.data?.success) setStats(s.data.data);
        if (t.data?.success) setTrends(t.data.data);
        if (c.data?.success) setCategories(c.data.data);
      } catch {
        toast.error("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-header animate-fade-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2>Admin Dashboard</h2>
          <p>Real-time overview of all complaints across the city.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/admin/complaints" className="btn btn-primary btn-sm">View All Complaints</Link>
          <Link to="/admin/map" className="btn btn-secondary btn-sm">🗺️ Map View</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid stagger">
        {STAT_DEFS.map(s => (
          <div key={s.key} className="stat-card animate-slide-up">
            <div className="stat-card-accent" style={{ background: s.accent }} />
            <span className="stat-card-icon">{s.icon}</span>
            <div className="stat-card-value">
              {loading
                ? <div className="skeleton" style={{ width: 48, height: 36, borderRadius: 6 }} />
                : <AnimatedNumber value={stats[s.key] ?? 0} />}
            </div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1rem", marginBottom: "1.5rem" }}
        className="animate-fade-in">

        {/* Trend chart */}
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem" }}>Complaints — last 30 days</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2}
                  fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category pie */}
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem" }}>By category</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categories} dataKey="count" nameKey="category"
                  cx="50%" cy="50%" outerRadius={75} label={({ category }) => category?.replace(/_/g," ")}>
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="card animate-fade-in">
        <h3 style={{ marginBottom: "1rem" }}>Quick actions</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/admin/complaints?status=reported" className="btn btn-secondary btn-sm">
            🔴 View Reported
          </Link>
          <Link to="/admin/complaints?status=assigned" className="btn btn-secondary btn-sm">
            🚛 View Assigned
          </Link>
          <Link to="/admin/complaints?status=in_progress" className="btn btn-secondary btn-sm">
            ⚙️ In Progress
          </Link>
          <Link to="/admin/map" className="btn btn-secondary btn-sm">
            🗺️ Map Intelligence
          </Link>
        </div>
      </div>
    </div>
  );
}