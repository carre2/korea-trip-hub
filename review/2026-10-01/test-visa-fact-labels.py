from pathlib import Path
import json
import shutil
import subprocess

fixture = Path(__file__).parent / 'fact-label-fixture'
node = r'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
for rel in ('scripts', 'lib', 'data/visa'):
    (fixture / rel).mkdir(parents=True, exist_ok=True)
shutil.copyfile(Path(r'C:\Users\user\Documents\Codex\korea-trip-hub\scripts\verify-content-i18n.mjs'), fixture / 'scripts/verify-content-i18n.mjs')
(fixture / 'lib/i18n.js').write_text('export const locales = ["en", "zh-TW"];', encoding='utf-8')
(fixture / 'data/facts.json').write_text(json.dumps({'facts': [{'id': 'test', 'value': {'limit': '3 days'}}]}), encoding='utf-8')
(fixture / 'data/visa/test.json').write_text(json.dumps({'factId': 'test'}), encoding='utf-8')
for label, labels, expected in (
    ('valid fact translation', {'3 days': '3 天'}, 0),
    ('changed small number rejected', {'3 days': '4 天'}, 1),
    ('stale source value rejected', {'4 days': '4 天'}, 1),
):
    (fixture / 'data/visa/test.i18n.json').write_text(json.dumps({'zh-TW': {'factValueLabels': labels}}, ensure_ascii=False), encoding='utf-8')
    result = subprocess.run([node, str(fixture / 'scripts/verify-content-i18n.mjs')], capture_output=True, text=True, encoding='utf-8')
    assert result.returncode == expected, result.stdout + result.stderr
    print('PASS: ' + label)
