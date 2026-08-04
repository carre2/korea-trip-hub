# SEO — Korea Trip Hub SEO 하네스

> 이 사이트의 가치는 **20개 언어 × 660페이지**의 검증된 콘텐츠다.
> 그런데 메타데이터 한 줄이 잘못되면 그 전부가 검색에서 사라진다. 실제로 그랬다.
> 그래서 사실([HARNESS.md](./HARNESS.md))·번역([TRANSLATION.md](./TRANSLATION.md))과 똑같이,
> SEO도 **고정 규칙 + 자동 검증기 + 빌드 게이트**로 감싼다.

---

## 0. 이 문서가 생긴 이유 (실제 사고)

`app/[locale]/layout.jsx`가 `alternates: { canonical: .../{locale}/ }`를 선언했다.
Next.js는 **자식 페이지가 `alternates`를 지정하지 않으면 부모 것을 그대로 상속**한다.
결과: 660개 URL 중 **640개**가 이렇게 나갔다.

```html
<!-- out/ja/visa/india/index.html 이 자기를 홈의 복제본이라고 선언 -->
<link rel="canonical" href="https://ktriphub.com/ja/" />
<link rel="alternate" hrefLang="ko" href="https://ktriphub.com/ko/" />   <!-- 한국어 인도비자 페이지가 아니라 한국어 홈 -->
```

**소스만 보면 멀쩡해 보였다.** 그래서 검증기는 소스가 아니라 **빌드 산출물(`out/`)** 을 읽는다.

---

## 1. 절대 규칙 (THE LAW)

1. **모든 페이지는 자기 자신을 가리키는 canonical을 갖는다.** 레이아웃에 canonical을 두지 않는다.
2. **hreflang은 페이지 단위다.** 20개 로케일 + `x-default`, 전부 **같은 경로**를 가리켜야 한다.
3. **레이아웃에는 `metadataBase`만.** 나머지 메타데이터는 각 페이지가 `lib/seo.js`의 `pageMeta()`로 만든다.
4. **URL 목록은 `lib/routes.js` 한 곳에서 파생한다.** sitemap을 손으로 관리하지 않는다.
5. **title·description은 페이지 언어로 쓴다.** 로케일 페이지에 영어 메타가 나가면 그 언어권 검색에서 죽는다.
6. **구조화 데이터(JSON-LD)는 페이지에 실제로 있는 것만 기술한다.** 평점·가격·날짜를 지어내지 않는다 (HARNESS와 동일).
7. **없는 이미지를 참조하지 않는다.** `og:image`는 빌드에 실재하는 파일이어야 한다.

---

## 2. 코드 구조

| 파일 | 역할 |
|---|---|
| `lib/seo.js` | `pageMeta()`(canonical·hreflang·OG·Twitter), JSON-LD 빌더(`webSiteLd`/`breadcrumbLd`/`faqLd`/`articleLd`) |
| `lib/routes.js` | 모든 공개 경로의 단일 소스 — `app/sitemap.js`와 검증기가 함께 쓴다 |
| `lib/visa.js` | 비자 국가 레지스트리(라우팅·sitemap·검증기 공용) |
| `components/JsonLd.jsx` | JSON-LD 렌더러 (`<` 이스케이프로 스크립트 조기종료 차단) |
| `scripts/verify-seo.mjs` | **빌드 산출물 검사기** |

새 페이지를 만들 때:
```js
export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  return pageMeta({ locale, path: "my/route", title: m.some.translatedTitle, description: m.some.translatedSub });
}
```
그리고 `lib/routes.js`의 `pagePaths()`에 경로를 추가한다. 빼먹으면 검증기가 sitemap 불일치로 **빌드를 실패시킨다.**

---

## 3. 검증기 — `scripts/verify-seo.mjs`

```bash
npm run build         # prebuild(i18n) → next build → postbuild(SEO). 하나라도 실패하면 배포 안 됨
npm run verify:seo    # 빌드 후 단독 실행
```

**하드 오류(exit 1 — 빌드 실패):**
- canonical 없음 / 2개 이상 / 자기 자신을 가리키지 않음 ← *640-URL 사고 재발 방지*
- hreflang 누락, 다른 경로를 가리킴, 자기 자신 미포함, 대상 페이지가 빌드에 없음
- sitemap ↔ 빌드 결과 불일치 (누락 URL / 유령 URL)
- `<title>` 또는 description 없음/빈값
- 같은 로케일 안에서 title 중복 (템플릿 미치환)
- **로케일 홈**의 title이 영어와 동일 (메타 번역 회귀)
- `<html lang>` 불일치, RTL 로케일에 `dir="rtl"` 없음
- `og:image`/`twitter:image`가 빌드에 없는 파일을 가리킴
- JSON-LD 파싱 실패 또는 `@context`/`@type` 없음
- robots.txt에 `Sitemap:` 줄 없음

**경고(exit 0 — 백로그):**
- `og:image` 없음
- title이 영어와 동일한 하위 페이지 (해당 언어 콘텐츠 미번역 — 로케일별 개수로 리포트)
- title/description 길이가 일반적인 SERP 범위를 벗어남

> 검증기 자체도 시험했다: `out/`의 canonical을 홈으로 되돌리고, hreflang을 홈으로 바꾸고,
> 없는 og:image를 넣었을 때 **각각 FAIL**을 냈다. 잡지 못하는 검증기는 없느니만 못하다.

---

## 4. 현재 남은 SEO 백로그

- [ ] **og:image (660페이지 전부 없음)** — 사이트 사진은 CC BY-SA라 크레딧 표기가 불가능한 공유 카드에 못 쓴다(`public/img/CREDITS.md` 규칙). 자체 제작 브랜드 카드가 필요하다.
      `next/og`로 빌드 타임 생성은 Windows에서 `@vercel/og` 폰트 경로 오류(`TypeError: Invalid URL`)로 실패 → 미해결.
- [ ] **메타 미번역 167페이지** — 대부분 비자면제 6개국 가이드(ja/ko/zh/zh-TW/es 5개 언어만 번역됨). 나머지 15개 언어 번역이 곧 SEO 개선이다.
- [ ] title 70자 초과 145페이지 — 주로 비자 가이드 제목. 검색결과에서 잘린다.
- [ ] `robots.js`의 `host` 필드는 비표준(Yandex 전용) — 무해하지만 정리 대상.

---

## 5. 커밋 접두어
`seo:` — 메타데이터·구조화 데이터·sitemap·검증기 변경.
