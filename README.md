# Korea Trip Hub

외국인 방한객용 **다국어 여행 허브**. AI 여행일정 · 검증된 여행준비 정보 · 음식/체험 · 후기 · K-culture.

- **스택:** Next.js 14 (App Router) · 정적 export · 경량 자체 i18n(기본 en, 20개 언어)
- **배포:** Cloudflare Pages (정적). 도메인 `ktriphub.com`. 자세한 건 [DEPLOY.md](./DEPLOY.md).

## ⚠️ 작업 규칙 — 반드시 먼저 읽기
이 저장소는 **하네스**로 운영됩니다. 여행정보를 지어내지 않고, 번역과 검색노출을 깨뜨리지 않기 위한 장치입니다.
1. [`HARNESS.md`](./HARNESS.md) — 사실검증 루프·금지 목록
2. [`data/facts.json`](./data/facts.json) — 사실 SSOT (VERIFIED만 렌더링)
3. [`TRANSLATION.md`](./TRANSLATION.md) — 20개 언어 번역 규칙·검증기
4. [`SEO.md`](./SEO.md) — canonical/hreflang·구조화 데이터 규칙·검증기
5. [`CLAUDE.md`](./CLAUDE.md) — Claude 작업 지침 (대화는 항상 한국어)

핵심: **facts.json에 VERIFIED로 없는 수치는 본문에 쓰지 않는다. 모르면 TODO로 남긴다.**

## 개발
```bash
npm install
npm run dev      # http://localhost:3000/en/
npm run build    # verify-i18n → out/ 정적 생성 → verify-seo (하나라도 FAIL이면 빌드 실패)
npm run verify:i18n   # 번역만 검사
npm run verify:seo    # 빌드된 out/의 SEO 검사
```

## 구조
```
app/[locale]/       # 언어별 페이지 (정적 생성)
components/         # Header, JsonLd 등
lib/i18n.js         # 로케일·번역 로더
lib/facts.js        # 검증된 fact만 반환
lib/seo.js          # canonical·hreflang·OG·JSON-LD (모든 페이지가 pageMeta 사용)
lib/routes.js       # 공개 URL의 단일 소스 (sitemap·검증기 공용)
lib/visa.js         # 비자 국가 레지스트리
messages/*.json     # UI 문자열 (20개 언어)
data/facts.json     # ★사실 SSOT
data/*.json         # 카테고리 콘텐츠
scripts/verify-*.mjs # 번역·SEO 검증기 (빌드 게이트)
public/_redirects   # 루트→/en/, Cloudflare
```

## 남은 일
- plan 6개 중 airport·sim·money·weather 딥다이브 (sim은 연결된 fact 0개)
- Getting Around 딥다이브 20개 언어 번역 · 비자면제 6개국 나머지 15개 언어
- og:image 브랜드 카드 (사이트 사진은 CC BY-SA라 공유 카드에 사용 불가 — SEO.md §4)
- 연동(Naver/Kakao 지도·SNS 공유·Spotify·kpophub 콘서트) — API 키 필요
