from pathlib import Path
import json
from html.parser import HTMLParser

root = Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.skip = 0
        self.text = []
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip -= 1
    def handle_data(self, data):
        if not self.skip: self.text.append(data)

for country in ('indonesia', 'philippines', 'china', 'canada', 'taiwan'):
    html = (root / f'out/zh-TW/visa/{country}/index.html').read_text(encoding='utf-8')
    base = json.loads((root / f'data/visa/{country}.json').read_text(encoding='utf-8'))
    copy = json.loads((root / f'data/visa/{country}.i18n.json').read_text(encoding='utf-8'))['zh-TW']
    page = Page()
    page.feed(html)
    text = ' '.join(page.text)
    assert 'Official channels' not in text, country
    assert 'Covers:' not in text, country
    assert copy['resources']['title'] in text, country
    for label in copy['factValueLabels'].values(): assert label in text, (country, label)
    for item in copy['official']: assert item['name'] in text, (country, item['name'])
    assert html.index('class="art-tldr"') < html.index('class="art-hero"'), country
    assert html.index('class="vcg-source-shortcuts"') < html.index('class="gv-steps"'), country
    assert html.index('class="gv-steps"') < html.index('class="arrival-next"'), country
    times = [a.get('datetime', a.get('dateTime')) for t, a in page.tags if t == 'time']
    assert base['updated'] in times, (country, times)
    images = [a for t,a in page.tags if t == 'img' and a.get('src') == base['hero']['img']]
    assert images and images[0]['width'] == '1280' and images[0]['height'] == '960'
    assert all(a.get('href') for t, a in page.tags if t == 'a')
    print(f'PASS {country}: localized content, source links, answer order, review date, image dimensions')
