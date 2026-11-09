// Korea Trip Hub Worker: serves the static export and a grounded AI help chat.
// Static pages are served from the asset store directly; this Worker only runs
// for /api/chat (POST) and for paths with no matching asset (404s).

import {entryLanguage} from '../lib/entry-language.mjs';
import {resolvePlace, buildReport, browse, BROWSE_CATS} from './tourapi.mjs';
import reportUi from '../data/place-report-ui.json';

const MODEL_CF = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"; // Workers AI (current)
const MODEL_CLAUDE = "claude-haiku-4-5-20251001";   // existing fallback when a key is set
const MODEL_OPENAI = "gpt-6-luna";
const MAX_TURNS = 12;      // recent user/assistant turns kept
const MAX_CHARS = 1500;    // per-message input cap
const MAX_TOKENS = 700;

const LANGS = {
  en: "English", zh: "Simplified Chinese", "zh-TW": "Traditional Chinese", ja: "Japanese",
  vi: "Vietnamese", th: "Thai", id: "Indonesian", es: "Spanish", ms: "Malay",
  ko: "Korean", ru: "Russian", fr: "French",
};

// Fact-safe knowledge the assistant may rely on. Verified essentials only —
// the model is told NOT to invent anything beyond this.
function systemPrompt(locale, coords) {
  const lc = LANGS[locale] ? locale : "en";
  const langName = LANGS[lc];
  const loc = coords ? `The traveler shared an approximate location: latitude ${coords.lat}, longitude ${coords.lng}.` : "The traveler has not shared a location.";
  return `You are the Korea Trip Hub Assistant — a warm, practical helper for foreign visitors to South Korea, on the site ktriphub.com.

RESPOND IN: ${langName}. Always answer in this language, whatever language the question is in. Be concise (a few short sentences or a tight list). Be calm and reassuring.

WHAT YOU HELP WITH: on-the-ground traveler problems — being overcharged or scammed, getting lost, finding food, cultural etiquette, transport, money, and visa/K-ETA/entry basics.

VERIFIED ESSENTIALS you may state (do not go beyond these specifics):
- Emergency numbers (free): 112 = police; 119 = fire and ambulance/medical. Say to call these immediately if someone is in danger or hurt.
- 1330 = the Korea Travel Hotline, run by the Korea Tourism Organization: free, 24/7, with live interpretation in several languages. It is the best first call for tourists for complaints, overcharging, directions, or help finding things. In Seoul, 120 (Dasan) handles city services.
- e-Arrival Card is free at e-arrivalcard.go.kr. K-ETA is applied for ONLY at the official site k-eta.go.kr. Many nationalities are temporarily K-ETA-exempt through 2026-12-31.
- Tipping is not expected in Korea; prices are as marked.

HANDLING KEY SITUATIONS:
- Overcharged / scammed ("바가지"): stay calm; call 1330 for interpretation and guidance; keep receipts/records; for a clear crime (theft, fraud) call 112. Prefer licensed taxis or ride-hailing apps and card/transit payment. Point them to the site's Safety guide (/${lc}/guides/korea-safety/) and Help guide (/${lc}/plan/help/).
- Lost: reassure them; suggest heading to the nearest subway station or a Tourist Information Center, and calling 1330 for directions in their language. Suggest opening Naver Map, KakaoMap or Google Maps. ${loc} If you have their location, offer a maps SEARCH link for "police station near me" / "tourist information center near me" / their embassy — build it as a Google Maps search URL like https://www.google.com/maps/search/tourist+information+center/@LAT,LNG,15z — never invent a specific address or business.
- Finding food / restaurants: send them to the site's Food page (/${lc}/food/) and its "Find top eats" tool (Google Maps, CatchTable, Naver, MICHELIN). Halal options cluster near Itaewon in Seoul. Do not invent specific restaurant names, prices or ratings.
- Cultural mistakes: reassure them locals are forgiving. Basics: take shoes off indoors, give/receive with two hands, keep quiet on transit, no tipping. Point to the Etiquette guide (/${lc}/guides/korea-etiquette/).
- Visa / K-ETA / entry: point to the Visa hub (/${lc}/plan/visa/) and per-country pages (/${lc}/visa/<country>/, e.g. /${lc}/visa/japan/). K-ETA only at k-eta.go.kr.
- Transport/airport/money/SIM/weather: point to /${lc}/plan/transit/, /${lc}/plan/airport/, /${lc}/plan/money/, /${lc}/plan/sim/, /${lc}/plan/weather/.

RULES:
- NEVER invent phone numbers, prices, addresses, business names, opening hours, exact fees, or legal advice. If you don't have a verified fact, say to confirm at an official source and give a relevant site link or the 1330 hotline.
- Immigration and officials make final decisions; frame visa/entry info as general guidance to confirm officially.
- You are NOT a substitute for emergency services — if there is real danger, tell them to call 112 or 119 now.
- When you cite a page, write it as a plain path starting with /${lc}/ (e.g. /${lc}/plan/help/). Keep links relevant and few.
- If a question is outside Korea travel help, gently steer back.`;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

async function callClaude(env, system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODEL_CLAUDE, max_tokens: MAX_TOKENS, system, messages }),
  });
  if (!res.ok) throw new Error("claude_" + res.status);
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

