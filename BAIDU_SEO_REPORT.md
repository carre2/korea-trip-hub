# BAIDU / 中国搜索 SEO AUDIT — Korea Trip Hub (ktriphub.com)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브 응답(curl) + Cloudflare 배포 구조
> 방법: AUDIT → 문제목록 → 안전수정 → 검증. **Google/Bing/Naver SEO를 훼손하지 않는 범위에서만 자동 수정.**
> Baidu Search Resource Platform(百度搜索资源平台) 계정 작업은 사용자 지시에 따라 **보류**.

---

## 0. 요약 (한 줄 결론)

기술 기반은 **이미 Baidu 친화적으로 매우 양호**하다(정적 SSG HTML·robots 전체 허용·중국어 페이지가 사이트맵/색인 가능·중국어 title/desc/h1·self-canonical·noindex 없음). **가장 큰 구조적 한계는 코드가 아니라 인프라/계정**이다 — ① 중국 본토 CDN/PoP 및 ICP 备案 부재(크롤·속도 저하, 차단 아님) ② Baidu 웹마스터 계정 부재(사이트맵 능동 제출·검증 불가, 자연크롤은 가능). **코드에서 고칠 유일한 실질 항목**은 "언어 간 크롤 가능한 링크 부재"였고 이번에 수정 완료.

---

## A. 현재 상태 (실측)

| 항목 | 상태 | 근거 |
|---|---|---|
| 렌더링 방식 | **정적 SSG (`output:"export"`)** — JS 없이 완전한 HTML | next.config.mjs `output:"export"` / zh 홈 78KB HTML |
| 중국어 페이지 | **존재·간체(zh)+번체(zh-TW) 분리** | `/zh/`, `/zh-TW/` 라이브 200 |
| 중국어 URL 구조 | `/zh/…`(간체), `/zh-TW/…`(번체) — 경로 세그먼트 방식 | lib/i18n.js locales |
| robots.txt | **전체 허용** `User-Agent:* Allow:/` + Sitemap + Host | 라이브 `/robots.txt` |
| Baiduspider 접근 | **200, 전체 HTML(일반 UA와 동일 78,527 bytes)** = 클로킹/차단 없음 | curl -A Baiduspider |
| sitemap.xml | **200 application/xml, 1,968 URL, 단일(인덱스 아님)** | 라이브 |
| — 중국어 포함 | **zh 164개 + zh-TW 164개 전부 포함** + hreflang(xhtml:link) | 라이브 sitemap grep |
| canonical | **self-referencing 정확** (`/zh/`→`/zh/`) | lib/seo.js `pageMeta` |
| hreflang | **13개(12로케일+x-default) 정상**, `hrefLang` link 태그 | zh 홈 head |
| html lang | `<html lang="zh">` / `lang="zh-TW"` (bare code) | zh 홈 |
| title/description | **중국어로 현지화됨** (`用你的语言规划韩国之旅` 등) | zh 홈 |
| h1 | 존재(`h1.hero2-h`) | zh 홈 |
| noindex | **없음**(zh 홈·zh 비자 모두 0) | 라이브 |
| 구조화데이터 | WebSite/Organization/Breadcrumb/Article/FAQPage/TouristAttraction | lib/seo.js |
| http→https | **301 정상** | curl -I |
| www→non-www | **301 정상** | curl -I |
| Google Fonts | **미사용**(system-ui) = 중국서 렌더블로킹 폰트 없음 | 코드 grep 0건 |
| 중국차단 임베드 | GTM·AdSense·Google Maps·Spotify — **전부 async/lazy**(iframe `loading="lazy"`) | MapExplorer/SpotifyKpop |
| CDN/보안 | Cloudflare Workers+Static Assets. Bot Fight로 Baiduspider UA 차단 정황 **없음** | curl 200 |

---

## B~E. 발견된 문제 · 심각도 · 수정필요 · 수정방법

