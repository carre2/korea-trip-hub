# Korea Trip Hub 저장소·운영 사이트 감사 보고서

- 감사일: 2026-08-18
- 범위: 운영 상태, UX·디자인·접근성, 기술·국제 SEO, 다국어·번역, 성능, 분석·마케팅, 보안·개인정보 기초
- 방식: 저장소 정적 분석, 제공된 검증기 실행, 공개 운영 사이트의 HTTP·HTML·robots·sitemap 표본 점검
- 제약: 소스 수정, 의존성 설치, 배포, 외부 연락, 커밋 없이 읽기 전용으로 감사

## 요약

Korea Trip Hub는 실제 운영 중이다. `https://ktriphub.com/`은 `/en/`으로 이동하고, 영어 홈은 Cloudflare에서 정상 응답한다. 코드와 라이브 표본에서 self-canonical, 10개 언어 hreflang과 `x-default`, robots, sitemap, Open Graph, Twitter 카드, JSON-LD가 정상 확인됐다. 사실·번역·SEO 오류를 빌드 단계에서 차단하려는 하네스도 이 저장소의 뚜렷한 강점이다.

다만 현재 상태를 전반적으로 안정적이라고 평가하기는 어렵다. 가장 먼저 해결할 문제는 다음 세 가지다.

1. HTTP와 `www` 호스트가 canonical 호스트로 영구 리다이렉트되지 않는다.
2. 개인정보·동의 체계 없이 GA4와 AdSense가 모든 페이지에서 실행된다.
3. “AI”, “경로 최적화”, “공유”, “20개 언어”라는 제품 약속이 실제 기능·언어 수와 일치하지 않는다.

## 우선순위별 개선 사항

### P0 · 높음 — HTTPS 및 호스트 정규화 부재

라이브 확인 결과 다음 URL이 canonical인 `https://ktriphub.com/`으로 영구 이동하지 않고 직접 콘텐츠를 제공한다.

- `http://ktriphub.com/en/` → `200 OK`
- `https://www.ktriphub.com/en/` → `200 OK`

코드상 [public/_redirects](./public/_redirects)는 루트에서 `/en/`으로 보내는 302 규칙만 가진다. [DEPLOY.md](./DEPLOY.md)는 `www`를 apex 도메인으로 리다이렉트할 것을 권장하지만 실제 라이브 설정에는 반영되지 않았다. 응답 헤더에 HSTS도 없다.

영향:

- HTTP 방문자가 암호화되지 않은 콘텐츠를 받는다.
- 백링크, 크롤링, GA 세션 신호가 HTTP·HTTPS 및 apex·www로 나뉜다.
- canonical이 피해를 일부 완화하지만 보안과 URL 신호 통합을 대신할 수 없다.

권장 조치:

1. Cloudflare에서 `Always Use HTTPS`를 활성화한다.
2. 모든 `www` 요청을 경로와 쿼리를 보존해 `https://ktriphub.com`으로 301 또는 308 이동시킨다.
3. 전체 HTTPS 동작을 확인한 뒤 HSTS를 단계적으로 적용한다.
4. HTTP·www·슬래시 조합을 배포 후 자동 스모크 테스트에 넣는다.

### P0 · 높음 — 개인정보 및 동의 체계 부재

[app/[locale]/layout.jsx](./app/%5Blocale%5D/layout.jsx)는 AdSense와 GA4를 모든 로케일 페이지에서 무조건 `afterInteractive`로 로드한다. 저장소에는 Privacy, Cookie, Terms, About, Contact 또는 동의 관리 페이지가 없다. [public/_headers](./public/_headers)의 보안 헤더도 `X-Content-Type-Options`와 `Referrer-Policy`만 설정한다.

추가로 실제 AdSense 광고 슬롯은 코드에서 발견되지 않았다. 현재는 광고 로더의 개인정보·성능 비용을 지불하면서 화면에는 광고를 표시하지 않는 상태일 가능성이 높다.

영향:

- 국제 방문자의 개인정보 신뢰와 규정 준수 위험이 있다.
- EEA·영국·스위스 방문자 대상 개인화 광고가 제한될 수 있다.
- 사용자가 선택하기 전에 분석·광고 태그가 실행된다.

권장 조치:

1. 다국어 Privacy, Cookie, Terms, Affiliate Disclosure, About, Contact, Editorial Policy를 제공한다.
2. Google 인증 CMP 또는 지역 법규에 맞는 동의 솔루션을 도입한다.
3. 기본값을 `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization = denied`로 설정하고 동의 전 태그를 차단한다.
4. 광고 승인 또는 실제 슬롯이 없다면 AdSense 로더를 제거한다.

참고:

- [Google AdSense CMP 요구사항](https://support.google.com/adsense/answer/13554020?hl=en-GB)
- [Google Consent Mode 안내](https://support.google.com/analytics/answer/10000067?hl=en)

### P0 · 높음 — 제품 약속과 실제 기능의 불일치

[app/[locale]/page.jsx](./app/%5Blocale%5D/page.jsx)는 “Route-optimized”, “Share to KakaoTalk, WhatsApp, LINE”, “20 languages”라고 표시한다. [messages/en.json](./messages/en.json)의 footer 문구도 20개 언어라고 주장한다. 하지만 실제 활성 로케일은 [lib/i18n.js](./lib/i18n.js)의 10개뿐이다. 반면 [components/HeroSlider.jsx](./components/HeroSlider.jsx)는 “10 languages”라고 표시해 한 페이지 안에서도 수치가 충돌한다.

플래너 구현도 사용자 약속과 다르다.

- [components/TripPlanner.jsx](./components/TripPlanner.jsx)의 `generate()`는 도시별 배열을 순환하고 최대 세 장소를 선택하는 규칙 기반 로직이다.
- 호텔 입력은 거리나 경로 계산에 사용되지 않고 결과 라벨에만 표시된다.
- 여행자 수는 일정 결과에 영향을 주지 않는다.
- KakaoTalk, WhatsApp, LINE, X 공유 버튼에는 동작이 없으며 링크 복사 버튼만 구현되어 있다.

영향:

- 방문자 신뢰와 재방문 가능성이 낮아진다.
- 검색·광고에서 유입된 사용자의 기대와 실제 경험이 불일치한다.
- 제휴 전환과 브랜드 신뢰에 직접적인 악영향을 준다.

권장 조치:

1. 즉시 “규칙 기반 일정 초안”과 “10개 언어”로 표현을 정정한다.
2. 동작하지 않는 공유 버튼은 제거하거나 실제 공유 URL·Web Share API로 구현한다.
3. 호텔 좌표, 실제 거리, 이동시간, 영업일을 계산하기 전에는 “pin”, “fastest”, “route-optimized” 표현을 사용하지 않는다.
4. AI 기능을 실제로 제공하지 않는다면 “AI Planner” 명칭을 제거한다.

### P1 · 높음 — 번역 검증의 완전성 맹점

실행 결과:

- `node scripts/verify-i18n.mjs` → PASS
  - 기준 영어 173개 키
  - 33개 fact
  - 활성 9개 대상 로케일 오류 0
- `node scripts/verify-content-i18n.mjs` → PASS
  - 17개 콘텐츠 계열 모두 9/9 파일 존재
  - 사실 토큰 오류 0
  - 순위·서수 재표현 경고 18건

그러나 이 PASS는 완역을 의미하지 않는다. [scripts/verify-content-i18n.mjs](./scripts/verify-content-i18n.mjs)는 override에 존재하는 키만 순회하고, 파일이나 로케일 객체가 존재하면 coverage에 포함한다. 빠진 키는 [lib/visa.js](./lib/visa.js)의 deep merge에 의해 영어 base로 폴백된다.

라이브 일본어 비자 페이지 `/ja/visa/japan/`에서도 다음 영어 문구가 남아 있었다.

- `Official channels`
- `Confirm the current rules before you travel`
- 공식 링크 설명 일부

JSX 하드코딩도 많다. 홈의 trust bar·딜·지도·도움말·footer와 여러 `*Guide.jsx`의 `Official sources`, 플래너의 스타일·기간·인원 문자열이 메시지 사전을 거치지 않는다.

추가 문제:

- 언어 선택 시 현재 상세 경로를 보존하지 않고 해당 언어 홈으로 이동한다. 근거: [components/Header.jsx](./components/Header.jsx)의 `window.location.assign(\`/${code}/\`)`.
- 메시지 파일은 20개지만 활성 언어는 10개다. 비활성 파일은 `ar`, `bn`, `de`, `fil`, `fr`, `hi`, `it`, `pt`, `ru`, `tr`이다.
- README, SEO, TRANSLATION 문서에는 아직 20개 언어 설명이 남아 있다.
- 현재 활성 RTL 언어는 없으므로 `rtlLocales=[]`는 맞다. Arabic을 다시 활성화할 경우 RTL 레이아웃과 시각 QA가 필요하다.

권장 조치:

1. 영어 base의 모든 번역 가능 leaf가 locale override에 존재하는지 검증한다.
2. 빈 문자열, 영어 동일률, JSX의 사용자 노출 영어 문자열을 CI에서 검사한다.
3. 언어 변경 시 현재 pathname과 hash를 동일한 로케일 경로로 보존한다.
4. 일본어·간체중문·번체중문을 우선 원어민 검수한 뒤 베트남어·태국어·인도네시아어·말레이어·스페인어·한국어를 검수한다.
5. 자동 PASS를 “키·숫자·구조 안전”과 “자연스러운 완역”으로 구분해 보고한다.

### P1 · 높음 — 모바일 탐색과 접근성

강점:

- `:focus-visible` 스타일이 있다.
- `prefers-reduced-motion` 대응이 있다.
- 반응형 카드 그리드와 다크 모드를 제공한다.
- 대부분의 이미지에 alt와 lazy loading이 있다.

문제:

- [app/globals.css](./app/globals.css)는 920px 이하에서 기본 nav를 완전히 숨기지만 대체 모바일 메뉴가 없다.
- `<main>`, skip link, `aria-current`, `aria-live`, status 영역이 없다.
- 홈에 H1이 두 개다: HeroSlider 제목과 플래너 제목.
- HeroSlider는 5초마다 자동 이동하지만 pause·stop·focus 제어가 없다.
- `role="tablist"` 내부 버튼에 `role="tab"`, `aria-controls`가 없다.
- 플래너의 동적 결과가 스크린리더에 공지되지 않는다.
- `--faint: #8A91A3`은 흰 배경 대비 약 3.15:1, `#F5F7FC` 대비 약 2.94:1인데 11~12.5px 텍스트에 자주 사용된다.
- 이미지 12곳이 `width`와 `height` 없이 렌더되어 CLS 위험이 있다.

권장 조치:

1. 모바일 햄버거·드로어 내비게이션을 제공한다.
2. `main`, skip link, 단일 H1 계층을 적용한다.
3. 자동 슬라이드 정지 버튼, 키보드 이동, 올바른 tab semantics를 구현한다.
4. 동적 결과에 `aria-live` 또는 적절한 status 처리를 적용한다.
5. 작은 텍스트 대비를 최소 4.5:1로 조정한다.
6. 모든 콘텐츠 이미지에 intrinsic width·height를 지정한다.
7. axe, 키보드, 스크린리더 검사를 CI와 출시 체크리스트에 추가한다.

### P1 · 중상 — 성능 예산과 번들 구조

라이브 전송량 표본은 다음과 같다. 이는 curl 기반 전송량이며 Core Web Vitals 측정은 아니다.

| 항목 | 전송량 표본 |
|---|---:|
| 영어 홈 HTML | 약 70KB |
| CSS | 약 58KB |
| 홈에서 참조한 자체 JS 7개 합계 | 약 555KB, 압축 전 |
| `hero-busan.mp4` | 약 1.09MB |
| 전체 public 자산 | 133개, 약 42MB |
| 가장 큰 개별 이미지 | 약 1.22MB |

코드 근거:

- [next.config.mjs](./next.config.mjs)는 정적 export와 `images.unoptimized: true`를 사용한다.
- 여러 페이지가 직접 `<img>`를 사용하고 크기를 지정하지 않는다.
- client Header가 [lib/i18n.js](./lib/i18n.js)를 import하므로 활성 10개 메시지 사전이 client layout bundle에 포함될 가능성이 높다.
- Hero 영상의 `preload="none"`과 IntersectionObserver 기반 재생은 긍정적이다.

권장 조치:

1. 서버 layout에서 현재 locale의 nav 문자열과 locale 목록만 Header에 props로 전달한다.
2. 아래 폴드의 Map, Spotify, Reviews, Weather 위젯을 지연 로드한다.
3. AVIF/WebP와 반응형 `srcset`을 만들고 이미지별 100~200KB 예산을 설정한다.
4. 영상 poster와 자동재생 정책을 저속·데이터 절약 환경에 맞춘다.
5. 동의 전 GA·Ads 로드를 제거한다.
6. PageSpeed Insights, CrUX, GA 또는 별도 RUM으로 모바일 CWV를 측정한다.

### P1 · 중상 — 운영 검증과 CI 부족

강점:

- [package.json](./package.json)은 i18n·content 검증을 prebuild, SEO 검증을 postbuild에 연결한다.
- [scripts/verify-seo.mjs](./scripts/verify-seo.mjs)는 canonical, hreflang, title, description, lang, OG 이미지, JSON-LD, sitemap, robots를 빌드 산출물에서 검사한다.
- [lib/facts.js](./lib/facts.js)는 `VERIFIED` 상태만 렌더한다.
- facts 33개 중 32개가 VERIFIED이며, VOLATILE은 19개, 현재 `recheck_after` 기한 초과는 0개다.

문제:

- 감사 환경에 `node_modules`와 `out`이 없었다. 설치 금지 조건 때문에 clean build를 실행하지 못했으며 SEO verifier는 `out/ not found`로 실행할 수 없었다.
- `.github` CI, 테스트 파일, ESLint 설정이 없다.
- 위임 worktree의 Git 메타데이터가 끊겨 `git status`를 확인할 수 없었다.
- Next.js 14.2.35와 React 18.3.1을 사용하며 의존성 갱신 정책은 확인되지 않았다.
- `facts.json`의 `_updated`는 `2026-08-03`인데 일부 fact 검증일은 `2026-08-05`다.

권장 조치:

1. CI에서 Node 20 clean install → build → 3개 verifier → 링크·404·host smoke → axe를 필수화한다.
2. fact의 `recheck_after`가 지나면 자동으로 빌드를 실패시킨다.
3. Dependabot 또는 Renovate와 정기 보안 업데이트 절차를 운영한다.
4. `_updated`를 실제 최신 검증일과 동기화한다.

### P2 · 중간 — SEO 발견성과 신뢰 신호

강점:

- 라이브 홈과 일본어 비자 상세의 title, description, self-canonical, 10개 hreflang, `x-default`, OG가 정상이다.
- robots는 검색 크롤러를 허용하고 sitemap을 선언한다.
- 코드상 sitemap은 로케일당 85개 경로, 총 850 URL이다.
- 라이브 sitemap은 약 1.01MB로 Google의 50MB·50,000 URL 한도 이내다.
- 언어별 별도 URL과 상호 hreflang 구조는 Google 권장과 부합한다.
- 구조화 데이터는 페이지에 실제 표시되는 정보만 재진술하도록 설계돼 있다.

리스크와 미확인 사항:

- 공개 `site:ktriphub.com` 검색에서 결과가 노출되지 않았다. 이는 색인 실패를 확정하지 않으므로 Search Console 확인이 필요하다.
- Google Search Console 인증·sitemap 제출·모니터링 근거가 저장소에 없다. DNS 인증 여부는 알 수 없다.
- About, Contact, Editorial Policy, 작성자·검수자 정보가 없어 비자·안전 콘텐츠의 신뢰 신호가 약하다.
- Article JSON-LD에 author와 조직 logo가 없다.
- SEO verifier는 JSON 파싱과 타입은 확인하지만 스키마별 필수·권장 필드 품질까지 검증하지 않는다.

권장 조치:

1. Google Search Console과 Bing Webmaster Tools를 설정하고 sitemap을 제출한다.
2. locale·디렉터리별 색인, 크롤링, 노출, CTR 대시보드를 만든다.
3. About, 작성·검수자, 출처 정책, 연락처, 수정 정책을 제공한다.
4. 실제 검수일을 기준으로 sitemap `lastmod`와 Article 날짜를 관리한다.
5. FAQ schema는 유지할 수 있지만 일반 여행 사이트에서 리치결과를 기대하지 않는다.

참고:

- [Google sitemap 기준](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=en)
- [Google 다국어 사이트 지침](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)

## 디자인 총평

코드 수준에서 본 시각 체계는 색상 토큰, 카드와 그리드, 반응형 스타일, 다크 모드, 사진 크레딧, 제휴 고지까지 일관되어 기반이 건전하다.

그러나 다음 문제가 완성도를 낮춘다.

- 모바일에서 주 내비게이션이 사라진다.
- 저대비 보조문구가 많다.
- 자동 슬라이더를 사용자가 제어하기 어렵다.
- 홈에 플래너, 목적지, 음식, 딜, 후기, K-pop, 지도, 안전 정보가 모두 들어가 정보 밀도가 높다.
- 일부 CTA와 공유 기능이 실제로 동작하지 않는다.

홈은 다음 3단 흐름으로 압축하는 편이 좋다.

1. 입국·공항·통신·결제 등 여행 준비
2. 도시 및 일정 탐색
3. 지도·예약·저장·공유

세부 음식, K-pop, 후기, 안전 정보는 독립 허브 페이지로 보내 탐색 부담을 줄이는 것이 좋다.

## 30·60·90일 국제 마케팅 계획

### 0~30일 — 신뢰와 측정 기반

1. HTTPS·host 정규화, consent·privacy, 과장 문구·비동작 기능 등 P0를 먼저 해결한다.
2. Search Console, Bing, GA4 대시보드와 UTM 규칙을 정한다.
3. 다음 이벤트를 측정한다.
   - `language_select`
   - `planner_build`
   - `map_open`
   - `official_source_click`
   - `affiliate_click`
   - `review_start`
   - `share_success`
4. 이벤트에는 locale, path, partner를 파라미터로 포함한다.
5. 2026년 1분기 방한객은 중국 145만, 일본 94만, 대만 54만이므로 `zh`, `ja`, `zh-TW`를 1차 품질·SEO 시장으로 둔다.
6. 영어는 장거리·글로벌 공용 시장, `vi`, `th`, `id`, `ms`는 2차 성장 시장으로 운영한다.
7. 1차 언어에서 다음 핵심 페이지를 원어민 완역·검수한다.
   - 국적별 비자·입국
   - K-ETA와 e-Arrival Card
   - 공항에서 시내 이동
   - 교통카드와 KTX
   - SIM·eSIM
   - 환전과 결제
   - 서울·부산·제주 2일·3일·5일 일정
   - 음식과 K-pop 여행
8. locale별 유효 색인 URL, 비브랜드 노출·CTR, engaged session, planner completion, affiliate CTR, 영어 누수율을 기준선으로 기록한다.

참고: [문체부 2026년 1분기 방한객 발표](https://www.mcst.go.kr/site/s_notice/tv/tvView.jsp?pMenuCD=0307010000&pSeq=2636)

### 31~60일 — 현지화 콘텐츠와 유통

1. 다음 검색 의도를 중심으로 topic cluster를 만든다.
   - 국적 → 한국 비자·입국
   - 공항 → 숙소
   - 도시별 N일 일정
   - 지역 + 음식·할랄·가족·K-pop
2. 모든 콘텐츠에 공식 출처와 실제 갱신일을 유지한다.
3. 시장별 채널을 구분한다.
   - 일본: Google, Yahoo Japan, X, Instagram, YouTube Shorts
   - 대만: Google, Instagram, Threads, YouTube
   - 동남아: TikTok, YouTube, Facebook
   - 영어권: Google, YouTube, 여행 커뮤니티
4. 커뮤니티에서는 링크 살포보다 체크리스트, 지도, 공식 근거 중심의 답변으로 신뢰를 쌓는다.
5. 각 언어의 원어민 여행자 3~5명에게 입국정보 찾기 → 공항 이동 → 일정 생성 → 지도 → 예약의 과업형 QA를 실시한다.
6. 도착 72시간 체크리스트, 서울·부산 3일 저장용 일정, 비상번호 카드 같은 저장·공유 자산을 만든다.
7. 공유 기능을 실제로 구현한 뒤 공유 캠페인을 시작한다.
8. 마이크로 크리에이터, 호스텔, 어학당, 여행 커뮤니티 후보를 정리하되 광고 표시 기준과 UTM 체계를 먼저 만든다.

### 61~90일 — 성과 기반 확대와 수익화

1. locale×topic별 Search Console, GA4, 제휴 실적 상위 20% 페이지에 업데이트, 내부 링크, 영상, 링크 획득 노력을 집중한다.
2. 성과가 낮거나 혼합언어가 심한 페이지는 무작정 확대하지 않고 품질 개선 또는 noindex를 판단한다.
3. 동의 체계와 전환 이벤트가 안정된 뒤 고의도 비브랜드 검색어와 Meta·TikTok 영상에 소액 유료 테스트를 한다.
4. 성과는 단순 CPA가 아니라 planner → affiliate click → 수익 퍼널과 partner별 EPC로 판단한다.
5. Klook·Agoda CTA를 여행 단계와 locale에 맞게 현지화한다.
6. 월간 운영 루틴에 fact 재검증, 번역 누수, 404·redirect, index coverage, CWV, consent, 제휴 링크, 경쟁 SERP를 포함한다.
7. 90일 목표 예시는 다음과 같다.
   - 핵심 3개 언어 money page 영어 누수 0
   - 유효 색인율 90% 이상
   - planner completion과 affiliate CTR의 기준선 대비 개선
8. 절대 트래픽 목표는 현재 Search Console·GA 기준선을 확인한 뒤 설정한다.

## 명확한 강점

- 정적 export 구조로 서버 공격면과 운영 복잡도가 낮다.
- canonical·hreflang·sitemap의 단일 소스가 있다.
- 빌드 산출물을 읽는 SEO verifier가 과거 canonical 사고 재발을 막는다.
- 번역 검증기가 키·숫자·도메인·placeholder 변조를 탐지한다.
- fact SSOT와 VERIFIED-only 렌더링 정책이 여행 정보의 허위 수치를 억제한다.
- 공식 출처와 검증일을 사용자에게 노출한다.
- 구조화 데이터의 허위 평점·가격 생성을 금지한다.
- 사진 저작권과 제휴 링크 고지를 코드·문서로 관리한다.

## 확인하지 못한 영역

- 의존성 설치가 필요한 전체 clean build와 850페이지 빌드 산출물 전수 SEO 검증
- Google Search Console, GA4, AdSense, Cloudflare 내부 데이터와 실제 수익
- Lighthouse, CrUX, Core Web Vitals
- axe, 스크린리더, 실제 모바일 브라우저 시각 QA
- 중국 본토 네트워크 접근성과 현지 검색엔진 색인
- 모든 번역의 원어민 자연스러움
- 법률 자문 수준의 GDPR·각국 개인정보법 적합성
- Git 상태와 최신 커밋 여부

## 권장 실행 순서

1. Cloudflare HTTPS·www 정규화
2. Consent·Privacy 체계 적용
3. 과장 문구와 비동작 기능 정리
4. 번역 verifier 완전성 강화 및 상위 3개 언어 원어민 QA
5. 모바일 내비게이션·접근성 개선
6. CI와 fact 만료 gate 도입
7. 이미지·JS 성능 최적화 및 CWV 측정
8. Search Console 기반 국제 SEO·마케팅 확대
