import re, json, sys
d1=open('kira-december-schedule.md',encoding='utf-8').read()
d2=open('kira-schedule-dec07-31.md',encoding='utf-8').read()
pa=open('kira-posts/promo/APPROVAL.md',encoding='utf-8').read()
def block_after(text, marker):
    i=text.index(marker); s=text.index('```\n',i)+4; e=text.index('```',s); return text[s:e].rstrip('\n')
L='kira-posts/lifestyle/'; P='kira-posts/promo/'
C4="""[Ad] Kira and ktriphub are run by the same team.
Booking a trip for January 2027? The temporary K-ETA waiver only covers designated countries and regions, and only through Dec 31, 2026.
If your passport needs a visa (like Indonesian ordinary passports), K-ETA is not an alternative.
Check your passport + official notice → link in bio. (as of Nov 16, 2026)
🇮🇩 Paspor Indonesia tetap perlu visa turis — K-ETA bukan penggantinya.
#KETA #KoreaTravel2027 #TravelKorea #KoreaVisa"""
items=[
('11/26',L+'l1126_t03_meringue.mp4',block_after(d1,'### 11/26 · t03'),True),
('11/27',P+'c2/c2_kvac_checklist_music.mp4',block_after(pa,'## C2 —'),False),
('11/28',L+'l1128_t01_scarf.mp4',block_after(d1,'### 11/28 · t01'),True),
('11/29',L+'l1129_t04_pizzaseolgi.mp4',block_after(d1,'### 11/29 · t04'),True),
('11/30',P+'r4/r4_airport_music.mp4',block_after(pa,'## R4 —'),False),
('12/1',L+'l1201_d10_kimjang.mp4',block_after(d1,'### 12/01 · d10'),True),
('12/2',P+'c4/c4_keta_music.mp4',C4,False),
('12/3',L+'l1203_t05_skincare.mp4',block_after(d1,'### 12/03 · t05'),True),
('12/4',P+'r2/r2_report_music.mp4',block_after(pa,'## C4 · R2'),False),
('12/5',L+'l1205_d02d03_snacks.mp4',block_after(d1,'### 12/05 · d02'),True),
('12/6',L+'l1206_t06_musical.mp4',block_after(d1,'### 12/06 · t06'),True),
('12/7',L+'l1207_d08_subway.mp4',block_after(d1,'### 12/08 · d08'),True),
('12/8',L+'l1208_d04d05_nightshift.mp4',block_after(d1,'### 12/09 · d04'),True),
('12/9',L+'l1209_d11_jjimjilbang.mp4',block_after(d1,'### 12/12 · d11'),True),
('12/10',P+'r7/r7_lantern_music.mp4',block_after(d2,'**R7 · 12/10**'),False),
('12/11',L+'l1211_d06_lantern.mp4',block_after(d1,'### 12/11 · d06'),True),
('12/12',L+'l1212_t07_myeongdong.mp4',block_after(d1,'### 12/14 · t07'),True),
('12/13',P+'c3/c3_firstday_music.mp4',block_after(d2,'**C3 · 12/13**'),False),
('12/14',L+'l1214_d16_hanokcafe.mp4',block_after(d1,'### 12/15 · d16'),True),
('12/15',L+'l1215_d14d15_model.mp4',block_after(d1,'### 12/17 · d14'),True),
('12/16',P+'r6/r6_map_music.mp4',block_after(d2,'**R6 · 12/16**'),False),
('12/17',L+'l1217_d13_bank.mp4',block_after(d1,'### 12/18 · d13'),True),
('12/18',L+'l1218_d23_postoffice.mp4',block_after(d1,'### 12/20 · d23'),True),
('12/19',P+'w1/w1_winter_music.mp4',block_after(d2,'**W1 · 12/19**'),False),
('12/20',L+'l1220_d21_bukhansan.mp4',block_after(d1,'### 12/21 · d21'),True),
('12/21',L+'l1221_d19_cooking.mp4',block_after(d2,'**12/21 d19'),True),
]
# 12/07 override from 2부
out=[]
for k,v,c,life in items:
    if k=='12/7':
        c=c.replace('Tuesday, 8 a.m., Line 2. Half asleep, fully dressed for minus degrees 🚇','Monday, 8 a.m., Line 2. Half asleep, fully dressed for minus degrees 🚇').replace('#CommuteLife','#MondayMood')
    out.append({'date':k,'video':v,'ig_caption':c,'lifestyle':life})
def h(s):
    s=re.sub(r'\s+',' ',s).strip(); x=5381
    b=s.encode('utf-16-le')
    for i in range(0,len(b),2):
        x=((x*33)+(b[i]|(b[i+1]<<8)))&0xffffffff
    return x
for o in out: o['hash']=h(o['ig_caption'])
json.dump(out,open('kira-posts/threads-copies/captions.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(json.dumps({o['date']:o['hash'] for o in out}))
