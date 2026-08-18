"use client";

// Cookie-consent banner backed by Google Consent Mode v2. The layout sets every
// consent signal to "denied" by default (before GA runs); this banner only lets the
// visitor grant/deny analytics and remembers the choice. No third-party CMP script.
import { useEffect, useState } from "react";

const KEY = "kth_consent";

export default function ConsentBanner({ t = {}, privacyHref = "/en/legal/privacy/" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function decide(granted) {
    try {
      localStorage.setItem(KEY, granted ? "granted" : "denied");
    } catch {}
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label={t.title || "Cookie consent"}>
      <div className="wrap consent-in">
        <p className="consent-txt">
          <b>{t.title || "We value your privacy"}</b>{" "}
          {t.body || "We use cookies to measure traffic only if you accept."}{" "}
          <a href={privacyHref}>{t.manage || "Privacy & Cookies"}</a>
        </p>
        <div className="consent-btns">
          <button type="button" className="consent-b ghost" onClick={() => decide(false)}>
            {t.reject || "Reject"}
          </button>
          <button type="button" className="consent-b ok" onClick={() => decide(true)}>
            {t.accept || "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