async function callOpenAI(env, system, messages) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      model: MODEL_OPENAI,
      instructions: system,
      input: messages,
      reasoning: { effort: "none" },
      max_output_tokens: MAX_TOKENS,
      store: false,
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const data = await res.json();
  if (data.status !== "completed") throw new Error("openai_incomplete");
  const reply = (data.output || [])
    .filter((item) => item.type === "message" && item.role === "assistant")
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text)
    .join("").trim();
  if (!reply) throw new Error("openai_empty");
  return reply;
}

async function callWorkersAI(env, system, messages) {
  const out = await env.AI.run(MODEL_CF, {
    messages: [{ role: "system", content: system }, ...messages],
    max_tokens: MAX_TOKENS,
  });
  return (out && (out.response || out.result || "")).toString().trim();
}

async function handleChat(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const messages = sanitizeMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "no_message" }, 400);
  }
  const locale = typeof body.locale === "string" && LANGS[body.locale] ? body.locale : "en";
  let coords = null;
  if (body.coords && typeof body.coords.lat === "number" && typeof body.coords.lng === "number") {
    coords = { lat: body.coords.lat.toFixed(4), lng: body.coords.lng.toFixed(4) };
  }
  const system = systemPrompt(locale, coords);

  const providers = [];
  if (env.OPENAI_API_KEY) providers.push(callOpenAI);
  if (env.ANTHROPIC_API_KEY) providers.push(callClaude);
  if (env.AI) providers.push(callWorkersAI);
  if (!providers.length) return json({ error: "no_model" }, 503);
  for (const provider of providers) {
    try {
      const reply = await provider(env, system, messages);
      if (reply) return json({ reply });
    } catch {
      // Try the next configured provider without exposing upstream errors or secrets.
    }
  }
  return json({ error: "chat_unavailable" }, 503);
}

// ---- Place Report (TourAPI) ----
// Static pages can't be pre-rendered per place, so the report page fetches these
// on the client. Both are GET, same-origin (no CORS), cached in KV when available.
async function handlePlaceResolve(request, env) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const locale = url.searchParams.get("locale") || "en";
  if (!q) return json({ ok: false, error: "empty" }, 400);
  if (!env.TOURAPI_KEY) return json({ ok: false, error: "not_configured" }, 503);
  try {
    return json(await resolvePlace(env, q, locale));
  } catch (e) {
    console.error("place/resolve", safeDetail(e));
    return json({ ok: false, error: "resolve_failed", detail: safeDetail(e) }, 502);
  }
}

