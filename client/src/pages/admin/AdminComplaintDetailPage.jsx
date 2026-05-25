import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import TruckAnimation from "../../components/TruckAnimation";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

  if (loading) return <div className="loading-spinner">Loading complaint...</div>;
  if (!complaint) return (
    <div className="page-wrapper">
      <div className="empty-state"><span className="empty-state-icon">❌</span><h3>Complaint not found</h3></div>
    </div>
  );

  const hasCoords = complaint.latitude && complaint.longitude;

  return (
    <div className="page-wrapper">
      {showTruck && (
        <TruckAnimation autoStart onComplete={() => setShowTruck(false)} />
      )}

      {/* Header */}
      <div className="animate-fade-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <Link to="/admin/complaints" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.5rem" }}>
            ← All Complaints
          </Link>
          <h2 style={{ marginBottom: "0.35rem" }}>{complaint.title}</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <StatusBadge status={complaint.status} />
            <StatusBadge status={complaint.priority} type="priority" />
            <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              {categoryLabels[complaint.category] || complaint.category}
            </span>
          </div>
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", textAlign: "right" }}>
          <div>Submitted {formatDate(complaint.createdAt)}</div>
          {complaint.resolvedAt && <div style={{ color: "var(--color-primary)" }}>Resolved {formatDate(complaint.resolvedAt)}</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.25rem", alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "grid", gap: "1.25rem" }}>

          {/* Dispatch active banner */}
          {complaint.status === "assigned" && complaint.dispatchNote && (
            <div className="dispatch-banner animate-fade-in">
              <span className="dispatch-truck-icon">🚛</span>
              <div className="dispatch-banner-content">
                <div className="dispatch-banner-title">Truck dispatched</div>
                <div className="dispatch-banner-sub">{complaint.dispatchNote}</div>
                {complaint.assignedTo && (
                  <div className="dispatch-banner-sub">Worker: {complaint.assignedTo.name}</div>
                )}
              </div>
              {complaint.estimatedArrival && (
                <span className="dispatch-eta">ETA {complaint.estimatedArrival}</span>
              )}
            </div>
          )}

          {/* Complaint details */}
          <div className="card animate-slide-up">
            <h3 style={{ marginBottom: "1rem" }}>Complaint Details</h3>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Description</div>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>{complaint.description}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Reported By</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{complaint.userId?.name || "—"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{complaint.userId?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Location</div>
                  <div style={{ fontSize: "0.88rem" }}>{complaint.address || "—"}</div>
                  {complaint.ward && <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Ward {complaint.ward}</div>}
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-light)", fontFamily: "monospace", marginTop: "0.2rem" }}>
                    {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          {complaint.imageUrl && (
            <div className="card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
              <img src={complaint.imageUrl} alt="Complaint" style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                Photo submitted by citizen
              </div>
            </div>
          )}

          {/* Map */}
          {hasCoords && (
            <div className="card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: "0.9rem" }}>
                📍 Complaint Location
              </div>
              <MapContainer
                center={[complaint.latitude, complaint.longitude]}
                zoom={15}
                style={{ height: 260 }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[complaint.latitude, complaint.longitude]}>
                  <Popup>{complaint.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        {/* Right column — actions */}
        <div style={{ display: "grid", gap: "1.25rem" }}>

          {/* Status update */}
          <div className="card animate-slide-up">
            <h3 style={{ marginBottom: "1rem" }}>Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="form-grid">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={statusForm.status}
                  onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="reported">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Comment (optional)</label>
                <textarea className="form-textarea" rows={3}
                  placeholder="Add a note about this status change..."
                  value={statusForm.comment}
                  onChange={e => setStatusForm(f => ({ ...f, comment: e.target.value }))}
                  style={{ minHeight: 72 }} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={updatingStatus}>
                {updatingStatus ? <><span className="btn-spinner" /> Updating...</> : "Update Status"}
              </button>
            </form>
          </div>

          {/* Dispatch truck */}
          <div className="card animate-slide-up" style={{ border: "2px solid #fcd34d", background: "linear-gradient(135deg, #fffbeb, #ffffff)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem", animation: "truckRide 2s ease-in-out infinite", display: "inline-block" }}>🚛</span>
              <h3>Dispatch Truck</h3>
            </div>
            <form onSubmit={handleDispatch} className="form-grid">
              <div className="form-group">
                <label className="form-label">Assign Worker</label>
                <select className="form-select" value={dispatchForm.workerId}
                  onChange={e => setDispatchForm(f => ({ ...f, workerId: e.target.value }))} required>
                  <option value="">Select a worker...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                  {workers.length === 0 && (
                    <option disabled>No workers registered yet</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dispatch Note</label>
                <textarea className="form-textarea" rows={2}
                  placeholder="Instructions for the worker..."
                  value={dispatchForm.dispatchNote}
                  onChange={e => setDispatchForm(f => ({ ...f, dispatchNote: e.target.value }))}
                  style={{ minHeight: 64 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Arrival</label>
                <input className="form-input" placeholder="e.g. 30 mins, 2 hours"
                  value={dispatchForm.estimatedArrival}
                  onChange={e => setDispatchForm(f => ({ ...f, estimatedArrival: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-warning btn-full" disabled={dispatching}>
                {dispatching
                  ? <><span className="btn-spinner" style={{ borderTopColor: "#fff" }} /> Dispatching...</>
                  : "🚛 Dispatch Truck"}
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