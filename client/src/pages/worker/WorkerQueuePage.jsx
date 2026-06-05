import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { parseCoords, googleMapsDirectionsUrl } from "../../components/ComplaintMap";
import { useTheme } from "../../context/ThemeContext";
import { 
  ClipboardList, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  CheckCircle2, 
  Truck,
  AlertCircle
} from "lucide-react";

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function WorkerQueuePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/complaints/assigned");
        if (res.data?.success) setItems(res.data.data.items || []);
      } catch {
        toast.error("Could not load your queue.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4 max-w-5xl mx-auto w-full">
        <div className="h-16 bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse w-1/3" />
        <div className="grid gap-4 mt-6">
          <div className="h-28 bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Filter tasks into Active (assigned, in_progress) and Completed (resolved, closed)
  const activeJobs = items.filter(item => ["assigned", "in_progress"].includes(item.status));
  const completedJobs = items.filter(item => ["resolved", "closed"].includes(item.status));

  // Count metrics for worker KPIs
  const activeCount = activeJobs.length;
  const inProgressCount = activeJobs.filter(item => item.status === "in_progress").length;
  const completedCount = completedJobs.length;

  const displayItems = activeTab === "active" ? activeJobs : completedJobs;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header and KPI summary row */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="text-emerald-500" size={22} />
          My Dispatch Assignments
        </h2>
        <p className="text-xs text-gray-500">
          Real-time field worker route and complaint resolution queue
        </p>
      </div>

      {/* Mini KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors
          ${theme === "dark" 
            ? "bg-[#0e141a]/60 border-[#172026]" 
            : "bg-white border-slate-200"
          }
        `}>
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active Jobs</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeCount}</span>
        </div>
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors
          ${theme === "dark" 
            ? "bg-[#0e141a]/60 border-[#172026]" 
            : "bg-white border-slate-200"
          }
        `}>
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">In Progress</span>
          <span className="text-2xl font-black text-amber-500 mt-1">{inProgressCount}</span>
        </div>
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors
          ${theme === "dark" 
            ? "bg-[#0e141a]/60 border-[#172026]" 
            : "bg-white border-slate-200"
          }
        `}>
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Completed Work</span>
          <span className="text-2xl font-black text-emerald-500 mt-1">{completedCount}</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-[#172026] gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer
            ${activeTab === "active"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-gray-500 hover:text-slate-800 dark:hover:text-white"
            }
          `}
        >
          Active Assignments ({activeJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer
            ${activeTab === "completed"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-gray-500 hover:text-slate-800 dark:hover:text-white"
            }
          `}
        >
          Completed History ({completedJobs.length})
        </button>
      </div>

      {/* Assignment List */}
      {displayItems.length === 0 ? (
        activeTab === "active" ? (
          <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed
            ${theme === "dark" 
              ? "border-[#1e293b] bg-slate-900/10" 
              : "border-slate-300 bg-slate-50/50"
            }
          `}>
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 animate-pulse">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
              No active assignments dispatched to you. When an administrator assigns a truck route or complaint, it will appear in your queue.
            </p>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed
            ${theme === "dark" 
              ? "border-[#1e293b] bg-slate-900/10" 
              : "border-slate-300 bg-slate-50/50"
            }
          `}>
            <div className="p-3 bg-slate-500/10 rounded-full text-slate-500 mb-4">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No completed history</h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
              Assignments resolved by you will be recorded here for auditing and proof references.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {displayItems.map((item) => {
            const coords = parseCoords(item.latitude, item.longitude);
            return (
              <div
                key={item._id}
                onClick={() => navigate(`/worker/${item._id}`)}
                className={`relative group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
                  ${theme === "dark" 
                    ? "bg-[#0e141a] border-[#172026] hover:border-slate-700/80 hover:bg-[#121b22]" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }
                `}
              >
                {/* Visual Status Indicator strip */}
                <div className={`absolute top-0 bottom-0 left-0 w-1
                  ${item.status === "in_progress" 
                    ? "bg-amber-500" 
                    : item.status === "assigned"
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                  }
                `} />

                {/* Left side details */}
                <div className="flex-1 min-w-0 pl-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Ticket {item._id.substring(item._id.length - 6).toUpperCase()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Address info */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{item.address || "Coordinates listed"}</span>
                    {item.ward && (
                      <span className="rounded-full bg-slate-800/10 dark:bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold">
                        Ward {item.ward}
                      </span>
                    )}
                  </div>

                  {/* Dispatch note details */}
                  {item.dispatchNote && (
                    <div className="text-xs border-l-2 border-emerald-500/20 pl-3 py-0.5 mt-2 bg-emerald-500/5 rounded-r-lg max-w-xl text-gray-500 leading-relaxed italic">
                      <span className="font-semibold text-[10px] uppercase text-emerald-500 not-italic block mb-0.5">Admin Dispatch Note</span>
                      "{item.dispatchNote}"
                    </div>
                  )}
                </div>

                {/* Right side controls / actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center pl-2">
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={item.status} />
                    {item.estimatedArrival && (
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                        ETA: {item.estimatedArrival}
                      </span>
                    )}
                  </div>

                  {coords && (
                    <a
                      href={googleMapsDirectionsUrl(Number(item.latitude), Number(item.longitude))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-colors cursor-pointer
                        ${theme === "dark"
                          ? "bg-[#111827] border-[#1e293b] text-gray-400 hover:text-emerald-400 hover:bg-[#1a2333]"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-slate-200"
                        }
                      `}
                      onClick={(e) => e.stopPropagation()}
                      title="Navigate using Google Maps"
                    >
                      <Navigation size={15} />
                    </a>
                  )}

                  <div className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all
                    ${theme === "dark"
                      ? "bg-[#0e141a] border-[#1e293b] text-gray-400 group-hover:bg-emerald-500 group-hover:text-white"
                      : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white"
                    }
                  `}>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
