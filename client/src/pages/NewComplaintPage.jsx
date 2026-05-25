import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/complaints";
import { parseCoords } from "../components/ComplaintMap";
import MapPicker from "../components/MapPicker";
import CitizenShell from "../components/citizen/CitizenShell";
import AnimatedCard from "../components/citizen/AnimatedCard";
import AnimatedButton from "../components/citizen/AnimatedButton";
import SuccessModal from "../components/citizen/SuccessModal";

const categories = ["overflowing_bin", "missed_pickup", "roadside_dumping", "dead_animal", "other"];
const priorities = ["low", "medium", "high"];
const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};
const priorityColors = { low: "#6b7280", medium: "#f59e0b", high: "#ef4444" };

export default function NewComplaintPage() {
  const navigate = useNavigate();
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
        className="page-header page-header-dashboard"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="page-title">Report a Waste Issue</h2>
        <p>Add a photo and pin the exact location so we can dispatch help quickly.</p>
      </motion.div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
        <AnimatedCard className="card form-grid complaint-form-card" delay={0.05}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="category">Category</label>
              <select
                id="category"
                className="form-select"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="priority">Priority</label>
              <select
                id="priority"
                className="form-select"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                style={{ borderColor: priorityColors[form.priority] }}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g. Overflowing bin near bus stop"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="Describe the issue — how bad is it, how long has it been there..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Photo Evidence</label>
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {image ? "Change photo" : "Upload a photo"}
                <input type="file" accept="image/*" className="file-input-hidden" onChange={handleImageChange} />
              </label>
            </div>
            {preview && (
              <motion.div
                className="photo-preview-wrap"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ marginTop: "0.6rem", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 180 }}
              >
                <img src={preview} alt="Preview" style={{ width: "100%", objectFit: "cover", display: "block" }} />
              </motion.div>
            )}
            {image && !preview && <p className="file-name-display">✓ {image.name}</p>}
          </div>
        </AnimatedCard>

        <AnimatedCard className="card card-map-panel" delay={0.12}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Pin Location</label>
            <p className="form-hint" style={{ marginBottom: "0.65rem" }}>
              Use your GPS or tap the map to mark the exact spot
            </p>
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={handleLocationChange}
              onLocationError={handleLocationError}
              onLocationInfo={handleLocationInfo}
            />
          </div>

          <div className="form-row" style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address / Landmark</label>
              <input
                id="address"
                type="text"
                className="form-input"
                placeholder="Optional"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ward">Ward / Zone</label>
              <input
                id="ward"
                type="text"
                className="form-input"
                placeholder="Optional"
                value={form.ward}
                onChange={(e) => set("ward", e.target.value)}
              />
            </div>
          </div>
        </AnimatedCard>

        <motion.div
          style={{ marginTop: "1.25rem" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedButton
            type="submit"
            className="btn btn-primary btn-lg btn-full btn-glow"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="btn-spinner" /> Submitting…
              </>
            ) : (
              "🚨 Submit Complaint"
            )}
          </AnimatedButton>
        </motion.div>
      </form>
    </CitizenShell>
  );
}
