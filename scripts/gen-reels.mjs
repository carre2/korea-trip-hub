#!/usr/bin/env node
// Reels draft generator: verified facts → reel script + caption + affiliate links.
//
//   npm run gen:reels                      # every eligible festival
//   npm run gen:reels -- --id seoul-lantern-2026
//   npm run gen:reels -- --today 2026-12-01 --out marketing/reels/test
//
// Output: marketing/reels/<today>/<event-id>/{script.md, caption.txt, links.json}
// plus marketing/reels/<today>/README.md (Korean review sheet).
//
// HARNESS rules enforced here (the generator refuses rather than guesses):
//   · Every date, venue and official link comes from a VERIFIED fact in
//     data/facts.json. No prices, durations or other numbers are written.
//   · Skips events whose fact is missing, not VERIFIED, overdue for re-check,
//     or already ended. VOLATILE facts always carry "as of <verified>".
//   · Provisional/projected schedules are labelled as such.
//   · Caption line 1 is the affiliate disclosure. Affiliate URLs come from
//     lib/booking.js (the same IDs the site uses), never typed by hand.
// Drafts are NOT publish-ready: a human runs the checklist in README.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { klookSearch, stay22Hotels } from "../lib/booking.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const today = opt("today") || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // KST
const onlyId = opt("id");
const outDir = path.resolve(ROOT, opt("out") || path.join("marketing", "reels", today));

// ---- data -----------------------------------------------------------------
const facts = new Map(read("data/facts.json").facts.map((f) => [f.id, f]));
const festivals = read("data/festivals.json").items;
const ui = read("data/festivals-ui.json").en;

// ---- formatting helpers (UTC-safe, no locale surprises) ---------------------
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const parts = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};
function shortRange(a, b) {
  const s = parts(a), e = parts(b);
  if (s.y === e.y && s.m === e.m) return `${MON[s.m]} ${s.d} – ${e.d}, ${e.y}`;
  if (s.y === e.y) return `${MON[s.m]} ${s.d} – ${MON[e.m]} ${e.d}, ${e.y}`;
  return `${MON[s.m]} ${s.d}, ${s.y} – ${MON[e.m]} ${e.d}, ${e.y}`;
}
function spokenRange(a, b) {
  const s = parts(a), e = parts(b);
  const yearS = s.y === e.y ? "" : `, ${s.y}`;
  return `${MONTH[s.m]} ${s.d}${yearS} to ${MONTH[e.m]} ${e.d}, ${e.y}`;
}
const shortDate = (iso) => {
  const p = parts(iso);
  return `${MON[p.m]} ${p.d}, ${p.y}`;
};
const hashtag = (s) => "#" + s.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map((w) => w[0]?.toUpperCase() + w.slice(1)).join("");
const host = (u) => {
  try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; }
};

const CITY_TAGS = {
  seoul: ["#VisitSeoul", "#SeoulTravel"],
  busan: ["#VisitBusan", "#BusanTravel"],
  hwacheon: ["#Gangwon", "#GangwonDo"],
  gapyeong: ["#Gapyeong", "#DayTripFromSeoul"],
  jinju: ["#Jinju"],
};
const SEASON_TAG = (iso) => {
  const m = parts(iso).m;
  return m === 11 || m <= 1 ? "#KoreaWinter" : m <= 4 ? "#KoreaSpring" : m <= 7 ? "#KoreaSummer" : "#KoreaAutumn";
};

// ---- eligibility gate -------------------------------------------------------
function gate(item) {
  const f = facts.get(item.factId);
  if (!f) return { skip: `fact ${item.factId} not found` };
  if (f.status !== "VERIFIED") return { skip: `fact status is ${f.status}` };
  if (f.recheck_after && f.recheck_after < today) return { skip: `fact overdue for re-check (${f.recheck_after})` };
  const v = f.value || {};
  if (!v.start || !v.end) return { skip: "fact has no start/end dates" };
  if (v.end < today) return { skip: `event ended ${v.end}` };
  if (!ui.events?.[item.id]?.name) return { skip: "no English name in festivals-ui.json" };
  const provisional = /provisional|projected|tentative/i.test(`${f.notes || ""} ${f.claim || ""}`);
  return { f, v, provisional };
}

