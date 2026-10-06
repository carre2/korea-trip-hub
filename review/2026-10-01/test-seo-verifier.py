from pathlib import Path
import subprocess
import shutil

work = Path(__file__).parent
fixture = work / 'seo-fixture'
site = 'https://ktriphub.com'
node = r'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
for rel in ('scripts', 'lib', 'out/en', 'out/img'):
    (fixture / rel).mkdir(parents=True, exist_ok=True)
shutil.copyfile(Path(r'C:\Users\user\Documents\Codex\korea-trip-hub\scripts\verify-seo.mjs'), fixture / 'scripts/verify-seo.mjs')
(fixture / 'lib/i18n.js').write_text('export const locales = ["en"];', encoding='utf-8')
(fixture / 'out/img/og.jpg').write_bytes(b'fixture')
(fixture / 'out/robots.txt').write_text(f'Sitemap: {site}/sitemap.xml', encoding='utf-8')
(fixture / 'out/sitemap.xml').write_text(f'<urlset><url><loc>{site}/en/</loc></url></urlset>', encoding='utf-8')
html = f'''<html lang="en"><head><title>Fixture</title>
<meta name="description" content="Test fixture">
<link rel="canonical" href="{site}/en/">
<link rel="alternate" hreflang="en" href="{site}/en/">
<link rel="alternate" hreflang="x-default" href="{site}/en/">
<meta property="og:image" content="{site}/img/og.jpg"></head><body>Fixture</body></html>'''
for label, body, expected in (
    ('valid page', html, 0),
    ('incorrect canonical rejected', html.replace('rel="canonical" href="'+site+'/en/"', 'rel="canonical" href="'+site+'/wrong/"'), 1),
    ('missing image rejected', html.replace('/img/og.jpg', '/img/missing.jpg'), 1),
):
    (fixture / 'out/en/index.html').write_text(body, encoding='utf-8')
    result = subprocess.run([node, str(fixture / 'scripts/verify-seo.mjs')], capture_output=True, text=True, encoding='utf-8')
    assert result.returncode == expected, result.stdout + result.stderr
    print('PASS: ' + label)