### 1. 언어 간 크롤 가능한 `<a>` 링크 부재 — **MEDIUM** — ✅ 수정완료(자동)
- **현상:** 언어 전환기가 `<select onChange>`(JS)뿐. en 홈에 `<a href="/zh/">` **0개**. 푸터도 로케일 내부 링크만.
- **영향:** Google은 hreflang+sitemap으로 zh를 발견하지만 **Baidu는 hreflang을 거의 무시** → zh 섹션 발견이 사실상 사이트맵 단일 채널에 의존(취약).
- **수정:** `components/SiteFooter.jsx`에 **크롤 가능한 언어 링크 행**(모든 로케일 홈으로 가는 실제 `<a href>`) 추가. 현재 로케일은 `<strong>`. 추가형이라 canonical/hreflang·URL 불변, Google에도 이득(내부링크 증가).

### 2. `<html lang>` / hreflang가 bare code(`zh`,`zh-TW`) — **MEDIUM** — ⏸ 사용자 결정 필요(자동수정 보류)
- **현상:** `lang="zh"`는 간체/번체 미구분. 정밀하게는 `zh-Hans`(간체)/`zh-Hant`(번체) 또는 `zh-CN`/`zh-TW`.
- **영향(Baidu):** 낮음 — Baidu는 중국어 콘텐츠를 직접 판독, hreflang 무시.
- **영향(Google):** 현재 `zh`/`zh-TW`로 **이미 GSC 중국어 검색 노출·색인 정상 작동 중**. 코드 변경 시 재처리 리스크.
- **판단:** Baidu 이득 대비 Google 리스크가 있어 **자동 적용하지 않음**. 원하면 URL은 그대로 두고 `lang`/`hreflang`만 `zh-Hans`/`zh-Hant`로 정밀화 가능(변경계획 §수정예정 참조).

### 3. 중국 본토 CDN/PoP 및 ICP 备案 부재 — **HIGH(인프라)** — ⏸ 사용자 결정(비즈니스/법률)
- **현상:** Cloudflare 일반 요금제는 **중국 본토 PoP 없음**. 도메인에 **ICP 备案(중국 사이트 등록)** 없음.
- **영향:** 차단은 아니지만 Baiduspider 크롤·중국 사용자 TTFB **느림**. Baidu는 본토 호스팅/备案 사이트를 크롤·랭킹에서 우대.
- **해결(비용/법률 수반):** ICP 备案 취득 + 중국 CDN(Cloudflare China Network[기업+备案], 또는 알리클라우드/텐센트 CDN). **코드로 불가, 사용자 결정.**

### 4. Baidu Search Resource Platform 계정 부재 — **HIGH(계정)** — ⏸ 보류(사용자 지시)
- **현상:** 사이트 소유권 인증·사이트맵 능동 제출(普通收录)·`baidu-site-verification` 메타·autopush(主动推送) 전부 계정 필요. 한국 사용자 신규가입·실명인증 제약으로 **보류**.
- **영향:** 능동 색인 채널 없음. **단, 자연 크롤+robots의 sitemap 지시로 수동 색인은 가능**(느릴 뿐).
- **금지 준수:** 가상번호/대여/계정구매/실명우회 **일절 안 함**. 정식 계정 확보 시 §14 절차로 진행.

### 5. 중국 차단 서드파티(GTM/AdSense/Google Maps/Spotify/Google Form) — **LOW** — ✅ 조치 불필요
- 전부 async 또는 iframe `loading="lazy"` → **본문 렌더 차단 안 함**. 중국에서 해당 위젯만 조용히 실패, 텍스트 콘텐츠·내부링크는 정상.
- (향후 선택) 중국 UX 강화 시 Baidu 지도 임베드/중국 결제 대안 검토 가능. 지금은 불필요.

### 6. og:locale에 ru·fr 누락 — **LOW** — (Baidu 무관, 별건)
- `lib/seo.js` OG_LOCALE 맵에 ru/fr 없음 → bare locale 폴백. 중국 SEO와 무관, 필요시 별도 처리.

---

## F. 수정된 파일 (이번 커밋)

