from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import unquote
from api._lib.dart_client import DartAPI

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Extract company name from URL
            # URL format: /api/stock-data/CompanyName
            path_parts = self.path.split('/')
            
            # Handle potential trailing query params
            company_segment = path_parts[-1].split('?')[0]
            company_name = unquote(company_segment)
            
            if not company_name:
                raise ValueError("Missing company name")

            # Get API key
            dart_api_key = os.environ.get('DART_API_KEY')
            if not dart_api_key:
                # Return empty data if no key, don't crash
                self._send_json({})
                return
                
            dart_api = DartAPI(dart_api_key)
            
            # Fetch basic info
            corp_info = dart_api.get_corp_code(company_name)
            
            if not corp_info:
                self._send_json({"error": "Company not found in DART"})
                return

            corp_code = corp_info.get('corp_code')
            
            # Get latest revenue/profit if available (Reuse logic from rankings for now)
            # For a full implementation, we would fetch multi-year data
            # Here we just fetch the latest available report
            reports = dart_api.get_disclosure_list(corp_code, bgn_de="20230101")
            
            financial_history = {
                "2023": {"revenue": 0, "profit": 0},
                "2022": {"revenue": 0, "profit": 0} 
            }
            
            # Ideally we would iterate reports to fill this
            # For this 'lite' version, we return what we found in ranking logic or empty
            # This endpoint is expected to return { "financials": ... } structure
            
            # Reusing get_financials logic for latest report
            target_report = None
            target_meta = None
            
            for report in reports:
                 report_nm = report.get('report_nm', '')
                 if any(x in report_nm for x in ["분기보고서", "반기보고서", "사업보고서"]):
                    meta = dart_api.parse_report_code(report_nm)
                    if meta:
                        target_report = report
                        target_meta = meta
                        break
            
            if target_report and target_meta:
                 fin = dart_api.get_financials(corp_code, target_meta['year'], target_meta['code'])
                 if fin:
                     financial_history[target_meta['year']] = {
                         "revenue": fin.get('revenue', 0),
                         "profit": fin.get('profit', 0)
                     }

            self._send_json({
                "company": company_name,
                "financials": financial_history,
                "stock_code": corp_info.get('stock_code')
            })
            
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
