# kira.in.seoul — 인스타 + 쓰레드 일정 (2026-11-24 ~ 12-31) · 승인 요청

작성 2026-11-23 · 발행 시각 **피드 21:00 KST (=19:00 WIB)**, **쓰레드 전용 글 12:00 KST (=10:00 WIB)**
운영 규칙: 사용자 승인 → 예약 발행만 · 게시 후 URL/ID를 `publishing-status.csv`에 기록.
기존 홍보 캘린더(`kira-instagram-2week-calendar.md`)의 R2~R7·C2~C4는 날짜만 옮겨서 이 일정에 넣었다.

## 0. 규칙 요약
- **비율**: 일상 약 2.5 : 홍보 1 (홍보 11개, 일상 27개).
- **음악**: 모든 게시물에 넣는다. 일상 사진은 사진 1장(또는 2장)에 천천히 줌이 들어가는 4:5 영상(7~9초)으로 만들고 음악을 붙인다(릴스로 공유됨). 음원은 `music/ROTATION.md` 순서 C→D→E→F→A→B.
- **AI 표시**: 일상 게시물 마지막 줄에 `🤖 Kira is a virtual character · AI-generated image`. Business Suite에 AI 라벨 옵션이 있으면 켠다.
- **홍보 게시물**: 첫 줄 `[Ad] Kira and ktriphub are run by the same team.` (제휴 링크가 있으면 Affiliate 문구까지).
- **지어낸 체험 금지**: 실제 가게·인물(스카프 아저씨 포함)과 직접 만났다, 사 왔다, 맛있었다 같은 문장은 쓰지 않는다. 장면 묘사와 질문 위주로 쓴다.
- **쓰레드**: ① 인스타 피드 게시물은 모두 작성 창의 "Threads에 공유"를 켜서 같이 올린다. ② 쓰레드 전용 대화형 글은 주 3회(월·수·금 12:00)로 올린다. 쓰레드는 링크가 클릭되므로 홍보 글에는 링크를 직접 넣는다(`utm_source=threads`).
- **사실 재검증**: 인도네시아 비자·K-ETA 관련 fact는 기한(12-05/12-09)이 지나면 재검증한 뒤 발행. 12/30 홍보 슬롯은 재검증 후 문구를 확정한다.

## 0-1. 제재 방지 원칙 (2026-11-23 추가 · 모든 게시물에 우선 적용)
1. **발행 경로는 하나**: kira.in.seoul은 Meta Business Suite 예약(공식 기능)만 쓴다. 비공식 자동화, 로그인 대행 툴, 다른 기기·VPN 동시 로그인은 쓰지 않는다. `07. 자동 배포`의 publish.js·dm-bot.js(공식 Graph API, @kiralaurent.kr용)는 **이 계정에 연결하지 않는다.**
2. **양과 속도**: 피드는 하루 최대 1개, 쓰레드 전용 글은 주 3개, 스토리는 하루 3개 이하. 몰아서 올리지 않는다. 예약은 고정 시각(21:00 / 12:00)에 둔다.
3. **같은 콘텐츠를 여러 계정에 올리지 않는다**: Kira의 다른 계정(@kiralaurent.kr 등)에 같은 영상·캡션을 올리면 스팸 신호가 된다. 인스타→쓰레드는 작성 창의 공식 "Threads에 공유"만 쓴다.
4. **링크**: 인스타 캡션에는 링크를 넣지 않는다(바이오만). 쓰레드 링크 글은 **주 1개 이하**로 하고, 같은 URL을 반복해서 올리지 않는다. 댓글에 링크를 달거나 DM으로 링크를 대량 발송하지 않는다.
5. **참여 유도 문구 금지**: "댓글 달면 링크 보내줄게", "좋아요 누르면…" 같은 문구는 Meta가 노출을 줄이는 대상이다. 질문형("Which one?")만 쓴다. 기존 R2의 "Comment a place… I'll reply with the report link"는 **삭제 후 질문형으로 바꾼다.**
6. **해시태그**: 게시물당 3~5개, 내용과 관련된 것만, 매번 같은 묶음을 반복하지 않는다.
7. **AI 표시**: 실사형 AI 이미지는 Meta 정책상 AI 라벨 대상이다. 작성 창에 AI 라벨 옵션이 있으면 반드시 켜고, 캡션 마지막 줄 표시도 유지한다. 옵션이 없으면 예약 전에 알리고 처리 방법을 정한다.
8. **실존 인물**: 실제 인물을 AI로 만든 이미지는 본인이나 제3자가 신고하면 삭제되고 계정 경고가 쌓일 수 있다(조작된 미디어·사칭 신고). **t01(스카프 아저씨)이 이번 일정에서 위험도가 가장 높다** → 아래 결정 필요.
9. **권리**: 음악은 직접 만든 곡만 쓴다(저작권 신고 없음). 사이트 화면 속 사진은 출처 표기를 유지한다. 브랜드 계정 태그·상표 언급은 하지 않는다(협찬으로 오해받지 않게).
10. **수정·삭제 반복 금지**: 게시 후 캡션을 여러 번 고치거나 지웠다가 다시 올리지 않는다. 고칠 일은 예약 단계에서 끝낸다.
11. **사람 응대**: 팔로우/언팔로우 반복, 좋아요 몰아누르기, 자동 댓글은 하지 않는다. 댓글 답장은 사람이 직접, 하루 몇십 개 이내로 한다.

