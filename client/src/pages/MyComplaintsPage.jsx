import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getMyComplaints } from "../services/complaints";
import StatusBadge from "../components/StatusBadge";
import CitizenShell from "../components/citizen/CitizenShell";
import AnimatedCard, { StaggerGrid } from "../components/citizen/AnimatedCard";
import ComplaintMap from "../components/ComplaintMap";
import { useTheme } from "../context/ThemeContext";
import { 
  X, 
  Calendar, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  ClipboardList, 
  Eye, 
  AlertCircle,
  Clock
} from "lucide-react";

function formatDate(v) {
  if (!v) return null;
  return new Date(v).toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

// Details Modal Component
function ComplaintDetailsModal({ item, onClose }) {
  const { theme } = useTheme();
  
  const statusOrder = ["reported", "assigned", "in_progress", "resolved", "closed"];
  const currentStatusIdx = statusOrder.indexOf(item.status);

  const steps = [
    { 
      label: "Issue Reported", 
      desc: "Complaint successfully logged in the system", 
      date: item.createdAt, 
      done: currentStatusIdx >= 0 
    },
    { 
      label: "Worker Dispatched", 
      desc: item.dispatchNote ? `Note: "${item.dispatchNote}"` : "Team assigned and route planned", 
      date: item.estimatedArrival ? `ETA: ${item.estimatedArrival}` : null,
      done: currentStatusIdx >= 1 
    },
    { 
      label: "In Progress", 
      desc: "Worker has arrived at the location and is resolving the issue", 
      date: null,
      done: currentStatusIdx >= 2 
    },
    { 
      label: "Resolved", 
      desc: item.resolutionNote ? `Worker note: "${item.resolutionNote}"` : "Waste collection completed", 
      date: item.resolvedAt, 
      done: currentStatusIdx >= 3 
    },
    { 
      label: "Closed", 
      desc: "Ticket closed and verified by administrator", 
      date: item.status === "closed" ? item.updatedAt : null, 
      done: currentStatusIdx >= 4 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl border shadow-xl transition-colors duration-300
          ${theme === "dark"
            ? "bg-[#0e141a] border-[#172026] text-white"
            : "bg-white border-slate-200 text-slate-900"
          }
        `}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b pb-4 mb-4 border-slate-200 dark:border-[#172026]">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Ticket ID: {item._id.substring(item._id.length - 8).toUpperCase()}
            </span>
            <h3 className="text-base font-bold leading-tight">{item.title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-6">
          {/* Timeline Status Tracker */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Complaint Progress</h4>
            <div className="relative pl-6 space-y-5">
              {/* Vertical timeline line bar */}
              <div className="absolute top-2 bottom-2 left-[9px] w-0.5 bg-slate-200 dark:bg-slate-800" />
              
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex gap-3">
                  {/* Status Circle Dot */}
                  <div className={`absolute -left-6 mt-1 h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-300
                    ${step.done
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-[#1e293b] text-gray-400"
                    }
                  `}>
                    <CheckCircle2 size={10} className={`${step.done ? "opacity-100" : "opacity-0"}`} />
                  </div>

                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${step.done ? "text-slate-900 dark:text-white" : "text-gray-500"}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                      {step.desc}
                    </span>
                    {step.date && (
                      <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {typeof step.date === "string" ? step.date : formatDate(step.date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Photos Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Submitted Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase text-gray-500 block">Category</span>
                <span className="text-xs font-semibold">{categoryLabels[item.category] || item.category}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase text-gray-500 block">Priority</span>
                <StatusBadge status={item.priority} type="priority" />
              </div>
              {item.description && (
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-[9px] uppercase text-gray-500 block">Description</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-slate-50 dark:bg-[#111827]/30 p-2.5 rounded-xl border border-slate-100 dark:border-[#1e293b]/40">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* Photos Side-by-Side (Reported Image vs Resolution Proof) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Reported Image</span>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#172026]">
                  <img src={item.imageUrl} alt="Reported" className="w-full h-full object-cover" />
                </div>
              </div>
              {(item.status === "resolved" || item.status === "closed") && item.afterImageUrl && (
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-emerald-500 tracking-wider block">Resolution Proof</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-emerald-500/30">
                    <img src={item.afterImageUrl} alt="Resolution Proof" className="w-full h-full object-cover" />
                  </div>
                  {item.resolutionNote && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 italic">
                      Note: "{item.resolutionNote}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coordinate Pinned Map */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Map Coordinates</h4>
            <ComplaintMap
              latitude={item.latitude}
              longitude={item.longitude}
              address={item.address}
              height={180}
              showNavigate={false}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MyComplaintsPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyComplaints();
        if (!res?.success) throw new Error(res?.message || "Could not load.");
        setItems(res.data.items || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Could not load complaints.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <CitizenShell>
        <div className="p-6 md:p-8 space-y-4 max-w-5xl mx-auto w-full">
          <div className="h-16 bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="h-32 bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
            <div className="h-32 bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
          </div>
        </div>
      </CitizenShell>
    );
  }

  return (
    <CitizenShell>
      {/* Header and trigger buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 max-w-5xl mx-auto w-full">
        <motion.div
          className="flex flex-col gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-emerald-500" size={22} />
            My Reported Complaints
          </h2>
          <p className="text-xs text-gray-500">
            {items.length} complaint{items.length !== 1 ? "s" : ""} logged. Click any card to track real-time resolution.
          </p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0"
        >
          <Link 
            to="/complaints/new" 
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            + Report New Issue
          </Link>
        </motion.div>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed max-w-5xl mx-auto w-full
            ${theme === "dark" 
              ? "border-[#1e293b] bg-slate-900/10" 
              : "border-slate-300 bg-slate-50/50"
            }
          `}
        >
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 animate-pulse">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No complaints yet</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
            You haven't reported any waste collection issues yet. Help make your ward clean by pinning overflowing bins or missed pickups.
          </p>
          <Link 
            to="/complaints/new" 
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Report first issue
          </Link>
        </motion.div>
      ) : (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
          {items.map((item, i) => (
            <AnimatedCard
              key={item._id}
              onClick={() => setSelectedItem(item)}
              className={`relative group flex gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
                ${theme === "dark" 
                  ? "bg-[#0e141a] border-[#172026] hover:border-slate-700/80 hover:bg-[#121b22]" 
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }
              `}
              delay={i * 0.05}
              as="article"
            >
              {/* Visual accent left indicator border strip */}
              <div className={`absolute top-0 bottom-0 left-0 w-1
                ${item.status === "in_progress" 
                  ? "bg-amber-500" 
                  : item.status === "assigned"
                  ? "bg-blue-500"
                  : item.status === "resolved"
                  ? "bg-emerald-500"
                  : "bg-gray-400"
                }
              `} />

              {/* Thumb Image */}
              {item.imageUrl && (
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}

              {/* Text Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between pl-1 space-y-1.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Ticket {item._id.substring(item._id.length - 6).toUpperCase()}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  
                  <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 leading-normal">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Dispatch ETA banner */}
                {item.status === "assigned" && item.dispatchNote && (
                  <div className="flex items-center justify-between gap-1.5 p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px]">
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Truck size={12} className="animate-bounce" />
                      <span className="font-semibold italic truncate max-w-[140px]">"{item.dispatchNote}"</span>
                    </div>
                    {item.estimatedArrival && (
                      <span className="font-extrabold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                        ETA {item.estimatedArrival}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500 pt-1.5 border-t border-slate-100 dark:border-[#172026]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{categoryLabels[item.category] || item.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    {item.ward && <span className="font-semibold">Ward {item.ward}</span>}
                  </div>
                  <span className="text-[9px]">
                    {formatDate(item.createdAt)?.split(",")[0]}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </StaggerGrid>
      )}

      {/* Details modal overlays rendering */}
      <AnimatePresence>
        {selectedItem && (
          <ComplaintDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </CitizenShell>
  );
}
