"use client";

import { useEffect } from "react";
import { locales, localeNames, rtlLocales, getMessages } from "../lib/i18n";

export default function Header({ locale }) {
  const t = getMessages(locale).nav;

  // Keep <html lang/dir> in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  function onLang(e) {
    const code = e.target.value;
    if (code && code !== locale) window.location.assign(`/${code}/`);
  }

  function toggleTheme() {
    const root = document.documentElement;
    const cur =
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  }

  return (
    <header>
      <div className="wrap nav">
        <a className="brand" href={`/${locale}/`}>
          <span className="mark">◆</span> Korea<b>Trip</b>Hub
        </a>
        <nav className="links">
          <a href="#plan">{t.plan}</a>
          <a href="#planner">{t.planner}</a>
          <a href="#dest">{t.destinations}</a>
          <a href="#food">{t.food}</a>
          <a href="#reviews">{t.reviews}</a>
          <a href="#kculture">{t.kculture}</a>
          <a href="#map">{t.map}</a>
          <a href="#help">{t.help}</a>
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
