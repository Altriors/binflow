import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import TruckAnimation from "../../components/TruckAnimation";
import { useTheme } from "../../context/ThemeContext";
import { ensureLeafletIcons, createPulseMarkerIcon } from "../../utils/leafletIcons";
import { 
  X, 
  Calendar, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  User, 
  Mail, 
  MessageSquare,
  Navigation
} from "lucide-react";

ensureLeafletIcons();

function formatDate(v) {
  if (!v) return "-";
  return new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function AdminComplaintDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTruck, setShowTruck] = useState(false);

  // Status update form
  const [statusForm, setStatusForm] = useState({ status: "", comment: "" });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Dispatch form
  const [dispatchForm, setDispatchForm] = useState({
    workerId: "", dispatchNote: "", estimatedArrival: "",
  });
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cr, wr] = await Promise.all([
          api.get(`/complaints/${id}`),
          api.get("/auth/workers"),
        ]);
        if (cr.data?.success) {
          setComplaint(cr.data.data);
          setStatusForm(f => ({ ...f, status: cr.data.data.status }));
        }
        if (wr.data?.success) setWorkers(wr.data.data || []);
      } catch {
        toast.error("Could not load complaint.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStatusUpdate(e) {
    e.preventDefault();
    if (!statusForm.status) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/complaints/${id}/status`, statusForm);
      if (res.data?.success) {
        setComplaint(res.data.data);
        toast.success("Status updated!");
      }
    } catch {
      toast.error("Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDispatch(e) {
    e.preventDefault();
    if (!dispatchForm.workerId) { toast.error("Please select a worker."); return; }
    setShowTruck(true);
    try {
      setDispatching(true);
      const res = await api.patch(`/complaints/${id}/dispatch`, dispatchForm);
      if (res.data?.success) {
        setComplaint(res.data.data);
        toast.success("🚛 Truck dispatched!");
      }
    } catch {
      setShowTruck(false);
      toast.error("Could not dispatch.");
    } finally {
      setDispatching(false);
    }
  }

  if (loading) return (
    <div className="p-6 md:p-8 space-y-4 max-w-5xl mx-auto w-full">
      <div className="h-10 bg-slate-800/10 dark:bg-slate-800/40 rounded-xl animate-pulse w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
        <div className="h-[300px] bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full text-center">
      <div className="p-12 border border-dashed rounded-2xl border-slate-300 dark:border-slate-800">
        <AlertCircle className="text-red-500 mx-auto animate-bounce mb-4" size={32} />
        <h3 className="font-bold">Complaint not found</h3>
      </div>
    </div>
  );

  const hasCoords = complaint.latitude && complaint.longitude;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {showTruck && (
        <TruckAnimation autoStart onComplete={() => setShowTruck(false)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to="/admin/complaints" className="text-xs font-semibold text-gray-500 hover:text-emerald-500 flex items-center gap-1">
            ← All Complaints
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {complaint.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <StatusBadge status={complaint.status} />
            <StatusBadge status={complaint.priority} type="priority" />
            <span className="text-xs text-gray-500 font-semibold">
              {categoryLabels[complaint.category] || complaint.category}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 sm:text-right shrink-0">
          <div>Submitted {formatDate(complaint.createdAt)}</div>
          {complaint.resolvedAt && (
            <div className="text-emerald-500 font-bold">Resolved {formatDate(complaint.resolvedAt)}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispatch active banner */}
          {complaint.status === "assigned" && complaint.dispatchNote && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <div className="flex items-center gap-3">
                <Truck className="animate-bounce shrink-0" size={20} />
                <div className="flex flex-col text-xs">
                  <span className="font-bold">Truck dispatched</span>
                  <span className="text-gray-500 italic mt-0.5">"{complaint.dispatchNote}"</span>
                  {complaint.assignedTo && (
                    <span className="text-[10px] mt-1">Worker: {complaint.assignedTo.name}</span>
                  )}
                </div>
              </div>
              {complaint.estimatedArrival && (
                <span className="text-[10px] font-extrabold bg-blue-500 text-white px-2 py-0.5 rounded-full shrink-0">
                  ETA {complaint.estimatedArrival}
                </span>
              )}
            </div>
          )}

          {/* Complaint details */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
            ${theme === "dark" ? "bg-[#0e141a] border-[#172026] text-white" : "bg-white border-slate-200 text-slate-900"}
          `}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Complaint Details</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase text-gray-500 block font-bold">Description</span>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-[#111827]/30 p-3 rounded-xl border border-slate-100 dark:border-[#1e293b]/40">
                  {complaint.description}
                </p>
              </div>
              {complaint.resolutionNote && (
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-emerald-500 block font-bold">Worker Resolution Note</span>
                  <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20 italic">
                    "{complaint.resolutionNote}"
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-gray-500 block font-bold">Reported By</span>
                  <div className="text-xs font-bold">{complaint.userId?.name || "—"}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">{complaint.userId?.email}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-gray-500 block font-bold">Location Details</span>
                  <div className="text-xs font-bold">{complaint.address || "—"}</div>
                  {complaint.ward && <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Ward {complaint.ward}</div>}
                  <div className="text-[9px] text-gray-400 font-mono mt-1">
                    {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photos (Reported vs Resolved) */}
          {(complaint.imageUrl || complaint.afterImageUrl) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {complaint.imageUrl && (
                <div className={`rounded-2xl border overflow-hidden transition-all
                  ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
                `}>
                  <img src={complaint.imageUrl} alt="Complaint" className="w-full max-h-[320px] object-cover" />
                  <div className="p-3 border-t border-slate-200 dark:border-[#172026] text-[10px] text-gray-500 font-semibold bg-slate-50/50 dark:bg-[#111827]/30">
                    Before (Citizen Photo)
                  </div>
                </div>
              )}
              {complaint.afterImageUrl && (
                <div className={`rounded-2xl border overflow-hidden transition-all
                  ${theme === "dark" ? "bg-[#0e141a] border-[#e2e8f0]/10" : "bg-white border-emerald-200"}
                `}>
                  <img src={complaint.afterImageUrl} alt="Resolution Proof" className="w-full max-h-[320px] object-cover" />
                  <div className="p-3 border-t border-emerald-200/50 dark:border-[#172026] text-[10px] text-emerald-500 font-bold bg-emerald-500/5 dark:bg-emerald-500/10">
                    After (Resolution Proof)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map picker wrapper */}
          {hasCoords && (
            <div className={`rounded-2xl border overflow-hidden transition-all
              ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
            `}>
              <div className="p-4 border-b border-slate-200 dark:border-[#172026] font-bold text-xs">
                📍 Complaint Location Map
              </div>
              <div className="relative w-full h-[260px] overflow-hidden">
                <MapContainer
                  center={[complaint.latitude, complaint.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%", minHeight: 260 }}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[complaint.latitude, complaint.longitude]} icon={createPulseMarkerIcon()}>
                    <Popup>{complaint.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Activity Logs (Audit Trail) */}
          {complaint.statusLogs && complaint.statusLogs.length > 0 && (
            <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
              ${theme === "dark" ? "bg-[#0e141a] border-[#172026] text-white" : "bg-white border-slate-200 text-slate-900"}
            `}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Activity & Audit History</h3>
              <div className="relative pl-6 space-y-4 mt-2">
                <div className="absolute top-1.5 bottom-1.5 left-[9px] w-0.5 bg-slate-200 dark:bg-slate-800" />
                
                {complaint.statusLogs.map((log, idx) => (
                  <div key={log._id || idx} className="relative flex flex-col text-xs">
                    {/* Status Circle Dot */}
                    <div className="absolute -left-[23px] mt-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0e141a]" />
                    
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-extrabold capitalize text-slate-900 dark:text-emerald-400">
                        {log.newStatus.replace("_", " ")}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        by {log.updatedBy?.name || "System"} ({log.updatedBy?.role || "system"})
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono ml-auto shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    {log.comment && (
                      <p className="text-[11px] text-gray-500 italic mt-1 bg-slate-50 dark:bg-[#111827]/30 p-2 rounded-lg border border-slate-100 dark:border-[#1e293b]/40">
                        "{log.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — actions */}
        <div className="space-y-6">
          {/* Status update */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
            ${theme === "dark" ? "bg-[#0e141a] border-[#172026] text-white" : "bg-white border-slate-200 text-slate-900"}
          `}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">New Status</label>
                <div className="relative">
                  <select 
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                    className={`w-full border rounded-xl py-2 px-3.5 text-xs outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:10px] pr-8
                      ${theme === "dark"
                        ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%234b5563%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                      }
                    `}
                  >
                    <option value="reported">Reported</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Comment (optional)</label>
                <textarea 
                  rows={2}
                  placeholder="Add status notes..."
                  value={statusForm.comment}
                  onChange={e => setStatusForm(f => ({ ...f, comment: e.target.value }))}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs outline-none transition-all min-h-[60px] resize-y
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                    }
                  `}
                />
              </div>
              <button 
                type="submit" 
                disabled={updatingStatus}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                {updatingStatus ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </form>
          </div>

          {/* Dispatch truck card */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
            ${theme === "dark"
              ? "bg-[#0e141a]/60 border-amber-500/30 text-white"
              : "bg-amber-500/5 border-amber-400 text-slate-900"
            }
          `}>
            <div className="flex items-center gap-2">
              <span className="text-xl animate-[truckRide_2s_ease-in-out_infinite] inline-block">🚛</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500">Dispatch Truck</h3>
            </div>
            <form onSubmit={handleDispatch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Assign Worker</label>
                <div className="relative">
                  <select 
                    value={dispatchForm.workerId}
                    onChange={e => setDispatchForm(f => ({ ...f, workerId: e.target.value }))} 
                    required
                    className={`w-full border rounded-xl py-2 px-3.5 text-xs outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:10px] pr-8
                      ${theme === "dark"
                        ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%234b5563%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                      }
                    `}
                  >
                    <option value="">Select a worker...</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                    {workers.length === 0 && (
                      <option disabled>No workers registered yet</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Dispatch Note</label>
                <textarea 
                  rows={2}
                  placeholder="Instructions for the worker..."
                  value={dispatchForm.dispatchNote}
                  onChange={e => setDispatchForm(f => ({ ...f, dispatchNote: e.target.value }))}
                  className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all min-h-[50px] resize-y
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                      : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                    }
                  `}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Estimated Arrival</label>
                <input 
                  placeholder="e.g. 30 mins, 2 hours"
                  value={dispatchForm.estimatedArrival}
                  onChange={e => setDispatchForm(f => ({ ...f, estimatedArrival: e.target.value }))}
                  className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                      : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                    }
                  `}
                />
              </div>
              <button 
                type="submit" 
                disabled={dispatching}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 shadow-md shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                {dispatching ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    Dispatching...
                  </>
                ) : (
                  "🚛 Dispatch Truck"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes truckRide {
          0%   { transform: translateX(-4px); }
          50%  { transform: translateX(4px); }
          100% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}