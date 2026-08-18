# Korea Trip Hub — 감사 개선 실행 계획

- 기준 감사: [AUDIT_REPORT_KO.md](./AUDIT_REPORT_KO.md) (2026-08-18)
- 계획 작성: 2026-08-18
- 대조 기준: 현재 작업 저장소 `C:\Users\minho\Projects\korea-trip-hub` (HEAD `da1ab9f`)
- 참고: 감사는 G드라이브 사본에서 실행됨. 작업 저장소는 최근 K-pop 커밋 3건이 더 있으나 **감사 결론은 그대로 유효**.

---

## 0. 진행 현황

- **2026-08-18 · Phase 0 정직성 배치 완료 · 배포 (커밋 `c716647`)**
  - ✅ "20 languages" → "10" 전면(태그라인 20개 파일 + 홈 트러스트바) · ✅ 전 활성 로케일(10개)에서 "AI" 주장 제거(플래너 명칭·hero 배지·meta 설명) · ✅ 트러스트바 "Route-optimized" → "Day-by-day draft" · ✅ 영어 hero 카피에서 "fastest/route/from your door" 제거 · ✅ "AI Planner" → "Trip Planner"(nav·footer·itinerary)
  - ✅ 공유 버튼 실구현(Web Share API + WhatsApp/LINE/X 인텐트 + 복사; 카카오는 SDK 필요라 네이티브 공유로 대체)
  - ✅ 언어 전환 시 현재 경로·쿼리·해시 보존
  - ✅ AdSense 로더 일시 중단(GA 유지) · ✅ `--faint` 대비 ≥4.5:1(light `#646C7C`/dark `#868FA3`) · ✅ `facts.json _updated` → 2026-08-05
- **2026-08-18 · 이월분 완료 · 배포 (커밋 `e53f328`)**
  - ✅ 9개 비영어 로케일(zh·zh-TW·ja·vi·th·id·es·ms·ko) hero `title_1`·`lede` 정직화 — "pin/mark"→"enter/add", "fastest route"→"transport options", "호텔에서 출발" 표현 제거, "route"→"day-by-day plan". 고유명사(KTX·Busan)·각 언어 어투 보존, 검증 PASS. → **P0-3 정직성 전 로케일 완료.**
- **2026-08-18 · Phase 1 (WS3 개인정보·동의) 완료 · 배포 (커밋 `031efaf` + `ba2638a`)**
  - ✅ 법적·신뢰 페이지 6종(About·Editorial·Privacy&Cookies·Terms·Affiliate·Contact) × **10개 언어 = 60페이지**. 내용은 실제 관행 반영(GA4·Agoda/Klook·Cloudflare·계정없음·Google Forms). 운영자=Korea Trip Hub, 연락처=contact@ktriphub.com(mailto). canonical·hreflang·JSON-LD 정상.
  - ✅ **Google Consent Mode v2**: GA4 기본 denied → 자체 배너 동의 시에만 활성(외부 CMP 없음), 선택 저장. 배너 문구 10개 언어.
  - ✅ **사이트 공통 슬림 푸터**(SiteFooter): 법적 링크+제휴고지+© 전 페이지 노출.
  - ✅ 9개 언어 법적 본문 번역(병렬 에이전트, 구조·숫자·이메일·고유명사 보존, verify-content-i18n 9/9). 850→910페이지.
  - **남은 것(WS3 잔여):** contact@ktriphub.com 실제 메일 라우팅(🟥 Cloudflare Email Routing, 당신) · AdSense 재개는 이후 실슬롯+ad_storage 동의와 함께.
- **🟥 당신 대기:** Cloudflare HTTPS·www→apex 301(WS2, P0 최우선) — 대시보드에서. 착수 시 단계별 클릭 가이드 제공.

---

## 1. 대조 결과 — 감사 지적사항, 지금도 유효한가?

오늘 작업 저장소에서 직접 확인한 결과, 핵심 지적은 **전부 현재 코드에 존재**한다.

