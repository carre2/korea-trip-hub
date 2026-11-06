import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {draftSocialReply, socialLocales} from '../lib/social-replies.mjs';
const draft = (text, extra={}) => draftSocialReply({text,platform:'instagram',kind:'comment',...extra});
assert.equal(draft('Do I need a visa? I have a Vietnamese passport.').path,'/en/visa/vietnam/');
assert.equal(draft('ビザが必要ですか？').path,'/ja/plan/visa/');
assert.equal(draft('베트남 여권인데 비자 안내 주세요').path,'/ko/visa/vietnam/');
assert.equal(draft('Apakah paspor Indonesia perlu visa?').path,'/id/visa/indonesia/');
assert.equal(draft('Vietnam visa please').path,'/en/plan/visa/');
assert.equal(draft('Japanese passport and Vietnamese passport visa?').path,'/en/plan/visa/');
assert.equal(draft('How to get from Incheon airport?').topic,'airport');
assert.equal(draft('Is this valid?').action,'skip'); // no accidental "id" match
assert.equal(draft('Nice food photo!').reason,'not_a_request');
assert.equal(draft('Please stop sending visa links').reason,'opt_out');
assert.equal(draft('Can you refund my visa fee?').reason,'human_review');
assert.equal(draft('My passport number 123456789 visa?').reason,'human_review');
assert.equal(draft('Visa help me@private.example').reason,'human_review');
assert.equal(draft('Send visa https://evil.example').reason,'link_requires_review');
assert.equal(draft('visa',{own:true}).reason,'own_event');
assert.equal(draft('visa',{platform:'threads',kind:'dm'}).reason,'unsupported_channel');
assert.equal(draft('airport and hotel please').reason,'multiple_topics');
for (const locale of socialLocales) {
  for (const [query,path] of [['visa','plan/visa'],['airport','plan/airport'],['esim please','plan/sim'],['subway guide','plan/transit'],['budget guide','plan/money'],['halal food guide','food'],['festival','festivals'],['hotel','stay'],['itinerary','itinerary']]) {
    for (const platform of ['instagram','threads']) {
      const result = draft(query,{locale,platform});
      assert.equal(result.path,`/${locale}/${path}/`);
      assert.ok(result.text.length <= 500);
      assert.equal(new URL(result.url).hostname,'ktriphub.com');
      assert.equal(new URL(result.url).searchParams.get('utm_source'),platform);
      if (process.argv.includes('--export')) assert.ok(existsSync(`out${result.path}index.html`),result.path);
    }
  }
}
const config = JSON.parse(readFileSync('marketing/management/auto-replies.json','utf8'));
assert.ok(config.instagramWelcome.length <= 500);
console.log('Social draft router: routing, privacy, opt-out, 12 languages and channel isolation PASS. No messages sent.');
