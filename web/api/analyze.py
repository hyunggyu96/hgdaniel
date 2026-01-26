from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# Add current directory to path so we can import _lib
# Vercel places function in /api/analyze.py, we need /api/_lib
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from _lib.dart_client import DartAPI, NaverAPI
    from _lib.llm import GeminiClient
    from _lib.cache import AnalysisCache
except ImportError as e:
    # Fallback for local testing if path varies
    print(f"Import Error: {e}")
    # Try different path strategy if needed, but relative import above usually works if sys.path is correct
    pass

# Manual mapping for specific companies
COMPANY_MANUAL_MAP = {
    "원텍": {
        "stock_code": "336570", 
        "corp_code": "01407909", 
        "dart_name": None
    }
}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            company_name = data.get('company_name')
            if not company_name:
                raise ValueError("Missing company_name")
            
            # --- Analysis Logic Start ---
            
            # Initialize Clients
            dart_api_key = os.environ.get('DART_API_KEY')
            naver_id = os.environ.get('NAVER_CLIENT_ID')
            naver_secret = os.environ.get('NAVER_CLIENT_SECRET')
            gemini_key = os.environ.get('GEMINI_API_KEY')
            
            dart = DartAPI(dart_api_key)
            naver = NaverAPI(naver_id, naver_secret)
            gemini = GeminiClient(gemini_key)
            cache = AnalysisCache()
            
            # 1. Identity Resolution (DART & Stock Code)
            corp_code = None
            stock_code = None
            dart_lookup_name = company_name

            if company_name in COMPANY_MANUAL_MAP:
                manual = COMPANY_MANUAL_MAP[company_name]
                stock_code = manual.get("stock_code")
                corp_code = manual.get("corp_code")
                if manual.get("dart_name"):
                    dart_lookup_name = manual.get("dart_name")
            
            if not corp_code:
                # DART Lookup
                corp_info = dart.get_corp_code(dart_lookup_name)
                if corp_info:
                     # Check if corp_info is dict or str (depends on client impl, assuming dict from dart_client.py)
                     if isinstance(corp_info, dict):
                        corp_code = corp_info.get('corp_code')
                        if not stock_code: 
                            stock_code = corp_info.get('stock_code')
                     else:
                        # Fallback if simple dict mapping
                        corp_code = corp_info
            
            # 2. Fetch DART Reports
            report_data = {
                "title": "Report Not Found",
                "date": "-",
                "financials": {"revenue": "N/A", "profit": "N/A"}
            }
            prior_report_data = {
                "title": "Prior Report Not Found", 
                "date": "-",
                "financials": {"revenue": "N/A", "profit": "N/A"}
            }
            
            corp_code_found = False
            financial_history = {}
            
            if corp_code:
                corp_code_found = True
                reports = dart.get_disclosure_list(corp_code, bgn_de="20230101")
                
                # Logic to find latest Quarterly/Annual report
                if reports:
                    target_report = None
                    target_idx = 0
                    
                    # Prefer Quarterly/Annual reports
                    for i, r in enumerate(reports):
                         nm = r.get('report_nm', '')
                         if "분기보고서" in nm or "사업보고서" in nm or "반기보고서" in nm:
                             target_report = r
                             target_idx = i
                             break
                    
                    if not target_report:
                        target_report = reports[0]
                        
                    # Process Current Report
                    codes = dart.parse_report_code(target_report.get('report_nm', ''))
                    financials = {"revenue": "N/A", "profit": "N/A"}
                    if codes:
                        financials = dart.get_financials(corp_code, codes['year'], codes['code'])
                    
                    link = dart.get_document_content(target_report['rcept_no'])
                    report_data = {
                        "title": target_report.get('report_nm'),
                        "date": target_report.get('rcept_dt'),
                        "link": link,
                        "financials": financials
                    }
                    
                    # Process Prior Report (for comparison)
                    for i in range(target_idx + 1, len(reports)):
                        r = reports[i]
                        nm = r.get('report_nm', '')
                        if "분기보고서" in nm or "사업보고서" in nm or "반기보고서" in nm:
                            codes = dart.parse_report_code(nm)
                            fin = {"revenue": "N/A", "profit": "N/A"}
                            if codes:
                                fin = dart.get_financials(corp_code, codes['year'], codes['code'])
                            
                            prior_report_data = {
                                "title": nm,
                                "date": r.get('rcept_dt'),
                                "financials": fin
                            }
                            break
                
                # robust financial history fetching
                # (Simplified version of backend logic: iterate reports)
                # For this single file, let's keep it simple or copy the helper function if needed.
                # Here we will just use the current report data if full history is too complex for now,
                # BUT the frontend expects 'financial_history'.
                
                # Minimal History Builders
                years = ["2023", "2024", "2025", "2026"]
                for y in years:
                    financial_history[y] = {"revenue": "N/A", "operating_profit": "N/A", "rd_cost": "N/A"}
                
                # Fill available data from reports list
                if reports:
                    for r in reports:
                         meta = dart.parse_report_code(r.get('report_nm', ''))
                         if meta and meta['year'] in financial_history:
                             y = meta['year']
                             # If we haven't filled this year yet or if it's an annual report (overwrite quarterly)
                             if financial_history[y]['revenue'] == 'N/A' or "사업보고서" in r.get('report_nm', ''):
                                 fin = dart.get_financials(corp_code, y, meta['code'])
                                 if fin['revenue'] != '-':
                                     financial_history[y]['revenue'] = fin['revenue']
                                     financial_history[y]['operating_profit'] = fin['profit']
                                     financial_history[y]['rd_cost'] = fin['rd_cost']
                                     financial_history[y]['annual_report'] = {"link": dart.get_document_content(r['rcept_no'])}
            
            # 3. Market Data (Simplified: No FDR in Vercel - too heavy/complex for lambda potentially)
            # Or assume we skip FDR for now and return N/A or use a lightweight API if avail.
            # The backend used FinanceDataReader which draws from KRX. Installing pandas/FDR on Vercel Free tier can be heavy.
            # We will return N/A for price for now to ensure stability, or implement a simple Yahoo Finance scraper if critical.
            # User said "integrate to original website", original website might have price elsewhere.
            # For now: Placeholder stub for Market Data to prevent crash.
            market_data = {
                "price": "N/A", 
                "change": "N/A", 
                "market_cap": "N/A", 
                "market_type": "KRX",
                "code": stock_code
            }

            # 4. News Analysis
            news_items = []
            try:
                news_res = naver.search_news(company_name, display=5)
                for item in news_res.get('items', []):
                    title = item['title'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"')
                    news_items.append({
                        "title": title,
                        "date": item.get('pubDate', ''),
                        "link": item.get('link', '')
                    })
            except Exception as e:
                print(f"News Error: {e}")

            # 5. Gemini Analysis (with Cache)
            gemini_analysis_ko = "분석 대기 중..."
            gemini_analysis_en = "Analysis pending..."
            company_summary = ""
            
            if corp_code_found and report_data['title'] != "Report Not Found":
                # Check Cache
                cached = cache.get_cached_analysis(company_name, report_data['date'])
                if cached:
                    gemini_analysis_ko = cached['gemini_ko']
                    gemini_analysis_en = cached['gemini_en']
                    company_summary = cached['summary']
                else:
                    # Generate New
                    g_res = gemini.generate_comparison_analysis(company_name, report_data, prior_report_data)
                    gemini_analysis_ko = g_res.get('ko')
                    gemini_analysis_en = g_res.get('en')
                    company_summary = g_res.get('summary')
                    
                    # Save to Cache
                    if gemini_analysis_ko and "분석 생성 실패" not in gemini_analysis_ko:
                        cache.save_analysis(
                            company_name, 
                            report_data['date'], 
                            report_data['title'],
                            gemini_analysis_ko,
                            gemini_analysis_en,
                            company_summary
                        )
            elif not corp_code_found:
                 gemini_analysis_ko = "기업 정보를 찾을 수 없습니다."
                 company_summary = "DART에 등록되지 않은 기업이거나 검색어 오류일 수 있습니다."

            # Construct Final Response
            result = {
                "company": {
                    "name": company_name,
                    "stock_code": stock_code
                },
                "company_summary": company_summary,
                "market_data": market_data,
                "financial_history": financial_history,
                "audit_report": report_data,
                "prior_report": prior_report_data,
                "news_analysis": {
                    "recent_headlines": news_items
                },
                "gemini_analysis": gemini_analysis_ko,
                "gemini_analysis_en": gemini_analysis_en,
                "rd_analysis": {
                    "keywords": ["R&D", "임상", "연구", "개발"],
                    "patents": []
                }
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
