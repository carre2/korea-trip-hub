// Public, domain-restricted keys for client-side map SDKs.
//
// Naver web dynamic-map Client ID is PUBLIC by design — it ships in the page script
// and is protected by the registered service-URL allowlist (ktriphub.com, localhost),
// so committing it is safe. The Client *Secret* is NOT used here and must never be committed.
// Kakao JavaScript key is likewise a client key restricted by registered Web domains.
//
// Override at build time with NEXT_PUBLIC_* env vars (e.g. in Cloudflare) if you prefer.

export const NAVER_MAP_CLIENT_ID =
  process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "s4ne8ewgng";

export const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "48cbd16970a5097485c5f332e672ebf0"; // Kakao JS key "korea trip hub" (has JavaScript SDK 도메인 registered)

// Review submission link (e.g. a Google Form / Tally URL). Empty = "opening soon".
// Reviews are moderated: submissions land here, and only real, vetted reviews are
// added to data/reviews.json. Never fabricate reviews (see HARNESS).
export const REVIEW_FORM_URL =
  process.env.NEXT_PUBLIC_REVIEW_FORM_URL ||
  "https://docs.google.com/forms/d/e/1FAIpQLSdHfi7ha2zafX4ZNqPakd3m-YA8jMu5JZyo4d3UbNX5RPeisw/viewform";
