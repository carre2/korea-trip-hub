"use client";
import {useEffect,useState} from 'react';
import PeekMascot from './PeekMascot';
import ShareTools from './ShareTools';
import SavePlace from './SavePlace';
import {koreaDay,eventStatus,filterEvents,eventShareUrl} from '../lib/festivals.mjs';

export default function FestivalExplorer({locale,t,events,initialDay}) {
  const [today,setToday]=useState(initialDay);
  const [city,setCity]=useState(''),[type,setType]=useState('');
  const [from,setFrom]=useState(''),[until,setUntil]=useState(''),[ended,setEnded]=useState(false);
  useEffect(()=>{
    setToday(koreaDay());
    let id='';try{id=decodeURIComponent(window.location.hash.slice(1));}catch{}
    if(events.some(e=>e.id===id && e.end<koreaDay()))setEnded(true);
    const timer=setInterval(()=>setToday(koreaDay()),60000);
    return ()=>clearInterval(timer);
  },[events]);
  const invalid=from && until && from>until;
  const shown=invalid?[]:filterEvents(events,{today,city,type,from,until,ended});
  return <div className="festival-explorer">
    <form className="festival-filters" onSubmit={e=>e.preventDefault()}>
      <label>{t.region}<select value={city} onChange={e=>setCity(e.target.value)}><option value="">{t.all}</option><option value="busan">{t.busan}</option><option value="jinju">{t.jinju}</option></select></label>
      <label>{t.kind}<select value={type} onChange={e=>setType(e.target.value)}><option value="">{t.all}</option><option value="festival">{t.festival}</option><option value="culture">{t.culture}</option></select></label>
      <label>{t.from}<input type="date" value={from} onInput={e=>setFrom(e.currentTarget.value)} onChange={e=>setFrom(e.target.value)}/></label>
      <label>{t.until}<input type="date" value={until} onInput={e=>setUntil(e.currentTarget.value)} onChange={e=>setUntil(e.target.value)}/></label>
      <label className="festival-ended"><input type="checkbox" checked={ended} onChange={e=>setEnded(e.target.checked)}/>{t.showEnded}</label>
      <button type="button" className="btn ghost" onClick={()=>{setCity('');setType('');setFrom('');setUntil('');setEnded(false);}}>{t.reset}</button>
    </form>
    <p className="festival-result" role="status">{invalid?t.invalid:t.results.replace('{count}',shown.length)}</p>
    {!shown.length && <p className="festival-empty">{t.empty}</p>}
    <div className="festival-grid">{shown.map((e,i)=>{
      const copy=t.events[e.id],state=eventStatus(e,today),stale=e.recheck_after<today;
      return <section className={`festival-card festival-${e.type} travel-has-peek`} id={e.id} key={e.id}>
        <PeekMascot animal={e.type==='culture'?'cat':i%2?'bunny':'bear'}/>
        <div className="festival-art" aria-hidden="true"><span>{e.icon}</span><span>✦ 🌷 ✧</span></div>
        <div className="festival-card-body"><div className="festival-badges"><span>{t[e.type]}</span><span>{t[state]}</span></div>
          <h2>{copy.name}</h2><p>{copy.description}</p><SavePlace id={`event:${e.id}`} locale={locale}/>
          {!stale ? <p className="festival-dates">🗓️ <time dateTime={e.start}>{e.start}</time>{e.end!==e.start && <> — <time dateTime={e.end}>{e.end}</time></>}</p> : <p>{t.stale}</p>}
          <p>📍 {copy.venue}</p><p className="festival-check">{t.asOf} <time dateTime={e.verified}>{e.verified}</time> · <a href={e.source} target="_blank" rel="noopener noreferrer">{e.source_name} ↗</a></p>
          <p className="festival-note">{t.confirm}</p><p className="festival-note">{t.ticketNote}</p>
          <div className="festival-actions"><a className="btn" href={e.official} target="_blank" rel="noopener noreferrer">{t.official} ↗</a><a className="btn ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.map)}`} target="_blank" rel="noopener noreferrer">🗺️ {t.map}</a>{e.tickets && <a className="btn ghost" href={e.tickets} target="_blank" rel="noopener noreferrer">🎟️ {t.tickets} ↗</a>}{!stale && <a className="btn ghost" href={`/festival-calendars/${locale}/${e.id}.ics`} download={`${e.id}.ics`}>🗓️ {t.calendar}</a>}</div>
          <details className="festival-sharing"><summary>{t.share}</summary><ShareTools locale={locale} title={copy.name} getUrl={()=>eventShareUrl(locale,e.id)}/></details>
        </div>
      </section>;
    })}</div>
  </div>;
}
