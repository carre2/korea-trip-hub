# TAIWAN / 台灣 SEO AUDIT — Korea Trip Hub (ktriphub.com/zh-TW/)

> 작성: 2026-09-18 · 기준: 실제 코드 + 라이브(curl). **대만(/zh-TW/ 繁體)과 중국 본토(/zh/ 簡體)는 별개 시장으로 관리.**
> 지침: 단순 簡→繁 변환으로 취급 금지. Sitemap/IndexNow 재구현·URL 변경 금지. Yahoo Taiwan=Bing 인덱스 활용(별도 등록 불필요).

## ⚠️ 데이터 접근 한계
- 세션에서 **GSC/Bing 성과데이터 접근 불가**. "Country=Taiwan / Queries·CTR·Position", `/zh/가 대만 결과에 노출되는지` 등은 **회장님 GSC 열람 필요**. 검색량 미추측.

## A. 현재 상태
- 대만 진입 = **/zh-TW/**(繁體中文). Bing 색인 정상. **/zh/(簡體)와 별개 URL·별개 canonical·별개 hreflang.**

## B. 기술 SEO — 우수
| 항목 | 결과 |
|---|---|
| HTML lang | `<html lang="zh-TW">` ✅ |
| canonical | self(`/zh-TW/`) ✅ |
| hreflang | `hrefLang="zh-TW"` 자기참조 + `zh`(簡體) **별도 병존**, x-default(en). **zh-TW↔zh 충돌 없음**(서로 다른 alternate) ✅ |
| sitemap | zh-TW **164 포함** ✅ |
| JSON-LD/OG | 정상, og:locale **zh_TW** ✅ |
| H1/H2·breadcrumb·img alt·noindex | 정상 / 0 ✅ |

## C. 번체·대만 용어 진정성 — **양호(기계변환 아님)**
- **핵심 검증: 대만식 여행 용어 사용.** `/zh-TW/plan/transit/`에 **`計程車`(대만) 사용, `出租車`(본토) 0** → **簡體 zh를 자동 繁化한 것이 아니라 대만 어휘로 작성됨** ✅.
- 지명/제목 번체 자연스러움: `首爾`/`明洞`/`釜山`/`濟州島` 등, 비자 제목도 zh-TW 독립 작성(`[國家]護照去韓國要簽證嗎`, GSC 최대 유입원).
- **[관찰 권고]** 전 페이지의 대만식 용어 완전성(예: 網路 vs 網絡, 影片 vs 視頻, 捷運/地鐵 맥락)은 **표본상 양호**하나, 심화 콘텐츠 전수 용어감수는 콘텐츠 결정사항(§F).

## D. Metadata — 양호
- zh-TW description 누락 0. 제목/설명 번체 현지화. `/zh-TW/plan/help/` **메타는 공용 수정으로 번체(help.i18n zh-TW metaDesc)**, 배너 tagline 영어였음 → `plan.zh-TW.json`에 번체 help tagline 추가로 해결.

## E. 안전 수정(이번)
| 파일 | 변경 |
|---|---|
| `data/plan.zh-TW.json` | `items.help.tagline`(번체) 추가 → `/zh-TW/plan/help/` 배너 영어누수 해결 |

## F. 판단 / 권고
- **/zh-TW/는 이미 대만 시장에 적합**(繁體 + 대만 용어 + 별개 hreflang). 구조 변경 불필요.
- **성장은 대만 검색의도 정밀화**에서: 제목-쿼리 매칭(`韓國自由行`·`首爾自由行`·`韓國旅遊攻略`·`韓國快閃店`), 대만식 용어 심화 감수. 이는 **GSC 대만 쿼리 확인 후** 우선순위화(노출↑CTR↓·8~30위·제목불일치·`/zh/ 노출 잠식` 여부).

## G. 사람이 직접 해야 할 작업 / 결정
1. **[데이터]** GSC Country=Taiwan(/zh-TW/): 쿼리·CTR·순위 + **`/zh/`가 대만 결과에 노출되는지**(잠식 시 hreflang/콘텐츠 강화로 대응). 
2. **[결정]** 대만식 용어 전수 감수(심화 콘텐츠) 착수 여부 — 표본은 양호, 전수는 콘텐츠 작업.
3. **[정보]** zh-TW help 배너 이번 수정.

---
## 지속 관리 규칙 (대만)
- /zh-TW/ = **繁體 + 대만 용어**(計程車 등). 簡→繁 자동변환 금지, /zh/와 별개 시장.
- zh-TW·zh는 **별개 canonical·hreflang 유지**(충돌 금지). Sitemap/IndexNow·URL 무변경.
- Google/Bing(Yahoo TW 포함)·타국 규칙 무훼손·독립 유지.
