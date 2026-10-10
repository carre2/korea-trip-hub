import test from 'node:test';
import assert from 'node:assert/strict';
import {entryLanguage} from '../lib/entry-language.mjs';
import {affiliatePartner,eventPayload} from '../lib/analytics-policy.mjs';
import worker from '../worker/index.js';
test('language preference precedes country, respects q values and traditional Chinese',()=>{
 assert.equal(entryLanguage({acceptLanguage:'id-ID,id;q=0.9,en;q=0.8',country:'ID'}),'id');
 assert.equal(entryLanguage({acceptLanguage:'en;q=0.2,vi;q=0.9',country:'ID'}),'vi');
 assert.equal(entryLanguage({acceptLanguage:'zh-Hant-HK,zh;q=0.9'}),'zh-TW');
 assert.equal(entryLanguage({acceptLanguage:'ja;q=0,en;q=1'}),'en');
 assert.equal(entryLanguage({cookie:'other=x; kth_locale=ja',acceptLanguage:'id',country:'ID'}),'ja');
 assert.equal(entryLanguage({cookie:'kth_locale=evil',acceptLanguage:'unsupported',country:'TW'}),'zh-TW');
 assert.equal(entryLanguage({}),'en');
});
test('root redirects keep campaign IDs and never redirect explicit language URLs',async()=>{
 const request=new Request('https://ktriphub.com/?gclid=example&utm_source=pinterest',{headers:{'Accept-Language':'id-ID'}});
 const result=await worker.fetch(request,{});
 assert.equal(result.status,302);
 assert.equal(result.headers.get('Location'),'https://ktriphub.com/id/?gclid=example&utm_source=pinterest');
 assert.equal(result.headers.get('Cache-Control'),'private, no-store');
 const response=new Response('explicit locale');
 assert.equal(await worker.fetch(new Request('https://ktriphub.com/ja/visa/japan/'),{ASSETS:{fetch:async()=>response}}),response);
});
test('affiliate tracking recognizes only partner domains and excludes personal data',()=>{
 assert.equal(affiliatePartner('https://affiliate.klook.com/redirect?aid=1'),'klook');
 assert.equal(affiliatePartner('https://www.stay22.com/allez/roam'),'stay22');
 assert.equal(affiliatePartner('https://klook.com.fake.test'),null);
 assert.deepEqual(eventPayload('affiliate_click',{locale:'id',partner:'klook',email:'private@example.com',url:'private'}),{locale:'id',partner:'klook'});
});