| 파일 | 변경 |
|---|---|
| `components/SiteFooter.jsx` | 크롤 가능한 언어 링크 행 추가(모든 로케일 홈 `<a href>`, 현재 로케일 `<strong>`) |
| `app/globals.css` | `.sitefoot-langs` 스타일 추가 |
| `BAIDU_SEO_REPORT.md` | 본 보고서 |

## G. 변경 전 / 후 (핵심)

- **전:** 모든 페이지에서 다른 언어로 가는 크롤 가능한 링크 = 0 (JS `<select>`만). Baidu의 zh 발견 = 사이트맵 단일 의존.
- **후:** 모든 페이지 푸터에 12개 로케일 홈으로의 실제 `<a href>` 링크. Baidu가 링크를 따라 `/zh/`·`/zh-TW/` 발견 → 각 로케일 홈의 34개 내부링크로 심화 크롤.

## H. 테스트 결과

- verify-content-i18n / verify-i18n: 영향 없음(메시지 키 미변경, 폴백 라벨 사용).
- 배포 후 라이브 검증: 아래 "검증" 섹션(푸터 `<a href="/zh/">` 노출 확인).

## I. 미해결(구조적, 코드 밖)

- ICP 备案 + 중국 본토 CDN (HIGH, 사용자 결정)
- Baidu 웹마스터 계정 (HIGH, 보류)
- `zh`→`zh-Hans` 정밀화 (MEDIUM, Google 리스크로 결정 대기)

## J. 사람이 직접 해야 하는 작업 (체크리스트)

1. **[결정]** `<html lang>`/hreflang를 `zh-Hans`/`zh-Hant`로 정밀화할지 — Baidu 이득 작음 + Google 재처리 리스크. "진행" 시 URL 불변으로 코드만 수정.
2. **[결정/비즈니스]** ICP 备案 취득 + 중국 CDN 도입 여부(중국 속도·랭킹의 근본 지렛대, 비용·법률 수반).
3. **[보류→향후]** 정식 Baidu 계정 확보되면: 소유권 인증 → sitemap 제출 → `baidu-site-verification` 메타 추가 → 普通收录/主动推送 → 색인 모니터링.
4. **[선택]** 중국 UX 강화(Baidu 지도 임베드 등)는 트래픽 확인 후.

---

## 지속 관리 규칙 (이 프로젝트 표준으로 적용)

- 신규 페이지/컴포넌트는 **정적 SSG로 초기 HTML에 본문·title·desc·h1·canonical·hreflang·내부링크가 존재**하도록 유지(JS 전용 콘텐츠 금지).
- 언어 추가/변경 시 **푸터 크롤링 링크·사이트맵·hreflang 3곳 동기화**.
- robots에서 Baiduspider를 **명시 차단하지 않음**(전체 Allow 유지). 관리자/API/인증 경로 보안정책은 유지.
- 중국 차단 서드파티는 **async/lazy 필수**(본문 렌더 비의존).
- Baidu 계정·ICP·DNS·Cloudflare 보안정책은 **사용자 승인 없이 변경 금지**.
- 모든 변경은 **Google/Bing/Naver SEO 무훼손**이 전제.

## 향후 중국 검색 콘텐츠 확장 계획 (개요)

- 기존 중국어 자산과 연결되는 검색의도 카테고리 우선: `韩国旅游攻略`/`首尔自由行`/`釜山旅游`/`济州岛旅游`/`韩国交通·地铁`/`仁川机场`/`韩国美食`/`韩国购物`/`韩国签证`/`KPOP演唱会·活动`.
- **검색량 미확인 상태에서 고검색량 단정 금지**, keyword stuffing 금지, 기계번역 티 제거(한국 고유명사=중국 사용자 실제 표기와 일치).
- 이미 강한 자산: 국적별 비자(번체 `[국가]護照去韓國要簽證嗎` = GSC 최대 유입) → 간체(zh) 동등 강화가 Baidu 직접 수혜 경로.
