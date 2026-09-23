import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeTrip, encodeTrip, decodeTrip } from '../lib/trip-state.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../data/itineraries.json', import.meta.url), 'utf8'));
test('shared routes preserve every selected stop but omit private checklist state', () => {
  for (const route of data.order) {
    const input = {v:1, route, excluded:['1-0'], checked:['visa','sim'], hotel:'private address'};
    const share = decodeTrip(encodeTrip(input), data.items);
    assert.deepEqual(share, {v:1,route,excluded:['1-0'],checked:[]});
    assert.equal(JSON.stringify(share).includes('private address'), false);
  }
});
test('malformed URLs and obsolete stop identifiers cannot enter application state', () => {
  for (const s of ['', '2.seoul-3-days.', '1.__proto__.', '1.missing.', '1.seoul-3-days.99-0', '1.seoul-3-days.1-0.extra', 'x'.repeat(2100)]) assert.equal(decodeTrip(s,data.items),null);
  for(const v of [null, {}, {v:1,route:'seoul-3-days',excluded:'wrong'}]) assert.equal(normalizeTrip(v,data.items),null);
});
test('saved state uses an allowlist and deduplicates valid IDs', () => {
  assert.deepEqual(normalizeTrip({v:1,route:'seoul-3-days',excluded:['1-0','1-0'],checked:['visa','visa','unknown'],email:'private'},data.items), {v:1,route:'seoul-3-days',excluded:['1-0'],checked:['visa']});
});
test('route and stop identifiers can be restored across all active languages', () => {
  const input={v:1,route:'seoul-3-days',excluded:['1-0','2-1'],checked:['visa']};
  for(const locale of ['ja','zh','zh-TW','vi','th','id','es','ms','ko','ru','fr']) {
    const localized=JSON.parse(fs.readFileSync(new URL(`../data/itineraries.${locale}.json`,import.meta.url),'utf8'));
    assert.equal(decodeTrip(encodeTrip(input),localized.items).route,input.route);
    assert.deepEqual(decodeTrip(encodeTrip(input),localized.items).excluded,input.excluded);
  }
});
