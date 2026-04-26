import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/complaints";
import MapPicker from "../components/MapPicker";

const categories = ["overflowing_bin","missed_pickup","roadside_dumping","dead_animal","other"];
const priorities = ["low","medium","high"];
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

  function set(key, value) { setForm(p => ({ ...p, [key]: value })); }

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  }

  function handleLocationChange(lat, lng) {
    set("latitude", String(lat));
    set("longitude", String(lng));
    toast.success("📍 Location pinned!");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) { toast.error("Please upload an image."); return; }
    if (!form.latitude || !form.longitude) { toast.error("Please pin a location on the map."); return; }

    const body = new FormData();
    body.append("image", image);
    Object.entries(form).forEach(([k, v]) => body.append(k, v));

    try {
      setSubmitting(true);
      const res = await createComplaint(body);
      if (!res?.success) throw new Error(res?.message || "Submission failed.");
      toast.success("🎉 Complaint submitted successfully!");
      navigate("/complaints/my");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header animate-fade-in">
        <h2>Report a Waste Issue</h2>
        <p>Add a photo and pin the exact location so we can dispatch help quickly.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="card form-grid animate-slide-up">

          {/* Category + Priority */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="category">Category</label>
              <select id="category" className="form-select" value={form.category}
                onChange={e => set("category", e.target.value)} required>
                {categories.map(c => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="priority">Priority</label>
              <select id="priority" className="form-select" value={form.priority}
                onChange={e => set("priority", e.target.value)}
                style={{ borderColor: priorityColors[form.priority] }}>
                {priorities.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label required" htmlFor="title">Title</label>
            <input id="title" type="text" className="form-input"
              placeholder="e.g. Overflowing bin near bus stop"
              value={form.title} onChange={e => set("title", e.target.value)} required />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label required" htmlFor="description">Description</label>
            <textarea id="description" className="form-textarea"
              placeholder="Describe the issue — how bad is it, how long has it been there..."
              value={form.description} onChange={e => set("description", e.target.value)} required />
          </div>

          {/* Photo */}
          <div className="form-group">
            <label className="form-label required">Photo Evidence</label>
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                {image ? "Change photo" : "Upload a photo"}
                <input type="file" accept="image/*" className="file-input-hidden" onChange={handleImageChange} />
              </label>
            </div>
            {preview && (
              <div style={{ marginTop: "0.6rem", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 180 }}>
                <img src={preview} alt="Preview" style={{ width: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            {image && !preview && (
              <p className="file-name-display">✓ {image.name}</p>
            )}
          </div>

          <div className="divider" />

          {/* Map */}
          <div className="form-group">
            <label className="form-label required">Pin Location</label>
            <p className="form-hint" style={{ marginBottom: "0.5rem" }}>
              Use your GPS or click the map to mark the exact spot
            </p>
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>

          {/* Address + Ward */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address / Landmark</label>
              <input id="address" type="text" className="form-input" placeholder="Optional"
                value={form.address} onChange={e => set("address", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ward">Ward / Zone</label>
              <input id="ward" type="text" className="form-input" placeholder="Optional"
                value={form.ward} onChange={e => set("ward", e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}
            style={{ marginTop: "0.5rem" }}>
            {submitting
              ? <><span className="btn-spinner" /> Submitting...</>
              : "🚨 Submit Complaint"}
          </button>

        </div>
      </form>
    </div>
  );
}