// ---- builders ---------------------------------------------------------------
function buildLinks(item, v) {
  const landing = new URL(`https://ktriphub.com/en/festivals/`);
  landing.searchParams.set("utm_source", "instagram");
  landing.searchParams.set("utm_medium", "social");
  landing.searchParams.set("utm_campaign", `reel-${item.id}`);
  landing.hash = item.id;
  return {
    bioLanding: landing.toString(),
    official: v.official || null,
    klook: item.klookSearch ? klookSearch(item.klookSearch) : null,
    stay22: stay22Hotels(v.map || v.venue) || null,
  };
}

function buildCaption(item, g, links) {
  const { f, v, provisional } = g;
  const ev = ui.events[item.id];
  const status = provisional ? "provisional" : "announced";
  const offers = [links.klook && "🎟️ tickets & tours", links.stay22 && "🏨 stays nearby"].filter(Boolean).join(" + ");
  const tags = [hashtag(ev.name), ...(CITY_TAGS[item.city] || []), SEASON_TAG(v.start), "#KoreaTravel", "#TravelKorea"];
  const lines = [
    "#ad — this post has affiliate links. Booking through them costs you nothing extra.",
    "",
    `${item.icon || "📍"} ${ev.name}`,
    ev.description,
    "",
    `📅 ${shortRange(v.start, v.end)} (${status} — as of ${shortDate(f.verified)})`,
    `📍 ${v.venue}`,
    v.official ? `✅ Check the final dates & hours before you go: ${host(v.official)}` : null,
    "",
    offers ? `${offers} → link in bio` : "More details → link in bio",
    "Save this for your Korea trip ✨",
    "",
    [...new Set(tags)].join(" "),
  ];
  return lines.filter((l) => l !== null).join("\n");
}

function buildScript(item, g, links) {
  const { f, v, provisional } = g;
  const ev = ui.events[item.id];
  const spoken = spokenRange(v.start, v.end);
  const hooks = [
    `${item.icon || "✨"} ${ev.name} — save this for your Korea trip`,
    `Going to Korea ${SEASON_TAG(v.start).replace("#Korea", "this ").toLowerCase()}? Don't miss this.`,
    `${ev.description.split(/[.—]/)[0].trim()}.`,
  ];
  const narration = [
    `${ev.description}`,
    `It's the ${ev.name}.`,
    `It runs from ${spoken}${provisional ? ", but these dates are still provisional" : ""}.`,
    `Check the official site before you go.`,
    `Tickets, tours and places to stay are linked in my bio.`,
  ];
  const scenes = [
    ["0–2s", "HOOK", hooks[0], "가장 강한 실사 컷 1장 (행사 현장 / 공식·라이선스 사진)"],
    ["2–6s", "WHAT", ev.name, "행사 대표 장면 (광각)"],
    ["6–10s", "WHEN", `${shortRange(v.start, v.end)}${provisional ? " (provisional)" : ""}`, "디테일 컷 (조명·체험 등)"],
    ["10–14s", "WHERE", v.venue.split(",").slice(-2).join(",").trim(), "위치를 알 수 있는 컷 또는 지도 캡처"],
    ["14–18s", "CTA", offers(links), "엔딩 카드: 'Link in bio' + ktriphub 로고"],
  ];
  const md = [
    `# Reel draft — ${ev.name}`,
    ``,
    `- Event id: \`${item.id}\` · Fact: \`${f.id}\` (${f.status}, verified ${f.verified}, recheck_after ${f.recheck_after || "—"})`,
    `- Source: ${f.source} (${f.source_name || ""})`,
    `- Schedule: ${v.start} → ${v.end}${provisional ? " · **PROVISIONAL** — 캡션·나레이션에 provisional 표기 유지" : ""}`,
    f.notes ? `- Fact notes: ${f.notes}` : null,
    ``,
    `## Hook options (pick one)`,
    ...hooks.map((h, i) => `${i + 1}. ${h}`),
    ``,
    `## Storyboard (9:16, ~18s)`,
    `| Time | Beat | On-screen text | Visual |`,
    `|---|---|---|---|`,
    ...scenes.map((s) => `| ${s.join(" | ")} |`),
    ``,
    `## Narration (TTS-ready, EN)`,
    ...narration.map((n) => `> ${n}`),
    ``,
    `## Visual rules`,
    `- 실사 이미지는 자체 촬영 또는 라이선스가 확인된 것만 사용 (출처를 README에 기록).`,
    `- AI 영상화(Google Flow 등)는 **카메라 움직임만** 허용: slow push-in, gentle pan, parallax.`,
    `  실제 장소에 없는 날씨·계절·시설·인파를 추가하지 않는다.`,
    `- AI로 움직임을 준 컷이 있으면 업로드 시 인스타그램 AI 라벨을 켠다.`,
    `- 인물이 식별되는 사진, 타인의 리뷰 사진은 쓰지 않는다.`,
    ``,
    `## Links`,
    "```json",
    JSON.stringify(links, null, 2),
    "```",
  ];
  return md.filter((l) => l !== null).join("\n") + "\n";
  function offers(l) {
    return [l.klook && "Tickets & tours", l.stay22 && "Stays nearby"].filter(Boolean).join(" · ") + " → link in bio";
  }
}

