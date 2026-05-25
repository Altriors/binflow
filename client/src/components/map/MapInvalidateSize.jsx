import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Fixes grey/blank Leaflet tiles when map mounts inside animated or overflow-hidden parents. */
export default function MapInvalidateSize({ delay = 0 }) {
  const map = useMap();

  useEffect(() => {
    const run = () => {
      map.invalidateSize({ animate: false, pan: false });
    };

    run();
    const timers = [50, 150, 400, 800].map((ms) => setTimeout(run, ms + delay));

    const container = map.getContainer()?.parentElement;
    let observer;
    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(run);
      observer.observe(container);
    }

    window.addEventListener("resize", run);
    document.addEventListener("visibilitychange", run);

    return () => {
      timers.forEach(clearTimeout);
      observer?.disconnect();
      window.removeEventListener("resize", run);
      document.removeEventListener("visibilitychange", run);
    };
  }, [map, delay]);

  return null;
}
