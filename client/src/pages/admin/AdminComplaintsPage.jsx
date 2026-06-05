import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../context/ThemeContext";
import { ClipboardList, Filter } from "lucide-react";

function formatDate(v) {
  if (!v) return "-";
  return new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function AdminComplaintsPage() {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const filters = {
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    ward: searchParams.get("ward") || "",
  };

  useEffect(() => {
    load();
  }, [searchParams, page]);

  async function load() {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.ward) params.ward = filters.ward;
      const res = await api.get("/complaints", { params });
      if (res.data?.success) {
        setItems(res.data.data.items || []);
        setTotal(res.data.data.total || 0);
      }
    } catch {
      toast.error("Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-emerald-500" size={22} />
            All Complaints
          </h2>
          <p className="text-xs text-gray-500">{total} total complaints reported</p>
        </div>
        <Link 
          to="/admin" 
          className={`flex items-center gap-1.5 rounded-xl border font-bold text-xs px-4 py-2.5 hover:-translate-y-0.5 transition-all cursor-pointer
            ${theme === "dark"
              ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
              : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
            }
          `}
        >
          ← Dashboard
        </Link>
      </div>

      {/* Filters Bar */}
      <div className={`p-4 rounded-2xl border shadow-sm transition-colors duration-300
        ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
      `}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mr-1 font-bold uppercase tracking-wider shrink-0">
            <Filter size={14} /> Filter:
          </div>

          <select 
            value={filters.status} 
            onChange={e => setFilter("status", e.target.value)}
            className={`border rounded-xl py-2 px-3.5 text-xs outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:10px] min-w-[130px] pr-8
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%234b5563%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
              }
            `}
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select 
            value={filters.category} 
            onChange={e => setFilter("category", e.target.value)}
            className={`border rounded-xl py-2 px-3.5 text-xs outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:10px] min-w-[150px] pr-8
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%234b5563%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
              }
            `}
          >
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <input 
            placeholder="Ward / Zone" 
            value={filters.ward}
            onChange={e => setFilter("ward", e.target.value)}
            className={`border rounded-xl py-2 px-3 text-xs outline-none transition-all max-w-[120px]
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              }
            `}
          />

          {(filters.status || filters.category || filters.ward) && (
            <button 
              onClick={() => { setSearchParams({}); setPage(1); }}
              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer shrink-0"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="p-4 space-y-4 rounded-2xl border border-slate-200 dark:border-[#172026] animate-pulse">
          <div className="h-10 bg-slate-800/10 dark:bg-slate-800/40 rounded-xl" />
          <div className="h-10 bg-slate-800/10 dark:bg-slate-800/40 rounded-xl" />
        </div>
      ) : items.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed
          ${theme === "dark" 
            ? "border-[#1e293b] bg-slate-900/10" 
            : "border-slate-300 bg-slate-50/50"
          }
        `}>
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 animate-pulse">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No complaints found</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
            Try adjusting your status, category, or ward filters.
          </p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-colors duration-300
          ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
        `}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#111827]/40 border-b border-slate-200 dark:border-[#172026]">
                <tr>
                  {["Title", "Category", "Status", "Priority", "Reported By", "Date", "Action"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr 
                    key={item._id}
                    className="border-b last:border-0 transition-colors border-slate-200 dark:border-[#172026]/40 hover:bg-slate-50/50 dark:hover:bg-[#121b22]"
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-1 h-8 rounded shrink-0
                          ${item.status === "reported" ? "bg-red-500"
                            : item.status === "assigned" ? "bg-blue-500"
                            : item.status === "in_progress" ? "bg-amber-500"
                            : item.status === "resolved" ? "bg-emerald-500" : "bg-gray-500"
                          }
                        `} />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {categoryLabels[item.category] || item.category}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={item.priority} type="priority" />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {item.userId?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link 
                        to={`/admin/complaints/${item._id}`} 
                        className="inline-flex items-center gap-1 hover:gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {total > 20 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-[#172026]">
              <span className="text-[10px] text-gray-500 font-semibold">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
                      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }
                  `}
                >
                  ← Prev
                </button>
                <button 
                  disabled={page * 20 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
                      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }
                  `}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}