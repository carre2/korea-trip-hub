import sys, json, subprocess
from pathlib import Path
sys.path.insert(0,r'G:\내 드라이브\korea-trip-hub\marketing\tools\python')
import imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe()
out=Path(r'G:\내 드라이브\korea-trip-hub\marketing\2026-10-04\tiktok-pilot')
assets=out.parent/'instagram-10days'
font='C\\:/Windows/Fonts/arial.ttf'
jobs=[('seoul','3 DAYS IN SEOUL',[('seoul3','Choose your favorite stops'),('slow','Leave room to explore'),('cafe','Save time for a cafe break')]),('bestie','KOREA WITH YOUR BESTIE',[('bestie','Pick places you both love'),('vietnam','Make space for shared moments'),('plan','Customize and share your plan')]),('busan','BUSAN BY THE SEA',[('busan','Save your coastal inspiration'),('night','Add a little city-light mood'),('cafe','Leave room for a coffee pause')])]
records=[]
for name,title,scenes in jobs:
    clips=[]
    for i,(image,caption) in enumerate(scenes):
        titlefile=out/f'{name}-{i}-title.txt'; titlefile.write_text(title,encoding='utf8')
        captionfile=out/f'{name}-{i}-text.txt'; captionfile.write_text(caption,encoding='utf8')
        def escaped(p): return str(p).replace('\\','/').replace(':','\\:')
        filt=("scale=1200:1200,zoompan=z='min(zoom+0.00022,1.04)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=180:s=900x900:fps=30,"
          "pad=1080:1920:90:420:color=0xf8eee9,"
          f"drawtext=fontfile='{font}':textfile='{escaped(titlefile)}':fontsize=58:fontcolor=0x542042:x=(w-tw)/2:y=220,"
          f"drawtext=fontfile='{font}':textfile='{escaped(captionfile)}':fontsize=42:fontcolor=0x542042:x=(w-tw)/2:y=1400,"
          f"drawtext=fontfile='{font}':text='Korea Trip Hub':fontsize=46:fontcolor=0x542042:x=(w-tw)/2:y=1520,"
          f"drawtext=fontfile='{font}':text='ktriphub.com':fontsize=40:fontcolor=0x542042:x=(w-tw)/2:y=1590,"
          f"drawtext=fontfile='{font}':text='AI-created travel inspiration':fontsize=28:fontcolor=0x542042:x=(w-tw)/2:y=1680,"
          'fade=t=in:st=0:d=0.25,fade=t=out:st=5.75:d=0.25,format=yuv420p')
        clip=out/f'{name}-{i}.mp4'
        subprocess.run([ff,'-y','-loglevel','error','-i',str(assets/(image+'.png')),'-vf',filt,'-t','6','-an','-c:v','libx264','-preset','fast','-crf','20',str(clip)],check=True)
        clips.append(clip)
    concat=out/f'{name}-concat.txt';concat.write_text(''.join("file '"+str(p).replace('\\','/')+"'\n" for p in clips),encoding='utf8')
    final=out/f'tiktok-{name}.mp4'
    subprocess.run([ff,'-y','-loglevel','error','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(final)],check=True)
    for n,t in enumerate([1,7,13]):
        subprocess.run([ff,'-y','-loglevel','error','-ss',str(t),'-i',str(final),'-frames:v','1',str(out/f'{name}-qa-{n}.jpg')],check=True)
    records.append({'id':name,'video':str(final),'duration_seconds':18,'size':'1080x1920','fps':30,'audio':'none','status':'ready_for_user_review','source_images':[x[0] for x in scenes]})
    print(name+' complete',flush=True)
(out/'video-record.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
