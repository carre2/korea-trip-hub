import json,urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
root=Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')
share=json.loads((root/'data/share-ui.json').read_text(encoding='utf-8'))
budget=json.loads((root/'data/budget-ui.json').read_text(encoding='utf-8'))
def check(locale):
 url=f'https://ktriphub.com/{locale}/guides/korea-from-indonesia/'
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'KoreaTripHub-DeploymentCheck/1.0'}),timeout=60) as response:
  assert response.status==200
  html=response.read().decode('utf-8')
 assert share[locale]['email'] in html,(locale,'email')
 assert budget[locale]['title'] in html,(locale,'budget')
 assert f'href="{url}"' in html,(locale,'canonical')
 return locale
with ThreadPoolExecutor(max_workers=4) as pool:
 print('Live new guide, localized sharing and budget PASS:',', '.join(pool.map(check,share)))
for path,expected in [('/en/plan/money/','Your trip budget'),('/vi/guides/korea-from-vietnam/','Tính ngân sách bằng VND'),('/id/visa/indonesia/','/id/guides/korea-from-indonesia/'),('/sitemap.xml','guides/korea-from-indonesia/')]:
 request=urllib.request.Request('https://ktriphub.com'+path,headers={'User-Agent':'KoreaTripHub-DeploymentCheck/1.0'})
 with urllib.request.urlopen(request,timeout=60) as response:html=response.read().decode('utf-8')
 assert expected in html,path
 print('PASS',path)
