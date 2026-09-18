# SINGAPORE SEO / 시장 전략 AUDIT — Korea Trip Hub (ktriphub.com/en/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브(curl). **별도 locale 임의 생성 금지 → /en/ 우선 활용.**
> 방식: AUDIT → 데이터 → 안전수정 → 보고. **URL/Sitemap/IndexNow 무변경.** 국가별 독립 규칙.

## ⚠️ 데이터 접근 한계
- 세션에서 **GSC/Bing 성과데이터 접근 불가**. 지침의 "Country=Singapore / Queries·Clicks·Impressions·CTR·Position"은 **회장님 GSC 열람 필요**. 검색량은 추측하지 않음.

## A. 현재 상태
- 싱가포르 진입 = **/en/**(영어). Bing `/en/` 색인 정상. 별도 SG locale **없음(불필요)**.
- 싱가포르는 **영어가 공용·검색 주언어** → /en/이 자연스러운 1차 타깃. **중국계 싱가포르인**은 기존 **/zh/(간체)**로도 커버됨(신규 locale 불필요).

## B. 기술 SEO(/en/) — 우수
- html lang=en, canonical self, hreflang en=x-default+11로케일, JSON-LD·OG, 정적 SSG, noindex 0. (전 로케일 공통 우수 구조.)

## C. 싱가포르 검색의도 대비 충족도
| 의도 | 충족 | 비고 |
|---|---|---|
| SGD ↔ KRW 비용 | ✅ **이미 지원** | money 페이지 FxRates에 **SGD 포함**(실시간) |
| 비자(싱가포르) | ✅ | `/en/visa/singapore/`(무비자, `Singapore to Korea: Do You Need a Visa? (2026)`) |
| 일정(서울/부산/제주)·계절·SIM/eSIM·교통·결제·쇼핑·음식·K-pop | ✅ 강함 | itinerary·destinations·plan6종·kpop |
| Singapore→Korea 항공·"from Singapore" 비용 | ❌ 없음 | Changi 출발/SGD 예산 전용 콘텐츠 부재 |
| 가족/커플/첫여행 앵글 | 🟡 | 범용 일정은 있으나 세그먼트 전용 없음 |

## D. hreflang/canonical/sitemap — 정상 (변경 없음)

## E. 안전 수정(이번)
- SGD는 이미 FxRates에 존재(추가 불필요).
- **신규 가이드 `/en/guides/korea-from-singapore/`** 추가 — 싱가포르 여행객용 계획 허브(무비자 안내·Changi 항공·SGD 예산·SIM·교통·일정을 우리 검증 페이지로 내부링크, facts-harness 준수 가격 미기재, FAQPage+Article JSON-LD). 커밋 6adebeb. **→ §F 권고 B(약)의 실행분.**

## F. 판단: A/B/C/D
### 권고: **B(약) — 영어 유지 + 싱가포르 특화(영어) 소량** *(잠정, GSC 확인 전제)*
- 싱가포르는 **영어 검색 절대우세** → **별도 locale(C/D) 불필요**(중국계는 /zh/ 커버). 
- **A(영어만)**도 유효하나, 성장 여지는 **"Korea from Singapore" 앵글의 영어 콘텐츠**(SGD 예산·Changi 직항·주말 3박 일정·커플/가족)에서 나옴 → **B(약) 권고**.
- 확정은 GSC(Country=Singapore, Page contains /en/) 쿼리·노출·순위 확인 후(노출↑클릭↓·8~30위·제목불일치 분류).

| 옵션 | 채택 조건 |
|---|---|
| A 영어만 | GSC SG가 이미 영어 충족·성장여지 낮을 때 |
| **B 영어+SG특화(영어)** ⭐ | 대개 최적(SGD예산·Changi·세그먼트 앵글) |
| C 일부 타언어 | 불필요(중국계=기존 /zh/) |
| D 신규 locale | **불필요**(싱가포르 언어수요 없음) |

## G. 성장 후보(영어, B 실행 시) — 검색량 미추측
- `Korea trip from Singapore` / `Korea itinerary from Singapore`(SGD 예산·Changi 직항·주말/샌드위치 연휴 3~4박).
- 계절별 서울/부산/제주 일정, 커플·가족·첫여행 세그먼트 앵글(기존 일정 재활용+SG 관점 메타).

## H. 사람이 직접 해야 할 작업 / 결정
1. **[데이터]** GSC Country=Singapore(/en/) 성과 열람 → 성장후보 확정.
2. **[결정]** 권고 **B(약)** 채택 여부. **신규 locale은 불필요**(권고 D 아님).

---

## 지속 관리 규칙 (싱가포르)
- **/en/ 중심 + (중국계) 기존 /zh/**. 신규 SG locale 생성 금지.
- SG 특화는 영어로 /en/ 하위 확장(SGD·Changi·세그먼트). URL/Sitemap/IndexNow 무변경.
- Google/Bing·타국 규칙 무훼손·독립 유지.
