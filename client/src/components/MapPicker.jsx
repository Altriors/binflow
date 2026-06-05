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
    <div className="border rounded-2xl overflow-hidden shadow-sm transition-colors border-slate-200 dark:border-[#172026] bg-slate-50/50 dark:bg-[#0e141a]/40">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-200 dark:border-[#172026] bg-slate-100/50 dark:bg-[#0e141a]/60">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer bg-white hover:bg-slate-50 text-slate-800 border-slate-200 dark:bg-[#111827] dark:hover:bg-[#182236] dark:text-white dark:border-[#1e293b]"
        >
          {locating ? (
            <>
              <span className="h-3 w-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" />
              Locating…
            </>
          ) : (
            "📍 Use my location"
          )}
        </button>
        {coords ? (
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400 shrink-0">
            {coords.label}
          </span>
        ) : (
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-gray-500 dark:border-[#1e293b] shrink-0">
            No pin yet
          </span>
        )}
        <span className="text-[10px] font-semibold text-gray-500 hidden sm:inline">
          Or tap the map to drop a pin
        </span>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: MAP_HEIGHT }}>
        {!mapReady && <MapLoader label="Initializing map…" />}

        {mapReady && (
          <MapContainer
            center={center}
            zoom={zoom}
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