async function handlePlaceReport(request, env, ctx) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const locale = url.searchParams.get("locale") || "en";
  const contentId = url.searchParams.get("contentId") || "";
  const cl = url.searchParams.get("cl") || ""; // service the contentId came from (browse list)
  const areaCode = url.searchParams.get("areaCode") || "";
  const sigunguCode = url.searchParams.get("sigunguCode") || "";
  if (!q && !areaCode) return json({ ok: false, error: "empty" }, 400);
  if (!env.TOURAPI_KEY) return json({ ok: false, error: "not_configured" }, 503);

  const opts = {};
  if (contentId) opts.contentId = contentId;
  if (contentId && cl) opts.cl = cl;
  if (areaCode) opts.areaCode = Number(areaCode);
  if (sigunguCode) opts.sigunguCode = sigunguCode;

  // v2: legal-dong (법정동) region codes — v1 entries used the retired areaCode scheme.
  const cacheKey = `report:v2:${locale}:${q.toLowerCase()}:${contentId}:${cl}:${areaCode}:${sigunguCode}`;
  const jsonHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" };
  if (env.PLACE_CACHE) {
    try {
      const hit = await env.PLACE_CACHE.get(cacheKey);
      if (hit) return new Response(hit, { headers: jsonHeaders });
    } catch { /* cache miss on error */ }
  }
  try {
    const rep = await buildReport(env, q, locale, opts);
    const payload = JSON.stringify(rep);
    if (rep.ok && env.PLACE_CACHE) {
      try { ctx.waitUntil(env.PLACE_CACHE.put(cacheKey, payload, { expirationTtl: 604800 })); } catch { /* best effort */ }
    }
    return new Response(payload, { status: rep.ok ? 200 : 404, headers: jsonHeaders });
  } catch (e) {
    console.error("place/report", safeDetail(e));
    return json({ ok: false, error: "report_failed", detail: safeDetail(e) }, 502);
  }
}

// ---- Browse (단계별 찾기): region -> sigungu -> category list ----
async function handlePlaceBrowse(request, env, ctx) {
  const url = new URL(request.url);
  const sp = url.searchParams;
  const locale = sp.get("locale") || "en";
  const args = {
    region: sp.get("region") || "", sigungu: sp.get("sigungu") || "",
    cat: sp.get("cat") || "", when: sp.get("when") || "upcoming", page: sp.get("page") || "1",
  };
  if (!args.region || !BROWSE_CATS.includes(args.cat)) return json({ ok: false, error: "bad_request" }, 400);
  if (!["upcoming", "month", "next"].includes(args.when)) args.when = "upcoming";
  if (!env.TOURAPI_KEY) return json({ ok: false, error: "not_configured" }, 503);
  // Festival windows depend on today's date (KST), so they are part of the key.
  const day = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const key = `browse:v1:${locale}:${args.region}:${args.sigungu}:${args.cat}:${args.cat === "festival" ? args.when + ":" + day : ""}:${args.page}`;
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" };
  if (env.PLACE_CACHE) {
    try { const hit = await env.PLACE_CACHE.get(key); if (hit) return new Response(hit, { headers }); } catch { /* miss */ }
  }
  try {
    const out = await browse(env, locale, args);
    const payload = JSON.stringify(out);
    if (out.ok && env.PLACE_CACHE) {
      try { ctx.waitUntil(env.PLACE_CACHE.put(key, payload, { expirationTtl: 86400 })); } catch { /* best effort */ }
    }
    return new Response(payload, { status: out.ok ? 200 : 400, headers });
  } catch (e) {
    console.error("place/browse", safeDetail(e));
    return json({ ok: false, error: "browse_failed", detail: safeDetail(e) }, 502);
  }
}

