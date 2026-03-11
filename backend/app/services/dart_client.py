import re
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
        # In Docker container, /tmp is fine, or we can use a volume
        self.cache_dir = "/tmp/dart_cache"
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
            "last_reprt_at": "Y",
            "pblntf_ty": "A",
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
        return f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}"

    def _parse_financial_items(self, items: list) -> Dict[str, str]:
        """Extract revenue, profit, rd_cost from DART financial items."""
        result = {}
        for item in items:
            acct_nm = item.get('account_nm', '').strip()
            amount = item.get('thstrm_amount', '0').strip()
            if acct_nm in ["매출액", "수익(매출액)"]:
                result['revenue'] = amount
            elif acct_nm in ["영업이익", "영업이익(손실)"]:
                result['profit'] = amount
            elif acct_nm in ["연구개발비", "연구개발비용", "연구개발비용계"]:
                result['rd_cost'] = amount
        return result

    def get_financials(self, corp_code: str, year: str, reprt_code: str) -> Dict[str, Any]:
        """Fetches single account financials. Tries CFS first, falls back to OFS."""
        url = f"{self.base_url}/fnlttSinglAcntAll.json"
        financials = {"revenue": "-", "profit": "-", "rd_cost": "-"}

        for fs_div in ["CFS", "OFS"]:
            try:
                params = {
                    "crtfc_key": self.api_key,
                    "corp_code": corp_code,
                    "bsns_year": year,
                    "reprt_code": reprt_code,
                    "fs_div": fs_div
                }
                response = requests.get(url, params=params)
                data = response.json()
                if data['status'] == '000':
                    financials.update(self._parse_financial_items(data.get('list', [])))
                    break  # Success - no need to try OFS
            except Exception as e:
                print(f"Financials Request Error ({fs_div}): {e}")

        return financials

    def parse_report_code(self, report_title: str) -> Dict[str, str]:
        """Parses report title to extract year and report code."""
        match = re.search(r'\((\d{4})\.(\d{2})\)', report_title)
        if not match:
            return None
        
        year = match.group(1)
        month = match.group(2)
        
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
