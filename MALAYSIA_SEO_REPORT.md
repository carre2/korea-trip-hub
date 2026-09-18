# MALAYSIA SEO AUDIT — Korea Trip Hub (ktriphub.com/ms/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브(curl, /ms/ 164 URL 전수, ms vs en/id 대조)
> 목적: **Bing "Discovered but not crawled"(/ms/만 미색인) 원인 규명.** 다른 로케일(/ja/·/id/·/th/·/en/)은 "Indexed successfully".
> 지침: **문제가 확인되지 않으면 억지로 코드 수정 안 함. Sitemap/IndexNow 재구현 금지.**

## 결론 (요약)
**/ms/에 기술적 색인 차단 요인은 없다.** 전 항목 정상 → "Discovered but not crawled"는 **Bing의 크롤 예산·우선순위·타이밍** 문제(정상 상태, 시간이 지나며 해소되는 유형)이며, **코드 결함이 아니다.** 억지 수정하지 않음(지침 준수). 안전한 촉진책만 제시(§조치).

## 1~13. 기술 감사 — 전부 정상
| # | 항목 | 결과 |
|---|---|---|
| 1 | HTTP | `/ms/`·하위 **200** ✅ |
| 2 | robots/noindex | robots 전체 Allow, **noindex 0** ✅ |
| 3 | canonical | **self-referencing**(`/ms/`→`/ms/`), **타 로케일 안 가리킴** ✅ (핵심: canonical 오설정 아님) |
| 4 | hreflang | `hrefLang="ms"` 자기참조 + 상호(en/id 포함) ✅ |
| 5 | HTML lang | `<html lang="ms">` ✅ |
| 6 | sitemap | **ms 164 전부 포함** ✅ / lastmod 없음(전 로케일 공통, 의도적) |
| 7 | IndexNow | 공용 스크립트가 sitemap 전량(ms 포함) 제출 대상 ✅(재구현 없음) |
| 8 | 내부링크/depth | `/ms/` 내부 crawlable `<a>` + **푸터 언어링크(직전 배포)로 /ms/ 링크 유입 강화** ✅ |
| 9 | redirect | **없음(200 직접)** ✅ |
| 10 | Bingbot 접근 | Bingbot UA **200, 82KB 전체 HTML** ✅ |
| 11 | 콘텐츠 언어 | **진짜 Bahasa Melayu**(영어폴백 아님): `Rancang perjalanan ke Korea dalam bahasa anda` 등 ✅ |
| 12 | title/desc | 말레이어 현지화, 누락 0 ✅ |
| 13 | JSON-LD/OG | 정상, og:locale ms_MY ✅ |

## 14. /ms/ vs /id/·/en/ 콘텐츠 고유성(핵심 진단)
전수 대조(164):
- **ms == en(영어누수): 0** → thin/영어폴백 아님.
- **ms == id(동일): 0** → 인니어 복붙 아님. **독립 번역**(예: ms `serba lengkap`·`sistem subway`·`dikumpulkan mengikut bandar` vs id `serba ada`·`kereta bawah tanahnya`·`dikelompokkan per kota`).
- **ms~id 토큰겹침 ≥0.6: 124/164(76%)** → **말레이어와 인니어는 본질적으로 어휘가 매우 유사**(불가피). 이 유사성이 Bing의 "추가가치 인식"을 낮춰 /id/ 우선 색인 뒤 /ms/를 **후순위**로 미뤘을 가능성은 있으나, **콘텐츠는 정당하게 구별되는 별개 언어**이며 인위적으로 덜 비슷하게 만들 수 없음(만들면 부자연). **→ 결함 아님.**

## 원인 판정
- **기술 차단: 없음.** Bing "Live URL: can be indexed, no issues"와 일치.
- **실제 원인 = 크롤 예산/우선순위 + 타이밍**(discovered 2026-08-06 후 크롤 대기). ms↔id 언어 유사성이 후순위화에 일부 기여했을 수 있으나 수정 대상 아님.
- **우리가 이미 한 올바른 신호:** 정확한 hreflang(ms 자기참조 + id 형제) + 별개 `lang="ms"` → Bing이 /ms/를 /id/의 중복이 아닌 **별개 언어판**으로 이해하게 함.

## 조치 (코드 수정 아님 — 사용자/운영)
1. **[사용자·권장] Bing WMT → URL Inspection(/ms/ 대표 URL) → "Request indexing"** 또는 sitemap 재제출로 크롤 우선순위 상향.
2. **[사용자·선택] IndexNow로 /ms/ URL 타겟 재제출**: `node scripts/indexnow.mjs https://ktriphub.com/ms/ ...`(기존 스크립트, 재구현 없음).
3. **[완료] 푸터 크롤 링크**로 /ms/ 내부 링크 유입 강화(직전 배포).
4. **[관찰] 시간 경과**: 크롤 예산형은 대개 수 주 내 자연 색인. 재점검 권장.

## 부수 품질 수정(크롤과 무관, 일관성)
- `/ms/plan/help/` **배너 tagline 영어누수** → `plan.ms.json`에 말레이어 help tagline 추가(메타는 이미 공용 수정으로 말레이어). ja/id/th/zh-TW와 동일 보정.

## 사람이 직접 해야 할 작업
1. **[데이터]** GSC Country=Malaysia: **/ms/ vs /en/** 성과 비교 → 말레이시아 사용자가 실제 어느 언어 페이지로 유입되는지(말레이시아는 영어 검색도 강함). 
2. **[운영]** Bing WMT 색인 요청(위 조치 1).

---
## 지속 관리 규칙 (말레이시아)
- /ms/는 기술 정상 → **강제 수정 금지**. 색인 지연은 Bing 크롤 요청+시간으로 대응.
- ms 콘텐츠는 **id와 별개 유지**(자연스러운 말레이어), 영어폴백 누수 금지.
- Google/Bing·타국 규칙 무훼손·독립 유지.
