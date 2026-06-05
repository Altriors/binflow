import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { 
  BarChart3, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  Lock, 
  Eye, 
  List, 
  Map, 
  ShieldAlert
} from "lucide-react";

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
  { key: "total",       label: "Total Tickets",  icon: BarChart3,    color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  { key: "reported",    label: "Reported",       icon: AlertTriangle, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { key: "assigned",    label: "Assigned",       icon: Truck,         color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { key: "in_progress", label: "In Progress",    icon: ShieldAlert,   color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { key: "resolved",    label: "Resolved",       icon: CheckCircle2,  color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { key: "closed",      label: "Closed",         icon: Lock,          color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
];

const PIE_COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#6b7280"];

export default function AdminDashboard() {
  const { theme } = useTheme();
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
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-500" size={22} />
            Admin Command Dashboard
          </h2>
          <p className="text-xs text-gray-500">
            Real-time overview of all waste complaints across the city.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link 
            to="/admin/complaints" 
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <List size={14} /> View Complaints
          </Link>
          <Link 
            to="/admin/map" 
            className={`flex items-center gap-1.5 rounded-xl border font-bold text-xs px-4 py-2.5 hover:-translate-y-0.5 transition-all cursor-pointer
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
                : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
              }
            `}
          >
            <Map size={14} /> Map Intelligence
          </Link>
        </div>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {STAT_DEFS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28
                ${theme === "dark"
                  ? "bg-[#0e141a] border-[#172026] hover:border-slate-800"
                  : "bg-white border-slate-200 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider leading-none">
                  {s.label}
                </span>
                <span className={`p-1.5 rounded-lg border shrink-0 ${s.color}`}>
                  <Icon size={12} />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-2">
                {loading ? (
                  <span className="block h-6 w-12 bg-slate-800/10 dark:bg-slate-800/40 rounded animate-pulse" />
                ) : (
                  <AnimatedNumber value={stats[s.key] ?? 0} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Left 2/3) */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border transition-all
          ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
        `}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-5">
            Complaints (Last 30 Days)
          </h3>
          {loading ? (
            <div className="h-[200px] w-full bg-slate-800/10 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9, fill: "#6b7280" }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.slice(5)} 
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: "#6b7280" }} 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 11, 
                    borderRadius: 12, 
                    background: theme === "dark" ? "#0e141a" : "#fff",
                    borderColor: theme === "dark" ? "#172026" : "#e2e8f0",
                    color: theme === "dark" ? "#fff" : "#0f172a"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#trendGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie (Right 1/3) */}
        <div className={`p-5 rounded-2xl border transition-all
          ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
        `}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-5">
            By Category
          </h3>
          {loading ? (
            <div className="h-[200px] w-full bg-slate-800/10 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie 
                  data={categories} 
                  dataKey="count" 
                  nameKey="category"
                  cx="50%" 
                  cy="50%" 
                  outerRadius={70} 
                  label={({ category }) => category?.replace(/_/g," ")}
                  labelLine={false}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 11, 
                    borderRadius: 12, 
                    background: theme === "dark" ? "#0e141a" : "#fff",
                    borderColor: theme === "dark" ? "#172026" : "#e2e8f0",
                    color: theme === "dark" ? "#fff" : "#0f172a"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className={`p-6 rounded-2xl border transition-all
        ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
      `}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/admin/complaints?status=reported" 
            className="flex items-center gap-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-all bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
          >
            🔴 View Reported
          </Link>
          <Link 
            to="/admin/complaints?status=assigned" 
            className="flex items-center gap-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-all bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white"
          >
            🚛 View Assigned
          </Link>
          <Link 
            to="/admin/complaints?status=in_progress" 
            className="flex items-center gap-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-all bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
          >
            ⚙️ In Progress
          </Link>
          <Link 
            to="/admin/map" 
            className="flex items-center gap-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-all bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
          >
            🗺️ Map Intelligence
          </Link>
        </div>
      </div>
    </div>
  );
}