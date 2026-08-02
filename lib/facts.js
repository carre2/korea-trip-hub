// Facts accessor — enforces the HARNESS rule: only VERIFIED facts render.
import factsData from "../data/facts.json";

const byId = Object.fromEntries((factsData.facts || []).map((f) => [f.id, f]));

/** Return a fact only if it is VERIFIED; otherwise null (never render TODO/STALE). */
export function fact(id) {
  const f = byId[id];
  if (!f || f.status !== "VERIFIED") return null;
  return f;
}

/** Raw fact regardless of status (for admin/debug views only). */
export function factRaw(id) {
  return byId[id] || null;
}

/** True if a fact is verified and safe to show. */
export function isVerified(id) {
  return !!fact(id);
}

/** List of ids still needing verification (for the content TODO dashboard). */
export function pendingFactIds() {
  return (factsData.facts || [])
    .filter((f) => f.status && f.status !== "VERIFIED")
    .map((f) => f.id);
}

export const factsUpdated = factsData._updated || null;
