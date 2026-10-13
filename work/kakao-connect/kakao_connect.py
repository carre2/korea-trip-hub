"""Local Kakao OAuth and idempotent self-message delivery. Never logs secrets."""
import argparse, ctypes, hashlib, html, json, os, re, secrets, time
from ctypes import wintypes
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlencode, urlsplit, parse_qs
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path.home() / 'AppData' / 'Local' / 'KoreaTripHub' / 'kakao'
REDIRECT = 'http://localhost:8765/callback'
TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
SEND_URL = 'https://kapi.kakao.com/v2/api/talk/memo/default/send'
MARKETING = Path(r'G:\내 드라이브\korea-trip-hub\marketing')

class Blob(ctypes.Structure):
    _fields_ = [('cbData', wintypes.DWORD), ('pbData', ctypes.POINTER(ctypes.c_ubyte))]

def protect(data, decrypt=False):
    if os.name != 'nt':
        raise RuntimeError('Windows DPAPI required')
    buf = ctypes.create_string_buffer(data)
    src = Blob(len(data), ctypes.cast(buf, ctypes.POINTER(ctypes.c_ubyte)))
    dst = Blob()
    crypt = ctypes.WinDLL('crypt32', use_last_error=True)
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    fn = crypt.CryptUnprotectData if decrypt else crypt.CryptProtectData
    fn.argtypes = [ctypes.POINTER(Blob), ctypes.c_void_p, ctypes.c_void_p,
                   ctypes.c_void_p, ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(Blob)]
    fn.restype = wintypes.BOOL
    kernel.LocalFree.argtypes = [ctypes.c_void_p]
    kernel.LocalFree.restype = ctypes.c_void_p
    if not fn(ctypes.byref(src), None, None, None, None, 1, ctypes.byref(dst)):
        raise RuntimeError('DPAPI operation failed')
    try:
        return ctypes.string_at(dst.pbData, dst.cbData)
    finally:
        kernel.LocalFree(dst.pbData)

def atomic(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + '.' + secrets.token_hex(6) + '.tmp')
    tmp.write_bytes(data)
    os.replace(tmp, path)

def load_secret():
    path = ROOT / 'connection.dpapi'
    return json.loads(protect(path.read_bytes(), True)) if path.exists() else None

def save_secret(data):
    atomic(ROOT / 'connection.dpapi', protect(json.dumps(data).encode()))

def api(url, data, token=None):
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = Request(url, data=urlencode(data).encode(), headers=headers)
    try:
        with urlopen(request, timeout=25) as response:
            return json.load(response)
    except HTTPError as error:
        # Do not include response bodies, URLs with queries, or credentials.
        raise RuntimeError('Kakao HTTP ' + str(error.code)) from None
    except Exception:
        raise RuntimeError('Kakao network outcome unknown') from None

def merge_tokens(connection, tokens):
    if not tokens.get('access_token'):
        raise RuntimeError('Token response invalid')
    connection['access_token'] = tokens['access_token']
    connection['expires_at'] = time.time() + int(tokens['expires_in'])
    if tokens.get('refresh_token'):
        connection['refresh_token'] = tokens['refresh_token']
    if tokens.get('refresh_token_expires_in'):
        connection['refresh_expires_at'] = time.time() + int(tokens['refresh_token_expires_in'])
    save_secret(connection)
    return connection

def access_token():
    connection = load_secret()
    if not connection:
        raise RuntimeError('not_connected')
    if connection.get('expires_at', 0) > time.time() + 120:
        return connection['access_token']
    if connection.get('refresh_expires_at', float('inf')) <= time.time():
        raise RuntimeError('reconnect_required')
    data = {'grant_type': 'refresh_token', 'client_id': connection['key'],
            'refresh_token': connection['refresh_token']}
    if connection.get('secret'):
        data['client_secret'] = connection['secret']
    return merge_tokens(connection, api(TOKEN_URL, data))['access_token']

def split_report(text, limit=900):
    lines = text.strip().splitlines()
    if not lines or any(len(line) > 190 for line in lines):
        raise ValueError('Report must have text and lines at most 190 characters')
    parts, current = [], ''
    for line in lines:
        candidate = current + ('\n' if current else '') + line
        if len(candidate) > limit:
            parts.append(current)
            current = line
        else:
            current = candidate
    if current:
        parts.append(current)
    return parts

