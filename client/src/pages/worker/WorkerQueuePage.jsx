import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { parseCoords, googleMapsDirectionsUrl } from "../../components/ComplaintMap";

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function WorkerQueuePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/complaints/assigned");
        if (res.data?.success) setItems(res.data.data.items || []);
      } catch {
        toast.error("Could not load your queue.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading-spinner">Loading your queue...</div>;

  return (
    <div className="page-wrapper">
      <div className="section-header animate-fade-in">
        <div className="page-header-dashboard" style={{ flex: 1, marginBottom: 0 }}>
          <h2 className="page-title">My Assignments</h2>
          <p className="text-sm text-muted" style={{ marginTop: "0.2rem" }}>
            {items.length} active job{items.length !== 1 ? "s" : ""} dispatched to you
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">✅</span>
          <h3>No active assignments</h3>
          <p>When an admin dispatches a truck to you, jobs will appear here.</p>
        </div>
      ) : (
        <div className="card-grid stagger">
          {items.map((item) => (
            <article
              key={item._id}
              className="complaint-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/worker/${item._id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/worker/${item._id}`)}
            >
              <div className={`complaint-card-accent accent-${item.status}`} />
              <div className="complaint-card-body">
                <div className="complaint-card-header">
                  <h3 className="complaint-card-title">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>

                {item.dispatchNote && (
                  <div className="dispatch-banner" style={{ padding: "0.5rem 0.75rem", marginBottom: "0.5rem" }}>
                    <span className="dispatch-truck-icon" style={{ fontSize: "1.1rem" }}>🚛</span>
                    <div className="dispatch-banner-content">
                      <div className="dispatch-banner-title" style={{ fontSize: "0.8rem" }}>Dispatch note</div>
                      <div className="dispatch-banner-sub" style={{ fontSize: "0.76rem" }}>{item.dispatchNote}</div>
                    </div>
                    {item.estimatedArrival && (
                      <span className="dispatch-eta">ETA {item.estimatedArrival}</span>
                    )}
                  </div>
                )}

                <div className="complaint-card-meta">
                  <span>{categoryLabels[item.category] || item.category}</span>
                  <StatusBadge status={item.priority} type="priority" />
                </div>

                {(() => {
                  const coords = parseCoords(item.latitude, item.longitude);
                  return (
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>
                      📍 {item.address || coords?.label || "No location saved"}
                      {item.ward && <span> · Ward {item.ward}</span>}
                    </div>
                  );
                })()}

                <div className="complaint-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <span>Open job →</span>
                  {parseCoords(item.latitude, item.longitude) && (
                    <a
                      href={googleMapsDirectionsUrl(
                        Number(item.latitude),
                        Number(item.longitude)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🧭 Navigate
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
