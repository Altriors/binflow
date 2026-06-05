import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import ComplaintMap, { parseCoords } from "../../components/ComplaintMap";
import { useTheme } from "../../context/ThemeContext";
import { ArrowLeft, MapPin, Truck, CheckCircle2 } from "lucide-react";

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function WorkerComplaintDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/complaints/${id}`);
        if (res.data?.success) setComplaint(res.data.data);
      } catch {
        toast.error("Could not load job.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function updateStatus(status) {
    try {
      setUpdating(true);
      const res = await api.patch(`/complaints/${id}/status`, {
        status,
        comment: status === "in_progress" ? "Worker arrived on site" : "Work completed",
      });
      if (res.data?.success) {
        setComplaint(res.data.data);
        toast.success(status === "in_progress" ? "Marked in progress" : "Marked resolved");
        if (status === "resolved") {
          setTimeout(() => navigate("/worker"), 1200);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="p-6 md:p-8 space-y-4 max-w-5xl mx-auto w-full">
      <div className="h-10 bg-slate-800/10 dark:bg-slate-800/40 rounded-xl animate-pulse w-1/4" />
      <div className="h-[300px] bg-slate-800/10 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
    </div>
  );

  if (!complaint) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-12 border border-dashed rounded-2xl border-slate-300 dark:border-slate-800">
          <h3 className="font-bold text-red-500">Job not found</h3>
        </div>
      </div>
    );
  }

  const coords = parseCoords(complaint.latitude, complaint.longitude);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
      <Link to="/worker" className="text-xs font-semibold text-gray-500 hover:text-emerald-500 flex items-center gap-1">
        <ArrowLeft size={14} /> My Assignments
      </Link>

      <div className="animate-fade-in space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
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

      {complaint.dispatchNote && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <div className="flex items-center gap-3">
            <Truck className="animate-bounce shrink-0" size={20} />
            <div className="flex flex-col text-xs">
              <span className="font-bold">Dispatch instructions</span>
              <span className="text-gray-500 italic mt-0.5">"{complaint.dispatchNote}"</span>
            </div>
          </div>
          {complaint.estimatedArrival && (
            <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
              ETA {complaint.estimatedArrival}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left detail card stack */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
            ${theme === "dark" ? "bg-[#0e141a] border-[#172026] text-white" : "bg-white border-slate-200 text-slate-900"}
          `}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Job Details</h3>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-[#111827]/30 p-3 rounded-xl border border-slate-100 dark:border-[#1e293b]/40">
              {complaint.description}
            </p>
            <div className="text-xs flex items-center gap-1.5 text-gray-500">
              <MapPin size={14} className="shrink-0" />
              <span>
                <strong>Location:</strong>{" "}
                {complaint.address || (coords ? coords.label : "No address on file")}
              </span>
              {complaint.ward && (
                <span className="rounded-full bg-slate-800/10 dark:bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold">
                  Ward {complaint.ward}
                </span>
              )}
            </div>
          </div>

          <div className={`rounded-2xl border overflow-hidden transition-all
            ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
          `}>
            <div className="p-4 border-b border-slate-200 dark:border-[#172026] font-bold text-xs">
              📍 Job Location
            </div>
            <ComplaintMap
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              title={complaint.title}
              address={complaint.address}
              height={260}
              showNavigate
            />
          </div>

          {complaint.imageUrl && (
            <div className={`rounded-2xl border overflow-hidden transition-all
              ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
            `}>
              <img src={complaint.imageUrl} alt="Site" className="w-full max-h-[300px] object-cover" />
            </div>
          )}
        </div>

        {/* Right actions side */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
            ${theme === "dark" ? "bg-[#0e141a] border-[#172026] text-white" : "bg-white border-slate-200 text-slate-900"}
          `}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Update progress</h3>
            <div className="flex flex-col gap-2.5">
              {complaint.status === "assigned" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus("in_progress")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  {updating ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Updating...
                    </>
                  ) : (
                    "▶ Mark In Progress"
                  )}
                </button>
              )}
              {(complaint.status === "assigned" || complaint.status === "in_progress") && (
                <button
                  type="button"
                  disabled={updating || complaint.status === "resolved"}
                  onClick={() => updateStatus("resolved")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2.5 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  {updating ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Updating...
                    </>
                  ) : (
                    "✓ Mark Resolved"
                  )}
                </button>
              )}
              {complaint.status === "resolved" && (
                <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> This job is resolved.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
