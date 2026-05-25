export default function MapLoader({ label = "Loading map…" }) {
  return (
    <div className="map-loader" aria-live="polite">
      <div className="map-loader-shimmer" />
      <div className="map-loader-pin">📍</div>
      <span>{label}</span>
    </div>
  );
}
