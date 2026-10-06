import json,pathlib
root=pathlib.Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')
p=root/'messages/fr.json';d=json.loads(p.read_text(encoding='utf-8'));d['dest']['title']='Lieux à visiter en Corée';p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=root/'data/legal.fr.json';d=json.loads(p.read_text(encoding='utf-8'));d['pages']['contact']['title']='Nous contacter';p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
