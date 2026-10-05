"use client";
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import labels from '../data/share-ui.json';
import { pageShareUrl, emailShareUrl, shareMessage, socialShareUrl } from '../lib/share.mjs';
import { track } from '../lib/analytics';
import { PLACES_KEY } from '../lib/places-state.mjs';

export default function ShareTools({ locale, title, getUrl, routeId, selection = false, expandPlatforms = false }) {
  const t = labels[locale] || labels.en;
  const path = usePathname();
  const [native, setNative] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [app, setApp] = useState('');
  const [message, setMessage] = useState('');
  const [qr, setQr] = useState('');
  const [qrBusy, setQrBusy] = useState(false);
  const [shareVersion, setShareVersion] = useState(0);
  const requestId = useRef(0);
  useEffect(() => { setReady(true); setNative(typeof navigator.share === 'function'); }, [path]);
  // Discard a previously displayed link after the parent's selection changes.
  useEffect(() => { requestId.current += 1; setLink(''); setStatus(''); setApp(''); setMessage(''); setQr(''); }, [getUrl, path, shareVersion]);
  useEffect(() => {
    if (!selection) return;
    function changed(event) {
      if (event.type === 'storage' && event.key !== null && event.key !== PLACES_KEY) return;
      setShareVersion(v => v + 1);
    }
    window.addEventListener('places-change', changed); window.addEventListener('storage', changed);
    return () => { window.removeEventListener('places-change', changed); window.removeEventListener('storage', changed); };
  }, [selection]);
  function data() {
    return { title: title || document.querySelector('main h1')?.textContent || document.title,
      url: getUrl ? getUrl() : pageShareUrl(window.location.href) };
  }
  function record(method) { track(selection ? 'itinerary_share' : 'page_share', { locale, ...(routeId ? {route_id: routeId} : {}), method }); }
  async function copy() {
    const request = ++requestId.current;
    setApp(''); setMessage(''); setQr('');
    const item = data(); setLink(item.url);
    try { await navigator.clipboard.writeText(item.url); if (request === requestId.current) { setStatus(t.copied); record('copy'); } }
    catch { if (request === requestId.current) setStatus(t.manual); }
  }
  async function share() {
    setBusy(true); setStatus('');
    try { await navigator.share(data()); record('native'); }
    catch (error) { if (error.name !== 'AbortError') { setLink(data().url); setStatus(t.manual); } }
    finally { setBusy(false); }
  }
  function email() {
    requestId.current += 1; setApp(''); setMessage(''); setQr('');
    const item = data(); setLink(item.url); setStatus(t.mailHint);
    record('email_open'); window.location.href = emailShareUrl(item.title, item.url);
  }
  function openService(service) {
    requestId.current += 1;
    const item = data();
    setApp(''); setMessage(''); setQr(''); setLink(item.url); setStatus(t.openHint);
    window.open(socialShareUrl(service, item.title, item.url), '_blank', 'noopener,noreferrer');
    record(`${service}_open`);
  }
  async function prepareChat(name) {
    const request = ++requestId.current;
    const item = data();
    const text = shareMessage(item.title, item.url);
    setApp(name); setMessage(text); setLink(item.url); setQr('');
    try {
      await navigator.clipboard.writeText(text);
      if (request === requestId.current) { setStatus(t.appCopied.replace('{app}', name)); record(`${name.toLowerCase()}_copy`); }
    } catch { if (request === requestId.current) setStatus(t.appManual.replace('{app}', name)); }
  }
  async function showQr() {
    const item = data();
    const request = ++requestId.current;
    setQrBusy(true); setApp(''); setMessage(''); setLink(item.url); setStatus(t.qrHint);
    try {
      // Generate locally, on demand: never send shared selections to a QR service.
      const QRCode = (await import('qrcode')).default;
      const image = await QRCode.toDataURL(item.url, { width: 320, margin: 4, errorCorrectionLevel: 'M' });
      // Do not show an old QR if the visitor edited the itinerary while loading.
      if (request === requestId.current) { setQr(image); record('qr'); }
    } catch { if (request === requestId.current) { setQr(''); setStatus(t.manual); } }
    finally { setQrBusy(false); }
  }
  return <div className="share-tools" aria-label={t.heading}>
    <strong>{t.heading}</strong>
    <div className="share-actions">
      {native && <button type="button" className="btn ghost" disabled={busy} onClick={share}>{t.share}</button>}
      <button type="button" className="btn ghost" disabled={!ready} onClick={copy}>{t.copy}</button>
      <button type="button" className="btn ghost" disabled={!ready} onClick={email}>{t.email}</button>
    </div>
      <details className="share-more" open={expandPlatforms || undefined}>
      <summary>{t.more}</summary>
      <p className="share-note">{t.openHint}</p>
      <div className="share-platforms">
        {['whatsapp', 'line', 'telegram', 'facebook', 'gmail'].map(service => <button key={service} type="button" className={`share-service share-${service}`} disabled={!ready} onClick={() => openService(service)}>
          <strong>{{whatsapp:'WhatsApp',line:'LINE',telegram:'Telegram',facebook:'Facebook',gmail:'Gmail'}[service]}</strong><small>{t.openApp}</small>
        </button>)}
        {['WeChat', 'KakaoTalk', 'Instagram', 'Zalo', 'Messenger'].map(name => <button key={name} type="button" className="share-service" disabled={!ready} onClick={() => prepareChat(name)}>
          <strong>{name === 'KakaoTalk' && locale === 'ko' ? '카카오톡' : name}</strong><small>{t.copyPaste}</small>
        </button>)}
      </div>
      <p className="share-note">{t.chatHint}</p>
      <button type="button" className="btn ghost" disabled={!ready || qrBusy} onClick={showQr}>{t.qr}</button>
    </details>
    <p className="share-note">{selection ? t.selectionNote : t.pageNote}</p>
    <p role="status" aria-live="polite">{status}</p>
    {link && <input className="trip-copy" aria-label={t.copy} value={link} readOnly onFocus={e => e.target.select()} />}
    {message && <label className="share-message">{t.messageLabel.replace('{app}', app)}<textarea readOnly value={message} onFocus={e => e.target.select()} /></label>}
    {qr && <figure className="share-qr"><img src={qr} width="320" height="320" alt={t.qr} /><figcaption>{t.qrHint}</figcaption><a className="btn ghost" href={qr} download="korea-trip-hub-share.png">{t.saveQr}</a></figure>}
  </div>;
}
