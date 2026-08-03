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
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY || ""; // set when the Kakao key is issued
