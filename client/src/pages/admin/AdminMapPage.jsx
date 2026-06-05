import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { Map, Filter } from "lucide-react";

const STATUS_COLORS = {
  reported: "#ef4444",
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#16a34a",
  closed: "#6b7280",
};

const ALL_STATUSES = ["reported", "assigned", "in_progress", "resolved", "closed"];

export default function AdminMapPage() {
  const { theme } = useTheme();
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
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="text-emerald-500" size={22} />
            Map Intelligence
          </h2>
          <p className="text-xs text-gray-500">{visible.length} complaints shown · click any marker for details</p>
        </div>
        <Link 
          to="/admin" 
          className={`flex items-center gap-1.5 rounded-xl border font-bold text-xs px-4 py-2.5 hover:-translate-y-0.5 transition-all cursor-pointer
            ${theme === "dark"
              ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]"
              : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
            }
          `}
        >
          ← Dashboard
        </Link>
      </div>

      {/* Filter bar and Legend */}
      <div className={`p-4 rounded-2xl border shadow-sm transition-colors duration-300 space-y-4
        ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
      `}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-2 flex items-center gap-1.5">
            <Filter size={14} /> Filter:
          </span>
          <button 
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer
              ${filter === "all"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : (theme === "dark" ? "bg-[#111827] border-[#1e293b] text-white hover:bg-[#182236]" : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50")
              }
            `}
          >
            All ({complaints.length})
          </button>
          {ALL_STATUSES.map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer`}
              style={
                filter === s
                  ? { background: STATUS_COLORS[s], borderColor: STATUS_COLORS[s], color: "#fff" }
                  : { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] }
              }
            >
              {s.replace(/_/g," ")} ({complaints.filter(c => c.status === s).length})
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-200 dark:border-[#172026]/40">
          {ALL_STATUSES.map(s => (
            <div key={s} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s] }} />
              {s.replace(/_/g," ")}
            </div>
          ))}
        </div>
      </div>

      {/* Map View */}
      {loading ? (
        <div className="p-4 space-y-4 rounded-2xl border border-slate-200 dark:border-[#172026] animate-pulse h-[70vh]" />
      ) : (
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-colors duration-300
          ${theme === "dark" ? "bg-[#0e141a] border-[#172026]" : "bg-white border-slate-200"}
        `}>
          <div className="relative w-full h-[70vh]">
            <MapContainer
              center={[17.385, 78.4867]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
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
                    <div className="min-w-[180px] p-0.5">
                      <div className="font-bold text-slate-800 dark:text-white text-xs mb-1">{c.title}</div>
                      <div className="text-[10px] text-gray-500 mb-2">
                        {c.category?.replace(/_/g," ")} · {c.status?.replace(/_/g," ")}
                      </div>
                      <Link 
                        to={`/admin/complaints/${c._id}`}
                        className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider hover:underline"
                      >
                        View details →
                      </Link>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}