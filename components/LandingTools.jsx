"use client";
import {useState, useId} from 'react';
import VisaFinder from './VisaFinder';
import BudgetCalculator from './BudgetCalculator';
import TravelIcon from './TravelIcon';
import {track} from '../lib/analytics';

// Language never selects a passport. Visitors choose the guide explicitly.
export default function LandingTools({locale, m, countries, entryCopy, budget, routes}) {
  const [tool,setTool]=useState('visa');
  const id=useId(), t=m.experience;
  const tools=[{key:'visa',label:t.entry,icon:'visa'},{key:'planner',label:t.myTrip,icon:'checklist'},{key:'budget',label:budget.title,icon:'money'}];
  function choose(key){setTool(key);track('landing_tool_select',{locale,target:key,placement:'home'});}
  function route(e,key){e.preventDefault();window.dispatchEvent(new CustomEvent('kth-planner-route',{detail:key}));const planner=document.getElementById('planner');planner?.focus({preventScroll:true});planner?.scrollIntoView({block:'start'});}
  return <section id="plan" className="wrap landing-tools" aria-labelledby={`${id}-title`}>
    <div className="landing-tools-head"><div><span className="eyebrow">{t.start}</span><h2 id={`${id}-title`}>{t.chooseTitle}</h2></div><span className="landing-free">{t.free}</span></div>
    <div className="landing-tool-switch" role="group" aria-label={t.chooseTitle}>{tools.map(item=><button key={item.key} type="button" aria-pressed={tool===item.key} aria-controls={`${id}-panel`} onClick={()=>choose(item.key)}><TravelIcon name={item.icon} compact/>{item.label}</button>)}</div>
    <div id={`${id}-panel`} className="landing-tool-panel">
      <div hidden={tool!=='visa'}><p className="landing-tool-note">{t.guideScope}</p><VisaFinder locale={locale} items={countries} labels={m.visaFinder} moreText={t.visaHint} entryCopy={entryCopy}/></div>
      <div hidden={tool!=='planner'}><p className="landing-tool-note">{t.plannerSub}</p><div className="landing-route-list">{routes.map(item=><a href="#planner" key={item.key} onClick={e=>route(e,item.key)}><span>{item.title}</span><span aria-hidden="true">→</span></a>)}</div><a className="landing-text-link" href="#planner">{t.myTrip} →</a></div>
      <div hidden={tool!=='budget'}><BudgetCalculator locale={locale}/></div>
    </div>
  </section>;
}
