// KakaoTalk share via the Kakao JavaScript SDK (Kakao.Share.sendDefault).
// Mobile: opens the KakaoTalk app with a rich card. Desktop: opens Kakao's share
// window (pick a friend or "나와의 채팅"). Unlike navigator.share, it does not depend
// on the OS share sheet, which on Windows offers to *install* KakaoTalk.
// The JS key is the site's Kakao app key (lib/config.js); the app's Web platform
// must list the site domain, which it does for the Kakao map.
import { KAKAO_JS_KEY } from "./config";

const SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
let sdkPromise = null;

// Note: in SDK v2, Kakao.Share only exists *after* Kakao.init() — check it after init.
function loadKakao() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Kakao && typeof window.Kakao.init === "function") return Promise.resolve(window.Kakao);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SDK; s.async = true; s.crossOrigin = "anonymous";
    s.onload = () => resolve(window.Kakao || null);
    s.onerror = () => { sdkPromise = null; resolve(null); };
    document.head.appendChild(s);
  });
  return sdkPromise;
}

// Returns true when the Kakao share was opened, false if the SDK isn't available
// (caller then falls back to the native share sheet / copying the link).
export async function shareToKakao({ title, description, imageUrl, url, buttonTitle }) {
  if (!KAKAO_JS_KEY) return false;
  const Kakao = await loadKakao();
  if (!Kakao) return false;
  try {
    if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
    if (!Kakao.Share) return false;
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
