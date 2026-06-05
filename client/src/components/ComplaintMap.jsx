import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ensureLeafletIcons, createPulseMarkerIcon } from "../utils/leafletIcons";
import MapInvalidateSize from "./map/MapInvalidateSize";

ensureLeafletIcons();

/** Valid coords only — empty strings must not become 0,0 (Leaflet bug on customer form). */
export function parseCoords(latitude, longitude) {
  if (latitude === "" || latitude == null || longitude === "" || longitude == null) {
    return null;
  }
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
}

export function googleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function googleMapsSearchUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function MapFlyTo({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], zoom, { duration: 0.7 });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

/**
 * Read-only map for worker/admin views with optional external navigation link.
 */
export default function ComplaintMap({
  latitude,
  longitude,
  title = "Complaint location",
  height = 240,
  zoom = 16,
  showNavigate = true,
  address,
}) {
  const coords = parseCoords(latitude, longitude);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!coords) {
    return (
      <div className="map-empty-state">
        <span>📍</span>
        <p>No GPS coordinates saved for this complaint.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl overflow-hidden border-slate-200 dark:border-[#172026] bg-slate-50/50 dark:bg-[#0e141a]/40 shadow-sm">
      <div className="relative w-full overflow-hidden" style={{ height }}>
        {ready && (
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={zoom}
            style={{ height: "100%", width: "100%", minHeight: height }}
            scrollWheelZoom
            whenReady={(e) => e.target.invalidateSize()}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <MapInvalidateSize />
            <MapFlyTo lat={coords.lat} lng={coords.lng} zoom={zoom} />
            <Marker position={[coords.lat, coords.lng]} icon={createPulseMarkerIcon()}>
              <Popup>{title}</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 p-3.5 border-t border-slate-200 dark:border-[#172026] bg-slate-100/30 dark:bg-[#0e141a]/60">
        <div className="flex flex-col text-xs max-w-[70%]">
          {address ? <strong className="truncate font-bold text-slate-800 dark:text-white mb-0.5">{address}</strong> : null}
          <span className="text-[10px] font-mono text-gray-500 font-medium">{coords.label}</span>
        </div>
        {showNavigate && (
          <a
            href={googleMapsDirectionsUrl(coords.lat, coords.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-md shadow-emerald-500/10 transition-all cursor-pointer shrink-0"
          >
            🧭 Navigate
          </a>
        )}
      </div>
    </div>
  );
}
