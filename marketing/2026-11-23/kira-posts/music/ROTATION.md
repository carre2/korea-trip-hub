# Kira 게시물 음원 로테이션 (2026-11-23)

모두 `marketing/tools/python/lofi_synth.py`로 직접 합성한 오리지널 곡 (샘플·라이선스 없음, 고정 시드라 재생성해도 같은 곡).
라이브러리 파일은 30초 · loudnorm -16 LUFS. 영상에 넣을 땐 영상 길이로 자르고 끝 1초 페이드.

| ID | 파일 | 키 · BPM | 특징 |
|---|---|---|---|
| A | cheerful_a_uke_120.m4a | D장조 · 120 | 우쿨렐레 + 플럭 멜로디, 통통 튀는 베이스 |
| B | cheerful_b_uke_116.m4a | D장조 · 116 | A와 같은 악기, 코드 순서 IV–I–V–vi |
| C | cheerful_c_marimba_124.m4a | E장조 · 124 | 마림바 멜로디, I–vi–IV–V |
| D | cheerful_d_whistle_104.m4a | C장조 · 104 | 휘파람 멜로디, 워킹 베이스, 스윙 |
| E | cheerful_e_chip_128.m4a | F장조 · 128 | 부드러운 8비트 리드, 오프비트 베이스(댄스팝) |
| F | cheerful_f_marimba_swing_112.m4a | B장조 · 112 | 마림바 + 살짝 스윙, 워킹 베이스 |

재생성: `python lofi_synth.py <out.wav> <초> <bpm> cheerful-<a~f>`

## 사용 기록 / 다음 배정
같은 곡이 연속으로 나오지 않게 A→B→C→D→E→F 순서로 돌리고, 같은 주에 같은 곡은 최대 2번.

| 게시물 | 예약일 | 곡 |
|---|---|---|
| R1 ktriphub 소개 | 11/23 21:00 | A (r1_cheerful.wav, 원본 18초 버전) |
| C1 인니 비자 슬라이드 | 11/25 21:00 | B (c1_cheerful.wav, 원본 18초 버전) |
| 다음 게시물 (R2) | 미정 | C |
| 그다음 | 미정 | D → E → F → A … |
