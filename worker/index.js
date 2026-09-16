// Korea Trip Hub Worker: serves the static export and a grounded AI help chat.
// Static pages are served from the asset store directly; this Worker only runs
// for /api/chat (POST) and for paths with no matching asset (404s).

const MODEL_CF = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"; // Workers AI (current)
const MODEL_CLAUDE = "claude-haiku-4-5-20251001";   // preferred if a key is set
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

  try {
    let reply = "";
    if (env.ANTHROPIC_API_KEY) reply = await callClaude(env, system, messages);
    else if (env.AI) reply = await callWorkersAI(env, system, messages);
    else return json({ error: "no_model" }, 503);
    if (!reply) return json({ error: "empty" }, 502);
    return json({ reply });
  } catch (e) {
    // Fallback to Workers AI if Claude failed and AI is available.
    if (env.ANTHROPIC_API_KEY && env.AI) {
      try { const reply = await callWorkersAI(env, system, messages); if (reply) return json({ reply }); } catch (e2) {}
    }
    return json({ error: "chat_unavailable" }, 503);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      return handleChat(request, env);
    }
    // Everything else: serve the static export unchanged.
    return env.ASSETS.fetch(request);
  },
};
