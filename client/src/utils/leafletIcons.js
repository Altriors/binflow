import L from "leaflet";

let configured = false;

export function ensureLeafletIcons() {
  if (configured) return;
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  configured = true;
}

export function createPulseMarkerIcon() {
  return L.divIcon({
    className: "pulse-marker-wrap",
    html: `<div class="pulse-marker"><div class="pulse-marker-core"></div><div class="pulse-marker-ring"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}
