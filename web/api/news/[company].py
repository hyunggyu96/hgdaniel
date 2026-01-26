from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import unquote
from api._lib.dart_client import NaverAPI

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Extract company name from URL
            # URL format: /api/news/CompanyName
            path_parts = self.path.split('/')
            company_segment = path_parts[-1].split('?')[0]
            company_name = unquote(company_segment)
            
            if not company_name:
                raise ValueError("Missing company name")

            # Get API keys
            client_id = os.environ.get('NAVER_CLIENT_ID')
            client_secret = os.environ.get('NAVER_CLIENT_SECRET')
            
            if not client_id or not client_secret:
                self._send_json({"items": []})
                return
                
            naver_api = NaverAPI(client_id, client_secret)
            
            # Search news
            result = naver_api.search_news(f"{company_name} 주가 전망", display=5)
            
            self._send_json(result)
            
        except Exception as e:
            self._send_error(500, str(e))

    def _send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _send_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())
