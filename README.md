# Korea Trip Hub

외국인 방한객용 **다국어 여행 허브**. AI 여행일정 · 검증된 여행준비 정보 · 음식/체험 · 후기 · K-culture.

- **스택:** Next.js 14 (App Router) · 정적 export · 경량 자체 i18n(기본 en, 20개 언어)
- **배포:** Cloudflare Pages (정적). 도메인 `ktriphub.com`. 자세한 건 [DEPLOY.md](./DEPLOY.md).

## ⚠️ 작업 규칙 — 반드시 먼저 읽기
이 저장소는 **사실검증 하네스**로 운영됩니다. 여행정보(가격·전화·주소·시간·규정)를 지어내지 않기 위한 장치입니다.
1. [`HARNESS.md`](./HARNESS.md) — 사실검증 루프·금지 목록
2. [`data/facts.json`](./data/facts.json) — 사실 SSOT (VERIFIED만 렌더링)
3. [`CLAUDE.md`](./CLAUDE.md) — Claude 작업 지침 (대화는 항상 한국어)

핵심: **facts.json에 VERIFIED로 없는 수치는 본문에 쓰지 않는다. 모르면 TODO로 남긴다.**

## 개발
```bash
npm install
npm run dev      # http://localhost:3000/en/
npm run build    # out/ 정적 생성
```

## 구조
```
app/[locale]/      # 언어별 페이지 (정적 생성)
components/         # Header 등
lib/i18n.js         # 로케일·번역 로더
lib/facts.js        # 검증된 fact만 반환
messages/*.json     # UI 문자열 (현재 en)
data/facts.json     # ★사실 SSOT
data/*.json         # 카테고리 콘텐츠
public/_redirects   # 루트→/en/, Cloudflare
```

## 남은 일
- 카테고리 실콘텐츠를 하네스 루프로 검증·채우기
- 20개 언어 번역
- 연동(Naver/Kakao 지도·SNS 공유·Spotify·kpophub 콘서트) — API 키 필요
