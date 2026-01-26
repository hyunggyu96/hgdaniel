# -*- coding: utf-8 -*-
import os
import sys
from dotenv import load_dotenv

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from api.clients import DartAPI
import requests

load_dotenv()

# Test Caregen (케어젠)
dart = DartAPI(os.getenv("DART_API_KEY"))

corp_info = dart.get_corp_code("케어젠")
if corp_info:
    corp_code = corp_info.get('corp_code') if isinstance(corp_info, dict) else corp_info
    print(f"Corp Code: {corp_code}\n")
    
    # Check Q3 2025 report in detail
    print("="*80)
    print("Q3 2025 (11014) - Detailed Financial Data")
    print("="*80)
    
    url = f"{dart.base_url}/fnlttSinglAcntAll.json"
    params = {
        "crtfc_key": dart.api_key,
        "corp_code": corp_code,
        "bsns_year": "2025",
        "reprt_code": "11014",  # Q3
        "fs_div": "CFS"
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == '000':
        # Look for revenue entries
        print("\nAll Revenue-related entries:")
        for item in data.get('list', []):
            acct_nm = item.get('account_nm', '').strip()
            if '매출' in acct_nm or '수익' in acct_nm:
                print(f"\nAccount: {acct_nm}")
                print(f"  Current Period (thstrm_amount): {item.get('thstrm_amount', 'N/A')}")
                print(f"  Previous Period (frmtrm_amount): {item.get('frmtrm_amount', 'N/A')}")
                print(f"  Account ID: {item.get('account_id', 'N/A')}")
                print(f"  FS Name: {item.get('sj_nm', 'N/A')}")
    
    print("\n" + "="*80)
    print("Annual 2024 (11011) - Detailed Financial Data")
    print("="*80)
    
    params['bsns_year'] = "2024"
    params['reprt_code'] = "11011"  # Annual
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == '000':
        print("\nAll Revenue-related entries:")
        for item in data.get('list', []):
            acct_nm = item.get('account_nm', '').strip()
            if '매출' in acct_nm or '수익' in acct_nm:
                print(f"\nAccount: {acct_nm}")
                print(f"  Current Period (thstrm_amount): {item.get('thstrm_amount', 'N/A')}")
                print(f"  Previous Period (frmtrm_amount): {item.get('frmtrm_amount', 'N/A')}")
                print(f"  Account ID: {item.get('account_id', 'N/A')}")
                print(f"  FS Name: {item.get('sj_nm', 'N/A')}")
