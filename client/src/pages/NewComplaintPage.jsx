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

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState(null);
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

  function handleLocationChange(lat, lng) {
    set("latitude", String(lat));
    set("longitude", String(lng));
    toast.success("Location set.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) { toast.error("Please upload an image."); return; }
    if (!form.latitude || !form.longitude) { toast.error("Please set a location on the map."); return; }

    const body = new FormData();
    body.append("image", image);
    Object.entries(form).forEach(([k, v]) => body.append(k, v));

    try {
      setSubmitting(true);
      const res = await createComplaint(body);
      if (!res?.success) throw new Error(res?.message || "Submission failed.");
      toast.success("Complaint submitted!");
      navigate("/complaints/my");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>New Complaint</h2>
        <p>Report a waste issue in your area. Add a photo and pin the exact location.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
        <div className="card form-grid">

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="category">Category</label>
              <select id="category" className="form-select" value={form.category}
                onChange={(e) => set("category", e.target.value)} required>
                {categories.map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="priority">Priority</label>
              <select id="priority" className="form-select" value={form.priority}
                onChange={(e) => set("priority", e.target.value)}>
                {priorities.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="title">Title</label>
            <input id="title" type="text" className="form-input"
              placeholder="e.g. Overflowing bin near bus stop"
              value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="description">Description</label>
            <textarea id="description" className="form-textarea"
              placeholder="Describe the issue in detail..."
              value={form.description} onChange={(e) => set("description", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label required">Photo</label>
            <div className="file-input-wrapper">
              <label className="file-input-label">
                📷 {image ? "Change photo" : "Upload a photo"}
                <input type="file" accept="image/*" className="file-input-hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
            </div>
            {image && <p className="file-name-display">✓ {image.name}</p>}
          </div>

          <div className="divider" />

          <div className="form-group">
            <label className="form-label required">Location</label>
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address / Landmark</label>
              <input id="address" type="text" className="form-input" placeholder="Optional"
                value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ward">Ward / Zone</label>
              <input id="ward" type="text" className="form-input" placeholder="Optional"
                value={form.ward} onChange={(e) => set("ward", e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}
            style={{ marginTop: "0.5rem" }}>
            {submitting ? <><span className="btn-spinner" />Submitting...</> : "Submit Complaint"}
          </button>

        </div>
      </form>
    </div>
  );
}