> **결정 필요: 11/28 t01** — 위험을 줄이려면 아저씨가 나오지 않는 **t01b(같은 남대문 스카프 노점)** 로 바꾸기를 권한다. 사용자가 t01을 유지하면, 신고가 들어왔을 때 바로 내릴 수 있게 그 게시물만 따로 기록해 둔다.

## 1. 한눈에 보기 (피드 · 21:00 KST)

| 날짜 | 구분 | 내용 | 이미지/소재 | 음원 | 쓰레드 전용 (12:00) |
|---|---|---|---|---|---|
| 11/23 일 | 홍보 | R1 ktriphub 소개 *(예약 완료)* | r1 영상 | A | – |
| 11/24 월 | 일상 | MAMA 주말, 친구들과 응원 | t02 | C | TH1 겨울 짐 질문 |
| 11/25 화 | 홍보 | C1 인니 비자 슬라이드 *(예약 완료)* | c1 영상 | B | – |
| 11/26 수 | 일상 | 머랭롤 오픈런 | t03 | D | TH2 첫 한국여행 고민 |
| 11/27 목 | 홍보 | C2 KVAC 서류 체크리스트 | 슬라이드 제작 | E | – |
| 11/28 금 | 일상 | 남대문 스카프 노점 | t01 | F | TH3 한국어 한마디 |
| 11/29 토 | 일상 | 떡집 피자설기 | t04 | A | – |
| 11/30 일 | 홍보 | R3 제주 30일 무비자 조건 | 슬라이드 영상 | B | – |
| 12/01 월 | 일상 | 옥상 김장 돕기 | d10 | C | TH4 김장 문화 |
| 12/02 화 | 홍보 | C4 K-ETA 면제 12/31까지 | 슬라이드 제작 | D | – |
| 12/03 수 | 일상 | 화장품 가게 장보기 | t05 | E | TH5 [Ad] 인니 1월 여행 비자 |
| 12/04 목 | 홍보 | R5 아침고요수목원 빛축제 개막 (제휴) | 이미지 라이선스 확인 필요 | F | – |
| 12/05 금 | 일상 | 붕어빵 + 남대문 호떡 (2장) | d02·d03 | A | TH6 붕어빵 머리부터? |
| 12/06 토 | 일상 | 뮤지컬 로비 자막 안경 | t06 | B | – |
| 12/07 일 | 홍보 | R4 인천공항 → 서울 3가지 | 슬라이드 영상 | C | – |
| 12/08 월 | 일상 | 출근길 지하철 | d08 | D | TH7 |
| 12/09 화 | 일상 | 편의점 야간 알바 → 새벽 삼각김밥 (2장) | d04·d05 | E | – |
| 12/10 수 | 홍보 | R7 서울빛초롱축제 내일 개막 (제휴) | 슬라이드 영상 | F | TH8 |
| 12/11 목 | 일상 | 청계천 빛초롱 산책 (개막일) | d06 | A | – |
| 12/12 금 | 일상 | 찜질방 + 식혜 | d11 | B | TH9 |
| 12/13 토 | 홍보 | R2 장소 입력 → 즉석 리포트 (화면 녹화) | 화면 녹화 | C | – |
| 12/14 일 | 일상 | 명동에서 길 잃은 여행객 돕기 | t07 | D | – |
| 12/15 월 | 일상 | 한옥 카페 한국어 공부 | d16 | E | TH10 |
| 12/16 화 | 홍보 | R6 지도로 찾기: 강원 겨울축제 | 화면 녹화 | F | – |
| 12/17 수 | 일상 | 모델 알바 백스테이지 → 성수 촬영 (2장) | d14·d15 | A | TH11 |
| 12/18 목 | 일상 | 은행 창구에서 당황 | d13 | B | – |
| 12/19 금 | 홍보 | C3 첫날: 인터넷 + T-money | 슬라이드 제작 | C | TH12 |
| 12/20 토 | 일상 | 우체국에서 고향에 소포 | d23 | D | – |
| 12/21 일 | 일상 | 겨울 북한산 | d21 | E | – |
| 12/22 월 | 일상 | 미고렝 떡볶이 + 자카르타 영상통화 (2장) | d19·d20 | F | TH13 |
| 12/23 화 | 일상 | 송년회 포차 | d17 | A | – |
| 12/24 수 | 일상 | 명동 크리스마스 조명 | d18 | B | TH14 |
| 12/25 목 | 일상 | 한강 라면 + 친구 | d07 | C | – |
| 12/26 금 | 일상 | 광장시장 빈대떡 | d12 | D | TH15 |
| 12/27 토 | 일상 | 눈 오는 망원동 골목 | d01 | E | – |
| 12/28 일 | 일상 | 눈 덮인 경복궁 | d22 | F | – |
| 12/29 월 | 일상 | 자취방 빨래 건조대 | d09 | A | TH16 |
| 12/30 화 | 홍보 | (재검증 후 확정) 2027년 여행 체크: K-ETA 한시 면제 내일 종료 | 슬라이드 | B | – |
| 12/31 수 | 일상 | 제야 카운트다운 | d24 | C | TH17 |

