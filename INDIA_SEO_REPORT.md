# INDIA SEO / 시장 전략 AUDIT — Korea Trip Hub (ktriphub.com/en/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브(curl). **핵심 질문 = "/hi/ 힌디 locale을 만들 것인가"** → 지침대로 **즉시 만들지 않고 데이터로 판단**.
> 방식: AUDIT → 데이터 → 안전수정 → 보고. **URL/Sitemap/IndexNow 무변경·재구현 금지.** 국가별 독립 규칙.

## ⚠️ 데이터 접근 한계 (먼저 명시)
- 이 세션은 **GSC/Bing 성과 데이터에 접근 불가**(커넥터 인증 불가). 지침의 "Country=India / Queries·Clicks·Impressions·CTR·Position"과 **영어 vs 힌디 검색 비중**은 **회장님 GSC 열람이 필요**합니다.
- 아래는 **실측 가능한 기술·콘텐츠 감사 + 시장 일반지식 기반 권고**이며, GSC 의존 항목은 명확히 표기합니다. **검색량은 추측하지 않습니다.**

## A. 현재 상태 (실측)
- **/hi/ 미존재**: 라이브 `https://ktriphub.com/hi/` = **404**. `lib/i18n.js` 빌드 로케일 12개(en·zh·zh-TW·ja·vi·th·id·es·ms·ko·ru·fr)에 **hi 없음**. `messages/hi.json`은 repo에 있으나 **미빌드**.
- 인도 대상 기본 진입 = **/en/** (영어). Bing `/en/` 색인·이슈 없음(사용자 제공).

## B. 기술 SEO(/en/) — 우수
- html lang="en", canonical self, hreflang **en=x-default**+11로케일 상호, JSON-LD·OG 정상, 정적 SSG, noindex 0. (앞선 감사들과 동일 구조, 인도 특이 문제 없음.)

## C. 인도 검색의도 대비 /en/ 콘텐츠 충족도
| 인도 검색의도 | 현재 충족 | 비고 |
|---|---|---|
| 인도인 한국 비자 | ✅ **강함** | `/en/visa/india/` 플래그십(제목 `India to Korea Visa: Do You Need One? (2026)`, C-3-9 90일, 관할·서류·자금·거절대처·FAQ) |
| INR ↔ KRW | ⚠️→✅ **이번 수정** | money 페이지 FxRates에 **INR 없었음** → **추가함**(실시간 환율) |
| 채식/비건·인도음식 접근성 | 🟡 **부분** | food에 "Halal & vegetarian" 섹션(이태원 할랄·사찰음식·채식 성장) 있으나 **인도 특화 전용 가이드는 없음** |
| 서울/부산/제주 일정 | ✅ 강함 | itinerary·destinations(92곳/18도시) |
| SIM/eSIM·교통카드·결제·날씨/의류 | ✅ 강함 | plan 6종 딥다이브 |
| 인도 출발 비용/항공편 | ❌ **없음** | "from India" 전용 콘텐츠(비용 INR·델리/뭄바이 항공) 부재 |
| K-pop/K-drama 여행 | ✅ | /en/kpop/ + K-culture |
| 인도 여행객 FAQ | 🟡 | 범용 FAQ는 있으나 인도 특화 묶음 없음 |

## D. hreflang / canonical / sitemap — 정상
- en 페이지 self-canonical + hreflang x-default(en). sitemap에 en 164 포함. **인도 관련 구조 문제 없음.** (URL 변경·재구현 없음.)

## E. 안전 수정(이번 실행)
| 파일 | 변경 | 심각도 |
|---|---|---|
| `components/FxRates.jsx` | 통화 목록에 **INR 추가**(`{code:"INR",unit:100}`) → money 페이지에서 **100 INR ↔ ₩ 실시간 환산** 표시. 라이브 API(er-api)에 INR 존재, 누락 시 자동 숨김 가드 있음. i18n 무관. | MEDIUM |
| `data/topics.json` | **신규 가이드 `/en/guides/korea-from-india/`** — 인도 여행객용 계획 허브(비자·예산 프레임워크·항공·채식/할랄음식·SIM·교통·일정을 우리 검증 페이지로 내부링크). **facts-harness 준수: 가격 미기재**, 실제 숫자는 flight tool·money 페이지(INR)로 유도. FAQPage+Article JSON-LD 자동. 커밋 8d9df9b | HIGH |
| `lib/linkify.jsx` | 가이드 본문에서 `[라벨](/경로/)` **내부 마크다운 링크** 지원(로케일 자동 prefix, 하위호환). | LOW |

**→ §F 권고 B의 첫 실행분(인도 특화 영어 콘텐츠) 완료.** 다음 확장 후보: 비자 페이지 인도 FAQ 보강, 예산/첫여행 세그먼트 일정.

## F. 핵심 판단: 영어 중심 vs 힌디 추가 (A/B/C/D)

### 권고: **B — 영어 유지 + 인도 특화 (영어) 콘텐츠** *(잠정, GSC 확인 전제)*

**근거(관찰 가능 사실 + 시장 일반지식, 추측 통계 없음):**
1. **한국행 인도 아웃바운드 = 영어 검색 우세 demographic**: 국제선 여행 리서치를 하는 인도 도시권 여행자는 영어로 검색하는 비중이 높고, 한국 등 해외여행 계획 쿼리에서 힌디어 사용은 상대적으로 낮음(일반적 시장 특성). 후보 검색어도 대부분 영어(`Korea visa for Indians`, `Korea trip from India`).
2. **이미 영어로 인도 핵심의도 상당 충족**(비자 플래그십·플랜·K-culture) + 이번 INR 추가.
3. **/hi/ 완전 신설(D)은 164페이지×번역의 대공사** → **불확실한 힌디 검색수요에 선투자하는 리스크**.

