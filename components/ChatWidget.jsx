"use client";
// Floating "Help me now" assistant. Calls POST /api/chat (grounded Worker).
// Fact-safe by design: an always-visible emergency note, quick-action prompts,
// optional location sharing, and links the model returns are made clickable.
import { useState, useRef, useEffect } from "react";

function renderReply(text) {
  // Make site paths (/xx/...), full URLs and the key phone numbers clickable.
  const parts = [];
  const re = /(\bhttps?:\/\/[^\s)]+|\/[a-z-]{2,5}\/[A-Za-z0-9/_-]+\/?|\b(?:112|119|1330|120)\b)/g;
  let last = 0, m;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (/^https?:/.test(tok)) parts.push(<a key={k++} href={tok} target="_blank" rel="noopener noreferrer">{tok}</a>);
    else if (tok.startsWith("/")) parts.push(<a key={k++} href={tok}>{tok}</a>);
    else parts.push(<a key={k++} href={`tel:${tok}`}>{tok}</a>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function ChatWidget({ locale = "en", labels = {} }) {
  const t = labels;
  const [open, setOpen] = useState(false);
  const [guideSrc, setGuideSrc] = useState(null);
  const [msgs, setMsgs] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState(null);
  const [bubbleOff, setBubbleOff] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    let guide;
    try { guide = sessionStorage.getItem('kth-guide-character'); } catch {}
    if (guide !== 'female' && guide !== 'male') {
      guide = Math.random() < 0.5 ? 'female' : 'male';
      try { sessionStorage.setItem('kth-guide-character', guide); } catch {}
    }
    setGuideSrc(guide === 'male' ? '/img/hanbok-guide-male-3d.png' : '/img/hanbok-guide-3d.png');
  }, []);

  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy, open]);
  useEffect(() => { if (!open) return; const escape = e => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown',escape); return () => window.removeEventListener('keydown',escape); }, [open]);

  function dismissBubble() {
    setBubbleOff(true);
  }
  function toggleOpen() {
    setOpen((o) => !o);
    dismissBubble();
  }

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    const next = [...msgs, { role: "user", content }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, coords, messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json().catch(() => ({}));
      setMsgs((cur) => [...cur, { role: "assistant", content: data.reply || t.error || "Sorry, I couldn't reach the assistant. For urgent help call 1330 (free, 24/7)." }]);
    } catch {
      setMsgs((cur) => [...cur, { role: "assistant", content: t.error || "Sorry, I couldn't reach the assistant. For urgent help call 1330 (free, 24/7)." }]);
    } finally {
      setBusy(false);
    }
  }

  function shareLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { timeout: 8000 }
    );
  }

  const quick = [
    { k: "overbill", icon: "🆘", q: t.qOverbill || "I think I was overcharged — what should I do?" },
    { k: "lost", icon: "🧭", q: t.qLost || "I'm lost — how do I get help?" },
    { k: "food", icon: "🍜", q: t.qFood || "Where can I find a good place to eat nearby?" },
    { k: "etiquette", icon: "🙏", q: t.qEtiquette || "What etiquette mistakes should I avoid?" },
  ];

  return (
    <>
      {!open && !bubbleOff && (
        <div className="korea-welcome" role="region" aria-label={t.title}>
          <button className="korea-welcome-close" aria-label={t.close} onClick={dismissBubble}>✕</button>
          <button className="korea-welcome-message" onClick={() => setOpen(true)}>
            <small>{t.virtualGuide}</small><strong>{t.bubble}</strong><span>{t.title} ↗</span>
          </button>
        </div>
      )}

      <button className={`cw-fab korea-guide-fab ${!open && !bubbleOff ? "is-welcoming" : ""}`} aria-label={t.title || "Ask for help"} aria-expanded={open} aria-controls="korea-chat-panel" onClick={toggleOpen}>
        {open ? "✕" : guideSrc && <img src={guideSrc} alt="" width="120" height="180" />}
      </button>

      {open && (
        <div id="korea-chat-panel" className="cw-panel" role="dialog" aria-label={t.title || "Korea Trip Hub Assistant"}>
          <div className="cw-head">
            <b>{guideSrc && <img className="korea-chat-avatar" src={guideSrc} alt="" width="40" height="40" />} {t.title}<small className="korea-chat-label">{t.virtualGuide}</small></b>
            <button className="cw-x" aria-label={t.close} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="cw-emerg">🚨 {t.emergency || "In danger or hurt? Call 112 (police) or 119 (fire/ambulance) now."}</div>

          <div className="cw-body" ref={scroller}>
            {msgs.length === 0 && (
              <div className="cw-greet">
                <p>{t.greeting || "Hi! I can help with problems on your Korea trip — being overcharged, getting lost, finding food, etiquette, visas and more. What's up?"}</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`cw-msg cw-${m.role}`}>
                {m.role === "assistant" ? renderReply(m.content) : m.content}
              </div>
            ))}
            {busy && <div className="cw-msg cw-assistant cw-typing">{t.thinking || "Thinking…"}</div>}
          </div>

          <div className="cw-quick">
            {quick.map((q) => (
              <button key={q.k} onClick={() => send(q.q)} disabled={busy}>{q.icon} {t["short_" + q.k] || q.q}</button>
            ))}
          </div>

          <form className="cw-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <button type="button" className="cw-loc" aria-label={t.share || "Share location"} title={t.share || "Share location"} onClick={shareLocation} data-on={coords ? "1" : "0"}>📍</button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder || "Type your question…"}
              aria-label={t.placeholder || "Type your question"}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()}>{t.send || "Send"}</button>
          </form>

          <p className="cw-disc">{t.disclaimer || "General help, not emergency or legal advice. Confirm important details with official sources."}</p>
        </div>
      )}
    </>
  );
}