- 12/08 이후 쓰레드 전용 글(TH7~TH17)은 첫 2주 반응을 보고 12/07에 써서 승인받는다.
- 홍보 소재(C2·R3·C4·R5·R4·R7·R2·R6·C3)는 발행 2일 전까지 만들어서 따로 승인받는다. 이번 승인 대상은 **11/24~12/06 일상 게시물 캡션 + 쓰레드 TH1~TH6 + 전체 일정**이다.

## 2. 일상 게시물 캡션 (11/24 ~ 12/31)

### 11/24 · t02 · MAMA weekend
```
MAMA weekend = floor seats, light sticks and way too many snacks 💡
Who was your stage of the night?
🇮🇩 Weekend MAMA bareng teman-teman. Panggung favorit kalian siapa?
#MAMA2026 #KpopFan #SeoulLife #KehidupanDiKorea
🤖 Kira is a virtual character · AI-generated image
```

### 11/26 · t03 · meringue roll open-run
```
Seoul in late November: minus degrees, and still a queue for meringue roll cake 🥶🍰
Would you wait in line for a dessert?
🇮🇩 Antre kue meringue roll di pagi yang dingin. Kalian rela antre demi dessert?
#SeoulDessert #MeringueRoll #SeoulLife #KulinerKorea
🤖 Kira is a virtual character · AI-generated image
```

