# JAPAN / 日本語 SEO AUDIT — Korea Trip Hub (ktriphub.com/ja/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브 응답(curl, /ja/ 164 URL 전수) + Bing/GSC 사용자 제공 데이터
> 방식: AUDIT → 문제·원인 → 안전수정 → 검증 → 보고. **기존 Google/Bing/Naver·Sitemap·IndexNow 무훼손, 중복 재구현 금지.**
> 국가별 독립 규칙: 본 문서는 **일본**. 중국/Baidu는 `BAIDU_SEO_REPORT.md`로 별도 유지.

---

## A. 현재 상태 (확인된 사실 + 실측)
- Bing: `/ja/` **색인 성공**, sitemap **Success·에러0·경고0**, 발견 URL **~2,000**, IndexNow **구현·작동 중**, submission **~46.6K(누적)**. (사용자 제공)
- 실측: **/ja/ 164 URL** 전수 크롤. 전 페이지 **200·정적 SSG HTML**. description **누락 0·중복 0**.
- Bing 경고 "Meta descriptions on many pages are too short" 재현됨(§G).

## B. 기술 SEO — **우수(대부분 조치 불필요)**
| 항목 | 결과 |
|---|---|
| HTML lang | `<html lang="ja" dir="ltr">` ✅ (bare `ja`; `ja-JP`는 선택, Bing/Google 모두 `ja` 허용) |
| canonical | self-referencing 정확 ✅ |
| hreflang | 13개(12로케일+x-default), ja 자기참조 O, **canonical과 충돌 없음** ✅ |
| JSON-LD | 홈=WebSite+Organization / 명소=TouristAttraction+City+Breadcrumb / 가이드=Article+FAQPage+Breadcrumb ✅ |
| OpenGraph | og:locale **ja_JP** ✅ |
| breadcrumb | 상세페이지 BreadcrumbList ✅ |
| H1/H2 | 존재 ✅ |
| image alt | 샘플 **누락 0** ✅ |
| noindex | **0**(전 페이지 색인 가능) ✅ |
| robots | 전체 Allow, /ja/ 차단 없음, sitemap 선언 ✅ |
| 렌더링 | **정적 SSG**(`output:"export"`) — JS 없이 본문 완비 ✅ |

## C. 일본어 SEO(표현 품질) — 양호
- 제목·설명·본문 **자연스러운 일본어**(직역체 아님). 예: `明洞（ミョンドン）, ソウル` / `韓国の桜2027：見頃の時期とおすすめスポット`.
- 한국 지명 표기 적절: ソウル/明洞（ミョンドン）/弘大/聖水/江南/東大門/釜山/**済州島**/**仁川国際空港**/広蔵市場/全州韓屋村 등 — **일본 사용자 실제 표기와 일치**.

## D. Sitemap — 정상(재생성 불필요)
- `sitemap.xml` 200·application/xml·**1,968 URL·단일(인덱스 아님)**. **ja 164 전부 포함**.
- **canonical URL만** 포함(페이지와 동일 route 소스 `lib/routes.js`에서 생성). 샘플 전수 200 → **404/redirect/noindex URL 없음**, **중복 0**.
- `lastmod` 없음: 페이지별 실수정일 데이터가 없어 **의도적 생략**(하네스=날짜 조작 금지). Bing 경고0이므로 문제 아님.

## E. IndexNow — 작동 정상(재구현 금지 준수)
- `scripts/indexnow.mjs`(수동): 인자 없으면 `out/sitemap.xml` 전량 제출, 인자 주면 해당 URL만. `KEY=ca7652…`, keyLocation 라이브.
- **CI(ci.yml)·Cloudflare 빌드에 IndexNow 없음** → **자동 과제출 아님**. 46.6K = **수동 전량제출(~2K) 누적(~23회분)**.
- IndexNow는 NEW/UPDATED/DELETED 이벤트용. **동일 URL 반복 전량제출은 비효율(무해·Bing이 dedupe)**.
- 권장(선택): 배포 시 **변경된 URL만** `node scripts/indexnow.mjs <url>...`로 타겟 제출. 스크립트가 이미 지원 → **코드 변경 불필요**.

