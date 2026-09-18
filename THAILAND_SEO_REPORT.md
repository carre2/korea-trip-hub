# THAILAND / ภาษาไทย SEO AUDIT — Korea Trip Hub (ktriphub.com/th/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브(curl, /th/ 164 URL 전수, description은 /en/ 대조로 영어누수 판정)
> 방식: AUDIT → 문제·원인 → 안전수정 → 검증 → 보고. **Sitemap/IndexNow 재구현 금지, 정상설정 무변경.**
> 국가별 독립 규칙(일본·중국·인니 각 보고서 별도). 본 문서는 **태국**.

## A. 현재 상태
- GSC·Bing 등록 완료. Bing `/th/` **색인 성공·No SEO/GEO issues**, JSON-LD·OG 인식, sitemap 정상, IndexNow 구현.(사용자 제공)
- 실측: **/th/ 164 URL** 전수 200·정적 SSG. description **누락0·중복0·영어누수0**.

## B. 기술 SEO — **우수(조치 불필요)**
| 항목 | 결과 |
|---|---|
| HTML lang | `<html lang="th" dir="ltr">` ✅ |
| canonical | self-referencing ✅ |
| hreflang | th 자기참조 + 12로케일 + x-default, canonical 충돌 없음 ✅ |
| JSON-LD | 홈 WebSite+Organization / 명소 TouristAttraction+City+Breadcrumb / 가이드 Article+FAQPage+Breadcrumb ✅ |
| OpenGraph | og:locale **th_TH** ✅ |
| H1/H2·breadcrumb·img alt | 존재 / 누락 0 ✅ |
| noindex | 0 ✅ |
| 렌더링 | 정적 SSG(JS 없이 본문 완비) ✅ |

## C. 태국어 SEO(품질) — 양호
- 자연스러운 태국어(직역투 아님). 제목 현지화: `วางแผนเที่ยวเกาหลีในภาษาของคุณ` / `ซากุระเกาหลี 2027: ช่วงเวลาและจุดชมดอกไม้บาน`.
- **[LOW] 명소 상세 제목의 도시명 미현지화**: `เมียงดง, Seoul` — 지명(เมียงดง)은 태국어인데 도시명이 `Seoul`(영어). 일본판은 `ソウル`로 현지화됨. 태국어 `โซล`로 통일 여지(경미, 데이터 city 필드 유래). 결정 필요 항목(§N).

## D. Metadata(description) — **양호(길이 문제 없음)**
전수 실측(164): **누락0·중복0·영어누수0**. 길이 분포: `1–69:7 · 70–119:29 · 120–159:56 · 160+:72`(중앙값 **153**). → 일본과 달리 **길이 충분**(Bing "too short" 우려 없음). 7개 very-short는 허브 페이지(destinations/food/guides/plan 허브)의 간결한 태국어(자연스러움).
- **help 누수: 0** — `/th/plan/help/` 메타는 공용 plan 수정(가이드 metaDesc 우선, 커밋 b6ea5a3)으로 **이미 태국어(197자)로 라이브 반영**. 배너 tagline만 영어였음 → `plan.th.json`에 태국어 help tagline 추가로 해결.

## E. Sitemap / F. IndexNow / G. hreflang — 정상(재구현·변경 없음)
- sitemap: th 164 전부 포함, canonical만, 404/redirect/noindex/중복 없음, lastmod 의도적 생략.
- IndexNow: 공용 수동 스크립트, 자동 과제출 없음, 변경 URL 타겟 제출 권장(코드 변경 불필요).
- hreflang `th` 자기참조 + 상호 + x-default, canonical(self)과 모순 없음.

## H. 내부링크 — 양호
- `/th/` crawlable `<a href="/th/...">` 다수 + breadcrumb + 푸터 언어링크(직전 배포).

## I. Content gaps(검색의도)
- 강함: 명소(92/18도시)·먹거리·플랜6종·시즌/주제 가이드·국적별 비자·K-culture.
- 상대공백(태국 검색의도): `เที่ยวเกาหลีด้วยตัวเอง`(자유여행 종합)·비용(`ทัวร์เกาหลี` 대비 개별)·`คอนเสิร์ตเกาหลี/งานเกาหลี`(공연·이벤트) 시의성 허브·도시별 미시 클러스터(`ที่เที่ยวโซล` 세분).

## J. 태국 검색 키워드(원칙)
- **검색량 미추측**(지침). 실쿼리 검증=GSC(Country=Thailand, Page contains /th/)·Bing 성과 데이터 필요(계정 데이터=사용자 열람). 특히 노출↑클릭↓·평균순위 8~30위·제목-쿼리 불일치 페이지를 성장후보로 분류.
- 사이트 자산 매핑: `เที่ยวเกาหลี`·`เที่ยวเกาหลีด้วยตัวเอง`·`เที่ยวโซล / ที่เที่ยวโซล`·`อาหารเกาหลี`·`ช้อปปิ้งเกาหลี`·`คาเฟ่เกาหลี`·`สนามบินอินชอน`·`รถไฟใต้ดินเกาหลี`·`คอนเสิร์ต KPOP`·`งานเกาหลี`.

## K. 수정된 파일
| 파일 | 변경 | 심각도 |
|---|---|---|
| `app/[locale]/plan/[slug]/page.jsx` | (공용) description=번역 가이드 metaDesc 우선 → `/th/plan/help/` 메타 영어누수 해결(이미 라이브) | HIGH |
| `data/plan.th.json` | `items.help.tagline`(태국어) 추가 → 배너 영어누수 해결 | HIGH |
| `THAILAND_SEO_REPORT.md` | 본 보고서 | — |

## L. 변경 전 / 후
- `/th/plan/help/` meta: `Who to call…`(EN) → `เบอร์ฉุกเฉินของเกาหลี (112 …)…`(197자 TH, 이미 라이브).
- `/th/plan/help/` 배너: 영어 → `เมื่อเกิดปัญหา ควรโทรหาใครและทำอย่างไร — บันทึกเบอร์ฉุกเฉินไว้ก่อนที่จะต้องใช้งานจริง`.

## M. 테스트 결과
- verify-i18n / verify-content-i18n: PASS ✓. 배포 후 `/th/plan/help/` 배너 태국어화 라이브 확인.

## N. 사람이 직접 해야 할 작업 / 결정
1. **[데이터]** GSC(Thailand·/th/)·Bing 쿼리/노출/CTR/순위 열람 → 성장후보 확정.
2. **[결정·경미]** 명소 상세 제목의 도시명 `Seoul`→`โซล` 등 태국어 통일 여부(전 명소 city 표기 일괄, 경미).
3. **[정보]** description 길이 양호 → **th는 대량 보강 불필요**.

---

## 지속 관리 규칙 (태국 — 프로젝트 표준)
- /th/ 신규 페이지: 자연스러운 태국어 title·description·h1, 정적 SSG, canonical(self)+hreflang(th) 동기화, 영어 폴백 누수 금지.
- Sitemap·IndexNow 재구현 금지. IndexNow는 변경 URL 중심.
- Google/Bing·타국 규칙 **무훼손·독립 유지**.
