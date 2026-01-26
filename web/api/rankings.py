from http.server import BaseHTTPRequestHandler
import json
import os
from api._lib.dart_client import DartAPI
from api._lib.cache import RankingCache

# Company list
COMPANIES = [
    "한스바이오메드", "엘앤씨바이오", "제테마", "한국비엔씨", "종근당바이오",
    "휴온스", "휴온스글로벌", "휴메딕스", "휴젤", "메디톡스",
    "대웅제약", "파마리서치", "클래시스", "케어젠", "원텍",
    "동방메디컬", "제이시스메디칼", "바이오비쥬", "바이오플러스", "비올",
    "하이로닉", "레이저옵텍", "유바이오로직스"
]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Check cache first
            cache = RankingCache()
            rankings = cache.get()
            
            if rankings:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(rankings).encode())
                return
            
            # Get API key from environment
            dart_api_key = os.environ.get('DART_API_KEY')
            if not dart_api_key:
                raise Exception("DART_API_KEY not configured")
            
            # Initialize DART API
            dart_api = DartAPI(dart_api_key)
            
            # Fetch rankings
            revenue_data = []
            for company in COMPANIES:
                try:
                    corp_info = dart_api.get_corp_code(company)
                    if not corp_info:
                        continue
                    
                    corp_code = corp_info.get('corp_code')
                    reports = dart_api.get_disclosure_list(corp_code, bgn_de="20230101")
                    
                    # Find latest report
                    target_report = None
                    for report in reports:
                        report_nm = report.get('report_nm', '')
                        if any(x in report_nm for x in ["분기보고서", "반기보고서", "사업보고서"]):
                            meta = dart_api.parse_report_code(report_nm)
                            if meta:
                                target_report = report
                                target_meta = meta
                                break
                    
                    if target_report and target_meta:
                        financials = dart_api.get_financials(
                            corp_code,
                            target_meta['year'],
                            target_meta['code']
                        )
                        
                        if financials:
                            revenue = financials.get('revenue', '0')
                            if isinstance(revenue, str):
                                revenue = int(revenue.replace(",", ""))
                            
                            revenue_data.append({
                                "name": company,
                                "revenue": revenue
                            })
                except Exception as e:
                    print(f"Error processing {company}: {e}")
                    continue
            
            # Sort and create rankings
            revenue_data.sort(key=lambda x: x["revenue"], reverse=True)
            rankings = {item["name"]: i+1 for i, item in enumerate(revenue_data)}
            
            # Cache the results
            cache.set(rankings)
            
            # Return response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(rankings).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
