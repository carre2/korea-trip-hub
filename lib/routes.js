// Every public page path, derived from data — used by app/sitemap.js AND scripts/verify-seo.mjs.
// One list means the sitemap can never drift from what the build actually emits:
// the verifier diffs sitemap URLs against the generated HTML files and fails on either side.
import dest from "../data/destinations.json";
import plan from "../data/plan.json";
import { visaCountryCodes } from "./visa";

/** Locale-relative paths ("" = locale home), with the priority hint used by the sitemap. */
export function pagePaths() {
  return [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "destinations", priority: 0.8, changeFrequency: "weekly" },
    { path: "food", priority: 0.8, changeFrequency: "weekly" },
    ...plan.order.map((s) => ({ path: `plan/${s}`, priority: 0.7, changeFrequency: "monthly" })),
    ...Object.keys(dest.items).map((s) => ({ path: `destinations/${s}`, priority: 0.7, changeFrequency: "monthly" })),
    ...visaCountryCodes.map((c) => ({ path: `visa/${c}`, priority: 0.9, changeFrequency: "monthly" })),
  ];
}