### 11/28 · t01 · Namdaemun scarves
```
Namdaemun's scarf stalls are all over Korean news and feeds right now 🧣
If you go, be patient — it gets very crowded, so go easy and stay safe.
Which color would you pick?
🇮🇩 Syal-syal di Pasar Namdaemun lagi viral. Ramai banget, jadi sabar ya!
#Namdaemun #NamdaemunMarket #SeoulShopping #PasarNamdaemun
🤖 Kira is a virtual character · AI-generated image
```

### 11/29 · t04 · pizza seolgi
```
Pizza… but make it rice cake 🍕 + 떡
Pizza seolgi is the rice cake shop trend of the month. Yes or no?
🇮🇩 Kue beras rasa pizza — tren baru di toko tteok. Mau coba?
#Tteok #KoreanFood #SeoulFoodie #MakananKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/01 · d10 · kimjang
```
December means kimjang — making a whole winter's kimchi together 🥬
Red gloves on, and I'm learning from the best.
🇮🇩 Bulan Desember = kimjang, bikin kimchi bareng untuk musim dingin.
#Kimjang #Kimchi #KoreanCulture #BudayaKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/03 · t05 · skincare shopping
```
"Just one thing" — said every visitor in a Seoul skincare aisle 🧴
What's the first thing on your Korea beauty list?
🇮🇩 Masuk toko skincare di Seoul, katanya cuma mau beli satu… 😅
#KBeauty #SeoulShopping #KoreanSkincare #SkincareKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/05 · d02 + d03 · street snacks
```
Winter street snack rules: bungeoppang in one hand, hotteok in the other 🐟🥞
(Blow first. The filling is lava.)
🇮🇩 Jajanan musim dingin: bungeoppang dan hotteok. Hati-hati, isinya panas!
#Bungeoppang #Hotteok #KoreanStreetFood #JajananKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/06 · t06 · subtitle glasses
```
Musicals in Seoul with subtitles floating in your glasses? Trying it before curtain up 👓🎭
Would you see a Korean musical?
🇮🇩 Nonton musikal Korea pakai kacamata subtitle. Kalian mau coba?
#KoreanMusical #SeoulNights #KCulture #BudayaKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/08 · d08 · subway commute
```
Monday, 8 a.m., Line 2. Half asleep, fully dressed for minus degrees 🚇
🇮🇩 Senin pagi di kereta Seoul. Masih ngantuk 😴
#SeoulSubway #SeoulLife #MondayMood #KehidupanDiKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/09 · d04 + d05 · night shift
```
Night shift: restocking the hot-drink warmer → 2 a.m. triangle kimbap at the window 🌙🍙
Convenience stores never sleep, and neither do part-timers.
🇮🇩 Shift malam di minimarket, lalu kimbap segitiga jam 2 pagi.
#ConvenienceStore #PyeonUijeom #SeoulNights #KerjaPartTime
🤖 Kira is a virtual character · AI-generated image
```