### 옵션별 필요 데이터 / 조건
| 옵션 | 내용 | 채택 조건(=회장님 GSC 확인) |
|---|---|---|
| **A. 영어만 유지** | 추가 콘텐츠 없이 현행 | GSC India 쿼리가 이미 영어 100%에 가깝고 성장여지 낮을 때 |
| **B. 영어 + 인도 특화(영어)** ⭐권고 | "Korea from India" 비용(INR)·인도인 비자(강화)·채식/인도음식 가이드·항공·인도 FAQ | 대부분의 경우 최적. GSC India 쿼리가 **영어 우세**면 확정 |
| **C. 영어 + 일부 힌디** | 최상위 유입 페이지(비자·비용·채식) 몇 개만 힌디 | GSC India에 **의미있는 힌디 쿼리·노출**이 잡힐 때 |
| **D. 완전한 /hi/** | 전 사이트 힌디 locale | 힌디 검색수요가 크고 지속적일 때만(대공사). **현시점 시기상조** |

**결론:** 지금은 **B로 진행 권고**. **/hi/(D)는 보류.** 단 A/C/D의 확정은 **GSC(Country=India) 쿼리 언어 분포**가 있어야 하며, 그 데이터는 **회장님만 열람 가능** → §H 결정 대기.

## G. 인도 성장 후보(영어, B 실행 시 우선순위) — 검색량 미추측
- **`Korea trip from India` / `Korea trip cost from India`**: 인도 출발 관점 비용 가이드(INR 기준, 항공·비자·1일 예산 범위는 하네스로 "확인" 라벨). 
- **비자 강화**: `/en/visa/india/`에 인도 특화 FAQ·자금증빙·항공권 첨부 팁 확장(이미 강함, 미세 보강).
- **채식/인도음식 가이드**: `Vegetarian & Indian food in Korea`(이태원 할랄·사찰음식·채식 앱·한식 중 채식가능 메뉴) — India 고유 intent.
- **인도 여행객 FAQ 허브**: 비자·채식·결제(UPI 불가·카드)·SIM·날씨/의류.
- 모두 **영어**로 /en/ 하위 신규 페이지(URL 불변, 기존 구조 재사용).

## H. 사람이 직접 해야 할 작업 / 결정
1. **[데이터·필수]** GSC **Country=India**: Queries·Pages·Clicks·Impressions·CTR·Position + **쿼리 언어(영어 vs 힌디) 비중**. 노출↑클릭↓·평균순위 8~30위·India 특이 쿼리·제목불일치 페이지 분류. → **A/B/C/D 확정 근거**.
2. **[결정]** 위 권고(**B**) 채택 여부. 채택 시 §G 콘텐츠를 순차 제작(영어). **/hi/(D)는 데이터 확인 전까지 보류.**
3. **[정보]** INR 환산은 이번에 추가됨(배포 후 라이브 확인).

---

## 지속 관리 규칙 (인도 — 프로젝트 표준)
- 인도는 **/en/ 중심**. 힌디(/hi/)는 **GSC 힌디 검색수요 근거 확보 전 신설 금지**.
- 인도 특화는 **영어 콘텐츠**로 /en/ 하위 확장(비용·비자·채식·항공·FAQ), URL·Sitemap·IndexNow 무변경.
- 통화·현지정보는 인도 방문객 관점 반영(INR 등).
- Google/Bing·타국 규칙 **무훼손·독립 유지**.
