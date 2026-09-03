"use client";

import { useEffect, useMemo, useState } from "react";

const INSTAGRAM_DM = "https://ig.me/m/ktriphub";
const CONTACT_EMAIL = "contact@ktriphub.com";

export default function AskKoreaForm({ t }) {
  const [passportCountry, setPassportCountry] = useState("");
  const [question, setQuestion] = useState("");
  const [safe, setSafe] = useState(false);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("website");

  useEffect(() => {
    setSource(new URLSearchParams(window.location.search).get("ref") || "website");
  }, []);

  const message = useMemo(() => {
    return [
      t.messageTitle,
      `${t.countryLabel}: ${passportCountry.trim() || t.notProvided}`,
      `${t.questionLabel}: ${question.trim()}`,
      `${t.sourceLabel}: ${source}`,
    ].join("\n");
  }, [passportCountry, question, source, t]);

  async function openInstagram() {
    if (!question.trim() || !safe) {
      setStatus(t.requiredError);
      return;
    }
    window.open(INSTAGRAM_DM, "_blank", "noopener,noreferrer");
    try {
      await navigator.clipboard.writeText(message);
      setStatus(t.copied);
    } catch {
      setStatus(t.copyFailed);
    }
  }

  function sendEmail() {
    if (!question.trim() || !safe) {
      setStatus(t.requiredError);
      return;
    }
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(message)}`;
  }

  return (
    <div className="ask-form" aria-labelledby="ask-form-title">
      <h2 id="ask-form-title">{t.formTitle}</h2>
      <p className="ask-form-lede">{t.formIntro}</p>

      <label className="ask-label" htmlFor="ask-country">{t.countryLabel}</label>
      <input
        id="ask-country"
        className="ask-input"
        value={passportCountry}
        onChange={(e) => setPassportCountry(e.target.value)}
        placeholder={t.countryPlaceholder}
        autoComplete="country-name"
      />

      <label className="ask-label" htmlFor="ask-question">{t.questionLabel} *</label>
      <textarea
        id="ask-question"
        className="ask-input ask-textarea"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t.questionPlaceholder}
        maxLength={1200}
        required
      />
      <div className="ask-count">{question.length}/1200</div>

      <label className="ask-check">
        <input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} />
        <span>{t.safetyCheck}</span>
      </label>

      <div className="ask-actions">
        <button className="btn primary ask-primary" type="button" onClick={openInstagram}>
          {t.instagramButton}
        </button>
        <button className="btn ghost ask-secondary" type="button" onClick={sendEmail}>{t.emailButton}</button>
      </div>
      {status && <p className="ask-status" role="status">{status}</p>}
      <p className="ask-fineprint">{t.fineprint}</p>
    </div>
  );
}
