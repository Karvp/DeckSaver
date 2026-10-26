import unittest
from app import app
class SafeDemoTest(unittest.TestCase):
    def setUp(self):self.client=app.test_client()
    def test_home_and_headers(self):
        r=self.client.get("/")
        self.assertEqual(r.status_code,200)
        self.assertIn(b"Offline YDK deck preview",r.data)
        self.assertEqual(r.headers["X-Frame-Options"],"DENY")
        self.assertEqual(self.client.get("/health").json["status"],"ok")
    def test_parser_sections(self):
        r=self.client.post("/api/parse",json={"ydk":"#main\n123\n456\n#extra\n789\n!side\n123\n"})
        self.assertEqual(r.status_code,200)
        self.assertEqual(r.json["counts"],{"main":2,"extra":1,"side":1})
    def test_bad_inputs(self):
        for s in ["123\nBAD", "#main\n"+"123\n"*4]:
            self.assertEqual(self.client.post("/api/parse",json={"ydk":s}).status_code,422)
        self.assertEqual(self.client.post("/api/parse",json={"ydk":"a"*30001}).status_code,413)
        self.assertEqual(self.client.post("/api/parse",json={}).status_code,400)
    def test_legacy_routes_disabled(self):
        self.assertEqual(self.client.post("/api/login").status_code,404)
        self.assertEqual(self.client.get("/download/any").status_code,404)
