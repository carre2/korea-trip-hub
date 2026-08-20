"use client";

// Client component — intentionally imports NOTHING from lib/i18n so the 10
// message dictionaries never end up in the client bundle. The server layout
// passes the few strings this needs (nav labels + locale list) as props.
import { useEffect, useState } from "react";

export default function Header({ locale, nav = {}, locales = [], localeNames = {}, rtl = false }) {
  const t = nav;
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep <html lang/dir> in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [locale, rtl]);

  // Close the mobile menu on Escape.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onLang(e) {
    const code = e.target.value;
    if (!code || code === locale) return;
    // Preserve the current path, query and hash — only swap the locale segment —
    // so switching language keeps you on the same page instead of the locale home.
    const parts = window.location.pathname.split("/");
    if (parts.length > 1 && locales.includes(parts[1])) parts[1] = code;
    else parts.splice(1, 0, code);
    window.location.assign(parts.join("/") + window.location.search + window.location.hash);
  }

  function toggleTheme() {
    const root = document.documentElement;
    const cur =
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  }

  const close = () => setMenuOpen(false);

  return (
    <header>
      <div className="wrap nav">
        <a className="brand" href={`/${locale}/`} onClick={close}>
          <span className="mark">◆</span> Korea<b>Trip</b>Hub
        </a>
        <button
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <nav id="primary-nav" className={`links${menuOpen ? " open" : ""}`} aria-label="Main">
          <a href={`/${locale}/#plan`} onClick={close}>{t.plan}</a>
          <a href={`/${locale}/#planner`} onClick={close}>{t.planner}</a>
          <a href={`/${locale}/#dest`} onClick={close}>{t.destinations}</a>
          <a href={`/${locale}/#food`} onClick={close}>{t.food}</a>
          <a href={`/${locale}/#reviews`} onClick={close}>{t.reviews}</a>
          <a href={`/${locale}/kpop/`} onClick={close}>{t.kculture}</a>
          <a href={`/${locale}/#map`} onClick={close}>{t.map}</a>
          <a href={`/${locale}/#help`} onClick={close}>{t.help}</a>
        </nav>
        <div className="nav-right">
          <label className="langsel" title="Choose language">
            <span className="globe">🌐</span>
            <select aria-label="Language" value={locale} onChange={onLang}>
              {locales.map((code) => (
                <option key={code} value={code}>
                  {localeNames[code]}
                </option>
              ))}
            </select>
          </label>
          <button className="theme-btn" aria-label="Toggle theme" onClick={toggleTheme}>
            ◐
          </button>
        </div>
      </div>
    </header>
  );
}