### 12/11 · d06 · Seoul Lantern Festival
```
Seoul Lantern Festival opens today along Cheonggyecheon Stream 🏮
📅 Dec 11, 2026 – Jan 31, 2027 (as of Nov 3, 2026 — check the official page)
🇮🇩 Festival lampion Seoul mulai hari ini di Cheonggyecheon.
#SeoulLanternFestival #Cheonggyecheon #KoreaWinter #FestivalKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/12 · d11 · jjimjilbang
```
Jjimjilbang starter kit: towel hat, baked eggs, sikhye 🥚
Warmest place in Seoul in December.
🇮🇩 Jjimjilbang: topi handuk, telur panggang, sikhye. Hangat banget!
#Jjimjilbang #KoreanSauna #SeoulLife #BudayaKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/14 · t07 · helping tourists
```
Spotted: two lost travelers in Myeongdong, one map, lots of pointing 🗺️
Seoul is busier than ever with visitors this year — say hi if you see me!
🇮🇩 Bantu turis yang tersesat di Myeongdong. Seoul lagi ramai banget tahun ini.
#Myeongdong #VisitSeoul #SeoulTravel #LiburanKeKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/15 · d16 · hanok cafe
```
Hanok café, latte, Korean grammar that still beats me after all these years ☕📖
What's the hardest part of learning Korean for you?
🇮🇩 Belajar bahasa Korea di kafe hanok. Bagian tersulit menurut kalian?
#LearnKorean #Ikseondong #HanokCafe #BelajarBahasaKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/17 · d14 + d15 · modeling jobs
```
Part-time model mode: clips in the hair backstage → frozen fingers on a Seongsu street shoot 📸
🇮🇩 Kerja sampingan jadi model: backstage lalu pemotretan di Seongsu.
#Seongsu #SeoulFashion #ModelLife #KehidupanDiKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/18 · d13 · bank
```
Years in Seoul and the bank counter still wins every time 🏦😵
Tell me I'm not the only one.
🇮🇩 Udah lama di Seoul, tetap bingung di bank 😂
#ExpatLife #LifeInKorea #SeoulLife #KehidupanDiKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/20 · d23 · post office
```
Holiday box to Jakarta: taped, labeled, fingers crossed 📦
🇮🇩 Kirim paket ke Jakarta untuk keluarga. Semoga cepat sampai!
#PostOffice #ExpatLife #HomeForTheHolidays #KirimPaket
🤖 Kira is a virtual character · AI-generated image
```

### 12/21 · d21 · Bukhansan
```
Sunday reset on Bukhansan: frosty rocks, a hot thermos and the whole city below ⛰️
🇮🇩 Minggu pagi mendaki Bukhansan. Dingin tapi pemandangannya!
#Bukhansan #HikingKorea #SeoulNature #MendakiGunung
🤖 Kira is a virtual character · AI-generated image
```

### 12/22 · d19 + d20 · home flavors
```
Mi goreng × tteokbokki fusion in a tiny Seoul kitchen → then a video call to Jakarta 🇮🇩🇰🇷
Home is two places.
🇮🇩 Masak mi goreng campur tteokbokki, lalu video call sama keluarga di Jakarta.
#Indonesia #ExpatLife #FusionFood #MiGoreng
🤖 Kira is a virtual character · AI-generated image
```

### 12/23 · d17 · year-end pojangmacha
```
Year-end gathering at an orange-tent pojangmacha 🧡 tteokbokki, fishcake skewers, cheers to 2026!
🇮🇩 Kumpul akhir tahun di tenda pojangmacha. Cheers 2026!
#Pojangmacha #YearEndParty #SeoulNights #KulinerKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/24 · d18 · Myeongdong Christmas
```
Christmas Eve under the Myeongdong lights 🎄✨ Merry Christmas from Seoul!
🇮🇩 Malam Natal di Myeongdong. Selamat Natal dari Seoul!
#ChristmasInSeoul #Myeongdong #MerryChristmas #NatalDiKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/25 · d07 · Han River ramyeon
```
Christmas plan: steaming cup ramyeon on the Han River with my favorite person 🍜💛
🇮🇩 Natal di Sungai Han: ramyeon hangat bareng sahabat.
#HanRiver #HangangRamyeon #SeoulLife #SungaiHan
🤖 Kira is a virtual character · AI-generated image
```

### 12/26 · d12 · Gwangjang Market
```
Gwangjang Market, a sizzling griddle and bindaetteok straight off the pan 🥞
🇮🇩 Bindaetteok panas di Pasar Gwangjang.
#GwangjangMarket #Bindaetteok #KoreanStreetFood #PasarGwangjang
🤖 Kira is a virtual character · AI-generated image
```

