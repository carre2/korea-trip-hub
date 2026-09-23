"use client";

// Client component — intentionally imports NOTHING from lib/i18n so the locale
// message dictionaries never end up in the client bundle. The server layout
// passes the few strings this needs (nav labels + locale list) as props.
import { useEffect, useState } from "react";

export default function Header({ locale, nav = {}, labels: ui = {}, locales = [], localeNames = {}, rtl = false }) {
  const t = nav;
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep <html lang/dir> in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    try { const theme = localStorage.getItem("kth_theme"); if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme; } catch {}
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
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("kth_theme", next); } catch {}
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
          aria-label={menuOpen ? ui.menuClose : ui.menuOpen}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <nav id="primary-nav" className={`links${menuOpen ? " open" : ""}`} aria-label={ui.menuOpen}>
          <a href={`/${locale}/plan/visa/`} onClick={close}>{ui.entry}</a>
          <a href={`/${locale}/plan/airport/`} onClick={close}>{ui.arrival}</a>
          <a href={`/${locale}/destinations/`} onClick={close}>{ui.explore}</a>
          <a href={`/${locale}/guides/`} onClick={close}>{ui.continuePrep}</a>
          <a href={`/${locale}/itinerary/`} onClick={close}>{t.planner}</a>
          <a className="nav-mytrip" href={`/${locale}/#planner`} onClick={close}>{ui.myTrip}</a>
          <a href={`/${locale}/plan/help/`} onClick={close}>{t.help}</a>
        <button type="button" className="mobile-theme trip-text-button" onClick={toggleTheme}>◐ {ui.theme}</button></nav>
        <div className="nav-right">
          <label className="langsel" title={ui.language}>
            <span className="globe">🌐</span>
            <select aria-label={ui.language} value={locale} onChange={onLang}>
              {locales.map((code) => (
                <option key={code} value={code}>
                  {localeNames[code]}
                </option>
              ))}
            </select>
          </label>
          <button className="theme-btn" aria-label={ui.theme} onClick={toggleTheme}>
            ◐
          </button>
        </div>
      </div>
    </header>
  );
}
