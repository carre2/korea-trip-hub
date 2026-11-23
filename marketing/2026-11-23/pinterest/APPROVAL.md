# Pinterest 핀 10개 — 승인 요청 (2026-11-23)

계정: **korea_trip_hub** (Pinterest 비즈니스, 현재 로그인 확인) · 보드: 기존 **Korea Travel Planning** (핀 36개, 월 조회 4,280)
방식: 승인 후 Pinterest 자체 예약만 (기본 예약 한도 10개). 게시 후 핀 URL을 `publishing-status.csv`에 기록.

## 제재 방지 (Pinterest)
- **하루 1개**(21:00 KST), 한 달 쉬었던 계정이라 10월(하루 2개)보다 천천히 다시 시작한다.
- 핀마다 **이미지·링크 페이지가 모두 다르다**(같은 URL 반복 금지). 링크는 모두 ktriphub.com 실제 페이지(HTTP 200 확인 후 예약).
- 이미지는 **실제 사이트 화면 + 디자인 카드**(AI 이미지 없음) → AI 라벨 불필요. Kira 이미지는 Pinterest에 쓰지 않는다(브랜드 계정과 가상인물 분리).
- 제휴 링크 없음. 설명에 키워드를 억지로 나열하지 않고 문장으로 쓴다. 해시태그 안 씀.
- 수치는 `data/facts.json` VERIFIED 값만, 날짜가 바뀌는 정보는 이미지와 설명에 "as of"를 넣었다.

UTM 공통: `utm_source=pinterest&utm_medium=pin&utm_campaign=ktriphub_pin_202611&utm_content=<pXX>`

| 예약 (21:00 KST) | 핀 | 제목 | 링크 |
|---|---|---|---|
| 11/24 화 | p01 | Korea Winter Festivals 2026–27: Seoul Lantern, Morning Calm Lights, Hwacheon Ice | `/en/festivals/` |
| 11/25 수 | p02 | Korea in Winter: What to Expect, Pack and Do | `/en/guides/winter-in-korea/` |
| 11/26 목 | p03 | Visa Turis Korea untuk Paspor Indonesia 2026: Biaya, Lama Proses, Cara Bayar | `/id/visa/indonesia/` |
| 11/27 금 | p05 | Incheon Airport to Seoul: 3 Ways Into the City | `/en/plan/airport/` |
| 11/28 토 | p08 | Korea Travel Report: Type Any Place, Get Map, Food, Stays and Sights | `/en/report/` |
| 11/29 일 | p06 | Korea SIM Card, eSIM or Pocket Wi-Fi? Day 1 Guide | `/en/plan/sim/` |
| 11/30 월 | p04 | K-ETA Waiver Ends Dec 31, 2026: Check Your Passport Before 2027 Trips | `/en/plan/visa/` |
| 12/01 화 | p07 | T-money Card: Getting Around Seoul by Subway and Bus | `/en/plan/transit/` |
| 12/02 수 | p09 | K-Beauty Shopping in Seoul: A First-Timer's Guide | `/en/guides/k-beauty-shopping/` |
| 12/03 목 | p10 | Korea Etiquette for Visitors: Do's and Don'ts | `/en/guides/korea-etiquette/` |

## 핀 설명 (Pinterest 설명란)
- **p01** Planning a winter trip to Korea? Seoul Lantern Festival runs Dec 11, 2026 – Jan 31, 2027 along Cheonggyecheon Stream; the Garden of Morning Calm lighting festival in Gapyeong runs Dec 4, 2026 – Mar 14, 2027; Hwacheon Sancheoneo Ice Festival runs Jan 9–31, 2027. Organizer dates checked Nov 3–16, 2026 — confirm on each official page before you go. More festivals with maps and official links on ktriphub.
- **p02** What is Korea like in winter? Cold, dry and often sunny days, snow and ski spots, hot springs and light festivals. This free guide covers what to pack and where to go, in your language.
- **p03** Panduan visa turis Korea untuk paspor Indonesia: mulai 1 Juli 2026 single entry IDR 920.000 (IDR 680.000 + biaya KVAC IDR 240.000), multiple entry IDR 1.770.000. Estimasi proses KVAC Jakarta 10 hari kerja (single/double) dan 7 hari kerja (multiple). Pembayaran non-tunai: transfer, kartu debit, QRIS. Per 16 Nov 2026 — selalu cek situs resmi KVAC Jakarta.
- **p04** The temporary K-ETA waiver covers designated countries and regions only, through Dec 31, 2026. Visa-free entry is not the same as K-ETA exemption, and if your passport needs a visa, K-ETA does not replace it. As of Nov 16, 2026 — check the official notice at k-eta.go.kr.
- **p05** Just landed at Incheon? AREX Express runs non-stop to Seoul Station in about 43 minutes from Terminal 1 and 51 from Terminal 2. Airport buses take about 60–90 minutes depending on route and traffic. Taxi tips and more in the airport guide.
- **p06** Staying connected on day one in Korea: an eSIM can be installed before you fly, a physical SIM needs an unlocked phone, and pocket Wi-Fi works well for groups. Carriers are SKT, KT and LG U+. Compare the options in the guide.
- **p07** T-money is the rechargeable card for Korea's subways and buses. Buy and top it up at CU, GS25, 7-Eleven and Emart24 convenience stores or at subway station machines. Full getting-around guide on ktriphub.
- **p08** Type any place in Korea — a city, district, market or festival — and get a free mini travel report with a map, nearby food, stays and sights. Built from Korea Tourism Organization (TourAPI) data with the source on every card.
- **p09** Where to shop for Korean skincare and makeup in Seoul, and how tax refunds work for visitors — a first-timer's K-beauty shopping guide.
- **p10** Shoes off at home, using two hands, dining and public-transport manners: the Korean etiquette basics that help first-time visitors fit in.

## 파일
- 이미지: `pinterest/png/p01.png ~ p10.png` (1000×1500) · 원본 HTML `pinterest/html/` · 생성 `make_pins.mjs` · 화면 캡처 `shots/`, `crops/`
