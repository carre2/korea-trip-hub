# DEPLOY — Korea Trip Hub

정적 사이트(Next.js `output: "export"`)를 **Cloudflare Pages**에 올리고 **ktriphub.com**을 연결하는 순서.
kpophub와 동일한 정적 배포 방식.

빌드 결과: `out/` 폴더 (정적 HTML). Cloudflare Pages 설정:
- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Framework preset:** None (또는 "Next.js (Static HTML Export)")
- **Node version:** 20 이상 (환경변수 `NODE_VERSION=20` 권장)

---

## 1) GitHub에 올리기

GitHub에서 새 저장소 생성 (예: `carre2/korea-trip-hub`, **빈 저장소**로 — README 체크 해제).
그다음 로컬에서:

```bash
cd /c/Users/minho/Projects/korea-trip-hub
git branch -M main
git remote add origin https://github.com/carre2/korea-trip-hub.git
git push -u origin main
```

> 이미 로컬 커밋은 되어 있음. 위 명령은 원격 연결 + 업로드.

---

## 2) Cloudflare Pages 연결 (자동 배포)

1. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git**
2. `carre2/korea-trip-hub` 선택
3. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `out`
   - (Environment variables) `NODE_VERSION` = `20`
4. **Save and Deploy** → 몇 분 뒤 임시주소 **`https://korea-trip-hub.pages.dev`** 생성
5. 이후 `git push` 할 때마다 자동 재배포

CLI로 하려면(선택):
```bash
npm run build
npx wrangler pages deploy out --project-name korea-trip-hub
```

---

## 3) 도메인 연결 — ktriphub.com

**권장: 네임서버를 Cloudflare로 이전** (자동 HTTPS·리다이렉트 규칙까지 한 곳에서 관리)

1. Cloudflare 대시보드 → **Add a site → `ktriphub.com`** → Free 플랜
2. Cloudflare가 알려주는 **네임서버 2개** (예: `xxx.ns.cloudflare.com`) 복사
3. 도메인 등록기관 관리화면 → **"네임서버 변경"** → Cloudflare가 준 2개로 교체, 저장
   - ⚠️ 등록기관의 **"포워딩 관리"는 사용하지 않음** (사이트를 직접 서빙할 것이므로)
4. 전파(수십 분~수 시간) 후, Cloudflare → **Pages 프로젝트 → Custom domains → `ktriphub.com` 추가**
   - `www.ktriphub.com` → `ktriphub.com` 리다이렉트도 추가 권장
5. HTTPS 인증서는 Cloudflare가 자동 발급

> 네임서버 이전이 부담되면: 등록기관 DNS에 `CNAME`으로 `korea-trip-hub.pages.dev`를 가리키는 방식도 가능하나(루트도메인은 등록기관이 CNAME flattening 지원해야 함), **네임서버 이전이 가장 확실**.

---

## 4) (나중에) ktrip.kr 리다이렉트

`.kr`을 추가 구매하면:
1. Cloudflare에 `ktrip.kr`도 사이트 추가(네임서버 이전)
2. **Rules → Redirect Rules**: `ktrip.kr/*` → `https://ktriphub.com/$1` (**301 영구**)
3. 검색엔진 신뢰도가 `.com`으로 이관됨. 별도 호스팅 불필요.

---

## 체크
- [ ] `npm run build` 로컬 성공 (out/ 생성)
- [ ] GitHub push 완료
- [ ] Pages 임시주소에서 사이트 확인
- [ ] ktriphub.com 네임서버 이전 → Custom domain 연결
- [ ] HTTPS 자동 적용 확인
