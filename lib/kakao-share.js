// KakaoTalk share via the Kakao JavaScript SDK (Kakao.Share.sendDefault).
// Mobile: opens the KakaoTalk app with a rich card. Desktop: opens Kakao's share
// window (pick a friend or "나와의 채팅"). Unlike navigator.share, it does not depend
// on the OS share sheet, which on Windows offers to *install* KakaoTalk.
// The JS key is the site's Kakao app key (lib/config.js); the app's Web platform
// must list the site domain, which it does for the Kakao map.
//
// Two SDK v2 details that bit us (2026-11-09):
// - Kakao.Share only exists *after* Kakao.init().
// - sendDefault opens a popup; if the SDK is still downloading when the button is
//   clicked, the popup opens after an await, outside the click, and the browser's
//   popup blocker silently swallows it. So the SDK is preloaded when the report
//   renders (preloadKakao) and the click path calls sendDefault synchronously.
import { KAKAO_JS_KEY } from "./config";

const SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
let sdkPromise = null;

function ready() {
  const K = typeof window !== "undefined" ? window.Kakao : null;
  if (!K || typeof K.init !== "function" || !KAKAO_JS_KEY) return null;
  try {
    if (!K.isInitialized()) K.init(KAKAO_JS_KEY);
  } catch {
    return null;
  }
  return K.Share ? K : null;
}

// Download + init ahead of time. Safe to call repeatedly.
export function preloadKakao() {
  if (typeof window === "undefined" || !KAKAO_JS_KEY) return Promise.resolve(null);
  if (ready()) return Promise.resolve(window.Kakao);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SDK; s.async = true; s.crossOrigin = "anonymous";
    s.onload = () => resolve(ready());
    s.onerror = () => { sdkPromise = null; resolve(null); };
    document.head.appendChild(s);
  });
  return sdkPromise;
}

// Call directly from the click handler (no await before it). Returns true when the
// Kakao share opened; false if the SDK isn't ready (caller falls back).
export function shareToKakao({ title, description, imageUrl, url, buttonTitle }) {
  const Kakao = ready();
  if (!Kakao) { preloadKakao(); return false; }
  try {
    const link = { mobileWebUrl: url, webUrl: url };
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: String(title || "").slice(0, 200),
        description: String(description || "").slice(0, 200),
        // Kakao needs an https image; fall back to a text-only card.
        ...(imageUrl && imageUrl.startsWith("https://") ? { imageUrl } : {}),
        link,
      },
      buttons: [{ title: String(buttonTitle || "ktriphub").slice(0, 14), link }],
    });
    return true;
  } catch {
    return false;
  }
}
