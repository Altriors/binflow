import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { parseCoords } from "./ComplaintMap";
import { ensureLeafletIcons, createPulseMarkerIcon } from "../utils/leafletIcons";
import { getUserLocation, geolocationErrorMessage } from "../utils/geolocation";
import MapInvalidateSize from "./map/MapInvalidateSize";
import MapLoader from "./map/MapLoader";

ensureLeafletIcons();

const DEFAULT_CENTER = [17.385, 78.4867];
const DEFAULT_ZOOM = 13;
const PIN_ZOOM = 16;
const MAP_HEIGHT = 300;

function ClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyTo({ latitude, longitude, zoom }) {
  const map = useMap();
  const coords = parseCoords(latitude, longitude);

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], zoom, { duration: 0.85, easeLinearity: 0.25 });
    }
  }, [coords?.lat, coords?.lng, zoom, map]);

  return null;
}

export default function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  onLocationError,
  onLocationInfo,
}) {
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const locateRunRef = useRef(0);

  const coords = parseCoords(latitude, longitude);
  const center = coords ? [coords.lat, coords.lng] : DEFAULT_CENTER;
  const zoom = coords ? PIN_ZOOM : DEFAULT_ZOOM;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleUseMyLocation = useCallback(async () => {
    const runId = ++locateRunRef.current;
    setLocating(true);

    try {
      const result = await getUserLocation();
      if (locateRunRef.current !== runId) return;

      onLocationChange(result.lat, result.lng);

      if (result.approximate) {
        onLocationInfo?.(
          "Using approximate network location (~city level). Tap the map to refine your pin."
        );
      }
    } catch (err) {
      if (locateRunRef.current !== runId) return;
      const msg = geolocationErrorMessage(err);
      if (msg) onLocationError?.(msg);
    } finally {
      if (locateRunRef.current === runId) setLocating(false);
    }
  }, [onLocationChange, onLocationError, onLocationInfo]);

  return (
    <div className="map-picker-container map-picker-premium">
      <div className="map-picker-toolbar">
        <button
          type="button"
          className="btn btn-secondary btn-sm map-picker-locate-btn"
          onClick={handleUseMyLocation}
          disabled={locating}
        >
          {locating ? (
            <>
              <span className="btn-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Locating…
            </>
          ) : (
            "📍 Use my location"
          )}
        </button>
        {coords ? (
          <span className="map-picker-coords map-picker-coords-live">{coords.label}</span>
        ) : (
          <span className="map-picker-coords map-picker-coords-empty">No pin yet</span>
        )}
        <span className="map-picker-hint">Or tap the map to drop a pin</span>
      </div>

      <div className="map-picker-body" style={{ height: MAP_HEIGHT }}>
        {!mapReady && <MapLoader label="Initializing map…" />}

        {mapReady && (
          <MapContainer
            center={center}
            zoom={zoom}
            className="map-picker-leaflet"
            style={{ height: "100%", width: "100%", minHeight: MAP_HEIGHT }}
            scrollWheelZoom
            whenReady={(e) => {
              e.target.invalidateSize();
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              maxZoom={19}
            />
            <MapInvalidateSize />
            <ClickHandler onLocationChange={onLocationChange} />
            <MapFlyTo latitude={latitude} longitude={longitude} zoom={PIN_ZOOM} />
            {coords && (
              <Marker position={[coords.lat, coords.lng]} icon={createPulseMarkerIcon()}>
                <Popup className="map-picker-popup">
                  <strong>Selected location</strong>
                  <br />
                  {coords.label}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
