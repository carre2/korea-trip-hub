"use client";
// Site-owned navigation actions; in-memory conversation survives internal navigation.
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { chatViewport } from "../lib/chat-viewport.mjs";
import CustomTripWorkspace from './CustomTripWorkspace';

export default function ChatWidget({ locale = "en", labels = {}, affiliateNote = "",tripLabels={} }) {
  const t = labels;
  const [open, setOpen] = useState(false);
  const [guideSrc, setGuideSrc] = useState(null);
  const [msgs, setMsgs] = useState([]); // {role, content}
  const [preferences,setPreferences]=useState({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const customTripRef=useRef(null);
  const launcher = useRef(null);
  const wasOpen = useRef(false);
  const [mobileViewport, setMobileViewport] = useState(null);
  // Keep the welcome card closed so it cannot cover the reader's next action.
  // The character button still opens help on request.
  const [bubbleOff, setBubbleOff] = useState(true);
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

  useEffect(() => {
    const body=scroller.current;
    const latest=body?.querySelector('.cw-msg:last-of-type');
    if(body && latest)body.scrollTop+=latest.getBoundingClientRect().top-body.getBoundingClientRect().top-8;
  }, [msgs, busy, open]);
  useEffect(() => { if (!open) return; const escape = e => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown',escape); return () => window.removeEventListener('keydown',escape); }, [open]);

  useEffect(()=>{
    if(open && !window.matchMedia('(max-width:560px)').matches) inputRef.current?.focus({preventScroll:true});
    else if(!open && wasOpen.current && document.activeElement===document.body) launcher.current?.focus({preventScroll:true});
    wasOpen.current=open;
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const viewport=window.visualViewport;
    const resize=()=>setMobileViewport(chatViewport({mobile:window.matchMedia('(max-width:560px), (max-width:1024px) and (max-height:500px), (pointer:coarse)').matches,height:viewport?.height||window.innerHeight,offsetTop:viewport?.offsetTop||0}));
    resize();viewport?.addEventListener('resize',resize);viewport?.addEventListener('scroll',resize);window.addEventListener('resize',resize);
    return()=>{viewport?.removeEventListener('resize',resize);viewport?.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);};
  },[open]);
  function navigate(e,action){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
    setOpen(false);
    if(action.id.startsWith('plan-') && window.location.pathname===`/${locale}/`){
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('kth-planner-route',{detail:action.id.slice(5)}));
      const planner=document.getElementById('planner');
      planner?.scrollIntoView({behavior:'auto',block:'start'});planner?.focus({preventScroll:true});
    }
  }

  function dismissBubble() {
    setBubbleOff(true);
  }
  function toggleOpen() {
    setOpen((o) => !o);
    dismissBubble();
  }

  async function send(text, restart=false) {
    const content = (text ?? input).trim().slice(0,1500);
    if (!content || busy) return;
    // Let the response and booking actions use the full phone screen after sending.
    if (mobileViewport) inputRef.current?.blur();
    setInput("");
    const next = [...(restart?[]:msgs.slice(-11)), { role: "user", content }];
    if(restart){setPreferences({});customTripRef.current=null;}
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(75000),
        body: JSON.stringify({ locale, currentTrip:restart?null:customTripRef.current, preferences:restart?{}:preferences, messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json().catch(() => ({}));
      if(res.ok && data.preferences)setPreferences(data.preferences);
      if(res.ok && data.customTrip)customTripRef.current=data.customTrip;
      setMsgs((cur) => [...cur, { role: "assistant", customTrip:res.ok?data.customTrip:null, actions: res.ok ? data.actions : [], suggestions:res.ok?data.suggestions:[], content: data.reply || t.error || "Sorry, I couldn't reach the assistant. For urgent help call 1330 (free, 24/7)." }]);
    } catch {
      setMsgs((cur) => [...cur, { role: "assistant", content: t.error || "Sorry, I couldn't reach the assistant. For urgent help call 1330 (free, 24/7)." }]);
    } finally {
      setBusy(false);
    }
  }

  const quick = [
    {k:'plan',icon:'🗓️',q:t.plan}, {k:'hotels',icon:'🛏️',q:t.hotels}, {k:'visa',icon:'🛂',q:t.visa}
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

      <button ref={launcher} className={`cw-fab korea-guide-fab ${!open && !bubbleOff ? "is-welcoming" : ""}`} aria-label={t.title || "Ask for help"} aria-expanded={open} aria-controls="korea-chat-panel" onClick={toggleOpen}>
        {open ? "✕" : guideSrc && <img src={guideSrc} alt="" width="120" height="180" decoding="async" fetchPriority="low" />}
      </button>

      {open && (
        <div id="korea-chat-panel" className={`cw-panel${mobileViewport?.compact ? ' cw-compact' : ''}`} style={mobileViewport?.style} data-placement="travel-assistant" role="dialog" aria-modal="false" aria-label={t.title || "Korea Trip Hub Assistant"}>
          <div className="cw-head">
            <b>{guideSrc && <img className="korea-chat-avatar" src={guideSrc} alt="" width="40" height="40" decoding="async" fetchPriority="low" />} {t.title}<small className="korea-chat-label">{t.virtualGuide}</small></b>
            <button className="cw-x" aria-label={t.close} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="cw-body" ref={scroller}>

            {msgs.length === 0 && (
              <div className="cw-greet" lang={locale}>
                <strong className="cw-welcome-title">{t.welcome}</strong>
                <p>{t.greeting || "Hi! I can help with problems on your Korea trip — being overcharged, getting lost, finding food, etiquette, visas and more. What's up?"}</p>
              </div>
            )}
            <div className="cw-emerg">🚨 {t.emergency || "In danger or hurt? Call 112 (police) or 119 (fire/ambulance) now."}</div>
            {msgs.map((m, i) => (
              <div key={i} className={`cw-msg cw-${m.role}`}>
                {m.content}
                {m.customTrip && <CustomTripWorkspace draft={m.customTrip} onChange={trip=>{customTripRef.current=trip;}} locale={locale} labels={t.custom} controls={tripLabels} affiliateNote={affiliateNote}/>}
                {i===msgs.length-1 && m.suggestions?.length>0 && <div className="cw-answers">{m.suggestions.map(s=><button key={s} disabled={busy} onClick={()=>send(s)}>{s}</button>)}</div>}
                {m.actions?.length > 0 && <div className="cw-actions">{m.actions.map(a=>a.sponsored ? <a key={a.id} href={a.href} data-journey-target={a.id} target="_blank" rel="sponsored nofollow noopener noreferrer">{a.title} ↗</a> : <Link key={a.id} href={a.href} prefetch={false} onClick={e=>navigate(e,a)}>{a.title} →</Link>)}</div>}
                {m.actions?.some(a=>a.sponsored) && <small className="cw-affiliate">{affiliateNote}</small>}
              </div>
            ))}
            {busy && <div role="status" className="cw-msg cw-assistant cw-typing">{t.thinking || "Thinking…"}</div>}
            {Object.values(preferences).some(Boolean) && <button className="cw-restart" disabled={busy} onClick={()=>send(t.restart,true)}>{t.restart}</button>}
            <p className="cw-disc">{t.privacy} </p>
            <p className="cw-disc">{t.disclaimer || "General help, not emergency or legal advice. Confirm important details with official sources."}</p>
          </div>

          <div className="cw-quick">
            {quick.map((q) => (
              <button key={q.k} onClick={() => send(q.q)} disabled={busy}>{q.icon} {t[q.k] || q.q}</button>
            ))}
          </div>

          <form className="cw-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              ref={inputRef}
              maxLength={1500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder || "Type your question…"}
              aria-label={t.placeholder || "Type your question"}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()}>{t.send || "Send"}</button>
          </form>

        </div>
      )}
    </>
  );
}
