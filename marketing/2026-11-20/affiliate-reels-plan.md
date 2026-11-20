# ktriphub 제휴 릴스 계획 (2026-11-20)

참고 영상: "뻔한 쇼핑쇼츠 그만하세요" (배워야산다, youtube.com/watch?v=u6qVx--l1Hg)

## 1. 영상 구조 요약
- 모델: 사진 1장 → AI 영상 → Coupang Travel / 여기어때 / 네이버 제휴 링크 → 24시간 쿠키 수수료.
- 파이프라인(화면에 나온 것): 잘 터진 릴스 URL + 쿠팡 숙소 URL 입력 → Claude Code가 레퍼런스 분석과 숙소 정보 수집 → 대본 7개·썸네일 문구 10개·제목 10개 → ElevenLabs TTS → Google Flow에서 사진을 영상으로(비/드론샷 프롬프트) → 자막 → 9:16 완성. 1편에 30분 정도, 하루 8편.
- 수익 화면 실제 수치: 합산(매출) ₩11,639,740 / **수익 ₩349,410** / 전환율 4.93%.
  → "하루 1천만원"은 구매 금액이고, 실제 수수료는 약 3%인 35만원입니다. 다른 금액(월 1,500만원, 계정당 2,200만원)은 인증 화면이 없습니다.
- 영상의 진짜 목적: 무료특강 → 단톡방 → 유료 강의·툴 판매 퍼널.

## 2. ktriphub에 맞게 바꿀 점
| 항목 | 영상 방식 | ktriphub 방식 |
|---|---|---|
| 시청자 | 국내 주부·국내여행 | 외국인 방한객, 영어 등 다국어 |
| 링크 | 쿠팡 (24h 쿠키, 무엇을 사도 수수료) | Klook(투어·티켓), Stay22(숙소). Trip.com은 `TRIP.pid`가 비어 있어 아직 수수료 없음 |
| 랜딩 | 제휴 링크 직행 | 바이오 링크 → ktriphub 페이지(facts 검증 정보 + 제휴 버튼) |
| 사진 | 쿠팡 상세 이미지 | 자체 촬영, 공공누리 등 라이선스 이미지, 이미 쓰는 dest/festival 이미지 |

## 3. 위험 요소
1. **실제 숙소를 AI로 바꾼 영상**: 비, 단풍, 드론샷처럼 실제 모습과 다른 장면은 오해를 부르는 광고가 될 수 있습니다. 실제 시설에 없는 요소는 넣지 않고, "AI-generated" 표시를 합니다.
2. **이미지 권리**: 쿠팡 상담원 답변은 법적 허가가 아닙니다. 사진 권리는 보통 숙소나 사진가에게 있습니다. Klook과 Trip.com 상품 사진을 SNS 영상에 재가공해도 되는지는 공식 약관에서 확인하지 못했으므로 쓰기 전에 각 제휴 담당자에게 확인합니다.
3. **광고 표시**: #ad / "affiliate links" 문구를 첫 줄에 넣고, 인스타그램 유료 파트너십 라벨이나 AI 라벨도 정책에 맞게 붙입니다.
4. **수치**: 가격, 시간, 날짜는 facts.json에 VERIFIED로 있는 것만 씁니다. VOLATILE 정보에는 "as of" 날짜를 붙입니다.

## 4. 샘플 게시물 (EN, 겨울 시즌 · facts 검증 날짜만 사용)

### A. Seoul Lantern Festival — Klook + Stay22
- 훅(0–2초): "Seoul's stream turns into a river of lanterns this winter 🏮"
- 장면: Cheonggyecheon 등불(자체·라이선스 사진) → 지도 핀 → "Stay nearby" 카드
- 캡션:
```
#ad — contains affiliate links (no extra cost to you).
Seoul Lantern Festival 🏮 Cheonggyecheon Stream, central Seoul
📅 Dec 11, 2026 – Jan 31, 2027 (organizer schedule, provisional — as of Nov 3, 2026)
✅ Check final dates/hours: stolantern.com
🎟️ Tours + 🏨 hotels near the stream → link in bio (ktriphub.com/en/festivals/)
Save this for your winter trip ✨
#SeoulLanternFestival #KoreaWinter #VisitSeoul #KoreaTravel
```

### B. Hwacheon Sancheoneo Ice Festival — Klook
- 훅: "Ice fishing on a frozen river in Korea? Yes, really 🎣❄️"
- 캡션:
```
#ad — affiliate links inside.
Hwacheon Sancheoneo Ice Festival, Gangwon-do
📅 Jan 9 – 31, 2027 (provisional — as of Nov 3, 2026; confirm at narafestival.com)
⚠️ Ice/weather can cancel programs, so check before you go.
🚌 Day tours from Seoul → link in bio
#HwacheonIceFestival #KoreaWinter #IceFishing
```

### C. Garden of Morning Calm Lighting — Klook + Stay22 (Gapyeong)
- 훅: "This garden near Seoul glows every winter night ✨"
- 캡션:
```
#ad — affiliate links inside.
Garden of Morning Calm Lighting Festival, Gapyeong
📅 Dec 4, 2026 – Mar 14, 2027 (projected — as of Nov 3, 2026; confirm at morningcalm.co.kr)
🌧️ No lighting in rain/snow.
🎟️ Tickets/tours + 🏨 Gapyeong stays → link in bio
#GardenOfMorningCalm #Gapyeong #KoreaWinter
```

## 5. 다음 단계 (결정 필요)
- [ ] Trip.com 제휴 승인 여부와 PID 확인 (지금은 수수료 없음)
- [ ] Klook과 Stay22에 "상품/숙소 이미지 + AI 영상화 + SNS 사용" 허용 여부 문의
- [ ] 반자동 파이프라인: festivals.json/facts.json → 대본·캡션 생성 → 이미지·TTS → 사람 검수 → 예약 게시
