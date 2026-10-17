export const speechLocales={en:'en-US',ko:'ko-KR',ja:'ja-JP',zh:'zh-CN','zh-TW':'zh-TW',vi:'vi-VN',id:'id-ID',th:'th-TH',ms:'ms-MY',es:'es-ES',fr:'fr-FR',ru:'ru-RU'};
export function greetingVoice(voices,locale){const lang=speechLocales[locale];if(!lang)return null;const same=voices.filter(v=>v.lang.toLowerCase().replaceAll('_','-')===lang.toLowerCase());if(same.length)return same.find(v=>v.localService)||same[0];if(locale==='zh'||locale==='zh-TW')return null;return voices.find(v=>v.lang.toLowerCase().split(/[-_]/)[0]===lang.split('-')[0])||null;}
export function createGreetingSpeech({synth,Utterance,onState}){
 let active=null,version=0,timer;
 function stop(){version++;clearTimeout(timer);if(active){active.onstart=active.onend=active.onerror=null;synth.cancel();active=null;}onState('idle');}
 function play(text,locale){stop();if(!synth||!Utterance){onState('unavailable');return;}const voice=greetingVoice(synth.getVoices(),locale);if(!voice){onState('unavailable');return;}const id=version,u=new Utterance(text);active=u;u.lang=speechLocales[locale];u.voice=voice;u.rate=1;u.pitch=1;onState('loading');u.onstart=()=>{if(id===version){clearTimeout(timer);onState('speaking');}};u.onend=()=>{if(id===version){clearTimeout(timer);active=null;onState('idle');}};u.onerror=()=>{if(id===version){clearTimeout(timer);active=null;onState('unavailable');}};timer=setTimeout(()=>{if(id===version){stop();onState('unavailable');}},10000);try{synth.speak(u);}catch{stop();onState('unavailable');}}
 return {play,stop};
}