| 항목 | 감사 | 현재 코드 확인 | 상태 |
|---|---|---|---|
| "20개 언어" 과장 | P0-3 | `page.jsx:165`, `en.json` tagline + 메시지 4파일 · 실제 `locales`=**10개** | ✅ 유효 |
| 한 페이지 내 10 vs 20 모순 | P0-3 | `HeroSlider.jsx:79` "10 languages" | ✅ 유효 |
| "AI Planner"·"Route-optimized" | P0-3 | `page.jsx:163`, `en.json:9` — 실제는 규칙 기반 | ✅ 유효 |
| 공유 버튼 死(카톡·WA·LINE) | P0-3 | `TripPlanner.jsx:236-238` onClick 없음, 240 복사만 동작 | ✅ 유효 |
| HTTPS·www 정규화 없음 | P0-1 | `_redirects`=루트 302뿐, `_headers`=보안헤더 2개 | ✅ 유효(대시보드 사안) |
| 동의·개인정보 체계 없음 | P0-2 | 법적 페이지 **0개**, `layout.jsx` GA/Ads 무조건 로드 | ✅ 유효 |
| 광고 슬롯 없음 | P0-2 | `adsbygoogle` 로더만, `<ins>` 슬롯 0 → 비용만 지불 | ✅ 유효 |
| 언어 전환 시 경로 유실 | P1 | `Header.jsx` `location.assign(/${code}/)` | ✅ 유효 |

**결론:** 감사는 신뢰할 수 있고 즉시 착수 가치가 있다. 이미 해결된 항목은 없다.

---

## 2. 누가 하나 — 작업 주체 3분류

개선을 "정리"하는 핵심은 **주체별로 분리**하는 것이다. 셋을 섞으면 병목이 생긴다.

- 🟥 **사용자 직접 (코드 아님)** — 내가 대신 못 함
  - Cloudflare 대시보드: Always Use HTTPS · www→apex 301 · HSTS
  - Google Search Console · Bing 등록 · 사이트맵 제출
  - CMP(동의관리) 계정 개설 · 원어민 검수자 섭외
- 🟦 **결정 필요 (작지만 방향을 가름)**
  - 광고를 **유지**(→ 동의·법적페이지·실제 슬롯 필요) vs **잠시 중단**(로더 제거)
  - "AI Planner"/"Route-optimized"를 **정직하게 정정** vs **실제 기능 구현**(Anthropic 키·거리계산)
  - CMP 벤더 선택(Google 인증 목록 중)
- 🟩 **Claude 코드로 즉시** — 승인만 주면 진행
  - 정직성 문구, 공유 버튼, 언어전환 경로 보존, 접근성, 성능, CI, 법적 페이지 초안 작성 등

---

## 3. 워크스트림 (감사 15개 항목 재그룹)

### WS1 · 신뢰·정직성 🟩🟦 — 저비용·고효과
| 할 일 | 근거 | 주체 | 규모 |
|---|---|---|---|
| "20 languages"→"10", HeroSlider/홈 수치 통일 | P0-3 | 🟩 | 30분 |
| "AI Planner"→"일정 초안 도우미", "Route-optimized" 등 미구현 표현 정정 | P0-3 | 🟦→🟩 | 1시간 |
| 죽은 공유 버튼: Web Share API + 실제 카톡/WA/LINE/X 공유 URL 구현(또는 제거) | P0-3 | 🟩 | 1~2시간 |

### WS2 · 보안·URL 정규화 🟥 — P0 최우선(코드 아님)
| 할 일 | 근거 | 주체 |
|---|---|---|
| Always Use HTTPS 켜기 | P0-1 | 🟥 대시보드 |
| www→apex 301(경로·쿼리 보존, Redirect Rules) | P0-1 | 🟥 대시보드 |
| 전체 HTTPS 확인 후 HSTS 단계 적용 | P0-1 | 🟥 |
| 배포 후 http/www/슬래시 스모크 테스트 추가 | P0-1 | 🟩 |

> `_redirects`로는 호스트 리다이렉트 불가(Cloudflare Redirect Rules 필요). 정확한 클릭 순서는 착수 시 단계별로 제공.

### WS3 · 개인정보·동의 🟦🟩 — P0, 규모 큼
| 할 일 | 근거 | 주체 | 규모 |
|---|---|---|---|
| **결정:** 광고 유지 vs 중단 | P0-2 | 🟦 | — |
| 법적·신뢰 페이지 ×10언어: Privacy·Cookie·Terms·Affiliate고지·About·Contact·Editorial | P0-2/P2 | 🟩 | 큼(사실안전·번역) |
| Consent Mode 기본 denied + Google 인증 CMP | P0-2 | 🟦+🟩 | 중 |
| 광고 승인·슬롯 없으면 AdSense 로더 일단 제거 | P0-2 | 🟩 | 5분 |

### WS4 · 번역 완전성 🟩🟥 — P1
| 할 일 | 근거 | 주체 |
|---|---|---|
| 언어 전환 시 현재 경로·해시 보존 | P1 | 🟩 30분 (쉬운 승리) |
| 검증기 강화: EN 모든 leaf가 override에 존재 + 빈값·EN동일·JSX하드코딩 CI 검사 | P1 | 🟩 |
| JSX 하드코딩 문자열을 메시지 사전으로 이전 | P1 | 🟩 중 |
| README·SEO·TRANSLATION 문서의 "20개 언어" 정리 | P1 | 🟩 |
| ja·zh·zh-TW 우선 원어민 검수 | P1 | 🟥 |

