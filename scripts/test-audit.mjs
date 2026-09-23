import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {normalizePlaces,decodePlaces} from '../lib/places-state.mjs';
import {encodeTrip,decodeTrip} from '../lib/trip-state.mjs';
import {eventPayload,officialSource,pageGroup} from '../lib/analytics-policy.mjs';
const routes=JSON.parse(fs.readFileSync('data/itineraries.json')).items;
test('reordered itinerary shares exact IDs and keeps previous links readable',()=>{const input={v:1,route:'seoul-3-days',excluded:['2-0'],order:['1-2','1-0','1-1'],checked:['visa']};const out=decodeTrip(encodeTrip(input),routes);assert.deepEqual(out.order,input.order);assert.deepEqual(out.checked,[]);assert.ok(decodeTrip('1.seoul-3-days.',routes));assert.equal(decodeTrip('2.seoul-3-days..99-0',routes),null)});
test('saved places are deduplicated, ordered and constrained to public catalog IDs',()=>{const catalog={'dest:bukchon':{},'food:bbq':{}};assert.deepEqual(decodePlaces('dest:bukchon,evil,food:bbq,dest:bukchon',catalog),['dest:bukchon','food:bbq']);assert.deepEqual(normalizePlaces(['__proto__','email@example.com'],catalog),[]);assert.deepEqual(decodePlaces('x'.repeat(5000),catalog),[])});
test('analytics has a strict event and parameter allowlist without free text',()=>{assert.equal(eventPayload('secret',{email:'a@b.com'}),null);assert.deepEqual(eventPayload('checklist_progress',{locale:'ko',item_id:'visa',completed_count:2,passport:'private'}),{locale:'ko',item_id:'visa',completed_count:2});assert.deepEqual(eventPayload('place_save',{target:'private address'}),{});assert.equal(pageGroup('/en/plan/visa/'),'visa-hub');assert.equal(pageGroup('/en/visa/malaysia/'),'visa-country');assert.equal(officialSource('https://k-eta.go.kr.fake.com'),null);});

