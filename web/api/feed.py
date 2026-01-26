from http.server import BaseHTTPRequestHandler
import json
import os
import requests

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        debug_info = {}
        try:
            # 1. Get Supabase credentials
            supabase_url = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
            supabase_key = os.environ.get('SUPABASE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
            
            # Debug info
            debug_info["has_url"] = bool(supabase_url)
            debug_info["has_key"] = bool(supabase_key)
            debug_info["env_keys"] = list(os.environ.keys())

            if not supabase_url or not supabase_key:
                print("Missing Supabase credentials")
                self._send_json({
                    "data": [], 
                    "error": "Missing Supabase credentials",
                    "debug": debug_info
                })
                return

            supabase_url = supabase_url.rstrip('/')

            # 2. Fetch articles from Supabase REST API
            api_url = f"{supabase_url}/rest/v1/articles"
            headers = {
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json"
            }
            params = {
                "select": "*",
                "order": "published_at.desc",
                "limit": "100"
            }
            
            debug_info["api_url"] = api_url

            response = requests.get(api_url, headers=headers, params=params)
            
            if response.status_code == 200:
                articles = response.json()
                self._send_json({"data": articles, "count": len(articles)})
            else:
                print(f"Supabase Error: {response.text}")
                self._send_json({
                    "data": [], 
                    "error": f"Supabase API Error: {response.status_code}", 
                    "details": response.text,
                    "debug": debug_info
                })
            
        except Exception as e:
            print(f"News API Error: {str(e)}")
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
