"""
MFDS (식약처) 의료기기 품목 데이터 수집 스크립트
- 품목허가 API: 회사별 허가 목록 (허가번호, 날짜, 품목명, 취소여부)
- 품목정보 API: 품목별 상세 정보 (브랜드명, 모델, OEM 정보)
- 두 API를 허가번호로 매칭하여 Supabase에 통합 저장
"""

import os
import re
import sys
import time
import json
import requests
import urllib3
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Suppress SSL warnings (data.go.kr uses self-signed certs sometimes)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Encoding fix for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'web', '.env.local'))

# Configuration
DATA_GO_KR_API_KEY = os.getenv("DATA_GO_KR_API_KEY", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# API URLs
PERMIT_API_URL = "https://apis.data.go.kr/1471000/MdlpPrdlstPrmisnInfoService05/getMdlpPrdlstPrmisnList04"
PRODUCT_API_URL = "https://apis.data.go.kr/1471000/MdeqPrdlstInfoService02/getMdeqPrdlstInfoInq02"

# Rate limiting
REQUEST_INTERVAL = 0.3  # seconds between API calls

# Companies to process (extend this list for more companies)
COMPANIES = [
    {"name_ko": "제테마", "company_id": 3},
]


def normalize_permit_number(raw: str) -> str:
    """Normalize permit numbers by removing all whitespace.
    '제허 17-203 호' -> '제허17-203호'
    """
    if not raw:
        return ""
    return re.sub(r'\s+', '', raw).strip()


def parse_model_count(type_info: str) -> int:
    """Extract model count from TYPE_INFO field.
    'e.p.t.q. S 0.8mL외 62건' -> 63
    'ZYDERM I 0.5cc' -> 1
    """
    if not type_info:
        return 0
    match = re.search(r'외\s*(\d+)\s*건', type_info)
    if match:
        return int(match.group(1)) + 1
    return 1


def init_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL or Key is missing. Check .env files.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_paginated(base_url: str, params: dict, label: str = "") -> list:
    """Fetch all pages from a data.go.kr API endpoint."""
    all_items = []
    page = 1

    while True:
        params["pageNo"] = str(page)
        try:
            time.sleep(REQUEST_INTERVAL)
            resp = requests.get(base_url, params=params, verify=False, timeout=15)
            if resp.status_code != 200:
                print(f"  Error {resp.status_code}: {resp.text[:200]}")
                break

            data = resp.json()
            if data.get('header', {}).get('resultCode') != '00':
                print(f"  API Error: {data.get('header')}")
                break

            items = data.get('body', {}).get('items', [])
            if not items:
                break

            # Handle both list-of-dicts and nested item structures
            for entry in items:
                if isinstance(entry, dict) and 'item' in entry:
                    all_items.append(entry['item'])
                else:
                    all_items.append(entry)

            count = len(items)
            num_of_rows = int(params.get("numOfRows", "100"))
            print(f"  {label} page {page}: {count} items (total: {len(all_items)})")

            if count < num_of_rows:
                break
            page += 1

        except Exception as e:
            print(f"  Exception on page {page}: {e}")
            break

    return all_items


def fetch_permits(company_name: str) -> list:
    """Fetch all permits for a company from 품목허가 API."""
    print(f"[Phase 1] Fetching permits for '{company_name}'...")
    params = {
        "serviceKey": DATA_GO_KR_API_KEY,
        "numOfRows": "100",
        "type": "json",
        "entrps": company_name,
    }
    return fetch_paginated(PERMIT_API_URL, params, label="Permits")


def fetch_product_info(product_category: str) -> list:
    """Fetch product info for a category from 품목정보 API."""
    print(f"[Phase 2] Fetching product info for '{product_category}'...")
    all_items = []
    page = 1
    num_of_rows = 500  # Max allowed by this API

    while True:
        params = {
            "serviceKey": DATA_GO_KR_API_KEY,
            "pageNo": str(page),
            "numOfRows": str(num_of_rows),
            "type": "json",
            "PRDLST_NM": product_category,
        }
        try:
            time.sleep(REQUEST_INTERVAL)
            resp = requests.get(PRODUCT_API_URL, params=params, verify=False, timeout=15)
            if resp.status_code != 200:
                print(f"  Error {resp.status_code}")
                break

            data = resp.json()
            if data.get('header', {}).get('resultCode') != '00':
                print(f"  API Error: {data.get('header')}")
                break

            items = data.get('body', {}).get('items', [])
            if not items:
                break

            for entry in items:
                if isinstance(entry, dict) and 'item' in entry:
                    all_items.append(entry['item'])
                else:
                    all_items.append(entry)

            count = len(items)
            print(f"  Products page {page}: {count} items (total: {len(all_items)})")

            if count < num_of_rows:
                break
            page += 1

        except Exception as e:
            print(f"  Exception on page {page}: {e}")
            break

    return all_items


def build_product_map(product_items: list) -> dict:
    """Build a mapping from normalized permit number to product info."""
    product_map = {}
    for item in product_items:
        key = normalize_permit_number(item.get('MEDDEV_ITEM_NO', '') or '')
        if key:
            product_map[key] = {
                'brand_names': item.get('PRDT_NM_INFO') or '',
                'model_info': item.get('TYPE_INFO') or '',
                'oem_client': item.get('MNFT_CLNT_NM') or '',
                'manufacturer': item.get('MNSC_NM') or '',
                'manufacturer_country': item.get('MNSC_NATN_CD') or '',
                'device_grade': item.get('CLSF_NO_GRAD_CD') or '',
                'classification_no': item.get('MDEQ_CLSF_NO') or '',
                'industry_type': item.get('INDT_NM') or '',
                'use_purpose': item.get('USE_PURPS_CONT') or '',
                'raw_product_json': item,
            }
    return product_map


def process_company(supabase: Client, company_name: str, company_id: int):
    """Full pipeline for a single company."""
    print(f"\n{'='*60}")
    print(f"Processing: {company_name} (company_id={company_id})")
    print(f"{'='*60}")

    # Phase 1: Get permits
    permits = fetch_permits(company_name)
    print(f"  Total permits: {len(permits)}")

    if not permits:
        print("  No permits found. Skipping.")
        return

    # Identify unique product categories for Phase 2
    categories = set()
    for p in permits:
        cat = p.get('PRDUCT', '') or p.get('PRDLST_NM', '')
        if cat:
            categories.add(cat)
    print(f"  Product categories: {categories}")

    # Phase 2: Fetch product info for each category
    product_map = {}
    for cat in categories:
        items = fetch_product_info(cat)
        cat_map = build_product_map(items)
        product_map.update(cat_map)
        print(f"  Product map for '{cat}': {len(cat_map)} entries")

    # Phase 3: Merge and upsert
    print(f"\n[Phase 3] Merging and upserting to Supabase...")
    active_count = 0
    cancelled_count = 0
    upserted = 0

    for permit in permits:
        permit_raw = permit.get('PRDUCT_PRMISN_NO', '') or permit.get('MEDDEV_ITEM_NO', '')
        permit_number = normalize_permit_number(permit_raw)

        if not permit_number:
            continue

        # Determine status
        cancel_code = permit.get('RTRCN_DSCTN_DIVS_CD', '')
        cancel_date = permit.get('RTRCN_DSCTN_DT', '')
        status = 'cancelled' if cancel_code == '2' or cancel_date else 'active'

        if status == 'active':
            active_count += 1
        else:
            cancelled_count += 1

        # Get matching product info
        product_info = product_map.get(permit_number, {})

        model_info = product_info.get('model_info', '')
        model_count = parse_model_count(model_info)

        record = {
            "permit_number": permit_number,
            "permit_number_raw": permit_raw,
            "company_id": company_id,
            "company_name": company_name,
            "product_category": permit.get('PRDUCT', '') or permit.get('PRDLST_NM', ''),
            "permit_date": permit.get('PRMISN_DT', ''),
            "status": status,
            "cancel_date": cancel_date or None,
            "brand_names": product_info.get('brand_names') or None,
            "model_info": model_info or None,
            "model_count": model_count if model_count > 0 else None,
            "oem_client": product_info.get('oem_client') or None,
            "manufacturer": product_info.get('manufacturer') or None,
            "manufacturer_country": product_info.get('manufacturer_country') or None,
            "device_grade": product_info.get('device_grade') or permit.get('GRADE', '') or None,
            "classification_no": product_info.get('classification_no') or None,
            "industry_type": product_info.get('industry_type') or None,
            "use_purpose": product_info.get('use_purpose') or None,
            "raw_permit_json": permit,
            "raw_product_json": product_info.get('raw_product_json'),
        }

        try:
            supabase.table('mfds_products').upsert(
                record, on_conflict='permit_number'
            ).execute()
            upserted += 1
        except Exception as e:
            print(f"  Error upserting {permit_number}: {e}")

    print(f"\n  Results for {company_name}:")
    print(f"    Active: {active_count}, Cancelled: {cancelled_count}")
    print(f"    Upserted: {upserted} records to Supabase")

    # Show key products with brand names
    print(f"\n  Key products with brand names:")
    for permit in permits:
        permit_raw = permit.get('PRDUCT_PRMISN_NO', '') or permit.get('MEDDEV_ITEM_NO', '')
        pn = normalize_permit_number(permit_raw)
        info = product_map.get(pn, {})
        brand = info.get('brand_names', '')
        if brand:
            print(f"    {permit_raw}: {brand[:120]}...")


def main():
    print(f"=== MFDS Product Data Fetch ===")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"API Key: {'SET' if DATA_GO_KR_API_KEY else 'NOT SET'}")
    print(f"Companies: {[c['name_ko'] for c in COMPANIES]}")

    if not DATA_GO_KR_API_KEY:
        print("ERROR: DATA_GO_KR_API_KEY not set. Check .env.local")
        return

    try:
        supabase = init_supabase()
        print("Supabase connected.")
    except Exception as e:
        print(f"Supabase Init Failed: {e}")
        return

    for company in COMPANIES:
        process_company(supabase, company['name_ko'], company['company_id'])

    print(f"\n=== Job Complete ===")


if __name__ == "__main__":
    main()