// ---- Place Report email delivery (consent-based; never auto-posted) ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function reportEmailHtml(rep, reportUrl, t) {
  const p = rep.place;
  const pick = (arr) => (arr || []).slice(0, 3).map((x) => `<li>${escapeHtml(x.title)}</li>`).join("");
  const hero = p.hero ? `<img src="${escapeHtml(p.hero)}" width="560" style="max-width:100%;border-radius:10px;display:block;margin:0 0 16px" alt="">` : "";
  const ov = p.overview ? `<p style="font-size:14px;line-height:1.6;color:#2a3342">${escapeHtml(p.overview.slice(0, 280))}…</p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1b2330">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#1f6feb;font-weight:700">ktriphub</div>
<h1 style="margin:.2em 0 .1em;font-size:26px">${escapeHtml(p.title)}</h1>
${p.region ? `<div style="color:#5b6678;font-size:14px;margin-bottom:14px">📍 ${escapeHtml(p.region)}</div>` : ""}
${hero}${ov}
<h3 style="font-size:15px;margin:16px 0 6px">${escapeHtml(t.sec.sights)}</h3><ul style="margin:0 0 10px;padding-left:18px;font-size:14px">${pick(rep.sections.sights)}</ul>
<h3 style="font-size:15px;margin:16px 0 6px">${escapeHtml(t.sec.food)}</h3><ul style="margin:0 0 10px;padding-left:18px;font-size:14px">${pick(rep.sections.food)}</ul>
<a href="${escapeHtml(reportUrl)}" style="display:inline-block;margin:18px 0 8px;background:#1f6feb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">${escapeHtml(t.search.button)} ↗</a>
<p style="font-size:12px;color:#8a94a6;margin-top:20px;border-top:1px solid #e3e8ef;padding-top:12px">${escapeHtml(t.ui.poweredBy)} · ${escapeHtml(t.ui.disclaimer)}</p>
<p style="font-size:11px;color:#8a94a6">You requested this report at ktriphub.com. We only use your email to send it — no list, no marketing.</p>
</div></body></html>`;
}
async function handlePlaceSend(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "bad_request" }, 400); }
  const email = String(body.email || "").trim();
  const q = String(body.q || "").trim();
  const areaCode = body.areaCode ? String(body.areaCode) : "";
  const locale = (typeof body.locale === "string" && reportUi[body.locale]) ? body.locale : "en";
  if (!EMAIL_RE.test(email) || email.length > 200) return json({ ok: false, error: "bad_email" }, 400);
  if (body.consent !== true) return json({ ok: false, error: "no_consent" }, 400);
  if (!q && !areaCode) return json({ ok: false, error: "empty" }, 400);
  if (!env.TOURAPI_KEY || !env.RESEND_API_KEY || !env.MAIL_FROM) return json({ ok: false, error: "not_configured" }, 503);

  // Best-effort IP rate limit so the endpoint can't be used to spam an address.
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (env.PLACE_CACHE && ip) {
    try {
      const k = `rl:send:${ip}`;
      const n = parseInt((await env.PLACE_CACHE.get(k)) || "0", 10);
      if (n >= 5) return json({ ok: false, error: "rate_limited" }, 429);
      await env.PLACE_CACHE.put(k, String(n + 1), { expirationTtl: 3600 });
    } catch { /* non-fatal */ }
  }

  let rep;
  // Same target as the report on screen: sub-area drill-down or a place picked from a browse list.
  const opts = {};
  if (areaCode) opts.areaCode = areaCode;
  if (body.sigunguCode) opts.sigunguCode = String(body.sigunguCode).slice(0, 10);
  if (body.contentId) opts.contentId = String(body.contentId).slice(0, 20);
  if (body.contentId && (body.cl === "ko" || body.cl === "en")) opts.cl = body.cl;
  try { rep = await buildReport(env, q, locale, opts); }
  catch (e) { console.error("place/send", safeDetail(e)); return json({ ok: false, error: "report_failed", detail: safeDetail(e) }, 502); }
  if (!rep.ok) return json({ ok: false, error: "not_found" }, 404);

  const t = reportUi[locale] || reportUi.en;
  const reportUrl = `https://ktriphub.com/${locale}/report/?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [email], subject: `${rep.place.title} — ktriphub`, html: reportEmailHtml(rep, reportUrl, t) }),
    });
    if (!res.ok) return json({ ok: false, error: "send_failed" }, 502);
  } catch { return json({ ok: false, error: "send_failed" }, 502); }
  return json({ ok: true });
}

// Provider-failure code safe to expose: only our own "tourapi_*" codes
// (status / parse class), otherwise just the error type. Never the URL,
// which carries the service key.
function safeDetail(e) {
  const m = String((e && e.message) || "");
  return /^tourapi_[a-z0-9_]{1,40}$/.test(m) ? m : ((e && e.name) || "Error");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if(url.pathname === '/') {
      const locale=entryLanguage({cookie:request.headers.get('Cookie')||'',acceptLanguage:request.headers.get('Accept-Language')||'',country:request.cf?.country||''});
      url.pathname=`/${locale}/`;
      return new Response(null,{status:302,headers:{Location:url.toString(),'Cache-Control':'private, no-store',Vary:'Accept-Language, Cookie'}});
    }
    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      return handleChat(request, env);
    }
    if (url.pathname === "/api/place/resolve") return handlePlaceResolve(request, env);
    if (url.pathname === "/api/place/report") return handlePlaceReport(request, env, ctx);
    if (url.pathname === "/api/place/browse") return handlePlaceBrowse(request, env, ctx);
    if (url.pathname === "/api/place/send") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      return handlePlaceSend(request, env);
    }
    // Everything else: serve the static export unchanged.
    return env.ASSETS.fetch(request);
  },
};
