import os
import json
import time
from typing import Dict, Any, List
import requests
import zipfile
import io
import xml.etree.ElementTree as ET

# Configuration
DART_API_KEY = "b6611eb17d9950463ef48c1c17ef11d494bcb0da" # Placeholder/Invalid?

class DartAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://opendart.fss.or.kr/api"
        self.cache_dir = "dart_cache"
        os.makedirs(self.cache_dir, exist_ok=True)
        self.corp_code_file = os.path.join(self.cache_dir, "CORPCODE.xml")
        self.corp_codes = self._load_corp_codes()

    def _load_corp_codes(self) -> Dict[str, str]:
        if not os.path.exists(self.corp_code_file):
            print("Downloading DART corporate codes...")
            url = f"{self.base_url}/corpCode.xml"
            params = {"crtfc_key": self.api_key}
            try:
                response = requests.get(url, params=params, timeout=30)
                # Check if response is XML error instead of Zip
                content_type = response.headers.get('Content-Type', '')
                if 'xml' in content_type or not response.content.startswith(b'PK'):
                    print(f"Error downloading Corp Codes. Response: {response.text[:200]}")
                    return {}
                
                with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                    z.extractall(self.cache_dir)
            except Exception as e:
                print(f"Failed to download corporate codes: {e}")
                return {}
        
        codes = {}
        try:
            tree = ET.parse(self.corp_code_file)
            root = tree.getroot()
            for child in root.findall('list'):
                corp_code = child.find('corp_code').text
                corp_name = child.find('corp_name').text
                stock_code = child.find('stock_code').text
                codes[corp_name] = {"corp_code": corp_code, "stock_code": stock_code.strip() if stock_code else None}
        except Exception as e:
            print(f"Error parsing corporate codes: {e}")
        return codes

    def get_corp_code(self, company_name: str):
        return self.corp_codes.get(company_name)

    # Get ALL reports (including Audit Reports) by removing pblntf_ty limit
    def get_disclosure_list(self, corp_code: str, bgn_de: str = "20240101") -> List[Dict]:
        """Fetches the list of disclosures (reports) for a company."""
        url = f"{self.base_url}/list.json"
        params = {
            "crtfc_key": self.api_key,
            "corp_code": corp_code,
            "bgn_de": bgn_de,
            "last_reprt_at": "Y",
            "page_count": 100 # Fetch more to be safe
        }
        try:
            response = requests.get(url, params=params)
            data = response.json()
            if data['status'] == '000':
                return data.get('list', [])
            else:
                print(f"DART Error (list): {data.get('message')}")
                return []
        except Exception as e:
            print(f"DART Request Error: {e}")
            return []

    def get_financials(self, corp_code: str, year: str, reprt_code: str) -> Dict[str, Any]:
        url = f"{self.base_url}/fnlttSinglAcntAll.json"
        params = {
            "crtfc_key": self.api_key,
            "corp_code": corp_code,
            "bsns_year": year,
            "reprt_code": reprt_code,
            "fs_div": "CFS"
        }
        
        financials = {"revenue": "-", "profit": "-", "rd_cost": "-"}
        
        for attempt in range(2): # Retry once
            try:
                response = requests.get(url, params=params, timeout=10)
                data = response.json()
                
                if data['status'] == '000':
                    for item in data.get('list', []):
                        acct_nm = item.get('account_nm', '').strip()
                        amount = item.get('thstrm_amount', '0').strip()
                        
                        if acct_nm in ["매출액", "수익(매출액)"]:
                            financials['revenue'] = amount
                        elif acct_nm in ["영업이익", "영업이익(손실)"]:
                            financials['profit'] = amount
                        elif acct_nm in ["연구개발비", "연구개발비용", "연구개발비용계"]:
                            financials['rd_cost'] = amount
                    return financials # Success
                    
                else:
                    if params['fs_div'] == 'CFS' and attempt == 0:
                        params['fs_div'] = 'OFS' # Retry with OFS
                        continue
                    break # Error

            except Exception as e:
                print(f"  > Financials Request Error ({year}, {reprt_code}): {e}")
                time.sleep(1)
            
        return financials

    def parse_report_code(self, report_title: str) -> Dict[str, str]:
        import re
        match = re.search(r'\((\d{4})\.(\d{2})\)', report_title)
        if not match: return None
        year, month = match.group(1), match.group(2)
        code_map = { "03": "11013", "06": "11012", "09": "11014", "12": "11011" }
        return {"year": year, "code": code_map.get(month)}

    def get_document_content(self, rcept_no: str) -> str:
        return f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}"


