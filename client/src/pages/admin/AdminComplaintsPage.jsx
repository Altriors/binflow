import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";

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

export default function AdminComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const filters = {
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    ward: searchParams.get("ward") || "",
  };

  useEffect(() => {
    load();
  }, [searchParams, page]);

  async function load() {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.ward) params.ward = filters.ward;
      const res = await api.get("/complaints", { params });
      if (res.data?.success) {
        setItems(res.data.data.items || []);
        setTotal(res.data.data.total || 0);
      }
    } catch {
      toast.error("Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  }

  return (
    <div className="page-wrapper">
      <div className="page-header page-header-dashboard animate-fade-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="page-title">All Complaints</h2>
          <p>{total} total complaints</p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Dashboard</Link>
      </div>

      {/* Filters */}
      <div className="card animate-fade-in" style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <select className="form-select" style={{ width: "auto", minWidth: 140 }}
            value={filters.status} onChange={e => setFilter("status", e.target.value)}>
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select className="form-select" style={{ width: "auto", minWidth: 160 }}
            value={filters.category} onChange={e => setFilter("category", e.target.value)}>
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <input className="form-input" style={{ width: "auto", minWidth: 120 }}
            placeholder="Ward / Zone" value={filters.ward}
            onChange={e => setFilter("ward", e.target.value)} />

          {(filters.status || filters.category || filters.ward) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setSearchParams({}); setPage(1); }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">Loading complaints...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <h3>No complaints found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="card animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Title","Category","Status","Priority","Submitted By","Date","Action"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700,
                      fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em",
                      color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: idx % 2 === 0 ? "var(--color-surface)" : "var(--color-bg)",
                      transition: "background var(--transition)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--color-primary-light)"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "var(--color-surface)" : "var(--color-bg)"}
                  >
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--color-text)", maxWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 4, height: 32, borderRadius: 2, flexShrink: 0,
                          background: item.status === "reported" ? "#6b7280"
                            : item.status === "assigned" ? "#3b82f6"
                            : item.status === "in_progress" ? "#f59e0b"
                            : item.status === "resolved" ? "#16a34a" : "#374151"
                        }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {categoryLabels[item.category] || item.category}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <StatusBadge status={item.priority} type="priority" />
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {item.userId?.name || "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--color-text-light)", whiteSpace: "nowrap" }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <Link to={`/admin/complaints/${item._id}`} className="btn btn-primary btn-sm">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1.25rem", borderTop: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button className="btn btn-secondary btn-sm" disabled={page * 20 >= total}
                  onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}