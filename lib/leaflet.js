// Lazy Leaflet loader (cdnjs, pinned 1.9.4). Shared by the place report map and
// the "map explore" tab so the library is fetched once per page.
export const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
export const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
export const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

let leafletPromise = null;
export function loadLeaflet() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.src = LEAFLET_JS; s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = () => { leafletPromise = null; resolve(null); };
    document.head.appendChild(s);
  });
  return leafletPromise;
}
