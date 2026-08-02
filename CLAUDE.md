# CLAUDE.md — Korea Trip Hub에서 일하는 Claude를 위한 지침

이 저장소는 외국인 방한객용 **다국어 여행 허브**다. Next.js 14 App Router + 정적 export + 경량 자체 i18n(기본 en, 20개 언어).
너는 이 사이트의 개발자이자 콘텐츠 작성자다. 아래 규칙을 **모든 작업에서 자동으로** 따른다.

## 언어
- 사용자와의 대화는 **항상 한국어**로 한다. (일본어·영어 혼용 금지)
- 사이트 콘텐츠의 기본 언어는 영어(en)이고, 나머지는 번역이다.

## 작업 전 반드시 로드할 것 (순서대로)
1. `HARNESS.md` — ★사실검증 하네스 (할루시네이션 방지). 작업 방식의 최상위 규칙.
2. `data/facts.json` — ★사실 대장(SSOT). 모든 수치·연락처·규정의 단일 기준점.
3. 작업할 카테고리의 `data/*.json`.

## 절대 규칙 (요약 — 상세는 HARNESS.md)
- **facts가 왕이다.** `data/facts.json`에 VERIFIED로 없는 사실 수치(가격·전화·주소·시간·규정·통계)는 본문에 쓰지 않는다.
- **모르면 지어내지 않는다.** TODO로 남기거나 `{{FACT:id}}` 플레이스홀더를 쓰고, 그 문장은 검증 전엔 뺀다.
  "약 5만원", "보통 20분" 같은 **임의 근사치 금지.**
- 모든 fact에는 `source`(공식 우선)와 `verified`(검증일)가 있어야 한다.
- **VOLATILE 정보(비자·요금·환율·운영시간·공연일정)** 는 공식 출처 링크 + "as of DATE"를 함께 노출한다.
- facts와 본문이 다르면 임의로 고치지 말고 **멈춰서 사람에게 확인**한다.

## 콘텐츠 루프 (요약 — 상세는 HARNESS.md §3)
로드 → 초안(수치 자리는 {{FACT:id}}) → 각 fact 웹 검증 → facts.json 갱신 → §4 체크리스트 → 커밋

## 작업 후 반드시
- HARNESS.md §4 체크리스트를 스스로 통과시킨다.
- 새 fact가 생겼으면 `data/facts.json`에 source+verified와 함께 추가한다. (없으면 "facts 갱신 없음"이라고 명시)
- 중간중간 GitHub에 push 한다. (컨테이너/로컬 소실 대비)

## 구조 (kpophub/web 패턴 재활용)
- `app/[locale]/…` 라우팅, `lib/i18n.js`(locales·defaultLocale·getMessages), `messages/*.json`(UI 문자열)
- `data/*.json` 콘텐츠, `data/facts.json` 사실 SSOT
- `next.config.mjs`: `output:"export"`, `trailingSlash:true`, `images.unoptimized`
- 배포: Cloudflare (정적) — kpophub 방식 준용

## 연동(3단계 — API 키 필요, 미확정은 stub)
- 지도: Naver/Kakao (키 필요) · SNS 공유 · Spotify 임베드 · K-pop 콘서트 → kpophub.kr 링크
