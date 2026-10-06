import concurrent.futures
import json
import urllib.request
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')
SITE = 'https://ktriphub.com'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.text = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip -= 1
    def handle_data(self, text):
        if not self.skip: self.text.append(text)

def fetch(path):
    request = urllib.request.Request(SITE + path, headers={'User-Agent': 'KoreaTripHub-deployment-check', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(request, timeout=30) as response:
        assert response.status == 200, (path, response.status)
        assert response.url.startswith(SITE), response.url
        return response.read().decode('utf-8')

def check_country(country):
    path = f'/zh-TW/visa/{country}/'
    html = fetch(path)
    copy = json.loads((ROOT / f'data/visa/{country}.i18n.json').read_text(encoding='utf-8'))['zh-TW']
    base = json.loads((ROOT / f'data/visa/{country}.json').read_text(encoding='utf-8'))
    page = Page()
    page.feed(html)
    assert copy['metaTitle'] in ' '.join(page.text), (country, 'new title not live')
    descriptions = [a.get('content') for tag, a in page.tags if tag == 'meta' and a.get('name') == 'description']
    assert descriptions == [copy['metaDesc']], (country, 'description')
    canonical = [a.get('href') for tag, a in page.tags if tag == 'link' and a.get('rel') == 'canonical']
    assert canonical == [SITE + path], (country, 'canonical')
    assert html.index('class="art-tldr"') < html.index('class="art-hero"'), country
    assert html.index('class="vcg-source-shortcuts"') < html.index('class="gv-steps"'), country
    assert html.index('class="gv-steps"') < html.index('class="arrival-next"'), country
    assert any(tag == 'time' and a.get('datetime') == base['updated'] for tag, a in page.tags), country
    return f'PASS {SITE + path}: HTTP 200, updated copy, canonical, layout order, review date'

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    for result in pool.map(check_country, ('indonesia','philippines','china','canada','taiwan')):
        print(result)
assert '<html' in fetch('/en/')
assert 'Sitemap:' in fetch('/robots.txt')
assert SITE + '/zh-TW/visa/indonesia/' in fetch('/sitemap.xml')
assert 'google.com, pub-2067934281598769, DIRECT, f08c47fec0942fa0' in fetch('/ads.txt')
print('PASS homepage, robots.txt, sitemap.xml, ads.txt')