## F. hreflang — 정상
- 각 언어 상호(reciprocal) 링크 + x-default(en). ja는 `hrefLang="ja"`로 정확 선언. canonical(self)과 **모순 없음**.

## G. Metadata(description) — **핵심 이슈**
전수 실측(164): **누락 0 · 중복 0**. 길이 분포(일본어 문자수): `<50:31 · 50–79:78 · 80–119:50 · 120–159:4 · 160+:1`(중앙값 68).

1. **[HIGH] English 누수 1건 — `/ja/plan/help/`** → ✅ **수정완료(자동)**
   - 원인: plan 페이지 description=`item.tagline`인데 `plan.ja.json`에 `help` 없음 → **영어 base tagline 누수**(메타+배너 둘 다).
   - 수정: ① 메타=번역된 가이드 metaDesc 우선(`guideI18n[slug][locale].metaDesc || item.tagline`) → help가 107자 일본어 metaDesc 사용. ② `plan.ja.json`에 일본어 help tagline 추가 → 배너도 일본어.
2. **[MEDIUM/진행중] 짧은 description 109개(<80자)** — **패딩 아닌 자연스러운 심화로 단계 진행:**
   - **✅ phase 1**: plan 허브 6종(visa/transit/airport/sim/money/weather) ja metaDesc 신규(75~86자). plan 페이지가 가이드 metaDesc 우선 → **배너 불변·메타만 심화**. 커밋 6adebeb.
   - **✅ phase 2**: 섹션 허브 4종(destinations/food/guides = 부제 겸 메타 ~60자로 심화, ask-korea = 메타전용 91자). itinerary/stay/kpop은 이미 김(65~88자, 데이터파일 ui). 커밋 c73749e.
   - **남은 tail**: 명소상세 92개(intro[0] 재사용, 단문 ~46자·양질). 별도 metaDesc 필드+page.jsx 필요·ROI 낮아 후순위(결정).
   - (아래 원 진단 보존:)
   - **중요 판단:** 전부 **자연스럽고 페이지 내용과 정확히 일치하는 양질의 일본어**(예: `南山の頂に立つNソウルタワーは、市内を一望できる絶景スポット。特に夕暮れと夜がおすすめです。`). 일본어는 **전각**이라 60–80자면 영문 120–160자 폭 → **Bing이 문자수 기준으로 과다경고**하는 측면.
   - 그래도 검색의도 키워드가 얇은 상위 페이지는 **손으로 풍부화** 여지 있음. 단 이는 **① 대량(100+) ② 전 로케일 구조(짧음은 ja 전용 아님) ③ 일부는 본문(intro/blurb) 재사용이라 별도 `metaDesc` 필드 신설 필요**한 **큰 결정** → §N에서 승인 요청.

## H. 내부링크 — 양호
- `/ja/` 홈에 crawlable `<a href="/ja/...">` **34개+**(nav·섹션·카드). 상세→상위 breadcrumb.
- 직전 배포로 **푸터에 크롤 가능한 언어 링크** 추가 → 크롤러가 링크로 `/ja/` 발견(사이트맵 외 경로).
- 언어 전환기 자체는 `<select>`(JS)지만 푸터 `<a>`로 보완됨.

## I. Content gaps(검색의도 클러스터)
- 강함: 명소(92곳/18도시)·먹거리·플랜6종(비자/공항/교통/SIM/환전/날씨)·시즌가이드·국적별 비자·K-culture.
- 상대적 공백(일본 검색의도 대비): `韓国旅行 費用/持ち物/初心者`(비용·짐·초보) 종합 가이드, `ソウル ポップアップ`(팝업)·`韓国 コンサート/イベント`(공연·행사) 시의성 허브, 도시별 `明洞グルメ`류 미시 클러스터.

