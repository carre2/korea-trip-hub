import json, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
import kakao_connect as app

class DeliveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='delivery-test-', dir=Path(__file__).parent)
        self.root = Path(self.temp.name)
        self.patches = [patch.object(app, 'ROOT', self.root / 'private'),
                        patch.object(app, 'MARKETING', self.root / 'marketing')]
        for item in self.patches:
            item.start()

    def tearDown(self):
        for item in self.patches:
            item.stop()
        self.temp.cleanup()

    def test_previous_pc_sent_is_not_sent_again_without_credentials(self):
        prior = app.MARKETING / '2026-10-12'
        prior.mkdir(parents=True)
        (prior / 'kakao-delivery-result.json').write_text(json.dumps({'status':'sent','report_id':'daily-2026-10-12'}))
        with patch.object(app, 'access_token', side_effect=AssertionError('must not request credentials')):
            self.assertEqual(app.send_report('report', 'daily-2026-10-12')['status'], 'already_sent')

    def test_unknown_send_outcome_cannot_be_retried(self):
        with patch.object(app, 'access_token', return_value='test-only'), patch.object(app, 'api', side_effect=RuntimeError('unknown')) as api:
            with self.assertRaises(RuntimeError):
                app.send_report('report', 'daily-2026-10-13')
            self.assertEqual(app.send_report('report', 'daily-2026-10-13')['status'], 'uncertain')
            self.assertEqual(api.call_count, 1)

    def test_partial_delivery_is_never_automatically_retried(self):
        with patch.object(app, 'access_token', return_value='test-only'), patch.object(app, 'api', side_effect=[{'result_code':0},RuntimeError('unknown')]) as api:
            with self.assertRaises(RuntimeError):
                app.send_report(('x'*180+'\n')*12, 'partial-test')
            self.assertEqual(app.send_report('report', 'partial-test')['status'], 'uncertain')
            ledger = json.loads((app.ROOT / 'delivery.json').read_text())
            self.assertEqual(ledger['partial-test']['confirmed_parts'], 1)
            self.assertEqual(api.call_count, 2)

if __name__ == '__main__':
    unittest.main()
