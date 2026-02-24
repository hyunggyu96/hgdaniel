"""
Fetch botulinum toxin drug data from nedrug.mfds.go.kr and upsert to Supabase.
Source: 식약처 의약품등 정보검색 (nedrug.mfds.go.kr)
"""
import requests
import re
import json
import time
import psycopg2
from psycopg2.extras import execute_values

DB_CONN = "postgresql://postgres.jwkdxygcpfdmavxcbcfe:AISapience111$@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

# Company name mapping to company_id in companies table
COMPANY_MAP = {
    "대웅제약": 11,
    "메디톡스": 10,
    "휴온스바이오파마": 6,   # maps to 휴온스 group
    "파마리서치바이오": 12,  # maps to 파마리서치
    "휴젤주식회사": 9,       # 휴젤
    "제테마": 3,
    "휴메딕스": 8,
    "한국비엔씨": 4,
    "종근당바이오": 5,
    "한스바이오메드": 1,
    "한국애브비": 34,        # 앨러간 (AbbVie = Allergan Aesthetics)
    "멀츠아시아퍼시픽피티이엘티디": 33,  # 멀츠
    "입센코리아": None,      # global (Ipsen)
    "뉴메코": None,
    "메디카코리아": None,
    "에이티지씨": None,
    "이니바이오": None,
    "종근당": None,          # 종근당 ≠ 종근당바이오
    "프로톡스": None,
    "한국비엠아이": None,
    "대웅바이오": None,
    "제네톡스": None,
}


def clean_text(s):
    """Clean HTML and whitespace from text."""
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('\r\n', ' ').replace('\n', ' ').replace('\t', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def extract_field(text, prefix):
    """Extract value after a known prefix label."""
    if prefix in text:
        return text.replace(prefix, '').strip()
    return text.strip()


def parse_item_name(raw):
    """Parse product name, extract export names if present."""
    name = clean_text(raw)
    name = extract_field(name, '제품명')

    export_names = []
    # Extract [수출명:...] or (수출명:...)
    export_match = re.search(r'[\[（(]수출명[：:](.+?)[\]）)]', name)
    if export_match:
        export_str = export_match.group(1)
        # Split by comma or 、
        export_names = [n.strip() for n in re.split(r'[,，、]', export_str) if n.strip()]
        # Clean export name: remove dosage info in parentheses
        export_names = [re.sub(r'\([^)]*\)', '', n).strip() for n in export_names]

    # Check for (수출용)
    is_export_only = '수출용' in name and '수출명' not in name

    return name, export_names, is_export_only


def scrape_page(page_no):
    """Scrape one page of results from nedrug.mfds.go.kr."""
    url = 'https://nedrug.mfds.go.kr/searchDrug'
    params = {
        'sort': '',
        'sortOrder': 'false',
        'searchYn': 'true',
        'page': page_no,
        'searchDivision': 'detail',
        'ingrEngName': 'botulinum',
    }
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    r = requests.get(url, params=params, headers=headers, timeout=30)
    text = r.content.decode('utf-8')

    # Find total count
    total = 0
    m = re.search(r'총\s*(\d+)\s*건', text)
    if m:
        total = int(m.group(1))

    # Find tbody
    tbody_start = text.find('<tbody')
    tbody_end = text.find('</tbody>', tbody_start) if tbody_start > 0 else -1
    if tbody_start < 0 or tbody_end < 0:
        return [], total

    tbody = text[tbody_start:tbody_end]
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tbody, re.DOTALL)

    items = []
    for row in rows:
        tds = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(tds) < 12:
            continue

        seq_text = clean_text(tds[0])
        if not seq_text.isdigit():
            continue

        item_name_raw, export_names, is_export_only = parse_item_name(tds[1])
        item_eng_name = extract_field(clean_text(tds[2]), '제품영문명')
        company_name = extract_field(clean_text(tds[3]), '업체명')
        company_eng_name = extract_field(clean_text(tds[4]), '업체명(영문)').replace('업체(영문)', '')
        std_code = extract_field(clean_text(tds[5]), '품목기준코드')
        permit_no = extract_field(clean_text(tds[6]), '허가번호')
        permit_date = extract_field(clean_text(tds[7]), '허가일')
        category = extract_field(clean_text(tds[8]), '품목구분')
        cancel_status = extract_field(clean_text(tds[9]), '취소/취하구분')
        cancel_date = extract_field(clean_text(tds[10]), '취소/취하일자') or None
        ingredient = extract_field(clean_text(tds[11]), '주성분')

        # Remove (주), (유) prefixes from company name for mapping
        company_clean = re.sub(r'^\(주\)|^\(유\)', '', company_name).strip()

        items.append({
            'item_name': item_name_raw,
            'item_eng_name': item_eng_name,
            'company_name': company_name,
            'company_name_clean': company_clean,
            'company_eng_name': company_eng_name,
            'std_code': std_code,
            'permit_no': permit_no,
            'permit_date': permit_date,
            'category': category,
            'status': 'active' if cancel_status == '정상' else 'cancelled',
            'cancel_status': cancel_status,
            'cancel_date': cancel_date,
            'ingredient': ingredient,
            'export_names': export_names,
            'is_export_only': is_export_only,
        })

    return items, total


