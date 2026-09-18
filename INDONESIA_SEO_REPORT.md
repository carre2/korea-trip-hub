# INDONESIA / Bahasa SEO AUDIT — Korea Trip Hub (ktriphub.com/id/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브 응답(curl, /id/ 164 URL 전수, description은 /en/ 대조로 영어누수 판정)
> 방식: AUDIT → 문제·원인 → 안전수정 → 검증 → 보고. **Sitemap/IndexNow 재구현 금지, 기존 정상설정 무변경.**
> 국가별 독립 규칙(일본=`JAPAN_SEO_REPORT.md`, 중국=`BAIDU_SEO_REPORT.md`). 본 문서는 **인도네시아**.

## A. 현재 상태
- GSC·Bing 등록 완료. Bing `/id/` **색인 성공·No SEO/GEO issues**, JSON-LD·OG 인식, sitemap 정상, IndexNow 구현. (사용자 제공)
- 실측: **/id/ 164 URL** 전수 200·정적 SSG. description **누락0·중복0**.

## B. 기술 SEO — **우수(조치 불필요)**
| 항목 | 결과 |
|---|---|
| HTML lang | `<html lang="id" dir="ltr">` ✅ |
| canonical | self-referencing ✅ |
| hreflang | id 자기참조 + 12로케일 + x-default, canonical과 충돌 없음 ✅ |
| JSON-LD | 홈 WebSite+Organization / 명소 TouristAttraction+City+Breadcrumb / 가이드 Article+FAQPage+Breadcrumb ✅ |
| OpenGraph | og:locale **id_ID** ✅ (seo.js OG_LOCALE에 매핑됨) |
| H1/H2·breadcrumb·img alt | 존재 / 누락 0 ✅ |
| noindex | 0 ✅ |
| 렌더링 | 정적 SSG(JS 없이 본문 완비) ✅ |

## C. 인도네시아어 SEO(품질) — 양호
- 자연스러운 Bahasa(직역투 아님). 예: `Tempat nyata, dikelompokkan per kota. Angka popularitas bersumber, bukan karangan.` / `Bukchon adalah kawasan berbukit dengan hanok (rumah tradisional) yang terjaga…`.
- 제목 Bahasa 현지화: `Rencanakan perjalanan ke Korea dalam bahasamu` / `Bunga Sakura Korea 2027: Kapan & Di Mana Melihat Mekarnya`.

## D. Metadata(description) — **양호(길이 문제 없음)**
전수 실측(164): **누락0·중복0**. 길이 분포: `1–69:2 · 70–119:15 · 120–159:47 · 160+:100`(중앙값 **177**, 최대 428). → 일본과 달리 **description이 충분히 길다**(Bing "too short" 우려 없음).
- **[HIGH] English 누수 1건 — `/id/plan/help/`** → ✅ 수정: ① 메타=공용 plan 수정(가이드 metaDesc 우선)으로 id metaDesc(197자) 사용 ② `plan.id.json`에 Bahasa help tagline 추가(배너 누수 해결).
- 그 외 언어누수(id==en) **0**, 휴리스틱 영어의심 **0**.

## E. Sitemap — 정상(재생성 불필요)
- id 164 전부 포함. canonical URL만(routes.js 생성). 404/redirect/noindex/중복 없음. lastmod 의도적 생략(하네스).

## F. IndexNow — 정상(재구현 금지 준수)
- 공용 수동 스크립트, CI/빌드 자동실행 없음(과제출 아님). 변경 URL 타겟 제출 권장(코드 변경 불필요).

## G. hreflang / canonical — 정상
- `hrefLang="id"` 자기참조 + 상호 링크 + x-default. canonical(self)과 모순 없음.

## H. 내부링크 — 양호
- `/id/` crawlable `<a href="/id/...">` 다수 + breadcrumb + 푸터 언어링크(직전 배포).

## I. Content gaps(검색의도)
- 강함: 명소(92/18도시)·먹거리·플랜6종·시즌/주제 가이드·국적별 비자·K-culture.
- 상대공백: `liburan ke Korea sendiri`(자유여행 종합)·`biaya liburan Korea`(비용)·`konser K-pop / event / popup store` 시의성 허브·도시별 미시 클러스터(`kuliner Myeongdong` 류).

## J. 인도네시아 검색 키워드(원칙)
- **검색량 미추측**(지침). 실쿼리 검증=GSC(Country=Indonesia, Page contains /id/)·Bing 성과 데이터 필요(계정 데이터=사용자 열람).
- 사이트 자산 매핑: `wisata Korea`·`liburan ke Korea (Selatan)`·`panduan wisata Korea`·`wisata Seoul / tempat wisata di Seoul`·`kuliner Korea`·`belanja di Korea`·`transportasi Korea`·`Bandara Incheon`·`konser K-pop`·`event / popup store Korea`.

## K. 수정된 파일
| 파일 | 변경 | 심각도 |
|---|---|---|
| `app/[locale]/plan/[slug]/page.jsx` | (공용, 일본작업서 반영) description=번역 가이드 metaDesc 우선 → `/id/plan/help/` 메타 영어누수 해결 | HIGH |
| `data/plan.id.json` | `items.help.tagline`(Bahasa) 추가 → 배너 영어누수 해결 | HIGH |
| `INDONESIA_SEO_REPORT.md` | 본 보고서 | — |

## L. 변경 전 / 후
- `/id/plan/help/` meta: `Who to call and what to do…`(EN) → `Nomor darurat Korea (112 polisi, 119 …)…`(197자 ID).
- `/id/plan/help/` 배너: 영어 → `Siapa yang harus dihubungi dan apa yang harus dilakukan saat ada masalah — simpan nomor darurat sebelum membutuhkannya.`

## M. 테스트 결과
- verify-i18n / verify-content-i18n: PASS(예정 재확인). 배포 후 `/id/plan/help/` 메타·배너 Bahasa화 라이브 확인.

## N. 사람이 직접 해야 할 작업 / 결정
1. **[데이터]** GSC(Indonesia·/id/)·Bing 쿼리/노출/CTR/순위 열람 → §I·J 우선순위 확정(노출↑클릭↓, 8~30위 성장페이지, 제목-쿼리 불일치 분류).
2. **[선택]** 콘텐츠 확장(비용/자유여행/팝업·콘서트 시의성)은 데이터 확인 후.
3. **[정보]** description 길이는 양호 → **id는 별도 대량 보강 불필요**(일본과 상황 다름).

---

## 지속 관리 규칙 (인도네시아 — 프로젝트 표준)
- /id/ 신규 페이지: 자연스러운 Bahasa title·description·h1, 정적 SSG, canonical(self)+hreflang(id) 동기화, 영어 폴백 누수 금지.
- Sitemap·IndexNow 재구현 금지. IndexNow는 변경 URL 중심.
- Google/Bing·타국(일본·중국) 규칙 **무훼손·독립 유지**.