COMPANIES = [
    "한스바이오메드", "엘앤씨바이오", "제테마", "한국비엔씨", "종근당바이오",
    "휴온스", "휴온스글로벌", "휴메딕스", "휴젤", "메디톡스", "대웅제약",
    "파마리서치", "클래시스", "케어젠", "원텍", "동방메디컬", "제이시스메디칼",
    "바이오비쥬", "바이오플러스", "비올", "하이로닉", "레이저옵텍", "유바이오로직스"
]

def save_intermediate(results):
    with open("company_financials.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

def main():
    # Allow overriding key via Env Var
    api_key = os.environ.get("DART_API_KEY", DART_API_KEY)
    
    dart = DartAPI(api_key)
    
    # Load existing if available to resume
    results = {}
    if os.path.exists("company_financials.json"):
        try:
            with open("company_financials.json", "r", encoding="utf-8") as f:
                results = json.load(f)
        except:
            pass

    print(f"Starting analysis for {len(COMPANIES)} companies...")
    print(f"Using API Key: {api_key[:5]}...")

    for i, name in enumerate(COMPANIES):
        if name in results and results[name].get("financial_history"):
            print(f"Skipping {name} (Already done)")
            continue

        print(f"[{i+1}/{len(COMPANIES)}] Processing {name}...")
        results[name] = {"financial_history": {}} 
        
        corp_info = dart.get_corp_code(name)
        if not corp_info:
            print(f"  -> Code not found!")
            save_intermediate(results)
            continue

        corp_code = corp_info['corp_code']
        stock_code = corp_info.get('stock_code', '000000')

        reports = dart.get_disclosure_list(corp_code, bgn_de="20230101")
        financial_history = {}
        for y in ["2023", "2024", "2025", "2026"]:
             financial_history[y] = {
                 "revenue": "N/A", 
                 "operating_profit": "N/A", 
                 "rd_cost": "N/A",
                 "annual_report": None,
                 "Q1": None,
                 "Q2": None,
                 "Q3": None,
                 "Q4": None
             }

        # First pass: Collect all report links
        for r in reports:
            report_nm = r.get('report_nm', '')
            meta = dart.parse_report_code(report_nm)
            if meta:
                y = meta['year']
                if y in financial_history:
                    link_info = {"link": dart.get_document_content(r['rcept_no']), "title": report_nm}
                    
                    if "사업보고서" in report_nm:
                        financial_history[y]["annual_report"] = link_info
                        # Use Annual for main numbers if available
                        fin = dart.get_financials(corp_code, y, meta['code'])
                        if fin['revenue'] != '-':
                            financial_history[y].update({
                                "revenue": fin['revenue'],
                                "operating_profit": fin['profit'],
                                "rd_cost": fin['rd_cost'],
                                "data_type": "annual"
                            })
                    elif "감사보고서" in report_nm and "분기" not in report_nm and "반기" not in report_nm:
                        # Fallback: Validation if Business Report is missing
                        if not financial_history[y]["annual_report"]:
                             financial_history[y]["annual_report"] = link_info
                    elif "1분기" in report_nm or "3월" in report_nm:
                        financial_history[y]["Q1"] = link_info
                    elif "반기" in report_nm or "6월" in report_nm:
                        financial_history[y]["Q2"] = link_info
                    elif "3분기" in report_nm or "9월" in report_nm:
                        financial_history[y]["Q3"] = link_info
        
        # Second pass: If Annual numbers missing, try to fill with latest available report numbers (e.g. for current year)
        # (This logic can be refined, but for now let's ensure links are there)
        
        results[name] = {
            "financial_history": financial_history,
            "stock_code": stock_code
        }
        
        # Save incrementally
        save_intermediate(results)
        time.sleep(0.5) 

    # TSX Output Generator
    print("\nGeneration Complete.")
    # print(json.dumps(results, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()
