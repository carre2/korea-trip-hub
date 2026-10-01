"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import labels from '../data/share-ui.json';
import { pageShareUrl, emailShareUrl } from '../lib/share.mjs';
import { track } from '../lib/analytics';

export default function ShareTools({ locale, title, getUrl, routeId, selection = false }) {
  const t = labels[locale] || labels.en;
  const path = usePathname();
  const [native, setNative] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setReady(true); setNative(typeof navigator.share === 'function'); setStatus(''); setLink(''); }, [path]);
  // Discard a previously displayed link after the parent's selection changes.
  useEffect(() => { setLink(''); setStatus(''); }, [getUrl]);
  function data() {
    return { title: title || document.querySelector('main h1')?.textContent || document.title,
      url: getUrl ? getUrl() : pageShareUrl(window.location.href) };
  }
  function record(method) { track(selection ? 'itinerary_share' : 'page_share', { locale, ...(routeId ? {route_id: routeId} : {}), method }); }
  async function copy() {
    const item = data(); setLink(item.url);
    try { await navigator.clipboard.writeText(item.url); setStatus(t.copied); record('copy'); }
    catch { setStatus(t.manual); }
  }
  async function share() {
    setBusy(true); setStatus('');
    try { await navigator.share(data()); record('native'); }
    catch (error) { if (error.name !== 'AbortError') { setLink(data().url); setStatus(t.manual); } }
    finally { setBusy(false); }
  }
  function email() {
    const item = data(); setLink(item.url); setStatus(t.mailHint);
    record('email_open'); window.location.href = emailShareUrl(item.title, item.url);
  }
  return <div className="share-tools" aria-label={t.heading}>
    <strong>{t.heading}</strong>
    <div className="share-actions">
      {native && <button type="button" className="btn ghost" disabled={busy} onClick={share}>{t.share}</button>}
      <button type="button" className="btn ghost" disabled={!ready} onClick={copy}>{t.copy}</button>
      <button type="button" className="btn ghost" disabled={!ready} onClick={email}>{t.email}</button>
    </div>
    <p className="share-note">{selection ? t.selectionNote : t.pageNote}</p>
    <p role="status" aria-live="polite">{status}</p>
    {link && <input className="trip-copy" aria-label={t.copy} value={link} readOnly onFocus={e => e.target.select()} />}
  </div>;
}
