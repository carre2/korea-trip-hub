import audioManifest from '../data/guide-audio.json' with {type:'json'};

// One site-owned recording per language; never substitute a device voice.
export function createGreetingAudio({audio,onState}) {
 let version=0,timer;
 function stop(){
  version++;clearTimeout(timer);
  audio.onplaying=audio.onended=audio.onerror=null;
  audio.pause();audio.currentTime=0;onState('idle');
 }
 function play(locale){
  stop();const source=audioManifest[locale]?.src;
  if(!source){onState('unavailable');return;}
  const id=version;
  audio.src=source;onState('loading');
  const fail=()=>{if(id===version){stop();onState('unavailable');}};
  audio.onplaying=()=>{if(id===version){clearTimeout(timer);onState('speaking');}};
  audio.onended=()=>{if(id===version){clearTimeout(timer);onState('idle');}};
  audio.onerror=fail;
  timer=setTimeout(fail,15000);
  try{Promise.resolve(audio.play()).catch(fail);}catch{fail();}
 }
 return {play,stop};
}
