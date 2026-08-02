"use client";

import { useEffect } from "react";
import { defaultLocale } from "../lib/i18n";

// Root path → default locale. Static-export friendly (client redirect + noscript link).
export default function RootRedirect() {
  useEffect(() => {
    window.location.replace(`/${defaultLocale}/`);
  }, []);
  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <p>
        Redirecting… <a href={`/${defaultLocale}/`}>Enter Korea Trip Hub →</a>
      </p>
    </main>
  );
}
