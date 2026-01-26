import requests
import zipfile
import io
import xml.etree.ElementTree as ET
import os
import json
from typing import Dict, Any, List, Optional

class DartAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://opendart.fss.or.kr/api"
        # Directory to cache the corporate code list
        self.cache_dir = os.path.join(os.path.dirname(__file__), "../../data")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.corp_code_file = os.path.join(self.cache_dir, "CORPCODE.xml")
        self.corp_codes = self._load_corp_codes()

    def _load_corp_codes(self) -> Dict[str, str]:
        """Loads corporate codes from cache or downloads them from DART."""
        if not os.path.exists(self.corp_code_file):
            print("Downloading DART corporate codes...")
            url = f"{self.base_url}/corpCode.xml"
            params = {"crtfc_key": self.api_key}
            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
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
                # Store both codes: { "Samsung Electronics": {"corp_code": "...", "stock_code": "..."} }
                codes[corp_name] = {"corp_code": corp_code, "stock_code": stock_code.strip() if stock_code else None}
        except Exception as e:
            print(f"Error parsing corporate codes: {e}")
        
        return codes

    def get_corp_code(self, company_name: str) -> Optional[Dict[str, str]]:
        return self.corp_codes.get(company_name)

    def get_disclosure_list(self, corp_code: str, bgn_de: str = "20240101") -> List[Dict]:
        """Fetches the list of disclosures (reports) for a company."""
        url = f"{self.base_url}/list.json"
        params = {
            "crtfc_key": self.api_key,
            "corp_code": corp_code,
            "bgn_de": bgn_de,
            "last_reprt_at": "Y", # Only final reports
            "pblntf_ty": "A", # Regular reports (Annual, Quarterly)
            "page_count": 10
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

    def get_document_content(self, rcept_no: str) -> str:
        """
        Returns the link to the DART viewer.
        """
        return f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}"

    def get_financials(self, corp_code: str, year: str, reprt_code: str) -> Dict[str, Any]:
        """
        Fetches single account financials (Revenue, Operating Profit, R&D Cost).
        API: /fnlttSinglAcntAll.json
        """
        url = f"{self.base_url}/fnlttSinglAcntAll.json"
        params = {
            "crtfc_key": self.api_key,
            "corp_code": corp_code,
            "bsns_year": year,
            "reprt_code": reprt_code,
            "fs_div": "CFS" # Consolidated Financial Statements (연결재무제표)
        }
        
        financials = {"revenue": "-", "profit": "-", "rd_cost": "-"}
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if data['status'] == '000':
                # Parse the list for Revenue, Profit, and R&D Cost
                # Account Names (standardized somewhat, but need regex or keyword match)
                # 매출액: "매출액" or "Revenue" (account_nm)
                # 영업이익: "영업이익" or "Operating Income"
                # 연구개발비: "연구개발비" or "연구개발비용"
                
                for item in data.get('list', []):
                    acct_nm = item.get('account_nm', '').strip()
                    amount = item.get('thstrm_amount', '0').strip()
                    
                    # Formatting amount (comes as string with commas maybe? or plain number)
                    # DART usually sends plain numbers string.
                    
                    if acct_nm in ["매출액", "수익(매출액)"]:
                        financials['revenue'] = amount
                    elif acct_nm in ["영업이익", "영업이익(손실)"]:
                        financials['profit'] = amount
                    elif acct_nm in ["연구개발비", "연구개발비용", "연구개발비용계"]:
                        financials['rd_cost'] = amount
            else:
                 # Try Separate Financial Statements if Consolidated not available
                 if params['fs_div'] == 'CFS':
                     params['fs_div'] = 'OFS' # Separate
                     return self.get_financials(corp_code, year, reprt_code) # Recurse once
                 
                 # print(f"DART Financials Error: {data.get('message')}")

        except Exception as e:
            print(f"Financials Request Error: {e}")
            
        return financials

    def parse_report_code(self, report_title: str) -> Dict[str, str]:
        """
        Parses report title to extract year and report code.
        Example: "분기보고서 (2024.03)" -> year=2024, code=11013
        """
        import re
        # Look for pattern like (YYYY.MM)
        match = re.search(r'\((\d{4})\.(\d{2})\)', report_title)
        if not match:
            return None
        
        year = match.group(1)
        month = match.group(2)
        
        # Determine report code based on month (Quarter end)
        # 03 -> 1Q (11013), 06 -> Half (11012), 09 -> 3Q (11014), 12 -> Annual (11011)
        code_map = {
            "03": "11013",
            "06": "11012",
            "09": "11014",
            "12": "11011"
        }
        
        reprt_code = code_map.get(month)
        if not reprt_code:
            return None
            
        return {"year": year, "code": reprt_code}

class NaverAPI:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://openapi.naver.com/v1/search/news.json"
    
    def search_news(self, query: str, display: int = 10) -> Dict[str, Any]:
        headers = {
            "X-Naver-Client-Id": self.client_id,
            "X-Naver-Client-Secret": self.client_secret
        }
        params = {
            "query": query,
            "display": display,
            "sort": "sim" # Sort by relevance
        }
        try:
            response = requests.get(self.base_url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Naver Search Error: {e}")
            return {"items": []}

class PubMedAPI:
    def search_papers(self, query: str):
        # TODO: Implement PubMed search using Biopython or Requests
        return []

class RissAPI:
    def search_papers(self, query: str):
        return []

class ScienceOnAPI:
    def search_papers(self, query: str):
        return []
