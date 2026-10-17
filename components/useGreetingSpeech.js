"use client";
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {createGreetingAudio} from '../lib/greeting-audio.mjs';
export default function useGreetingSpeech(locale){
 const [muted,setMuted]=useState(false),[state,setState]=useState('idle');
 const audioRef=useRef(null),controller=useRef(null),muteRef=useRef(false);
 const pathname=usePathname();
 useEffect(()=>{
  try{muteRef.current=localStorage.getItem('kth-guide-muted')==='1';setMuted(muteRef.current);}catch{}
  controller.current=createGreetingAudio({audio:audioRef.current,onState:setState});
  const hidden=()=>{if(document.hidden)controller.current?.stop();};
  document.addEventListener('visibilitychange',hidden);
  return()=>{document.removeEventListener('visibilitychange',hidden);controller.current?.stop();controller.current=null;};
 },[]);
 useEffect(()=>{controller.current?.stop();},[locale,pathname]);
 function play(){if(!muteRef.current)controller.current?.play(locale);}
 function toggleMute(){const next=!muteRef.current;muteRef.current=next;setMuted(next);controller.current?.stop();try{localStorage.setItem('kth-guide-muted',next?'1':'0');}catch{}}
 return {audioRef,muted,state,play,toggleMute,stop:()=>controller.current?.stop()};
}