// Self-check: every date in the caption must match the fact exactly.
function assertFaithful(caption, g) {
  const want = shortRange(g.v.start, g.v.end);
  if (!caption.includes(want)) throw new Error(`caption date drift: expected "${want}"`);
  if (!caption.startsWith("#ad")) throw new Error("caption must start with the #ad disclosure");
  if (/[₩$€]|\bKRW\b|\babout \d|\baround \d|\bapprox/i.test(caption)) throw new Error("caption contains a price/approximation");
}

// ---- run --------------------------------------------------------------------
const made = [];
const skipped = [];
for (const item of festivals) {
  if (onlyId && item.id !== onlyId) continue;
  const g = gate(item);
  if (g.skip) {
    skipped.push([item.id, g.skip]);
    continue;
  }
  const links = buildLinks(item, g.v);
  const caption = buildCaption(item, g, links);
  assertFaithful(caption, g);
  const dir = path.join(outDir, item.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "caption.txt"), caption + "\n");
  fs.writeFileSync(path.join(dir, "script.md"), buildScript(item, g, links));
  fs.writeFileSync(path.join(dir, "links.json"), JSON.stringify(links, null, 2) + "\n");
  made.push({ id: item.id, name: ui.events[item.id].name, provisional: g.provisional, verified: g.f.verified });
}

if (onlyId && !made.length && !skipped.length) {
  console.error(`✗ no festival with id "${onlyId}"`);
  process.exit(1);
}

if (made.length) {
  const readme = [
    `# 릴스 초안 — ${today}`,
    ``,
    `\`npm run gen:reels\`로 생성한 초안입니다. **아래 체크리스트를 통과하기 전에는 게시하지 않습니다.**`,
    ``,
    `| 이벤트 | 일정 상태 | 검증일 | 이미지 출처 | 게시 |`,
    `|---|---|---|---|---|`,
    ...made.map((m) => `| ${m.name} (\`${m.id}\`) | ${m.provisional ? "잠정" : "확정"} | ${m.verified} | (기록) | ☐ |`),
    ``,
    `## 게시 전 체크리스트`,
    `- [ ] 캡션 첫 줄이 #ad 공개 문구인가`,
    `- [ ] 날짜가 공식 사이트와 지금도 같은가 (잠정이면 provisional 표기 유지)`,
    `- [ ] 가격·소요시간 등 facts에 없는 숫자를 추가하지 않았는가`,
    `- [ ] 이미지 라이선스를 확인하고 출처를 표에 적었는가`,
    `- [ ] AI 영상화는 카메라 움직임만 넣었는가 (날씨·시설 추가 금지) / AI 라벨을 켰는가`,
    `- [ ] 바이오 링크가 links.json의 bioLanding인가 (Klook·Stay22 버튼이 페이지에 보이는가)`,
    `- [ ] Klook 검색 링크를 눌렀을 때 해당 상품이 실제로 나오는가`,
    skipped.length ? `` : null,
    skipped.length ? `## 건너뛴 항목` : null,
    ...skipped.map(([id, why]) => `- \`${id}\`: ${why}`),
  ].filter((l) => l !== null);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "README.md"), readme.join("\n") + "\n");
}

console.log(`Reels drafts — ${today}`);
made.forEach((m) => console.log(`  ✓ ${m.id}${m.provisional ? " (provisional)" : ""}`));
skipped.forEach(([id, why]) => console.log(`  · skip ${id}: ${why}`));
console.log(made.length ? `\n  → ${path.relative(ROOT, outDir)}` : "\n  nothing generated.");
