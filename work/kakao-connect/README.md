# 새 PC 카카오 연결 도우미

이 도구는 Korea Trip Hub 운영자의 카카오톡 **나에게 보내기**만 사용한다.
비밀번호·키·토큰은 채팅이나 G 드라이브에 저장하지 않는다.

## 연결

`kakao_connect.py --serve`를 실행하고 `http://localhost:8765/`에서
기존 카카오 앱 1603444의 REST API 키와 활성화된 Client Secret을 직접 입력한다.
사용자가 카카오 로그인·메시지 전송 동의를 완료하고 테스트 버튼으로 수신을 확인한다.
기존 등록 주소 `http://localhost:8765/callback`을 사용한다.

연결 정보는 사용자 프로필 아래 `AppData/Local/KoreaTripHub/kakao/connection.dpapi`에
Windows DPAPI로 암호화하여 저장한다. 다른 PC의 암호화 파일을 복사하지 않는다.
HTTP 서버는 로컬 루프백에서만 실행하며 요청 주소·OAuth 코드·키를 로그에 남기지 않는다.

## 운영

- `--status`: 연결 파일 존재·복호화 여부만 출력한다. 실제 수신 성공은 테스트로 확인한다.
- `--report <UTF-8 파일> --report-id daily-YYYY-MM-DD`: 보고 분할 검증만 수행한다.
- 위 명령에 `--send`를 추가하면 본인에게 전송한다.
- 보고의 각 줄은 190자 이하이며 메시지는 길이에 맞춰 분할한다.
- 로컬 `delivery.json`과 G 드라이브 날짜별 `kakao-delivery-result.json`의 전송 완료 기록으로 중복을 막는다.
- 전송 전에 결과를 불확실 상태로 저장한다. 네트워크 오류·부분 성공·강제 종료는 자동 재전송하지 않는다.
- `sent` 또는 `already_sent`만 완료로 기록한다. `uncertain`은 사람이 실제 수신을 대조해야 한다.
- 앱 실행 권한 제한 때문에 저장소 접근이 막히면 해당 로컬 연결·전송 명령에만 실행 권한을 요청한다.

이전 PC를 다시 켜기 전 그 PC의 기존 발행 자동화를 중지하여 두 PC의 운영이 겹치지 않게 한다.

## 검증

`--self-test`로 Windows 암호화 왕복과 보고 길이 경계를 확인한다.
`python -m unittest discover -s work/kakao-connect -p 'test_*.py' -v`는
이전 PC 완료 기록, 전송 결과 불명, 부분 성공에 대한 중복 방지를 외부 요청 없이 검증한다.

공식 근거:
- [카카오 로그인 REST API](https://developers.kakao.com/docs/ko/kakaologin/rest-api)
- [카카오톡 메시지 REST API](https://developers.kakao.com/docs/ko/kakaotalk-message/rest-api)
