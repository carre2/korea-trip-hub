import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {languageSwitchOptions,languageVisaCountries} from '../lib/language-switch.mjs';
const locales=['en','zh','zh-TW','ja','vi','th','id','es','ms','ko','ru','fr'];
test('Vietnam guide offers Japanese passport guide and an independent translation option',()=>{
assert.deepEqual(languageSwitchOptions('/vi/visa/vietnam/','ja',locales,'?utm_source=email','#faq'),{languageUrl:'/ja/visa/vietnam/?utm_source=email#faq',countryUrl:'/ja/visa/japan/?utm_source=email#faq'});
});
test('ordinary pages and ambiguous languages only change display language',()=>{
assert.equal(languageSwitchOptions('/vi/plan/airport/','ja',locales).countryUrl,null);
for(const code of ['en','es','fr','ko','ru'])assert.equal(languageSwitchOptions('/vi/visa/vietnam/',code,locales).countryUrl,null);
assert.equal(languageSwitchOptions('/ja/visa/japan/','ja',locales).countryUrl,null);
assert.equal(languageSwitchOptions('/vi/visa/vietnam/extra/','ja',locales).countryUrl,null);
assert.equal(languageSwitchOptions('/vi/visa/vietnam/','unknown',locales),null);
});
test('all offered destinations exist and have translated dialog choices',()=>{
const labels=JSON.parse(fs.readFileSync(new URL('../data/visa-switch-ui.json',import.meta.url),'utf8'));
for(const [code,country]of Object.entries(languageVisaCountries)){
assert.ok(fs.existsSync(new URL(`../data/visa/${country}.json`,import.meta.url)));
for(const key of ['title','body','country','language','cancel'])assert.ok(labels[code][key]);
}
});