def send_report(text, report_id):
    if not re.fullmatch(r'[a-zA-Z0-9_-]{1,100}', report_id):
        raise ValueError('Invalid report id')
    parts = split_report(text)
    ROOT.mkdir(parents=True, exist_ok=True)
    lock = ROOT / 'delivery.lock'
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        raise RuntimeError('Delivery lock exists; inspect outcome before proceeding') from None
    os.close(fd)
    try:
        ledger_path = ROOT / 'delivery.json'
        ledger = json.loads(ledger_path.read_text('utf-8')) if ledger_path.exists() else {}
        # Import confirmed previous-PC deliveries to prevent cross-PC duplicates.
        for day in MARKETING.glob('20??-??-??'):
            prior = day / 'kakao-delivery-result.json'
            if prior.exists():
                saved = json.loads(prior.read_text('utf-8-sig'))
                if saved.get('status') in ('sent', 'already_sent'):
                    ledger.setdefault(saved.get('report_id', 'daily-' + day.name), {'status': 'sent', 'imported': True})
        existing = ledger.get(report_id)
        if existing:
            return {'status': 'already_sent' if existing['status'] == 'sent' else 'uncertain', 'report_id': report_id}
        token = access_token()
        ledger[report_id] = {'status': 'uncertain', 'sha256': hashlib.sha256(text.encode()).hexdigest(),
                             'parts': len(parts), 'confirmed_parts': 0, 'attempted_at': time.time()}
        atomic(ledger_path, json.dumps(ledger, indent=2).encode())
        for index, part in enumerate(parts):
            message = f'Korea Trip Hub [{index+1}/{len(parts)}]\n' + part
            template = {'object_type': 'text', 'text': message,
                        'link': {'web_url': 'https://ktriphub.com', 'mobile_web_url': 'https://ktriphub.com'},
                        'button_title': '여행 허브 열기'}
            result = api(SEND_URL, {'template_object': json.dumps(template, ensure_ascii=False)}, token)
            if result.get('result_code') != 0:
                raise RuntimeError('Delivery not confirmed; do not retry')
            ledger[report_id]['confirmed_parts'] = index + 1
            atomic(ledger_path, json.dumps(ledger, indent=2).encode())
        ledger[report_id]['status'] = 'sent'
        atomic(ledger_path, json.dumps(ledger, indent=2).encode())
        return {'status': 'sent', 'report_id': report_id, 'confirmed_parts': len(parts)}
    finally:
        lock.unlink(missing_ok=True)

