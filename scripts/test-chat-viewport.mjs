import assert from 'node:assert/strict';
import { chatViewport } from '../lib/chat-viewport.mjs';

// Both browser behaviors: layout viewport shrinks, or only visual viewport shrinks/pans.
for (const [height, offsetTop] of [[844,0],[400,0],[320,120],[260,80],[180,30]]) {
  const result = chatViewport({mobile:true,height,offsetTop});
  assert.ok(result.style.top >= offsetTop);
  assert.ok(result.style.top + result.style.height <= offsetTop + height);
  assert.equal(result.compact,height < 500);
}
assert.equal(chatViewport({mobile:false,height:900}),null);
console.log('PASS: keyboard viewport bounds, panning, compact mode and desktop reset');
