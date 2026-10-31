"""Contract tests use a real loopback HTTP server and the real curl executable."""
import http.server
import os
import pathlib
import subprocess
import threading
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / 'scripts/check-health.sh'

class Handler(http.server.BaseHTTPRequestHandler):
    statuses = {}
    requests = []
    def do_GET(self):
        type(self).requests.append(self.path)
        status = type(self).statuses.get(self.path, 200)
        if isinstance(status, list):
            status = status.pop(0) if len(status) > 1 else status[0]
        self.send_response(status)
        self.end_headers()
        self.wfile.write(b'[]')
    def log_message(self, *args):
        pass

class HealthCheckTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
    def setUp(self):
        Handler.statuses = {}
        Handler.requests = []
    def run_probe(self, *args):
        return subprocess.run(['bash', str(SCRIPT), *args], env={**os.environ, 'HEALTH_ATTEMPTS': '2', 'HEALTH_DELAY_SECONDS': '0'}, capture_output=True, text=True, timeout=10)
    def test_explicit_urls_all_endpoints(self):
        result = self.run_probe(self.url)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(Handler.requests, ['/up', '/api/products', '/'])
    def test_missing_and_invalid_url_fail_before_network(self):
        for args in [[], [''], ['--help'], ['file:///etc/passwd'], [self.url, 'extra']]:
            self.assertEqual(self.run_probe(*args).returncode, 2)
        self.assertEqual(Handler.requests, [])
    def test_http_failure_and_redirect_never_pass(self):
        for status in [301, 401, 500, 503]:
            Handler.statuses = {'/api/products': status}
            self.assertEqual(self.run_probe(self.url).returncode, 1)
    def test_transient_failure_recovers(self):
        Handler.statuses = {'/up': [503, 200]}
        self.assertEqual(self.run_probe(self.url).returncode, 0)
        self.assertEqual(Handler.requests.count('/up'), 2)
    def test_connection_failure_is_not_success(self):
        result = self.run_probe('http://127.0.0.1:1')
        self.assertEqual(result.returncode, 1)
        self.assertNotIn('PASS:', result.stdout)

if __name__ == '__main__':
    unittest.main()
