// Locale-aware resolvers for the multi-file translated content
// (stay / itineraries): English base + a full per-locale copy in
// data/<name>.<locale>.json. Falls back to English for any locale
// without a translation. `ui` inside each file holds the page-chrome labels.
import stayEn from "../data/stay.json";
import stayJa from "../data/stay.ja.json";
import stayZh from "../data/stay.zh.json";
import stayZhTW from "../data/stay.zh-TW.json";
import stayVi from "../data/stay.vi.json";
import stayTh from "../data/stay.th.json";
import stayId from "../data/stay.id.json";
import stayEs from "../data/stay.es.json";
import stayMs from "../data/stay.ms.json";
import stayKo from "../data/stay.ko.json";

import itinEn from "../data/itineraries.json";
import itinJa from "../data/itineraries.ja.json";
import itinZh from "../data/itineraries.zh.json";
import itinZhTW from "../data/itineraries.zh-TW.json";
import itinVi from "../data/itineraries.vi.json";
import itinTh from "../data/itineraries.th.json";
import itinId from "../data/itineraries.id.json";
import itinEs from "../data/itineraries.es.json";
import itinMs from "../data/itineraries.ms.json";
import itinKo from "../data/itineraries.ko.json";

const STAY = {
  en: stayEn, ja: stayJa, zh: stayZh, "zh-TW": stayZhTW, vi: stayVi,
  th: stayTh, id: stayId, es: stayEs, ms: stayMs, ko: stayKo,
};
const ITIN = {
  en: itinEn, ja: itinJa, zh: itinZh, "zh-TW": itinZhTW, vi: itinVi,
  th: itinTh, id: itinId, es: itinEs, ms: itinMs, ko: itinKo,
};

export const stayFor = (locale) => STAY[locale] || stayEn;
export const itinFor = (locale) => ITIN[locale] || itinEn;

/** Fill {city}/{n} style placeholders in a ui label. */
export function fill(str, vars) {
  let out = str || "";
  for (const [k, v] of Object.entries(vars || {})) out = out.split(`{${k}}`).join(String(v));
  return out;
}
