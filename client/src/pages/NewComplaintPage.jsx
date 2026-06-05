import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/complaints";
import { parseCoords } from "../components/ComplaintMap";
import MapPicker from "../components/MapPicker";
import CitizenShell from "../components/citizen/CitizenShell";
import AnimatedCard from "../components/citizen/AnimatedCard";
import SuccessModal from "../components/citizen/SuccessModal";
import AnimatedButton from "../components/citizen/AnimatedButton";
import { useTheme } from "../context/ThemeContext";
import { Camera, Send } from "lucide-react";

const categories = ["overflowing_bin", "missed_pickup", "roadside_dumping", "dead_animal", "other"];
const priorities = ["low", "medium", "high"];
const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

const priorityStyles = {
  low: { border: "border-slate-200 focus:border-emerald-500/50 dark:border-[#1e293b]" },
  medium: { border: "border-amber-400 focus:border-amber-500/50 dark:border-amber-500/40" },
  high: { border: "border-red-400 focus:border-red-500/50 dark:border-red-500/40" },
};

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    category: "overflowing_bin",
    title: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
    ward: "",
    priority: "medium",
  });

  function set(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  }

  function handleLocationChange(lat, lng) {
    setForm((p) => ({
      ...p,
      latitude: String(lat),
      longitude: String(lng),
    }));
    toast.success("📍 Location pinned!");
  }

  function handleLocationError(message) {
    toast.error(message);
  }

  function handleLocationInfo(message) {
    toast(message, { icon: "📍", duration: 5000 });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }
    if (!parseCoords(form.latitude, form.longitude)) {
      toast.error("Please pin a location on the map.");
      return;
    }

    const body = new FormData();
    body.append("image", image);
    Object.entries(form).forEach(([k, v]) => body.append(k, v));

    try {
      setSubmitting(true);
      const res = await createComplaint(body);
      if (!res?.success) throw new Error(res?.message || "Submission failed.");
      setShowSuccess(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    navigate("/complaints/my");
  }

  return (
    <CitizenShell>
      <SuccessModal
        open={showSuccess}
        title="Complaint submitted!"
        message="Your report is live. We'll dispatch a team and you can track status in My Complaints."
        onClose={handleSuccessClose}
      />

      <motion.div
        className="flex flex-col gap-1.5 mb-6 max-w-2xl mx-auto w-full"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Report a Waste Issue
        </h2>
        <p className="text-xs text-gray-500">
          Add a photo and pin the exact location so we can dispatch help quickly.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full">
        {/* Form Fields Card */}
        <AnimatedCard
          className={`p-6 rounded-2xl border shadow-sm backdrop-blur-xl transition-all duration-300 space-y-5
            ${theme === "dark"
              ? "bg-[#0e141a]/85 border-[#172026] text-white shadow-black/40"
              : "bg-white/80 border-slate-200 text-slate-900 shadow-slate-200/50"
            }
          `}
          delay={0.05}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="category">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:12px]
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%234b5563%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                    }
                  `}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabels[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="priority">
                Priority
              </label>
              <div className="relative">
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:12px] focus:ring-2 focus:ring-emerald-500/10
                    ${priorityStyles[form.priority].border}
                    ${theme === "dark"
                      ? "bg-[#111827] text-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                      : "bg-slate-50 text-slate-900 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%234b5563%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22/%3E%3C/svg%3E')]"
                    }
                  `}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Overflowing bin near bus stop"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className={`w-full border rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all
                ${theme === "dark"
                  ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                }
              `}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe the issue — how bad is it, how long has it been there..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              className={`w-full border rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all min-h-[110px] resize-y
                ${theme === "dark"
                  ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                }
              `}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
              Photo Evidence
            </label>
            <div className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50/50 dark:hover:bg-[#111827]/20 transition-all cursor-pointer group
              ${theme === "dark"
                ? "border-[#1e293b] hover:border-emerald-500/50 bg-[#111827]/10"
                : "border-slate-200 hover:border-emerald-500/50 bg-slate-50/20"
              }
            `}>
              <Camera size={22} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs font-bold text-gray-500 select-none">
                {image ? "✓ Change photo" : "Upload a photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleImageChange}
              />
            </div>
            {preview && (
              <motion.div
                className="mt-3.5 rounded-xl overflow-hidden border border-slate-200 dark:border-[#172026] shadow-sm max-h-[220px]"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img src={preview} alt="Preview" className="w-full h-full object-cover max-h-[220px]" />
              </motion.div>
            )}
            {image && !preview && <p className="text-xs text-emerald-500 mt-1">✓ {image.name}</p>}
          </div>
        </AnimatedCard>

        {/* Map Pinned Card */}
        <AnimatedCard
          className={`p-6 rounded-2xl border shadow-sm backdrop-blur-xl transition-all duration-300 space-y-4 mt-6
            ${theme === "dark"
              ? "bg-[#0e141a]/85 border-[#172026] text-white shadow-black/40"
              : "bg-white/80 border-slate-200 text-slate-900 shadow-slate-200/50"
            }
          `}
          delay={0.12}
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
              Pin Location
            </label>
            <p className="text-[10px] text-gray-500">
              Use your GPS or tap the map to mark the exact spot
            </p>
          </div>

          <MapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onLocationChange={handleLocationChange}
            onLocationError={handleLocationError}
            onLocationInfo={handleLocationInfo}
          />

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="address">
                Address / Landmark
              </label>
              <input
                id="address"
                type="text"
                placeholder="Optional"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50"
                  }
                `}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="ward">
                Ward / Zone
              </label>
              <input
                id="ward"
                type="text"
                placeholder="Optional"
                value={form.ward}
                onChange={(e) => set("ward", e.target.value)}
                className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50"
                  }
                `}
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Submit Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedButton
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3.5 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-6 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                Submitting…
              </>
            ) : (
              <>
                Submit Complaint <Send size={15} />
              </>
            )}
          </AnimatedButton>
        </motion.div>
      </form>
    </CitizenShell>
  );
}
