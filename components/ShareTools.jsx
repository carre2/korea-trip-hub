"use client";
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import labels from '../data/share-ui.json';
import { pageShareUrl, emailShareUrl, shareMessage, socialShareUrl } from '../lib/share.mjs';
import { track } from '../lib/analytics';
import { PLACES_KEY } from '../lib/places-state.mjs';

function ActionIcon({ kind }) {
  const paths = {
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M15 4H7a3 3 0 0 0-3 3v8"/></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></>,
    qr: <><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM21 15v6h-6v-2"/></>,
  };
  return <svg className="share-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function BrandIcon({ service }) {
  return <span className={`share-brand-icon share-brand-${service}`} aria-hidden="true"><img src={`/img/share/${service}.svg`} width="26" height="26" alt="" /></span>;
}

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
  const PlatformContainer = expandPlatforms ? 'div' : 'details';
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
    <strong className="share-heading">{t.heading}</strong>
    <div className="share-actions">
      {native && <button type="button" className="btn ghost share-native" disabled={busy} onClick={share}><ActionIcon kind="share"/>{t.share}</button>}
      <button type="button" className="btn ghost" disabled={!ready} onClick={copy}><ActionIcon kind="copy"/>{t.copy}</button>
      <button type="button" className="btn ghost" disabled={!ready} onClick={email}><ActionIcon kind="email"/>{t.email}</button>
    </div>
    <PlatformContainer className="share-more">
      {expandPlatforms ? <p className="share-section-title">{t.more}</p> : <summary>{t.more}</summary>}
      <div className="share-platforms">
        {['whatsapp', 'line', 'telegram', 'facebook', 'gmail'].map(service => <button key={service} type="button" className={`share-service share-${service}`} disabled={!ready} onClick={() => openService(service)}>
          <BrandIcon service={service}/>
          <strong>{{whatsapp:'WhatsApp',line:'LINE',telegram:'Telegram',facebook:'Facebook',gmail:'Gmail'}[service]}</strong><small>{t.openApp}</small>
        </button>)}
        {['WeChat', 'KakaoTalk', 'Instagram', 'Zalo', 'Messenger'].map(name => <button key={name} type="button" className="share-service" disabled={!ready} onClick={() => prepareChat(name)}>
          <BrandIcon service={name.toLowerCase()}/>
          <strong>{name === 'KakaoTalk' && locale === 'ko' ? '카카오톡' : name}</strong><small>{t.copyPaste}</small>
        </button>)}
      </div>
      <p className="share-note">{t.openHint}</p>
      <p className="share-note">{t.chatHint}</p>
      <button type="button" className="btn ghost share-qr-button" disabled={!ready || qrBusy} onClick={showQr}><ActionIcon kind="qr"/>{t.qr}</button>
    </PlatformContainer>
    <p className="share-note">{selection ? t.selectionNote : t.pageNote}</p>
    <p role="status" aria-live="polite">{status}</p>
    {link && <input className="trip-copy" aria-label={t.copy} value={link} readOnly onFocus={e => e.target.select()} />}
    {message && <label className="share-message">{t.messageLabel.replace('{app}', app)}<textarea readOnly value={message} onFocus={e => e.target.select()} /></label>}
    {qr && <figure className="share-qr"><img src={qr} width="320" height="320" alt={t.qr} /><figcaption>{t.qrHint}</figcaption><a className="btn ghost" href={qr} download="korea-trip-hub-share.png">{t.saveQr}</a></figure>}
  </div>;
}
