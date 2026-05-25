import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import toast from "react-hot-toast";
import api from "../../services/api";

const STATUS_COLORS = {
  reported: "#ef4444",
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#16a34a",
  closed: "#6b7280",
};

const ALL_STATUSES = ["reported","assigned","in_progress","resolved","closed"];

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/complaints/map");
        if (res.data?.success) setComplaints(res.data.data || []);
      } catch {
        toast.error("Could not load map data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visible = filter === "all" ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="page-wrapper">
      <div className="page-header page-header-dashboard animate-fade-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="page-title">Map Intelligence</h2>
          <p>{visible.length} complaints shown · click any marker for details</p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Dashboard</Link>
      </div>

      {/* Filter bar */}
      <div className="card animate-fade-in" style={{ marginBottom: "1rem", padding: "0.85rem 1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Filter:
          </span>
          <button className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter("all")}>
            All ({complaints.length})
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s}
              className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter(s)}
              style={filter !== s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] } : {}}>
              {s.replace(/_/g," ")} ({complaints.filter(c => c.status === s).length})
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border)" }}>
          {ALL_STATUSES.map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[s], flexShrink: 0 }} />
              {s.replace(/_/g," ")}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading map data...</div>
      ) : (
        <div className="card animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
          <MapContainer
            center={[17.385, 78.4867]}
            zoom={12}
            style={{ height: "70vh" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            {visible.map(c => (
              <CircleMarker
                key={c._id}
                center={[c.latitude, c.longitude]}
                radius={9}
                pathOptions={{
                  color: "#fff",
                  weight: 2,
                  fillColor: STATUS_COLORS[c.status] || "#6b7280",
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>{c.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                      {c.category?.replace(/_/g," ")} · {c.status?.replace(/_/g," ")}
                    </div>
                    <Link to={`/admin/complaints/${c._id}`}
                      style={{ fontSize: "0.82rem", color: "#16a34a", fontWeight: 600 }}>
                      View details →
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}