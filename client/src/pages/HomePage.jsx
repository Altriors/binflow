import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getMyComplaints } from "../services/complaints";
import api from "../services/api";
import {
  Recycle,
  Trash2,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Truck,
  PlusCircle,
  ArrowRight,
  MapPin,
  TrendingUp,
  BarChart3,
  List,
  Map
} from "lucide-react";

// Citizen Dashboard component redesign matching Screenshot 1
function CitizenDashboard({ user, stats, loading, dispatched }) {
  const { theme } = useTheme();
  
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 relative overflow-hidden
          ${theme === "dark"
            ? "bg-[#0e141a] border-[#172026]"
            : "bg-white border-slate-200"
          }
        `}
      >
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Your collection & complaint overview. Track reported issues in real-time.
          </p>
        </div>
      </motion.div>

      {/* Dispatched Truck Alerts */}
      {dispatched.length > 0 && (
        <div className="space-y-3">
          {dispatched.map((c) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500"
            >
              <div className="flex items-center gap-3">
                <Truck className="animate-bounce" size={20} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Truck dispatched: {c.title}</span>
                  <span className="text-[10px] text-amber-500/80">{c.dispatchNote}</span>
                </div>
              </div>
              {c.estimatedArrival && (
                <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                  ETA {c.estimatedArrival}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* KPI Stats Widgets (Lovable inspired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "open", label: "Open Tickets", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { key: "resolved", label: "Resolved (30D)", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { key: "inProgress", label: "In Progress", icon: Truck, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { key: "total", label: "Total Reported", icon: ClipboardList, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28
                ${theme === "dark" 
                  ? "bg-[#0e141a] border-[#172026] hover:border-slate-800" 
                  : "bg-white border-slate-200 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</span>
                <span className={`p-1.5 rounded-lg border ${s.color}`}>
                  <Icon size={14} />
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {loading ? "..." : stats[s.key] ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Quick actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/complaints/new"
            className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-200
              ${theme === "dark" 
                ? "bg-[#0e141a] border-[#172026] hover:bg-[#121a22] hover:border-slate-800" 
                : "bg-white border-slate-200 hover:shadow-md"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <PlusCircle size={20} />
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-slate-900 dark:text-white">Report New Issue</strong>
                <span className="text-xs text-gray-500 mt-0.5">Upload a photo & pin coordinates</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/complaints/my"
            className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-200
              ${theme === "dark" 
                ? "bg-[#0e141a] border-[#172026] hover:bg-[#121a22] hover:border-slate-800" 
                : "bg-white border-slate-200 hover:shadow-md"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ClipboardList size={20} />
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-slate-900 dark:text-white">Track Complaints</strong>
                <span className="text-xs text-gray-500 mt-0.5">Check real-time status updates</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
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

  // Unauthenticated Landing Screen (Modern SaaS Style)
  if (!isAuthenticated) {
    return (
      <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center p-6 overflow-hidden">
        {/* Background ambient glowing blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 15, 0],
              y: [0, -15, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -15, 0],
              y: [0, 15, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[120px]"
          />
        </div>

        <div className="max-w-xl text-center space-y-6 animate-slide-up z-10 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/20 mx-auto animate-bounce mb-2">
            <Recycle className="text-white" size={24} />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 block">
              Civic Waste Intelligence Platform
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Waste complaints, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500">
                handled smartly.
              </span>
            </h1>
          </div>

          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Report overflowing bins, missed pickups, and civic waste issues instantly. Pin locations, upload photo evidence, and track dispatch status in real-time.
          </p>

          <div className="flex flex-wrap gap-3 justify-center items-center">
            <Link
              to="/register"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-3 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              Get started free <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className={`rounded-xl border font-bold text-xs px-5 py-3 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer
                ${theme === "dark"
                  ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
                  : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                }
              `}
            >
              Sign in
            </Link>
          </div>

          <div className="flex justify-center items-center flex-wrap gap-2.5 pt-6 border-t border-inherit">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-gray-400"
                : "bg-slate-100 border-slate-200 text-slate-600"
              }
            `}>
              📍 GPS Coordinates
            </span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-gray-400"
                : "bg-slate-100 border-slate-200 text-slate-600"
              }
            `}>
              🚛 Real-time Dispatch
            </span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-gray-400"
                : "bg-slate-100 border-slate-200 text-slate-600"
              }
            `}>
              📊 City Analytics
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Citizen Dashboard View
  if (user?.role === "citizen") {
    return <CitizenDashboard user={user} stats={stats} loading={loading} dispatched={dispatched} />;
  }

  // Admin / Worker Dashboard View (Modernized)
  const isWorker = user?.role === "worker";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-2xl border transition-all duration-300
        ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
      `}>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isWorker
            ? "Your dispatched jobs and field progress at a glance."
            : "City waste metrics, routes, and complaint tracking dashboard."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isWorker ? (
          <>
            {[
              { key: "total", label: "Active Jobs", icon: Truck, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { key: "assigned", label: "Assigned Jobs", icon: ClipboardList, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { key: "in_progress", label: "In Progress", icon: Recycle, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between h-28
                    ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</span>
                    <span className={`p-1.5 rounded-lg border ${s.color}`}>
                      <Icon size={14} />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {loading ? "..." : stats[s.key] ?? 0}
                  </span>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {[
              { key: "total", label: "Total Complaints", icon: ClipboardList, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
              { key: "reported", label: "Reported Issues", icon: AlertTriangle, color: "text-red-500 bg-red-500/10 border-red-500/20" },
              { key: "assigned", label: "Assigned Bins", icon: BlueIcon, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { key: "in_progress", label: "Dispatch Route", icon: Truck, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { key: "resolved", label: "Resolved Today", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" }
            ].map((s) => {
              // Custom blue fallback icon or standard Lucide icon
              const Icon = s.key === "assigned" ? Truck : s.icon;
              return (
                <div
                  key={s.key}
                  className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between h-28
                    ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</span>
                    <span className={`p-1.5 rounded-lg border ${s.color}`}>
                      <Icon size={14} />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {loading ? "..." : stats[s.key] ?? 0}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          {isWorker ? (
            <button
              onClick={() => navigate("/worker")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Truck size={14} /> Open My Queue
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/admin/complaints")}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <List size={14} /> All Complaints
              </button>
              <button
                onClick={() => navigate("/admin/map")}
                className={`flex items-center gap-1.5 rounded-xl border font-bold text-xs px-4 py-2.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
                    : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                <Map size={14} /> Map Intelligence
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
