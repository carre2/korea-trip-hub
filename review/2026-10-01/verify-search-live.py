import json,re,html,urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
work=Path(r'C:\Users\user\Documents\Codex\2026-10-01\tk\work')
expected={(r['locale'],r['path']):r for r in json.loads((work/'metadata-after-search-refine.json').read_text(encoding='utf-8'))}
locales=sorted({k[0] for k in expected})
def fetch(path):
 req=urllib.request.Request('https://ktriphub.com/'+path,headers={'User-Agent':'KoreaTripHub-DeploymentCheck/1.0'})
 with urllib.request.urlopen(req,timeout=60) as response:
  assert response.status==200,path
  return response.read().decode('utf-8')
def check(pair):
 locale,path=pair;text=fetch(f'{locale}/{path}/');target=expected[pair]
 title=html.unescape(re.search(r'<title>(.*?)</title>',text)[1])
 desc=html.unescape(re.search(r'<meta name="description" content="(.*?)"',text)[1])
 assert (title,desc)==(target['title'],target['description']),(pair,title,desc)
 return pair
pairs=[(loc,path) for loc in locales for path in ['visa/indonesia','plan/sim']]+[('fr','legal/contact'),('fr','destinations'),('id','stay/incheon'),('vi','plan/visa')]
with ThreadPoolExecutor(max_workers=4) as pool:checked=list(pool.map(check,pairs))
print(f'PASS: {len(checked)} live pages have the new localized search metadata.')
for locale,country,currency in [('ko','indonesia','IDR'),('en','vietnam','VND')]:
 text=fetch(f'{locale}/guides/korea-from-{country}/')
 select=re.search(r'<select[^>]*id="[^"]+-currency"[^>]*>(.*?)</select>',text)[1]
 assert re.search(r'<option[^>]*selected=""[^>]*>(.*?)</option>',select)[1]==currency
 print('PASS: live currency',locale,country,currency)
