import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const languages={en:'English',ko:'Korean',ja:'Japanese',zh:'Mandarin Chinese, mainland pronunciation','zh-TW':'Mandarin Chinese, Taiwan pronunciation',vi:'Vietnamese',id:'Indonesian',th:'Thai',ms:'Malay',es:'Spanish',fr:'French',ru:'Russian'};
const dir='public/audio/guide';await fs.mkdir(dir,{recursive:true});
const manifest={};
for(const [locale,language] of Object.entries(languages)){
 const {chat}=JSON.parse(await fs.readFile(`messages/${locale}.json`,'utf8'));
 const input=`${chat.welcome.replace(/🌸/gu,'').trim()} ${chat.bubble}`;
 const config={model:'gpt-4o-mini-tts',voice:'marin',input,response_format:'mp3',instructions:`Speak in ${language}. Deliver a welcoming travel introduction like a polished professional broadcast announcer: clear precise articulation, calm confident tone, warm but restrained friendliness, smooth natural intonation, measured conversational pace, and a brief pause between sentences. Read only the supplied words. No music or sound effects. Do not imitate any named person.`};
 const hash=createHash('sha256').update(JSON.stringify(config)).digest('hex').slice(0,12),file=`${locale}-${hash}.mp3`;
 try{await fs.access(`${dir}/${file}`);}catch{
  if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY missing');
  const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(config),signal:AbortSignal.timeout(90000)});
  if(!r.ok)throw new Error(`Speech generation failed (${r.status}) for ${locale}`);
  const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000)throw new Error(`Invalid audio for ${locale}`);
  await fs.writeFile(`${dir}/${file}`,bytes);
 }
 manifest[locale]={src:`/audio/guide/${file}`,text:input};console.log(`Ready: ${locale}`);
}
await fs.writeFile('data/guide-audio.json',JSON.stringify(manifest,null,2)+'\n');
