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

function formatDate(v) {
  if (!v) return "-";
  return new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function WorkerComplaintDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Resolution proof states
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionComment, setResolutionComment] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

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

  async function submitResolution(e) {
    e.preventDefault();
    if (!resolutionPhoto) {
      toast.error("Please upload a resolution proof photo.");
      return;
    }
    if (!resolutionComment.trim()) {
      toast.error("Please enter a resolution description/note.");
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("status", "resolved");
      formData.append("comment", resolutionComment);
      formData.append("image", resolutionPhoto);

      const res = await api.patch(`/complaints/${id}/status`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        setComplaint(res.data.data);
        toast.success("Job resolved successfully!");
        setShowResolutionForm(false);
        setResolutionPhoto(null);
        setPhotoPreview(null);
        setResolutionComment("");
        setTimeout(() => navigate("/worker"), 1200);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resolve job.");
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
            {complaint.resolutionNote && (
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase text-emerald-500 font-bold block">Resolution Note</span>
                <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20 italic">
                  "{complaint.resolutionNote}"
                </p>
              </div>
            )}
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

          {/* Photos (Before & After) */}
          {(complaint.imageUrl || complaint.afterImageUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaint.imageUrl && (
                <div className={`rounded-2xl border overflow-hidden transition-all
                  ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
                `}>
                  <img src={complaint.imageUrl} alt="Reported site" className="w-full h-[220px] object-cover" />
                  <div className="p-2.5 border-t border-slate-200 dark:border-[#172026] text-[10px] text-gray-500 font-semibold bg-slate-50/50 dark:bg-[#111827]/30">
                    Before (Citizen Photo)
                  </div>
                </div>
              )}
              {complaint.afterImageUrl && (
                <div className={`rounded-2xl border overflow-hidden transition-all
                  ${theme === "dark" ? "bg-[#0e141a] border-[#e2e8f0]/10" : "bg-white border-emerald-200"}
                `}>
                  <img src={complaint.afterImageUrl} alt="Resolution Proof" className="w-full h-[220px] object-cover" />
                  <div className="p-2.5 border-t border-emerald-200/50 dark:border-[#172026] text-[10px] text-emerald-500 font-bold bg-emerald-500/5 dark:bg-emerald-500/10">
                    After (Resolution Proof)
                  </div>
                </div>
              )}
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
                      <span className="font-extrabold capitalize text-slate-950 dark:text-emerald-400">
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

        {/* Right actions side */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4
            ${theme === "dark" ? "bg-[#0e141a] border-[#172026] text-white" : "bg-white border-slate-200 text-slate-900"}
          `}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Update progress</h3>
            
            {showResolutionForm ? (
              <form onSubmit={submitResolution} className="space-y-4 pt-2 border-t border-slate-200 dark:border-[#172026] animate-fade-in">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Resolution Details
                </div>
                
                {/* Image Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                    Upload Photo *
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all
                    ${photoPreview ? "border-emerald-500" : "border-slate-300 dark:border-[#172026]"}
                  `}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {photoPreview ? (
                      <div className="space-y-2">
                        <img src={photoPreview} alt="Preview" className="max-h-[140px] mx-auto rounded-lg object-cover" />
                        <span className="text-[10px] text-emerald-500 font-bold block">✓ Photo Selected (Click to change)</span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-gray-500">
                        <span className="text-2xl block">📸</span>
                        <span className="text-xs font-bold block">Select proof photo</span>
                        <span className="text-[9px] text-gray-400 block">PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="res-comment">
                    Resolution Note *
                  </label>
                  <textarea
                    id="res-comment"
                    rows={3}
                    required
                    placeholder="Describe what action was taken (e.g. cleaned the bin, cleared roadside dumping)..."
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all min-h-[60px] resize-y
                      ${theme === "dark"
                        ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50"
                        : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500/50"
                      }
                    `}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => {
                      setShowResolutionForm(false);
                      setResolutionPhoto(null);
                      setPhotoPreview(null);
                      setResolutionComment("");
                    }}
                    className="w-full rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 font-bold text-xs py-2 transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            ) : (
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
                    disabled={updating}
                    onClick={() => setShowResolutionForm(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2.5 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    ✓ Mark Resolved
                  </button>
                )}
                {complaint.status === "resolved" && (
                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> This job is resolved.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
