# -*- coding: utf-8 -*-
import os
import sys
from dotenv import load_dotenv

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from api.clients import DartAPI

load_dotenv()

# Test Caregen (케어젠)
dart = DartAPI(os.getenv("DART_API_KEY"))

# Get corp_code for 케어젠
corp_info = dart.get_corp_code("케어젠")
if corp_info:
    corp_code = corp_info.get('corp_code') if isinstance(corp_info, dict) else corp_info
    print(f"케어젠 Corp Code: {corp_code}")
    
    # Get reports
    reports = dart.get_disclosure_list(corp_code, bgn_de="20250101")
    
    print("\n=== Recent Reports ===")
    for i, report in enumerate(reports[:5]):
        print(f"{i+1}. {report.get('report_nm')} - {report.get('rcept_dt')}")
        
        # Parse report code
        meta = dart.parse_report_code(report.get('report_nm', ''))
        if meta:
            print(f"   Year: {meta['year']}, Code: {meta['code']}")
            
            # Try to fetch financials
            print(f"\n   Fetching financials for {meta['year']}, {meta['code']}...")
            financials_data = dart.get_financials(corp_code, meta['year'], meta['code'])
            print(f"   Result: {financials_data}")
            
            # Also fetch raw data to see account names
            import requests
            url = f"{dart.base_url}/fnlttSinglAcntAll.json"
            params = {
                "crtfc_key": dart.api_key,
                "corp_code": corp_code,
                "bsns_year": meta['year'],
                "reprt_code": meta['code'],
                "fs_div": "CFS"
            }
            response = requests.get(url, params=params)
            data = response.json()
            
            if data['status'] == '000':
                print(f"\n   Available Account Names:")
                for item in data.get('list', [])[:20]:  # Show first 20 accounts
                    acct_nm = item.get('account_nm', '').strip()
                    amount = item.get('thstrm_amount', '0').strip()
                    print(f"     - {acct_nm}: {amount}")
            else:
                print(f"   Error: {data.get('message')}")
        print("\n" + "="*60 + "\n")
else:
    print("케어젠 corp_code not found")
