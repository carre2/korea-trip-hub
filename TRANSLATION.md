# TRANSLATION — Korea Trip Hub 번역 하네스

> 이 서비스는 20개 언어로 제공된다. **번역 품질은 정보의 정확성만큼 중요하다.**
> 번역이 숫자를 바꾸면 그건 사실 오류이고, 어색한 직역은 신뢰를 무너뜨린다.
> 그래서 사실 하네스([HARNESS.md](./HARNESS.md))처럼, 번역도 **고정 규칙 + 자동 검증기**로 감싼다.
>
> 재사용 스킬: `i18n-translate-verify` (kpophub 등 다른 사이트에도 동일 적용).

## 번역의 4대 원칙
1. **사실(숫자·날짜·전화·요금·URL·고유명사)은 언어 무관·불변.** K-ETA·KTX·T-money·1330·arex.or.kr·₩9,500 등은 번역해도 **그대로**. 숫자·도메인을 현지화하지 않는다.
2. **단어가 아니라 의미를 번역한다.** 자연스러운 원어민 표현. 직역 금지. (예: 日本語 対象になります→対象です)
3. **정보를 더하거나 빼지 않는다.** 특히 "공식에서 확인" 같은 주의문을 누락하지 않는다.
4. **키를 하나도 빠뜨리지 않는다.** 누락되면 그 문자열만 영어로 폴백되어 **혼용 페이지**가 된다(버그).

## 번역이 들어가는 위치
| 대상 | 위치 |
|---|---|
| UI 문자열 | `messages/<locale>.json` (en 구조를 그대로 미러) |
| 사실 설명문 | `messages/<locale>.json`의 `facts.<id>.claim` / `.notes` |
| 사실 값 라벨 | `messages/<locale>.json`의 `factLabels` |
| 사실 **값(숫자)** | `data/facts.json` — **언어 무관, 번역하지 않음** |
| 카테고리 본문 | (예정) `data/plan.<locale>.json` 등 per-locale 오버라이드 |

## 번역 루프 (한 번에 한 언어)
```
[1] 로드  → messages/en.json + data/facts.json + 이 문서(언어별 스타일)
[2] 초안  → messages/<locale>.json에 en의 모든 키를 자연스럽게 번역
[3] 사실  → 각 facts.<id>.claim에 영어 claim의 숫자·날짜·도메인을 그대로 유지
[4] 검증  → node scripts/verify-i18n.mjs <locale>  → [E] 전부 해결, [W] 검토
[5] 커밋  → i18n: add <locale> translation (verifier PASS)
```
> 한 번에 한 언어씩. 우선순위(방한객 기준): en(완료) → ja → zh → zh-TW → vi → th → id → 그 외.

## 검증기 — `scripts/verify-i18n.mjs`
```bash
npm run verify:i18n              # 전체
node scripts/verify-i18n.mjs ja  # 특정 언어
```
- **prebuild에 연결됨** → 오류가 있으면 `npm run build`(=배포)가 실패한다.
- 하드 오류(exit 1): 키 누락 · **사실 숫자/도메인 변조** · 플레이스홀더 깨짐 · 언어 누수(한글 유출)
- 경고(exit 0): 미번역 의심(원문과 동일 — 브랜드명은 정상) · 잉여 키

## 언어별 스타일 메모 (계속 보강)
- **ja:** 간결·자연스러운 상용체. 딱딱한 직역 금지(対象になります→対象です).
- **zh / zh-TW:** 간체·번체는 **별도 로케일**. 섞지 말 것.
- **ar:** RTL. `lib/i18n.js`의 `rtlLocales`에 포함되어 `<html dir>`가 뒤집히는지 확인.
- 브랜드명(KoreaTripHub)은 번역하지 않음.

## 현재 상태
- **en**: 기준 언어, 100% (사실 설명문도 영어로 정리 완료 — 한글 누수 0 검증됨)
- **그 외 19개**: 미번역(영어 폴백). 위 루프로 언어별 채운다.
