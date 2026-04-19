import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyComplaints } from "../services/complaints";
import StatusBadge from "../components/StatusBadge";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

  if (loading) return <div className="loading-spinner">Loading complaints...</div>;

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <div>
          <h2>My Complaints</h2>
          <p className="text-sm text-muted" style={{ marginTop: "0.2rem" }}>
            {items.length} complaint{items.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary btn-sm">
          + New Complaint
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No complaints yet</h3>
          <p>You haven't submitted any complaints. Report a waste issue to get started.</p>
          <Link to="/complaints/new" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Report an issue
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {items.map((item) => (
            <article key={item._id} className="complaint-card">
              <div className="complaint-card-header">
                <h3 className="complaint-card-title">{item.title}</h3>
                <StatusBadge status={item.status} />
              </div>
              {item.description && (
                <p className="complaint-card-desc">{item.description}</p>
              )}
              <div className="complaint-card-meta">
                <span>{categoryLabels[item.category] || item.category}</span>
                <StatusBadge status={item.priority} type="priority" />
                {item.ward && <span>Ward: {item.ward}</span>}
              </div>
              <div className="complaint-card-footer">
                <span>Submitted {formatDate(item.createdAt)}</span>
                {item.resolvedAt && <span>Resolved {formatDate(item.resolvedAt)}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}