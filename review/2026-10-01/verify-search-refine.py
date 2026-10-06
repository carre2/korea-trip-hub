import pathlib,re,json,html
root=pathlib.Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')
work=pathlib.Path(r'C:\Users\user\Documents\Codex\2026-10-01\tk\work')
locales=json.loads((root/'data/share-ui.json').read_text(encoding='utf-8'))
rows=[]
for loc in locales:
 for p in (root/'out'/loc).rglob('index.html'):
  with p.open(encoding='utf-8') as f:head=f.read(40000)
  title=re.search(r'<title>(.*?)</title>',head)
  desc=re.search(r'<meta name="description" content="(.*?)"',head)
  rows.append(dict(locale=loc,path=p.parent.relative_to(root/'out'/loc).as_posix(),title=html.unescape(title[1]) if title else '',description=html.unescape(desc[1]) if desc else ''))
en={r['path']:r['title'] for r in rows if r['locale']=='en'}
same=[r for r in rows if r['locale']!='en' and en.get(r['path'])==r['title']]
assert not same,same
for loc in locales:
 visa=[r for r in rows if r['locale']==loc and r['path'].startswith('visa/')]
 assert len(visa)==22
 assert len({r['description'] for r in visa})==22
 for r in visa:assert len(r['title'])<=70 and len(r['description'])<=180,r
 for country,currency in [('indonesia','IDR'),('vietnam','VND')]:
  text=(root/f'out/{loc}/guides/korea-from-{country}/index.html').read_text(encoding='utf-8')
  select=re.search(r'<select[^>]*id="[^"]+-currency"[^>]*>(.*?)</select>',text)[1]
  selected=re.search(r'<option[^>]*selected=""[^>]*>(.*?)</option>',select)[1]
  assert selected==currency,(loc,country,selected)
before=json.loads((work/'metadata-before-search-refine.json').read_text(encoding='utf-8'))
prior={(r['locale'],r['path']):r for r in before}
changed=sum(any(r[k]!=prior[(r['locale'],r['path'])][k] for k in ('title','description')) for r in rows)
(work/'metadata-after-search-refine.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'PASS: {len(rows)} pages audited; {changed} metadata pairs improved; English-identical titles 0; 264 passport descriptions unique per locale; 24 country-currency defaults correct.')
