import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
root=Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')
labels=json.loads((root/'data/share-ui.json').read_text(encoding='utf-8'))
budget=json.loads((root/'data/budget-ui.json').read_text(encoding='utf-8'))
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(); self.links=[];self.ids=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag in ('a','link'):self.links.append({'_tag':tag,**d})
  if 'id' in d:self.ids.append(d['id'])
count=0
for locale,t in labels.items():
 for path in ['guides/korea-from-indonesia','guides/korea-from-vietnam','plan/money','visa/indonesia','visa/vietnam']:
  text=(root/'out'/locale/path/'index.html').read_text(encoding='utf-8');p=Page(text)
  canonical=[l.get('href') for l in p.links if l.get('rel')=='canonical']
  assert canonical==[f'https://ktriphub.com/{locale}/{path}/'],(locale,path,canonical)
  assert t['email'] in text and t['copy'] in text,(locale,path,'sharing labels')
  if path.startswith(('guides/','plan/')):
   assert 'budget' in p.ids,(locale,path,'budget')
   assert budget[locale]['note'] in text,(locale,path,'user-supplied estimate label')
   if locale != 'ko':assert budget[locale]['rateNote'] in text,(locale,path,'manual rate label')
  else:
   country=path.split('/')[-1]
   assert any(l.get('href')==f'/{locale}/guides/korea-from-{country}/' for l in p.links)
   assert any(l.get('href')==f'/{locale}/plan/money/#budget' for l in p.links)
  for link in p.links:
   href=link.get('href','')
   if link['_tag']=='a' and href.startswith('/') and not href.startswith('//'):
    local=root/'out'/urlparse(href).path.lstrip('/')/'index.html'
    assert local.exists(),(locale,path,href)
  count+=1
print(f'PASS: {count} exported pages checked for localized sharing, budget tools, canonical and working internal destinations.')