### WS5 · 모바일·접근성 🟩 — P1
모바일 햄버거/드로어 · `<main>`+skip link+단일 H1 · 슬라이더 정지/키보드/tab semantics · 동적결과 `aria-live` · `--faint` 대비 4.5:1 · 이미지 12곳 width/height(CLS) · axe CI. (전부 🟩)

### WS6 · 성능 🟩🟥 — P1
Header에 locale nav만 props 전달(번들↓) · 폴드 아래 위젯(Map/Spotify/Reviews/Weather) 지연로드 · WebP/AVIF+srcset(이미지 100~200KB 예산) · 영상 poster/데이터절약 · CWV 측정(PSI/CrUX 🟥).

### WS7 · CI·운영 🟩 — P1
GitHub Actions: clean install→build→검증기 3종→host 스모크→axe · fact `recheck_after` 만료 시 빌드 실패 · Dependabot/Renovate · `facts.json _updated` 실제 검증일과 동기화.

### WS8 · SEO 신뢰신호 🟥🟩 — P2
Search Console·Bing 등록+사이트맵 제출(🟥) · About/작성자/검수정책/연락처(WS3와 중복) · Article JSON-LD에 author+조직 logo(🟩) · lastmod를 실제 검수일 기준으로(🟩).

---

## 4. 단계별 실행 순서 (감사 30/60/90 정렬)

### Phase 0 · 이번 주 — 블로커 해제 + 무해한 정직성 (즉시)
- 🟥 **당신:** Cloudflare HTTPS + www→apex 301 (WS2) ← **1순위, 코드 아님**
- 🟩 **Claude:** WS1 문구 정정(10언어·플래너·공유버튼) + 언어전환 경로 보존(WS4) + `_updated` 동기화 + 이미지 width/height·대비(WS5 일부) + AdSense 로더 처리
- 🟦 **결정:** 광고 유지/중단 · 플래너 네이밍

### Phase 1 · 30일 — 신뢰 기반
법적·신뢰 페이지 ×10 + Consent Mode + CMP(WS3) · 모바일 내비+접근성 핵심(WS5) · CI+fact 만료 게이트(WS7) · Search Console/Bing(WS8 🟥).

### Phase 2 · 60일 — 번역·성능·품질
번역 완전성 검증기 + JSX 추출 + 원어민 검수(WS4) · 성능 최적화(WS6) · 작성자/검수 신뢰신호+JSON-LD(WS8).

### Phase 3 · 90일 — 마케팅 확대
감사 30/60/90 계획대로: 이벤트 측정 체계 · 1차 시장(zh·ja·zh-TW) 현지화 콘텐츠 · 소액 유료 테스트 · planner→affiliate 퍼널·EPC 기준 성과 판단.

---

## 5. 결정 필요 (forks) — 추천 포함

1. **광고 (AdSense)** — 지금 슬롯 0·승인 대기. **추천: Phase 0에 로더 일단 제거(또는 동의 뒤로 게이트)**, WS3(법적페이지+CMP) 완성 후 실제 슬롯과 함께 재도입. 이유: 지금은 개인정보·성능 비용만 지불하고 광고 수익 0.
2. **"AI Planner"/"Route-optimized"** — **추천: 지금은 정직하게 정정**("규칙 기반 일정 초안"). 실제 AI/거리계산은 Anthropic 키·좌표 데이터가 준비되면 Phase 2+에서 기능으로 구현.
3. **CMP 벤더** — Google 인증 목록(예: Cookiebot, iubenda 등) 중 다국어·무료티어 기준으로 Phase 1에 선택.

---

## 6. 지금 바로 착수 가능한 Quick Wins (Claude, 반나절 · 저위험)

승인 주시면 Phase 0의 🟩 항목을 한 커밋 묶음으로 처리 가능:
1. "20 languages"→"10 languages" 전 파일 통일 + HeroSlider/홈 모순 제거
2. 플래너 문구 정직화("AI Planner"→중립 명칭, 미구현 표현 제거)
3. 공유 버튼 실제 구현(Web Share API + 카톡/WA/LINE/X 공유 URL)
4. 언어 전환 시 현재 경로 유지
5. `facts.json _updated` 동기화
6. 콘텐츠 이미지 width/height 지정(CLS) + `--faint` 대비 상향
7. (결정 시) AdSense 로더 제거

→ 나머지 🟥/🟦는 병렬로: 당신은 Cloudflare HTTPS/www만 처리하면 P0의 절반이 즉시 해소.
