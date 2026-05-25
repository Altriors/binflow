import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getMyComplaints } from "../services/complaints";
import StatusBadge from "../components/StatusBadge";
import CitizenShell from "../components/citizen/CitizenShell";
import AnimatedCard, { StaggerGrid } from "../components/citizen/AnimatedCard";

function formatDate(v) {
  if (!v) return "-";
  return new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const categoryLabels = {
  overflowing_bin: "Overflowing Bin",
  missed_pickup: "Missed Pickup",
  roadside_dumping: "Roadside Dumping",
  dead_animal: "Dead Animal",
  other: "Other",
};

export default function MyComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyComplaints();
        if (!res?.success) throw new Error(res?.message || "Could not load.");
        setItems(res.data.items || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Could not load complaints.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <CitizenShell>
        <div className="loading-spinner">Loading complaints…</div>
      </CitizenShell>
    );
  }

  return (
    <CitizenShell>
      <div className="section-header animate-fade-in">
        <motion.div
          className="page-header-dashboard"
          style={{ flex: 1, marginBottom: 0 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="page-title">My Complaints</h2>
          <p className="text-sm text-muted" style={{ marginTop: "0.2rem" }}>
            {items.length} complaint{items.length !== 1 ? "s" : ""} submitted
          </p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/complaints/new" className="btn btn-primary btn-sm">
            + Report Issue
          </Link>
        </motion.div>
      </div>

      {items.length === 0 ? (
        <motion.div
          className="empty-state card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="empty-state-icon">📭</span>
          <h3>No complaints yet</h3>
          <p>You haven't submitted any complaints yet.</p>
          <Link to="/complaints/new" className="btn btn-primary btn-glow" style={{ marginTop: "1.25rem" }}>
            Report your first issue
          </Link>
        </motion.div>
      ) : (
        <StaggerGrid className="card-grid">
          {items.map((item, i) => (
            <AnimatedCard
              key={item._id}
              className="complaint-card citizen-complaint-card"
              delay={i * 0.05}
              as="article"
            >
              <div className={`complaint-card-accent accent-${item.status}`} />

              {item.imageUrl && (
                <div className="complaint-card-thumb">
                  <img src={item.imageUrl} alt={item.title} loading="lazy" />
                </div>
              )}

              <div className="complaint-card-body">
                <div className="complaint-card-header">
                  <h3 className="complaint-card-title">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>

                {item.description && <p className="complaint-card-desc">{item.description}</p>}

                {item.status === "assigned" && item.dispatchNote && (
                  <div className="dispatch-banner" style={{ padding: "0.5rem 0.75rem" }}>
                    <span className="dispatch-truck-icon" style={{ fontSize: "1.1rem" }}>
                      🚛
                    </span>
                    <div className="dispatch-banner-content">
                      <div className="dispatch-banner-title" style={{ fontSize: "0.8rem" }}>
                        Truck dispatched
                      </div>
                      <div className="dispatch-banner-sub" style={{ fontSize: "0.76rem" }}>
                        {item.dispatchNote}
                      </div>
                    </div>
                    {item.estimatedArrival && <span className="dispatch-eta">ETA {item.estimatedArrival}</span>}
                  </div>
                )}

                <div className="complaint-card-meta">
                  <span>{categoryLabels[item.category] || item.category}</span>
                  <StatusBadge status={item.priority} type="priority" />
                  {item.ward && <span>Ward {item.ward}</span>}
                </div>

                <div className="complaint-card-footer">
                  <span>Submitted {formatDate(item.createdAt)}</span>
                  {item.resolvedAt && (
                    <span style={{ color: "var(--color-primary)" }}>✓ Resolved {formatDate(item.resolvedAt)}</span>
                  )}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </StaggerGrid>
      )}
    </CitizenShell>
  );
}
