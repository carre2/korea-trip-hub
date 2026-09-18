# PHILIPPINES SEO / 시장 전략 AUDIT — Korea Trip Hub (ktriphub.com/en/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브(curl). **/tl/(Filipino) locale 즉시 생성 금지 → /en/ 우선.**
> 방식: AUDIT → 데이터 → 안전수정 → 보고. **URL/Sitemap/IndexNow 무변경.** 국가별 독립 규칙.

## ⚠️ 데이터 접근 한계
- 세션에서 **GSC/Bing 성과데이터 접근 불가**. "Country=Philippines / Queries·Clicks·Impressions·CTR·Position" 및 **영어 vs Filipino/Tagalog 비중**은 **회장님 GSC 열람 필요**. 검색량 미추측.

## A. 현재 상태
- 필리핀 진입 = **/en/**(영어). Bing `/en/` 색인 정상. **/tl/ 등 Filipino locale 없음**(미빌드).
- 필리핀은 **영어 검색 우세 시장**(영어 공용어) → /en/이 자연스러운 1차 타깃.

## B. 기술 SEO(/en/) — 우수
- html lang=en, canonical self, hreflang en=x-default+11로케일, JSON-LD·OG, 정적 SSG, noindex 0.

## C. 필리핀 검색의도 대비 충족도
| 의도 | 충족 | 비고 |
|---|---|---|
| 필리핀인 한국 비자 | ✅ **강함** | `/en/visa/philippines/`(`Philippines to Korea Visa: Do You Need One? (2026)`, 필요·무료, 관할·서류·자금·FAQ) |
| PHP ↔ KRW 비용 | ⚠️→✅ **이번 수정** | FxRates에 **PHP 없었음** → **추가**(100 PHP ↔ ₩ 실시간) |
| Manila→Seoul·"from Philippines" 비용 | ❌ 없음 | 마닐라 출발/PHP 예산 전용 콘텐츠 부재 |
| 일정·계절·SIM/eSIM·교통·결제·쇼핑·음식·K-pop | ✅ 강함 | itinerary·plan6종·kpop |
| 첫여행/예산 세그먼트 | 🟡 | 범용 일정 있음, 필리핀 관점 전용 없음 |

## D. hreflang/canonical/sitemap — 정상 (변경 없음)

## E. 안전 수정(이번)
| 파일 | 변경 | 심각도 |
|---|---|---|
| `components/FxRates.jsx` | **PHP 추가**(`{code:"PHP",unit:100}`) → money 페이지에서 **100 PHP ↔ ₩ 실시간**. er-api 피드에 PHP 존재, 누락가드 있음, i18n 무관. | MEDIUM |
| `data/topics.json` | **신규 가이드 `/en/guides/korea-from-philippines/`** — 필리핀 여행객용 계획 허브(비자[무료]·마닐라 항공·예산·SIM·교통·음식·일정을 우리 검증 페이지로 내부링크). **facts-harness 준수: 가격 미기재**. FAQPage+Article JSON-LD 자동. 커밋 8d9df9b | HIGH |

**→ §F 권고 B의 첫 실행분(필리핀 특화 영어 콘텐츠) 완료.** 다음: Manila 항공·비자 무료 강조·예산 세그먼트.

## F. 판단: A/B/C/D
### 권고: **B — 영어 유지 + 필리핀 특화(영어) 콘텐츠** *(잠정, GSC 확인 전제)*
- 필리핀 아웃바운드 여행 리서치는 **영어 검색 우세**(Filipino/Tagalog는 국제여행 계획 쿼리 비중 낮음, 일반적). 후보도 대부분 영어(`Korea visa for Filipinos`, `Korea trip from Manila`).
- 이미 비자 플래그십 강함 + PHP 추가 → **B(마닐라 출발 비용·예산·비자 강화·필리핀 FAQ)** 가 최적. **/tl/(D)는 시기상조**.

| 옵션 | 채택 조건(=GSC 확인) |
|---|---|
| A 영어만 | GSC PH가 영어 100% 근접·성장여지 낮을 때 |
| **B 영어+PH특화(영어)** ⭐ | 대개 최적. GSC PH 영어 우세 확인 시 확정 |
| C 일부 Filipino | GSC PH에 의미있는 Tagalog 쿼리·노출 잡힐 때 |
| D /tl/ locale | Tagalog 검색수요가 크고 지속적일 때만(대공사). 현시점 시기상조 |

**결론:** **B 권고, /tl/ 보류.** 확정은 GSC(Country=Philippines) 쿼리 언어 분포 필요 → 회장님 열람.

## G. 성장 후보(영어, B 실행 시) — 검색량 미추측
- `Korea trip from Philippines / from Manila`(PHP 예산·마닐라 직항·비자 요건 통합).
- 비자 강화(`/en/visa/philippines/`에 필리핀 특화 FAQ·자금증빙·무료수수료 강조).
- 첫여행/예산 세그먼트 일정(기존 재활용 + PH 관점 메타).

## H. 사람이 직접 해야 할 작업 / 결정
1. **[데이터]** GSC Country=Philippines(/en/) + **영어 vs Tagalog 비중** 열람 → A/B/C/D 확정, 성장후보 분류.
2. **[결정]** 권고 **B** 채택 여부. **/tl/(D)는 데이터 확인 전 보류.**
3. **[정보]** PHP 환산 이번 추가(배포 후 라이브 확인).

---

## 지속 관리 규칙 (필리핀)
- **/en/ 중심**. /tl/는 **GSC Tagalog 수요 근거 확보 전 신설 금지**.
- PH 특화는 영어로 /en/ 하위 확장(비용·비자·예산·FAQ). 통화 PHP 반영됨.
- URL/Sitemap/IndexNow 무변경. Google/Bing·타국 규칙 무훼손·독립 유지.
