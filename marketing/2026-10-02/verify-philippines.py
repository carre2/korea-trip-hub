import json, sys, urllib.request, concurrent.futures
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path('C:/Users/user/Documents/Codex/korea-trip-hub')
LOCALES=['en','zh','zh-TW','ja','vi','th','id','es','ms','ko','ru','fr']
LIVE='--live' in sys.argv
base=json.loads((ROOT/'data/visa/philippines.json').read_text(encoding='utf-8'))
overrides=json.loads((ROOT/'data/visa/philippines.i18n.json').read_text(encoding='utf-8'))
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.text=[]; self.tags=[]; self.skip=0
    def handle_starttag(self,tag,attrs):
        self.tags.append((tag,dict(attrs)))
        if tag in ('script','style'): self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip-=1
    def handle_data(self,text):
        if not self.skip:self.text.append(text)
def fetch(p):
    if not LIVE:return (ROOT/'out'/p.lstrip('/')).read_text(encoding='utf-8')
    url='https://ktriphub.com/'+p.lstrip('/').removesuffix('index.html')
    req=urllib.request.Request(url,headers={'Cache-Control':'no-cache','User-Agent':'KoreaTripHub-content-verification'})
    with urllib.request.urlopen(req,timeout=35) as r:
        assert r.status==200
        return r.read().decode('utf-8')
def check(loc):
    g=base if loc=='en' else overrides[loc]
    p=Page();p.feed(fetch(f'{loc}/visa/philippines/index.html'))
    text=' '.join(p.text)
    for s in [g['verdict']['headline'],g['highlights'][0]['body'],g['highlights'][1]['body'],g['documents']['rows'][3]['how']]:
        assert s in text,(loc,'new copy missing',s)
    assert any(t=='time' and a.get('datetime')=='2026-10-02' for t,a in p.tags),(loc,'review date')
    assert any(t=='link' and a.get('rel')=='canonical' and a.get('href')==f'https://ktriphub.com/{loc}/visa/philippines/' for t,a in p.tags),(loc,'canonical')
    assert any(t=='a' and 'seq=761029' in a.get('href','') for t,a in p.tags),(loc,'official processing source')
    faq=json.loads(fetch(f'visa-faq/{loc}.json'))
    entries=[e for e in faq['faq'] if e['topic']=='visa:philippines']
    assert len(entries)==6,(loc,'FAQ count')
    assert any(e['a']==g['faq']['items'][1]['a'] for e in entries),(loc,'FAQ fee')
    assert any(e['a']==g['faq']['items'][3]['a'] for e in entries),(loc,'FAQ processing')
    return f'PASS {loc}: corrected fee, timing, bank checklist, official source, review date, canonical and FAQ'
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(check,LOCALES):print(result)
print('LIVE PASS' if LIVE else 'STATIC EXPORT PASS')