CSRF = secrets.token_urlsafe(32)
PENDING = {}
NOTICE = ''

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # OAuth code and credentials must never enter logs.

    def allowed(self):
        return self.headers.get('Host') in ('localhost:8765', '127.0.0.1:8765')

    def page(self, content, status=200):
        body = ('<!doctype html><html lang="ko"><meta charset="utf-8"><title>여행 허브 카카오 연결</title>'
                '<style>body{font:17px sans-serif;background:#fff5ed;color:#263346;max-width:650px;margin:60px auto;padding:25px}'
                'section{background:white;padding:30px;border-radius:24px;box-shadow:0 8px 35px #ddd3}input,button{box-sizing:border-box;width:100%;padding:14px;margin:9px 0;border-radius:12px;border:1px solid #aaa}button{background:#fee500;font-weight:bold}p{line-height:1.6}</style>'
                '<section><h1>🌸 여행 허브 카카오 연결</h1>' + content + '</section></html>').encode()
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        global NOTICE
        if not self.allowed():
            return self.page('허용되지 않은 주소', 403)
        route = urlsplit(self.path)
        if route.path == '/callback':
            params = parse_qs(route.query)
            state = params.get('state', [''])[0]
            pending = PENDING.pop(state, None)
            if not pending or time.time() - pending['at'] > 600:
                return self.page('연결 요청이 만료되었습니다. 처음부터 다시 연결해 주세요.', 400)
            if params.get('error') or not params.get('code'):
                return self.page('로그인 또는 동의가 완료되지 않았습니다.', 400)
            connection = pending['connection']
            data = {'grant_type': 'authorization_code', 'client_id': connection['key'],
                    'redirect_uri': REDIRECT, 'code': params['code'][0]}
            if connection.get('secret'):
                data['client_secret'] = connection['secret']
            try:
                merge_tokens(connection, api(TOKEN_URL, data))
                NOTICE = '연결 정보를 이 PC의 Windows 암호화 저장소에 저장했습니다. 아래 버튼으로 나에게 보내기를 테스트해 주세요.'
            except RuntimeError as error:
                NOTICE = str(error)
            self.send_response(303)
            self.send_header('Location', '/')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.end_headers()
            return
        if route.path != '/':
            return self.page('찾을 수 없습니다.', 404)
        connected = (ROOT / 'connection.dpapi').exists()
        fields = f'<input type="hidden" name="csrf" value="{CSRF}">'
        if connected:
            self.page('<p>연결 정보 저장됨</p><p>' + html.escape(NOTICE) + '</p>'
                      '<form method="post" action="/test">' + fields + '<button>카카오톡 나에게 보내기 테스트</button></form>')
        else:
            self.page('<p>기존 카카오 앱 <strong>1603444</strong>의 REST API 키를 직접 입력하세요. 키를 채팅에 보내지 마세요.</p>'
                      '<p>등록된 리디렉션 주소: <code>http://localhost:8765/callback</code></p>'
                      '<p>키와 토큰은 이 PC의 Windows 사용자 암호화 저장소에만 보관합니다. 로그인과 메시지 전송 동의는 직접 진행해 주세요.</p>'
                      '<form method="post" action="/connect">' + fields +
                      '<label>REST API 키<input type="password" name="key" required autocomplete="off"></label>'
                      '<label>Client Secret (사용 설정된 경우)<input type="password" name="secret" autocomplete="off"></label>'
                      '<button>카카오 로그인으로 연결하기</button></form><p>' + html.escape(NOTICE) + '</p>')

    def do_POST(self):
        global NOTICE
        origin = self.headers.get('Origin')
        if not self.allowed() or origin not in ('http://localhost:8765', 'http://127.0.0.1:8765'):
            return self.page('허용되지 않은 요청', 403)
        length = int(self.headers.get('Content-Length', '0'))
        if length < 1 or length > 8192:
            return self.page('요청 크기 오류', 400)
        values = parse_qs(self.rfile.read(length).decode())
        if not secrets.compare_digest(values.get('csrf', [''])[0], CSRF):
            return self.page('요청 검증 실패', 403)
        if self.path == '/connect':
            key = values.get('key', [''])[0].strip()
            if not re.fullmatch(r'[a-zA-Z0-9_-]{16,128}', key):
                return self.page('REST API 키 형식을 확인하세요.', 400)
            state = secrets.token_urlsafe(32)
            PENDING.clear()
            PENDING[state] = {'at': time.time(), 'connection': {'key': key, 'secret': values.get('secret', [''])[0]}}
            url = 'https://kauth.kakao.com/oauth/authorize?' + urlencode({'client_id': key, 'redirect_uri': REDIRECT,
                                    'response_type': 'code', 'scope': 'talk_message', 'state': state})
            self.send_response(303)
            self.send_header('Location', url)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.end_headers()
        elif self.path == '/test':
            try:
                result = send_report('새 PC 카카오 연결 테스트입니다. Korea Trip Hub 발행 보고를 나에게 보내기로 전달합니다.', 'new-pc-2026-10-13-test')
                NOTICE = '테스트 결과: ' + result['status'] + '. 카카오톡 나와의 채팅에서 수신을 확인하세요.'
            except Exception as error:
                NOTICE = str(error) if isinstance(error, RuntimeError) else '테스트 오류. 결과 확인 전 재전송하지 마세요.'
            self.send_response(303)
            self.send_header('Location', '/')
            self.end_headers()
        else:
            self.page('찾을 수 없습니다.', 404)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--serve', action='store_true')
    parser.add_argument('--status', action='store_true')
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--report')
    parser.add_argument('--report-id')
    parser.add_argument('--send', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        original = b'non-secret DPAPI round-trip test'
        assert protect(protect(original), True) == original
        assert len(split_report(('x' * 180 + '\n') * 12)) == 3
        try:
            split_report('x' * 191)
            raise AssertionError('line bound not enforced')
        except ValueError:
            pass
        print('PASS: Windows encryption round-trip and report boundaries; no external requests')
    elif args.status:
        connection = load_secret()
        print(json.dumps({'connected': bool(connection), 'storage': str(ROOT)}, ensure_ascii=False))
    elif args.serve:
        print('Local connection UI: http://localhost:8765/', flush=True)
        HTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
    elif args.report:
        if not args.report_id:
            parser.error('--report-id required')
        text = Path(args.report).read_text('utf-8-sig')
        if args.send:
            print(json.dumps(send_report(text, args.report_id)))
        else:
            print(json.dumps({'status': 'validated_only', 'parts': len(split_report(text))}))
    else:
        parser.print_help()

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'status': 'error', 'reason': str(error) if isinstance(error, (RuntimeError, ValueError)) else 'Local operation failed'}))
        raise SystemExit(1)
