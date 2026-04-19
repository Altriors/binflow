import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default marker icon (common Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ latitude, longitude, onLocationChange }) {
  const hasCoords = latitude && longitude;
  const center = hasCoords
    ? [parseFloat(latitude), parseFloat(longitude)]
    : [17.385, 78.4867]; // default: Hyderabad

  return (
    <div className="map-picker-container">
      <div className="map-picker-toolbar">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              (pos) => onLocationChange(pos.coords.latitude, pos.coords.longitude),
              () => {},
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}
        >
          📍 Use my location
        </button>
        {hasCoords && (
          <span className="map-picker-coords">
            {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}
          </span>
        )}
        <span className="map-picker-hint">Or click anywhere on the map to drop a pin</span>
      </div>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 280, width: "100%" }}
        key={`${latitude}-${longitude}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <ClickHandler onLocationChange={onLocationChange} />
        {hasCoords && <Marker position={[parseFloat(latitude), parseFloat(longitude)]} />}
      </MapContainer>
    </div>
  );
}