import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGreetingAudio} from '../lib/greeting-audio.mjs';
import manifest from '../data/guide-audio.json' with {type:'json'};
test('all twelve language recordings exist and match current greetings',()=>{assert.equal(Object.keys(manifest).length,12);for(const [l,a]of Object.entries(manifest)){const {chat}=JSON.parse(fs.readFileSync(`messages/${l}.json`));assert.equal(a.text,`${chat.welcome.replace(/🌸/gu,'').trim()} ${chat.bubble}`);assert.ok(fs.statSync(`public${a.src}`).size>1000);}});
test('recording replay, stop and stale callbacks are safe',async()=>{let state,plays=0;const audio={pause(){},currentTime:9,play(){plays++;return Promise.resolve();}};const c=createGreetingAudio({audio,onState:s=>state=s});c.play('ko');assert.equal(audio.src,manifest.ko.src);audio.onplaying();assert.equal(state,'speaking');const stale=audio.onended;c.play('id');stale();assert.equal(state,'loading');assert.equal(audio.src,manifest.id.src);assert.equal(plays,2);c.stop();assert.equal(audio.currentTime,0);assert.equal(state,'idle');});
test('blocked playback and unknown language show fallback',async()=>{let state;const audio={pause(){},play(){return Promise.reject(new Error('blocked'));}};const c=createGreetingAudio({audio,onState:s=>state=s});c.play('ko');await Promise.resolve();assert.equal(state,'unavailable');c.play('xx');assert.equal(state,'unavailable');c.stop();});
