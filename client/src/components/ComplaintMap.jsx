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
    <div className="complaint-map-wrap">
      <div className="map-picker-body" style={{ height }}>
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

      <div className="complaint-map-footer">
        <div className="complaint-map-location-text">
          {address ? <strong>{address}</strong> : null}
          <span className="complaint-map-coords">{coords.label}</span>
        </div>
        {showNavigate && (
          <a
            href={googleMapsDirectionsUrl(coords.lat, coords.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            🧭 Navigate
          </a>
        )}
      </div>
    </div>
  );
}
