import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import ComplaintMap, { parseCoords, googleMapsDirectionsUrl } from "../../components/ComplaintMap";

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function WorkerComplaintDetailPage() {
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

  if (loading) return <div className="loading-spinner">Loading job...</div>;
  if (!complaint) {
    return (
      <div className="page-wrapper">
        <div className="empty-state"><span className="empty-state-icon">❌</span><h3>Job not found</h3></div>
      </div>
    );
  }

  const coords = parseCoords(complaint.latitude, complaint.longitude);

  return (
    <div className="page-wrapper">
      <Link to="/worker" className="back-link">
        ← My Assignments
      </Link>

      <div className="animate-fade-in" style={{ marginBottom: "1.25rem" }}>
        <h2 className="page-title" style={{ marginBottom: "0.35rem", fontSize: "1.35rem" }}>{complaint.title}</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <StatusBadge status={complaint.status} />
          <StatusBadge status={complaint.priority} type="priority" />
          <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
            {categoryLabels[complaint.category] || complaint.category}
          </span>
        </div>
      </div>

      {complaint.dispatchNote && (
        <div className="dispatch-banner animate-fade-in" style={{ marginBottom: "1.25rem" }}>
          <span className="dispatch-truck-icon">🚛</span>
          <div className="dispatch-banner-content">
            <div className="dispatch-banner-title">Dispatch instructions</div>
            <div className="dispatch-banner-sub">{complaint.dispatchNote}</div>
          </div>
          {complaint.estimatedArrival && (
            <span className="dispatch-eta">ETA {complaint.estimatedArrival}</span>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: "1.25rem", maxWidth: 720 }}>
        <div className="card animate-slide-up">
          <h3 style={{ marginBottom: "0.75rem" }}>Details</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>{complaint.description}</p>
          <div style={{ fontSize: "0.88rem" }}>
            <strong>Location:</strong>{" "}
            {complaint.address || (coords ? coords.label : "No address on file")}
            {complaint.ward && (
              <span style={{ color: "var(--color-text-muted)" }}> · Ward {complaint.ward}</span>
            )}
          </div>
        </div>

        <div className="card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
          <div className="complaint-map-header">📍 Job location</div>
          <ComplaintMap
            latitude={complaint.latitude}
            longitude={complaint.longitude}
            title={complaint.title}
            address={complaint.address}
            height={260}
            showNavigate
          />
        </div>

        {coords && (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a
              href={googleMapsDirectionsUrl(coords.lat, coords.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🧭 Open directions in Google Maps
            </a>
          </div>
        )}

        {complaint.imageUrl && (
          <div className="card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
            <img src={complaint.imageUrl} alt="Site" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
          </div>
        )}

        <div className="card animate-slide-up">
          <h3 style={{ marginBottom: "1rem" }}>Update progress</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {complaint.status === "assigned" && (
              <button
                type="button"
                className="btn btn-primary btn-full"
                disabled={updating}
                onClick={() => updateStatus("in_progress")}
              >
                {updating ? <><span className="btn-spinner" /> Updating...</> : "▶ Mark In Progress (arrived on site)"}
              </button>
            )}
            {(complaint.status === "assigned" || complaint.status === "in_progress") && (
              <button
                type="button"
                className="btn btn-secondary btn-full"
                disabled={updating || complaint.status === "resolved"}
                onClick={() => updateStatus("resolved")}
              >
                {updating ? <><span className="btn-spinner" /> Updating...</> : "✓ Mark Resolved"}
              </button>
            )}
            {complaint.status === "resolved" && (
              <p style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 600 }}>This job is resolved.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
