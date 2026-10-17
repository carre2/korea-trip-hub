# 광고 도착·GA4 측정 운영

2026-10-17 적용. 실제 배포 시 `npm run build`와 Workers 배포를 모두 확인한다. 여행 facts 변경 없음.

## 서로 다른 지표

- Ads 클릭: Google Ads가 집계한 광고 상호작용이다. 실제 페이지 수신·사람·세션·예약과 같지 않다. 무효 상호작용은 이미 제외된 별도 지표이므로 클릭에서 다시 빼지 않는다.
- 서버 HTML 응답: 광고 파라미터가 포함된 요청에 응답한 횟수다. 재요청·동일인의 반복·봇도 포함될 수 있다. 화면 표시나 읽기 완료를 증명하지 않는다.
- GA4 세션: GA4 수집·동의·보고 기준에 따른다. 여러 클릭이 한 세션이 될 수 있고 태그 실행 전 이탈·차단·미동의는 차이를 만들 수 있다. 행동 모델링은 속성의 실제 사용 가능 여부를 확인한다.
- `affiliate_click`: 제휴 링크를 누른 행동. 예약 완료는 제휴사 대장이나 승인된 전환 연동으로 따로 확인한다.

## 구현

`lib/analytics-bootstrap.mjs`는 실제 head 인라인 코드다. 동의 기본값 → 저장된 분석 동의 복원 → 태그 설정 → 비동기 스크립트 로드 순서다. 광고 저장·맞춤광고는 임의 허용하지 않는다. `data-kth-tag-state`는 loaded/unavailable 진단 표시이며 사용자 수를 수집하지 않는다.

허용한 선택은 `window.kthAnalyticsConsent`에 먼저 반영하여 localStorage 차단 시에도 현재 페이지에서 작동한다. 거절하면 자체 이벤트를 보내지 않는다. 동의 재설정 버튼은 푸터에 있다. `analytics_ready`는 허용 전환 시 전송하며 예약·구매 전환으로 등록하지 않는다.

## 서버 진단 스키마

Cloudflare Analytics Engine: `kth_ad_landing_health`, Worker binding `LANDING_HEALTH`.

| 필드 | 의미 |
|---|---|
| blob1 | live 또는 probe |
| blob2 | click-id 존재 또는 utm |
| blob3 | 운영 언어 |
| blob4 | home, visa-hub, visa-country, plan 등 콘텐츠 그룹 |
| blob5 | 국가 코드 또는 XX |
| blob6 | 응답 상태 2xx/4xx/5xx |
| blob7 | 서버 자산 응답 시간 구간. 브라우저 LCP·전체 로딩 시간 아님 |
| double1 | 응답 횟수 1 |

IP·UA·쿠키·클릭 ID 값·캠페인명·전체 URL·방문자 식별자는 저장하지 않는다. 3xx, 정적 파일, 프리패치, RSC, API, 명시적 QA를 제외한다. 기본 / 리디렉션과 최종 페이지를 이중 집계하지 않는다. 제3자 파라미터는 변조될 수 있으므로 광고 진위·실사용자를 증명하는 로그로 쓰지 않는다.

Cloudflare 대시보드 → Storage & databases → Analytics Engine → 데이터셋 → Studio에서 실행:

```sql
SELECT blob3 AS locale, blob4 AS page_group, blob5 AS country,
       blob6 AS delivery_status,
       SUM(_sample_interval * double1) AS html_responses
FROM kth_ad_landing_health
WHERE timestamp >= NOW() - INTERVAL '1' DAY AND blob1 = 'live'
GROUP BY blob3, blob4, blob5, blob6
```

동일 기간·동일 시간대의 Ads 사이트 도착 클릭, 서버 응답, GA4 google/cpc 세션을 함께 비교한다. 서버 응답/클릭은 진단용 비율이며 정확한 도착률·동의율로 부르지 않는다. 국가별 기간 비교에서도 샘플 가중치 `_sample_interval`을 적용한다. Analytics Engine 보존 기간·요금·쿼리 범위는 Cloudflare 현행 문서를 확인한다.

## 점검 절차

1. `?kth_qa=1`로 UI 점검을 시작한다. 탭 내 후속 페이지도 GA4 제외. 수집 검증이 필요한 경우에만 `kth_qa=0&utm_source=measurement_check&utm_medium=test`를 사용하고 성과 분석에서 제외한다.
2. Tag Assistant에서 거절 시 analytics_storage=denied, 허용 시 granted와 analytics_ready 전송을 확인한다. GA4 DebugView에서 실제 수신도 확인한다. 브라우저 차단을 우회하지 않는다.
3. 서버 수신만 확인할 때는 `?utm_source=google&utm_medium=cpc&kth_measurement_probe=1`을 사용한다. HTTP 헤더 queued만으로 완료라고 하지 않고 Studio에서 blob1=probe 기록을 조회한다. 유료 광고를 클릭해 테스트하지 않는다.
4. 클릭 ID·UTM이 언어 리디렉션에서 보존되는지, 광고 URL·모바일 URL·추적 템플릿이 올바른지 확인한다.
5. 서버 응답도 적으면 도착 전 이탈·광고 게재 채널·네트워크·서버 오류를 조사한다. 서버 응답은 충분하나 GA4가 적으면 동의·차단·태그 실행·세션 정의를 조사한다. 과거에 수집하지 않은 원인을 임의 백분율로 복원하지 않는다.

## 공식 문서

- [Ads와 Analytics 클릭·세션 비교](https://support.google.com/google-ads/answer/14452452?hl=en)
- [Consent Mode 동작](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [GA4 행동 모델링](https://support.google.com/analytics/answer/11161109)
- [무효 상호작용](https://support.google.com/google-ads/answer/11182074?hl=en-AU)
- [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/get-started/)
