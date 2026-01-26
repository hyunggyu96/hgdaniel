from http.server import BaseHTTPRequestHandler
import json
import random
from datetime import datetime, timedelta

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Categories matching the frontend
            categories = [
                'Filler', 'Botulinum Toxin', 'Collagen Stimulator', 
                'Exosome', 'PDRN/PN', 'Skinboosters/Threads', 
                'Machines (EBD)', 'Corporate News'
            ]
            
            data = []
            today = datetime.now()
            
            # Generate 30 days of dummy data
            for i in range(30):
                date = (today - timedelta(days=29-i)).strftime('%Y-%m-%d')
                item = { "date": date }
                
                # Random values for each category
                for cat in categories:
                    # Base value + random noise + slight trend
                    item[cat] = max(0, int(10 + random.randint(0, 50) + (i * 0.5)))
                
                data.append(item)

            response_data = {
                "categories": categories,
                "data": data
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