### 12/27 · d01 · snow day
```
Snow day in Mangwon-dong ❄️ catching flakes like it's my first winter here.
🇮🇩 Salju turun di Mangwon-dong. Selalu senang kayak pertama kali!
#SeoulSnow #Mangwon #KoreaWinter #SaljuKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/28 · d22 · Gyeongbokgung in snow
```
Gyeongbokgung under fresh snow — the quietest Seoul gets ❄️🏯
🇮🇩 Istana Gyeongbokgung tertutup salju. Cantik banget.
#Gyeongbokgung #SeoulSnow #KoreaWinter #IstanaKorea
🤖 Kira is a virtual character · AI-generated image
```

### 12/29 · d09 · laundry day
```
Studio life: one drying rack, every sweater I own 🧺
🇮🇩 Hidup di studio kecil: satu jemuran, semua sweater.
#StudioApartment #LifeInKorea #SeoulLife #AnakKos
🤖 Kira is a virtual character · AI-generated image
```

### 12/31 · d24 · countdown
```
10, 9, 8… Happy New Year from Seoul! 🎆 See you in 2027.
🇮🇩 Selamat Tahun Baru dari Seoul! Sampai jumpa di 2027.
#HappyNewYear #Seoul2027 #NewYearsEve #TahunBaru
🤖 Kira is a virtual character · AI-generated image
```

## 3. 쓰레드 전용 글 TH1~TH6 (12:00 KST, 이번 승인 대상)

**TH1 · 11/24 월**
```
Seoul went from autumn to puffer-jacket season overnight 🧥
If you're flying to Korea this winter: what's the one thing you're scared you'll forget to pack?
```
**TH2 · 11/26 수**
```
Honest question for first-timers planning Korea:
what's confusing you most right now — visa, getting around, or what to eat?
I'll answer the most common one this week.
```
**TH3 · 11/28 금**
```
Korean phrase that works at every street stall:
이거 주세요 (igeo juseyo) = "this one, please." Point, smile, done 🙌
What phrase should I post next?
```
**TH4 · 12/01 월**
```
December in Korea is kimjang season — families and neighbors making a whole winter's kimchi together 🥬
Is there a food your family makes together once a year?
```
**TH5 · 12/03 수** (홍보 · 링크 클릭 가능)
```
[Ad] Kira and ktriphub are run by the same team.
🇮🇩 Flying to Korea in January on an Indonesian passport? A tourist visa at KVAC Jakarta takes about 10 working days (as of Nov 8, 2026), so apply soon.
Costs, documents and official links: https://ktriphub.com/id/visa/indonesia/?utm_source=threads&utm_medium=social&utm_campaign=kira_dec_2026&utm_content=th5_visa
```
- ⚠️ visa-indonesia-processing 재검증 기한 12-05 → 12/03 발행은 기한 안. 미뤄지면 재검증.

**TH6 · 12/05 금**
```
Bungeoppang debate 🐟
Head first or tail first? Choose wisely.
```

## 4. 쓰레드 UTM
`utm_source=threads&utm_medium=social&utm_campaign=kira_dec_2026&utm_content=<th번호 또는 게시물 코드>`
인스타 피드를 쓰레드에 같이 공유한 게시물은 링크가 캡션에 없으므로(“link in bio”) 별도 UTM 없음.

## 5. 이번 승인 후 바로 할 일
1. 11/24~12/06 일상 게시물 7개: 사진 → 4:5 음악 영상 → Business Suite 예약 (Threads에 공유 켬).
2. 쓰레드 전용 TH1~TH6 예약: Business Suite에서 Threads 단독 예약이 되는지 확인하고, 안 되면 threads.com 예약 기능을 쓴다.
3. 이미 예약된 R1·C1은 Threads 공유가 꺼져 있다 → 켤지 결정 필요 (아래 질문).
4. 홍보 C2(11/27)·R3(11/30) 소재 제작 → 별도 승인.