## J. 일본 검색 키워드(조사 원칙)
- **검색량 미추측(지침 준수).** 실검색량 확정은 키워드툴/GSC 데이터 필요(현재 세션 미연결).
- 사이트 기존 일본어 자산 + 사용자 제공 후보로 매핑: `韓国旅行`·`ソウル 観光/グルメ`·`明洞/弘大/聖水/東大門/江南`·`仁川空港`·`韓国 地下鉄/交通`·`韓国 グルメ/カフェ/ショッピング`·`済州島/釜山 旅行`·`K-POP コンサート`·`韓国 ポップアップ`.
- 다음 단계에서 **GSC(Country=Japan, Page contains /ja/)·Bing 성과 데이터로 실쿼리 검증** 필요(§K.11–12, 계정 데이터는 사용자 열람).

## K. 수정된 파일(이번 커밋)
| 파일 | 변경 | 심각도 |
|---|---|---|
| `app/[locale]/plan/[slug]/page.jsx` | description=번역 가이드 metaDesc 우선(help 영어 누수 해결, 메타 전용, 타 페이지 영향 없음) | HIGH |
| `data/plan.ja.json` | `items.help.tagline`(일본어) 추가 → 배너 영어 누수 해결 | HIGH |
| `JAPAN_SEO_REPORT.md` | 본 보고서 | — |

## L. 변경 전 / 후
- `/ja/plan/help/` `<meta description>`: `Who to call and what to do if something goes wrong…`(EN) → `韓国の緊急番号（112 警察、119 消防・救急、1330…）…`(107자 JA).
- `/ja/plan/help/` 배너 tagline: 영어 → `困ったときに誰へ連絡し、どう動くか。緊急番号は、いざという前に保存しておきましょう。`.

## M. 테스트 결과
- verify-i18n / verify-content-i18n: **PASS ✓**(plan.ja.json 파리티 유지, 메타 로직 변경은 게이트 무관).
- 배포 후 라이브 재확인: help 메타·배너 일본어화(아래 검증 섹션).

## N. 사람이 직접 해야 할 작업 / 결정 필요
1. **[결정·핵심] 짧은 description 풍부화 범위** — 자동 패딩은 안 함(지침). 권장안:
   - **방식:** 명소 등 "본문 재사용" 페이지에 **별도 `metaDesc` 필드 신설**(있으면 메타에 사용, 없으면 기존 intro/blurb 폴백) → **눈에 보이는 본문 불변**, 손으로 쓴 검색의도형 일본어만 메타에 투입.
   - **범위 옵션:** (a) **고가치 ja 상위 ~25–40페이지**(플랜 허브·시즌/주제 가이드·상위 명소·일정) 먼저 / (b) 전 164 ja / (c) 전 로케일 구조 개편. **어디까지, ja 우선/전 로케일?** 승인 필요.
2. **[선택] help 배너 영어 누수 = 타 로케일(zh/ko 등 11개)에도 존재**(plan.<locale>.json에 help 없음). Japan 범위라 ja만 수정함 → 나머지 일괄 수정할지.
3. **[선택] IndexNow**: 배포 시 변경 URL만 타겟 제출로 전환(전량 반복 대신). 코드 변경 없이 운영습관.
4. **[데이터·사용자] GSC(Japan·/ja/)·Bing 쿼리/노출/CTR 실데이터** 열람 후 §I·J 콘텐츠 우선순위 확정.

---

## 지속 관리 규칙 (일본 — 프로젝트 표준)
- /ja/ 신규 페이지: **자연스러운 일본어 title·description·h1**, 정적 SSG로 초기 HTML 완비, canonical(self)+hreflang(ja 포함) 동기화.
- **description은 페이지 검색의도에 맞는 자연스러운 일본어**(기계번역·패딩·키워드스터핑 금지). 영어 폴백 누수 금지(신규 페이지는 로케일 tagline/metaDesc 필수).
- Sitemap·IndexNow는 **재구현 금지**(정상 작동). IndexNow는 변경 URL 중심.
- 한국 지명은 **일본 사용자 실제 표기**로 통일(明洞/仁川国際空港/済州島 등).
- **Google/Bing/Naver·중국(Baidu) 규칙 무훼손** 전제. 중국·일본 규칙은 **독립 유지**.
