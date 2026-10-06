import hashlib, shutil, subprocess, zipfile
from pathlib import Path
root=Path(r'C:\Users\user\Documents\Codex\korea-trip-hub')
drive=Path(r'G:\내 드라이브\korea-trip-hub')
git=r'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
sha=subprocess.check_output([git,'rev-parse','HEAD'],cwd=root,text=True).strip()
files=subprocess.check_output([git,'ls-files','-z'],cwd=root).decode('utf-8').split('\0')
for rel in filter(None,files):
 src=root/rel;dst=drive/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 assert hashlib.sha256(src.read_bytes()).digest()==hashlib.sha256(dst.read_bytes()).digest(),rel
shutil.copytree(root/'.git',drive/'.git',dirs_exist_ok=True)
backups=Path(r'G:\내 드라이브\korea-trip-hub-backups\2026-10-01-growth')
backups.mkdir(parents=True,exist_ok=True)
subprocess.run([git,'archive','--format=zip','-o',str(backups/f'source-{sha[:8]}.zip'),'HEAD'],cwd=root,check=True)
with zipfile.ZipFile(backups/f'static-{sha[:8]}.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in (root/'out').rglob('*'):
  if f.is_file():z.write(f,f.relative_to(root/'out'))
for f in backups.glob('*.zip'):
 with zipfile.ZipFile(f) as z:assert z.testzip() is None
work=Path(r'C:\Users\user\Documents\Codex\2026-10-01\tk\work')
for dest in [root/'review/2026-10-01',drive/'review/2026-10-01']:
 dest.mkdir(parents=True,exist_ok=True)
 for name in ['growth-build-final.log','verify-growth-output.py','upgrade-site.py','sync-growth-release.py']:
  shutil.copy2(work/name,dest/name)
print(f'G mirror verified for {len(list(filter(None,files)))} tracked files; source/static ZIPs verified. Commit {sha}')