def scrape_all():
    """Scrape all pages of botulinum toxin data."""
    all_items = []
    page = 1
    total = None

    while True:
        print(f"  Fetching page {page}...")
        items, page_total = scrape_page(page)
        if total is None:
            total = page_total
            print(f"  Total items: {total}")

        if not items:
            break

        all_items.extend(items)
        print(f"  Got {len(items)} items (total so far: {len(all_items)})")

        if len(all_items) >= total:
            break

        page += 1
        time.sleep(1)  # Be polite

    return all_items


def create_table(conn):
    """Create the nedrug_products table if not exists."""
    sql = """
    CREATE TABLE IF NOT EXISTS nedrug_products (
        id SERIAL PRIMARY KEY,
        std_code TEXT UNIQUE NOT NULL,
        item_name TEXT NOT NULL,
        item_eng_name TEXT,
        company_id INTEGER REFERENCES companies(id),
        company_name TEXT NOT NULL,
        company_eng_name TEXT,
        permit_no TEXT,
        permit_date TEXT,
        category TEXT,
        status TEXT DEFAULT 'active',
        cancel_status TEXT,
        cancel_date TEXT,
        ingredient TEXT,
        ingredient_type TEXT,
        export_names TEXT,
        is_export_only BOOLEAN DEFAULT FALSE,
        raw_json JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_nedrug_company_id ON nedrug_products(company_id);
    CREATE INDEX IF NOT EXISTS idx_nedrug_company_name ON nedrug_products(company_name);
    CREATE INDEX IF NOT EXISTS idx_nedrug_status ON nedrug_products(status);
    CREATE INDEX IF NOT EXISTS idx_nedrug_ingredient_type ON nedrug_products(ingredient_type);

    ALTER TABLE nedrug_products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read" ON nedrug_products;
    CREATE POLICY "Allow public read" ON nedrug_products FOR SELECT USING (true);

    CREATE OR REPLACE FUNCTION update_nedrug_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS set_nedrug_updated_at ON nedrug_products;
    CREATE TRIGGER set_nedrug_updated_at
        BEFORE UPDATE ON nedrug_products
        FOR EACH ROW
        EXECUTE FUNCTION update_nedrug_updated_at();
    """
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    print("Table nedrug_products created/verified.")


def upsert_items(conn, items):
    """Upsert items into nedrug_products table."""
    sql = """
    INSERT INTO nedrug_products (
        std_code, item_name, item_eng_name, company_id, company_name,
        company_eng_name, permit_no, permit_date, category, status,
        cancel_status, cancel_date, ingredient, ingredient_type,
        export_names, is_export_only, raw_json
    ) VALUES %s
    ON CONFLICT (std_code) DO UPDATE SET
        item_name = EXCLUDED.item_name,
        item_eng_name = EXCLUDED.item_eng_name,
        company_id = EXCLUDED.company_id,
        company_name = EXCLUDED.company_name,
        company_eng_name = EXCLUDED.company_eng_name,
        permit_no = EXCLUDED.permit_no,
        permit_date = EXCLUDED.permit_date,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        cancel_status = EXCLUDED.cancel_status,
        cancel_date = EXCLUDED.cancel_date,
        ingredient = EXCLUDED.ingredient,
        ingredient_type = EXCLUDED.ingredient_type,
        export_names = EXCLUDED.export_names,
        is_export_only = EXCLUDED.is_export_only,
        raw_json = EXCLUDED.raw_json
    """

    values = []
    for item in items:
        company_id = COMPANY_MAP.get(item['company_name_clean'])
        export_names_str = ', '.join(item['export_names']) if item['export_names'] else None

        values.append((
            item['std_code'],
            item['item_name'],
            item['item_eng_name'],
            company_id,
            item['company_name'],
            item['company_eng_name'],
            item['permit_no'],
            item['permit_date'],
            item['category'],
            item['status'],
            item['cancel_status'],
            item['cancel_date'],
            item['ingredient'],
            'botulinum_toxin',
            export_names_str,
            item['is_export_only'],
            json.dumps(item, ensure_ascii=False),
        ))

    with conn.cursor() as cur:
        execute_values(cur, sql, values)
    conn.commit()
    print(f"  Upserted {len(values)} records.")


def main():
    print("=" * 60)
    print("NEDRUG 보툴리늄 톡신 데이터 수집")
    print("=" * 60)

    # 1. Scrape all data
    print("\n[Phase 1] Scraping nedrug.mfds.go.kr...")
    items = scrape_all()
    print(f"\nTotal scraped: {len(items)} items")

    # Summary by company
    companies = {}
    for item in items:
        name = item['company_name']
        if name not in companies:
            companies[name] = {'active': 0, 'cancelled': 0}
        companies[name][item['status']] += 1

    print("\nCompany breakdown:")
    for name, counts in sorted(companies.items()):
        print(f"  {name}: {counts['active']} active, {counts['cancelled']} cancelled")

    # 2. Connect to Supabase and create table
    print("\n[Phase 2] Connecting to Supabase...")
    conn = psycopg2.connect(DB_CONN)
    create_table(conn)

    # 3. Upsert data
    print("\n[Phase 3] Upserting data...")
    upsert_items(conn, items)

    conn.close()
    print("\nDone!")


if __name__ == '__main__':
    main()
